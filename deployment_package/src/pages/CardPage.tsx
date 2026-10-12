import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card3D } from '../components/common/Card3D';
import {
  CreditCard,
  QrCode,
  Shield,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  Copy,
  Printer,
  Sparkles,
} from 'lucide-react';

interface CardPageProps {
  setCurrentTab: (tab: string) => void;
}

export const CardPage: React.FC<CardPageProps> = ({ setCurrentTab }) => {
  const { user, card, customer, pointAccount } = useAuth();
  const [replacementRequested, setReplacementRequested] = useState(false);

  const isPending = user?.status === 'PENDING' || !card;

  const handleRequestReplacement = () => {
    setReplacementRequested(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 text-right">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-sky-950/70 border border-sky-400/30 text-sky-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>كارت الولاء البلاستيكي المعتمد</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">كارتك الذكي ورمز الـ QR</h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          أبرز هذا الكارت أو رمز الـ QR للكاشير عند كل عملية شراء لتجميع النقاط الفورية والاستفادة من خصومات الشركاء.
        </p>
      </div>

      {isPending && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/50 border border-amber-500/40 text-right space-y-1">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>تم إرسال طلبك للمسؤول، يرجى انتظار الموافقة لتفعيل كارتك</span>
          </div>
          <p className="text-xs text-amber-200/80 mr-7">
            طلبك قيد المراجعة من قبل إدارة المنظومة. سيتم إصدار وتفعيل كارتك تلقائياً فور مراجعة البيانات واعتمادها.
          </p>
        </div>
      )}

      {/* 3D Interactive Card Showcase */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-lg p-6 sm:p-10 rounded-3xl bg-[#0c111e] border border-sky-500/20 shadow-2xl flex flex-col items-center">
          <Card3D card={card} customer={customer} pointsBalance={pointAccount?.balance || 0} />
        </div>
      </div>

      {/* Card Info & Actions Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#0b0f1b] border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">حالة الكارت</span>
          <p className={`text-base font-bold flex items-center gap-1.5 ${isPending ? 'text-amber-400' : 'text-emerald-400'}`}>
            {isPending ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>قيد المراجعة (معلق)</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>نشط وصالح للشراء</span>
              </>
            )}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b0f1b] border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">تاريخ انتهاء الصلاحية</span>
          <p className="text-base font-mono font-bold text-slate-200">
            {card?.expiryDate
              ? new Date(card.expiryDate).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })
              : '2027/09/27'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b0f1b] border border-slate-800 space-y-1">
          <span className="text-xs text-slate-400">الرصيد المتاح للإنفاق</span>
          <p className="text-base font-mono font-bold text-amber-400">
            {pointAccount?.balance || 350} نقطة
          </p>
        </div>
      </div>

      {/* Security & Replacement Options */}
      <div className="p-6 rounded-2xl bg-[#090d16] border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-sky-400" />
            <span>فقدت كارتك أو ترغب في طلب بدل فاقد؟</span>
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            في حال تلف أو فقدان كارتك البلاستيكي، يمكنك طلب كارت بديل مع الحفاظ التام على رصيدك ونقاطك السابقة.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRequestReplacement}
          disabled={replacementRequested}
          className="py-2.5 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors self-start sm:self-auto shrink-0"
        >
          {replacementRequested ? 'تم إرسال الطلب للإدارة' : 'طلب كارت بديل'}
        </button>
      </div>

      {replacementRequested && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs">
          تم استلام طلب إصدار الكارت البديل بنجاح وسيتم التواصل معك من قِبل الإدارة لتأكيد العنوان وشحن الكارت.
        </div>
      )}
    </div>
  );
};
