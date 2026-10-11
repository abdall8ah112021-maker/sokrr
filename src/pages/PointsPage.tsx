import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import {
  Coins,
  Award,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  AlertCircle,
  Calendar,
  ShieldAlert,
  ShoppingBag,
} from 'lucide-react';
import { PointLedger } from '../types';

interface PointsPageProps {
  setCurrentTab: (tab: string) => void;
}

export const PointsPage: React.FC<PointsPageProps> = ({ setCurrentTab }) => {
  const { customer, pointAccount } = useAuth();
  const [ledger, setLedger] = useState<PointLedger[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyPoints()
      .then((data) => setLedger(data.ledger || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const balance = pointAccount?.balance ?? 350;
  const isNegative = balance < 0;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8 text-right">
      {/* Header & Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0c1220] via-[#090e1a] to-[#060910] border border-amber-500/30 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">رصيد النقاط الفعلي</span>
            <Coins className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`font-mono text-4xl font-black ${isNegative ? 'text-rose-400' : 'text-amber-400'}`}>
              {balance}
            </span>
            <span className="text-xs text-slate-400">نقطة</span>
          </div>
          {isNegative ? (
            <p className="text-[11px] text-rose-400">
              الرصيد سالب. استبدال المكافآت معلق حالياً، والنقاط الجديدة ستسدد الرصيد السالب أولاً.
            </p>
          ) : (
            <p className="text-[11px] text-slate-400">
              جاهزة للاستبدال الفوري في متجر المكافآت.
            </p>
          )}
        </div>

        <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">إجمالي النقاط التاريخية</span>
            <Award className="w-5 h-5 text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl font-black text-sky-300">
              {pointAccount?.totalEarnedHistorical ?? 450}
            </span>
            <span className="text-xs text-slate-400">نقطة مكتسبة</span>
          </div>
          <p className="text-[11px] text-slate-400">
            تُحدد مستواك في برنامج الولاء (فضي / ذهبي / بلاتيني VIP).
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">صلاحية النقاط وتاريخ الانتهاء</span>
            <Clock className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-bold text-white">6 أشهر</span>
          </div>
          <p className="text-[11px] text-slate-400">
            تنتهي صلاحية كل حركة نقاط بعد 6 أشهر مع تنبيهات مسبقة قبل 30 يوماً و 7 أيام.
          </p>
        </div>
      </div>

      {/* Spend CTA */}
      <div className="p-5 rounded-2xl bg-[#090d16] border border-slate-800 flex items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-white text-sm">استبدل نقاطك الآن بمنتجات حصرية</h4>
          <p className="text-xs text-slate-400 mt-0.5">تصفح متجر Sugar Business واختر من باقة الإلكترونيات والهدايا الفاخرة.</p>
        </div>
        <button
          type="button"
          onClick={() => setCurrentTab('store')}
          className="py-2 px-5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>تصفح المتجر</span>
        </button>
      </div>

      {/* Point Ledger Table (Section 36) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-2">
          <Clock className="w-5 h-5 text-sky-400" />
          <span>سجل حركات النقاط المعتمد (Point Ledger)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-right">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 pr-2">رقم المعاملة</th>
                <th className="pb-3">النوع</th>
                <th className="pb-3">البيان والسبب</th>
                <th className="pb-3">النقاط</th>
                <th className="pb-3">الرصيد بعد الحركة</th>
                <th className="pb-3">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {ledger.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 pr-2 text-slate-400 font-semibold">{item.transactionId}</td>
                  <td className="py-3 font-sans">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        item.type === 'EARN'
                          ? 'bg-emerald-950 text-emerald-400'
                          : item.type === 'SPEND'
                          ? 'bg-amber-950 text-amber-400'
                          : 'bg-purple-950 text-purple-400'
                      }`}
                    >
                      {item.type === 'EARN' ? 'اكتساب' : item.type === 'SPEND' ? 'استبدال' : 'تعديل'}
                    </span>
                  </td>
                  <td className="py-3 font-sans text-slate-200">{item.reason || '-'}</td>
                  <td className={`py-3 font-bold ${item.points > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.points > 0 ? `+${item.points}` : item.points}
                  </td>
                  <td className="py-3 text-slate-300 font-bold">{item.balanceAfter} pt</td>
                  <td className="py-3 text-slate-500">
                    {new Date(item.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
