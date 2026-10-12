import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Store,
  Search,
  CheckCircle,
  MapPin,
  Phone,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Star,
  Sparkles,
} from 'lucide-react';
import { Business } from '../types';

interface BusinessDirectoryPageProps {
  setCurrentTab: (tab: string) => void;
  setSelectedBusinessId: (id: string) => void;
}

export const BusinessDirectoryPage: React.FC<BusinessDirectoryPageProps> = ({
  setCurrentTab,
  setSelectedBusinessId,
}) => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('ALL');

  useEffect(() => {
    api.getDirectory().then((res) => setBusinesses(Array.isArray(res) ? res : [])).catch(() => setBusinesses([]));
  }, []);

  const filteredBusinesses = (Array.isArray(businesses) ? businesses : []).filter((b) => {
    if (!b) return false;
    const name = b.businessName || '';
    const desc = b.description || '';
    const city = b.city || '';
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      name.toLowerCase().includes(query) ||
      desc.toLowerCase().includes(query) ||
      city.toLowerCase().includes(query);
    const matchesGov = selectedGovernorate === 'ALL' || b.governorate === selectedGovernorate;
    return matchesSearch && matchesGov;
  });

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 text-right">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">شبكة الشركاء المعتمدين</span>
          <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">دليل المتاجر والخدمات</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            تسوق واكسب نقاطك الفورية مع أفضل المتاجر والكافيهات في مصر
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن متجر أو خدمة..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 text-right focus:border-sky-400 focus:ring-1 focus:ring-sky-400 transition-all"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <select
            value={selectedGovernorate}
            onChange={(e) => setSelectedGovernorate(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white text-right focus:border-sky-400"
          >
            <option value="ALL">كل المحافظات</option>
            <option value="القاهرة">القاهرة</option>
            <option value="الجيزة">الجيزة</option>
            <option value="الإسكندرية">الإسكندرية</option>
          </select>
        </div>
      </div>

      {/* 4 Cards Per Row on Desktop Grid (Section 43) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredBusinesses.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl bg-[#0c101c] border border-slate-800 hover:border-sky-500/40 transition-all overflow-hidden flex flex-col justify-between group shadow-lg text-right"
          >
            <div>
              {/* Image banner */}
              <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                <img
                  src={
                    b.logoUrl ||
                    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=80'
                  }
                  alt={b.businessName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {b.discountNote && (
                  <div className="absolute top-2.5 right-2.5 bg-sky-950/90 border border-sky-400/40 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded shadow">
                    {b.discountNote}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors truncate">
                    {b.businessName}
                  </h3>
                  <span title="شريك معتمد"><CheckCircle className="w-4 h-4 text-sky-400 shrink-0" /></span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {b.description}
                </p>

                <div className="pt-2 flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="truncate">{b.governorate}، {b.city}</span>
                </div>
              </div>
            </div>

            {/* Footer with Contacts & Detail Button */}
            <div className="p-4 pt-0">
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  {b.phone && (
                    <a
                      href={`tel:${b.phone}`}
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
                      title="اتصال هاتفياً"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {b.socialLinks?.whatsapp && (
                    <a
                      href={`https://wa.me/${b.socialLinks.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-400 transition-colors"
                      title="مراسلة عبر واتساب"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedBusinessId(b.id);
                    setCurrentTab('business-detail');
                  }}
                  className="py-1 px-3 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <span>عرض التفاصيل</span>
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
