import React, { useEffect, useState } from 'react';
import { Fingerprint, ScanFace, Trash2, CheckCircle, AlertCircle, ShieldCheck, Smartphone } from 'lucide-react';
import { api } from '../../api/client';
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  performBiometricRegistration,
  clearBiometricDeviceHint,
} from '../../utils/webauthn';

interface RegisteredCredential {
  id: string;
  credentialId: string;
  deviceName: string;
  createdAt: string;
  lastUsedAt?: string | null;
}

export const BiometricSetupCard: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const [supported, setSupported] = useState(false);
  const [platformReady, setPlatformReady] = useState(false);
  const [credentials, setCredentials] = useState<RegisteredCredential[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadCredentials = async () => {
    try {
      const data = await api.getWebAuthnCredentials();
      setCredentials(data?.credentials || []);
    } catch {
      // Ignore if not yet active
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const webAuthnOk = isWebAuthnSupported();
    setSupported(webAuthnOk);
    if (webAuthnOk) {
      isPlatformAuthenticatorAvailable().then(setPlatformReady);
    }
    loadCredentials();
  }, []);

  const handleEnableBiometric = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const res = await performBiometricRegistration();
      setMessage({
        type: 'success',
        text: res?.message || 'تم تفعيل الدخول بالبصمة / الوجه بنجاح على هذا الجهاز!',
      });
      await loadCredentials();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'تعذر تفعيل البصمة على هذا الجهاز.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCredential = async (cred: RegisteredCredential) => {
    setMessage(null);
    try {
      await api.deleteWebAuthnCredential(cred.id);
      clearBiometricDeviceHint(cred.credentialId);
      setCredentials((prev) => prev.filter((item) => item.id !== cred.id));
      setMessage({ type: 'success', text: 'تمت إزالة الجهاز الموثوق بنجاح.' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'فشل إزالة الجهاز.' });
    }
  };

  return (
    <div
      className={`rounded-3xl bg-[#0c101c] border border-slate-800/90 text-right ${
        compact ? 'p-4 sm:p-5' : 'p-5 sm:p-6'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex items-center justify-center text-sky-400 shrink-0">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white">
                الدخول السريع بالبصمة أو الوجه
              </h3>
              {credentials.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  مفعّل ({credentials.length})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              اربط حسابك ببصمة الإصبع أو Face ID للدخول الفوري بدون كتابة كلمة المرور في كل مرة.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleEnableBiometric}
          disabled={loading || !supported}
          className="w-full sm:w-auto shrink-0 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/15 disabled:opacity-50"
        >
          <ScanFace className="w-4 h-4" />
          <span>{loading ? 'جاري مسح البصمة...' : credentials.length > 0 ? 'إضافة جهاز آخر' : 'تفعيل البصمة / الوجه'}</span>
        </button>
      </div>

      {!supported && (
        <div className="mt-3 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>متصفحك الحالي لا يدعم ميزة WebAuthn، يرجى استخدام Chrome أو Safari المحدّث.</span>
        </div>
      )}

      {supported && !platformReady && (
        <div className="mt-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-slate-400 text-[11px]">
          ملاحظة: تأكد من تفعيل بصمة الجهاز أو Face ID أو رمز القفل على هاتفك أو جهازك لإتمام الربط.
        </div>
      )}

      {message && (
        <div
          className={`mt-4 p-3 rounded-xl border text-xs flex items-start gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {!fetching && credentials.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2">
          <div className="text-[11px] font-bold text-slate-400">الأجهزة المرتبطة بالبصمة:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {credentials.map((cred) => (
              <div
                key={cred.id}
                className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-slate-900/70 border border-slate-800"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Smartphone className="w-4 h-4 text-sky-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{cred.deviceName}</div>
                    <div className="text-[10px] text-slate-500">
                      {cred.lastUsedAt
                        ? `آخر دخول: ${new Date(cred.lastUsedAt).toLocaleDateString('ar-EG')}`
                        : `أُضيف: ${new Date(cred.createdAt).toLocaleDateString('ar-EG')}`}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCredential(cred)}
                  title="إزالة هذا الجهاز"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
