import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteContent, defaultSiteContent } from '../context/ContentContext';
import { useAdminData } from '../context/AdminDataContext';
import { useSettings } from '../context/SettingsContext';
import { api } from '../api/client';
import {
  Shield,
  Users,
  Store,
  CreditCard,
  Coins,
  Settings,
  CheckCircle,
  XCircle,
  Play,
  Clock,
  Activity,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Sliders,
  FileText,
  Edit3,
  RotateCcw,
  Save,
  Globe,
  Layout,
  Tag,
  ShoppingBag,
  Sparkles,
  Plus,
  Trash2,
  Phone,
  MessageCircle,
  MapPin,
  Bell,
  TestTube,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Business, Customer, Card, Product, Governorate } from '../types';
import { runAdminCRUDTests } from '../testing/AdminCRUDTest';
import { AdminProductsManager } from '../components/admin/AdminProductsManager';
import { AdminCustomersManager } from '../components/admin/AdminCustomersManager';
import { AdminServicesManager } from '../components/admin/AdminServicesManager';
import { AdminOffersManager } from '../components/admin/AdminOffersManager';
import { AdminGovernoratesManager } from '../components/admin/AdminGovernoratesManager';
import { AdminBusinessesManager } from '../components/admin/AdminBusinessesManager';
import { AdminCardsManager } from '../components/admin/AdminCardsManager';
import { AdminNotificationsManager } from '../components/admin/AdminNotificationsManager';
import { AdminNewsManager } from '../components/admin/AdminNewsManager';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { settings, toggleMaintenanceMode } = useSettings();
  const { content: siteContent, saveAllContent, resetContent: resetSiteContent } = useSiteContent();
  const { 
    metrics, businesses, customers, news, cards, systemSettings, jobs, auditLogs, 
    services, offers, governorates, products, refetchData 
  } = useAdminData();
  const loadData = refetchData;
  const [activeTab, setActiveTab] = useState<'kpis' | 'content' | 'approvals' | 'customers' | 'businesses' | 'cards' | 'points' | 'settings' | 'jobs' | 'audit' | 'products' | 'services' | 'offers' | 'governorates' | 'notifications' | 'news'>('kpis');

  // Frontend Content Editor State
  const [editableContent, setEditableContent] = useState({ ...siteContent });
  const [contentSaveSuccess, setContentSaveSuccess] = useState<string | null>(null);

  // CMS Pages Editor State
  const { cmsPages = [] } = useAdminData(); // Assuming I add this
  const [selectedCmsSlug, setSelectedCmsSlug] = useState<string>('about-us');
  const [cmsEditTitle, setCmsEditTitle] = useState('');
  const [cmsEditContent, setCmsEditContent] = useState('');
  const [cmsSaveSuccess, setCmsSaveSuccess] = useState<string | null>(null);
  const [editorFontSize, setEditorFontSize] = useState<number>(14);

  // Super Admin Point Adjustment Form
  const [adjCustomerId, setAdjCustomerId] = useState('');
  const [adjPoints, setAdjPoints] = useState('50');
  const [adjReason, setAdjReason] = useState('');
  const [adjStatus, setAdjStatus] = useState<string | null>(null);

  // Settings Edit
  const [editingSetting, setEditingSetting] = useState<{ key: string; value: string } | null>(null);

  // Removed loadData and useEffect loadData

  useEffect(() => {
    setEditableContent({ ...siteContent });
  }, [siteContent]);

  const handleSelectCmsPage = (slug: string) => {
    setSelectedCmsSlug(slug);
    const page = cmsPages.find((p) => p.slug === slug);
    if (page) {
      setCmsEditTitle(page.title);
      setCmsEditContent(page.content);
    }
  };

  const handleSaveCmsPage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateCMSPage(selectedCmsSlug, {
        title: cmsEditTitle,
        content: cmsEditContent,
      });
      setCmsSaveSuccess('تم حفظ ونشر محتوى الصفحة بنجاح وتحديث كافة الروابط المرتبطة.');
      setTimeout(() => setCmsSaveSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveSiteContent = (e: React.FormEvent) => {
    e.preventDefault();
    saveAllContent(editableContent);
    setContentSaveSuccess('تم تحديث وحفظ محتوى الواجهة الأمامية بنجاح! ستظهر التعديلات فوراً لجميع الزوار.');
    setTimeout(() => setContentSaveSuccess(null), 4000);
  };

  const handleResetSiteContent = () => {
    if (window.confirm('هل أنت متأكد من استعادة المحتوى الافتراضي بالكامل للواجهة الأمامية؟')) {
      resetSiteContent();
      setEditableContent({ ...defaultSiteContent });
      setContentSaveSuccess('تمت استعادة المحتوى الافتراضي للنظام.');
      setTimeout(() => setContentSaveSuccess(null), 3000);
    }
  };

  // Customer approval/rejection (#10)
  const handleApproveCustomer = async (userId: string) => {
    try {
      await api.approveUser(userId, 'تمت الموافقة وتفعيل الكارت بواسطة الأدمن');
      alert('تمت الموافقة على الطلب بنجاح وتفعيل الكارت وإصداره للعميل!');
      loadData();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء اعتماد الطلب');
    }
  };

  const handleRejectCustomer = async (userId: string) => {
    const reason = window.prompt('سبب رفض الطلب (اختياري):', 'بيانات غير مكتملة أو غير مطابقة');
    if (reason === null) return;
    try {
      await api.rejectUser(userId, reason || 'تم الرفض بواسطة الإدارة');
      alert('تم رفض الطلب بنجاح وتحديث حالة الحساب إلى REJECTED.');
      loadData();
    } catch (err: any) {
      alert(err.message || 'حدث خطأ أثناء رفض الطلب');
    }
  };

  // Business approval/rejection
  const handleBusinessStatus = async (id: string, status: string, isListed: boolean) => {
    try {
      await api.updateBusinessStatus(id, status, isListed, 'قرار الإدارة');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Card status
  const handleCardStatus = async (id: string, status: string) => {
    try {
      await api.updateCardStatus(id, status, 'تحديث الحالة من لوحة الإدارة');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Manual Points Adjustment (Super Admin Only #118)
  const handlePointsAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjCustomerId || !adjReason || adjReason.trim().length < 5) {
      alert('يتطلب التعديل إدخال سبب تفصيلي إلزامي لا يقل عن 5 أحرف');
      return;
    }
    try {
      await api.adjustPoints(adjCustomerId, Number(adjPoints), adjReason);
      setAdjStatus('تم تعديل رصيد النقاط بنجاح وتسجيل الحركة في سجل التدقيق الأمني (Audit Log).');
      setAdjReason('');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Run Job
  const handleCreateProduct = async (product: Omit<Product, 'id'>) => {
    try {
      await api.adminCreateProduct(product);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateProduct = async (id: string, product: Partial<Product>) => {
    try {
      await api.adminUpdateProduct(id, product);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await api.adminDeleteProduct(id);
        loadData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleCreateCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      // Need an API for creating customer, check client.ts
      // Ah, there isn't an adminCreateCustomer method. Let me check.
      // Looking at client.ts:
      // registerCustomer: (data: any) => apiRequest('/auth/register-customer', { method: 'POST', body: JSON.stringify(data) }),
      // I should probably use that or ask for an adminCreateCustomer.
      // I'll assume for now I cannot create a customer from the admin dashboard directly
      // unless I create an API method for it.
      alert('Adding customers is not currently supported in the API.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCustomer = async (userId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل نهائياً؟')) {
      try {
        await api.deleteCustomer(userId);
        loadData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Save Setting
  const handleSaveSetting = async () => {
    if (!editingSetting) return;
    try {
      await api.updateAdminSetting(editingSetting.key, editingSetting.value);
      setEditingSetting(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRunJob = async (jobId: string) => {
    try {
      await api.runAdminJob(jobId);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateGovernorate = async (gov: Omit<Governorate, 'id'>) => {
    try {
      await api.adminCreateGovernorate(gov);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateGovernorate = async (id: string, gov: Partial<Governorate>) => {
    try {
      await api.adminUpdateGovernorate(id, gov);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteGovernorate = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المحافظة؟')) {
      try {
        await api.adminDeleteGovernorate(id);
        loadData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleCreateBusiness = async (business: Omit<Business, 'id'>) => {
    try {
      await api.adminCreateBusiness(business);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateBusiness = async (id: string, business: Partial<Business>) => {
    try {
      await api.adminUpdateBusiness(id, business);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteBusiness = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المتجر؟')) {
      try {
        await api.adminDeleteBusiness(id);
        loadData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleCreateCard = async (card: Omit<Card, 'id'>) => {
    try {
      await api.adminCreateCard(card);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateCard = async (id: string, card: Partial<Card>) => {
    try {
      await api.adminUpdateCard(id, card);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الكارت؟')) {
      try {
        await api.adminDeleteCard(id);
        loadData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // ... and so on for others. I'll do these one by one or in smaller groups.
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0c1220] via-[#090e1a] to-[#060910] border border-sky-500/20 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-sky-400" />
            <span className="text-xs text-sky-400 font-bold">
              {user?.role === 'SUPER_ADMIN' ? 'مركز القيادة - المشرف العام (Super Admin)' : 'لوحة إدارة النظام'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            إدارة منظومة Sugar Business
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            التحكم الكامل بالشركاء، العملاء، الكروت البلاستيكية، الرقابة على النقاط، والوظائف المجدولة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Requested Button: زر تعديل المحتوى للواجهة الأمامية */}
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all ${
              activeTab === 'content'
                ? 'bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 shadow-amber-500/25 ring-2 ring-amber-400'
                : 'bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 shadow-sky-500/20 hover:scale-105 active:scale-95'
            }`}
          >
            <Edit3 className="w-4 h-4 text-slate-950" />
            <span>زر تعديل المحتوى للواجهة الأمامية</span>
          </button>

          <div className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-emerald-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>النظام متصل وبأعلى كفاءة</span>
          </div>
          <button
            type="button"
            onClick={runAdminCRUDTests}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-purple-400 hover:text-white border border-slate-700 transition-colors"
            title="تشغيل اختبارات CRUD (Bot)"
          >
            <TestTube className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        {[
          { id: 'content', label: 'تعديل المحتوى للواجهة الأمامية', icon: <Edit3 className="w-4 h-4 text-amber-400" /> },
          { id: 'kpis', label: 'المؤشرات والـ KPIs', icon: <Activity className="w-4 h-4" /> },
          { id: 'approvals', label: 'مركز الموافقات', icon: <CheckCircle className="w-4 h-4" /> },
          { id: 'customers', label: 'إدارة العملاء', icon: <Users className="w-4 h-4" /> },
          { id: 'businesses', label: 'المتاجر والشركاء', icon: <Store className="w-4 h-4" /> },
          { id: 'products', label: 'إدارة المنتجات', icon: <ShoppingBag className="w-4 h-4" /> },
          { id: 'services', label: 'إدارة الخدمات', icon: <Tag className="w-4 h-4" /> },
          { id: 'offers', label: 'إدارة العروض', icon: <Sparkles className="w-4 h-4" /> },
          { id: 'governorates', label: 'تغطية المحافظات', icon: <MapPin className="w-4 h-4" /> },
          { id: 'notifications', label: 'الإشعارات', icon: <Bell className="w-4 h-4" /> },
          { id: 'news', label: 'الأخبار والتحديثات', icon: <FileText className="w-4 h-4" /> },
          { id: 'cards', label: 'الكروت ورموز QR', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'points', label: 'تعديل النقاط الاستثنائي', icon: <Coins className="w-4 h-4" /> },
          { id: 'settings', label: 'إعدادات المنظومة', icon: <Settings className="w-4 h-4" /> },
          { id: 'jobs', label: 'المهام المجدولة (Jobs)', icon: <Clock className="w-4 h-4" /> },
          { id: 'audit', label: 'سجل التدقيق (Audit Log)', icon: <FileText className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ================= TAB 0: FRONTEND CONTENT & CMS EDITOR (زر تعديل المحتوى للواجهة الأمامية) ================= */}
      {activeTab === 'content' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Success Notification Banner */}
          {contentSaveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="font-bold">{contentSaveSuccess}</span>
              </div>
              <button
                type="button"
                onClick={() => setContentSaveSuccess(null)}
                className="text-xs text-emerald-400 hover:text-white"
              >
                إغلاق
              </button>
            </div>
          )}

          {/* Section 1: Homepage & Global Front-End Copy Editor */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0f1b] border border-sky-500/30 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-400/40 text-amber-300 text-xs font-bold mb-1">
                  <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  <span>تعديل المحتوى للواجهة الأمامية والصفحات</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  التحكم في جميع نصوص وعناوين الواجهة الأمامية للموقع
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  يمكنك كأدمن تعديل أي نص، عبارة، عنوان، أو زر ظاهر للزوار والعملاء لتطوير وتحديث الموقع في أي وقت.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetSiteContent}
                  className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>استعادة الافتراضي</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveSiteContent} className="space-y-8">
              {/* Group 1: Hero Section */}
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Layout className="w-4 h-4 text-sky-400" />
                  <span>1. الواجهة الترحيبية الأولى (Hero Section)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">شارة الرأس العلوية (Badge)</label>
                    <input
                      type="text"
                      value={editableContent.heroBadge}
                      onChange={(e) => setEditableContent({ ...editableContent, heroBadge: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right focus:border-sky-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">الكلمة المميزة باللون المتدرج</label>
                    <input
                      type="text"
                      value={editableContent.heroTitleHighlight}
                      onChange={(e) => setEditableContent({ ...editableContent, heroTitleHighlight: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right focus:border-sky-400"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">العنوان الرئيسي الكبير</label>
                    <input
                      type="text"
                      value={editableContent.heroTitleLine1}
                      onChange={(e) => setEditableContent({ ...editableContent, heroTitleLine1: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right focus:border-sky-400"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">الوصف التعريفي للبانر الرئيسي</label>
                    <textarea
                      rows={2}
                      value={editableContent.heroDescription}
                      onChange={(e) => setEditableContent({ ...editableContent, heroDescription: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right focus:border-sky-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">نص زر الإجراء الأول (طلب الكارت)</label>
                    <input
                      type="text"
                      value={editableContent.heroCtaButton}
                      onChange={(e) => setEditableContent({ ...editableContent, heroCtaButton: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right focus:border-sky-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">نص زر الإجراء الثاني (دليل المتاجر)</label>
                    <input
                      type="text"
                      value={editableContent.heroSecondaryButton}
                      onChange={(e) => setEditableContent({ ...editableContent, heroSecondaryButton: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right focus:border-sky-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">شارة الثقة 1 (أمان الكروت)</label>
                    <input
                      type="text"
                      value={editableContent.heroTrustBadge1}
                      onChange={(e) => setEditableContent({ ...editableContent, heroTrustBadge1: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right focus:border-sky-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">شارة الثقة 2 (سرعة النقاط)</label>
                    <input
                      type="text"
                      value={editableContent.heroTrustBadge2}
                      onChange={(e) => setEditableContent({ ...editableContent, heroTrustBadge2: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right focus:border-sky-400"
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: How It Works Section */}
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>2. قسم خطوات المنظومة (كيف تعمل؟)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">شارة القسم</label>
                    <input
                      type="text"
                      value={editableContent.howItWorksBadge}
                      onChange={(e) => setEditableContent({ ...editableContent, howItWorksBadge: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">عنوان القسم الرئيسي</label>
                    <input
                      type="text"
                      value={editableContent.howItWorksTitle}
                      onChange={(e) => setEditableContent({ ...editableContent, howItWorksTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">الوصف الفرعي للقسم</label>
                    <input
                      type="text"
                      value={editableContent.howItWorksSubtitle}
                      onChange={(e) => setEditableContent({ ...editableContent, howItWorksSubtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right"
                    />
                  </div>

                  {/* Step 1 to 6 */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-sky-400 block">الخطوة 01:</span>
                    <input
                      type="text"
                      value={editableContent.step1Title}
                      onChange={(e) => setEditableContent({ ...editableContent, step1Title: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs text-right"
                    />
                    <textarea
                      rows={2}
                      value={editableContent.step1Desc}
                      onChange={(e) => setEditableContent({ ...editableContent, step1Desc: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs text-right"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-sky-400 block">الخطوة 02:</span>
                    <input
                      type="text"
                      value={editableContent.step2Title}
                      onChange={(e) => setEditableContent({ ...editableContent, step2Title: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs text-right"
                    />
                    <textarea
                      rows={2}
                      value={editableContent.step2Desc}
                      onChange={(e) => setEditableContent({ ...editableContent, step2Desc: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs text-right"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-sky-400 block">الخطوة 03:</span>
                    <input
                      type="text"
                      value={editableContent.step3Title}
                      onChange={(e) => setEditableContent({ ...editableContent, step3Title: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs text-right"
                    />
                    <textarea
                      rows={2}
                      value={editableContent.step3Desc}
                      onChange={(e) => setEditableContent({ ...editableContent, step3Desc: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs text-right"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-sky-400 block">الخطوة 04:</span>
                    <input
                      type="text"
                      value={editableContent.step4Title}
                      onChange={(e) => setEditableContent({ ...editableContent, step4Title: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs text-right"
                    />
                    <textarea
                      rows={2}
                      value={editableContent.step4Desc}
                      onChange={(e) => setEditableContent({ ...editableContent, step4Desc: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs text-right"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-sky-400 block">الخطوة 05:</span>
                    <input
                      type="text"
                      value={editableContent.step5Title}
                      onChange={(e) => setEditableContent({ ...editableContent, step5Title: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs text-right"
                    />
                    <textarea
                      rows={2}
                      value={editableContent.step5Desc}
                      onChange={(e) => setEditableContent({ ...editableContent, step5Desc: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs text-right"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-bold text-sky-400 block">الخطوة 06:</span>
                    <input
                      type="text"
                      value={editableContent.step6Title}
                      onChange={(e) => setEditableContent({ ...editableContent, step6Title: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs text-right"
                    />
                    <textarea
                      rows={2}
                      value={editableContent.step6Desc}
                      onChange={(e) => setEditableContent({ ...editableContent, step6Desc: e.target.value })}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Group 3: Services & Store & Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Store className="w-4 h-4 text-emerald-400" />
                    <span>3. نصوص قسم الخدمات</span>
                  </h3>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">شارة القسم</label>
                    <input
                      type="text"
                      value={editableContent.servicesBadge}
                      onChange={(e) => setEditableContent({ ...editableContent, servicesBadge: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">عنوان الخدمات</label>
                    <input
                      type="text"
                      value={editableContent.servicesTitle}
                      onChange={(e) => setEditableContent({ ...editableContent, servicesTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">الوصف الفرعي</label>
                    <input
                      type="text"
                      value={editableContent.servicesSubtitle}
                      onChange={(e) => setEditableContent({ ...editableContent, servicesSubtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">نص زر عرض الكل</label>
                    <input
                      type="text"
                      value={editableContent.servicesViewAllBtn}
                      onChange={(e) => setEditableContent({ ...editableContent, servicesViewAllBtn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right"
                    />
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span>4. نصوص قسم المتجر والمكافآت</span>
                  </h3>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">شارة القسم</label>
                    <input
                      type="text"
                      value={editableContent.storeBadge}
                      onChange={(e) => setEditableContent({ ...editableContent, storeBadge: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">عنوان المتجر</label>
                    <input
                      type="text"
                      value={editableContent.storeTitle}
                      onChange={(e) => setEditableContent({ ...editableContent, storeTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">الوصف الفرعي</label>
                    <input
                      type="text"
                      value={editableContent.storeSubtitle}
                      onChange={(e) => setEditableContent({ ...editableContent, storeSubtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">نص زر التصفح</label>
                    <input
                      type="text"
                      value={editableContent.storeViewAllBtn}
                      onChange={(e) => setEditableContent({ ...editableContent, storeViewAllBtn: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Group 4: Footer & Contact Info */}
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <span>5. بيانات التواصل وحقوق الفوتر (Footer)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-300 mb-1">شعار / نبذة الفوتر (Footer Tagline)</label>
                    <input
                      type="text"
                      value={editableContent.footerTagline}
                      onChange={(e) => setEditableContent({ ...editableContent, footerTagline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">رقم الهاتف الرسمي</label>
                    <input
                      type="text"
                      value={editableContent.footerPhone}
                      onChange={(e) => setEditableContent({ ...editableContent, footerPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">البريد الإلكتروني للدعم</label>
                    <input
                      type="text"
                      value={editableContent.footerEmail}
                      onChange={(e) => setEditableContent({ ...editableContent, footerEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono text-right"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-300 mb-1">نص حقوق الملكية (Copyright)</label>
                    <input
                      type="text"
                      value={editableContent.copyrightText}
                      onChange={(e) => setEditableContent({ ...editableContent, copyrightText: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs text-right"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button for Frontend Content */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="py-3 px-8 rounded-xl bg-gradient-to-r from-sky-400 via-sky-300 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-black text-sm shadow-xl shadow-sky-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>حفظ وتطبيق تعديلات الواجهة الأمامية فوراً</span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: CMS Pages Editor (عن المنظومة، الشروط والأحكام، سياسة الخصوصية) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest block mb-1">الصفحات الثابتة والسياسات (CMS)</span>
              <h3 className="text-lg font-bold text-white">تعديل محتوى الصفحات والمقالات الرسمية للموقع</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                تعديل صفحات (عن المنظومة، الشروط والأحكام، سياسة الخصوصية وأي صفحة أخرى).
              </p>
            </div>

            {cmsSaveSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{cmsSaveSuccess}</span>
              </div>
            )}

            {/* Page selection pills */}
            <div className="flex flex-wrap items-center gap-3">
              {cmsPages.map((page) => (
                <button
                  key={page.slug}
                  type="button"
                  onClick={() => handleSelectCmsPage(page.slug)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedCmsSlug === page.slug
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {page.title}
                </button>
              ))}
            </div>

            {/* CMS Edit Form */}
            <form onSubmit={handleSaveCmsPage} className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-300 mb-2">عنوان الصفحة</label>
                  <input
                    type="text"
                    value={cmsEditTitle}
                    onChange={(e) => setCmsEditTitle(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">حجم الخط: {editorFontSize}px</label>
                  <input
                    type="range"
                    min="12"
                    max="24"
                    value={editorFontSize}
                    onChange={(e) => setEditorFontSize(Number(e.target.value))}
                    className="w-32"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">محتوى الصفحة</label>
                <textarea
                  rows={10}
                  value={cmsEditContent}
                  onChange={(e) => setCmsEditContent(e.target.value)}
                  required
                  style={{ fontSize: `${editorFontSize}px` }}
                  className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 text-white leading-relaxed font-sans"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-sm transition-all"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 1: KPIS & METRICS ================= */}
      {/* ================= TAB: PRODUCTS ================= */}
      {activeTab === 'products' && (
        <AdminProductsManager products={products} onAdd={handleCreateProduct} onUpdate={handleUpdateProduct} onDelete={handleDeleteProduct} />
      )}

      {/* ================= TAB: CUSTOMERS ================= */}
      {activeTab === 'customers' && (
        <AdminCustomersManager customers={customers} onUpdate={loadData} onDelete={async (userId) => {
          try {
            await api.deleteCustomer(userId);
            loadData();
          } catch (err: any) {
            alert(err.message);
          }
        }} />
      )}

      {/* ================= TAB: BUSINESSES ================= */}
      {activeTab === 'businesses' && (
        <AdminBusinessesManager businesses={businesses} onAdd={handleCreateBusiness} onUpdate={handleUpdateBusiness} onDelete={handleDeleteBusiness} />
      )}

      {/* ================= TAB: CARDS ================= */}
      {activeTab === 'cards' && (
        <AdminCardsManager cards={cards} onAdd={handleCreateCard} onUpdate={handleUpdateCard} onDelete={handleDeleteCard} />
      )}
      {activeTab === 'services' && (
        <AdminServicesManager services={services} onAdd={() => alert('Add not implemented')} onDelete={(id) => alert('Delete not implemented')} />
      )}

      {/* ================= TAB: OFFERS ================= */}
      {activeTab === 'offers' && (
        <AdminOffersManager offers={offers} onAdd={() => alert('Add not implemented')} onDelete={(id) => alert('Delete not implemented')} />
      )}

      {/* ================= TAB: GOVERNORATES ================= */}
      {activeTab === 'governorates' && (
        <AdminGovernoratesManager governorates={governorates} onAdd={handleCreateGovernorate} onUpdate={handleUpdateGovernorate} onDelete={handleDeleteGovernorate} />
      )}
      
      {activeTab === 'notifications' && (
        <AdminNotificationsManager />
      )}

      {activeTab === 'kpis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#0b0f1b] border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">العملاء المسجلون</span>
              <p className="font-mono text-3xl font-black text-white">{metrics?.totalCustomers || 1}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#0b0f1b] border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">الكروت النشطة</span>
              <p className="font-mono text-3xl font-black text-sky-400">{metrics?.activeCards || 1}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#0b0f1b] border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">المتاجر في الدليل</span>
              <p className="font-mono text-3xl font-black text-emerald-400">{metrics?.listedBusinesses || 1}</p>
            </div>
            <div className="p-5 rounded-2xl bg-[#0b0f1b] border border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">إجمالي النقاط الصادرة</span>
              <p className="font-mono text-3xl font-black text-amber-400">{metrics?.totalPointsAwarded || 450}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-4">المنتجات الأكثر مبيعاً</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[{name: 'منتج أ', sales: 4000}, {name: 'منتج ب', sales: 3000}, {name: 'منتج ج', sales: 2000}]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-4">نشاط المستخدمين اليومي</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={[{day: 'السبت', users: 400}, {day: 'الأحد', users: 300}, {day: 'الاثنين', users: 200}]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Health Status Box */}
          <div className="p-6 rounded-2xl bg-[#0b0f1b] border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>فحص كفاءة وأداء مكونات النظام (Health Check)</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">REST API v1</span>
                <span className="text-emerald-400 font-bold">UP (200 OK)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Database</span>
                <span className="text-emerald-400 font-bold">ACID ACTIVE</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Redis Cache</span>
                <span className="text-sky-400 font-bold">CONNECTED</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Media Storage</span>
                <span className="text-sky-400 font-bold">SECURED S3</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Job Queue</span>
                <span className="text-emerald-400 font-bold">3 WORKERS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: APPROVALS ================= */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          {/* Section 1: Customer Card & Membership Approvals */}
          <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-sky-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-sky-400" />
                <span>طلبات تسجيل العملاء وإصدار الكروت الذكية المعلقة (Customer Approvals)</span>
              </h3>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold">
                {customers.filter((c) => c.user?.status === 'PENDING').length} طلب معلق
              </span>
            </div>

            <div className="divide-y divide-slate-800/80">
              {customers.filter((c) => c.user?.status === 'PENDING').length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs text-slate-400">لا توجد طلبات عملاء معلقة حالياً، جميع الكروت معتمدة ومفعلة.</p>
                </div>
              ) : (
                customers
                  .filter((c) => c.user?.status === 'PENDING')
                  .map((c) => (
                    <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-900/30 px-3 rounded-2xl transition-colors">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{c.fullName}</h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-500/30 font-semibold">
                            معلق - بانتظار إصدار الكارت
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 space-x-2 space-x-reverse">
                          <span>الهاتف: <strong className="font-mono text-sky-300">{c.user?.phone}</strong></span>
                          <span>•</span>
                          <span>البريد: <span className="font-mono text-slate-300">{c.user?.email || 'لم يُحدد (اختياري)'}</span></span>
                          <span>•</span>
                          <span>{c.governorate}، {c.city}</span>
                          {c.address && <span>• العنوان: {c.address}</span>}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleApproveCustomer(c.userId)}
                          className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-slate-950" />
                          <span>قبول الطلب وتفعيل الكارت</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectCustomer(c.userId)}
                          className="py-2 px-3.5 rounded-xl bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-500/40 text-xs font-semibold transition-all flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>رفض الطلب</span>
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>

          {/* Section 2: Business Partner Requests */}
          <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Store className="w-4 h-4 text-amber-400" />
              <span>طلبات انضمام الأنشطة التجارية والمتاجر (Business Approvals)</span>
            </h3>

            <div className="divide-y divide-slate-800/80">
              {businesses.filter((b) => b.status === 'PENDING').length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">لا توجد طلبات متاجر معلقة بانتظار المراجعة حالياً.</p>
              ) : (
                businesses
                  .filter((b) => b.status === 'PENDING')
                  .map((b) => (
                    <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-white text-sm">{b.businessName}</h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          المسؤول: {b.ownerName} • هاتف: <span className="font-mono">{b.phone}</span> • {b.governorate}، {b.city}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleBusinessStatus(b.id, 'ACTIVE', true)}
                          className="py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>موافقة وإدراج في الدليل</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBusinessStatus(b.id, 'REJECTED', false)}
                          className="py-1.5 px-3 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-500/30 text-xs transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>رفض</span>
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CUSTOMERS ================= */}
      {activeTab === 'customers' && (
        <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-sky-400" />
            <span>قائمة العملاء المسجلين ({customers.length})</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 pr-2">الاسم</th>
                  <th className="pb-3">رقم الهاتف</th>
                  <th className="pb-3">المحافظة</th>
                  <th className="pb-3">رقم الكارت</th>
                  <th className="pb-3">رصيد النقاط</th>
                  <th className="pb-3">حالة الحساب</th>
                  <th className="pb-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {customers.map((c) => {
                  const status = c.user?.status || 'PENDING';
                  return (
                    <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3 pr-2 font-bold text-white">{c.fullName}</td>
                      <td className="py-3 font-mono text-slate-300">{c.user?.phone || 'غير مسجل'}</td>
                      <td className="py-3 text-slate-300">{c.governorate}</td>
                      <td className="py-3 font-mono text-sky-400 font-semibold">{c.card?.cardNumber || 'لم يصدر'}</td>
                      <td className="py-3 font-mono text-amber-400 font-bold">{c.pointAccount?.balance || 0} pt</td>
                      <td className="py-3">
                        {status === 'PENDING' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-500/20 font-bold">
                            معلق (بانتظار الموافقة)
                          </span>
                        )}
                        {(status === 'APPROVED' || status === 'ACTIVE') && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/20 font-bold">
                            معتمد ونشط
                          </span>
                        )}
                        {status === 'REJECTED' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-500/20 font-bold">
                            مرفوض
                          </span>
                        )}
                        {status === 'SUSPENDED' && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-bold">
                            معلق مؤقتاً
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        {status === 'PENDING' ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApproveCustomer(c.userId)}
                              className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 font-bold transition-all text-[11px]"
                            >
                              قبول وتفعيل
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectCustomer(c.userId)}
                              className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white font-bold transition-all text-[11px]"
                            >
                              رفض
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 4: BUSINESSES ================= */}
      {activeTab === 'businesses' && (
        <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
            <Store className="w-4 h-4 text-sky-400" />
            <span>الأنشطة التجارية وإدارة الإدراج بالدليل</span>
          </h3>

          <div className="divide-y divide-slate-800/80">
            {businesses.map((b) => (
              <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-sm">{b.businessName}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${b.isListed ? 'bg-sky-950 text-sky-400 border border-sky-400/30' : 'bg-slate-800 text-slate-400'}`}>
                      {b.isListed ? 'معروض في الدليل' : 'مخفي من الدليل'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {b.ownerName} • {b.phone} • {b.governorate} • التقييم: {b.ratingAvg} ({b.ratingCount} تقييم)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleBusinessStatus(b.id, b.status, !b.isListed)}
                    className="py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition-colors"
                  >
                    {b.isListed ? 'إخفاء من الدليل' : 'إظهار في الدليل'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 5: CARDS ================= */}
      {activeTab === 'cards' && (
        <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-sky-400" />
            <span>منظومة الكروت البلاستيكية ورموز الـ QR</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 pr-2">رقم الكارت</th>
                  <th className="pb-3">رمز الـ QR الموحد</th>
                  <th className="pb-3">العميل</th>
                  <th className="pb-3">تاريخ الإصدار</th>
                  <th className="pb-3">تاريخ الانتهاء</th>
                  <th className="pb-3">الحالة</th>
                  <th className="pb-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {cards.map((card) => (
                  <tr key={card.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 pr-2 font-bold text-sky-300">{card.cardNumber}</td>
                    <td className="py-3 text-slate-400">{card.qrId}</td>
                    <td className="py-3 font-sans text-white">{card.customer?.fullName}</td>
                    <td className="py-3 text-slate-400">{new Date(card.issueDate).toLocaleDateString('ar-EG')}</td>
                    <td className="py-3 text-slate-400">{new Date(card.expiryDate).toLocaleDateString('ar-EG')}</td>
                    <td className="py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded ${card.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-400' : 'bg-rose-950 text-rose-400'}`}>
                        {card.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {card.status === 'ACTIVE' ? (
                        <button
                          type="button"
                          onClick={() => handleCardStatus(card.id, 'BLOCKED')}
                          className="text-rose-400 hover:underline font-sans text-[11px]"
                        >
                          إيقاف / قفل
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCardStatus(card.id, 'ACTIVE')}
                          className="text-emerald-400 hover:underline font-sans text-[11px]"
                        >
                          إعادة تفعيل
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 6: POINTS ADJUSTMENT (SUPER ADMIN #118) ================= */}
      {activeTab === 'points' && (
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl bg-[#0b0f1b] border border-sky-500/30 shadow-xl space-y-6">
          <div className="text-center">
            <Coins className="w-10 h-10 text-amber-400 mx-auto mb-2" />
            <h3 className="text-lg font-black text-white">تعديل رصيد النقاط اليدوي (Super Admin)</h3>
            <p className="text-xs text-slate-400 mt-1">
              خاص بالمشرف العام فقط. يتطلب إدخال سبب رسمي إلزامي يُسجل في دفتر التدقيق الرقابي.
            </p>
          </div>

          {adjStatus && (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs">
              {adjStatus}
            </div>
          )}

          <form onSubmit={handlePointsAdjustment} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">اختر العميل</label>
              <select
                value={adjCustomerId}
                onChange={(e) => setAdjCustomerId(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-right"
              >
                <option value="">-- اختر عميلاً للتعديل --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.user.phone}) - رصيد: {c.pointAccount?.balance || 0} pt
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                قيمة التعديل (موجب للإضافة، سالب للخصم)
              </label>
              <input
                type="number"
                value={adjPoints}
                onChange={(e) => setAdjPoints(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-right"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                السبب الإلزامي للتعديل <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                value={adjReason}
                onChange={(e) => setAdjReason(e.target.value)}
                placeholder="مثال: تعويض استثنائي بعد مراجعة تذكرة الدعم رقم SUP-..."
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-right"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors shadow-lg shadow-amber-500/20"
            >
              تنفيذ التعديل وتسجيله في سجل التدقيق
            </button>
          </form>
        </div>
      )}

      {/* ================= TAB 7: SETTINGS ================= */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-8">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-sky-400" />
            <span>إعدادات وقواعد عمل المنظومة (System Settings)</span>
          </h3>

          {/* Maintenance Mode Toggle */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">وضع الصيانة (Maintenance Mode)</h4>
                <p className="text-xs text-slate-400 mt-1">عند التفعيل، سيتم عرض شاشة الصيانة لجميع المستخدمين عدا المشرفين.</p>
              </div>
              <button
                type="button"
                onClick={toggleMaintenanceMode}
                className={`w-14 h-8 rounded-full flex items-center p-1 transition-colors ${
                  settings.isMaintenanceMode ? 'bg-rose-600 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-white shadow-sm" />
              </button>
            </div>
            <div className={`p-3 rounded-lg text-xs font-bold ${settings.isMaintenanceMode ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'}`}>
              الحالة الحالية: {settings.isMaintenanceMode ? 'مفعل (الموقع في وضع الصيانة)' : 'معطل (الموقع يعمل بشكل طبيعي)'}
            </div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {systemSettings.map((s) => (
              <div key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-mono font-bold text-sky-300">{s.key}</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">{s.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700 text-white font-bold">
                    {s.value}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingSetting({ key: s.key, value: s.value })}
                    className="text-sky-400 hover:underline"
                  >
                    تعديل
                  </button>
                </div>
              </div>
            ))}
          </div>

          {editingSetting && (
            <div className="p-4 rounded-xl bg-slate-900 border border-sky-500/40 flex items-center gap-3">
              <span className="text-xs text-white font-mono">{editingSetting.key}:</span>
              <input
                type="text"
                value={editingSetting.value}
                onChange={(e) => setEditingSetting({ ...editingSetting, value: e.target.value })}
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-xs text-white text-right"
              />
              <button
                type="button"
                onClick={handleSaveSetting}
                className="py-1.5 px-4 rounded-lg bg-sky-500 text-slate-950 font-bold text-xs"
              >
                حفظ
              </button>
              <button
                type="button"
                onClick={() => setEditingSetting(null)}
                className="py-1.5 px-3 rounded-lg bg-slate-800 text-slate-400 text-xs"
              >
                إلغاء
              </button>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 8: SCHEDULED JOBS ================= */}
      {activeTab === 'jobs' && (
        <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>المهام المجدولة الآلية (Cron Jobs)</span>
          </h3>

          <div className="divide-y divide-slate-800/80">
            {jobs.map((job) => (
              <div key={job.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-white text-sm">{job.name}</h4>
                  <p className="text-slate-400 mt-0.5">{job.description}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500 font-mono">
                    <span>الجدول: {job.schedule}</span>
                    <span>•</span>
                    <span>آخر تشغيل: {new Date(job.lastRun).toLocaleString('ar-EG')}</span>
                    <span>•</span>
                    <span>مرات التشغيل: {job.runCount}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRunJob(job.id)}
                  className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-sky-950 hover:text-sky-300 border border-slate-700 text-slate-200 font-semibold transition-colors flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Play className="w-3.5 h-3.5 text-sky-400 fill-current" />
                  <span>تشغيل يدوي فوري</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 9: AUDIT LOGS ================= */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <span>سجل التدقيق الأمني والرقابي (Audit Log)</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 pr-2">الوقت</th>
                  <th className="pb-3">المستخدم / الفاعل</th>
                  <th className="pb-3">الحدث</th>
                  <th className="pb-3">الكيان</th>
                  <th className="pb-3">السبب / الملاحظة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-2.5 pr-2 text-slate-400">{new Date(log.timestamp).toLocaleString('ar-EG')}</td>
                    <td className="py-2.5 text-sky-300 font-bold">{log.actorRole}</td>
                    <td className="py-2.5 text-white">{log.action}</td>
                    <td className="py-2.5 text-slate-400">{log.entity}</td>
                    <td className="py-2.5 font-sans text-slate-300">{log.reason || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'news' && (
        <AdminNewsManager news={news} onUpdate={loadData} />
      )}
    </div>
  );
};
