import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Calendar,
  Eye,
  MessageSquare,
  Sparkles,
  Share2,
  ChevronRight,
  Send,
} from 'lucide-react';
import { NewsArticle } from '../types';

interface NewsPageProps {
  setCurrentTab: (tab: string) => void;
}

export const NewsPage: React.FC<NewsPageProps> = ({ setCurrentTab }) => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(false);

  useEffect(() => {
    api.getNews().then(setArticles).catch(() => {});
  }, []);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticle || !newComment.trim()) return;
    try {
      await api.addNewsComment(selectedArticle.id, newComment);
      setCommentSuccess(true);
      setNewComment('');
      // refresh article
      const updated = await api.getNewsArticle(selectedArticle.id);
      setSelectedArticle(updated);
      setTimeout(() => setCommentSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 text-right">
        <button
          type="button"
          onClick={() => setSelectedArticle(null)}
          className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold"
        >
          <ChevronRight className="w-4 h-4" />
          <span>العودة لجميع الأخبار والمقالات</span>
        </button>

        <article className="p-6 sm:p-10 rounded-3xl bg-[#0c101c] border border-slate-800 shadow-xl space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-bold text-sky-400 bg-sky-950 px-2.5 py-1 rounded border border-sky-500/30">
              {selectedArticle.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {selectedArticle.title}
            </h1>
            <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(selectedArticle.publishDate).toLocaleDateString('ar-EG')}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {selectedArticle.views} قراءة
              </span>
              <span>•</span>
              <span>الناشر: {selectedArticle.author}</span>
            </div>
          </div>

          {selectedArticle.imageUrl && (
            <img
              src={selectedArticle.imageUrl}
              alt={selectedArticle.title}
              className="w-full h-80 object-cover rounded-2xl border border-slate-800 shadow-md"
            />
          )}

          <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-line border-b border-slate-800 pb-8">
            {selectedArticle.content}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 text-xs">
            {selectedArticle.tags.map((t, idx) => (
              <span key={idx} className="text-slate-400 font-mono">
                #{t}
              </span>
            ))}
          </div>

          {/* Comments Section */}
          <div className="space-y-6 pt-6 border-t border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>التعليقات ({selectedArticle.comments.length})</span>
            </h3>

            {commentSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs">
                تم نشر تعليقك بنجاح!
              </div>
            )}

            {user ? (
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="أضف تعليقك..."
                  required
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white text-right"
                />
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-sky-500 text-slate-950 font-bold text-xs"
                >
                  نشر
                </button>
              </form>
            ) : (
              <p className="text-xs text-slate-500">
                يرجى تسجيل الدخول للمشاركة بالتعليق على هذا المقال.
              </p>
            )}

            <div className="space-y-3">
              {selectedArticle.comments.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <strong className="text-white">{c.userName}</strong>
                    <span className="text-[10px] font-mono">
                      {new Date(c.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <p className="text-slate-300">{c.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 text-right">
      <div>
        <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">المركز الإعلامي والمدونة</span>
        <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">أخبار وتحديثات Sugar Business</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          تابع أحدث الأخبار، التوسعات، والشركاء الجدد المنضمين لمنظومة الولاء
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((art) => (
          <div
            key={art.id}
            onClick={() => setSelectedArticle(art)}
            className="cursor-pointer rounded-3xl bg-[#0c101c] border border-slate-800 hover:border-sky-500/40 transition-all overflow-hidden flex flex-col justify-between group shadow-lg text-right"
          >
            <div>
              {art.imageUrl && (
                <div className="relative aspect-video w-full bg-slate-900 overflow-hidden">
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-sky-950/90 border border-sky-400/30 text-sky-300 text-[10px] font-bold px-2.5 py-0.5 rounded shadow">
                    {art.category}
                  </div>
                </div>
              )}

              <div className="p-5 space-y-2">
                <h3 className="font-bold text-base text-white group-hover:text-sky-300 transition-colors line-clamp-2">
                  {art.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {art.content}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0">
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>{new Date(art.publishDate).toLocaleDateString('ar-EG')}</span>
                <span className="text-sky-400 flex items-center gap-1 font-sans font-semibold">
                  <span>قراءة المقال</span>
                  <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
