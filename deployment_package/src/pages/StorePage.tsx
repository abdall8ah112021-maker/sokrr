import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import {
  ShoppingBag,
  Coins,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Filter,
  Sparkles,
} from 'lucide-react';
import { Product } from '../types';

interface StorePageProps {
  setCurrentTab: (tab: string) => void;
  setSelectedProductId: (id: string) => void;
}

export const StorePage: React.FC<StorePageProps> = ({
  setCurrentTab,
  setSelectedProductId,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'POINTS' | 'CASH'>('ALL');
  const { addToCart, items, paymentType } = useCart();
  const [cartAlert, setCartAlert] = useState<string | null>(null);

  useEffect(() => {
    api.getProducts().then((res) => setProducts(Array.isArray(res) ? res : [])).catch(() => setProducts([]));
  }, []);

  const filteredProducts = (Array.isArray(products) ? products : []).filter((p) => {
    if (!p) return false;
    if (activeFilter === 'POINTS') return p.paymentType === 'POINTS';
    if (activeFilter === 'CASH') return p.paymentType === 'CASH';
    return true;
  });

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    const result = addToCart(product, 1);
    if (!result.success && result.error) {
      setCartAlert(result.error);
      setTimeout(() => setCartAlert(null), 5000);
    } else {
      setCartAlert(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 text-right">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">المتجر الرسمي المعتمد</span>
          <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">منتجات ومكافآت Sugar Business</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            استبدل نقاطك المكتسبة بجوائز قيّمة أو اشترِ نقداً بالدفع عند الاستلام (COD)
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeFilter === 'ALL' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            جميع المعروضات
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('POINTS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeFilter === 'POINTS' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            استبدال بالنقاط
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('CASH')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeFilter === 'CASH' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            الدفع عند الاستلام (COD)
          </button>
        </div>
      </div>

      {cartAlert && (
        <div className="p-4 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <span>{cartAlert}</span>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            onClick={() => {
              setSelectedProductId(p.id);
              setCurrentTab('product-detail');
            }}
            className="cursor-pointer rounded-2xl bg-[#0c101c] border border-slate-800 hover:border-sky-500/40 transition-all overflow-hidden flex flex-col justify-between group shadow-lg text-right"
          >
            <div>
              {/* Product Image */}
              <div className="relative aspect-square w-full bg-slate-900 overflow-hidden">
                <img
                  src={p.images?.[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80'}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      p.paymentType === 'POINTS'
                        ? 'bg-amber-950/90 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-950/90 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {p.paymentType === 'POINTS' ? 'مكافأة نقاط' : 'دفع عند الاستلام'}
                  </span>
                </div>
                {p.inventory <= p.lowStockThreshold && (
                  <div className="absolute bottom-2.5 right-2.5 bg-rose-950/90 border border-rose-500/40 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded">
                    متبقي {p.inventory} فقط!
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4 space-y-1">
                <h3 className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{p.description}</p>
              </div>
            </div>

            <div className="p-4 pt-0">
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 block">السعر</span>
                  {p.paymentType === 'POINTS' ? (
                    <span className="text-sm font-bold font-mono text-amber-400 flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5" />
                      {p.pointsPrice} نقطة
                    </span>
                  ) : (
                    <span className="text-sm font-bold font-mono text-emerald-400">{p.cashPrice} ج.م</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => handleAddToCart(p, e)}
                  className="py-1.5 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors shadow-sm"
                >
                  أضف للسلة
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
