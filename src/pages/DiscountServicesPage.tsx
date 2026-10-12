import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Tag,
  MapPin,
  Phone,
  MessageCircle,
  Calendar,
  Coins,
  ChevronDown,
  Lock,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { DiscountService, Governorate } from '../types';

interface DiscountServicesPageProps {
  setCurrentTab: (tab: string) => void;
}

export const DiscountServicesPage: React.FC<DiscountServicesPageProps> = ({ setCurrentTab }) => {
  const { user, customer } = useAuth();
  const [services, setServices] = useState<DiscountService[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [selectedGov, setSelectedGov] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    api.getGovernorates().then((res) => setGovernorates(Array.isArray(res) ? res : [])).catch(() => setGovernorates([]));
    loadServices(selectedGov);
  }, [selectedGov]);

  const loadServices = (govId: string) => {
    api.getDiscountServices(govId)
      .then((res) => setServices(Array.isArray(res) ? res : []))
      .catch(() => setServices([]));
  };

  // Check if logged in as customer
  if (!user || user.role !== 'CUSTOMER') {
    return (
      <div className="max-w-3xl mx-auto py-20 px-4 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-sky-950/80 border border-sky-400/30 flex items-center justify-center text-sky-400 mx-auto shadow-xl">
          <Lock className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">صفحة حصرية للأعضاء المسجلين</span>
          <h1 className="text-3xl font-black text-white">صفحة "خصمك عندنا"</h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
            هذه الصفحة مخصصة للعملاء المسجلين في المنظومة فقط. يرجى تسجيل الدخول أو إنشاء حساب جديد للاستفادة من أقوى الخصومات والعروض المخصصة لمحافظتك.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => setCurrentTab('login')}
            className="py-3 px-7 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/20 transition-all"
          >
            تسجيل الدخول الآن
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('register-customer')}
            className="py-3 px-7 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 transition-all"
          >
            إنشاء حساب جديد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 text-right">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-sky-950/70 border border-sky-400/30 text-sky-300 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>عروض وخصومات حصرية للأعضاء</span>
          </div>
          <h1 className="text-3xl font-black text-white">صفحة "خصمك عندنا"</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            استمتع بأقوى الخصومات والخدمات الخاصة بأعضاء Sugar Business في محافظتك.
          </p>
        </div>

        {/* Governorate Filter */}
        <div className="flex items-center gap-2 bg-[#0c101c] p-2 rounded-2xl border border-slate-800">
          <MapPin className="w-4 h-4 text-sky-400 shrink-0 mr-1" />
          <select
            value={selectedGov}
            onChange={(e) => setSelectedGov(e.target.value)}
            className="bg-slate-900 text-white text-xs py-1.5 px-3 rounded-xl border border-slate-700 focus:border-sky-400 outline-none text-right"
          >
            <option value="">جميع المحافظات</option>
            {governorates.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nameAr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 text-sm bg-[#0c101c] rounded-3xl border border-slate-800">
            لا توجد عروض خصم مسجلة لهذه المحافظة حالياً. تابعنا قريباً!
          </div>
        ) : (
          services.map((srv) => {
            const isExpanded = expandedId === srv.id;
            return (
              <div
                key={srv.id}
                className="rounded-3xl bg-[#0c101c] border border-slate-800 hover:border-sky-500/40 transition-all overflow-hidden flex flex-col shadow-xl text-right group"
              >
                {/* Main Image */}
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                  <img
                    src={srv.imageUrl}
                    alt={srv.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 right-3 py-1 px-3 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-sky-300 text-xs font-bold">
                    {srv.governorateName}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-white leading-snug">{srv.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{srv.description}</p>
                  </div>

                  {/* Price & Validity */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">سعر الاشتراك</span>
                      <strong className="text-sky-300 font-mono text-sm">{srv.subscriptionPrice} ج.م</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">صالح حتى</span>
                      <strong className="text-slate-200 font-mono text-xs flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-amber-400" />
                        {srv.validityDate}
                      </strong>
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {srv.phone && (
                      <a
                        href={`tel:${srv.phone}`}
                        className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-4 h-4 text-sky-400" />
                        <span>اتصال</span>
                      </a>
                    )}
                    {srv.whatsapp && (
                      <a
                        href={`https://wa.me/${srv.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>واتساب</span>
                      </a>
                    )}
                  </div>

                  {/* Show More / Gallery Toggle */}
                  {srv.galleryImages && srv.galleryImages.length > 0 && (
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : srv.id)}
                        className="w-full py-2 px-4 rounded-xl bg-sky-950/40 hover:bg-sky-950 border border-sky-500/30 text-xs font-bold text-sky-300 flex items-center justify-center gap-1.5 transition-all"
                      >
                        <span>{isExpanded ? 'إخفاء الصور والتفاصيل' : `عرض المزيد (${srv.galleryImages.length} صور إضافية)`}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="grid grid-cols-3 gap-2 pt-3 animate-fadeIn">
                          {srv.galleryImages.map((imgUrl, idx) => (
                            <img
                              key={idx}
                              src={imgUrl}
                              alt={`صورة إضافية ${idx + 1}`}
                              className="w-full h-20 object-cover rounded-xl border border-slate-700 shadow"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
