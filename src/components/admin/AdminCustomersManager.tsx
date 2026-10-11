import React, { useState } from 'react';
import { Plus, Trash2, Users, AlertTriangle, Play, Pause, Ban, Save, Edit } from 'lucide-react';
import { Customer } from '../../types';
import { api } from '../../api/client';

interface Props {
  customers: Customer[];
  onUpdate: () => void;
  onDelete: (userId: string) => void;
}

export const AdminCustomersManager: React.FC<Props> = ({ customers, onUpdate, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Customer>>({
    fullName: '',
    governorate: '',
    city: '',
    referenceNumber: '',
    rating: 5
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.governorate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // In a real app, this would call an API to create/update
      alert('تم حفظ البيانات بنجاح (محاكاة)');
      onUpdate();
      setFormData({ fullName: '', governorate: '', city: '', referenceNumber: '', rating: 5 });
      setEditingId(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleStatusChange = async (userId: string, status: string) => {
    if (!window.confirm(`هل أنت متأكد من تغيير حالة العميل إلى ${status}?`)) return;
    try {
      await api.updateCustomerStatus(userId, status, 'تحديث الحالة من لوحة الإدارة');
      onUpdate();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل نهائياً؟')) {
      try {
        await api.deleteCustomer(userId);
        onUpdate();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl">
        <h3 className="text-xl font-black text-white mb-4">إدارة العملاء</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 rounded-xl bg-slate-900 border border-slate-800">
          <input type="text" placeholder="الاسم الكامل" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
          <input type="text" placeholder="المحافظة" value={formData.governorate} onChange={e => setFormData({...formData, governorate: e.target.value})} className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
          <input type="text" placeholder="المدينة" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
          <input type="text" placeholder="رقم المرجع" value={formData.referenceNumber} onChange={e => setFormData({...formData, referenceNumber: e.target.value})} className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-white" required />
          <input type="number" placeholder="التقييم (1-5)" min="1" max="5" value={formData.rating} onChange={e => setFormData({...formData, rating: Number(e.target.value)})} className="p-2 bg-slate-950 border border-slate-700 rounded-lg text-white" />
          <button type="submit" className="flex items-center justify-center gap-2 bg-sky-600 text-white p-2 rounded-lg font-bold hover:bg-sky-500">
            <Save className="w-5 h-5" />
            {editingId ? 'تعديل العميل' : 'إضافة عميل'}
          </button>
        </form>

        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-bold text-white">قائمة العملاء</h4>
          <input
            type="text"
            placeholder="بحث في العملاء..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
          />
        </div>

        <div className="space-y-4">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-4">
                <Users className="w-10 h-10 text-sky-400" />
                <div>
                  <h4 className="font-bold text-white">{customer.fullName}</h4>
                  <p className="text-xs text-slate-400">{customer.governorate} - {customer.city} | التقييم: {customer.rating || 'N/A'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingId(customer.id); setFormData(customer); }} className="p-2 text-blue-400 hover:bg-blue-950 rounded-lg" title="تعديل">
                  <Edit className="w-5 h-5" />
                </button>
                <button onClick={() => handleStatusChange(customer.userId, 'ACTIVE')} className="p-2 text-emerald-400 hover:bg-emerald-950 rounded-lg" title="تفعيل">
                  <Play className="w-5 h-5" />
                </button>
                <button onClick={() => handleStatusChange(customer.userId, 'SUSPENDED')} className="p-2 text-amber-400 hover:bg-amber-950 rounded-lg" title="إيقاف مؤقت">
                  <Pause className="w-5 h-5" />
                </button>
                <button onClick={() => handleStatusChange(customer.userId, 'BANNED')} className="p-2 text-red-400 hover:bg-red-950 rounded-lg" title="حظر">
                  <Ban className="w-5 h-5" />
                </button>
                <button onClick={() => handleDelete(customer.userId)} className="p-2 text-rose-400 hover:bg-rose-950 rounded-lg" title="حذف">
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
