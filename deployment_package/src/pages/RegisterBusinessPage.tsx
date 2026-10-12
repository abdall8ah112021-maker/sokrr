import React, { useState } from 'react';
import { api } from '../api/client';
import { Store, CheckCircle2, AlertCircle, ArrowLeft, Shield, Clock } from 'lucide-react';

interface RegisterBusinessPageProps {
  setCurrentTab: (tab: string) => void;
}

export const RegisterBusinessPage: React.FC<RegisterBusinessPageProps> = ({ setCurrentTab }) => {
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [sectorId, setSectorId] = useState('sec_01');
  const [type, setType] = useState('متجر تجاري / كافيه');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await api.registerBusiness({
        businessName,
        ownerName,
        phone,
        email,
        password,
        governorate,
        city,
        address,
        sectorId,
        type,
        description,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء إرسال طلب الشراكة');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 text-right">
        <div className="p-8 rounded-3xl bg-[#0c101c] border border-amber-500/40 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-amber-950/80 border border-amber-500/50 text-amber-400 mx-auto flex items-center justify-center">
            <Clock className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white">الطلب قيد المراجعة والتدقيق</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            تم استلام طلب انضمام نشاطك التجاري (<span className="text-sky-300 font-bold">{businessName}</span>) بنجاح. سيقوم فريق مراجعة الشركاء بالتدقيق وتفعيل الحساب وتعيين أجهزة وكروت المنظومة.
          </p>

          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-1.5 text-right">
            <div className="flex justify-between">
              <span>مسؤول النشاط:</span>
              <span className="text-white">{ownerName}</span>
            </div>
            <div className="flex justify-between">
              <span>رقم التواصل:</span>
              <span className="font-mono text-white">{phone}</span>
            </div>
            <div className="flex justify-between">
              <span>حالة الطلب:</span>
              <span className="text-amber-400 font-bold">بانتظار المراجعة (Pending)</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('home')}
            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700 transition-all"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="p-8 sm:p-10 rounded-3xl bg-[#0c101c] border border-slate-800 shadow-2xl text-right">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-300 p-0.5 mx-auto mb-3 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-[#080c16] rounded-[14px] flex items-center justify-center">
              <Store className="w-6 h-6 text-sky-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white">تسجيل شريك تجاري معتمد</h2>
          <p className="text-xs text-slate-400 mt-1">انضم لشبكة Sugar Business لكسب عملاء جدد ومكافأتهم بنقاط ولاء فورية</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                اسم المتجر / النشاط التجاري <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="مثال: مطعم وسويتس السكر"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm text-white placeholder-slate-500 text-right transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                اسم المالك / الشخص المسؤول <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="اسم المسؤول المفوض"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm text-white placeholder-slate-500 text-right transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                رقم هاتف المنشأة / الإدارة <span className="text-rose-400">*</span>
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
                البريد الإلكتروني التجاري
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@business.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm text-white placeholder-slate-500 text-right font-mono transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                كلمة المرور للدخول <span className="text-rose-400">*</span>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                القطاع التجاري <span className="text-rose-400">*</span>
              </label>
              <select
                value={sectorId}
                onChange={(e) => setSectorId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 text-sm text-white text-right transition-all"
              >
                <option value="sec_01">المطاعم والكافيهات</option>
                <option value="sec_02">الملابس والأزياء</option>
                <option value="sec_03">الصحة والجمال والعناية</option>
                <option value="sec_04">خدمات وصيانة السيارات</option>
                <option value="sec_05">الإلكترونيات والتقنية</option>
                <option value="sec_06">المنزل والديكور</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                المحافظة <span className="text-rose-400">*</span>
              </label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 text-sm text-white text-right transition-all"
              >
                <option value="القاهرة">القاهرة</option>
                <option value="الجيزة">الجيزة</option>
                <option value="الإسكندرية">الإسكندرية</option>
                <option value="القليوبية">القليوبية</option>
                <option value="الشرقية">الشرقية</option>
                <option value="الدقهلية">الدقهلية</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                المدينة / الحي <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="مثال: المعادي"
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 text-sm text-white placeholder-slate-500 text-right transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              العنوان التفصيلي للفرع الرئيسي <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="اسم الشارع، رقم المبنى، علامة مميزة"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 text-sm text-white placeholder-slate-500 text-right transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              نبذة مختصرة عن المتجر وعروضه
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="صف منتجاتك أو خدماتك والمزايا التي تقدمها لأعضاء المنظومة..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 text-sm text-white placeholder-slate-500 text-right transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-bold text-sm shadow-xl shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>جاري الإرسال...</span>
            ) : (
              <>
                <span>إرسال طلب الانضمام كشريك معتمد</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
