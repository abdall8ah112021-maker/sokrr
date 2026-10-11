import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  AlertTriangle,
  XCircle,
  Coins,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { Order } from '../types';

interface OrderDetailsPageProps {
  orderId: string;
  setCurrentTab: (tab: string) => void;
}

export const OrderDetailsPage: React.FC<OrderDetailsPageProps> = ({ orderId, setCurrentTab }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchOrder = () => {
    if (orderId) {
      api.getOrder(orderId)
        .then(setOrder)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    setCancelLoading(true);
    try {
      await api.cancelOrder(orderId, cancelReason || 'إلغاء بناء على رغبة العميل');
      setShowCancelModal(false);
      fetchOrder();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center text-slate-500 text-sm">
        جاري تحميل بيانات الطلب...
      </div>
    );
  }

  // State machine steps
  const steps = [
    { key: 'PENDING', label: 'تم الاستلام' },
    { key: 'CONFIRMED', label: 'تم التأكيد' },
    { key: 'PREPARING', label: 'جاري التجهيز' },
    { key: 'OUT_FOR_DELIVERY', label: 'مع المندوب' },
    { key: 'DELIVERED', label: 'تم التسليم' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 text-right">
      <button
        type="button"
        onClick={() => setCurrentTab('customer-dashboard')}
        className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold"
      >
        <ChevronRight className="w-4 h-4" />
        <span>العودة للوحة التحكم</span>
      </button>

      {/* Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c101c] border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-bold text-sky-300">{order.orderNumber}</span>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  order.status === 'DELIVERED'
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                    : order.status === 'CANCELLED'
                    ? 'bg-rose-950 text-rose-400 border-rose-500/40'
                    : 'bg-sky-950 text-sky-400 border-sky-400/40'
                }`}
              >
                {order.status === 'DELIVERED'
                  ? 'تم التسليم بنجاح'
                  : order.status === 'CANCELLED'
                  ? 'تم الإلغاء'
                  : order.status === 'OUT_FOR_DELIVERY'
                  ? 'خرج للتوصيل'
                  : order.status === 'PREPARING'
                  ? 'جاري التجهيز والتغليف'
                  : 'قيد المراجعة'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              تاريخ الطلب: {new Date(order.createdAt).toLocaleString('ar-EG')}
            </p>
          </div>

          {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="py-1.5 px-3 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors"
            >
              إلغاء الطلب
            </button>
          )}
        </div>

        {/* State Machine Progress Stepper */}
        {order.status !== 'CANCELLED' && (
          <div className="py-4">
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {steps.map((st, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;
                return (
                  <div key={st.key} className="space-y-2">
                    <div
                      className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-mono font-bold text-xs ${
                        isPassed
                          ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span className={`block font-medium ${isCurrent ? 'text-sky-300 font-bold' : isPassed ? 'text-slate-300' : 'text-slate-600'}`}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Items Snapshots (Immutable #68) */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <h3 className="text-sm font-bold text-white">المنتجات المطلوبة (لقطة تاريخية غير قابلة للتعديل)</h3>
          <div className="divide-y divide-slate-800/60">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {item.productImage && (
                    <img src={item.productImage} alt={item.productName} className="w-12 h-12 rounded-lg object-cover" />
                  )}
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white">{item.productName}</h4>
                    <span className="text-[11px] text-slate-400">الكمية: {item.quantity}</span>
                  </div>
                </div>

                <span className="font-mono font-bold text-xs text-slate-200">
                  {order.paymentType === 'POINTS'
                    ? `${item.unitPricePoints * item.quantity} نقطة`
                    : `${item.unitPriceCash * item.quantity} ج.م`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Delivery Address & Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="space-y-1 text-slate-300">
            <span className="font-bold text-white block">عنوان التوصيل:</span>
            <p>{order.deliveryAddress.recipient} - {order.deliveryAddress.phone}</p>
            <p>{order.deliveryAddress.governorate}، {order.deliveryAddress.city}، {order.deliveryAddress.street}</p>
          </div>

          <div className="space-y-1 sm:text-left text-slate-300 font-mono">
            <div className="flex justify-between sm:justify-end sm:gap-6">
              <span className="text-slate-400 font-sans">مصاريف الشحن:</span>
              <span>{order.deliveryFee} ج.م</span>
            </div>
            <div className="flex justify-between sm:justify-end sm:gap-6 text-sm font-bold text-sky-400 pt-1">
              <span className="text-slate-300 font-sans">الإجمالي المدفوع:</span>
              <span>
                {order.paymentType === 'POINTS'
                  ? `${order.totalPoints} نقطة + ${order.deliveryFee} ج.م`
                  : `${order.totalCash} ج.م`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-[#0c101c] border border-slate-800 text-right space-y-4">
            <h3 className="text-base font-bold text-white">إلغاء الطلب رقم {order.orderNumber}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              يرجى توضيح سبب الإلغاء. في حال كان الطلب مستبدلاً بالنقاط، فسيتم إرجاع النقاط بالكامل إلى محفظتك فورياً.
            </p>
            <textarea
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="سبب الإلغاء..."
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs text-right"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancelOrder}
                disabled={cancelLoading}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                {cancelLoading ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
              </button>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
