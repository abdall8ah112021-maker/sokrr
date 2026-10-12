import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Phone, AlertCircle, CheckCircle, ArrowLeft, KeyRound } from 'lucide-react';

interface LoginPageProps {
  setCurrentTab: (tab: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentTab }) => {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(phone, password);
      setCurrentTab('customer-dashboard');
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول، يرجى مراجعة رقم الهاتف وكلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="p-8 rounded-3xl bg-[#0c101c] border border-slate-800 shadow-2xl relative text-right">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-300 p-0.5 mx-auto mb-3 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-[#080c16] rounded-[14px] flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-sky-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white">تسجيل الدخول</h2>
          <p className="text-xs text-slate-400 mt-1">أهلاً بك مجدداً في منظومة Sugar Business</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              رقم الهاتف المسجل
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01000000000"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm text-white placeholder-slate-500 text-right font-mono transition-all"
              />
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm text-white placeholder-slate-500 text-right transition-all"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded text-sky-500 focus:ring-sky-400 bg-slate-900 border-slate-700"
              />
              <span>تذكرني على هذا الجهاز</span>
            </label>

            <button
              type="button"
              onClick={() => setCurrentTab('support')}
              className="text-sky-400 hover:text-sky-300 transition-colors"
            >
              نسيت كلمة المرور؟
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>جاري التحقق...</span>
            ) : (
              <>
                <span>دخول</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-400">
          ليس لديك حساب؟{' '}
          <button
            type="button"
            onClick={() => setCurrentTab('register-customer')}
            className="text-sky-400 font-bold hover:underline"
          >
            إنشاء حساب عميل جديد
          </button>
        </div>
      </div>
    </div>
  );
};
