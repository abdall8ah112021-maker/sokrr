import React, { useState, useEffect, useMemo } from 'react';
import {
  Tag,
  Percent,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Search,
  CheckCircle2,
  Eye,
  EyeOff,
  MapPin,
  Phone,
  Calendar,
  FileText,
  Sliders,
  RefreshCw,
  Layers,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import {
  DiscountService,
  DiscountPageConfig,
  DiscountPageBlock,
  Governorate,
} from '../../types';

interface AdminDiscountPageProps {
  discountServices: DiscountService[];
  governorates: Governorate[];
  discountPageConfig: DiscountPageConfig | null;
  onCreateService: (data: any) => Promise<void> | void;
  onUpdateService: (id: string, data: any) => Promise<void> | void;
  onDeleteService: (id: string) => Promise<void> | void;
  onSaveConfig: (config: Partial<DiscountPageConfig>) => Promise<void> | void;
  onRefresh?: () => void;
}

const DEFAULT_DISCOUNT_PAGE_CONFIG: DiscountPageConfig = {
  badge: 'عروض وخصومات حصرية للأعضاء',
  title: 'صفحة "خصمك عندنا"',
  subtitle: 'استمتع بأقوى الخصومات والخدمات الخاصة بأعضاء Sugar Business في محافظتك.',
  announcement: '',
  emptyMessage: 'لا توجد عروض خصم مسجلة لهذه المحافظة حالياً. تابعنا قريباً!',
  customBlocks: [],
};

export const AdminDiscountPage: React.FC<AdminDiscountPageProps> = ({
  discountServices,
  governorates,
  discountPageConfig,
  onCreateService,
  onUpdateService,
  onDeleteService,
  onSaveConfig,
  onRefresh,
}) => {
  const [subTab, setSubTab] = useState<'offers' | 'blocks' | 'content'>('offers');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGovId, setFilterGovId] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [showAddOffer, setShowAddOffer] = useState(false);

  const [configState, setConfigState] = useState<DiscountPageConfig>(
    discountPageConfig || DEFAULT_DISCOUNT_PAGE_CONFIG
  );
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const safeGovernorates: Governorate[] =
    Array.isArray(governorates) && governorates.length > 0
      ? governorates
      : [
          { id: 'gov_cairo', nameAr: 'القاهرة', nameEn: 'Cairo', available: true, deliveryFee: 45 },
          { id: 'gov_giza', nameAr: 'الجيزة', nameEn: 'Giza', available: true, deliveryFee: 45 },
          { id: 'gov_alex', nameAr: 'الإسكندرية', nameEn: 'Alexandria', available: true, deliveryFee: 55 },
        ];

  const [newOffer, setNewOffer] = useState({
    title: '',
    discountPercentage: '20',
    discountLabel: 'خصم 20%',
    offerDetails: '',
    governorateId: safeGovernorates[0]?.id || 'gov_cairo',
    subscriptionPrice: '0',
    validityDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
    phone: '',
    whatsapp: '',
    imageUrl: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editOffer, setEditOffer] = useState<any>({});

  // Custom Blocks State
  const [newBlock, setNewBlock] = useState({
    title: '',
    badge: '',
    content: '',
  });

  useEffect(() => {
    if (discountPageConfig) {
      setConfigState({
        ...DEFAULT_DISCOUNT_PAGE_CONFIG,
        ...discountPageConfig,
        customBlocks: Array.isArray(discountPageConfig.customBlocks)
          ? discountPageConfig.customBlocks
          : [],
      });
    }
  }, [discountPageConfig]);

  const safeServices = Array.isArray(discountServices) ? discountServices : [];

  const stats = useMemo(() => {
    const activeCount = safeServices.filter((s) => s.status === 'ACTIVE').length;
    const percentages = safeServices
      .map((s) => Number(s.discountPercentage || 0))
      .filter((n) => n > 0);
    const maxDiscount = percentages.length > 0 ? Math.max(...percentages) : 0;
    return {
      total: safeServices.length,
      active: activeCount,
      maxDiscount,
      blocksCount: (configState.customBlocks || []).length,
    };
  }, [safeServices, configState.customBlocks]);

  const filteredServices = safeServices.filter((srv) => {
    if (!srv) return false;
    if (filterGovId !== 'ALL' && srv.governorateId !== filterGovId) return false;
    if (filterStatus !== 'ALL' && srv.status !== filterStatus) return false;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      srv.title?.toLowerCase().includes(q) ||
      srv.discountLabel?.toLowerCase().includes(q) ||
      srv.offerDetails?.toLowerCase().includes(q) ||
      srv.description?.toLowerCase().includes(q) ||
      srv.governorateName?.toLowerCase().includes(q)
    );
  });

  const showNotice = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleCreateOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.title.trim()) return;
    setSaving(true);
    try {
      const gov = safeGovernorates.find((g) => g.id === newOffer.governorateId);
      const pct = Number(newOffer.discountPercentage) || 0;
      await onCreateService({
        title: newOffer.title.trim(),
        discountPercentage: pct,
        discountLabel: newOffer.discountLabel.trim() || (pct > 0 ? `خصم ${pct}%` : ''),
        offerDetails: newOffer.offerDetails.trim(),
        governorateId: newOffer.governorateId,
        governorateName: gov?.nameAr || 'الكل',
        subscriptionPrice: Number(newOffer.subscriptionPrice) || 0,
        validityDate: newOffer.validityDate,
        phone: newOffer.phone.trim(),
        whatsapp: newOffer.whatsapp.trim(),
        imageUrl: newOffer.imageUrl.trim(),
        description: newOffer.description.trim() || newOffer.offerDetails.trim(),
        status: newOffer.status,
      });

      setNewOffer({
        title: '',
        discountPercentage: '20',
        discountLabel: 'خصم 20%',
        offerDetails: '',
        governorateId: safeGovernorates[0]?.id || 'gov_cairo',
        subscriptionPrice: '0',
        validityDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
        phone: '',
        whatsapp: '',
        imageUrl: '',
        description: '',
        status: 'ACTIVE',
      });
      setShowAddOffer(false);
      showNotice('تمت إضافة العرض ونسبة الخصم إلى صفحة "خصمك عندنا" بنجاح!');
    } finally {
      setSaving(false);
    }
  };

  const startEditOffer = (srv: DiscountService) => {
    setEditingId(srv.id);
    setEditOffer({
      ...srv,
      discountPercentage: srv.discountPercentage ?? 0,
      discountLabel: srv.discountLabel || '',
      offerDetails: srv.offerDetails || '',
    });
  };

  const handleSaveOfferEdit = async (id: string) => {
    setSaving(true);
    try {
      const gov = safeGovernorates.find((g) => g.id === editOffer.governorateId);
      const pct = Number(editOffer.discountPercentage) || 0;
      await onUpdateService(id, {
        title: editOffer.title,
        discountPercentage: pct,
        discountLabel: editOffer.discountLabel,
        offerDetails: editOffer.offerDetails,
        governorateId: editOffer.governorateId,
        governorateName: gov?.nameAr || editOffer.governorateName,
        subscriptionPrice: Number(editOffer.subscriptionPrice) || 0,
        validityDate: editOffer.validityDate,
        phone: editOffer.phone,
        whatsapp: editOffer.whatsapp,
        imageUrl: editOffer.imageUrl,
        description: editOffer.description,
        status: editOffer.status,
      });
      setEditingId(null);
      showNotice('تم حفظ تعديلات العرض ونسبة الخصم بنجاح.');
    } finally {
      setSaving(false);
    }
  };

  const handlePersistConfig = async (nextConfig: DiscountPageConfig, message: string) => {
    setSaving(true);
    try {
      await onSaveConfig(nextConfig);
      showNotice(message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlock.title.trim() && !newBlock.content.trim()) return;
    const block: DiscountPageBlock = {
      id: `blk_${Date.now().toString(36)}`,
      title: newBlock.title.trim() || 'قسم إضافي',
      badge: newBlock.badge.trim(),
      content: newBlock.content.trim(),
    };
    const nextConfig: DiscountPageConfig = {
      ...configState,
      customBlocks: [...(configState.customBlocks || []), block],
    };
    setConfigState(nextConfig);
    setNewBlock({ title: '', badge: '', content: '' });
    await handlePersistConfig(nextConfig, 'تمت إضافة العنصر/القسم الجديد إلى صفحة "خصمك عندنا".');
  };

  const handleUpdateBlockField = (
    id: string,
    field: keyof DiscountPageBlock,
    value: string
  ) => {
    setConfigState((prev) => ({
      ...prev,
      customBlocks: prev.customBlocks.map((b) =>
        b.id === id ? { ...b, [field]: value } : b
      ),
    }));
  };

  const handleMoveBlock = async (idx: number, direction: -1 | 1) => {
    const target = idx + direction;
    const list = [...(configState.customBlocks || [])];
    if (target < 0 || target >= list.length) return;
    [list[idx], list[target]] = [list[target], list[idx]];
    const nextConfig = { ...configState, customBlocks: list };
    setConfigState(nextConfig);
    await handlePersistConfig(nextConfig, 'تم إعادة ترتيب العناصر وحفظ التغيير.');
  };

  const handleDeleteBlock = async (id: string) => {
    const nextBlocks = (configState.customBlocks || []).filter((b) => b.id !== id);
    const nextConfig = { ...configState, customBlocks: nextBlocks };
    setConfigState(nextConfig);
    await handlePersistConfig(nextConfig, 'تم حذف العنصر من صفحة "خصمك عندنا".');
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header Banner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-l from-[#121629] via-[#0b101d] to-[#080c16] border border-amber-500/25 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-400/30 text-amber-300 text-xs font-bold mb-2">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            <span>إدارة صفحة «خصمك عندنا»</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            التحكم الكامل في «خصمك عندنا» — نسب الخصم، العروض، والمحتوى
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            أضف نسب الخصم والعروض الحصرية حسب المحافظة، وأضف أو احذف أي عناصر وفقرات ونصوص داخل الصفحة لتظهر فوراً للمستخدمين.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تحديث</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setSubTab('offers');
              setShowAddOffer((prev) => !prev);
            }}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddOffer ? 'إغلاق نموذج الإضافة' : 'إضافة عرض ونسبة خصم'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-400 hover:text-white text-xs"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* KPIs Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0f1b] border border-slate-800">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
            <Tag className="w-3.5 h-3.5 text-amber-400" />
            إجمالي العروض المسجلة
          </span>
          <p className="font-mono text-2xl sm:text-3xl font-black text-white">{stats.total}</p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0f1b] border border-emerald-500/25">
          <span className="text-xs text-emerald-400 flex items-center gap-1.5 mb-1">
            <Eye className="w-3.5 h-3.5" />
            عروض نشطة بالصفحة
          </span>
          <p className="font-mono text-2xl sm:text-3xl font-black text-white">{stats.active}</p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0f1b] border border-amber-500/25">
          <span className="text-xs text-amber-400 flex items-center gap-1.5 mb-1">
            <Percent className="w-3.5 h-3.5" />
            أعلى نسبة خصم مضافة
          </span>
          <p className="font-mono text-2xl sm:text-3xl font-black text-white">{stats.maxDiscount}%</p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0f1b] border border-sky-500/25">
          <span className="text-xs text-sky-400 flex items-center gap-1.5 mb-1">
            <Layers className="w-3.5 h-3.5" />
            عناصر وفقرات إضافية
          </span>
          <p className="font-mono text-2xl sm:text-3xl font-black text-white">{stats.blocksCount}</p>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setSubTab('offers')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            subTab === 'offers'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Percent className="w-4 h-4" />
          <span>نسب الخصم والعروض ({safeServices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('blocks')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            subTab === 'blocks'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>إضافة / حذف عناصر بالصفحة ({(configState.customBlocks || []).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('content')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            subTab === 'content'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>نصوص وإعدادات الصفحة</span>
        </button>
      </div>

      {/* ================= SUB-TAB 1: OFFERS & DISCOUNTS ================= */}
      {subTab === 'offers' && (
        <div className="space-y-6">
          {showAddOffer && (
            <form
              onSubmit={handleCreateOfferSubmit}
              className="p-5 sm:p-6 rounded-3xl bg-[#0b0f1b] border border-amber-500/30 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>إضافة عرض ونسبة خصم جديدة في «خصمك عندنا»</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddOffer(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">عنوان العرض / الخدمة *</label>
                  <input
                    type="text"
                    required
                    value={newOffer.title}
                    onChange={(e) => setNewOffer({ ...newOffer, title: e.target.value })}
                    placeholder="مثال: باقة الفحص الشامل أو عرض المطاعم"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">نسبة الخصم (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newOffer.discountPercentage}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewOffer((prev) => ({
                        ...prev,
                        discountPercentage: val,
                        discountLabel: val ? `خصم ${val}%` : prev.discountLabel,
                      }));
                    }}
                    placeholder="25"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">شارة الخصم الظاهرة (Badge)</label>
                  <input
                    type="text"
                    value={newOffer.discountLabel}
                    onChange={(e) => setNewOffer({ ...newOffer, discountLabel: e.target.value })}
                    placeholder="مثال: خصم 25% لحاملي الكارت"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">المحافظة</label>
                  <select
                    value={newOffer.governorateId}
                    onChange={(e) => setNewOffer({ ...newOffer, governorateId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                  >
                    {safeGovernorates.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">سعر الاشتراك / الباقة (ج.م)</label>
                  <input
                    type="number"
                    min="0"
                    value={newOffer.subscriptionPrice}
                    onChange={(e) => setNewOffer({ ...newOffer, subscriptionPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">صالح حتى</label>
                  <input
                    type="date"
                    value={newOffer.validityDate}
                    onChange={(e) => setNewOffer({ ...newOffer, validityDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">رقم الهاتف (اختياري)</label>
                  <input
                    type="text"
                    value={newOffer.phone}
                    onChange={(e) => setNewOffer({ ...newOffer, phone: e.target.value })}
                    placeholder="010XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">رقم الواتساب (اختياري)</label>
                  <input
                    type="text"
                    value={newOffer.whatsapp}
                    onChange={(e) => setNewOffer({ ...newOffer, whatsapp: e.target.value })}
                    placeholder="2010XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">الحالة عند النشر</label>
                  <select
                    value={newOffer.status}
                    onChange={(e) =>
                      setNewOffer({ ...newOffer, status: e.target.value as 'ACTIVE' | 'INACTIVE' })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                  >
                    <option value="ACTIVE">نشط ومفعل بالصفحة</option>
                    <option value="INACTIVE">مخفي / مسودة</option>
                  </select>
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs text-slate-300 mb-1">رابط صورة العرض (اختياري URL)</label>
                  <input
                    type="text"
                    value={newOffer.imageUrl}
                    onChange={(e) => setNewOffer({ ...newOffer, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs text-slate-300 mb-1">تفاصيل العرض والشروط (تظهر بارزة للعميل)</label>
                  <input
                    type="text"
                    value={newOffer.offerDetails}
                    onChange={(e) => setNewOffer({ ...newOffer, offerDetails: e.target.value })}
                    placeholder="مثال: يشمل الكشف والاستشارة والمتابعة المجانية عند إبراز الكارت"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs text-slate-300 mb-1">الوصف الكامل للعرض</label>
                  <textarea
                    rows={3}
                    value={newOffer.description}
                    onChange={(e) => setNewOffer({ ...newOffer, description: e.target.value })}
                    placeholder="اكتب وصف العرض والمميزات المقدمة لأعضاء Sugar Business..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ ونشر العرض في «خصمك عندنا»</span>
                </button>
              </div>
            </form>
          )}

          {/* Filter & List */}
          <div className="p-4 sm:p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث باسم العرض، نسبة الخصم أو المحافظة..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filterGovId}
                  onChange={(e) => setFilterGovId(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white"
                >
                  <option value="ALL">جميع المحافظات</option>
                  {safeGovernorates.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nameAr}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white"
                >
                  <option value="ALL">كل الحالات</option>
                  <option value="ACTIVE">النشطة فقط</option>
                  <option value="INACTIVE">المخفية فقط</option>
                </select>
              </div>
            </div>

            {filteredServices.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Tag className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs sm:text-sm text-slate-400">
                  لا توجد عروض خصم مطابقة حالياً. يمكنك إضافة عرض جديد ونسبة خصم من الزر بالأعلى.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {filteredServices.map((srv) => (
                  <div key={srv.id} className="py-4 space-y-3">
                    {editingId === srv.id ? (
                      <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={editOffer.title || ''}
                            onChange={(e) => setEditOffer({ ...editOffer, title: e.target.value })}
                            placeholder="عنوان العرض"
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editOffer.discountPercentage ?? 0}
                            onChange={(e) =>
                              setEditOffer({ ...editOffer, discountPercentage: e.target.value })
                            }
                            placeholder="نسبة الخصم %"
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                          />
                          <input
                            type="text"
                            value={editOffer.discountLabel || ''}
                            onChange={(e) =>
                              setEditOffer({ ...editOffer, discountLabel: e.target.value })
                            }
                            placeholder="شارة الخصم (مثال: خصم 25%)"
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                          />
                          <select
                            value={editOffer.governorateId || ''}
                            onChange={(e) =>
                              setEditOffer({ ...editOffer, governorateId: e.target.value })
                            }
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                          >
                            {safeGovernorates.map((g) => (
                              <option key={g.id} value={g.id}>
                                {g.nameAr}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="0"
                            value={editOffer.subscriptionPrice ?? 0}
                            onChange={(e) =>
                              setEditOffer({ ...editOffer, subscriptionPrice: e.target.value })
                            }
                            placeholder="السعر"
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                          />
                          <input
                            type="date"
                            value={editOffer.validityDate || ''}
                            onChange={(e) =>
                              setEditOffer({ ...editOffer, validityDate: e.target.value })
                            }
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                          />
                          <input
                            type="text"
                            value={editOffer.phone || ''}
                            onChange={(e) => setEditOffer({ ...editOffer, phone: e.target.value })}
                            placeholder="الهاتف"
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                          />
                          <input
                            type="text"
                            value={editOffer.whatsapp || ''}
                            onChange={(e) =>
                              setEditOffer({ ...editOffer, whatsapp: e.target.value })
                            }
                            placeholder="واتساب"
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                          />
                          <input
                            type="text"
                            value={editOffer.imageUrl || ''}
                            onChange={(e) =>
                              setEditOffer({ ...editOffer, imageUrl: e.target.value })
                            }
                            placeholder="رابط الصورة"
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                          />
                        </div>

                        <input
                          type="text"
                          value={editOffer.offerDetails || ''}
                          onChange={(e) =>
                            setEditOffer({ ...editOffer, offerDetails: e.target.value })
                          }
                          placeholder="تفاصيل العرض والشروط"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                        />

                        <textarea
                          rows={2}
                          value={editOffer.description || ''}
                          onChange={(e) =>
                            setEditOffer({ ...editOffer, description: e.target.value })
                          }
                          placeholder="الوصف"
                          className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                        />

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                          >
                            إلغاء
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveOfferEdit(srv.id)}
                            disabled={saving}
                            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>حفظ التعديلات</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {srv.imageUrl ? (
                            <img
                              src={srv.imageUrl}
                              alt={srv.title}
                              className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-center shrink-0">
                              <Percent className="w-6 h-6 text-amber-400" />
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-white text-sm">{srv.title}</h4>
                              {(srv.discountPercentage || srv.discountLabel) && (
                                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950">
                                  {srv.discountLabel || `خصم ${srv.discountPercentage}%`}
                                </span>
                              )}
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  srv.status === 'ACTIVE'
                                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {srv.status === 'ACTIVE' ? 'ظاهر بالصفحة' : 'مخفي'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-sky-400" />
                                {srv.governorateName}
                              </span>
                              <span className="font-mono text-sky-300">
                                {srv.subscriptionPrice} ج.م
                              </span>
                              <span className="flex items-center gap-1 font-mono">
                                <Calendar className="w-3 h-3 text-amber-400" />
                                حتى {srv.validityDate}
                              </span>
                              {srv.phone && (
                                <span className="flex items-center gap-1 font-mono">
                                  <Phone className="w-3 h-3 text-slate-500" />
                                  {srv.phone}
                                </span>
                              )}
                            </p>

                            {srv.offerDetails && (
                              <p className="text-xs text-amber-200/90">{srv.offerDetails}</p>
                            )}
                            {srv.description && (
                              <p className="text-xs text-slate-500 line-clamp-2">{srv.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateService(srv.id, {
                                status: srv.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                              })
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                              srv.status === 'ACTIVE'
                                ? 'bg-slate-900 text-amber-300 border-amber-500/30 hover:bg-amber-950/40'
                                : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/60'
                            }`}
                          >
                            {srv.status === 'ACTIVE' ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                            <span>{srv.status === 'ACTIVE' ? 'إخفاء' : 'تفعيل'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => startEditOffer(srv)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-700 transition-colors"
                            title="تعديل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('هل أنت متأكد من حذف هذا العرض نهائياً؟')) {
                                onDeleteService(srv.id);
                              }
                            }}
                            className="p-2 rounded-xl bg-rose-950/50 hover:bg-rose-900 text-rose-400 border border-rose-500/30 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 2: CUSTOM BLOCKS (ADD / DELETE ITEMS IN PAGE) ================= */}
      {subTab === 'blocks' && (
        <div className="p-5 sm:p-7 rounded-3xl bg-[#0b0f1b] border border-sky-500/25 shadow-xl space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span>إضافة وحذف أقسام وعناصر مخصصة داخل صفحة «خصمك عندنا»</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              أضف بطاقات توضيحية، شروط استخدام الخصومات، مميزات موسمية، أو أي عناصر نصية مخصصة بالصفحة أو احذفها في أي وقت.
            </p>
          </div>

          <form onSubmit={handleAddBlock} className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-300 mb-1">عنوان العنصر / القسم *</label>
                <input
                  type="text"
                  required
                  value={newBlock.title}
                  onChange={(e) => setNewBlock({ ...newBlock, title: e.target.value })}
                  placeholder="مثال: كيفية الاستفادة من الخصم الفوري"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-300 mb-1">شارة مميزة (اختياري)</label>
                <input
                  type="text"
                  value={newBlock.badge}
                  onChange={(e) => setNewBlock({ ...newBlock, badge: e.target.value })}
                  placeholder="مثال: عرض موسمي / تنبيه هام"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">المحتوى / التفاصيل *</label>
              <textarea
                rows={3}
                required
                value={newBlock.content}
                onChange={(e) => setNewBlock({ ...newBlock, content: e.target.value })}
                placeholder="اكتب التفاصيل أو المزايا التي تريد إظهارها للزوار داخل الصفحة..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة العنصر للصفحة</span>
              </button>
            </div>
          </form>

          <div className="space-y-3">
            {(configState.customBlocks || []).length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                لا توجد عناصر مخصصة مضافة بعد. استخدم النموذج أعلاه لإضافة أول عنصر في صفحة «خصمك عندنا».
              </p>
            ) : (
              (configState.customBlocks || []).map((blk, idx) => (
                <div
                  key={blk.id}
                  className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-mono text-sky-400 font-bold">عنصر #{idx + 1}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleMoveBlock(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30"
                        title="تحريك للأعلى"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveBlock(idx, 1)}
                        disabled={idx === (configState.customBlocks || []).length - 1}
                        className="p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30"
                        title="تحريك للأسفل"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBlock(blk.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف العنصر</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={blk.title}
                      onChange={(e) => handleUpdateBlockField(blk.id, 'title', e.target.value)}
                      placeholder="عنوان العنصر"
                      className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white"
                    />
                    <input
                      type="text"
                      value={blk.badge || ''}
                      onChange={(e) => handleUpdateBlockField(blk.id, 'badge', e.target.value)}
                      placeholder="الشارة (اختياري)"
                      className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={blk.content}
                    onChange={(e) => handleUpdateBlockField(blk.id, 'content', e.target.value)}
                    placeholder="محتوى العنصر"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white"
                  />
                </div>
              ))
            )}
          </div>

          {(configState.customBlocks || []).length > 0 && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  handlePersistConfig(configState, 'تم حفظ جميع التعديلات على عناصر صفحة «خصمك عندنا».')
                }
                className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>حفظ تعديلات العناصر</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= SUB-TAB 3: PAGE CONTENT & HEADER ================= */}
      {subTab === 'content' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePersistConfig(configState, 'تم تحديث نصوص وإعدادات صفحة «خصمك عندنا» بنجاح!');
          }}
          className="p-5 sm:p-7 rounded-3xl bg-[#0b0f1b] border border-sky-500/25 shadow-xl space-y-5"
        >
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>تعديل نصوص وعناوين صفحة «خصمك عندنا»</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              تحكم في العنوان الرئيسي، الوصف التعريفي، شريط الإعلان أعلى الصفحة، ورسالة عدم وجود عروض.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1">الشارة العلوية (Badge)</label>
              <input
                type="text"
                value={configState.badge}
                onChange={(e) => setConfigState({ ...configState, badge: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">العنوان الرئيسي للصفحة</label>
              <input
                type="text"
                value={configState.title}
                onChange={(e) => setConfigState({ ...configState, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-slate-300 mb-1">الوصف التوضيحي أسفل العنوان</label>
              <textarea
                rows={2}
                value={configState.subtitle}
                onChange={(e) => setConfigState({ ...configState, subtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-slate-300 mb-1">
                رسالة إعلان / تنويه أعلى الصفحة (اتركه فارغاً لإخفاء الشريط)
              </label>
              <input
                type="text"
                value={configState.announcement}
                onChange={(e) => setConfigState({ ...configState, announcement: e.target.value })}
                placeholder="مثال: خصومات إضافية تصل إلى 40% طوال هذا الشهر لجميع حاملي الكارت الذكي!"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-slate-300 mb-1">الرسالة عند عدم وجود عروض في محافظة محددة</label>
              <input
                type="text"
                value={configState.emptyMessage}
                onChange={(e) => setConfigState({ ...configState, emptyMessage: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="py-3 px-8 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>حفظ ونشر نصوص الصفحة</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
