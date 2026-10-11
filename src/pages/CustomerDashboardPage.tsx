import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Card3D } from '../components/common/Card3D';
import {
  CreditCard,
  Coins,
  Award,
  ShoppingBag,
  Clock,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Order, ServiceRequest, PointLedger } from '../types';

interface CustomerDashboardPageProps {
  setCurrentTab: (tab: string) => void;
  setSelectedOrderId: (id: string) => void;
}

export const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({
  setCurrentTab,
  setSelectedOrderId,
}) => {
  const { user, customer, card, pointAccount, refreshProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [ledger, setLedger] = useState<PointLedger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshProfile();
    api.getMyOrders().then(setOrders).catch(() => {});
    api.getMyServiceRequests().then(setRequests).catch(() => {});
    api.getMyPoints().then((data) => setLedger(data.ledger || [])).catch(() => {});
    setLoading(false);
  }, []);

  const currentPoints = pointAccount?.balance ?? 350;
  const totalHistorical = pointAccount?.totalEarnedHistorical ?? 450;

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-right">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0c1220] via-[#090e1a] to-[#060910] border border-sky-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-sky-400 font-mono">حساب عميل نشط وموثق</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            مرحباً، {customer?.fullName || 'عضو Sugar Business'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            رقم العضوية المرجعي: <span className="font-mono text-sky-300 font-bold">{customer?.referenceNumber || 'CUST-2026-0001'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentTab('store')}
            className="py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-lg shadow-sky-500/20"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>متجر المكافآت</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('card')}
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4 text-sky-400" />
            <span>كارتي ورمز الـ QR</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Card + Points & Loyalty */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive 3D Card */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl flex flex-col items-center">
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
              <p className="text-[11px] text-slate-500 mt-2">
                جاهزة للاستبدال الفوري في متجر مكافآت Sugar Business.
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
              تحتاج إلى <strong className="text-white font-mono">{Math.max(0, nextLevelPoints - totalHistorical)}</strong> نقطة إضافية لفتح مزايا الخصومات الإضافية والهدايا الشهرية.
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
              {ledger.slice(0, 3).map((item) => (
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
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-sky-400" />
              <span>طلباتي من المتجر</span>
            </h3>
            <p className="text-xs text-slate-400">متابعة حالة شحن وتوصيل طلبات المكافآت والشراء</p>
          </div>
          <button
            type="button"
            onClick={() => setCurrentTab('store')}
            className="text-xs text-sky-400 hover:underline font-semibold"
          >
            تصفح المتجر وإضافة طلب جديد ←
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            لا توجد طلبات سابقة حتى الآن. تصفح المتجر الآن لاستبدال نقاطك!
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
                <div className="text-xs text-slate-300">
                  <span>{order.items.length} عنصر</span> •{' '}
                  <span className="font-mono">
                    {order.paymentType === 'POINTS' ? `${order.totalPoints} نقطة` : `${order.totalCash} ج.م`}
                  </span>
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
    </div>
  );
};
