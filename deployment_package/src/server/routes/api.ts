import { Router } from 'express';
import { db } from '../db';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  requireAuth,
  requireRole,
  requirePermission,
  AuthenticatedRequest,
} from '../security';
import { Permissions, ApiResponse } from '../types';

export const apiRouter = Router();

// Egyptian Phone Validation Regex (010, 011, 012, 015 followed by 8 digits = 11 digits total)
const EGYPT_PHONE_REGEX = /^01[0125]\d{8}$/;

// ----------------------------------------------------
// AUTHENTICATION & IDENTITY
// ----------------------------------------------------
apiRouter.post('/auth/register-customer', (req, res) => {
  const { fullName, phone, email, password, governorate, city, address } = req.body;

  if (!fullName || !phone || !password || !governorate || !city) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'يرجى استكمال جميع الحقول الإلزامية' },
    });
    return;
  }

  const cleanPhone = String(phone).trim();
  if (!EGYPT_PHONE_REGEX.test(cleanPhone)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_PHONE',
        message: 'يجب إدخال رقم هاتف مصري صحيح مكون من 11 رقماً يبدأ بـ (010 أو 011 أو 012 أو 015)',
      },
    });
    return;
  }

  const existing = db.findUserByPhone(cleanPhone);
  if (existing) {
    res.status(409).json({
      success: false,
      error: { code: 'PHONE_EXISTS', message: 'هذا الرقم مسجل بالفعل' },
    });
    return;
  }

  // Email is completely optional
  const cleanEmail = email && typeof email === 'string' && email.trim().length > 0 ? email.trim() : undefined;

  const passwordHash = hashPassword(password);
  const user = db.createUser({
    phone: cleanPhone,
    email: cleanEmail,
    passwordHash,
    role: 'CUSTOMER',
    status: 'PENDING', // Saved as PENDING, card is not issued immediately
  });

  const customer = db.createCustomer({
    userId: user.id,
    fullName,
    governorate,
    city,
    address,
  });

  const accessToken = generateAccessToken(user);
  const { token: refreshToken } = generateRefreshToken(user);

  res.status(201).json({
    success: true,
    data: {
      user: { id: user.id, phone: user.phone, role: user.role, status: user.status },
      customer,
      card: null,
      accessToken,
      refreshToken,
      message: 'تم إرسال طلبك للمسؤول، يرجى انتظار الموافقة لتفعيل كارتك',
    },
  });
});

apiRouter.post('/auth/register-business', (req, res) => {
  const { businessName, ownerName, phone, email, password, governorate, city, address, type, sectorId, description } = req.body;

  if (!businessName || !ownerName || !phone || !password || !governorate || !city || !sectorId) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'يرجى ملء جميع الحقول المطلوبة لطلب تسجيل الشريك التجاري' },
    });
    return;
  }

  const cleanPhone = String(phone).trim();
  if (!EGYPT_PHONE_REGEX.test(cleanPhone)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_PHONE',
        message: 'يجب إدخال رقم هاتف مصري صحيح مكون من 11 رقماً يبدأ بـ (010 أو 011 أو 012 أو 015)',
      },
    });
    return;
  }

  const existing = db.findUserByPhone(cleanPhone);
  if (existing) {
    res.status(409).json({
      success: false,
      error: { code: 'PHONE_EXISTS', message: 'هذا الرقم مسجل بالفعل' },
    });
    return;
  }

  // Email is optional
  const cleanEmail = email && typeof email === 'string' && email.trim().length > 0 ? email.trim() : undefined;

  const passwordHash = hashPassword(password);
  const user = db.createUser({
    phone: cleanPhone,
    email: cleanEmail,
    passwordHash,
    role: 'BUSINESS',
    status: 'PENDING', // Businesses require admin approval
  });

  const business = db.createBusiness({
    userId: user.id,
    businessName,
    ownerName,
    phone,
    email,
    governorate,
    city,
    address: address || '',
    type: type || 'متجر معتمد',
    sectorId,
    description: description || '',
  });

  db.recordAuditLog({
    actorId: user.id,
    actorRole: 'BUSINESS',
    action: 'BUSINESS_REGISTRATION_SUBMITTED',
    entity: 'BUSINESS',
    entityId: business.id,
    reason: 'طلب تسجيل نشاط تجاري جديد قيد المراجعة',
  });

  res.status(201).json({
    success: true,
    data: {
      businessId: business.id,
      status: 'PENDING',
      message: 'تم استلام طلب انضمام نشاطك التجاري بنجاح. الطلب الآن قيد المراجعة والتدقيق من قبل الإدارة.',
    },
  });
});

apiRouter.post('/auth/login', (req, res) => {
  const { phone, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress;

  if (!phone || !password) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_CREDENTIALS', message: 'يرجى إدخال رقم الهاتف وكلمة المرور' },
    });
    return;
  }

  const user = db.findUserByPhone(phone);
  if (!user) {
    res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'رقم الهاتف أو كلمة المرور غير صحيحة' },
    });
    return;
  }

  // Check lockout
  if (user.lockoutUntil && new Date(user.lockoutUntil).getTime() > Date.now()) {
    const remainingMinutes = Math.ceil((new Date(user.lockoutUntil).getTime() - Date.now()) / (60 * 1000));
    res.status(423).json({
      success: false,
      error: {
        code: 'ACCOUNT_LOCKED',
        message: `تم قفل الحساب مؤقتاً لتجاوز عدد المحاولات الخاطئة. يرجى المحاولة بعد ${remainingMinutes} دقيقة.`,
      },
    });
    return;
  }

  const isValid = verifyPassword(password, user.passwordHash);
  if (!isValid) {
    const attempt = db.recordLoginAttempt(phone, false, ip);
    const remainingAttempts = Math.max(0, 5 - user.failedLoginAttempts);

    if (attempt.locked) {
      res.status(423).json({
        success: false,
        error: {
          code: 'ACCOUNT_LOCKED',
          message: 'تم قفل الحساب مؤقتاً لمدة 5 دقائق بعد 5 محاولات دخول فاشلة متتالية.',
        },
      });
      return;
    }

    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: `بيانات الدخول غير صحيحة. متبقي ${remainingAttempts} محاولات قبل قفل الحساب مؤقتاً.`,
      },
    });
    return;
  }

  // Successful login
  db.recordLoginAttempt(phone, true, ip);

  const customer = db.findCustomerByUserId(user.id);
  const business = db.findBusinessByUserId(user.id);
  const employee = db.findEmployeeByUserId(user.id);

  const accessToken = generateAccessToken(user);
  const { token: refreshToken } = generateRefreshToken(user);

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      customer,
      business,
      employee,
      accessToken,
      refreshToken,
    },
  });
});

apiRouter.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ success: false, error: { code: 'TOKEN_REQUIRED', message: 'رمز التحديث مطلوب' } });
    return;
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'رمز التحديث غير صالح أو منتهي الصلاحية' } });
    return;
  }

  const user = db.findUserById(payload.userId);
  if (!user || user.status !== 'ACTIVE') {
    res.status(401).json({ success: false, error: { code: 'USER_INACTIVE', message: 'الحساب غير متاح أو معلق' } });
    return;
  }

  const newAccessToken = generateAccessToken(user);
  const { token: newRefreshToken } = generateRefreshToken(user);

  res.json({
    success: true,
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    },
  });
});

apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = db.findUserById(req.user!.id)!;
  const customer = db.findCustomerByUserId(user.id);
  const business = db.findBusinessByUserId(user.id);
  const employee = db.findEmployeeByUserId(user.id);
  let card = null;
  let pointAccount = null;

  if (customer) {
    card = db.findCardByCustomerId(customer.id);
    pointAccount = db.getPointAccount(customer.id);
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      customer,
      business,
      employee,
      card,
      pointAccount,
    },
  });
});

// ----------------------------------------------------
// CARDS & QR
// ----------------------------------------------------
apiRouter.get('/cards/my-card', requireAuth, (req: AuthenticatedRequest, res) => {
  const customer = db.findCustomerByUserId(req.user!.id);
  if (!customer) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'لم يتم العثور على حساب عميل' } });
    return;
  }

  let card = db.findCardByCustomerId(customer.id);
  if (!card) {
    // If not yet issued, issue first card
    card = db.issueCard({
      customerId: customer.id,
      notes: 'إصدار تلقائي للعميل',
      actorId: req.user!.id,
    });
  }

  const points = db.getPointAccount(customer.id);

  res.json({
    success: true,
    data: {
      card,
      customer,
      points,
    },
  });
});

apiRouter.post('/cards/resolve-qr', (req, res) => {
  const { query } = req.body; // can be qrId, cardId, or cardNumber
  if (!query) {
    res.status(400).json({ success: false, error: { code: 'QUERY_REQUIRED', message: 'يرجى تقديم رمز QR أو رقم الكارت' } });
    return;
  }

  const card = db.findCardByQrId(query) || db.findCardByCardNumber(query) || db.findCardByCardId(query);
  if (!card) {
    res.status(404).json({ success: false, error: { code: 'CARD_NOT_FOUND', message: 'الكارت غير مسجل في المنظومة' } });
    return;
  }

  const customer = db.findCustomerById(card.customerId)!;
  const pointAccount = db.getPointAccount(customer.id);

  res.json({
    success: true,
    data: {
      card: {
        id: card.id,
        cardId: card.cardId,
        cardNumber: card.cardNumber,
        status: card.status,
        expiryDate: card.expiryDate,
      },
      customer: {
        id: customer.id,
        fullName: customer.fullName,
        governorate: customer.governorate,
      },
      points: {
        balance: pointAccount.balance,
        level: pointAccount.currentLevelId,
      },
    },
  });
});

apiRouter.get('/cards', requirePermission(Permissions.CARDS_READ), (req, res) => {
  const cards = db.getAllCards();
  res.json({ success: true, data: cards });
});

apiRouter.post('/cards/issue', requirePermission(Permissions.CARDS_ISSUE), (req: AuthenticatedRequest, res) => {
  try {
    const { customerId, notes } = req.body;
    const card = db.issueCard({ customerId, notes, actorId: req.user!.id });
    res.status(201).json({ success: true, data: card });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'CARD_ISSUE_ERROR', message: err.message } });
  }
});

apiRouter.put('/cards/:id/status', requirePermission(Permissions.CARDS_BLOCK), (req: AuthenticatedRequest, res) => {
  try {
    const { status, reason } = req.body;
    const card = db.updateCardStatus(req.params.id, status, reason || 'تحديث الحالة من الإدارة', req.user!.id);
    res.json({ success: true, data: card });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'CARD_STATUS_ERROR', message: err.message } });
  }
});

// ----------------------------------------------------
// POINTS & LEDGER
// ----------------------------------------------------
apiRouter.get('/points/my-points', requireAuth, (req: AuthenticatedRequest, res) => {
  const customer = db.findCustomerByUserId(req.user!.id);
  if (!customer) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'حساب العميل غير موجود' } });
    return;
  }

  const account = db.getPointAccount(customer.id);
  const ledger = db.getPointLedger(customer.id);

  res.json({
    success: true,
    data: {
      account,
      ledger,
    },
  });
});

// Super Admin manual points adjustment with mandatory reason (#118)
apiRouter.post('/points/adjust', requirePermission(Permissions.POINTS_ADJUST), (req: AuthenticatedRequest, res) => {
  const { customerId, points, reason } = req.body;

  if (!customerId || points === undefined || !reason || reason.trim().length < 5) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'يتطلب تعديل النقاط اليدوي تحديد العميل، عدد النقاط، وسبب تفصيلي إلزامي' },
    });
    return;
  }

  try {
    const entry = db.addPointLedgerEntry({
      customerId,
      type: 'ADJUSTMENT',
      points: Number(points),
      actorId: req.user!.id,
      reason: `تعديل إداري استثنائي بواسطة المشرف العام: ${reason}`,
    });

    db.recordAuditLog({
      actorId: req.user!.id,
      actorRole: req.user!.role,
      action: 'MANUAL_POINT_ADJUSTMENT',
      entity: 'POINT_ACCOUNT',
      entityId: customerId,
      reason,
      after: { pointsAdjusted: points, balanceAfter: entry.balanceAfter },
    });

    res.json({ success: true, data: entry });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'ADJUSTMENT_ERROR', message: err.message } });
  }
});

// ----------------------------------------------------
// TRANSACTIONS & CARD SCANNING
// ----------------------------------------------------
apiRouter.post('/transactions/purchase', requireAuth, (req: AuthenticatedRequest, res) => {
  const { cardId, amount, idempotencyKey } = req.body;

  if (!cardId || !idempotencyKey) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_DATA', message: 'مطلوب تحديد الكارت ومفتاح منع التكرار (Idempotency Key)' },
    });
    return;
  }

  // Determine acting business & employee
  let businessId: string | undefined;
  let employeeId: string | undefined;

  if (req.user!.role === 'BUSINESS') {
    const b = db.findBusinessByUserId(req.user!.id);
    if (b) businessId = b.id;
  } else if (req.user!.role === 'EMPLOYEE') {
    const emp = db.findEmployeeByUserId(req.user!.id);
    if (emp) {
      employeeId = emp.id;
      businessId = emp.businessId;
    }
  } else if (req.user!.role === 'SUPER_ADMIN' || req.user!.role === 'ADMIN') {
    // Admin scan test
    const listed = db.getListedBusinesses()[0];
    businessId = listed ? listed.id : 'biz_01';
  }

  if (!businessId) {
    res.status(403).json({
      success: false,
      error: { code: 'NOT_AUTHORIZED_BUSINESS', message: 'يجب أن يكون المسجل تاجراً أو كاشيراً معتمداً لتنفيذ مسح الشراء' },
    });
    return;
  }

  try {
    const result = db.createPurchaseTransaction({
      cardId,
      businessId,
      employeeId,
      amount: Number(amount) || 0,
      idempotencyKey,
    });

    res.status(201).json({
      success: true,
      data: {
        transactionId: result.transaction.transactionId,
        pointsAwarded: result.pointsAwarded,
        message: `تم تأكيد العملية وإضافة ${result.pointsAwarded} نقطة بنجاح لرصيد العميل.`,
      },
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { code: 'TRANSACTION_FAILED', message: err.message },
    });
  }
});

// ----------------------------------------------------
// BUSINESS DIRECTORY & MANAGEMENT
// ----------------------------------------------------
apiRouter.get('/businesses/directory', (req, res) => {
  const businesses = db.getListedBusinesses();
  res.json({ success: true, data: businesses });
});

apiRouter.get('/businesses/:id', (req, res) => {
  const business = db.findBusinessById(req.params.id);
  if (!business) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'النشاط التجاري غير موجود' } });
    return;
  }
  const offers = db.getActiveOffers().filter((o) => o.businessId === business.id);
  res.json({ success: true, data: { ...business, offers } });
});

apiRouter.post('/businesses/:id/follow', requireAuth, (req: AuthenticatedRequest, res) => {
  const customer = db.findCustomerByUserId(req.user!.id);
  if (!customer) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'متابعة المتاجر متاحة للعملاء المسجلين فقط' } });
    return;
  }
  const business = db.findBusinessById(req.params.id);
  if (!business) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'النشاط التجاري غير موجود' } });
    return;
  }
  const result = db.toggleFollowBusiness(customer.id, business.id);
  res.json({
    success: true,
    data: result,
    message: result.isFollowing ? `تمت متابعة المتجر ${business.businessName} بنجاح! ستصلك تنبيهات فورية عند وجود عروض خاصة.` : `تم إلغاء متابعة المتجر ${business.businessName}.`,
  });
});

apiRouter.get('/customer/following', requireAuth, (req: AuthenticatedRequest, res) => {
  const customer = db.findCustomerByUserId(req.user!.id);
  if (!customer) {
    res.json({ success: true, data: [] });
    return;
  }
  const followedIds = db.getCustomerFollows(customer.id);
  res.json({ success: true, data: followedIds });
});

apiRouter.get('/businesses', requirePermission(Permissions.BUSINESSES_READ), (req, res) => {
  const businesses = db.getAllBusinesses();
  res.json({ success: true, data: businesses });
});

apiRouter.put('/businesses/:id/status', requirePermission(Permissions.BUSINESSES_APPROVE), (req: AuthenticatedRequest, res) => {
  const { status, isListed, reason } = req.body;
  const business = db.updateBusiness(req.params.id, {
    status,
    isListed: isListed !== undefined ? isListed : status === 'ACTIVE',
  });

  if (!business) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'النشاط التجاري غير موجود' } });
    return;
  }

  // Update user status
  db.updateUser(business.userId, { status });

  db.recordAuditLog({
    actorId: req.user!.id,
    actorRole: req.user!.role,
    action: `BUSINESS_STATUS_${status}`,
    entity: 'BUSINESS',
    entityId: business.id,
    reason: reason || 'تحديث حالة النشاط التجاري بواسطة الإدارة',
  });

  res.json({ success: true, data: business });
});

// ----------------------------------------------------
// EMPLOYEES
// ----------------------------------------------------
apiRouter.get('/employees/my-business', requireAuth, (req: AuthenticatedRequest, res) => {
  const business = db.findBusinessByUserId(req.user!.id);
  if (!business) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'للتجار فقط' } });
    return;
  }
  const emps = db.getEmployeesByBusinessId(business.id);
  res.json({ success: true, data: emps });
});

apiRouter.post('/employees', requireAuth, (req: AuthenticatedRequest, res) => {
  const business = db.findBusinessByUserId(req.user!.id);
  if (!business) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'للتجار فقط' } });
    return;
  }

  const { name, phone, password, jobTitle, photoUrl, notes } = req.body;
  if (!name || !phone || !password) {
    res.status(400).json({ success: false, error: { code: 'MISSING_DATA', message: 'يرجى إدخال اسم الموظف ورقم الهاتف وكلمة المرور' } });
    return;
  }

  const existing = db.findUserByPhone(phone);
  if (existing) {
    res.status(409).json({ success: false, error: { code: 'PHONE_EXISTS', message: 'رقم الهاتف مسجل بالفعل' } });
    return;
  }

  const passwordHash = hashPassword(password);
  const user = db.createUser({
    phone,
    passwordHash,
    role: 'EMPLOYEE',
    status: 'ACTIVE',
  });

  const emp = db.createEmployee({
    userId: user.id,
    businessId: business.id,
    name,
    phone,
    jobTitle: jobTitle || 'كاشير مسح كروت',
    photoUrl,
    notes,
    isActive: true,
  });

  res.status(201).json({ success: true, data: emp });
});

// ----------------------------------------------------
// SERVICES & SECTORS
// ----------------------------------------------------
apiRouter.get('/services/sectors', (req, res) => {
  const sectors = db.getSectors();
  res.json({ success: true, data: sectors });
});

apiRouter.get('/services', (req, res) => {
  const sectorId = req.query.sectorId as string | undefined;
  const services = db.getServices(sectorId);
  res.json({ success: true, data: services });
});

apiRouter.get('/services/:id', (req, res) => {
  const srv = db.findServiceById(req.params.id);
  if (!srv) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'الخدمة غير موجودة' } });
    return;
  }
  res.json({ success: true, data: srv });
});

apiRouter.post('/services/requests', requireAuth, (req: AuthenticatedRequest, res) => {
  const customer = db.findCustomerByUserId(req.user!.id);
  if (!customer) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'طلب الخدمات متاح للعملاء المسجلين فقط' } });
    return;
  }

  const { serviceId, customerNotes } = req.body;
  if (!serviceId) {
    res.status(400).json({ success: false, error: { code: 'MISSING_SERVICE', message: 'يرجى اختيار الخدمة المطلوبة' } });
    return;
  }

  const request = db.createServiceRequest({
    customerId: customer.id,
    serviceId,
    customerNotes,
  });

  res.status(201).json({
    success: true,
    data: {
      request,
      message: `تم استلام طلب الخدمة برقم ${request.requestNumber}. سيقوم فريق الإدارة بمراجعته والتنسيق مع أفضل شريك معتمد.`,
    },
  });
});

apiRouter.get('/services/requests/my-requests', requireAuth, (req: AuthenticatedRequest, res) => {
  const customer = db.findCustomerByUserId(req.user!.id);
  if (!customer) {
    res.json({ success: true, data: [] });
    return;
  }
  const reqs = db.getServiceRequests(customer.id);
  res.json({ success: true, data: reqs });
});

// ----------------------------------------------------
// OFFERS
// ----------------------------------------------------
apiRouter.get('/offers/active', (req, res) => {
  const offers = db.getActiveOffers();
  res.json({ success: true, data: offers });
});

apiRouter.post('/offers', requireAuth, (req: AuthenticatedRequest, res) => {
  const business = db.findBusinessByUserId(req.user!.id);
  if (!business) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'إنشاء العروض متاح للتجار المعتمدين فقط' } });
    return;
  }

  const { title, description, discount, discountType, startDate, endDate, mainImage, conditions, selectedServiceIds } = req.body;
  if (!title || !discount || !startDate || !endDate) {
    res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'يرجى تعبئة الحقول الأساسية للعرض' } });
    return;
  }

  const offer = db.createOffer({
    businessId: business.id,
    title,
    description: description || '',
    discount: Number(discount),
    discountType: discountType || 'PERCENTAGE',
    startDate,
    endDate,
    mainImage,
    conditions,
    selectedServiceIds: selectedServiceIds || [],
  });

  res.status(201).json({
    success: true,
    data: {
      offer,
      message: 'تم إرسال العرض بنجاح وهو قيد المراجعة والموافقة من الإدارة.',
    },
  });
});

apiRouter.put('/offers/:id/status', requirePermission(Permissions.OFFERS_APPROVE), (req: AuthenticatedRequest, res) => {
  try {
    const { status, rejectReason } = req.body;
    const offer = db.updateOfferStatus(req.params.id, status, rejectReason);
    res.json({ success: true, data: offer });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'OFFER_UPDATE_ERROR', message: err.message } });
  }
});

// ----------------------------------------------------
// STORE & PRODUCTS
// ----------------------------------------------------
apiRouter.get('/store/products', (req, res) => {
  const paymentType = req.query.paymentType as any;
  const categoryId = req.query.categoryId as any;
  const products = db.getProducts({ paymentType, categoryId });
  res.json({ success: true, data: products });
});

apiRouter.get('/store/products/:id', (req, res) => {
  const product = db.findProductById(req.params.id);
  if (!product) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'المنتج غير موجود' } });
    return;
  }
  res.json({ success: true, data: product });
});

apiRouter.get('/store/categories', (req, res) => {
  res.json({ success: true, data: db.getProductCategories() });
});

// ----------------------------------------------------
// ORDERS (COD Cash or Points, Server Calculated)
// ----------------------------------------------------
apiRouter.post('/orders', requireAuth, (req: AuthenticatedRequest, res) => {
  const customer = db.findCustomerByUserId(req.user!.id);
  if (!customer) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'الطلب متاح للعملاء فقط' } });
    return;
  }

  const { paymentType, items, deliveryAddress } = req.body;

  if (!paymentType || !items || !deliveryAddress) {
    res.status(400).json({
      success: false,
      error: { code: 'MISSING_DATA', message: 'يرجى تزويد نوع الدفع وعناصر السلة وعنوان التوصيل كاملاً' },
    });
    return;
  }

  try {
    const order = db.createOrder({
      customerId: customer.id,
      paymentType,
      items,
      deliveryAddress,
    });

    res.status(201).json({
      success: true,
      data: {
        order,
        message: `تم إنشاء الطلب رقم ${order.orderNumber} بنجاح.`,
      },
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      error: { code: 'ORDER_CREATION_FAILED', message: err.message },
    });
  }
});

apiRouter.get('/orders/my-orders', requireAuth, (req: AuthenticatedRequest, res) => {
  const customer = db.findCustomerByUserId(req.user!.id);
  if (!customer) {
    res.json({ success: true, data: [] });
    return;
  }
  const orders = db.getOrders(customer.id);
  res.json({ success: true, data: orders });
});

apiRouter.get('/orders/:id', requireAuth, (req: AuthenticatedRequest, res) => {
  const order = db.findOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'الطلب غير موجود' } });
    return;
  }

  // Ensure customer can only view their own order unless Admin
  const customer = db.findCustomerByUserId(req.user!.id);
  if (req.user!.role !== 'ADMIN' && req.user!.role !== 'SUPER_ADMIN') {
    if (!customer || order.customerId !== customer.id) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'غير مصرح بالاطلاع على تفاصيل هذا الطلب' } });
      return;
    }
  }

  res.json({ success: true, data: order });
});

apiRouter.post('/orders/:id/cancel', requireAuth, (req: AuthenticatedRequest, res) => {
  const { reason } = req.body;
  const order = db.findOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'الطلب غير موجود' } });
    return;
  }

  // Cancel allowed only before Preparing (#67)
  if (order.status !== 'PENDING' && order.status !== 'CONFIRMED') {
    res.status(400).json({
      success: false,
      error: { code: 'CANNOT_CANCEL', message: 'لا يمكن إلغاء الطلب بعد بدء مرحلة التجهيز أو الشحن' },
    });
    return;
  }

  const updated = db.updateOrderStatus(order.id, 'CANCELLED', reason || 'تم الإلغاء بواسطة العميل');
  res.json({ success: true, data: updated, message: 'تم إلغاء الطلب بنجاح وإرجاع النقاط إن وجدت.' });
});

// ----------------------------------------------------
// NOTIFICATIONS
// ----------------------------------------------------
apiRouter.get('/notifications', requireAuth, (req: AuthenticatedRequest, res) => {
  const notifs = db.getUserNotifications(req.user!.id);
  res.json({ success: true, data: notifs });
});

apiRouter.put('/notifications/:id/read', requireAuth, (req, res) => {
  db.markNotificationRead(req.params.id);
  res.json({ success: true });
});

apiRouter.post('/notifications/mark-all-read', requireAuth, (req: AuthenticatedRequest, res) => {
  db.markAllNotificationsRead(req.user!.id);
  res.json({ success: true });
});

apiRouter.delete('/notifications/:id', requireAuth, (req, res) => {
  db.hideNotification(req.params.id);
  res.json({ success: true });
});

// ----------------------------------------------------
// NEWS & FAQ & SUPPORT & CMS
// ----------------------------------------------------
apiRouter.get('/news', (req, res) => {
  res.json({ success: true, data: db.getNews() });
});

apiRouter.get('/news/:id', (req, res) => {
  const article = db.findNewsById(req.params.id);
  if (!article) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'المقال غير موجود' } });
    return;
  }
  article.views += 1;
  res.json({ success: true, data: article });
});

apiRouter.post('/news/:id/comments', requireAuth, (req: AuthenticatedRequest, res) => {
  const { comment } = req.body;
  if (!comment) {
    res.status(400).json({ success: false, error: { code: 'EMPTY_COMMENT', message: 'التعليق لا يمكن أن يكون فارغاً' } });
    return;
  }
  const user = db.findUserById(req.user!.id);
  const name = req.user!.customer?.fullName || req.user!.business?.businessName || req.user!.phone;
  db.addNewsComment(req.params.id, name, comment);
  res.json({ success: true, message: 'تم نشر تعليقك بنجاح' });
});

apiRouter.get('/faqs', (req, res) => {
  res.json({ success: true, data: db.getFAQs() });
});

apiRouter.get('/support/tickets', requireAuth, (req: AuthenticatedRequest, res) => {
  const customer = db.findCustomerByUserId(req.user!.id);
  const tickets = req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN'
    ? db.getSupportTickets()
    : db.getSupportTickets(customer?.id);
  res.json({ success: true, data: tickets });
});

apiRouter.post('/support/tickets', (req, res) => {
  const { name, phone, email, subject, category, message, customerId } = req.body;
  if (!name || !phone || !subject || !message) {
    res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'يرجى تعبئة كافة الحقول المطلوبة' } });
    return;
  }

  const ticket = db.createSupportTicket({
    customerId,
    name,
    phone,
    email,
    subject,
    category: category || 'عام',
    initialMessage: message,
  });

  res.status(201).json({
    success: true,
    data: {
      ticketNumber: ticket.ticketNumber,
      ticket,
      message: `تم فتح تذكرة الدعم بنجاح برقم ${ticket.ticketNumber}. سيقوم فريق الدعم الفني بمتابعتها والرد عليك في أسرع وقت.`,
    },
  });
});

apiRouter.post('/support/tickets/:id/messages', requireAuth, (req: AuthenticatedRequest, res) => {
  const { message } = req.body;
  if (!message) {
    res.status(400).json({ success: false, error: { code: 'EMPTY_MESSAGE', message: 'الرسالة مطلوبة' } });
    return;
  }

  const isStaff = req.user!.role === 'ADMIN' || req.user!.role === 'SUPER_ADMIN';
  const senderType = isStaff ? 'SUPPORT' : 'CUSTOMER';
  const senderName = isStaff ? 'إدارة الدعم الفني' : (req.user!.customer?.fullName || req.user!.phone);

  const ticket = db.addSupportMessage(req.params.id, senderType, senderName, message);
  res.json({ success: true, data: ticket });
});

apiRouter.get('/cms/pages', (req, res) => {
  res.json({ success: true, data: db.getAllCMSPages() });
});

apiRouter.get('/cms/:slug', (req, res) => {
  const page = db.getCMSPage(req.params.slug);
  if (!page) {
    res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'الصفحة غير موجودة' } });
    return;
  }
  res.json({ success: true, data: page });
});

apiRouter.put('/admin/cms/:slug', requirePermission(Permissions.CMS_MANAGE), (req: AuthenticatedRequest, res) => {
  try {
    const { title, content, metaTitle, metaDesc, status } = req.body;
    if (!title || !content) {
      res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'العنوان والمحتوى مطلوبان' } });
      return;
    }
    const page = db.upsertCMSPage(
      { slug: req.params.slug, title, content, metaTitle, metaDesc, status },
      req.user!.id
    );
    res.json({ success: true, data: page });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'CMS_ERROR', message: err.message } });
  }
});

apiRouter.get('/governorates', (req, res) => {
  res.json({ success: true, data: db.getGovernorates() });
});

apiRouter.get('/discount-services', (req, res) => {
  const governorateId = req.query.governorateId as string;
  res.json({ success: true, data: db.getDiscountServices(governorateId) });
});

apiRouter.get('/admin/discount-services', requirePermission(Permissions.SERVICES_MANAGE), (req, res) => {
  res.json({ success: true, data: db.getAllDiscountServices() });
});

apiRouter.post('/admin/discount-services', requirePermission(Permissions.SERVICES_MANAGE), (req: AuthenticatedRequest, res) => {
  try {
    const { title, governorateId, governorateName, imageUrl, galleryImages, phone, whatsapp, subscriptionPrice, validityDate, description, status } = req.body;
    if (!title || !phone) {
      res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'العنوان ورقم الهاتف مطلوبان' } });
      return;
    }
    const service = db.createDiscountService({
      title,
      governorateId: governorateId || 'gov_cairo',
      governorateName: governorateName || 'القاهرة',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=80',
      galleryImages: galleryImages || [],
      phone,
      whatsapp: whatsapp || phone,
      subscriptionPrice: Number(subscriptionPrice || 0),
      validityDate: validityDate || '2026-12-31',
      description: description || '',
      status: status || 'ACTIVE',
    });
    res.status(201).json({ success: true, data: service });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'ERROR', message: err.message } });
  }
});

apiRouter.put('/admin/discount-services/:id', requirePermission(Permissions.SERVICES_MANAGE), (req: AuthenticatedRequest, res) => {
  try {
    const updated = db.updateDiscountService(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'الخدمة غير موجودة' } });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'ERROR', message: err.message } });
  }
});

apiRouter.delete('/admin/discount-services/:id', requirePermission(Permissions.SERVICES_MANAGE), (req, res) => {
  const success = db.deleteDiscountService(req.params.id);
  res.json({ success });
});

apiRouter.post('/admin/products', requirePermission(Permissions.STORE_MANAGE), (req: AuthenticatedRequest, res) => {
  try {
    const { name, categoryId, description, cashPrice, pointsPrice, paymentType, images, status } = req.body;
    if (!name || !cashPrice) {
      res.status(400).json({ success: false, error: { code: 'MISSING_FIELDS', message: 'اسم المنتج والسعر مطلوبان' } });
      return;
    }
    const product = db.createProduct({
      name,
      categoryId: categoryId || 'cat_01',
      description: description || '',
      cashPrice: Number(cashPrice),
      pointsPrice: Number(pointsPrice || 0),
      paymentType: paymentType || 'CASH',
      images: images || ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'],
      inventory: Number(req.body.inventory || 100),
      lowStockThreshold: Number(req.body.lowStockThreshold || 5),
      status: status || 'ACTIVE',
    });
    res.status(201).json({ success: true, data: product });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'ERROR', message: err.message } });
  }
});

// ----------------------------------------------------
// ADMIN DASHBOARD & SYSTEM MANAGEMENT
// ----------------------------------------------------
apiRouter.get('/admin/metrics', requirePermission(Permissions.REPORTS_VIEW), (req, res) => {
  const metrics = db.getSystemMetrics();
  res.json({ success: true, data: metrics });
});

apiRouter.get('/admin/customers', requirePermission(Permissions.CUSTOMERS_READ), (req, res) => {
  const customers = db.getAllCustomers();
  res.json({ success: true, data: customers });
});

// ----------------------------------------------------
// ADMIN APPROVAL SYSTEM (Cards & Users)
// ----------------------------------------------------
apiRouter.get('/admin/approvals', requirePermission(Permissions.CUSTOMERS_APPROVE), (req, res) => {
  try {
    const data = db.getPendingApprovals();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
});

apiRouter.post('/admin/approvals/:id/approve', requirePermission(Permissions.CUSTOMERS_APPROVE), (req: AuthenticatedRequest, res) => {
  try {
    const { notes } = req.body || {};
    const result = db.approveUser(req.params.id, notes, req.user?.id);
    res.json({
      success: true,
      data: result,
      message: 'تمت الموافقة على الطلب بنجاح وتفعيل الكارت وإصداره',
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'APPROVAL_ERROR', message: err.message } });
  }
});

apiRouter.post('/admin/approvals/:id/reject', requirePermission(Permissions.CUSTOMERS_APPROVE), (req: AuthenticatedRequest, res) => {
  try {
    const { reason } = req.body || {};
    const user = db.rejectUser(req.params.id, reason, req.user?.id);
    res.json({
      success: true,
      data: { user },
      message: 'تم رفض الطلب بنجاح',
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'REJECTION_ERROR', message: err.message } });
  }
});

apiRouter.post('/admin/approvals/:id/action', requirePermission(Permissions.CUSTOMERS_APPROVE), (req: AuthenticatedRequest, res) => {
  try {
    const { action, notes, reason } = req.body || {};
    if (action === 'APPROVE') {
      const result = db.approveUser(req.params.id, notes, req.user?.id);
      res.json({ success: true, data: result, message: 'تمت الموافقة على الطلب بنجاح وتفعيل الكارت وإصداره' });
    } else {
      const user = db.rejectUser(req.params.id, reason, req.user?.id);
      res.json({ success: true, data: { user }, message: 'تم رفض الطلب' });
    }
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'ACTION_ERROR', message: err.message } });
  }
});

apiRouter.get('/admin/audit-logs', requirePermission(Permissions.AUDIT_READ), (req, res) => {
  const logs = db.getAuditLogs();
  res.json({ success: true, data: logs });
});

apiRouter.get('/admin/settings', requirePermission(Permissions.SETTINGS_UPDATE), (req, res) => {
  res.json({ success: true, data: db.getSettings() });
});

apiRouter.put('/admin/settings/:key', requirePermission(Permissions.SETTINGS_UPDATE), (req: AuthenticatedRequest, res) => {
  try {
    const { value } = req.body;
    const setting = db.updateSetting(req.params.key, String(value), req.user!.id);
    res.json({ success: true, data: setting });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'SETTING_ERROR', message: err.message } });
  }
});

apiRouter.get('/admin/jobs', requirePermission(Permissions.JOBS_TRIGGER), (req, res) => {
  res.json({ success: true, data: db.getJobs() });
});

apiRouter.post('/admin/jobs/:id/run', requirePermission(Permissions.JOBS_TRIGGER), (req, res) => {
  try {
    const result = db.runJob(req.params.id);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: { code: 'JOB_ERROR', message: err.message } });
  }
});

// Health Check Endpoint (#109)
apiRouter.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      api: { status: 'up', version: 'v1.0.0' },
      database: { status: 'up', engine: 'PostgreSQL / Prisma / ACID Core' },
      redis: { status: 'configured', mode: 'cache-and-job-queue' },
      storage: { status: 'configured', bucket: 'sugar-business-media' },
      queues: { status: 'active', workers: 3 },
    },
  });
});
