import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import { Card3D } from '../components/common/Card3D';
import { BiometricSetupCard } from '../components/common/BiometricSetupCard';
import {
  CreditCard,
  Coins,
  Award,
  ShoppingBag,
  Clock,
  ChevronRight,
  AlertCircle,
  Sparkles,
  LayoutDashboard,
} from 'lucide-react';
import { Order, PointLedger, Product } from '../types';

interface CustomerDashboardPageProps {
  setCurrentTab: (tab: string) => void;
  setSelectedOrderId: (id: string) => void;
  setSelectedProductId?: (id: string) => void;
}

export const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({
  setCurrentTab,
  setSelectedOrderId,
  setSelectedProductId,
}) => {
  const { customer, card, pointAccount, refreshProfile } = useAuth();
  const { addToCart, itemCount } = useCart();
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'store'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ledger, setLedger] = useState<PointLedger[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [storeFilter, setStoreFilter] = useState<'ALL' | 'CASH' | 'POINTS'>('ALL');
  const [cartNotice, setCartNotice] = useState<string | null>(null);

  useEffect(() => {
    refreshProfile();
    api.getMyOrders().then((res) => setOrders(Array.isArray(res) ? res : [])).catch(() => setOrders([]));
    api.getMyPoints().then((data) => setLedger(Array.isArray(data?.ledger) ? data.ledger : [])).catch(() => setLedger([]));
    api.getProducts().then((res) => setProducts(Array.isArray(res) ? res : [])).catch(() => setProducts([]));
  }, []);

  const currentPoints = pointAccount?.balance ?? 0;
  const totalHistorical = pointAccount?.totalEarnedHistorical ?? 0;

  // Next level progress:
  // Bronze: 0, Silver: 300, Gold: 1000, Platinum: 2500
  let nextLevelName = 'الذهبي (Gold)';
  let nextLevelPoints = 1000;
  let progressPercent = Math.min(100, Math.round((totalHistorical / nextLevelPoints) * 100));

  if (totalHistorical >= 1000 && totalHistorical < 2500) {
    nextLevelName = 'البلاتيني VIP';
    nextLevelPoints = 2500;
    progressPercent = Math.min(100, Math.round(((totalHistorical - 1000) / 1500) * 100));
  } else if (totalHistorical >= 2500) {
    nextLevelName = 'أعلى مستوى (VIP Elite)';
    progressPercent = 100;
  }

  const filteredProducts = products.filter((p) => {
    if (!p) return false;
    if (storeFilter === 'CASH') return p.paymentType === 'CASH';
    if (storeFilter === 'POINTS') return p.paymentType === 'POINTS';
    return true;
  });

  const handleQuickAdd = (product: Product) => {
    const res = addToCart(product, 1);
    if (!res.success && res.error) {
      setCartNotice(res.error);
    } else {
      setCartNotice(`تمت إضافة "${product.name}" إلى سلة المشتريات.`);
    }
    setTimeout(() => setCartNotice(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 text-right">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0c1220] via-[#090e1a] to-[#060910] border border-sky-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-sky-400 font-mono">حساب عميل نشط وموثق</span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-white">
            مرحباً، {customer?.fullName || 'عضو Sugar Business'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            رقم العضوية المرجعي: <span className="font-mono text-sky-300 font-bold">{customer?.referenceNumber || 'CUST-2026-0001'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setDashboardTab('store')}
            className="flex-1 sm:flex-initial justify-center py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-lg shadow-sky-500/20 whitespace-nowrap"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>صفحة المتجر</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('card')}
            className="flex-1 sm:flex-initial justify-center py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm border border-slate-700 transition-colors flex items-center gap-1.5 whitespace-nowrap"
          >
            <CreditCard className="w-4 h-4 text-sky-400 shrink-0" />
            <span>كارتي ورمز الـ QR</span>
          </button>
        </div>
      </div>

      {/* Internal Dashboard Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setDashboardTab('overview')}
          className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            dashboardTab === 'overview'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>نظرة عامة وكارتي</span>
        </button>
        <button
          type="button"
          onClick={() => setDashboardTab('store')}
          className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            dashboardTab === 'store'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>متجر الموقع وطلباتي ({orders.length})</span>
        </button>
      </div>

      {dashboardTab === 'overview' ? (
        <>
          {/* Main Grid: Card + Points & Loyalty */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left Column: Interactive 3D Card */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full p-4 sm:p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl flex flex-col items-center">
                <h3 className="text-sm font-bold text-slate-300 mb-4 self-start flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  <span>كارتك البلاستيكي الذكي المعتمد</span>
                </h3>
                <Card3D card={card} customer={customer} pointsBalance={currentPoints} />
                <div className="mt-4 w-full pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>حالة الكارت: <strong className="text-emerald-400">نشط وصالح</strong></span>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('card')}
                    className="text-sky-400 hover:underline font-semibold"
                  >
                    خيارات وتفاصيل الكارت ←
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Points & Loyalty Progression */}
            <div className="lg:col-span-7 space-y-6">
              {/* Points Counter Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-[#0c111e] border border-slate-800 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 mb-3">
                    <span className="text-xs font-semibold">رصيد النقاط الحالي</span>
                    <Coins className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-4xl font-black text-amber-400">{currentPoints}</span>
                    <span className="text-xs text-slate-400">نقطة متاحة</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    تُكسب النقاط حصرياً عند شراء المنتجات من متجر الموقع الرسمي ويمكن استبدالها فوراً.
                  </p>
                </div>

                <div className="p-6 rounded-2xl bg-[#0c111e] border border-slate-800 shadow-lg">
                  <div className="flex items-center justify-between text-slate-400 mb-3">
                    <span className="text-xs font-semibold">المستوى الحالي في الولاء</span>
                    <Award className="w-5 h-5 text-sky-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-sky-300">
                      {totalHistorical >= 2500 ? 'بلاتيني VIP' : totalHistorical >= 1000 ? 'ذهبي Gold' : 'فضي Silver'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    إجمالي النقاط التاريخية المكتسبة: <strong className="font-mono text-slate-300">{totalHistorical} نقطة</strong>
                  </p>
                </div>
              </div>

              {/* Loyalty Level Progress Bar */}
              <div className="p-6 rounded-2xl bg-[#0c111e] border border-slate-800 shadow-lg space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">
                    التقدم نحو المستوى التالي: <strong className="text-sky-400">{nextLevelName}</strong>
                  </span>
                  <span className="font-mono text-sky-400 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-cyan-300 rounded-full transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  تحتاج إلى <strong className="text-white font-mono">{Math.max(0, nextLevelPoints - totalHistorical)}</strong> نقطة إضافية من مشتريات المتجر لفتح مزايا المستوى التالي.
                </p>
              </div>

              {/* Quick Recent Activity */}
              <div className="p-6 rounded-2xl bg-[#0c111e] border border-slate-800 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-400" />
                    <span>آخر الحركات والنقاط</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('points')}
                    className="text-xs text-sky-400 hover:underline"
                  >
                    عرض سجل النقاط بالكامل ←
                  </button>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {ledger.length === 0 ? (
                    <p className="py-4 text-center text-xs text-slate-500">
                      لا توجد حركات نقاط مسجلة حتى الآن. اشترِ من متجر الموقع لاكتساب نقاطك الأولى.
                    </p>
                  ) : (
                    ledger.slice(0, 3).map((item) => (
                      <div key={item.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-white">{item.reason || 'حركة نقاط'}</p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(item.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <span
                          className={`font-mono font-bold text-sm ${
                            item.points > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {item.points > 0 ? `+${item.points}` : item.points} نقطة
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Biometric Fast Sign-In Settings */}
          <BiometricSetupCard />

          {/* Recent Orders Section */}
          <div className="p-5 sm:p-8 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-sky-400 shrink-0" />
                  <span>طلباتي من المتجر</span>
                </h3>
                <p className="text-xs text-slate-400">متابعة حالة شحن وتوصيل طلبات الشراء واستبدال المكافآت</p>
              </div>
              <button
                type="button"
                onClick={() => setDashboardTab('store')}
                className="text-xs text-sky-400 hover:underline font-semibold self-start sm:self-auto"
              >
                فتح صفحة المتجر بالداشبورد ←
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                لا توجد طلبات سابقة حتى الآن. تصفح متجر الموقع الآن للشراء واكتساب النقاط أو استبدالها!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.slice(0, 2).map((order) => (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setCurrentTab('order-detail');
                    }}
                    className="cursor-pointer p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 transition-all flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-sky-300">{order.orderNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-400/20">
                        {order.status === 'DELIVERED'
                          ? 'تم الاستلام'
                          : order.status === 'OUT_FOR_DELIVERY'
                          ? 'جاري التوصيل'
                          : order.status === 'CONFIRMED'
                          ? 'مؤكد'
                          : order.status === 'CANCELLED'
                          ? 'ملغي'
                          : 'قيد المراجعة'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <div>
                        <span>{order.items.length} عنصر</span> •{' '}
                        <span className="font-mono">
                          {order.paymentType === 'POINTS' ? `${order.totalPoints} نقطة` : `${order.totalCash} ج.م`}
                        </span>
                      </div>
                      {order.paymentType === 'CASH' && (order.pointsEarned || 0) > 0 && order.status !== 'CANCELLED' && (
                        <span className="text-[11px] font-mono font-bold text-amber-400">
                          +{order.pointsEarned} نقطة مكتسبة
                        </span>
                      )}
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-500">
                      <span>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                      <span className="text-sky-400 flex items-center gap-1">
                        <span>التفاصيل ومتابعة الشحنة</span>
                        <ChevronRight className="w-3 h-3 rotate-180" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* ================= DEDICATED CUSTOMER DASHBOARD STORE TAB ================= */
        <div className="space-y-8 animate-fadeIn">
          {/* Store Highlights & Points Policy Banner */}
          <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-l from-amber-950/30 via-[#0b0f1b] to-[#0b0f1b] border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>اكسب نقاطك حصرياً من متجر Sugar Business</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-white">
                تسوق منتجات المتجر واجمع النقاط مع كل طلب شراء نقدي
              </h2>
              <p className="text-xs text-slate-400">
                رصيدك المتاح الآن: <strong className="font-mono text-amber-400">{currentPoints} نقطة</strong> — يمكنك استبدالها بهدايا المتجر أو زيادة رصيدك بشراء المنتجات النقدية.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setCurrentTab('cart')}
                className="py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>سلة المشتريات ({itemCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentTab('store')}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs"
              >
                فتح المتجر بملء الشاشة
              </button>
            </div>
          </div>

          {cartNotice && (
            <div className="p-4 rounded-xl bg-sky-950/60 border border-sky-500/40 text-sky-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{cartNotice}</span>
            </div>
          )}

          {/* Store Filters + Grid */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base sm:text-lg font-bold text-white">معروضات المتجر المتاحة</h3>
              <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto">
                {[
                  { id: 'ALL', label: 'الكل' },
                  { id: 'CASH', label: 'شراء نقدي (+نقاط)' },
                  { id: 'POINTS', label: 'استبدال بالنقاط' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setStoreFilter(f.id as any)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      storeFilter === f.id ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {filteredProducts.map((p) => {
                const earned = p.rewardPoints ?? Math.max(1, Math.round(((p.cashPrice || 0) / 100) * 10));
                return (
                  <div
                    key={p.id}
                    className="rounded-2xl bg-[#0c101c] border border-slate-800 hover:border-sky-500/40 transition-all overflow-hidden flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      <div className="relative aspect-square w-full bg-slate-900 overflow-hidden">
                        <img
                          src={p.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 items-start">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              p.paymentType === 'POINTS'
                                ? 'bg-amber-950/90 text-amber-300 border-amber-500/40'
                                : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                            }`}
                          >
                            {p.paymentType === 'POINTS' ? 'مكافأة نقاط' : 'دفع عند الاستلام'}
                          </span>
                          {p.paymentType === 'CASH' && earned > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 border border-amber-500/40 font-mono">
                              +{earned} نقطة مكافأة
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4 space-y-1">
                        <h4 className="font-bold text-sm text-white line-clamp-1">{p.name}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 space-y-3">
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                        {p.paymentType === 'POINTS' ? (
                          <span className="text-sm font-bold font-mono text-amber-400 flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5" />
                            {p.pointsPrice} نقطة
                          </span>
                        ) : (
                          <span className="text-sm font-bold font-mono text-emerald-400">{p.cashPrice} ج.م</span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleQuickAdd(p)}
                          className="py-1.5 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors"
                        >
                          أضف للسلة
                        </button>
                      </div>

                      {setSelectedProductId && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProductId(p.id);
                            setCurrentTab('product-detail');
                          }}
                          className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-semibold border border-slate-800"
                        >
                          عرض تفاصيل المنتج
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Complete Store Orders History */}
          <div className="p-5 sm:p-7 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-sky-400" />
              <span>سجل جميع طلباتي من المتجر ({orders.length})</span>
            </h3>

            {orders.length === 0 ? (
              <p className="text-center py-6 text-xs text-slate-500">لم تقم بأي طلبات شراء من المتجر بعد.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setCurrentTab('order-detail');
                    }}
                    className="cursor-pointer p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-sky-300">{order.orderNumber}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-400/20">
                        {order.status === 'DELIVERED'
                          ? 'تم الاستلام'
                          : order.status === 'OUT_FOR_DELIVERY'
                          ? 'جاري التوصيل'
                          : order.status === 'CONFIRMED'
                          ? 'مؤكد'
                          : order.status === 'CANCELLED'
                          ? 'ملغي'
                          : 'قيد المراجعة'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>
                        {order.items.length} عنصر •{' '}
                        <span className="font-mono">
                          {order.paymentType === 'POINTS' ? `${order.totalPoints} نقطة` : `${order.totalCash} ج.م`}
                        </span>
                      </span>
                      {order.paymentType === 'CASH' && (order.pointsEarned || 0) > 0 && order.status !== 'CANCELLED' && (
                        <span className="text-[11px] font-mono font-bold text-amber-400">
                          +{order.pointsEarned} نقطة مكتسبة
                        </span>
                      )}
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] text-slate-500">
                      <span>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                      <span className="text-sky-400">متابعة الطلب ←</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
