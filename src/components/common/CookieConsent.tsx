import React, { useState, useEffect } from 'react';
import { Shield, Check } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [showConsent, setShowConsent] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // always true
    analytics: true,
    preferences: true,
  });

  useEffect(() => {
    const consent = localStorage.getItem('sugar_cookie_consent');
    if (!consent) {
      setShowConsent(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('sugar_cookie_consent', JSON.stringify({ necessary: true, analytics: true, preferences: true }));
    setShowConsent(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('sugar_cookie_consent', JSON.stringify(preferences));
    setShowConsent(false);
  };

  if (!showConsent) return null;

  return (
    <aside
      aria-label="إعدادات ملفات تعريف الارتباط"
      className="fixed bottom-6 right-6 max-w-md w-[calc(100%-3rem)] bg-[#0d121f]/95 border border-sky-500/30 rounded-2xl shadow-2xl p-5 z-50 text-right backdrop-blur-md"
    >
      <div className="flex items-center gap-2.5 text-sky-400 mb-2">
        <Shield className="w-5 h-5" />
        <h4 className="font-bold text-sm text-white">إعدادات الخصوصية وملفات تعريف الارتباط</h4>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed mb-4">
        نستخدم ملفات تعريف الارتباط الأساسية لضمان عمل جلسات تسجيل الدخول وتشفير المعاملات بأمان، وملفات إحصائية اختيارية لتحسين تجربة استخدام المنصة.
      </p>

      <div className="space-y-2 mb-4 text-xs text-slate-300">
        <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="font-medium">الملفات الضرورية (الأمان والجلسات)</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20">إلزامي</span>
        </label>
        <label className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 cursor-pointer">
          <span className="font-medium">ملفات تحسين الأداء والإحصائيات</span>
          <input
            type="checkbox"
            checked={preferences.analytics}
            onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
            className="rounded text-sky-500 focus:ring-sky-400 bg-slate-800 border-slate-700"
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleAcceptAll}
          className="flex-1 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20"
        >
          <Check className="w-4 h-4" />
          <span>قبول الكل</span>
        </button>
        <button
          type="button"
          onClick={handleSavePreferences}
          className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
        >
          حفظ التفضيلات
        </button>
      </div>
    </aside>
  );
};
