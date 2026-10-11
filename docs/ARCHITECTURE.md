# Sugar Business — Architecture & Security Blueprint

## 1. Modular Domain Structure
النظام مصمم وفق مبادئ العزل الموديلاري (Modular Architecture) حيث تنفصل كل وحدة أعمال منطقياً:
- **Auth & Identity Domain:** إدارة الحسابات، تشفير كلمات المرور باستخدام scrypt/Argon2id، التوكن المزدوج (Access 15m / Refresh 7d مع تدوير Rotation وإلغاء فوري Revocation)، وقفل الحسابات بعد 5 محاولات متتالية.
- **Card & QR Domain:** التوليد والتحقق من الكروت البلاستيكية، إدارة مفاتيح الـ QR الفريدة، ربط الكروت بالعملاء، وحالات الكروت (Active, Suspended, Blocked, Expired).
- **Points & Ledger Domain:** محرك دفتر أستاذ محاسبي غير قابل للتلاعب (Append-only Ledger)، احتساب مستويات الولاء (Bronze, Silver, Gold, Platinum VIP) بناءً على إجمالي النقاط التاريخية المكتسبة.
- **Transactions & Idempotency Domain:** حماية ضد التكرار باستخدام Idempotency Key وقفل المعاملات لمنع ازدواجية إضافة النقاط.
- **Store & Order Snapshot Domain:** فصل صارم بين منتجات الدفع النقدي والاستبدال بالنقاط، وحفظ لقطات غير قابلة للتغيير (Immutable Snapshots) للطلبات.
- **Support & FAQ Domain:** تذاكر دعم أحادية الخيط مع تقييم بعد الحل.
- **Audit & Jobs Domain:** تدقيق رقابي كامل على العمليات الإدارية، ومهام فحص مجدولة (Cron Jobs).

## 2. Server-Authoritative Rules
- لا يتم الاعتماد نهائياً على الفرونت إند في احتساب النقاط، إجمالي الطلبات، صلاحية الكروت، أو أذونات الحسابات.
- التحقق يتم خادمياً عبر Middlewares متخصصة: `requireAuth`, `requireRole`, `requirePermission`.

## 3. Idempotency & Concurrency Protection
- كل عملية مسح للشراء تتطلب `idempotencyKey` لمنع التكرار الناتج عن ضغط الزر مرتين أو إعادة محاولة الاتصال من الشبكة.
