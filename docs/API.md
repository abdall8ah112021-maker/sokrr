# Sugar Business — REST API v1 Reference

All endpoints are prefixed with `/api/v1`.

### 1. Authentication (`/api/v1/auth`)
- `POST /auth/register-customer`: تسجيل عميل جديد مع إنشاء كارت فوري.
- `POST /auth/register-business`: تسجيل منشأة تجارية مع إحالة الطلب للمراجعة.
- `POST /auth/login`: تسجيل الدخول بالهاتف وكلمة المرور مع قفل الحساب 5 دقائق عند تجاوز 5 محاولات.
- `POST /auth/refresh`: تجديد التوكن باستخدام Refresh Token.
- `GET /auth/me`: جلب بيانات المستخدم والكارت ورصيد النقاط الحالي.

### 2. Cards & QR (`/api/v1/cards`)
- `GET /cards/my-card`: استرجاع كارت العميل المسجل مع رمز الـ QR.
- `POST /cards/resolve-qr`: فحص رمز QR أو رقم الكارت واسترجاع حالة الكارت والعميل.
- `GET /cards`: (Admin) جلب كافة الكروت الصادرة في المنظومة.
- `POST /cards/issue`: (Admin) إصدار كارت بلاستيكي جديد للعميل.
- `PUT /cards/:id/status`: (Admin) تعديل حالة الكارت (Active, Suspended, Blocked).

### 3. Points & Ledger (`/api/v1/points`)
- `GET /points/my-points`: جلب رصيد النقاط وسجل دفتر الأستاذ للعميل.
- `POST /points/adjust`: (Super Admin فقط) تعديل يدوي للنقاط مع إلزامية إدخال السبب والتوثيق الرقابي.

### 4. Transactions (`/api/v1/transactions`)
- `POST /transactions/purchase`: مسح الكارت بواسطة التاجر أو الكاشير وتأكيد الشراء وإضافة النقاط فورياً بحماية Idempotency Key.

### 5. Businesses (`/api/v1/businesses`)
- `GET /businesses/directory`: جلب المتاجر المعتمدة والمعروضة للجمهور.
- `GET /businesses/:id`: جلب تفاصيل متجر محدد وعروضه.
- `PUT /businesses/:id/status`: (Admin) اعتماد المتجر أو تعديل إدراجه في الدليل.

### 6. Store & Orders (`/api/v1/store`, `/api/v1/orders`)
- `GET /store/products`: جلب المنتجات مع تصفية نوع الدفع (CASH أو POINTS).
- `GET /store/products/:id`: تفاصيل المنتج والمخزون.
- `POST /orders`: تأكيد الطلب مع لقطة تاريخية للمنتجات وحساب رسوم التوصيل حسب المحافظة.
- `GET /orders/my-orders`: جلب طلبات العميل الحالية والسابقة.
- `POST /orders/:id/cancel`: إلغاء الطلب قبل مرحلة التجهيز مع إرجاع النقاط تلقائياً.

### 7. Support & Tickets (`/api/v1/support`)
- `GET /support/tickets`: استعراض التذاكر المفتوحة.
- `POST /support/tickets`: فتح تذكرة دعم فني جديدة.
- `POST /support/tickets/:id/messages`: إرسال رسالة في خيط التذكرة.
- `GET /faqs`: جلب الأسئلة الشائعة.

### 8. Admin & Jobs (`/api/v1/admin`, `/api/v1/health`)
- `GET /admin/metrics`: إحصائيات النظام ومؤشرات الـ KPIs.
- `GET /admin/settings` & `PUT /admin/settings/:key`: قراءة وتحديث إعدادات النظام.
- `GET /admin/jobs` & `POST /admin/jobs/:id/run`: فحص وتشغيل المهام المجدولة يدوياً.
- `GET /admin/audit-logs`: استعراض سجل التدقيق الرقابي.
- `GET /health`: فحص حالة الخدمات (API, Database, Redis, Storage, Queues).
