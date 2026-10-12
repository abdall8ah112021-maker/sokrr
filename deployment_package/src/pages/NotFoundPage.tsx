import React from 'react';
import { Sparkles, ArrowLeft, Home } from 'lucide-react';

interface NotFoundPageProps {
  setCurrentTab: (tab: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ setCurrentTab }) => {
  return (
    <div className="max-w-md mx-auto py-24 px-4 text-center space-y-6">
      <div className="relative w-28 h-28 mx-auto">
        <div className="absolute inset-0 bg-sky-500/20 rounded-full blur-2xl animate-pulse" />
        <div className="w-full h-full rounded-3xl bg-[#0c1220] border border-sky-500/40 flex items-center justify-center shadow-2xl">
          <span className="font-mono text-5xl font-black text-sky-400">404</span>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-black text-white">الصفحة غير موجودة</h1>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          عذراً، الرابط الذي تحاول الوصول إليه غير متاح أو تم نقله. يمكنك العودة دائماً للصفحة الرئيسية لمنظومة Sugar Business.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setCurrentTab('home')}
        className="py-3 px-6 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-sky-500/25 transition-all inline-flex items-center gap-2"
      >
        <Home className="w-4 h-4" />
        <span>العودة للصفحة الرئيسية</span>
      </button>
    </div>
  );
};
