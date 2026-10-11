import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  ShoppingBag,
  Trash2,
  Coins,
  Truck,
  MapPin,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import { Governorate } from '../types';

interface CartPageProps {
  setCurrentTab: (tab: string) => void;
  setSelectedOrderId: (id: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ setCurrentTab, setSelectedOrderId }) => {
  const { items, paymentType, updateQuantity, removeFromCart, clearCart, totalCash, totalPoints } = useCart();
  const { user, customer, pointAccount } = useAuth();
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [selectedGov, setSelectedGov] = useState('القاهرة');
  const [city, setCity] = useState(customer?.city || '');
  const [street, setStreet] = useState(customer?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [recipient, setRecipient] = useState(customer?.fullName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getGovernorates().then(setGovernorates).catch(() => {});
  }, []);

  const govObj = governorates.find((g) => g.nameAr === selectedGov);
  const deliveryFee = govObj ? govObj.deliveryFee : 45;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setCurrentTab('login');
      return;
    }

    if (items.length === 0) return;

    if (paymentType === 'POINTS') {
      const userBalance = pointAccount?.balance || 0;
      if (userBalance < totalPoints) {
        setError(`رصيدك الحالي (${userBalance} نقطة) لا يكفي لإتمام طلب المكافآت بقيمة ${totalPoints} نقطة.`);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        paymentType,
        items: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        deliveryAddress: {
          title: 'المنزل',
          recipient,
          phone,
          governorate: selectedGov,
          city,
          street,
        },
      };

      const res = await api.createOrder(payload);
      clearCart();
      setSelectedOrderId(res.order.id);
      setCurrentTab('order-detail');
    } catch (err: any) {
      setError(err.message || 'فشل إتمام الطلب، يرجى المحاولة لاحقاً');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-slate-500 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">سلة المشتريات فارغة</h2>
        <p className="text-xs text-slate-400">
          لم تقم بإضافة أي منتجات للسلة بعد. استعرض المتجر واختر ما يناسبك من مكافآت النقاط أو منتجات الدفع عند الاستلام.
        </p>
        <button
          type="button"
          onClick={() => setCurrentTab('store')}
          className="py-2.5 px-6 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors"
        >
          تصفح المتجر الآن
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 text-right">
      <div>
        <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">تأكيد الشراء والشحن</span>
        <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">سلة المشتريات وإتمام الطلب</h1>
        <p className="text-xs text-slate-400 mt-1">
          نوع الدفع في هذه السلة:{' '}
          <strong className="text-sky-300">
            {paymentType === 'POINTS' ? 'استبدال مكافآت بالنقاط' : 'دفع نقدي عند الاستلام (COD)'}
          </strong>
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0c101c] border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white">المنتجات المختارة ({items.length})</h3>
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-rose-400 hover:underline"
            >
              إفراغ السلة
            </button>
          </div>

          <div className="divide-y divide-slate-800/80">
            {items.map((item) => (
              <div key={item.product.id} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0"
                  />
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-white">{item.product.name}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {paymentType === 'POINTS'
                        ? `${item.product.pointsPrice} نقطة للقطعة`
                        : `${item.product.cashPrice} ج.م للقطعة`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-700 rounded-lg bg-slate-900 px-2 py-1 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="px-1 text-slate-400 hover:text-white"
                    >
                      -
                    </button>
                    <span className="px-2 font-bold text-white">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="px-1 text-slate-400 hover:text-white"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checkout Form & Summary */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#0c101c] border border-slate-800 shadow-xl space-y-6">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-sky-400" />
            <span>بيانات التوصيل والشحن</span>
          </h3>

          <form onSubmit={handleCheckout} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1">اسم المستلم</label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-right"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">رقم الهاتف للتواصل</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-right"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-slate-300 mb-1">المحافظة</label>
                <select
                  value={selectedGov}
                  onChange={(e) => setSelectedGov(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-right"
                >
                  {governorates.map((g) => (
                    <option key={g.id} value={g.nameAr}>
                      {g.nameAr} ({g.deliveryFee} ج.م شحن)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">المدينة / الحي</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-right"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">العنوان بالتفصيل</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
                placeholder="الشارع، رقم العمارة، رقم الشقة"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-right"
              />
            </div>

            {/* Price Calculations */}
            <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>قيمة المنتجات:</span>
                <span className="font-mono font-bold text-white">
                  {paymentType === 'POINTS' ? `${totalPoints} نقطة` : `${totalCash} ج.م`}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>مصاريف الشحن ({selectedGov}):</span>
                <span className="font-mono font-bold text-white">{deliveryFee} ج.م</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-sky-300 pt-2 border-t border-slate-800">
                <span>الإجمالي النهائي:</span>
                <div className="text-left font-mono">
                  {paymentType === 'POINTS' ? (
                    <div>
                      <span className="text-amber-400 block">{totalPoints} نقطة</span>
                      <span className="text-[11px] text-slate-400">+ {deliveryFee} ج.م شحن</span>
                    </div>
                  ) : (
                    <span>{totalCash + deliveryFee} ج.م</span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-bold text-sm shadow-xl shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span>جاري تأكيد الطلب...</span>
              ) : (
                <>
                  <span>تأكيد الطلب والشحن الآن</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
