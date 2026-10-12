import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import {
  Coins,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Shield,
  Truck,
  Star,
} from 'lucide-react';
import { Product } from '../types';

interface ProductDetailPageProps {
  productId: string;
  setCurrentTab: (tab: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  setCurrentTab,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    if (productId) {
      api.getProduct(productId)
        .then(setProduct)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [productId]);

  if (loading || !product) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-slate-500 text-sm">
        جاري تحميل تفاصيل المنتج...
      </div>
    );
  }

  const handleAdd = () => {
    const res = addToCart(product, qty);
    if (!res.success && res.error) {
      setErrorMsg(res.error);
    } else {
      setErrorMsg(null);
      setAdded(true);
      setTimeout(() => setAdded(false), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 text-right">
      <button
        type="button"
        onClick={() => setCurrentTab('store')}
        className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold"
      >
        <ChevronRight className="w-4 h-4" />
        <span>العودة لمتجر المكافآت</span>
      </button>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-6 sm:p-10 rounded-3xl bg-[#0c101c] border border-slate-800 shadow-xl items-start">
        {/* Product Media */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                product.paymentType === 'POINTS'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {product.paymentType === 'POINTS' ? 'مكافأة استبدال بالنقاط' : 'دفع عند الاستلام (COD)'}
            </span>

            <h1 className="text-xl sm:text-3xl font-black text-white mt-3">{product.name}</h1>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">القيمة المطلوبة:</span>
            {product.paymentType === 'POINTS' ? (
              <span className="text-2xl font-black font-mono text-amber-400 flex items-center gap-1.5">
                <Coins className="w-6 h-6" />
                {product.pointsPrice} نقطة
              </span>
            ) : (
              <span className="text-2xl font-black font-mono text-emerald-400">
                {product.cashPrice} ج.م
              </span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300">الوصف والمواصفات:</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{product.description}</p>
          </div>

          {/* Inventory & Quantity */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">حالة التوفر بالمخزون:</span>
              <span className="text-emerald-400 font-semibold font-mono">متوفر ({product.inventory} قطعة)</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-700 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-2 text-slate-400 hover:text-white"
                >
                  -
                </button>
                <span className="px-3 font-bold text-white">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(Math.min(product.inventory, qty + 1))}
                  className="px-2 text-slate-400 hover:text-white"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="flex-1 py-3 px-6 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{added ? 'تمت الإضافة للسلة ✓' : 'إضافة إلى سلة المشتريات'}</span>
              </button>
            </div>
          </div>

          {/* Perks */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-sky-400 shrink-0" />
              <span>شحن سريع لجميع محافظات مصر</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ضمان جودة من Sugar Business</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
