import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Type,
} from 'lucide-react';
import { CMSPageItem, CMSPageSection } from '../../types';

interface AdminCMSPageEditorProps {
  slug: 'about-us' | 'terms-and-conditions' | 'privacy-policy';
  page: CMSPageItem | undefined;
  defaultTitle: string;
  defaultBadge: string;
  headingSubtitle: string;
  itemLabel: string;
  onSave: (
    slug: string,
    payload: {
      title: string;
      content: string;
      sections: CMSPageSection[];
      metaDesc?: string;
    }
  ) => Promise<void> | void;
}

export const AdminCMSPageEditor: React.FC<AdminCMSPageEditorProps> = ({
  slug,
  page,
  defaultTitle,
  defaultBadge,
  headingSubtitle,
  itemLabel,
  onSave,
}) => {
  const [title, setTitle] = useState(page?.title || defaultTitle);
  const [content, setContent] = useState(page?.content || '');
  const [metaDesc, setMetaDesc] = useState(page?.metaDesc || '');
  const [sections, setSections] = useState<CMSPageSection[]>(
    Array.isArray(page?.sections) ? page!.sections! : []
  );
  const [fontSize, setFontSize] = useState<number>(15);
  const [newSectionHeading, setNewSectionHeading] = useState('');
  const [newSectionBody, setNewSectionBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setTitle(page?.title || defaultTitle);
    setContent(page?.content || '');
    setMetaDesc(page?.metaDesc || '');
    setSections(Array.isArray(page?.sections) ? page!.sections! : []);
  }, [slug, page, defaultTitle]);

  const showNotice = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 4000);
  };

  const persist = async (
    nextSections: CMSPageSection[] = sections,
    customMsg?: string
  ) => {
    setSaving(true);
    try {
      await onSave(slug, {
        title: title.trim() || defaultTitle,
        content,
        sections: nextSections,
        metaDesc: metaDesc.trim(),
      });
      showNotice(customMsg || `تم حفظ ونشر تحديثات صفحة «${title.trim() || defaultTitle}» بنجاح!`);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitMain = async (e: React.FormEvent) => {
    e.preventDefault();
    await persist(sections);
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionHeading.trim() && !newSectionBody.trim()) return;
    const item: CMSPageSection = {
      id: `sec_${Date.now().toString(36)}`,
      heading: newSectionHeading.trim() || itemLabel,
      body: newSectionBody.trim(),
    };
    const nextSections = [...sections, item];
    setSections(nextSections);
    setNewSectionHeading('');
    setNewSectionBody('');
    await persist(nextSections, `تمت إضافة ${itemLabel} وحفظ التعديلات في الصفحة بنجاح.`);
  };

  const handleUpdateSection = (
    id: string,
    field: 'heading' | 'body',
    value: string
  ) => {
    setSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, [field]: value } : sec))
    );
  };

  const handleMoveSection = async (idx: number, direction: -1 | 1) => {
    const target = idx + direction;
    if (target < 0 || target >= sections.length) return;
    const copy = [...sections];
    [copy[idx], copy[target]] = [copy[target], copy[idx]];
    setSections(copy);
    await persist(copy, 'تم إعادة ترتيب الفقرات والبنود وحفظها.');
  };

  const handleDeleteSection = async (id: string) => {
    const nextSections = sections.filter((s) => s.id !== id);
    setSections(nextSections);
    await persist(nextSections, `تم حذف ${itemLabel} وتحديث الصفحة فوراً.`);
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header Banner */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-l from-[#0e1526] via-[#0b101d] to-[#080c16] border border-sky-500/25 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-400/30 text-sky-300 text-xs font-bold mb-2">
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            <span>{defaultBadge}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            تحرير وإدارة صفحة «{title || defaultTitle}»
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">{headingSubtitle}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs text-slate-400 font-mono bg-slate-900/70 px-3.5 py-2 rounded-xl border border-slate-800">
          <span>الإصدار: v{page?.version || 1}</span>
          <span>•</span>
          <span>{sections.length} {itemLabel}</span>
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

      {/* Main Content Editor */}
      <form
        onSubmit={handleSubmitMain}
        className="p-5 sm:p-7 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl space-y-5"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              العنوان الرئيسي للصفحة
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 text-sm text-white"
            />
          </div>

          <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-xs text-slate-300 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-sky-400" />
              حجم الخط: {fontSize}px
            </span>
            <input
              type="range"
              min="12"
              max="22"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-24"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            وصف مختصر (اختياري)
          </label>
          <input
            type="text"
            value={metaDesc}
            onChange={(e) => setMetaDesc(e.target.value)}
            placeholder="ملخص يظهر تحت العنوان أو في محركات البحث"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-sky-400 text-xs sm:text-sm text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-300 mb-1.5">
            النص الرئيسي والمحتوى الكامل للصفحة
          </label>
          <textarea
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="اكتب المحتوى والفقرات هنا..."
            style={{ fontSize: `${fontSize}px` }}
            className="w-full px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 focus:border-sky-400 text-white leading-relaxed"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="py-3 px-8 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-sky-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>حفظ ونشر محتوى الصفحة</span>
          </button>
        </div>
      </form>

      {/* Structured Sections / Clauses Editor */}
      <div className="p-5 sm:p-7 rounded-3xl bg-[#0b0f1b] border border-sky-500/25 shadow-xl space-y-5">
        <div>
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            <span>إضافة وتعديل البنود والفقرات المنظمة ({sections.length})</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            يمكنك إضافة {itemLabel} جديدة أو تعديل وترتيب وحذف أي {itemLabel}، لتظهر بتنسيق منظم وواضح أسفل النص الرئيسي في صفحة الموقع.
          </p>
        </div>

        {/* Add Section Form */}
        <form
          onSubmit={handleAddSection}
          className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3"
        >
          <div>
            <label className="block text-xs text-slate-300 mb-1">عنوان الـ {itemLabel} *</label>
            <input
              type="text"
              required
              value={newSectionHeading}
              onChange={(e) => setNewSectionHeading(e.target.value)}
              placeholder={`مثال: ${itemLabel} جديد...`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-300 mb-1">تفاصيل الـ {itemLabel} *</label>
            <textarea
              rows={3}
              required
              value={newSectionBody}
              onChange={(e) => setNewSectionBody(e.target.value)}
              placeholder={`اكتب نص وتفاصيل ${itemLabel} هنا...`}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة {itemLabel}</span>
            </button>
          </div>
        </form>

        {/* Sections List */}
        <div className="space-y-3">
          {sections.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">
              لا توجد بنود إضافية منظمة مضافة بعد. يمكنك إضافة أي عدد من البنود من النموذج أعلاه.
            </p>
          ) : (
            sections.map((sec, idx) => (
              <div
                key={sec.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-sky-400 font-bold">
                    {itemLabel} #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMoveSection(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30"
                      title="تحريك للأعلى"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveSection(idx, 1)}
                      disabled={idx === sections.length - 1}
                      className="p-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-30"
                      title="تحريك للأسفل"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSection(sec.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={sec.heading}
                  onChange={(e) => handleUpdateSection(sec.id, 'heading', e.target.value)}
                  placeholder={`عنوان ${itemLabel}`}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-white font-bold"
                />
                <textarea
                  rows={3}
                  value={sec.body}
                  onChange={(e) => handleUpdateSection(sec.id, 'body', e.target.value)}
                  placeholder={`نص ${itemLabel}`}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs sm:text-sm text-slate-200 leading-relaxed"
                />
              </div>
            ))
          )}
        </div>

        {sections.length > 0 && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                persist(sections, `تم حفظ جميع البنود والفقرات في صفحة «${title || defaultTitle}» بنجاح!`)
              }
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>حفظ جميع البنود والفقرات</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
