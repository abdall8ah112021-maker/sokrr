import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  QrCode,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Coins,
  Store,
  Users,
  Plus,
  ArrowLeft,
  Sparkles,
  Shield,
  Clock,
  Eye,
} from 'lucide-react';
import { Employee, Offer } from '../types';

export const BusinessDashboardPage: React.FC = () => {
  const { user, business, employee } = useAuth();
  const [scanQuery, setScanQuery] = useState('');
  const [resolvedCard, setResolvedCard] = useState<any>(null);
  const [amount, setAmount] = useState('100');
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTx, setSuccessTx] = useState<any>(null);

  // Employees & Offers
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showAddEmpModal, setShowAddEmpModal] = useState(false);
  const [showAddOfferModal, setShowAddOfferModal] = useState(false);

  // New Employee Form
  const [empName, setEmpName] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empJobTitle, setEmpJobTitle] = useState('كاشير ومسؤول مسح الكروت');

  // New Offer Form
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDiscount, setOfferDiscount] = useState('15');
  const [offerDiscountType, setOfferDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [offerDesc, setOfferDesc] = useState('');

  useEffect(() => {
    if (user?.role === 'BUSINESS') {
      api.getMyEmployees().then((res) => setEmployees(Array.isArray(res) ? res : [])).catch(() => setEmployees([]));
      api.getActiveOffers().then((list: any[]) => {
        if (business && Array.isArray(list)) {
          setOffers(list.filter((o: any) => o && o.businessId === business.id));
        } else {
          setOffers([]);
        }
      }).catch(() => setOffers([]));
    }
  }, [user, business]);

  // 1. Resolve Card QR or Card Number
  const handleResolveCard = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!scanQuery) return;
    setResolving(true);
    setError(null);
    setResolvedCard(null);
    setSuccessTx(null);

    try {
      const data = await api.resolveQr(scanQuery.trim());
      setResolvedCard(data);
    } catch (err: any) {
      setError(err.message || 'تعذر التحقق من بيانات الكارت');
    } finally {
      setResolving(false);
    }
  };

  // 2. Confirm Purchase & Award Points (Idempotent)
  const handleConfirmPurchase = async () => {
    if (!resolvedCard) return;
    setLoading(true);
    setError(null);

    const idempotencyKey = `tx_${resolvedCard.card.id}_${Date.now()}`;

    try {
      const res = await api.createPurchase(resolvedCard.card.id, Number(amount) || 0, idempotencyKey);
      setSuccessTx(res);
      setResolvedCard(null);
      setScanQuery('');
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل المعاملة');
    } finally {
      setLoading(false);
    }
  };

  // 3. Create Employee
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newEmp = await api.createEmployee({
        name: empName,
        phone: empPhone,
        password: empPassword,
        jobTitle: empJobTitle,
      });
      setEmployees([...employees, newEmp]);
      setShowAddEmpModal(false);
      setEmpName('');
      setEmpPhone('');
      setEmpPassword('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 4. Create Offer
  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const thirtyDaysLater = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    try {
      const res = await api.createOffer({
        title: offerTitle,
        description: offerDesc,
        discount: Number(offerDiscount),
        discountType: offerDiscountType,
        startDate: now.toISOString(),
        endDate: thirtyDaysLater.toISOString(),
      });
      setOffers([...offers, res.offer]);
      setShowAddOfferModal(false);
      setOfferTitle('');
      setOfferDesc('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 text-right">
      {/* Business Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0c1220] via-[#090e1a] to-[#060910] border border-sky-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Store className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-bold">بوابة الشريك التجاري المعتمد</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {business?.businessName || (employee ? `كاشير: ${employee.name}` : 'متجر Sugar Business')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            المحافظة: <strong className="text-slate-200">{business?.governorate || 'القاهرة'}</strong> •{' '}
            حالة الإدراج في الدليل: <span className="text-emerald-400 font-bold">نشط ومعروض للجمهور</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="py-2 px-4 rounded-xl bg-sky-950/80 border border-sky-400/30 text-sky-300 text-xs font-mono font-bold">
            نقاط العملية: 10 نقاط افتراضية
          </span>
        </div>
      </div>

      {/* Main Section: Card Scanner & Purchase Flow (Section 34) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Scan & Transaction Panel */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-sky-400" />
              <span>مسح الكارت وتسجيل عملية الشراء</span>
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">STEP 1 OF 2</span>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successTx && (
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-sm space-y-2 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">تمت العملية وإضافة النقاط بنجاح!</h3>
              <p className="text-xs text-slate-300">
                رقم المعاملة: <span className="font-mono text-sky-300 font-bold">{successTx.transactionId}</span>
              </p>
              <div className="inline-block py-1.5 px-4 rounded-full bg-emerald-900/60 font-bold text-emerald-300 text-xs font-mono">
                +{successTx.pointsAwarded} نقطة أُضيفت لرصيد العميل
              </div>
            </div>
          )}

          {/* Scanner Input Form */}
          <form onSubmit={handleResolveCard} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                أدخل رمز الـ QR أو رقم الكارت البلاستيكي
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scanQuery}
                  onChange={(e) => setScanQuery(e.target.value)}
                  placeholder="مثال: SUGAR-8849-2026 أو QR-SUGAR-..."
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 focus:ring-1 focus:ring-sky-400 text-sm text-white placeholder-slate-500 font-mono text-right"
                />
                <button
                  type="submit"
                  disabled={resolving || !scanQuery}
                  className="py-3 px-6 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors disabled:opacity-50"
                >
                  {resolving ? 'جاري الفحص...' : 'فحص الكارت'}
                </button>
              </div>
            </div>
          </form>

          {/* Step 2: Card Verification Result & Purchase Confirmation */}
          {resolvedCard && (
            <div className="pt-6 border-t border-slate-800 space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400">بيانات الكارت المعتمد</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                    {resolvedCard.card.status === 'ACTIVE' ? 'نشط وصالح' : resolvedCard.card.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">اسم العميل:</span>
                    <strong className="text-white text-sm">{resolvedCard.customer.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">رقم الكارت:</span>
                    <strong className="text-sky-300 font-mono text-sm">{resolvedCard.card.cardNumber}</strong>
                  </div>
                </div>
              </div>

              {/* Purchase amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  قيمة فاتورة الشراء (ج.م)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono text-right"
                />
              </div>

              <button
                type="button"
                onClick={handleConfirmPurchase}
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>جاري تسجيل المعاملة...</span>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-slate-950" />
                    <span>تأكيد عملية الشراء وإضافة النقاط فورياً</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Employees & Offers Management */}
        <div className="lg:col-span-5 space-y-6">
          {/* Business Employees Box */}
          <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-sky-400" />
                <span>طاقم العمل وموظفو المسح ({employees.length})</span>
              </h3>
              {user?.role === 'BUSINESS' && (
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(true)}
                  className="py-1 px-2.5 rounded-lg bg-sky-950 border border-sky-400/30 text-sky-300 text-xs font-semibold hover:bg-sky-900 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة موظف</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-800/80">
              {employees.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">لا يوجد موظفون إضافيون حالياً.</p>
              ) : (
                employees.map((emp) => (
                  <div key={emp.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-white">{emp.name}</p>
                      <span className="text-[10px] text-slate-400">{emp.jobTitle}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">نشط</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active Offers Box */}
          <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>عروض وخصومات المتجر ({offers.length})</span>
              </h3>
              {user?.role === 'BUSINESS' && (
                <button
                  type="button"
                  onClick={() => setShowAddOfferModal(true)}
                  className="py-1 px-2.5 rounded-lg bg-sky-950 border border-sky-400/30 text-sky-300 text-xs font-semibold hover:bg-sky-900 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إنشاء عرض</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {offers.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">لا توجد عروض نشطة حالياً لهذا المتجر.</p>
              ) : (
                offers.map((offer) => (
                  <div key={offer.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <strong className="text-white">{offer.title}</strong>
                      <span className="text-sky-300 font-bold font-mono">
                        خصم {offer.discount}%
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{offer.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddEmpModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-[#0c101c] border border-slate-800 text-right space-y-4">
            <h3 className="text-base font-bold text-white">إضافة موظف / كاشير جديد</h3>
            <form onSubmit={handleAddEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">اسم الموظف</label>
                <input
                  type="text"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="محمد أحمد"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-right"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">رقم الهاتف للدخول</label>
                <input
                  type="tel"
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  placeholder="010XXXXXXXX"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-right"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  value={empPassword}
                  onChange={(e) => setEmpPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-right"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">المسمى الوظيفي</label>
                <input
                  type="text"
                  value={empJobTitle}
                  onChange={(e) => setEmpJobTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-right"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold"
                >
                  حفظ الموظف
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEmpModal(false)}
                  className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Offer Modal */}
      {showAddOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-[#0c101c] border border-slate-800 text-right space-y-4">
            <h3 className="text-base font-bold text-white">إنشاء عرض ترويجي جديد</h3>
            <form onSubmit={handleAddOffer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">عنوان العرض</label>
                <input
                  type="text"
                  value={offerTitle}
                  onChange={(e) => setOfferTitle(e.target.value)}
                  placeholder="خصم 15% على المشروبات الساخنة"
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-right"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">نسبة / قيمة الخصم</label>
                  <input
                    type="number"
                    value={offerDiscount}
                    onChange={(e) => setOfferDiscount(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-right"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">نوع الخصم</label>
                  <select
                    value={offerDiscountType}
                    onChange={(e) => setOfferDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-right"
                  >
                    <option value="PERCENTAGE">نسبة مئوية (%)</option>
                    <option value="FIXED">مبلغ ثابت (ج.م)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">تفاصيل وشروط العرض</label>
                <textarea
                  rows={2}
                  value={offerDesc}
                  onChange={(e) => setOfferDesc(e.target.value)}
                  placeholder="يسري العرض عند إبراز كارت Sugar Business..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-right"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold"
                >
                  إرسال للمراجعة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddOfferModal(false)}
                  className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
