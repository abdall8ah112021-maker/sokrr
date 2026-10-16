import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, QrCode, Sparkles, ArrowLeft } from 'lucide-react';

interface SmartFloatingButtonProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const SmartFloatingButton: React.FC<SmartFloatingButtonProps> = ({ currentTab, setCurrentTab }) => {
  const { user } = useAuth();

  let label = 'احصل على كارتك الآن';
  let icon = <Sparkles className="w-3.5 h-3.5 text-slate-950" />;
  let action = () => setCurrentTab('register-customer');

  if (!user) {
    label = 'احصل على كارتك الآن';
    icon = <Sparkles className="w-3.5 h-3.5 text-slate-950" />;
    action = () => setCurrentTab('register-customer');
  } else if (user.role === 'CUSTOMER') {
    if (currentTab === 'card') {
      label = 'استعراض رصيد النقاط';
      icon = <CreditCard className="w-3.5 h-3.5 text-slate-950" />;
      action = () => setCurrentTab('points');
    } else {
      label = 'كارتي الذكي ورمز الـ QR';
      icon = <CreditCard className="w-3.5 h-3.5 text-slate-950" />;
      action = () => setCurrentTab('card');
    }
  } else if (user.role === 'BUSINESS' || user.role === 'EMPLOYEE') {
    label = 'مسح الكارت وتسجيل شراء';
    icon = <QrCode className="w-3.5 h-3.5 text-slate-950" />;
    action = () => setCurrentTab('business-dashboard');
  } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    label = 'لوحة التحكم الإدارية';
    icon = <Sparkles className="w-3.5 h-3.5 text-slate-950" />;
    action = () => setCurrentTab('admin-dashboard');
  }

  // If on service detail
  if (currentTab === 'services') {
    label = 'طلب خدمة جديدة';
    action = () => setCurrentTab('services');
  }

  return (
    <aside aria-label="Smart Action Button" className="fixed bottom-5 left-5 z-40">
      <button
        type="button"
        onClick={action}
        className="group flex items-center gap-2.5 bg-gradient-to-r from-sky-400 via-sky-300 to-cyan-300 text-slate-950 font-bold px-4 py-2.5 rounded-full shadow-xl shadow-sky-500/25 hover:shadow-sky-400/40 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 text-xs sm:text-sm"
      >
        <span className="w-6 h-6 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center group-hover:rotate-12 transition-transform shadow-sm">
          {icon}
        </span>
        <span className="tracking-wide">{label}</span>
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
      </button>
    </aside>
  );
};
