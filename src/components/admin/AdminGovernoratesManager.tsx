import React, { useState } from 'react';
import { Plus, Trash2, MapPin, Edit2, Save, X } from 'lucide-react';
import { Governorate } from '../../types';

interface Props {
  governorates: Governorate[];
  onUpdate: (id: string, data: Partial<Governorate>) => void;
  onAdd: (data: Omit<Governorate, 'id'>) => void;
  onDelete: (id: string) => void;
}

export const AdminGovernoratesManager: React.FC<Props> = ({ governorates, onUpdate, onAdd, onDelete }) => {
  const [newGov, setNewGov] = useState({
    nameAr: '',
    nameEn: '',
    available: true,
    deliveryFee: 0,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editGov, setEditGov] = useState<Partial<Governorate>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newGov);
    setNewGov({
      nameAr: '',
      nameEn: '',
      available: true,
      deliveryFee: 0,
    });
  };

  const startEdit = (gov: Governorate) => {
    setEditingId(gov.id);
    setEditGov(gov);
  };

  const saveEdit = (id: string) => {
    onUpdate(id, editGov);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl">
        <h3 className="text-xl font-black text-white mb-4">إضافة محافظة</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="اسم المحافظة (عربي)" value={newGov.nameAr} onChange={(e) => setNewGov({...newGov, nameAr: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white" required />
          <input type="text" placeholder="اسم المحافظة (إنجليزي)" value={newGov.nameEn} onChange={(e) => setNewGov({...newGov, nameEn: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white" required />
          <input type="number" placeholder="رسوم التوصيل" value={newGov.deliveryFee} onChange={(e) => setNewGov({...newGov, deliveryFee: Number(e.target.value)})} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white" />
          <button type="submit" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 col-span-2">
            <Plus className="w-5 h-5" /> إضافة المحافظة
          </button>
        </form>
      </div>

      <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl">
        <h3 className="text-xl font-black text-white mb-4">قائمة المحافظات</h3>
        <div className="space-y-4">
          {governorates.map((gov) => (
            <div key={gov.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
              {editingId === gov.id ? (
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input type="text" value={editGov.nameAr} onChange={(e) => setEditGov({...editGov, nameAr: e.target.value})} className="px-2 py-1 bg-slate-800 text-white rounded" />
                  <input type="text" value={editGov.nameEn} onChange={(e) => setEditGov({...editGov, nameEn: e.target.value})} className="px-2 py-1 bg-slate-800 text-white rounded" />
                  <button onClick={() => saveEdit(gov.id)} className="text-emerald-400"><Save /></button>
                  <button onClick={() => setEditingId(null)} className="text-rose-400"><X /></button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <MapPin className="w-10 h-10 text-sky-400" />
                    <div>
                      <h4 className="font-bold text-white">{gov.nameAr}</h4>
                      <p className="text-xs text-slate-400">{gov.nameEn}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(gov)} className="p-2 text-sky-400 hover:bg-sky-950 rounded-lg">
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(gov.id)} className="p-2 text-rose-400 hover:bg-rose-950 rounded-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
