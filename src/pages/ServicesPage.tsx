import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Sparkles, ChevronRight } from 'lucide-react';
import { Service, Sector } from '../types';

interface ServicesPageProps {
  setCurrentTab: (tab: string) => void;
  setSelectedServiceId: (id: string) => void;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ setCurrentTab }) => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  useEffect(() => {
    api.getSectors().then((res) => setSectors(Array.isArray(res) ? res : [])).catch(() => setSectors([]));
    api.getServices().then((res) => setServices(Array.isArray(res) ? res : [])).catch(() => setServices([]));
  }, []);

  const filteredServices = (Array.isArray(services) ? services : []).filter((s) => {
    if (!s) return false;
    return selectedSector === 'ALL' || s.sectorId === selectedSector;
  });

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8 text-right">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">شبكة الخدمات المعتمدة</span>
          <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">الخدمات والعناية الخاصة</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            خدمات متخصصة بخصومات ومزايا حصرية لأعضاء كارت Sugar Business لدى شركائنا المعتمدين
          </p>
        </div>

        {/* Sectors Segmented Filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSelectedSector('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedSector === 'ALL'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            جميع القطاعات
          </button>
          {sectors.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setSelectedSector(sec.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedSector === sec.id
                  ? 'bg-sky-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {sec.nameAr}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredServices.map((srv) => (
          <div
            key={srv.id}
            className="p-6 rounded-2xl bg-[#0c101d] border border-slate-800 hover:border-sky-500/30 transition-all flex flex-col justify-between text-right group shadow-lg"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-sky-950/70 border border-sky-400/30 flex items-center justify-center mb-4 text-sky-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors mb-2">
                {srv.nameAr}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                {srv.shortDescription}
              </p>
              <div className="text-[11px] text-slate-500 mb-4">
                الفئة المستهدفة: <strong className="text-slate-400 font-normal">{srv.targetAudience}</strong>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentTab('directory')}
                className="flex-1 py-2 px-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-sky-500/20"
              >
                <span>استعراض الشركاء المعتمدين</span>
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
