import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Phone, AlertCircle, ArrowLeft, KeyRound, Fingerprint, ScanFace, Sparkles, Clock } from 'lucide-react';
import {
  isWebAuthnSupported,
  getBiometricDeviceHint,
  BiometricDeviceHint,
} from '../utils/webauthn';

interface LoginPageProps {
  setCurrentTab: (tab: string) => void;
}

function formatCountdown(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${String(hrs).padStart(2, '0')}:${String(remMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const LoginPage: React.FC<LoginPageProps> = ({ setCurrentTab }) => {
  const { login, loginWithBiometric } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [webAuthnReady, setWebAuthnReady] = useState(false);
  const [deviceHint, setDeviceHint] = useState<BiometricDeviceHint | null>(null);

  useEffect(() => {
    setWebAuthnReady(isWebAuthnSupported());
    const hint = getBiometricDeviceHint();
    setDeviceHint(hint);
    if (hint?.phone) {
      setPhone((prev) => prev || hint.phone);
    }
  }, []);

  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [lockoutSeconds]);

  const navigateByRole = (role?: string) => {
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      setCurrentTab('admin-dashboard');
    } else if (role === 'BUSINESS' || role === 'EMPLOYEE') {
      setCurrentTab('business-dashboard');
    } else {
      setCurrentTab('customer-dashboard');
    }
  };

  const applyLockoutFromError = (err: any) => {
    if (err?.code === 'ACCOUNT_LOCKED') {
      let secs = Number(err?.details?.remainingSeconds || 0);
      if (!secs && err?.details?.lockUntil) {
        secs = Math.max(1, Math.ceil((new Date(err.details.lockUntil).getTime() - Date.now()) / 1000));
      }
      if (secs > 0) {
        setLockoutSeconds(secs);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;
    setError(null);
    setLoading(true);

    try {
      const loggedInUser = await login(phone, password);
      setLockoutSeconds(0);
      navigateByRole(loggedInUser?.role);
    } catch (err: any) {
      applyLockoutFromError(err);
      setError(err.message || 'فشل تسجيل الدخول، يرجى مراجعة رقم الهاتف وكلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setError(null);
    setBiometricLoading(true);
    try {
      const targetPhone = phone.trim() || deviceHint?.phone;
      const loggedInUser = await loginWithBiometric(targetPhone);
      setLockoutSeconds(0);
      navigateByRole(loggedInUser?.role);
    } catch (err: any) {
      applyLockoutFromError(err);
      setError(err.message || 'تعذر تسجيل الدخول بالبصمة، يمكنك الدخول برقم الهاتف وكلمة المرور.');
    } finally {
      setBiometricLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-12 px-4">
      <div className="p-5 sm:p-8 rounded-3xl bg-[#0c101c] border border-slate-800 shadow-2xl relative text-right">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-300 p-0.5 mx-auto mb-3 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-[#080c16] rounded-[14px] flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-sky-400" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">تسجيل الدخول</h2>
          <p className="text-xs text-slate-400 mt-1">أهلاً بك مجدداً في منظومة Sugar Business</p>
        </div>

        {lockoutSeconds > 0 && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-amber-200 text-xs space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>فترة انتظار مؤقتة لحماية الحساب</span>
              </div>
              <span className="font-mono font-black text-base text-amber-300 bg-amber-950 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
                {formatCountdown(lockoutSeconds)}
              </span>
            </div>
            {error && <p className="leading-relaxed text-amber-100/90">{error}</p>}
          </div>
        )}

        {error && lockoutSeconds <= 0 && (
          <div className="mb-5 p-3.5 sm:p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Quick Biometric Card if device already linked */}
        {webAuthnReady && deviceHint && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-sky-950/40 via-[#0e1528] to-cyan-950/30 border border-sky-500/30 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-white truncate">
                    مرحباً، {deviceHint.displayName}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">{deviceHint.phone}</div>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 shrink-0">
                <Sparkles className="w-3 h-3" />
                بصمة مفعلة
              </span>
            </div>

            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={biometricLoading || loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-black text-sm transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ScanFace className="w-5 h-5" />
              <span>{biometricLoading ? 'جاري التحقق بالبصمة...' : 'دخول فوري بالبصمة أو الوجه'}</span>
            </button>
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
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (lockoutSeconds > 0) setLockoutSeconds(0);
                }}
                placeholder="01000000000"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm text-white placeholder-slate-500 text-right font-mono transition-all"
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm text-white placeholder-slate-500 text-right transition-all"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-1">
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
            disabled={loading || biometricLoading || lockoutSeconds > 0}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>جاري التحقق...</span>
            ) : lockoutSeconds > 0 ? (
              <>
                <Clock className="w-4 h-4" />
                <span>يرجى الانتظار ({formatCountdown(lockoutSeconds)})</span>
              </>
            ) : (
              <>
                <span>دخول بكلمة المرور</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Alternative Biometric Button when no device hint cached yet */}
          {webAuthnReady && !deviceHint && (
            <div className="pt-2">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800" />
                <span className="shrink mx-3 text-[11px] text-slate-500">أو الدخول السريع</span>
                <div className="flex-grow border-t border-slate-800" />
              </div>

              <button
                type="button"
                onClick={handleBiometricLogin}
                disabled={biometricLoading || loading}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-sky-500/40 text-sky-300 font-bold text-sm transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                <Fingerprint className="w-5 h-5 text-sky-400" />
                <span>
                  {biometricLoading ? 'جاري التحقق البيومتري...' : 'الدخول بالبصمة أو الوجه (WebAuthn)'}
                </span>
              </button>
              <p className="text-[11px] text-slate-500 text-center mt-2">
                أدخل رقم هاتفك واضغط للدخول بالبصمة (يتم تفعيلها أولاً من لوحة حسابك).
              </p>
            </div>
          )}
        </form>

        <div className="mt-6 sm:mt-8 pt-5 border-t border-slate-800 text-center text-xs text-slate-400">
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
