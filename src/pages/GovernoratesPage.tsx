import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { MapPin, Truck, CheckCircle2, Clock } from 'lucide-react';
import { Governorate } from '../types';

interface GovernoratesPageProps {
  setCurrentTab?: (tab: string) => void;
}

export const GovernoratesPage: React.FC<GovernoratesPageProps> = ({ setCurrentTab }) => {
  const [governorates, setGovernorates] = useState<Governorate[]>([]);

  useEffect(() => {
    api.getGovernorates().then(setGovernorates).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 text-right">
      {setCurrentTab && (
        <button
          type="button"
          onClick={() => setCurrentTab('home')}
          className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold"
        >
          <span>← العودة للرئيسية</span>
        </button>
      )}
      <div>
        <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">تغطية شاملة للجمهورية</span>
        <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">المحافظات وأسعار التوصيل</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          نصلك أينما كنت في مصر. يتم توصيل الكروت البلاستيكية وطلبات المتجر عبر أسطول شحن سريع وموثوق.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {governorates.map((gov) => (
          <div
            key={gov.id}
            className="p-5 rounded-2xl bg-[#0c101c] border border-slate-800 hover:border-sky-500/30 transition-all flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-950/80 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{gov.nameAr}</h4>
                <span className="text-[10px] text-slate-400 font-mono">{gov.nameEn}</span>
              </div>
            </div>

            <div className="text-left font-mono">
              <span className="text-[10px] text-slate-500 block font-sans">مصاريف الشحن</span>
              <span className="text-sm font-bold text-sky-300">{gov.deliveryFee} ج.م</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
