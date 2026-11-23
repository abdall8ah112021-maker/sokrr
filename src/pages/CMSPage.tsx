import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { ChevronRight } from 'lucide-react';
import { CMSPageItem } from '../types';

interface CMSPageProps {
  slug: string;
  setCurrentTab: (tab: string) => void;
}

export const CMSPage: React.FC<CMSPageProps> = ({ slug, setCurrentTab }) => {
  const [page, setPage] = useState<CMSPageItem | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPage = useCallback(() => {
    api.getCMSPage(slug)
      .then(setPage)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    loadPage();
  }, [loadPage]);

  useEffect(() => {
    const handleSync = () => loadPage();
    window.addEventListener('focus', handleSync);
    window.addEventListener('sugar:approvals:updated', handleSync);
    let ch: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      try {
        ch = new BroadcastChannel('sugar_approvals');
        ch.onmessage = handleSync;
      } catch {
        // Ignore BroadcastChannel error
      }
    }
    return () => {
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('sugar:approvals:updated', handleSync);
      if (ch) {
        try {
          ch.close();
        } catch {
          // Ignore close error
        }
      }
    };
  }, [loadPage]);

  if (loading || !page) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center text-slate-500 text-sm">
        جاري تحميل محتوى الصفحة...
      </div>
    );
  }

  const sections = Array.isArray(page.sections) ? page.sections : [];

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

      <div className="p-6 sm:p-10 rounded-3xl bg-[#0c101c] border border-slate-800 shadow-xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-white">{page.title}</h1>
          {page.metaDesc && (
            <p className="text-xs sm:text-sm text-slate-400">{page.metaDesc}</p>
          )}
        </div>

        {page.content && (
          <div className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line border-t border-slate-800 pt-6">
            {page.content}
          </div>
        )}

        {sections.length > 0 && (
          <div className="space-y-4 border-t border-slate-800 pt-6">
            {sections.map((sec, idx) => (
              <div
                key={sec.id || idx}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2"
              >
                <h2 className="text-base sm:text-lg font-bold text-sky-300">
                  {sec.heading}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {sec.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
