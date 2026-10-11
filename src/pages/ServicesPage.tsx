import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Coffee,
  Car,
  Smile,
  ShoppingBag,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
} from 'lucide-react';
import { Service, Sector } from '../types';

interface ServicesPageProps {
  setCurrentTab: (tab: string) => void;
  setSelectedServiceId: (id: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({
  setCurrentTab,
  setSelectedServiceId,
}) => {
  const { user } = useAuth();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  // Request Modal
  const [requestServiceModal, setRequestServiceModal] = useState<Service | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getSectors().then(setSectors).catch(() => {});
    api.getServices().then(setServices).catch(() => {});
  }, []);

  const filteredServices = selectedSector === 'ALL'
    ? services
    : services.filter((s) => s.sectorId === selectedSector);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestServiceModal) return;
    setLoading(true);
    setSuccessMsg(null);

    try {
      const res = await api.requestService({
        serviceId: requestServiceModal.id,
        customerNotes: notes,
      });
      setSuccessMsg(res.message);
      setNotes('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 text-right">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">شبكة الخدمات المعتمدة</span>
          <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">الخدمات والعناية الخاصة</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            خدمات متخصصة بأسعار مخفضة ونقاط ولاء فورية تُضاف لحسابك عند كل زيارة
          </p>
        </div>

        {/* Sectors Segmented Filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedSector('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedSector === 'ALL'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            جميع القطاعات
          </button>
          {sectors.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setSelectedSector(sec.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedSector === sec.id
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {sec.nameAr}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredServices.map((srv) => (
          <div
            key={srv.id}
            className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800 hover:border-sky-500/30 transition-all flex flex-col justify-between text-right group shadow-lg"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-950/70 border border-sky-400/30 flex items-center justify-center mb-4 text-sky-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors mb-2">
                {srv.nameAr}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                {srv.shortDescription}
              </p>
              <div className="text-[11px] text-slate-500 mb-4">
                الفئة المستهدفة: <strong className="text-slate-400 font-normal">{srv.targetAudience}</strong>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    setCurrentTab('login');
                  } else {
                    setRequestServiceModal(srv);
                    setSuccessMsg(null);
                  }
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20"
              >
                <span>طلب الخدمة الآن</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Request Service Modal */}
      {requestServiceModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-[#0c101c] border border-slate-800 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">طلب خدمة: {requestServiceModal.nameAr}</h3>
            </div>

            {successMsg ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs space-y-3 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p>{successMsg}</p>
                <button
                  type="button"
                  onClick={() => setRequestServiceModal(null)}
                  className="py-1.5 px-4 rounded-lg bg-slate-900 text-white text-xs font-semibold"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="space-y-3 text-xs">
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  سيتم تسجيل طلبك وتعيين الشريك الأنسب في محافظتك، وسيصلك إشعار بالموعد المحدد.
                </p>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">ملاحظات أو مواعيد مفضلة (اختياري)</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أي تفاصيل ترغب في توضيحها لمقدم الخدمة..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-right"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 rounded-xl bg-sky-500 text-slate-950 font-bold"
                  >
                    {loading ? 'جاري الإرسال...' : 'تأكيد طلب الخدمة'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestServiceModal(null)}
                    className="py-2 px-4 rounded-xl bg-slate-800 text-slate-300"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
