import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreditCard, CheckCircle2, AlertCircle, ArrowLeft, Shield } from 'lucide-react';

interface RegisterCustomerPageProps {
  setCurrentTab: (tab: string) => void;
}

export const RegisterCustomerPage: React.FC<RegisterCustomerPageProps> = ({ setCurrentTab }) => {
  const { registerCustomer } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerCustomer({
        fullName,
        phone,
        email: email || undefined,
        password,
        governorate,
        city,
        address,
      });
      setSuccessData({
        fullName,
        phone,
        governorate,
      });
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مجدداً');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-right">
        <div className="p-8 rounded-3xl bg-[#0c101c] border border-sky-500/40 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white">تم إنشاء حسابك بنجاح!</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            أهلاً بك يا <span className="text-sky-300 font-bold">{successData.fullName}</span> في Sugar Business. تم إصدار كارتك البلاستيكي الذكي الأول وهو متاح الآن في محفظتك.
          </p>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1.5 text-right">
            <div className="flex justify-between">
              <span>رقم الهاتف:</span>
              <span className="font-mono text-white">{successData.phone}</span>
            </div>
            <div className="flex justify-between">
              <span>المحافظة:</span>
              <span className="text-white">{successData.governorate}</span>
            </div>
            <div className="flex justify-between">
              <span>حالة الكارت:</span>
              <span className="text-emerald-400 font-bold">نشط ومفعل</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('card')}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-bold text-sm shadow-xl shadow-sky-500/25 transition-all flex items-center justify-center gap-2"
          >
            <CreditCard className="w-5 h-5 text-slate-950" />
            <span>استعراض كارتي ورمز الـ QR</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="p-8 sm:p-10 rounded-3xl bg-[#0c101c] border border-slate-800 shadow-2xl relative text-right">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-300 p-0.5 mx-auto mb-3 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-[#080c16] rounded-[14px] flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-sky-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white">طلب كارت العضوية وإنشاء حساب</h2>
          <p className="text-xs text-slate-400 mt-1">انضم لبرنامج مكافآت Sugar Business واحصل على كارتك البلاستيكي الذكي</p>
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
              الاسم بالكامل (ثلاثي أو رباعي) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="مثال: محمد أحمد إبراهيم"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm text-white placeholder-slate-500 text-right transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                رقم الهاتف (المسجل عليه الكارت) <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010XXXXXXXX"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm text-white placeholder-slate-500 text-right font-mono transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                البريد الإلكتروني (اختياري)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm text-white placeholder-slate-500 text-right font-mono transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              كلمة المرور <span className="text-rose-400">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm text-white placeholder-slate-500 text-right transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                المحافظة <span className="text-rose-400">*</span>
              </label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm text-white text-right transition-all"
              >
                <option value="القاهرة">القاهرة</option>
                <option value="الجيزة">الجيزة</option>
                <option value="الإسكندرية">الإسكندرية</option>
                <option value="القليوبية">القليوبية</option>
                <option value="الشرقية">الشرقية</option>
                <option value="الدقهلية">الدقهلية</option>
                <option value="الغربية">الغربية</option>
                <option value="بورسعيد">بورسعيد</option>
                <option value="السويس">السويس</option>
                <option value="المنيا">المنيا</option>
                <option value="أسيوط">أسيوط</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                المدينة / المنطقة <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="مثال: المعادي / مدينة نصر"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm text-white placeholder-slate-500 text-right transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              العنوان التفصيلي لتوصيل الكارت
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="اسم الشارع، رقم المبنى، رقم الشقة"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm text-white placeholder-slate-500 text-right transition-all"
            />
          </div>

          <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-400/20 text-xs text-sky-300 flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400 shrink-0" />
            <span>الكارت البلاستيكي يصدر برقم تسلسلي فريد ومحمي بتشفير أمني لمنع التكرار أو التلاعب.</span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-bold text-sm shadow-xl shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>جاري إصدار الكارت...</span>
            ) : (
              <>
                <span>تأكيد التسجيل وإصدار كارتي الآن</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          هل أنت صاحب منشأة تجارية أو متجر؟{' '}
          <button
            type="button"
            onClick={() => setCurrentTab('register-business')}
            className="text-sky-400 font-bold hover:underline"
          >
            تسجيل كشريك تجاري معتمد
          </button>
        </div>
      </div>
    </div>
  );
};
