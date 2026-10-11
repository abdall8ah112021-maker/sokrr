import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  CheckCircle,
  MapPin,
  Phone,
  MessageCircle,
  Clock,
  Coins,
  ChevronRight,
  Star,
  Share2,
  ArrowLeft,
  Navigation,
  Bell,
  BellRing,
} from 'lucide-react';
import { Business } from '../types';

interface BusinessDetailPageProps {
  businessId: string;
  setCurrentTab: (tab: string) => void;
}

export const BusinessDetailPage: React.FC<BusinessDetailPageProps> = ({
  businessId,
  setCurrentTab,
}) => {
  const { user } = useAuth();
  const [business, setBusiness] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      api.getBusiness(businessId)
        .then(setBusiness)
        .catch(() => {})
        .finally(() => setLoading(false));

      if (user) {
        api.getMyFollowing().then((ids: string[]) => {
          if (ids.includes(businessId)) setIsFollowing(true);
        }).catch(() => {});
      }
    }
  }, [businessId, user]);

  const handleToggleFollow = async () => {
    if (!user) {
      alert('يرجى تسجيل الدخول بحساب عميل لمتابعة المتاجر وتلقي إشعارات العروض الخاصة.');
      setCurrentTab('login');
      return;
    }
    try {
      const res = await api.toggleFollowBusiness(businessId);
      setIsFollowing(res.data.isFollowing);
      alert(res.message);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading || !business) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center text-slate-500 text-sm">
        جاري تحميل تفاصيل الشريك التجاري...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 text-right">
      <button
        type="button"
        onClick={() => setCurrentTab('directory')}
        className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold"
      >
        <ChevronRight className="w-4 h-4" />
        <span>العودة لدليل المتاجر والشركاء</span>
      </button>

      {/* Main Header Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0c101c] border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={
                business.logoUrl ||
                'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=80'
              }
              alt={business.businessName}
              className="w-20 h-20 rounded-2xl object-cover border border-sky-400/30 shrink-0 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{business.businessName}</h1>
                <span title="شريك معتمد"><CheckCircle className="w-5 h-5 text-sky-400 shrink-0" /></span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{business.type} • {business.governorate}، {business.city}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  {business.ratingAvg} ({business.ratingCount} تقييم)
                </span>
                {business.discountNote && (
                  <span className="text-xs font-bold text-sky-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-500/30">
                    {business.discountNote}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleFollow}
              className={`py-2 px-4 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                isFollowing
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/50 hover:bg-amber-900/80'
                  : 'bg-sky-950/80 text-sky-300 border-sky-500/40 hover:bg-sky-900/80'
              }`}
            >
              {isFollowing ? <BellRing className="w-4 h-4 text-amber-400" /> : <Bell className="w-4 h-4 text-sky-400" />}
              <span>{isFollowing ? 'إلغاء المتابعة (تنبيهات مفعلة)' : 'متابعة المتجر وتنبيهات العروض'}</span>
            </button>

            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Phone className="w-4 h-4 text-sky-400" />
                <span>اتصال</span>
              </a>
            )}
            {business.socialLinks?.whatsapp && (
              <a
                href={`https://wa.me/${business.socialLinks.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-4 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>واتساب</span>
              </a>
            )}
          </div>
        </div>

        {/* Gallery */}
        {business.galleryImages && business.galleryImages.length > 0 && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            {business.galleryImages.map((img: string, i: number) => (
              <img
                key={i}
                src={img}
                alt="معرض الصور"
                className="w-full h-48 object-cover rounded-xl border border-slate-800 shadow"
              />
            ))}
          </div>
        )}

        {/* Description */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <h3 className="text-sm font-bold text-white">عن المتجر والمزايا</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{business.description}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-sky-400 shrink-0" />
            <span>مواعيد العمل: {business.workingHours || 'يومياً من 9 صباحاً حتى 11 مساءً'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
            <span>العنوان: {business.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
