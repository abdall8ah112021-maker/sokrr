import React, { useState, useEffect } from 'react';
import { Card3D } from '../components/common/Card3D';
import { useAuth } from '../context/AuthContext';
import { useSiteContent } from '../context/ContentContext';
import { api } from '../api/client';
import {
  Sparkles,
  CreditCard,
  QrCode,
  Coins,
  Shield,
  ArrowLeft,
  CheckCircle,
  Store,
  Coffee,
  ShoppingBag,
  Clock,
  MapPin,
  ChevronRight,
  Star,
  Users,
  Award,
} from 'lucide-react';
import { Service, Product, Business } from '../types';

interface HomePageProps {
  setCurrentTab: (tab: string) => void;
  setSelectedServiceId: (id: string) => void;
  setSelectedProductId: (id: string) => void;
  setSelectedBusinessId: (id: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setCurrentTab,
  setSelectedServiceId,
  setSelectedProductId,
  setSelectedBusinessId,
}) => {
  const { user, card, customer } = useAuth();
  const { content } = useSiteContent();
  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [storeFilter, setStoreFilter] = useState<'ALL' | 'CASH' | 'POINTS'>('ALL');
  const [reviewIndex, setReviewIndex] = useState(0);

  useEffect(() => {
    api.getServices().then(setServices).catch(() => {});
    api.getProducts().then(setProducts).catch(() => {});
    api.getDirectory().then(setBusinesses).catch(() => {});
    api.getAdminMetrics().then(setMetrics).catch(() => {});
  }, []);

  // Filtered store preview
  const previewProducts = products
    .filter((p) => {
      if (storeFilter === 'CASH') return p.paymentType === 'CASH';
      if (storeFilter === 'POINTS') return p.paymentType === 'POINTS';
      return true;
    })
    .slice(0, 4);

  // Reviews from real users / partners
  const reviews = [
    {
      name: 'م. أحمد الشريف',
      title: 'عضو بلاتيني VIP',
      comment: 'كارت Sugar Business غير مفهوم المكافآت تماماً. مجرد مسح سريع عند الكاشير يضمن لي نقاطاً حقيقية استبدلتها بمنتجات راقية من المتجر وصلت حتى باب بيتي.',
      rating: 5,
    },
    {
      name: 'كافيه ومحمصة دجلة',
      title: 'شريك تجاري معتمد',
      comment: 'منظومة احترافية ساعدتنا على زيادة ولاء رواد الكافيه ومضاعفة تكرار زياراتهم. لوحة التحكم سهلة وسريعة للغاية لمسح الكروت وتأكيد المعاملات.',
      rating: 5,
    },
    {
      name: 'د. ياسمين فؤاد',
      title: 'عضوة البرنامج',
      comment: 'الشفافية وسرعة تحديث رصيد النقاط هي أفضل ميزة. أيضاً كارت العضوية البلاستيكي الفاخر بتصميمه الأسود وتفاصيل الـ QR مميز جداً.',
      rating: 5,
    },
  ];

  return (
    <div className="space-y-24">
      {/* ================= 1. HERO SECTION ================= */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Ambient lighting glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-400/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left/Main Column: Headings & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-right">
              <div className="inline-flex items-center gap-2 py-1.5 px-3 rounded-full bg-sky-950/70 border border-sky-400/30 text-sky-300 text-xs font-semibold shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '8s' }} />
                <span>{content.heroBadge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
                {content.heroTitleLine1} <br />
                <span className="bg-gradient-to-r from-sky-400 via-sky-300 to-cyan-300 bg-clip-text text-transparent">
                  {content.heroTitleHighlight}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                {content.heroDescription}
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentTab(user ? (user.role === 'CUSTOMER' ? 'card' : 'business-dashboard') : 'register-customer')}
                  className="py-3.5 px-7 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-sky-400 via-sky-300 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 shadow-xl shadow-sky-500/25 hover:shadow-sky-400/40 transition-all flex items-center gap-2 text-sm sm:text-base group"
                >
                  <CreditCard className="w-5 h-5 text-slate-950" />
                  <span>{user ? 'عرض كارتك الذكي' : content.heroCtaButton}</span>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTab('directory')}
                  className="py-3.5 px-6 rounded-xl font-semibold text-slate-200 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-sky-500/40 transition-all flex items-center gap-2 text-sm sm:text-base"
                >
                  <Store className="w-5 h-5 text-sky-400" />
                  <span>{content.heroSecondaryButton}</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 flex flex-wrap items-center gap-6 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  {content.heroTrustBadge1}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-sky-400" />
                  {content.heroTrustBadge2}
                </span>
                <span className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  {content.heroTrustBadge3}
                </span>
              </div>
            </div>

            {/* Right Column: 3D Interactive Card Showcase */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Glow ring */}
                <div className="absolute inset-0 bg-sky-500/20 rounded-3xl blur-2xl -z-10" />
                <Card3D card={card} customer={customer} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 2. HOW IT WORKS (SECTION 13) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">{content.howItWorksBadge}</span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white">{content.howItWorksTitle}</h2>
          <p className="text-sm sm:text-base text-slate-400">
            {content.howItWorksSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              num: '01',
              title: content.step1Title,
              desc: content.step1Desc,
              icon: <Users className="w-6 h-6 text-sky-400" />,
            },
            {
              num: '02',
              title: content.step2Title,
              desc: content.step2Desc,
              icon: <CreditCard className="w-6 h-6 text-cyan-400" />,
            },
            {
              num: '03',
              title: content.step3Title,
              desc: content.step3Desc,
              icon: <Store className="w-6 h-6 text-emerald-400" />,
            },
            {
              num: '04',
              title: content.step4Title,
              desc: content.step4Desc,
              icon: <QrCode className="w-6 h-6 text-sky-300" />,
            },
            {
              num: '05',
              title: content.step5Title,
              desc: content.step5Desc,
              icon: <Coins className="w-6 h-6 text-amber-400" />,
            },
            {
              num: '06',
              title: content.step6Title,
              desc: content.step6Desc,
              icon: <Award className="w-6 h-6 text-purple-400" />,
            },
          ].map((step, idx) => (
            <div
              key={idx}
              className="relative p-6 rounded-2xl bg-gradient-to-b from-[#0e1320] to-[#080b13] border border-slate-800/80 hover:border-sky-500/40 transition-all duration-300 group hover:-translate-y-1 shadow-lg text-right"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-2xl font-black text-slate-700 group-hover:text-sky-500/40 transition-colors">
                  {step.num}
                </span>
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center group-hover:border-sky-400/50 group-hover:bg-sky-950/40 transition-all">
                  {step.icon}
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-sky-300 transition-colors">
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 3. FEATURED SERVICES (SECTION 15 & 53) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 text-right">
          <div>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">{content.servicesBadge}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{content.servicesTitle}</h2>
            <p className="text-sm text-slate-400 mt-1">{content.servicesSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => setCurrentTab('services')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors self-start md:self-auto"
          >
            <span>{content.servicesViewAllBtn}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.slice(0, 3).map((srv) => (
            <div
              key={srv.id}
              className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800 hover:border-sky-500/30 transition-all flex flex-col justify-between text-right group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-sky-950/60 border border-sky-400/30 flex items-center justify-center mb-4 text-sky-400">
                  <Coffee className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors mb-2">
                  {srv.nameAr}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                  {srv.shortDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedServiceId(srv.id);
                  setCurrentTab('service-detail');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-sky-950 hover:text-sky-300 border border-slate-700/80 text-xs font-semibold text-slate-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>تفاصيل الخدمة وحجز موعد</span>
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 4. STORE SHOWCASE (SECTION 16 & 56) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 text-right">
          <div>
            <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">{content.storeBadge}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">{content.storeTitle}</h2>
            <p className="text-xs text-slate-400 mt-1">{content.storeSubtitle}</p>
          </div>

          {/* Segmented Filter Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setStoreFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                storeFilter === 'ALL' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              الكل
            </button>
            <button
              type="button"
              onClick={() => setStoreFilter('POINTS')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                storeFilter === 'POINTS' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              استبدال النقاط
            </button>
            <button
              type="button"
              onClick={() => setStoreFilter('CASH')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                storeFilter === 'CASH' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              دفع نقدي (COD)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {previewProducts.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                setSelectedProductId(p.id);
                setCurrentTab('product-detail');
              }}
              className="cursor-pointer rounded-2xl bg-[#0c101c] border border-slate-800 hover:border-sky-500/40 transition-all overflow-hidden flex flex-col group shadow-lg text-right"
            >
              <div className="relative aspect-square w-full bg-slate-900 overflow-hidden">
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${
                      p.paymentType === 'POINTS'
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                    }`}
                  >
                    {p.paymentType === 'POINTS' ? 'مكافأة نقاط' : 'دفع عند الاستلام'}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">{p.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs text-slate-400">السعر</span>
                  <div className="font-bold text-sm text-sky-300">
                    {p.paymentType === 'POINTS' ? (
                      <span className="flex items-center gap-1 text-amber-400 font-mono">
                        <Coins className="w-3.5 h-3.5" />
                        {p.pointsPrice} نقطة
                      </span>
                    ) : (
                      <span className="font-mono text-emerald-400">{p.cashPrice} ج.م</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setCurrentTab('store')}
            className="inline-flex items-center gap-2 py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs sm:text-sm font-semibold text-slate-200 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-sky-400" />
            <span>{content.storeViewAllBtn}</span>
          </button>
        </div>
      </section>

      {/* ================= 5. REAL METRICS (FROM DB - SECTION 21) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0c1220] via-[#080c16] to-[#04060b] border border-sky-500/20 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x-reverse divide-x divide-slate-800/80">
            <div>
              <p className="font-mono text-3xl sm:text-5xl font-black text-white tracking-tight">
                {metrics?.totalCustomers || 1}
              </p>
              <p className="text-xs sm:text-sm font-medium text-sky-400 mt-2">{content.statsMembersLabel}</p>
            </div>
            <div>
              <p className="font-mono text-3xl sm:text-5xl font-black text-white tracking-tight">
                {metrics?.activeCards || 1}
              </p>
              <p className="text-xs sm:text-sm font-medium text-sky-400 mt-2">{content.statsCardsLabel}</p>
            </div>
            <div>
              <p className="font-mono text-3xl sm:text-5xl font-black text-white tracking-tight">
                {metrics?.listedBusinesses || 1}
              </p>
              <p className="text-xs sm:text-sm font-medium text-sky-400 mt-2">{content.statsPartnersLabel}</p>
            </div>
            <div>
              <p className="font-mono text-3xl sm:text-5xl font-black text-white tracking-tight">
                {metrics?.totalPointsAwarded || 450}
              </p>
              <p className="text-xs sm:text-sm font-medium text-sky-400 mt-2">{content.statsPointsLabel}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 6. REVIEWS SLIDER (SECTION 19) ================= */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">{content.reviewsBadge}</span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-8">{content.reviewsTitle}</h2>

        <div className="relative p-8 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl">
          <div className="flex justify-center gap-1 mb-4 text-amber-400">
            {[...Array(reviews[reviewIndex].rating)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-current" />
            ))}
          </div>

          <p className="text-base sm:text-lg text-slate-200 leading-relaxed mb-6 font-medium">
            "{reviews[reviewIndex].comment}"
          </p>

          <div>
            <h4 className="font-bold text-white text-base">{reviews[reviewIndex].name}</h4>
            <span className="text-xs text-sky-400 font-mono">{reviews[reviewIndex].title}</span>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center items-center gap-2 mt-6">
            {reviews.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setReviewIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  reviewIndex === i ? 'bg-sky-400 w-6' : 'bg-slate-700 hover:bg-slate-500'
                }`}
                title={`الرأي ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
