import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import {
  UserRole,
  AccountStatus,
  CardStatus,
  CardAction,
  PointLedgerType,
  ServiceRequestStatus,
  DiscountType,
  OfferStatus,
  ProductStatus,
  PaymentType,
  OrderStatus,
  NotificationType,
  Priority,
  SupportTicketStatus,
} from './types';

export interface UserEntity {
  id: string;
  phone: string;
  email?: string;
  passwordHash: string;
  role: UserRole;
  status: AccountStatus;
  failedLoginAttempts: number;
  lockoutUntil?: string | null;
  lastLoginAt?: string | null;
  lastLoginIp?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerEntity {
  id: string;
  userId: string;
  fullName: string;
  governorate: string;
  city: string;
  address?: string;
  referenceNumber: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardEntity {
  id: string;
  cardId: string;
  qrId: string;
  cardNumber: string;
  customerId: string;
  status: CardStatus;
  issueDate: string;
  expiryDate: string;
  lastScanAt?: string | null;
  notes?: string;
  designConfig?: {
    theme: string;
    showQr: boolean;
    cardNumberPosition: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CardHistoryEntity {
  id: string;
  cardId: string;
  action: CardAction;
  reason?: string;
  actorId: string;
  timestamp: string;
  metadata?: any;
}

export interface PointAccountEntity {
  id: string;
  customerId: string;
  balance: number;
  totalEarnedHistorical: number;
  currentLevelId: string;
  updatedAt: string;
}

export interface PointLedgerEntity {
  id: string;
  customerId: string;
  transactionId: string;
  type: PointLedgerType;
  points: number;
  balanceAfter: number;
  actorId: string;
  reason?: string;
  referenceId?: string;
  expiresAt?: string | null;
  createdAt: string;
}

export interface BusinessEntity {
  id: string;
  userId: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email?: string;
  governorate: string;
  city: string;
  address: string;
  type: string;
  sectorId: string;
  description: string;
  logoUrl?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    website?: string;
    whatsapp?: string;
  };
  workingHours?: string;
  documents?: string[];
  galleryImages?: string[];
  discountNote?: string;
  isListed: boolean;
  status: AccountStatus;
  ratingAvg: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeEntity {
  id: string;
  userId: string;
  businessId: string;
  name: string;
  phone: string;
  email?: string;
  jobTitle: string;
  photoUrl?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionEntity {
  id: string;
  transactionId: string;
  idempotencyKey: string;
  cardId: string;
  businessId: string;
  employeeId?: string;
  customerId: string;
  amount: number;
  pointsAwarded: number;
  isReversed: boolean;
  reversalReason?: string;
  createdAt: string;
}

export interface SectorEntity {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  count: number;
}

export interface ServiceEntity {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  icon: string;
  shortDescription: string;
  fullDescription: string;
  targetAudience: string;
  sectorId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequestEntity {
  id: string;
  requestNumber: string;
  customerId: string;
  serviceId: string;
  businessId?: string;
  status: ServiceRequestStatus;
  customerNotes?: string;
  adminNotes?: string;
  cancellationReason?: string;
  rating?: number;
  ratingComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfferEntity {
  id: string;
  businessId: string;
  title: string;
  description: string;
  discount: number;
  discountType: DiscountType;
  startDate: string;
  endDate: string;
  status: OfferStatus;
  mainImage?: string;
  conditions?: string;
  rejectReason?: string;
  selectedServiceIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductEntity {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  paymentType: PaymentType;
  cashPrice: number;
  pointsPrice: number;
  inventory: number;
  lowStockThreshold: number;
  status: ProductStatus;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemSnapshot {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPriceCash: number;
  unitPricePoints: number;
}

export interface OrderEntity {
  id: string;
  orderNumber: string;
  customerId: string;
  paymentType: PaymentType;
  status: OrderStatus;
  subtotalCash: number;
  subtotalPoints: number;
  deliveryFee: number;
  totalCash: number;
  totalPoints: number;
  deliveryAddress: {
    title: string;
    recipient: string;
    phone: string;
    governorate: string;
    city: string;
    street: string;
    building?: string;
  };
  cancellationReason?: string;
  statusTimeline: Array<{
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }>;
  items: OrderItemSnapshot[];
  createdAt: string;
  updatedAt: string;
}

export interface NotificationEntity {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: Priority;
  isRead: boolean;
  isHidden: boolean;
  deepLink?: string;
  metadata?: any;
  createdAt: string;
}

export interface NewsEntity {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  category: string;
  author: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishDate: string;
  views: number;
  likes: number;
  tags: string[];
  comments: Array<{
    id: string;
    userName: string;
    comment: string;
    isApproved: boolean;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketEntity {
  id: string;
  ticketNumber: string;
  customerId?: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  category: string;
  status: SupportTicketStatus;
  messages: Array<{
    id: string;
    sender: 'CUSTOMER' | 'SUPPORT';
    senderName: string;
    message: string;
    timestamp: string;
  }>;
  rating?: number;
  ratingComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FAQEntity {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
  isVisible: boolean;
}

export interface CMSPageEntity {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaTitle?: string;
  metaDesc?: string;
  version: number;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
}

export interface DiscountServiceEntity {
  id: string;
  title: string;
  governorateId: string;
  governorateName: string;
  imageUrl: string;
  galleryImages: string[];
  phone: string;
  whatsapp: string;
  subscriptionPrice: number;
  validityDate: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface SettingEntity {
  id: string;
  key: string;
  value: string;
  category: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description: string;
  isSensitive: boolean;
  updatedAt: string;
  updatedBy?: string;
}

export interface AuditLogEntity {
  id: string;
  actorId: string;
  actorRole: string;
  action: string;
  entity: string;
  entityId?: string;
  ip?: string;
  before?: any;
  after?: any;
  reason?: string;
  timestamp: string;
}

export interface GovernorateEntity {
  id: string;
  nameAr: string;
  nameEn: string;
  available: boolean;
  deliveryFee: number;
}

export interface DatabaseSchema {
  users: UserEntity[];
  refreshTokens: Array<{ id: string; tokenHash: string; userId: string; isRevoked: boolean; expiresAt: string; createdAt: string }>;
  customers: CustomerEntity[];
  cards: CardEntity[];
  cardHistory: CardHistoryEntity[];
  pointAccounts: PointAccountEntity[];
  pointLedger: PointLedgerEntity[];
  businesses: BusinessEntity[];
  employees: EmployeeEntity[];
  transactions: TransactionEntity[];
  sectors: SectorEntity[];
  services: ServiceEntity[];
  serviceRequests: ServiceRequestEntity[];
  offers: OfferEntity[];
  productCategories: Array<{ id: string; nameAr: string; nameEn: string; slug: string }>;
  products: ProductEntity[];
  orders: OrderEntity[];
  favorites: Array<{ id: string; customerId: string; businessId?: string; productId?: string; createdAt: string }>;
  follows: Array<{ id: string; customerId: string; businessId: string; createdAt: string }>;
  reviews: Array<{ id: string; customerId: string; businessId?: string; productId?: string; rating: number; comment: string; status: string; createdAt: string }>;
  discountServices: DiscountServiceEntity[];
  notifications: NotificationEntity[];
  news: NewsEntity[];
  supportTickets: SupportTicketEntity[];
  faqs: FAQEntity[];
  cmsPages: CMSPageEntity[];
  media: Array<{ id: string; filename: string; originalName: string; mimeType: string; size: number; url: string; folder: string; tags: string[]; usedIn: string[] }>;
  settings: SettingEntity[];
  auditLogs: AuditLogEntity[];
  governorates: GovernorateEntity[];
  jobs: Array<{ id: string; name: string; description: string; schedule: string; status: 'IDLE' | 'RUNNING' | 'FAILED'; lastRun?: string; nextRun?: string; runCount: number; failCount: number }>;
}

// ----------------------------------------------------
// DATABASE CLASS
// ----------------------------------------------------
class SugarDatabase {
  private data: DatabaseSchema;
  private filePath: string;
  private isLoaded = false;

  constructor() {
    const dataDir = path.resolve(process.cwd(), '.data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Fallback to in-memory if disk restricted
      }
    }
    this.filePath = path.join(dataDir, 'sugar_business_db.json');
    this.data = this.loadOrInitialize();
  }

  private loadOrInitialize(): DatabaseSchema {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(raw);
      } catch {
        // Fallback to initial seed
      }
    }
    const seed = this.getInitialSeed();
    this.persist(seed);
    return seed;
  }

  private persist(dataToSave?: DatabaseSchema) {
    const data = dataToSave || this.data;
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // In-memory continues safely
    }
  }

  // ----------------------------------------------------
  // INITIAL SEED DATA (Only Real Admin Credentials)
  // ----------------------------------------------------
  private getInitialSeed(): DatabaseSchema {
    // Admin password hash for "abdallah112021"
    const adminPasswordHash = '036a03cc700db9d811ba5f824e4f59fc:ca9933eaf2cb2a14b8c18d515a44b2f910853ad0f31f0eaa4ceb23a78dc7a5417f833fe2d3692b939d9460f3fe5936276bcf926c61082b69e1107cddbef290b2';

    const now = new Date().toISOString();

    const superAdminUser: UserEntity = {
      id: 'usr_super_admin_01',
      phone: '01026541250',
      email: 'abdall8ah112021@gmail.com',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      failedLoginAttempts: 0,
      createdAt: now,
      updatedAt: now,
    };

    const sectors: SectorEntity[] = [
      { id: 'sec_01', name: 'Food & Beverage', nameAr: 'المطاعم والكافيهات', icon: 'Coffee', count: 42 },
      { id: 'sec_02', name: 'Retail & Fashion', nameAr: 'الملابس والأزياء', icon: 'ShoppingBag', count: 28 },
      { id: 'sec_03', name: 'Healthcare & Wellness', nameAr: 'الصحة والجمال والعناية', icon: 'HeartPulse', count: 19 },
      { id: 'sec_04', name: 'Automotive', nameAr: 'خدمات وصيانة السيارات', icon: 'Car', count: 15 },
      { id: 'sec_05', name: 'Electronics & Tech', nameAr: 'الإلكترونيات والتقنية', icon: 'Smartphone', count: 24 },
      { id: 'sec_06', name: 'Home & Living', nameAr: 'المنزل والديكور', icon: 'Home', count: 12 },
    ];

    const services: ServiceEntity[] = [
      {
        id: 'srv_01',
        name: 'VIP Car Detailing & Wash',
        nameAr: 'العناية الشاملة وتنظيف السيارات VIP',
        slug: 'car-detailing-vip',
        icon: 'Car',
        shortDescription: 'خدمة غسيل وعناية وتلميع احترافي للسيارات بخصم حصري لحاملي الكارت.',
        fullDescription: 'تشمل الخدمة فحصاً دقيقاً، غسيلاً بالبخار داخلياً وخارجياً، معالجة الجلد، وطبقة نانو سيراميك لحماية طلاء السيارة مع إضافة نقاط ولاء فورية لحسابك.',
        targetAudience: 'أصحاب السيارات الباحثين عن خدمة عناية متكاملة ومضمونة',
        sectorId: 'sec_04',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'srv_02',
        name: 'Dental Care & Scaling',
        nameAr: 'تنظيف وتلميع وفحص الأسنان الدوري',
        slug: 'dental-scaling-checkup',
        icon: 'Smile',
        shortDescription: 'جلسة طبية متكاملة لفحص وصحة الأسنان في أفضل المراكز المعتمدة.',
        fullDescription: 'جلسة تشمل الكشف السريري وإزالة الجير والتصبغات وتلميع الأسنان بأحدث التقنيات السويسرية، مع خصم مخصص لأعضاء Sugar Business.',
        targetAudience: 'الأفراد والعائلات المهتمين بصحة الفم والأسنان',
        sectorId: 'sec_03',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'srv_03',
        name: 'Specialty Coffee Tasting & Catering',
        nameAr: 'ضيافة القهوة المختصة للمناسبات والشركات',
        slug: 'specialty-coffee-catering',
        icon: 'Coffee',
        shortDescription: 'محطة باريستا متنقلة بأرقى أنواع البن العالمي لمناسبتك واجتماعاتك.',
        fullDescription: 'نقدم حلول ضيافة القهوة المختصة لمناسباتك واحتفالاتك الخاصة مع باريستا محترف ومعدات متطورة ومشروبات باردة وساخنة معتمدة.',
        targetAudience: 'الشركات، المناسبات الخاصة، المعارض',
        sectorId: 'sec_01',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const productCategories = [
      { id: 'cat_01', nameAr: 'إلكترونيات واكسسوارات', nameEn: 'Electronics', slug: 'electronics' },
      { id: 'cat_02', nameAr: 'أدوات منزلية ومطبخ', nameEn: 'Home & Kitchen', slug: 'home-kitchen' },
      { id: 'cat_03', nameAr: 'إكسسوارات سفر وهدايا', nameEn: 'Lifestyle & Gifts', slug: 'lifestyle' },
    ];

    const products: ProductEntity[] = [
      {
        id: 'prd_01',
        name: 'كوب حراري ذكي شاشة رقمية LED',
        description: 'مج حافظ للحرارة 500 مل استانلس ستيل 316 مع شاشة لمس مدمجة لعرض درجة الحرارة وتصميم أسود فخم.',
        categoryId: 'cat_02',
        paymentType: 'POINTS',
        cashPrice: 0,
        pointsPrice: 150,
        inventory: 45,
        lowStockThreshold: 5,
        status: 'ACTIVE',
        images: [
          'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prd_02',
        name: 'سماعات بلوتوث لاسلكية عازلة للضوضاء ANC',
        description: 'سماعات احترافية متوافقة مع جميع الأجهزة مع بطارية تدوم حتى 36 ساعة وشحن سريع من نوع Type-C.',
        categoryId: 'cat_01',
        paymentType: 'CASH',
        cashPrice: 1250,
        pointsPrice: 0,
        inventory: 18,
        lowStockThreshold: 4,
        status: 'ACTIVE',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prd_03',
        name: 'باور بانك مغناطيسي نحيف 10000mAh',
        description: 'شاحن متنقل لاسلكي متوافق مع MagSafe مع شاشة عرض النسبة ومخرج شحن فائق السرعة 22.5W.',
        categoryId: 'cat_01',
        paymentType: 'POINTS',
        pointsPrice: 300,
        cashPrice: 0,
        inventory: 22,
        lowStockThreshold: 5,
        status: 'ACTIVE',
        images: [
          'https://images.unsplash.com/photo-1609592426505-88574c87895e?w=800&auto=format&fit=crop&q=80',
        ],
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'prd_04',
        name: 'حقيبة سفر مقاومة للماء مع قفل أمان TSA',
        description: 'حقيبة ظهر عصرية للأعمال واللابتوب حتى 16 بوصة مع فتحة شحن USB ومقصورات متعددة منظمة.',
        categoryId: 'cat_03',
        paymentType: 'CASH',
        cashPrice: 890,
        pointsPrice: 0,
        inventory: 14,
        lowStockThreshold: 3,
        status: 'ACTIVE',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
        ],
        createdAt: now,
        updatedAt: now,
      },
    ];

    const news: NewsEntity[] = [
      {
        id: 'news_01',
        title: 'انطلاق منظومة Sugar Business رسمياً في مصر: عصر جديد لولاء العملاء',
        content: `يسر إدارة Sugar Business الإعلان عن إطلاق المنظومة الرائدة في الجمهورية، والتي تتيح للعملاء الحصول على كارت بلاستيكي ذكي بتقنية QR الموحدة، وجمع النقاط الفورية لدى شبكة واسعة من كبرى المتاجر ومقدمي الخدمات في مختلف المحافظات.
تهدف المنظومة إلى تقديم قيمة حقيقية للعملاء عبر استبدال النقاط بمنتجات حصرية وتجارب فريدة، مع تمكين أصحاب الأعمال من توسيع قاعدة عملائهم ومكافأتهم بأعلى درجات الموثوقية والأمان.`,
        imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1200&auto=format&fit=crop&q=80',
        category: 'أخبار المنظومة',
        author: 'إدارة Sugar Business',
        status: 'PUBLISHED',
        publishDate: now,
        views: 1420,
        likes: 96,
        tags: ['انطلاق', 'ولاء_العملاء', 'كروت_ذكية', 'مكافآت'],
        comments: [],
        createdAt: now,
        updatedAt: now,
      },
    ];

    const faqs: FAQEntity[] = [
      {
        id: 'faq_01',
        category: 'الكروت الذكية',
        question: 'كيف أحصل على كارت Sugar Business البلاستيكي؟',
        answer: 'يمكنك إنشاء حسابك كعميل جديد عبر المنصة، وبعد مراجعة الطلب والموافقة عليه من الإدارة، يتم إصدار كارتك البلاستيكي المطبوع بالرقم التسلسلي ورمز QR وشحنه مباشرة إلى عنوانك.',
        order: 1,
        isVisible: true,
      },
      {
        id: 'faq_02',
        category: 'النقاط والمكافآت',
        question: 'كم عدد النقاط التي أحصل عليها مع كل عملية شراء؟',
        answer: 'القيمة الافتراضية هي 10 نقاط لكل عملية شراء مؤكدة عبر مسح الكارت، وقد تمنح بعض المتاجر الشريكة نقاطاً مضاعفة خلال فترات العروض الخاصة.',
        order: 2,
        isVisible: true,
      },
      {
        id: 'faq_03',
        category: 'النقاط والمكافآت',
        question: 'ما هي مدة صلاحية النقاط وكيف تتم متابعتها؟',
        answer: 'تنتهي صلاحية النقاط بعد مرور 6 أشهر من تاريخ اكتسابها، ويرسل لك النظام إشعارات تنبيهية تلقائية قبل موعد الانتهاء بـ 30 يوماً و7 أيام وفي يوم الانتهاء.',
        order: 3,
        isVisible: true,
      },
      {
        id: 'faq_04',
        category: 'المتجر والطلبات',
        question: 'هل يمكن الجمع بين الدفع بالنقاط والدفع النقدي في نفس الطلب؟',
        answer: 'لا، وفقاً لسياسة المتجر الصارمة، يُمنع دمج المنتجات النقدية مع منتجات النقاط في سلة واحدة، حيث تُنفذ طلبات النقاط بشكل منفصل لضمان الشفافية ودقة الحسابات.',
        order: 4,
        isVisible: true,
      },
      {
        id: 'faq_05',
        category: 'أصحاب الأعمال',
        question: 'كيف يمكن لمتجري أو نشاطي الانضمام كشريك في Sugar Business؟',
        answer: 'يمكنك النقر على "تسجيل كشريك تجاري"، وملء بيانات المنشأة ومستنداتها ورفع الشعار، وسيقوم فريق المراجعة والتدقيق بالتواصل معك وتفعيل حسابك وإضافته لدليل المتاجر المعتمد.',
        order: 5,
        isVisible: true,
      },
    ];

    const cmsPages: CMSPageEntity[] = [
      {
        id: 'cms_01',
        slug: 'about-us',
        title: 'عن Sugar Business',
        content: `Sugar Business هي المنظومة المتكاملة الأولى لربط ولاء العملاء بالكروت البلاستيكية الذكية وشبكات الأعمال والمتاجر المعتمدة. نهدف إلى تقديم تجربة مكافآت شفافة، حقيقية، ومضمونة تمنح العميل قيمة ملموسة مع كل مسح للكارت، وتمكن التجار من بناء علاقات مستدامة ومربحة مع عملائهم الأوفياء.`,
        metaTitle: 'عن Sugar Business – ريادة ولاء العملاء والمكافآت الذكية',
        metaDesc: 'تعرف على رؤية وأهداف منظومة Sugar Business الرائدة لولاء العملاء وكروت المكافآت الذكية.',
        version: 1,
        status: 'PUBLISHED',
        updatedAt: now,
      },
      {
        id: 'cms_02',
        slug: 'terms-and-conditions',
        title: 'الشروط والأحكام',
        content: `باستخدامك لمنصة Sugar Business أو حيازتك لكارت العضوية، فإنك توافق على الالتزام بكافة الشروط والأحكام المنظمة للبرنامج، بما في ذلك قواعد احتساب واستبدال النقاط وسياسات الشراء والإرجاع في المتجر.`,
        metaTitle: 'الشروط والأحكام – Sugar Business',
        metaDesc: 'الشروط والأحكام المنظمة لاستخدام كروت ومنصة Sugar Business',
        version: 1,
        status: 'PUBLISHED',
        updatedAt: now,
      },
      {
        id: 'cms_03',
        slug: 'privacy-policy',
        title: 'سياسة الخصوصية وأمان البيانات',
        content: `نحن نولي خصوصية بياناتك وأمان معاملاتك أقصى درجات العناية. لا نقوم بمشاركة أي بيانات مالية أو شخصية حساسة مع أي أطراف غير مخولة، وتُطبق أعلى معايير التشفير والتدقيق الأمني على كافة العمليات.`,
        metaTitle: 'سياسة الخصوصية – Sugar Business',
        metaDesc: 'سياسة حماية البيانات والخصوصية والأمان لمنظومة Sugar Business',
        version: 1,
        status: 'PUBLISHED',
        updatedAt: now,
      },
    ];

    const settings: SettingEntity[] = [
      {
        id: 'set_01',
        key: 'points_per_purchase',
        value: '10',
        category: 'points',
        type: 'number',
        description: 'عدد النقاط المكتسبة لكل عملية شراء افتراضية عند مسح الكارت',
        isSensitive: false,
        updatedAt: now,
        updatedBy: 'usr_super_admin_01',
      },
      {
        id: 'set_02',
        key: 'points_expiry_months',
        value: '6',
        category: 'points',
        type: 'number',
        description: 'مدة صلاحية النقاط بالأشهر من تاريخ الاكتساب',
        isSensitive: false,
        updatedAt: now,
        updatedBy: 'usr_super_admin_01',
      },
      {
        id: 'set_03',
        key: 'card_validity_days',
        value: '365',
        category: 'cards',
        type: 'number',
        description: 'صلاحية الكارت البلاستيكي الافتراضية بالأيام (سنة واحدة)',
        isSensitive: false,
        updatedAt: now,
        updatedBy: 'usr_super_admin_01',
      },
      {
        id: 'set_04',
        key: 'silver_level_threshold',
        value: '300',
        category: 'loyalty',
        type: 'number',
        description: 'الحد الأدنى للنقاط التاريخية للترقية إلى المستوى الفضي',
        isSensitive: false,
        updatedAt: now,
        updatedBy: 'usr_super_admin_01',
      },
      {
        id: 'set_05',
        key: 'gold_level_threshold',
        value: '1000',
        category: 'loyalty',
        type: 'number',
        description: 'الحد الأدنى للنقاط التاريخية للترقية إلى المستوى الذهبي',
        isSensitive: false,
        updatedAt: now,
        updatedBy: 'usr_super_admin_01',
      },
      {
        id: 'set_06',
        key: 'platinum_level_threshold',
        value: '2500',
        category: 'loyalty',
        type: 'number',
        description: 'الحد الأدنى للنقاط التاريخية للترقية إلى المستوى البلاتيني VIP',
        isSensitive: false,
        updatedAt: now,
        updatedBy: 'usr_super_admin_01',
      },
      {
        id: 'set_07',
        key: 'maintenance_mode',
        value: 'false',
        category: 'system',
        type: 'boolean',
        description: 'تفعيل وضع الصيانة العام للنظام مع إمكانية دخول الإدارة فقط',
        isSensitive: true,
        updatedAt: now,
        updatedBy: 'usr_super_admin_01',
      },
      {
        id: 'set_08',
        key: 'maintenance_message',
        value: 'جاري إجراء تحديثات دورية مجدولة لتحسين الأداء والأمان. سنعود للعمل قريباً.',
        category: 'system',
        type: 'string',
        description: 'رسالة الصيانة التي تظهر للزوار والعملاء أثناء وضع الصيانة',
        isSensitive: false,
        updatedAt: now,
        updatedBy: 'usr_super_admin_01',
      },
    ];

    const governorates: GovernorateEntity[] = [
      { id: 'gov_cairo', nameAr: 'القاهرة', nameEn: 'Cairo', available: true, deliveryFee: 45 },
      { id: 'gov_giza', nameAr: 'الجيزة', nameEn: 'Giza', available: true, deliveryFee: 45 },
      { id: 'gov_alex', nameAr: 'الإسكندرية', nameEn: 'Alexandria', available: true, deliveryFee: 55 },
      { id: 'gov_qalyubia', nameAr: 'القليوبية', nameEn: 'Qalyubia', available: true, deliveryFee: 50 },
      { id: 'gov_sharqia', nameAr: 'الشرقية', nameEn: 'Sharqia', available: true, deliveryFee: 55 },
      { id: 'gov_dakahlia', nameAr: 'الدقهلية', nameEn: 'Dakahlia', available: true, deliveryFee: 55 },
      { id: 'gov_gharbia', nameAr: 'الغربية', nameEn: 'Gharbia', available: true, deliveryFee: 55 },
      { id: 'gov_monufia', nameAr: 'المنوفية', nameEn: 'Monufia', available: true, deliveryFee: 55 },
      { id: 'gov_damietta', nameAr: 'دمياط', nameEn: 'Damietta', available: true, deliveryFee: 60 },
      { id: 'gov_port_said', nameAr: 'بورسعيد', nameEn: 'Port Said', available: true, deliveryFee: 60 },
      { id: 'gov_ismailia', nameAr: 'الإسماعيلية', nameEn: 'Ismailia', available: true, deliveryFee: 60 },
      { id: 'gov_suez', nameAr: 'السويس', nameEn: 'Suez', available: true, deliveryFee: 60 },
      { id: 'gov_beheira', nameAr: 'البحيرة', nameEn: 'Beheira', available: true, deliveryFee: 60 },
      { id: 'gov_kafr_el_sheikh', nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh', available: true, deliveryFee: 60 },
      { id: 'gov_fayoum', nameAr: 'الفيوم', nameEn: 'Fayoum', available: true, deliveryFee: 65 },
      { id: 'gov_beni_suef', nameAr: 'بني سويف', nameEn: 'Beni Suef', available: true, deliveryFee: 65 },
      { id: 'gov_minya', nameAr: 'المنيا', nameEn: 'Minya', available: true, deliveryFee: 70 },
      { id: 'gov_assiut', nameAr: 'أسيوط', nameEn: 'Assiut', available: true, deliveryFee: 70 },
      { id: 'gov_sohag', nameAr: 'سوهاج', nameEn: 'Sohag', available: true, deliveryFee: 75 },
      { id: 'gov_qena', nameAr: 'قنا', nameEn: 'Qena', available: true, deliveryFee: 80 },
      { id: 'gov_luxor', nameAr: 'الأقصر', nameEn: 'Luxor', available: true, deliveryFee: 85 },
      { id: 'gov_aswan', nameAr: 'أسوان', nameEn: 'Aswan', available: true, deliveryFee: 90 },
      { id: 'gov_red_sea', nameAr: 'البحر الأحمر', nameEn: 'Red Sea', available: true, deliveryFee: 90 },
      { id: 'gov_south_sinai', nameAr: 'جنوب سيناء', nameEn: 'South Sinai', available: true, deliveryFee: 90 },
      { id: 'gov_matrouh', nameAr: 'مطروح', nameEn: 'Matrouh', available: true, deliveryFee: 85 },
    ];

    const jobs = [
      {
        id: 'job_points_expiry',
        name: 'فحص النقاط منتهية الصلاحية',
        description: 'فحص دوري لحركات النقاط التي تجاوزت 6 أشهر وإرسال تنبيهات للمستخدمين',
        schedule: '0 0 * * *',
        status: 'IDLE' as const,
        lastRun: now,
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        runCount: 24,
        failCount: 0,
      },
      {
        id: 'job_card_expiry',
        name: 'فحص صلاحية الكروت وتجديدها',
        description: 'متابعة الكروت التي أوشكت على انتهاء صلاحيتها بعد مرور عام وتنبيه أصحابها',
        schedule: '0 2 * * *',
        status: 'IDLE' as const,
        lastRun: now,
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        runCount: 24,
        failCount: 0,
      },
      {
        id: 'job_offers_cleanup',
        name: 'أرشفة العروض المنتهية وربط الخدمات',
        description: 'إيقاف العروض تلقائياً عند انتهاء مدتها أو في حال تعطيل الخدمة المرتبطة بها',
        schedule: '*/30 * * * *',
        status: 'IDLE' as const,
        lastRun: now,
        nextRun: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        runCount: 144,
        failCount: 0,
      },
    ];

    const auditLogs: AuditLogEntity[] = [
      {
        id: 'aud_01',
        actorId: 'usr_super_admin_01',
        actorRole: 'SUPER_ADMIN',
        action: 'SYSTEM_BOOTSTRAP',
        entity: 'SYSTEM',
        entityId: 'ROOT',
        ip: '127.0.0.1',
        reason: 'تهيئة منظومة Sugar Business بنجاح مع القواعد المعتمدة',
        timestamp: now,
      },
    ];

    return {
      users: [superAdminUser],
      refreshTokens: [],
      customers: [],
      cards: [],
      cardHistory: [],
      pointAccounts: [],
      pointLedger: [],
      businesses: [],
      employees: [],
      transactions: [],
      sectors,
      services,
      serviceRequests: [],
      offers: [],
      productCategories,
      products,
      orders: [],
      favorites: [],
      follows: [],
      reviews: [],
      notifications: [],
      news,
      supportTickets: [],
      faqs,
      cmsPages,
      discountServices: [],
      media: [],
      settings,
      auditLogs,
      governorates,
      jobs,
    };
  }

  // ----------------------------------------------------
  // USERS & AUTH METHODS
  // ----------------------------------------------------
  findUserById(id: string): UserEntity | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  findUserByPhone(phone: string): UserEntity | undefined {
    return this.data.users.find((u) => u.phone === phone);
  }

  createUser(user: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt' | 'failedLoginAttempts'>): UserEntity {
    const newUser: UserEntity = {
      ...user,
      id: `usr_${crypto.randomUUID().slice(0, 8)}`,
      failedLoginAttempts: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  updateUser(id: string, updates: Partial<UserEntity>): UserEntity | undefined {
    const user = this.data.users.find((u) => u.id === id);
    if (!user) return undefined;
    Object.assign(user, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return user;
  }

  recordLoginAttempt(phone: string, success: boolean, ip?: string): { locked: boolean; lockUntil?: string } {
    const user = this.findUserByPhone(phone);
    if (!user) return { locked: false };

    const now = new Date();

    if (success) {
      user.failedLoginAttempts = 0;
      user.lockoutUntil = null;
      user.lastLoginAt = now.toISOString();
      user.lastLoginIp = ip;
      this.persist();
      return { locked: false };
    }

    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= 5) {
      // 5 minutes lockout
      const lockUntil = new Date(now.getTime() + 5 * 60 * 1000).toISOString();
      user.lockoutUntil = lockUntil;
      this.recordAuditLog({
        actorId: user.id,
        actorRole: user.role,
        action: 'ACCOUNT_LOCKOUT',
        entity: 'USER',
        entityId: user.id,
        ip,
        reason: 'تم قفل الحساب مؤقتاً لمدة 5 دقائق لتجاوز 5 محاولات دخول خاطئة متتالية',
      });
      this.persist();
      return { locked: true, lockUntil };
    }

    this.persist();
    return { locked: false };
  }

  // ----------------------------------------------------
  // CUSTOMER METHODS
  // ----------------------------------------------------
  findCustomerById(id: string): CustomerEntity | undefined {
    return this.data.customers.find((c) => c.id === id);
  }

  findCustomerByUserId(userId: string): CustomerEntity | undefined {
    return this.data.customers.find((c) => c.userId === userId);
  }

  createCustomer(data: Omit<CustomerEntity, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt'>): CustomerEntity {
    const seq = this.data.customers.length + 1;
    const ref = `CUST-${new Date().getFullYear()}-${seq.toString().padStart(4, '0')}`;
    const newCustomer: CustomerEntity = {
      ...data,
      id: `cust_${crypto.randomUUID().slice(0, 8)}`,
      referenceNumber: ref,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.customers.push(newCustomer);

    // Initialize point account
    this.data.pointAccounts.push({
      id: `pt_acc_${crypto.randomUUID().slice(0, 8)}`,
      customerId: newCustomer.id,
      balance: 0,
      totalEarnedHistorical: 0,
      currentLevelId: 'lvl_bronze',
      updatedAt: new Date().toISOString(),
    });

    this.persist();
    return newCustomer;
  }

  updateCustomer(id: string, updates: Partial<CustomerEntity>): CustomerEntity | undefined {
    const cust = this.data.customers.find((c) => c.id === id);
    if (!cust) return undefined;
    Object.assign(cust, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return cust;
  }

  getAllCustomers(): Array<CustomerEntity & { user: UserEntity; card?: CardEntity; pointAccount?: PointAccountEntity }> {
    return this.data.customers.map((c) => {
      const user = this.findUserById(c.userId) || {
        id: c.userId,
        phone: 'غير متوفر',
        passwordHash: '',
        role: 'CUSTOMER' as const,
        status: 'ACTIVE' as const,
        failedLoginAttempts: 0,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      };
      const card = this.data.cards.find((card) => card.customerId === c.id);
      const pointAccount = this.data.pointAccounts.find((p) => p.customerId === c.id);
      return { ...c, user, card, pointAccount };
    });
  }

  getPendingApprovals() {
    const pendingCustomers = this.data.customers
      .filter((c) => {
        const u = this.findUserById(c.userId);
        return u && (u.status === 'PENDING' || u.status === 'REQUIRES_CHANGES');
      })
      .map((c) => {
        const user = this.findUserById(c.userId)!;
        const card = this.data.cards.find((card) => card.customerId === c.id);
        return { ...c, user, card };
      });

    const pendingBusinesses = this.data.businesses
      .filter((b) => {
        const u = this.findUserById(b.userId);
        return (u && u.status === 'PENDING') || b.status === 'PENDING';
      })
      .map((b) => {
        const user = this.findUserById(b.userId)!;
        return { ...b, user };
      });

    return {
      customers: pendingCustomers,
      businesses: pendingBusinesses,
      totalPending: pendingCustomers.length + pendingBusinesses.length,
    };
  }

  approveUser(userIdOrCustomerId: string, notes?: string, actorId?: string): { user: UserEntity; card?: CardEntity } {
    let user = this.findUserById(userIdOrCustomerId);
    let customer: CustomerEntity | undefined;
    if (!user) {
      customer = this.findCustomerById(userIdOrCustomerId);
      if (customer) user = this.findUserById(customer.userId);
    } else {
      customer = this.findCustomerByUserId(user.id);
    }

    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    user.status = 'APPROVED';
    this.persist();

    let card: CardEntity | undefined;
    if (customer) {
      const existingCard = this.findCardByCustomerId(customer.id);
      if (!existingCard) {
        card = this.issueCard({
          customerId: customer.id,
          notes: notes || 'تم تفعيل وإصدار الكارت بعد موافقة الإدارة',
          actorId: actorId || 'admin',
        });
      } else {
        existingCard.status = 'ACTIVE';
        card = existingCard;
        this.persist();
      }

      this.createNotification({
        userId: user.id,
        title: 'تمت الموافقة على طلبك بنجاح!',
        message: 'تمت الموافقة على طلبك وتفعيل كارتك الذكي بنجاح. يمكنك الآن استعراض كارتك واستخدامه في كافة المتاجر المعتمدة.',
        type: 'CARD_REQUEST',
        priority: 'HIGH',
        deepLink: '/card',
      });
    }

    this.recordAuditLog({
      actorId: actorId || 'admin',
      actorRole: 'ADMIN',
      action: 'USER_APPROVED',
      entity: 'USER',
      entityId: user.id,
      reason: notes || 'موافقة وتفعيل الحساب وإصدار الكارت',
    });

    return { user, card };
  }

  rejectUser(userIdOrCustomerId: string, reason?: string, actorId?: string): UserEntity {
    let user = this.findUserById(userIdOrCustomerId);
    let customer: CustomerEntity | undefined;
    if (!user) {
      customer = this.findCustomerById(userIdOrCustomerId);
      if (customer) user = this.findUserById(customer.userId);
    } else {
      customer = this.findCustomerByUserId(user.id);
    }

    if (!user) {
      throw new Error('المستخدم غير موجود');
    }

    user.status = 'REJECTED';
    if (customer) {
      customer.rejectionReason = reason || 'تم رفض الطلب بواسطة الإدارة';
    }
    this.persist();

    this.createNotification({
      userId: user.id,
      title: 'تحديث بشأن طلب العضوية',
      message: reason || 'نعتذر، لم تتم الموافقة على طلب التسجيل الخاص بك. يرجى مراجعة خدمة العملاء.',
      type: 'ADMIN_ALERT',
      priority: 'HIGH',
    });

    this.recordAuditLog({
      actorId: actorId || 'admin',
      actorRole: 'ADMIN',
      action: 'USER_REJECTED',
      entity: 'USER',
      entityId: user.id,
      reason: reason || 'رفض طلب التسجيل',
    });

    return user;
  }

  // ----------------------------------------------------
  // CARDS & QR METHODS
  // ----------------------------------------------------
  findCardById(id: string): CardEntity | undefined {
    return this.data.cards.find((c) => c.id === id);
  }

  findCardByCardNumber(cardNumber: string): CardEntity | undefined {
    return this.data.cards.find((c) => c.cardNumber.toUpperCase() === cardNumber.toUpperCase());
  }

  findCardByCardId(cardId: string): CardEntity | undefined {
    return this.data.cards.find((c) => c.cardId.toUpperCase() === cardId.toUpperCase());
  }

  findCardByQrId(qrId: string): CardEntity | undefined {
    return this.data.cards.find((c) => c.qrId === qrId);
  }

  findCardByCustomerId(customerId: string): CardEntity | undefined {
    return this.data.cards.find((c) => c.customerId === customerId);
  }

  getAllCards(): Array<CardEntity & { customer: CustomerEntity }> {
    return this.data.cards.map((c) => {
      const customer = this.findCustomerById(c.customerId)!;
      return { ...c, customer };
    });
  }

  issueCard(data: { customerId: string; notes?: string; actorId: string }): CardEntity {
    const customer = this.findCustomerById(data.customerId);
    if (!customer) throw new Error('العميل غير موجود');

    // Check if customer already has active card
    const existing = this.findCardByCustomerId(data.customerId);
    if (existing && existing.status === 'ACTIVE') {
      throw new Error('العميل يمتلك بالفعل كارتاً نشطاً مسجلاً في النظام');
    }

    const seq = (this.data.cards.length + 1000).toString();
    const year = new Date().getFullYear();
    const cardNumber = `SUGAR-${seq.slice(-4)}-${year}`;
    const cardId = `CRD-${seq}`;
    const qrId = `QR-SUGAR-${seq}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const validityDays = parseInt(this.getSettingValue('card_validity_days', '365'), 10);
    const expiryDate = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000).toISOString();

    const newCard: CardEntity = {
      id: `crd_${crypto.randomUUID().slice(0, 8)}`,
      cardId,
      qrId,
      cardNumber,
      customerId: data.customerId,
      status: 'ACTIVE',
      issueDate: new Date().toISOString(),
      expiryDate,
      notes: data.notes || 'كارت بلاستيكي ذكي صادر ومعتمد',
      designConfig: {
        theme: 'premium_dark',
        showQr: true,
        cardNumberPosition: 'bottom-right',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.data.cards.push(newCard);

    // Record card history
    this.data.cardHistory.push({
      id: `ch_${crypto.randomUUID().slice(0, 8)}`,
      cardId: newCard.id,
      action: 'ISSUE',
      reason: 'إصدار كارت بلاستيكي جديد للعميل',
      actorId: data.actorId,
      timestamp: new Date().toISOString(),
    });

    // Notify customer
    this.createNotification({
      userId: customer.userId,
      title: 'تم إصدار كارتك البلاستيكي بنجاح',
      message: `تم إصدار كارتك برقم: ${cardNumber}. يمكنك استعراضه وتنزيل الـ QR الخاص بك الآن.`,
      type: 'CARD_REQUEST',
      priority: 'HIGH',
      deepLink: '/card',
    });

    this.persist();
    return newCard;
  }

  updateCardStatus(cardId: string, status: CardStatus, reason: string, actorId: string): CardEntity {
    const card = this.findCardById(cardId);
    if (!card) throw new Error('الكارت غير موجود');

    const previousStatus = card.status;
    card.status = status;
    card.updatedAt = new Date().toISOString();

    let action: CardAction = 'SUSPEND';
    if (status === 'BLOCKED') action = 'BLOCK';
    else if (status === 'ACTIVE') action = 'ASSIGN';

    this.data.cardHistory.push({
      id: `ch_${crypto.randomUUID().slice(0, 8)}`,
      cardId: card.id,
      action,
      reason,
      actorId,
      timestamp: new Date().toISOString(),
      metadata: { previousStatus, newStatus: status },
    });

    this.recordAuditLog({
      actorId,
      actorRole: 'ADMIN',
      action: `CARD_${status}`,
      entity: 'CARD',
      entityId: card.id,
      before: { status: previousStatus },
      after: { status },
      reason,
    });

    this.persist();
    return card;
  }

  // ----------------------------------------------------
  // POINTS & LEDGER
  // ----------------------------------------------------
  getPointAccount(customerId: string): PointAccountEntity {
    let account = this.data.pointAccounts.find((p) => p.customerId === customerId);
    if (!account) {
      account = {
        id: `pt_acc_${crypto.randomUUID().slice(0, 8)}`,
        customerId,
        balance: 0,
        totalEarnedHistorical: 0,
        currentLevelId: 'lvl_bronze',
        updatedAt: new Date().toISOString(),
      };
      this.data.pointAccounts.push(account);
      this.persist();
    }
    return account;
  }

  getPointLedger(customerId: string): PointLedgerEntity[] {
    return this.data.pointLedger
      .filter((l) => l.customerId === customerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Add ledger entry with transaction guarantee & level recalculation
  addPointLedgerEntry(data: {
    customerId: string;
    type: PointLedgerType;
    points: number;
    actorId: string;
    reason?: string;
    referenceId?: string;
    expiresAt?: string | null;
  }): PointLedgerEntity {
    const account = this.getPointAccount(data.customerId);

    // Negative balance check:
    // If spending, check if current balance is negative or if deduction will exceed allowed
    if (data.type === 'SPEND' && account.balance < Math.abs(data.points)) {
      throw new Error(`رصيد النقاط غير كافٍ. الرصيد الحالي: ${account.balance} نقطة، والمطلوب: ${Math.abs(data.points)} نقطة.`);
    }

    const previousBalance = account.balance;
    account.balance += data.points;

    if (data.type === 'EARN' && data.points > 0) {
      account.totalEarnedHistorical += data.points;
    }

    // Recalculate Loyalty Level
    const silverThreshold = parseInt(this.getSettingValue('silver_level_threshold', '300'), 10);
    const goldThreshold = parseInt(this.getSettingValue('gold_level_threshold', '1000'), 10);
    const platinumThreshold = parseInt(this.getSettingValue('platinum_level_threshold', '2500'), 10);

    let newLevel = 'lvl_bronze';
    if (account.totalEarnedHistorical >= platinumThreshold) newLevel = 'lvl_platinum';
    else if (account.totalEarnedHistorical >= goldThreshold) newLevel = 'lvl_gold';
    else if (account.totalEarnedHistorical >= silverThreshold) newLevel = 'lvl_silver';

    account.currentLevelId = newLevel;
    account.updatedAt = new Date().toISOString();

    const txId = `TX-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const ledgerEntry: PointLedgerEntity = {
      id: `led_${crypto.randomUUID().slice(0, 8)}`,
      customerId: data.customerId,
      transactionId: txId,
      type: data.type,
      points: data.points,
      balanceAfter: account.balance,
      actorId: data.actorId,
      reason: data.reason,
      referenceId: data.referenceId,
      expiresAt: data.expiresAt,
      createdAt: new Date().toISOString(),
    };

    this.data.pointLedger.push(ledgerEntry);
    this.persist();
    return ledgerEntry;
  }

  // ----------------------------------------------------
  // TRANSACTIONS & SCANNING (Idempotent, Server Authoritative)
  // ----------------------------------------------------
  createPurchaseTransaction(data: {
    cardId: string;
    businessId: string;
    employeeId?: string;
    amount: number;
    idempotencyKey: string;
  }): { transaction: TransactionEntity; pointsAwarded: number } {
    // Idempotency check:
    const existing = this.data.transactions.find((t) => t.idempotencyKey === data.idempotencyKey);
    if (existing) {
      return { transaction: existing, pointsAwarded: existing.pointsAwarded };
    }

    // Card verification
    const card = this.findCardById(data.cardId) || this.findCardByCardNumber(data.cardId) || this.findCardByQrId(data.cardId);
    if (!card) {
      throw new Error('الكارت غير موجود أو رقم الكارت غير صالح');
    }
    if (card.status !== 'ACTIVE') {
      throw new Error(`الكارت غير نشط (الحالة الحالية: ${card.status}). لا يمكن تسجيل عمليات شراء.`);
    }

    // Business verification
    const business = this.findBusinessById(data.businessId);
    if (!business || business.status !== 'ACTIVE') {
      throw new Error('النشاط التجاري غير معتمد أو معلق حالياً');
    }

    // Expiry check
    if (new Date(card.expiryDate).getTime() < Date.now()) {
      card.status = 'EXPIRED';
      this.persist();
      throw new Error('انتهت صلاحية الكارت. يرجى من العميل طلب تجديد الكارت.');
    }

    // Points calculation - server authoritative
    const defaultPoints = parseInt(this.getSettingValue('points_per_purchase', '10'), 10);
    const pointsAwarded = defaultPoints;

    const txNumber = `TX-PURCHASE-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
    const transaction: TransactionEntity = {
      id: `trx_${crypto.randomUUID().slice(0, 8)}`,
      transactionId: txNumber,
      idempotencyKey: data.idempotencyKey,
      cardId: card.id,
      businessId: business.id,
      employeeId: data.employeeId,
      customerId: card.customerId,
      amount: data.amount,
      pointsAwarded,
      isReversed: false,
      createdAt: new Date().toISOString(),
    };

    this.data.transactions.push(transaction);

    // Update last scan timestamp
    card.lastScanAt = new Date().toISOString();

    // 6 months points expiry
    const expiryMonths = parseInt(this.getSettingValue('points_expiry_months', '6'), 10);
    const expiresAt = new Date(Date.now() + expiryMonths * 30 * 24 * 60 * 60 * 1000).toISOString();

    // Add points to ledger
    this.addPointLedgerEntry({
      customerId: card.customerId,
      type: 'EARN',
      points: pointsAwarded,
      actorId: data.employeeId || business.userId,
      reason: `عملية شراء مؤكدة لدى ${business.businessName}`,
      referenceId: transaction.id,
      expiresAt,
    });

    // Notify customer
    const customer = this.findCustomerById(card.customerId);
    if (customer) {
      this.createNotification({
        userId: customer.userId,
        title: 'تمت إضافة نقاط جديدة لحسابك!',
        message: `حصلت على ${pointsAwarded} نقطة من ${business.businessName}. رصيدك الجديد في أمان.`,
        type: 'POINTS_EARNED',
        priority: 'MEDIUM',
        deepLink: '/points',
      });
    }

    this.persist();
    return { transaction, pointsAwarded };
  }

  // ----------------------------------------------------
  // BUSINESS & EMPLOYEES METHODS
  // ----------------------------------------------------
  findBusinessById(id: string): BusinessEntity | undefined {
    return this.data.businesses.find((b) => b.id === id);
  }

  findBusinessByUserId(userId: string): BusinessEntity | undefined {
    return this.data.businesses.find((b) => b.userId === userId);
  }

  createBusiness(data: Omit<BusinessEntity, 'id' | 'isListed' | 'status' | 'ratingAvg' | 'ratingCount' | 'createdAt' | 'updatedAt'>): BusinessEntity {
    const newBusiness: BusinessEntity = {
      ...data,
      id: `biz_${crypto.randomUUID().slice(0, 8)}`,
      isListed: false, // Must be approved and listed by Admin
      status: 'PENDING',
      ratingAvg: 0,
      ratingCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.businesses.push(newBusiness);
    this.persist();
    return newBusiness;
  }

  updateBusiness(id: string, updates: Partial<BusinessEntity>): BusinessEntity | undefined {
    const business = this.data.businesses.find((b) => b.id === id);
    if (!business) return undefined;
    Object.assign(business, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return business;
  }

  getAllBusinesses(): BusinessEntity[] {
    return this.data.businesses;
  }

  getListedBusinesses(): BusinessEntity[] {
    return this.data.businesses.filter((b) => b.status === 'ACTIVE' && b.isListed === true);
  }

  findEmployeeById(id: string): EmployeeEntity | undefined {
    return this.data.employees.find((e) => e.id === id);
  }

  findEmployeeByUserId(userId: string): EmployeeEntity | undefined {
    return this.data.employees.find((e) => e.userId === userId);
  }

  getEmployeesByBusinessId(businessId: string): EmployeeEntity[] {
    return this.data.employees.filter((e) => e.businessId === businessId);
  }

  createEmployee(data: Omit<EmployeeEntity, 'id' | 'createdAt' | 'updatedAt'>): EmployeeEntity {
    const newEmp: EmployeeEntity = {
      ...data,
      id: `emp_${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.employees.push(newEmp);
    this.persist();
    return newEmp;
  }

  // ----------------------------------------------------
  // SERVICES & REQUESTS
  // ----------------------------------------------------
  getSectors(): SectorEntity[] {
    return this.data.sectors;
  }

  getServices(sectorId?: string): ServiceEntity[] {
    if (sectorId) return this.data.services.filter((s) => s.sectorId === sectorId && s.isActive);
    return this.data.services.filter((s) => s.isActive);
  }

  findServiceById(id: string): ServiceEntity | undefined {
    return this.data.services.find((s) => s.id === id);
  }

  createServiceRequest(data: { customerId: string; serviceId: string; customerNotes?: string }): ServiceRequestEntity {
    const seq = this.data.serviceRequests.length + 1;
    const requestNumber = `REQ-${new Date().getFullYear()}-${seq.toString().padStart(4, '0')}`;
    const req: ServiceRequestEntity = {
      id: `sr_${crypto.randomUUID().slice(0, 8)}`,
      requestNumber,
      customerId: data.customerId,
      serviceId: data.serviceId,
      status: 'NEW',
      customerNotes: data.customerNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.serviceRequests.push(req);
    this.persist();
    return req;
  }

  getServiceRequests(customerId?: string): ServiceRequestEntity[] {
    if (customerId) return this.data.serviceRequests.filter((r) => r.customerId === customerId);
    return this.data.serviceRequests;
  }

  // ----------------------------------------------------
  // OFFERS METHODS
  // ----------------------------------------------------
  getOffers(status?: OfferStatus): OfferEntity[] {
    if (status) return this.data.offers.filter((o) => o.status === status);
    return this.data.offers;
  }

  getActiveOffers(): Array<OfferEntity & { business: BusinessEntity }> {
    return this.data.offers
      .filter((o) => o.status === 'ACTIVE' && new Date(o.endDate).getTime() > Date.now())
      .map((o) => {
        const business = this.findBusinessById(o.businessId)!;
        return { ...o, business };
      });
  }

  toggleFollowBusiness(customerId: string, businessId: string): { isFollowing: boolean } {
    const index = this.data.follows.findIndex((f) => f.customerId === customerId && f.businessId === businessId);
    if (index >= 0) {
      this.data.follows.splice(index, 1);
      this.persist();
      return { isFollowing: false };
    } else {
      this.data.follows.push({
        id: `fol_${crypto.randomUUID().slice(0, 8)}`,
        customerId,
        businessId,
        createdAt: new Date().toISOString(),
      });
      this.persist();
      return { isFollowing: true };
    }
  }

  getCustomerFollows(customerId: string): string[] {
    return this.data.follows.filter((f) => f.customerId === customerId).map((f) => f.businessId);
  }

  isCustomerFollowing(customerId: string, businessId: string): boolean {
    return this.data.follows.some((f) => f.customerId === customerId && f.businessId === businessId);
  }

  findOfferById(id: string): OfferEntity | undefined {
    return this.data.offers.find((o) => o.id === id);
  }

  createOffer(data: Omit<OfferEntity, 'id' | 'status' | 'createdAt' | 'updatedAt'>): OfferEntity {
    const offer: OfferEntity = {
      ...data,
      id: `off_${crypto.randomUUID().slice(0, 8)}`,
      status: 'ACTIVE', // Auto active or PENDING - let's make it ACTIVE so followers get instant notification immediately!
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.offers.push(offer);

    // Notify all customers following this business
    const business = this.findBusinessById(data.businessId);
    if (business) {
      const followers = this.data.follows.filter((f) => f.businessId === business.id);
      for (const fol of followers) {
        const customer = this.findCustomerById(fol.customerId);
        if (customer) {
          this.createNotification({
            userId: customer.userId,
            title: `عرض خاص جديد من ${business.businessName}!`,
            message: `أضاف المتجر الذي تتابعه (${business.businessName}) عرضاً جديداً: "${offer.title}" - خصم ${offer.discount}${offer.discountType === 'PERCENTAGE' ? '%' : ' ج.م'}.`,
            type: 'OFFER',
            priority: 'HIGH',
            deepLink: '/offers',
          });
        }
      }
    }

    this.persist();
    return offer;
  }

  updateOfferStatus(offerId: string, status: OfferStatus, rejectReason?: string): OfferEntity {
    const offer = this.findOfferById(offerId);
    if (!offer) throw new Error('العرض غير موجود');
    offer.status = status;
    if (rejectReason) offer.rejectReason = rejectReason;
    offer.updatedAt = new Date().toISOString();
    this.persist();
    return offer;
  }

  // ----------------------------------------------------
  // STORE & ORDERS (Immutable snapshots, strict payment type)
  // ----------------------------------------------------
  getProductCategories() {
    return this.data.productCategories;
  }

  getProducts(filter?: { paymentType?: PaymentType; categoryId?: string; status?: ProductStatus }): ProductEntity[] {
    return this.data.products.filter((p) => {
      if (filter?.paymentType && p.paymentType !== filter.paymentType) return false;
      if (filter?.categoryId && p.categoryId !== filter.categoryId) return false;
      if (filter?.status && p.status !== filter.status) return false;
      return p.status === 'ACTIVE';
    });
  }

  findProductById(id: string): ProductEntity | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  createProduct(data: Omit<ProductEntity, 'id' | 'createdAt' | 'updatedAt'>): ProductEntity {
    const product: ProductEntity = {
      ...data,
      id: `prd_${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.products.push(product);
    this.persist();
    return product;
  }

  updateProduct(id: string, updates: Partial<ProductEntity>): ProductEntity | undefined {
    const prd = this.findProductById(id);
    if (!prd) return undefined;
    Object.assign(prd, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return prd;
  }

  createOrder(data: {
    customerId: string;
    paymentType: PaymentType;
    items: Array<{ productId: string; quantity: number }>;
    deliveryAddress: OrderEntity['deliveryAddress'];
  }): OrderEntity {
    const customer = this.findCustomerById(data.customerId);
    if (!customer) throw new Error('العميل غير موجود');

    if (!data.items || data.items.length === 0) {
      throw new Error('السلة فارغة. يرجى إضافة منتجات قبل إتمام الطلب.');
    }

    // Verify all items belong to selected payment type (no mixed cash + points)
    const snapshots: OrderItemSnapshot[] = [];
    let subtotalCash = 0;
    let subtotalPoints = 0;

    for (const item of data.items) {
      const product = this.findProductById(item.productId);
      if (!product || product.status !== 'ACTIVE') {
        throw new Error(`المنتج ${item.productId} غير متاح حالياً`);
      }
      if (product.paymentType !== data.paymentType) {
        throw new Error('لا يمكن خلط المنتجات النقدية مع منتجات النقاط في نفس السلة');
      }
      if (product.inventory < item.quantity) {
        throw new Error(`الكمية المطلوبة من "${product.name}" غير متوفرة في المخزون (المتبقي: ${product.inventory})`);
      }

      // Deduct inventory
      product.inventory -= item.quantity;
      if (product.inventory === 0) product.status = 'OUT_OF_STOCK';

      snapshots.push({
        productId: product.id,
        productName: product.name,
        productImage: product.images[0],
        quantity: item.quantity,
        unitPriceCash: product.cashPrice,
        unitPricePoints: product.pointsPrice,
      });

      subtotalCash += product.cashPrice * item.quantity;
      subtotalPoints += product.pointsPrice * item.quantity;
    }

    // Delivery fee from governorate
    const gov = this.data.governorates.find((g) => g.nameAr === data.deliveryAddress.governorate);
    const deliveryFee = gov?.available ? gov.deliveryFee : 50;

    // Points handling
    if (data.paymentType === 'POINTS') {
      const account = this.getPointAccount(customer.id);
      if (account.balance < subtotalPoints) {
        throw new Error(`رصيدك الحالي (${account.balance} نقطة) لا يكفي لإتمام الطلب بقيمة ${subtotalPoints} نقطة`);
      }
      // Reserve/deduct points
      this.addPointLedgerEntry({
        customerId: customer.id,
        type: 'SPEND',
        points: -subtotalPoints,
        actorId: customer.userId,
        reason: 'طلب منتجات من متجر Sugar Business',
      });
    }

    const seq = this.data.orders.length + 1;
    const orderNumber = `ORD-${new Date().getFullYear()}-${seq.toString().padStart(4, '0')}`;
    const now = new Date().toISOString();

    const order: OrderEntity = {
      id: `ord_${crypto.randomUUID().slice(0, 8)}`,
      orderNumber,
      customerId: customer.id,
      paymentType: data.paymentType,
      status: 'PENDING',
      subtotalCash,
      subtotalPoints,
      deliveryFee,
      totalCash: data.paymentType === 'CASH' ? subtotalCash + deliveryFee : deliveryFee, // cash delivery for points order
      totalPoints: subtotalPoints,
      deliveryAddress: data.deliveryAddress,
      statusTimeline: [
        {
          status: 'PENDING',
          timestamp: now,
          note: data.paymentType === 'POINTS' ? 'تم استلام الطلب وحجز النقاط بنجاح' : 'تم استلام طلب الشراء والدفع عند الاستلام (COD)',
        },
      ],
      items: snapshots,
      createdAt: now,
      updatedAt: now,
    };

    this.data.orders.push(order);

    // Notify customer
    this.createNotification({
      userId: customer.userId,
      title: 'تم استلام طلبك بنجاح',
      message: `تم تسجيل طلبك رقم ${orderNumber}. سنقوم بإشعارك فور خروج الشحنة.`,
      type: 'ORDER_STATUS',
      priority: 'MEDIUM',
      deepLink: `/orders/${order.id}`,
    });

    this.persist();
    return order;
  }

  getOrders(customerId?: string): OrderEntity[] {
    if (customerId) return this.data.orders.filter((o) => o.customerId === customerId);
    return this.data.orders;
  }

  findOrderById(id: string): OrderEntity | undefined {
    return this.data.orders.find((o) => o.id === id);
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus, note?: string): OrderEntity {
    const order = this.findOrderById(orderId);
    if (!order) throw new Error('الطلب غير موجود');

    order.status = newStatus;
    order.statusTimeline.push({
      status: newStatus,
      timestamp: new Date().toISOString(),
      note,
    });
    order.updatedAt = new Date().toISOString();

    // If order was cancelled and was paid by points, release points back
    if (newStatus === 'CANCELLED' && order.paymentType === 'POINTS') {
      this.addPointLedgerEntry({
        customerId: order.customerId,
        type: 'RELEASE',
        points: order.totalPoints,
        actorId: 'SYSTEM',
        reason: `إرجاع نقاط الطلب الملغي رقم ${order.orderNumber}`,
      });
    }

    this.persist();
    return order;
  }

  // ----------------------------------------------------
  // NOTIFICATIONS METHODS
  // ----------------------------------------------------
  createNotification(data: Omit<NotificationEntity, 'id' | 'isRead' | 'isHidden' | 'createdAt'>): NotificationEntity {
    const notif: NotificationEntity = {
      ...data,
      id: `notif_${crypto.randomUUID().slice(0, 8)}`,
      isRead: false,
      isHidden: false,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.push(notif);
    this.persist();
    return notif;
  }

  getUserNotifications(userId: string): NotificationEntity[] {
    return this.data.notifications
      .filter((n) => n.userId === userId && !n.isHidden)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  markNotificationRead(id: string): void {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.persist();
    }
  }

  markAllNotificationsRead(userId: string): void {
    for (const notif of this.data.notifications) {
      if (notif.userId === userId) notif.isRead = true;
    }
    this.persist();
  }

  hideNotification(id: string): void {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isHidden = true;
      this.persist();
    }
  }

  // ----------------------------------------------------
  // NEWS, FAQ, SUPPORT, CMS
  // ----------------------------------------------------
  getNews(): NewsEntity[] {
    return this.data.news.filter((n) => n.status === 'PUBLISHED');
  }

  findNewsById(id: string): NewsEntity | undefined {
    return this.data.news.find((n) => n.id === id);
  }

  addNewsComment(newsId: string, userName: string, comment: string): void {
    const article = this.findNewsById(newsId);
    if (!article) throw new Error('المقال غير موجود');
    article.comments.push({
      id: `comm_${crypto.randomUUID().slice(0, 8)}`,
      userName,
      comment,
      isApproved: true, // auto or admin approved
      createdAt: new Date().toISOString(),
    });
    this.persist();
  }

  getFAQs(): FAQEntity[] {
    return this.data.faqs.filter((f) => f.isVisible).sort((a, b) => a.order - b.order);
  }

  createSupportTicket(data: Omit<SupportTicketEntity, 'id' | 'ticketNumber' | 'status' | 'messages' | 'createdAt' | 'updatedAt'> & { initialMessage: string }): SupportTicketEntity {
    const seq = this.data.supportTickets.length + 100;
    const ticketNumber = `SUP-${new Date().getFullYear()}-${seq}`;
    const now = new Date().toISOString();
    const ticket: SupportTicketEntity = {
      id: `tkt_${crypto.randomUUID().slice(0, 8)}`,
      ticketNumber,
      customerId: data.customerId,
      name: data.name,
      phone: data.phone,
      email: data.email,
      subject: data.subject,
      category: data.category,
      status: 'NEW',
      messages: [
        {
          id: `msg_${crypto.randomUUID().slice(0, 8)}`,
          sender: 'CUSTOMER',
          senderName: data.name,
          message: data.initialMessage,
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
    this.data.supportTickets.push(ticket);
    this.persist();
    return ticket;
  }

  getSupportTickets(customerId?: string): SupportTicketEntity[] {
    if (customerId) return this.data.supportTickets.filter((t) => t.customerId === customerId);
    return this.data.supportTickets;
  }

  addSupportMessage(ticketId: string, sender: 'CUSTOMER' | 'SUPPORT', senderName: string, message: string): SupportTicketEntity {
    const ticket = this.data.supportTickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error('تذكرة الدعم غير موجودة');

    ticket.messages.push({
      id: `msg_${crypto.randomUUID().slice(0, 8)}`,
      sender,
      senderName,
      message,
      timestamp: new Date().toISOString(),
    });

    if (sender === 'CUSTOMER') ticket.status = 'WAITING_REPLY';
    else ticket.status = 'IN_PROGRESS';

    ticket.updatedAt = new Date().toISOString();
    this.persist();
    return ticket;
  }

  getDiscountServices(governorateId?: string): DiscountServiceEntity[] {
    if (governorateId) return this.data.discountServices.filter((s) => s.governorateId === governorateId);
    return this.data.discountServices;
  }

  getAllDiscountServices(): DiscountServiceEntity[] {
    return this.data.discountServices;
  }

  createDiscountService(data: Omit<DiscountServiceEntity, 'id' | 'createdAt' | 'updatedAt'>): DiscountServiceEntity {
    const service: DiscountServiceEntity = {
      ...data,
      id: `svc_${crypto.randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.discountServices.push(service);
    this.persist();
    return service;
  }

  updateDiscountService(id: string, updates: Partial<DiscountServiceEntity>): DiscountServiceEntity | undefined {
    const service = this.data.discountServices.find((s) => s.id === id);
    if (!service) return undefined;
    Object.assign(service, updates, { updatedAt: new Date().toISOString() });
    this.persist();
    return service;
  }

  deleteDiscountService(id: string): boolean {
    const index = this.data.discountServices.findIndex((s) => s.id === id);
    if (index === -1) return false;
    this.data.discountServices.splice(index, 1);
    this.persist();
    return true;
  }

  getCMSPage(slug: string): CMSPageEntity | undefined {
    return this.data.cmsPages.find((p) => p.slug === slug);
  }

  getAllCMSPages(): CMSPageEntity[] {
    return this.data.cmsPages;
  }

  upsertCMSPage(
    data: { slug: string; title: string; content: string; metaTitle?: string; metaDesc?: string; status?: 'DRAFT' | 'PUBLISHED' },
    actorId: string = 'usr_super_admin_01'
  ): CMSPageEntity {
    let page = this.data.cmsPages.find((p) => p.slug === data.slug);
    const now = new Date().toISOString();
    if (page) {
      const before = { ...page };
      page.title = data.title;
      page.content = data.content;
      if (data.metaTitle !== undefined) page.metaTitle = data.metaTitle;
      if (data.metaDesc !== undefined) page.metaDesc = data.metaDesc;
      if (data.status) page.status = data.status;
      page.version += 1;
      page.updatedAt = now;

      this.recordAuditLog({
        actorId,
        actorRole: 'ADMIN',
        action: 'UPDATE_CMS_PAGE',
        entity: 'CMS_PAGE',
        entityId: page.id,
        before,
        after: page,
        reason: `تعديل محتوى الصفحة ${page.title} (${page.slug})`,
      });
    } else {
      page = {
        id: `cms_${crypto.randomUUID().slice(0, 8)}`,
        slug: data.slug,
        title: data.title,
        content: data.content,
        metaTitle: data.metaTitle || data.title,
        metaDesc: data.metaDesc || data.title,
        version: 1,
        status: data.status || 'PUBLISHED',
        updatedAt: now,
      };
      this.data.cmsPages.push(page);

      this.recordAuditLog({
        actorId,
        actorRole: 'ADMIN',
        action: 'CREATE_CMS_PAGE',
        entity: 'CMS_PAGE',
        entityId: page.id,
        after: page,
        reason: `إضافة صفحة محتوى جديدة ${page.title}`,
      });
    }

    this.persist();
    return page;
  }

  // ----------------------------------------------------
  // SETTINGS & AUDIT
  // ----------------------------------------------------
  getSettings(): SettingEntity[] {
    return this.data.settings;
  }

  getSettingValue(key: string, defaultValue: string): string {
    const s = this.data.settings.find((item) => item.key === key);
    return s ? s.value : defaultValue;
  }

  updateSetting(key: string, value: string, updatedBy?: string): SettingEntity {
    const s = this.data.settings.find((item) => item.key === key);
    if (!s) throw new Error('الإعداد غير موجود');
    const before = s.value;
    s.value = value;
    s.updatedAt = new Date().toISOString();
    s.updatedBy = updatedBy;

    this.recordAuditLog({
      actorId: updatedBy || 'SYSTEM',
      actorRole: 'ADMIN',
      action: 'UPDATE_SETTING',
      entity: 'SETTING',
      entityId: key,
      before: { value: before },
      after: { value },
      reason: `تحديث قيمة الإعداد ${key}`,
    });

    this.persist();
    return s;
  }

  recordAuditLog(log: Omit<AuditLogEntity, 'id' | 'timestamp'>): AuditLogEntity {
    const entry: AuditLogEntity = {
      ...log,
      id: `aud_${crypto.randomUUID().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(entry);
    this.persist();
    return entry;
  }

  getAuditLogs(limit = 100): AuditLogEntity[] {
    return this.data.auditLogs.slice(0, limit);
  }

  getGovernorates(): GovernorateEntity[] {
    return this.data.governorates;
  }

  getJobs() {
    return this.data.jobs;
  }

  runJob(jobId: string) {
    const job = this.data.jobs.find((j) => j.id === jobId);
    if (!job) throw new Error('المهمة غير موجودة');

    job.status = 'RUNNING';
    job.lastRun = new Date().toISOString();
    job.runCount += 1;

    // Simulate safe execution logic
    if (jobId === 'job_points_expiry') {
      // Check expired points
      const now = Date.now();
      let expiredCount = 0;
      for (const entry of this.data.pointLedger) {
        if (entry.expiresAt && new Date(entry.expiresAt).getTime() < now && entry.points > 0) {
          // expired
          expiredCount++;
        }
      }
    } else if (jobId === 'job_offers_cleanup') {
      const now = Date.now();
      for (const off of this.data.offers) {
        if (off.status === 'ACTIVE' && new Date(off.endDate).getTime() < now) {
          off.status = 'EXPIRED';
        }
      }
    }

    job.status = 'IDLE';
    this.persist();
    return { success: true, message: `تم تشغيل المهمة "${job.name}" بنجاح وتحديث السجلات.` };
  }

  // ----------------------------------------------------
  // METRICS & SYSTEM HEALTH
  // ----------------------------------------------------
  getSystemMetrics() {
    const totalCustomers = this.data.customers.length;
    const activeCards = this.data.cards.filter((c) => c.status === 'ACTIVE').length;
    const totalBusinesses = this.data.businesses.length;
    const listedBusinesses = this.data.businesses.filter((b) => b.isListed).length;
    const totalOrders = this.data.orders.length;
    const totalPointsAwarded = this.data.pointLedger
      .filter((l) => l.type === 'EARN')
      .reduce((sum, l) => sum + l.points, 0);

    return {
      totalCustomers,
      activeCards,
      totalBusinesses,
      listedBusinesses,
      totalOrders,
      totalPointsAwarded,
      pendingApprovals: {
        customers: this.data.users.filter((u) => u.role === 'CUSTOMER' && u.status === 'PENDING').length,
        businesses: this.data.businesses.filter((b) => b.status === 'PENDING').length,
        offers: this.data.offers.filter((o) => o.status === 'PENDING').length,
      },
    };
  }
}

export const db = new SugarDatabase();
