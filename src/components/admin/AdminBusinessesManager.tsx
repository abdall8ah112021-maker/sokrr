import React, { useState } from 'react';
import { Plus, Trash2, Store } from 'lucide-react';
import { Business } from '../../types';

interface Props {
  businesses: Business[];
  onAdd: (business: Omit<Business, 'id'>) => void;
  onUpdate: (id: string, business: Partial<Business>) => void;
  onDelete: (id: string) => void;
}

export const AdminBusinessesManager: React.FC<Props> = ({ businesses, onAdd, onUpdate, onDelete }) => {
  const [newBusiness, setNewBusiness] = useState<Partial<Business>>({
    userId: '',
    businessName: '',
    ownerName: '',
    phone: '',
    governorate: '',
    city: '',
    address: '',
    type: '',
    sectorId: '',
    description: '',
    isListed: true,
    status: 'ACTIVE',
    ratingAvg: 0,
    ratingCount: 0,
    logoUrl: '',
  });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBusinesses = businesses.filter(
    (business) =>
      business.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newBusiness as Omit<Business, 'id'>);
    setNewBusiness({
        userId: '',
        businessName: '',
        ownerName: '',
        phone: '',
        governorate: '',
        city: '',
        address: '',
        type: '',
        sectorId: '',
        description: '',
        isListed: true,
        status: 'ACTIVE',
        ratingAvg: 0,
        ratingCount: 0,
        logoUrl: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl">
        <h3 className="text-xl font-black text-white mb-4">إضافة متجر/شريك جديد مع التفاصيل</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="اسم المتجر" value={newBusiness.businessName} onChange={(e) => setNewBusiness({...newBusiness, businessName: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white" required />
          <input type="text" placeholder="اسم المالك" value={newBusiness.ownerName} onChange={(e) => setNewBusiness({...newBusiness, ownerName: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white" />
          <input type="text" placeholder="رقم الهاتف" value={newBusiness.phone} onChange={(e) => setNewBusiness({...newBusiness, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white" />
          <input type="text" placeholder="المحافظة" value={newBusiness.governorate} onChange={(e) => setNewBusiness({...newBusiness, governorate: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white" />
          <input type="text" placeholder="رابط صورة الشعار (Logo URL)" value={newBusiness.logoUrl || ''} onChange={(e) => setNewBusiness({...newBusiness, logoUrl: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white" />
          <textarea placeholder="وصف المتجر" value={newBusiness.description} onChange={(e) => setNewBusiness({...newBusiness, description: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white col-span-2" />
          <button type="submit" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 col-span-2">
            <Plus className="w-5 h-5" /> إضافة المتجر
          </button>
        </form>
      </div>

      <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-black text-white">قائمة المتاجر والشركاء</h3>
          <input
            type="text"
            placeholder="بحث في المتاجر..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
          />
        </div>
        <div className="space-y-4">
          {filteredBusinesses.map((business) => (
            <div key={business.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-4">
                {business.logoUrl ? (
                    <img src={business.logoUrl} alt={business.businessName} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                    <Store className="w-10 h-10 text-sky-400" />
                )}
                <div>
                  <h4 className="font-bold text-white">{business.businessName}</h4>
                  <p className="text-xs text-slate-400">{business.ownerName} | {business.phone}</p>
                </div>
              </div>
              <button onClick={() => onDelete(business.id)} className="p-2 text-rose-400 hover:bg-rose-950 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
