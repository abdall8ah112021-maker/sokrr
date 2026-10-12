import React, { useState } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { Service } from '../../types';

interface Props {
  services: Service[];
  onAdd: (service: Omit<Service, 'id'>) => void;
  onDelete: (id: string) => void;
}

export const AdminServicesManager: React.FC<Props> = ({ services, onAdd, onDelete }) => {
  const [newService, setNewService] = useState({
    name: '',
    nameAr: '',
    slug: '',
    icon: '',
    shortDescription: '',
    fullDescription: '',
    targetAudience: '',
    sectorId: '',
    isActive: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newService);
    setNewService({
      name: '',
      nameAr: '',
      slug: '',
      icon: '',
      shortDescription: '',
      fullDescription: '',
      targetAudience: '',
      sectorId: '',
      isActive: true,
    });
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl">
        <h3 className="text-xl font-black text-white mb-4">إضافة خدمة جديدة</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="اسم الخدمة (عربي)"
            value={newService.nameAr}
            onChange={(e) => setNewService({...newService, nameAr: e.target.value})}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
            required
          />
          <input
            type="text"
            placeholder="اسم الخدمة (إنجليزي)"
            value={newService.name}
            onChange={(e) => setNewService({...newService, name: e.target.value})}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
            required
          />
          <input
            type="text"
            placeholder="الوصف المختصر"
            value={newService.shortDescription}
            onChange={(e) => setNewService({...newService, shortDescription: e.target.value})}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white"
          />
          <textarea
            placeholder="الوصف الكامل"
            value={newService.fullDescription}
            onChange={(e) => setNewService({...newService, fullDescription: e.target.value})}
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white col-span-2"
          />
          <button type="submit" className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 col-span-2">
            <Plus className="w-5 h-5" />
            إضافة الخدمة
          </button>
        </form>
      </div>

      <div className="p-6 rounded-3xl bg-[#0b0f1b] border border-slate-800 shadow-xl">
        <h3 className="text-xl font-black text-white mb-4">قائمة الخدمات</h3>
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-4">
                <Tag className="w-10 h-10 text-sky-400" />
                <div>
                  <h4 className="font-bold text-white">{service.nameAr}</h4>
                  <p className="text-xs text-slate-400">{service.name}</p>
                </div>
              </div>
              <button onClick={() => onDelete(service.id)} className="p-2 text-rose-400 hover:bg-rose-950 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
