import React, { useState } from 'react';
import { Plus, Trash2, CreditCard } from 'lucide-react';
import { Card } from '../../types';

interface Props {
  cards: Card[];
  onAdd: (card: Omit<Card, 'id'>) => void;
  onUpdate: (id: string, card: Partial<Card>) => void;
  onDelete: (id: string) => void;
}

export const AdminCardsManager: React.FC<Props> = ({ cards, onAdd, onUpdate, onDelete }) => {
  const [newCard, setNewCard] = useState({
    cardId: '',
    qrId: '',
    cardNumber: '',
    customerId: '',
    status: 'ACTIVE' as 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BLOCKED' | 'EXPIRED',
    issueDate: new Date().toISOString(),
    expiryDate: new Date().toISOString(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newCard);
    setNewCard({
        cardId: '',
        qrId: '',
        cardNumber: '',
        customerId: '',
        status: 'ACTIVE',
        issueDate: new Date().toISOString(),
        expiryDate: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl">
        <h3 className="text-xl font-black text-white mb-4">إضافة كارت جديد</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="رقم الكارت"
            value={newCard.cardNumber}
            onChange={(e) => setNewCard({...newCard, cardNumber: e.target.value})}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
            required
          />
          <button type="submit" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400">
            <Plus className="w-5 h-5" />
            إضافة الكارت
          </button>
        </form>
      </div>

      <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl">
        <h3 className="text-xl font-black text-white mb-4">قائمة الكروت</h3>
        <div className="space-y-4">
          {cards.map((card) => (
            <div key={card.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-4">
                <CreditCard className="w-10 h-10 text-sky-400" />
                <div>
                  <h4 className="font-bold text-white">{card.cardNumber}</h4>
                  <p className="text-xs text-slate-400">{card.status}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onUpdate(card.id, { status: card.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' })} className="p-2 text-sky-400 hover:bg-sky-950 rounded-lg">
                    {card.status === 'ACTIVE' ? 'إيقاف' : 'تفعيل'}
                </button>
                <button onClick={() => onDelete(card.id)} className="p-2 text-rose-400 hover:bg-rose-950 rounded-lg">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
