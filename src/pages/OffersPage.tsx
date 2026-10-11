import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Tag,
  Clock,
  CheckCircle,
  Coins,
  ChevronRight,
  Store,
  Sparkles,
} from 'lucide-react';
import { Offer } from '../types';

interface OffersPageProps {
  setCurrentTab: (tab: string) => void;
  setSelectedBusinessId: (id: string) => void;
}

export const OffersPage: React.FC<OffersPageProps> = ({
  setCurrentTab,
  setSelectedBusinessId,
}) => {
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    api.getActiveOffers().then(setOffers).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 text-right">
      <div>
        <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">خصومات ومزايا كارت العضوية</span>
        <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">العروض الحصرية للأعضاء</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          وفر أكثر مع خصومات كارت Sugar Business الخاصة لدى المتاجر والشركاء المعتمدين
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="rounded-3xl bg-[#0c101c] border border-slate-800 hover:border-sky-500/40 transition-all overflow-hidden flex flex-col justify-between group shadow-lg text-right"
          >
            <div>
              {/* Offer Image */}
              <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                <img
                  src={
                    offer.mainImage ||
                    'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80'
                  }
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-gradient-to-r from-sky-500 to-cyan-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-lg">
                  خصم {offer.discount}%
                </div>
              </div>

              {/* Offer Body */}
              <div className="p-5 space-y-2">
                <h3 className="font-bold text-base text-white group-hover:text-sky-300 transition-colors">
                  {offer.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {offer.description}
                </p>

                {offer.conditions && (
                  <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800/80">
                    الشروط: <span className="text-slate-400">{offer.conditions}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer with Business & Expiry */}
            <div className="p-5 pt-0">
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>ينتهي: {new Date(offer.endDate).toLocaleDateString('ar-EG')}</span>
                </div>

                {offer.business && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBusinessId(offer.businessId);
                      setCurrentTab('business-detail');
                    }}
                    className="text-sky-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>{offer.business.businessName}</span>
                    <ChevronRight className="w-3 h-3 rotate-180" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
