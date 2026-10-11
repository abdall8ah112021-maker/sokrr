import React from 'react';
import { Sparkles, Phone, Mail, MapPin, Shield, CheckCircle } from 'lucide-react';
import { useSiteContent } from '../../context/ContentContext';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const { content } = useSiteContent();

  return (
    <footer className="bg-[#05070c] border-t border-slate-800/80 text-slate-300 mt-20 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/70 text-right">
          {/* Col 1: Brand & Overview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-300 p-0.5 shadow-lg shadow-sky-500/20">
                <div className="w-full h-full bg-[#070a12] rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                </div>
              </div>
              <span className="font-black text-xl tracking-tight text-white">Sugar Business</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              {content.footerTagline}
            </p>
            <div className="flex items-center gap-4 text-xs text-sky-400/90 pt-2 font-mono">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-400" />
                بيانات مشفرة 256-bit
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-sky-400" />
                كروت بلاستيكية معتمدة
              </span>
            </div>
          </div>

          {/* Col 2: Services & Programs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-sky-400">المنظومة والخدمات</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button type="button" onClick={() => setCurrentTab('card')} className="hover:text-sky-300 transition-colors">
                  الكارت البلاستيكي الذكي
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setCurrentTab('points')} className="hover:text-sky-300 transition-colors">
                  نظام تجميع النقاط
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setCurrentTab('services')} className="hover:text-sky-300 transition-colors">
                  الخدمات المتاحة
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setCurrentTab('directory')} className="hover:text-sky-300 transition-colors">
                  دليل الشركاء والمتاجر
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setCurrentTab('governorates')} className="hover:text-sky-300 transition-colors">
                  تغطية المحافظات
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Store & Commerce */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-sky-400">المتجر والمكافآت</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button type="button" onClick={() => setCurrentTab('store')} className="hover:text-sky-300 transition-colors">
                  متجر مكافآت النقاط
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setCurrentTab('store')} className="hover:text-sky-300 transition-colors">
                  منتجات الشراء المباشر (COD)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setCurrentTab('offers')} className="hover:text-sky-300 transition-colors">
                  العروض الحصرية
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setCurrentTab('news')} className="hover:text-sky-300 transition-colors">
                  أخبار وتحديثات المنظومة
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Support & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-sky-400">الدعم والمساعدة</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button type="button" onClick={() => setCurrentTab('support')} className="hover:text-sky-300 transition-colors">
                  تذاكر الدعم الفني
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setCurrentTab('faq')} className="hover:text-sky-300 transition-colors">
                  الأسئلة الشائعة FAQ
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setCurrentTab('cms-about')} className="hover:text-sky-300 transition-colors">
                  عن Sugar Business
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setCurrentTab('cms-terms')} className="hover:text-sky-300 transition-colors">
                  الشروط والأحكام
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setCurrentTab('cms-privacy')} className="hover:text-sky-300 transition-colors">
                  سياسة الخصوصية
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Strip & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              {content.footerPhone}
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-sky-400" />
              {content.footerEmail}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-400" />
              {content.footerAddress}
            </span>
          </div>

          <p>{content.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
};
