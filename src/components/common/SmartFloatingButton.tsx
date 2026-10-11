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
  let icon = <Sparkles className="w-5 h-5 text-slate-950" />;
  let action = () => setCurrentTab('register-customer');

  if (!user) {
    label = 'احصل على كارتك الآن';
    icon = <Sparkles className="w-5 h-5 text-slate-950" />;
    action = () => setCurrentTab('register-customer');
  } else if (user.role === 'CUSTOMER') {
    if (currentTab === 'card') {
      label = 'استعراض رصيد النقاط';
      icon = <CreditCard className="w-5 h-5 text-slate-950" />;
      action = () => setCurrentTab('points');
    } else {
      label = 'كارتي الذكي ورمز الـ QR';
      icon = <CreditCard className="w-5 h-5 text-slate-950" />;
      action = () => setCurrentTab('card');
    }
  } else if (user.role === 'BUSINESS' || user.role === 'EMPLOYEE') {
    label = 'مسح الكارت وتسجيل شراء';
    icon = <QrCode className="w-5 h-5 text-slate-950" />;
    action = () => setCurrentTab('business-dashboard');
  } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
    label = 'لوحة التحكم الإدارية';
    icon = <Sparkles className="w-5 h-5 text-slate-950" />;
    action = () => setCurrentTab('admin-dashboard');
  }

  // If on service detail
  if (currentTab === 'services') {
    label = 'طلب خدمة جديدة';
    action = () => setCurrentTab('services');
  }

  return (
    <aside aria-label="Smart Action Button" className="fixed bottom-6 left-6 z-40">
      <button
        type="button"
        onClick={action}
        className="group flex items-center gap-3 bg-gradient-to-r from-sky-400 via-sky-300 to-cyan-300 text-slate-950 font-bold px-5 py-3 rounded-full shadow-2xl shadow-sky-500/30 hover:shadow-sky-400/50 hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20"
      >
        <span className="p-1 rounded-full bg-white/30 backdrop-blur-sm group-hover:rotate-12 transition-transform">
          {icon}
        </span>
        <span className="text-sm tracking-wide">{label}</span>
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
      </button>
    </aside>
  );
};
