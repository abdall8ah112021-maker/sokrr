import React, { useState } from 'react';
import { Plus, Trash2, Sparkles } from 'lucide-react';
import { Offer } from '../../types';

interface Props {
  offers: Offer[];
  onAdd: (offer: Omit<Offer, 'id'>) => void;
  onDelete: (id: string) => void;
}

export const AdminOffersManager: React.FC<Props> = ({ offers, onAdd, onDelete }) => {
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({
    businessId: '',
    title: '',
    description: '',
    discount: 0,
    discountType: 'PERCENTAGE',
    startDate: '',
    endDate: '',
    status: 'PENDING',
    selectedServiceIds: [],
    mainImage: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newOffer as Omit<Offer, 'id'>);
    setNewOffer({
      businessId: '',
      title: '',
      description: '',
      discount: 0,
      discountType: 'PERCENTAGE',
      startDate: '',
      endDate: '',
      status: 'PENDING',
      selectedServiceIds: [],
      mainImage: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl">
        <h3 className="text-xl font-black text-white mb-4">إضافة عرض جديد</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="عنوان العرض"
            value={newOffer.title}
            onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
            required
          />
          <input
            type="number"
            placeholder="نسبة الخصم"
            value={newOffer.discount}
            onChange={(e) => setNewOffer({...newOffer, discount: Number(e.target.value)})}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
            required
          />
          <input
            type="text"
            placeholder="رابط صورة العرض"
            value={newOffer.mainImage || ''}
            onChange={(e) => setNewOffer({...newOffer, mainImage: e.target.value})}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
          />
          <textarea
            placeholder="وصف العرض"
            value={newOffer.description}
            onChange={(e) => setNewOffer({...newOffer, description: e.target.value})}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white col-span-2"
          />
          <button type="submit" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 col-span-2">
            <Plus className="w-5 h-5" />
            إضافة العرض
          </button>
        </form>
      </div>

      <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl">
        <h3 className="text-xl font-black text-white mb-4">قائمة العروض</h3>
        <div className="space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-4">
                <Sparkles className="w-10 h-10 text-sky-400" />
                <div>
                  <h4 className="font-bold text-white">{offer.title}</h4>
                  <p className="text-xs text-slate-400">{offer.discount}%</p>
                </div>
              </div>
              <button onClick={() => onDelete(offer.id)} className="p-2 text-rose-400 hover:bg-rose-950 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
