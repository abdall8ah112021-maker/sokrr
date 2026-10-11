import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Shield, FileText, ChevronRight } from 'lucide-react';
import { CMSPageEntity } from '../server/db';

interface CMSPageProps {
  slug: string;
  setCurrentTab: (tab: string) => void;
}

export const CMSPage: React.FC<CMSPageProps> = ({ slug, setCurrentTab }) => {
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCMSPage(slug)
      .then(setPage)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading || !page) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center text-slate-500 text-sm">
        جاري تحميل محتوى الصفحة...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6 text-right">
      <button
        type="button"
        onClick={() => setCurrentTab('home')}
        className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold"
      >
        <ChevronRight className="w-4 h-4" />
        <span>العودة للرئيسية</span>
      </button>

      <div className="p-8 sm:p-12 rounded-3xl bg-[#0c101c] border border-slate-800 shadow-xl space-y-6">
        <h1 className="text-2xl sm:text-3xl font-black text-white">{page.title}</h1>
        <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line border-t border-slate-800 pt-6">
          {page.content}
        </div>
      </div>
    </div>
  );
};
