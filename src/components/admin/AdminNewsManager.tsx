import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Image as ImageIcon } from 'lucide-react';
import { api } from '../../api/client';

export const AdminNewsManager: React.FC<{ news: any[]; onUpdate: () => void }> = ({ news, onUpdate }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddOrUpdateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.adminUpdateNews(editingId, { title, content, image });
      } else {
        await api.adminCreateNews({ title, content, image });
      }
      setTitle('');
      setContent('');
      setImage('');
      setEditingId(null);
      onUpdate();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setImage(item.image);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الخبر؟')) {
      try {
        await api.adminDeleteNews(id);
        onUpdate();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddOrUpdateNews} className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white">{editingId ? 'تعديل الخبر' : 'إضافة خبر جديد'}</h3>
        <input type="text" placeholder="العنوان" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white" />
        <textarea placeholder="المحتوى" value={content} onChange={(e) => setContent(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white" rows={4} />
        <input type="text" placeholder="رابط الصورة" value={image} onChange={(e) => setImage(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white" />
        <div className="flex gap-2">
            <button type="submit" className="px-6 py-2 rounded-lg bg-sky-600 text-white font-semibold">{editingId ? 'حفظ التعديلات' : 'إضافة'}</button>
            {editingId && <button type="button" onClick={() => {setEditingId(null); setTitle(''); setContent(''); setImage('');}} className="px-6 py-2 rounded-lg bg-slate-700 text-white font-semibold">إلغاء</button>}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {news.map((item: any) => (
          <div key={item.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h4 className="text-white font-bold">{item.title}</h4>
            <p className="text-slate-400 text-sm mt-2">{item.content}</p>
            {item.image && <img src={item.image} alt={item.title} className="w-full h-32 object-cover mt-2 rounded-lg" />}
            <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => handleEdit(item)} className="p-2 rounded-lg bg-amber-600 text-white"><Edit3 className="w-4 h-4"/></button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-rose-600 text-white"><Trash2 className="w-4 h-4"/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
