import React, { useState, useEffect, useMemo } from 'react';
import {
  Store,
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
  Tag,
  FileText,
  Sliders,
  RefreshCw,
  Globe,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Business, DirectoryConfig, DirectoryOption, Governorate } from '../../types';

interface AdminDirectoryPageProps {
  businesses: Business[];
  governorates: Governorate[];
  directoryConfig: DirectoryConfig | null;
  onAddBusiness: (business: Partial<Business>) => Promise<void> | void;
  onUpdateBusiness: (id: string, business: Partial<Business>) => Promise<void> | void;
  onDeleteBusiness: (id: string) => Promise<void> | void;
  onSaveConfig: (config: Partial<DirectoryConfig>) => Promise<void> | void;
  onRefresh?: () => void;
}

const DEFAULT_DIRECTORY_CONFIG: DirectoryConfig = {
  badge: 'شبكة الشركاء المعتمدين',
  title: 'دليل المتاجر والخدمات',
  subtitle: 'تسوق واكسب مزايا وخصومات فورية مع أفضل المتاجر والكافيهات في مصر',
  announcement: '',
  emptyMessage: 'لا توجد متاجر أو خيارات مطابقة للبحث حالياً.',
  options: [
    { id: 'sec_01', label: 'المطاعم والكافيهات', isActive: true },
    { id: 'sec_02', label: 'الملابس والأزياء', isActive: true },
    { id: 'sec_03', label: 'الصحة والجمال والعناية', isActive: true },
    { id: 'sec_04', label: 'خدمات وصيانة السيارات', isActive: true },
    { id: 'sec_05', label: 'الإلكترونيات والتقنية', isActive: true },
    { id: 'sec_06', label: 'المنزل والديكور', isActive: true },
  ],
};

export const AdminDirectoryPage: React.FC<AdminDirectoryPageProps> = ({
  businesses,
  governorates,
  directoryConfig,
  onAddBusiness,
  onUpdateBusiness,
  onDeleteBusiness,
  onSaveConfig,
  onRefresh,
}) => {
  const [subTab, setSubTab] = useState<'entries' | 'options' | 'content'>('entries');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOptionId, setFilterOptionId] = useState<string>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);

  // Config / Content / Options State
  const [configState, setConfigState] = useState<DirectoryConfig>(
    directoryConfig || DEFAULT_DIRECTORY_CONFIG
  );
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [configFeedback, setConfigFeedback] = useState<string | null>(null);

  // New Business Form State
  const [newBusiness, setNewBusiness] = useState({
    businessName: '',
    ownerName: '',
    phone: '',
    whatsapp: '',
    governorate: 'القاهرة',
    city: '',
    address: '',
    sectorId: 'sec_01',
    type: 'متجر معتمد',
    discountNote: '',
    workingHours: '',
    logoUrl: '',
    description: '',
    directoryOptions: [] as string[],
    isListed: true,
  });

  // Edit Business State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Business> & { whatsapp?: string }>({});

  useEffect(() => {
    if (directoryConfig) {
      setConfigState(directoryConfig);
    }
  }, [directoryConfig]);

  const safeBusinesses = Array.isArray(businesses) ? businesses : [];
  const safeGovernorates =
    Array.isArray(governorates) && governorates.length > 0
      ? governorates
      : [
          { id: 'gov_cairo', nameAr: 'القاهرة', nameEn: 'Cairo', available: true, deliveryFee: 45 },
          { id: 'gov_giza', nameAr: 'الجيزة', nameEn: 'Giza', available: true, deliveryFee: 45 },
          { id: 'gov_alex', nameAr: 'الإسكندرية', nameEn: 'Alexandria', available: true, deliveryFee: 55 },
        ];

  const stats = useMemo(() => {
    const listedCount = safeBusinesses.filter((b) => b.isListed && b.status === 'ACTIVE').length;
    const activeOptionsCount = (configState.options || []).filter((o) => o.isActive).length;
    return {
      total: safeBusinesses.length,
      listed: listedCount,
      hidden: safeBusinesses.length - listedCount,
      optionsCount: activeOptionsCount,
    };
  }, [safeBusinesses, configState.options]);

  const filteredBusinesses = safeBusinesses.filter((b) => {
    if (!b) return false;
    if (filterOptionId !== 'ALL') {
      const optMatch =
        b.sectorId === filterOptionId ||
        (Array.isArray(b.directoryOptions) && b.directoryOptions.includes(filterOptionId));
      if (!optMatch) return false;
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      b.businessName?.toLowerCase().includes(q) ||
      b.ownerName?.toLowerCase().includes(q) ||
      b.phone?.toLowerCase().includes(q) ||
      b.governorate?.toLowerCase().includes(q) ||
      b.city?.toLowerCase().includes(q) ||
      b.description?.toLowerCase().includes(q)
    );
  });

  const handleToggleOptionOnBusiness = (
    optionId: string,
    currentList: string[] = [],
    setter: (next: string[]) => void
  ) => {
    if (currentList.includes(optionId)) {
      setter(currentList.filter((id) => id !== optionId));
    } else {
      setter([...currentList, optionId]);
    }
  };

  const handleAddBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const chosenSector = configState.options.find((o) => o.id === newBusiness.sectorId);
    await onAddBusiness({
      businessName: newBusiness.businessName.trim(),
      ownerName: newBusiness.ownerName.trim() || 'الإدارة',
      phone: newBusiness.phone.trim(),
      governorate: newBusiness.governorate,
      city: newBusiness.city.trim(),
      address: newBusiness.address.trim(),
      sectorId: newBusiness.sectorId,
      type: chosenSector?.label || newBusiness.type || 'متجر معتمد',
      discountNote: newBusiness.discountNote.trim() || undefined,
      workingHours: newBusiness.workingHours.trim() || undefined,
      logoUrl: newBusiness.logoUrl.trim() || undefined,
      description: newBusiness.description.trim(),
      directoryOptions: newBusiness.directoryOptions,
      socialLinks: newBusiness.whatsapp.trim()
        ? { whatsapp: newBusiness.whatsapp.trim() }
        : undefined,
      isListed: newBusiness.isListed,
      status: 'ACTIVE',
    });

    setNewBusiness({
      businessName: '',
      ownerName: '',
      phone: '',
      whatsapp: '',
      governorate: 'القاهرة',
      city: '',
      address: '',
      sectorId: configState.options[0]?.id || 'sec_01',
      type: 'متجر معتمد',
      discountNote: '',
      workingHours: '',
      logoUrl: '',
      description: '',
      directoryOptions: [],
      isListed: true,
    });
    setShowAddForm(false);
    setConfigFeedback('تمت إضافة الشريك/المتجر بنجاح إلى دليل الشركاء والمتاجر!');
    setTimeout(() => setConfigFeedback(null), 4000);
  };

  const startEdit = (b: Business) => {
    setEditingId(b.id);
    setEditForm({
      ...b,
      whatsapp: b.socialLinks?.whatsapp || '',
      directoryOptions: Array.isArray(b.directoryOptions) ? b.directoryOptions : [],
    });
  };

  const saveBusinessEdit = async (id: string) => {
    await onUpdateBusiness(id, {
      businessName: editForm.businessName,
      ownerName: editForm.ownerName,
      phone: editForm.phone,
      governorate: editForm.governorate,
      city: editForm.city,
      address: editForm.address,
      sectorId: editForm.sectorId,
      type: editForm.type,
      discountNote: editForm.discountNote,
      workingHours: editForm.workingHours,
      logoUrl: editForm.logoUrl,
      description: editForm.description,
      directoryOptions: editForm.directoryOptions || [],
      isListed: editForm.isListed,
      status: editForm.status,
      socialLinks: editForm.whatsapp?.trim()
        ? { ...(editForm.socialLinks || {}), whatsapp: editForm.whatsapp.trim() }
        : editForm.socialLinks,
    });
    setEditingId(null);
    setConfigFeedback('تم تحديث بيانات المتجر بنجاح.');
    setTimeout(() => setConfigFeedback(null), 3500);
  };

  const handlePersistConfig = async (nextConfig: DirectoryConfig, message: string) => {
    setSavingConfig(true);
    try {
      await onSaveConfig(nextConfig);
      setConfigFeedback(message);
      setTimeout(() => setConfigFeedback(null), 4000);
    } finally {
      setSavingConfig(false);
    }
  };

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newOptionLabel.trim();
    if (!clean) return;
    const newOpt: DirectoryOption = {
      id: `opt_${Date.now().toString(36)}`,
      label: clean,
      isActive: true,
    };
    const nextConfig: DirectoryConfig = {
      ...configState,
      options: [...(configState.options || []), newOpt],
    };
    setConfigState(nextConfig);
    setNewOptionLabel('');
    await handlePersistConfig(nextConfig, `تمت إضافة الخيار "${clean}" وتحديث الدليل فوراً.`);
  };

  const handleUpdateOptionLabel = (id: string, label: string) => {
    setConfigState((prev) => ({
      ...prev,
      options: prev.options.map((o) => (o.id === id ? { ...o, label } : o)),
    }));
  };

  const handleToggleOptionActive = async (id: string) => {
    const nextOptions = configState.options.map((o) =>
      o.id === id ? { ...o, isActive: !o.isActive } : o
    );
    const nextConfig = { ...configState, options: nextOptions };
    setConfigState(nextConfig);
    await handlePersistConfig(nextConfig, 'تم تحديث حالة الخيار في الدليل.');
  };

  const handleRemoveOption = async (id: string) => {
    const nextOptions = configState.options.filter((o) => o.id !== id);
    const nextConfig = { ...configState, options: nextOptions };
    setConfigState(nextConfig);
    await handlePersistConfig(nextConfig, 'تم حذف الخيار من الدليل.');
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header Banner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-l from-[#0e1526] via-[#0b101d] to-[#080c16] border border-sky-500/25 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-400/30 text-sky-300 text-xs font-bold mb-2">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>إدارة دليل الشركاء والمتاجر</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            صفحة دليل الشركاء والمتاجر (كتابة المحتوى والخيارات)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            تحكم كامل في المتاجر المدرجة، كتابة نصوص وتعليمات الدليل، وإضافة خيارات التصنيف والتصفية التي تظهر للعملاء والزوار.
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
              setSubTab('entries');
              setShowAddForm((prev) => !prev);
            }}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-black text-xs shadow-lg shadow-sky-500/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{showAddForm ? 'إغلاق النموذج' : 'إضافة متجر / شريك للدليل'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {configFeedback && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs sm:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">{configFeedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setConfigFeedback(null)}
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
            <Store className="w-3.5 h-3.5 text-sky-400" />
            إجمالي الشركاء والمتاجر
          </span>
          <p className="font-mono text-2xl sm:text-3xl font-black text-white">{stats.total}</p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0f1b] border border-emerald-500/25">
          <span className="text-xs text-emerald-400 flex items-center gap-1.5 mb-1">
            <Eye className="w-3.5 h-3.5" />
            معروض ونشط بالدليل
          </span>
          <p className="font-mono text-2xl sm:text-3xl font-black text-white">{stats.listed}</p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0f1b] border border-slate-800">
          <span className="text-xs text-amber-400 flex items-center gap-1.5 mb-1">
            <EyeOff className="w-3.5 h-3.5" />
            مخفي / قيد المراجعة
          </span>
          <p className="font-mono text-2xl sm:text-3xl font-black text-white">{stats.hidden}</p>
        </div>
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0b0f1b] border border-sky-500/25">
          <span className="text-xs text-sky-400 flex items-center gap-1.5 mb-1">
            <Tag className="w-3.5 h-3.5" />
            خيارات الدليل المفعلة
          </span>
          <p className="font-mono text-2xl sm:text-3xl font-black text-white">{stats.optionsCount}</p>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setSubTab('entries')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            subTab === 'entries'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>المتاجر والشركاء بالدليل ({safeBusinesses.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('options')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            subTab === 'options'
              ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
              : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>إضافة وإدارة الخيارات ({(configState.options || []).length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('content')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            subTab === 'content'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>كتابة النصوص والمحتوى بالدليل</span>
        </button>
      </div>

      {/* ================= SUB-TAB 1: DIRECTORY ENTRIES ================= */}
      {subTab === 'entries' && (
        <div className="space-y-6">
          {showAddForm && (
            <form
              onSubmit={handleAddBusinessSubmit}
              className="p-5 sm:p-6 rounded-3xl bg-[#0b0f1b] border border-sky-500/30 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-sky-400" />
                  <span>إضافة متجر أو شريك جديد مباشرة لدليل الشركاء</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-slate-300 mb-1">اسم المتجر / الشريك *</label>
                  <input
                    type="text"
                    required
                    value={newBusiness.businessName}
                    onChange={(e) => setNewBusiness({ ...newBusiness, businessName: e.target.value })}
                    placeholder="مثال: كافيه ومحمصة النيل"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">اسم المالك / المسؤول</label>
                  <input
                    type="text"
                    value={newBusiness.ownerName}
                    onChange={(e) => setNewBusiness({ ...newBusiness, ownerName: e.target.value })}
                    placeholder="اسم المسؤول"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">التصنيف الرئيسي (خيار الفلترة)</label>
                  <select
                    value={newBusiness.sectorId}
                    onChange={(e) => setNewBusiness({ ...newBusiness, sectorId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                  >
                    {(configState.options || []).map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={newBusiness.phone}
                    onChange={(e) => setNewBusiness({ ...newBusiness, phone: e.target.value })}
                    placeholder="010XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">رقم الواتساب (اختياري)</label>
                  <input
                    type="text"
                    value={newBusiness.whatsapp}
                    onChange={(e) => setNewBusiness({ ...newBusiness, whatsapp: e.target.value })}
                    placeholder="2010XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">شارة العرض / الخصم (Badge)</label>
                  <input
                    type="text"
                    value={newBusiness.discountNote}
                    onChange={(e) => setNewBusiness({ ...newBusiness, discountNote: e.target.value })}
                    placeholder="مثال: خصم 15% لحاملي الكارت"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">المحافظة</label>
                  <select
                    value={newBusiness.governorate}
                    onChange={(e) => setNewBusiness({ ...newBusiness, governorate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                  >
                    {safeGovernorates.map((g) => (
                      <option key={g.id} value={g.nameAr}>
                        {g.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">المدينة / المنطقة</label>
                  <input
                    type="text"
                    value={newBusiness.city}
                    onChange={(e) => setNewBusiness({ ...newBusiness, city: e.target.value })}
                    placeholder="مثال: المعادي / مدينة نصر"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-300 mb-1">العنوان التفصيلي</label>
                  <input
                    type="text"
                    value={newBusiness.address}
                    onChange={(e) => setNewBusiness({ ...newBusiness, address: e.target.value })}
                    placeholder="الشارع والرقم"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-300 mb-1">ساعات العمل</label>
                  <input
                    type="text"
                    value={newBusiness.workingHours}
                    onChange={(e) => setNewBusiness({ ...newBusiness, workingHours: e.target.value })}
                    placeholder="مثال: يومياً 10 صباحاً - 12 منتصف الليل"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-300 mb-1">رابط صورة / شعار المتجر (URL)</label>
                  <input
                    type="text"
                    value={newBusiness.logoUrl}
                    onChange={(e) => setNewBusiness({ ...newBusiness, logoUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-mono"
                  />
                </div>
              </div>

              {/* Multi-options assignment */}
              <div>
                <label className="block text-xs font-bold text-sky-300 mb-2">
                  خيارات ومزايا الدليل المرتبطة بهذا المتجر (اختيار متعدد)
                </label>
                <div className="flex flex-wrap gap-2">
                  {(configState.options || []).map((opt) => {
                    const checked = newBusiness.directoryOptions.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          handleToggleOptionOnBusiness(
                            opt.id,
                            newBusiness.directoryOptions,
                            (next) => setNewBusiness({ ...newBusiness, directoryOptions: next })
                          )
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          checked
                            ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {checked ? '✓ ' : '+ '}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">الوصف والتفاصيل المكتوبة للعملاء</label>
                <textarea
                  rows={3}
                  value={newBusiness.description}
                  onChange={(e) => setNewBusiness({ ...newBusiness, description: e.target.value })}
                  placeholder="اكتب نبذة جذابة عن الخدمات والمنتجات والمميزات التي يحصل عليها حامل الكارت..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <label className="inline-flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newBusiness.isListed}
                    onChange={(e) => setNewBusiness({ ...newBusiness, isListed: e.target.checked })}
                    className="rounded border-slate-600 bg-slate-900 text-sky-500"
                  />
                  <span>عرض المتجر فوراً في صفحة دليل الشركاء للزوار</span>
                </label>

                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ وإدراج المتجر بالدليل</span>
                </button>
              </div>
            </form>
          )}

          {/* Filter & Search Bar */}
          <div className="p-4 sm:p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث باسم المتجر، الهاتف، المحافظة أو الوصف..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white"
                />
              </div>

              <select
                value={filterOptionId}
                onChange={(e) => setFilterOptionId(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white"
              >
                <option value="ALL">جميع الخيارات والتصنيفات</option>
                {(configState.options || []).map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {filteredBusinesses.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <Store className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs sm:text-sm text-slate-400">
                  لا توجد متاجر مطابقة حالياً. يمكنك إضافة متجر جديد من الزر بالأعلى.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {filteredBusinesses.map((b) => (
                  <div key={b.id} className="py-4 space-y-3">
                    {editingId === b.id ? (
                      <div className="p-4 rounded-2xl bg-slate-900/90 border border-sky-500/30 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={editForm.businessName || ''}
                            onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                            placeholder="اسم المتجر"
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={editForm.ownerName || ''}
                            onChange={(e) => setEditForm({ ...editForm, ownerName: e.target.value })}
                            placeholder="اسم المسؤول"
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={editForm.phone || ''}
                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            placeholder="رقم الهاتف"
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                          />
                          <select
                            value={editForm.governorate || 'القاهرة'}
                            onChange={(e) => setEditForm({ ...editForm, governorate: e.target.value })}
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                          >
                            {safeGovernorates.map((g) => (
                              <option key={g.id} value={g.nameAr}>
                                {g.nameAr}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={editForm.city || ''}
                            onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                            placeholder="المدينة"
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                          />
                          <input
                            type="text"
                            value={editForm.discountNote || ''}
                            onChange={(e) => setEditForm({ ...editForm, discountNote: e.target.value })}
                            placeholder="شارة الخصم (مثال: خصم 15%)"
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                          />
                          <select
                            value={editForm.sectorId || 'sec_01'}
                            onChange={(e) => setEditForm({ ...editForm, sectorId: e.target.value })}
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                          >
                            {(configState.options || []).map((opt) => (
                              <option key={opt.id} value={opt.id}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={editForm.whatsapp || ''}
                            onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                            placeholder="واتساب"
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                          />
                          <input
                            type="text"
                            value={editForm.logoUrl || ''}
                            onChange={(e) => setEditForm({ ...editForm, logoUrl: e.target.value })}
                            placeholder="رابط الشعار URL"
                            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                          />
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                          {(configState.options || []).map((opt) => {
                            const selected = (editForm.directoryOptions || []).includes(opt.id);
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() =>
                                  handleToggleOptionOnBusiness(
                                    opt.id,
                                    editForm.directoryOptions || [],
                                    (next) => setEditForm({ ...editForm, directoryOptions: next })
                                  )
                                }
                                className={`px-2.5 py-1 rounded-lg text-[11px] border ${
                                  selected
                                    ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                                    : 'bg-slate-950 border-slate-800 text-slate-400'
                                }`}
                              >
                                {selected ? '✓ ' : '+ '}
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>

                        <textarea
                          rows={2}
                          value={editForm.description || ''}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="وصف المتجر"
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
                            onClick={() => saveBusinessEdit(b.id)}
                            className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1"
                          >
                            <Save className="w-3.5 h-3.5" />
                            <span>حفظ التعديل</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {b.logoUrl ? (
                            <img
                              src={b.logoUrl}
                              alt={b.businessName}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                              <Store className="w-5 h-5 text-sky-400" />
                            </div>
                          )}

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-bold text-white text-sm">{b.businessName}</h4>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  b.isListed && b.status === 'ACTIVE'
                                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {b.isListed && b.status === 'ACTIVE' ? 'معروض بالدليل' : 'مخفي من الدليل'}
                              </span>
                              {b.discountNote && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-500/30">
                                  {b.discountNote}
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-400 flex flex-wrap items-center gap-x-3 gap-y-1">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-sky-400" />
                                {b.governorate}
                                {b.city ? `، ${b.city}` : ''}
                              </span>
                              {b.phone && (
                                <span className="flex items-center gap-1 font-mono">
                                  <Phone className="w-3 h-3 text-slate-500" />
                                  {b.phone}
                                </span>
                              )}
                              {b.workingHours && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  {b.workingHours}
                                </span>
                              )}
                            </p>

                            {b.description && (
                              <p className="text-xs text-slate-500 line-clamp-2">{b.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateBusiness(b.id, {
                                isListed: !b.isListed,
                                status: !b.isListed ? 'ACTIVE' : b.status,
                              })
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                              b.isListed
                                ? 'bg-slate-900 text-amber-300 border-amber-500/30 hover:bg-amber-950/40'
                                : 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30 hover:bg-emerald-900/60'
                            }`}
                          >
                            {b.isListed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            <span>{b.isListed ? 'إخفاء مؤقت' : 'نشر بالدليل'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => startEdit(b)}
                            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-slate-700 transition-colors"
                            title="تعديل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onDeleteBusiness(b.id)}
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

      {/* ================= SUB-TAB 2: DIRECTORY OPTIONS EDITOR ================= */}
      {subTab === 'options' && (
        <div className="p-5 sm:p-7 rounded-3xl bg-[#0b0f1b] border border-sky-500/25 shadow-xl space-y-6">
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>إضافة وإدارة الخيارات في صفحة دليل الشركاء والمتاجر</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              تظهر هذه الخيارات كأزرار تصفية واختيارات في صفحة دليل الشركاء والمتاجر، ويمكن ربطها بكل متجر مضاف.
            </p>
          </div>

          {/* Add New Option Form */}
          <form onSubmit={handleAddOption} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newOptionLabel}
              onChange={(e) => setNewOptionLabel(e.target.value)}
              placeholder="اكتب اسم الخيار الجديد (مثال: صيدليات ومراكز طبية، خصم فوري 20%، توصيل مجاني...)"
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 text-sm text-white"
              required
            />
            <button
              type="submit"
              disabled={savingConfig}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة الخيار</span>
            </button>
          </form>

          {/* Existing Options List */}
          <div className="space-y-3">
            {(configState.options || []).map((opt, idx) => (
              <div
                key={opt.id}
                className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xs font-mono text-slate-500 w-6 text-center">#{idx + 1}</span>
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) => handleUpdateOptionLabel(opt.id, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleOptionActive(opt.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                      opt.isActive
                        ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {opt.isActive ? 'مفعل وظاهر' : 'مخفي'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(opt.id)}
                    className="p-2 rounded-xl bg-rose-950/60 text-rose-400 hover:bg-rose-900 border border-rose-500/30"
                    title="حذف الخيار"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={savingConfig}
              onClick={() => handlePersistConfig(configState, 'تم حفظ جميع الخيارات وتحديث صفحة الدليل!')}
              className="py-2.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>حفظ تعديلات الخيارات</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 3: WRITE DIRECTORY PAGE TEXTS & CONTENT ================= */}
      {subTab === 'content' && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handlePersistConfig(configState, 'تم حفظ ونشر نصوص ومحتوى صفحة دليل الشركاء والمتاجر بنجاح!');
          }}
          className="p-5 sm:p-7 rounded-3xl bg-[#0b0f1b] border border-amber-500/30 shadow-xl space-y-5"
        >
          <div className="border-b border-slate-800 pb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-400/30 text-amber-300 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>محرر محتوى صفحة دليل الشركاء والمتاجر</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">
              كتابة وتعديل العناوين والنصوص الظاهرة في صفحة الدليل
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              كل ما تكتبه هنا ينعكس فوراً في صفحة «دليل الشركاء والمتاجر» لجميع الزوار والعملاء.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                الشارة العلوية (Badge)
              </label>
              <input
                type="text"
                value={configState.badge}
                onChange={(e) => setConfigState({ ...configState, badge: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                العنوان الرئيسي لصفحة الدليل
              </label>
              <input
                type="text"
                value={configState.title}
                onChange={(e) => setConfigState({ ...configState, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              الوصف التوضيحي أسفل العنوان
            </label>
            <textarea
              rows={2}
              value={configState.subtitle}
              onChange={(e) => setConfigState({ ...configState, subtitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-300 mb-1.5">
              رسالة أو ملاحظة مكتوبة أعلى الدليل للزوار (إعلان / تنبيه اختياري)
            </label>
            <textarea
              rows={3}
              value={configState.announcement}
              onChange={(e) => setConfigState({ ...configState, announcement: e.target.value })}
              placeholder="اكتب هنا أي تعليمات أو إعلان أو مميزات تظهر أعلى قائمة المتاجر في صفحة الدليل..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              الرسالة عند عدم وجود متاجر مطابقة للبحث
            </label>
            <input
              type="text"
              value={configState.emptyMessage}
              onChange={(e) => setConfigState({ ...configState, emptyMessage: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingConfig}
              className="py-3 px-7 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingConfig ? 'جاري الحفظ...' : 'حفظ ونشر نصوص صفحة الدليل'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
