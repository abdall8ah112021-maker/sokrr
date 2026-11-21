import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SiteContent {
  // Hero section
  heroBadge: string;
  heroTitleLine1: string;
  heroTitleHighlight: string;
  heroDescription: string;
  heroCtaButton: string;
  heroSecondaryButton: string;
  heroTrustBadge1: string;
  heroTrustBadge2: string;
  heroTrustBadge3: string;

  // How it works section
  howItWorksBadge: string;
  howItWorksTitle: string;
  howItWorksSubtitle: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  step5Title: string;
  step5Desc: string;
  step6Title: string;
  step6Desc: string;

  // Services section
  servicesBadge: string;
  servicesTitle: string;
  servicesSubtitle: string;
  servicesViewAllBtn: string;

  // Store section
  storeBadge: string;
  storeTitle: string;
  storeSubtitle: string;
  storeViewAllBtn: string;

  // Numbers & stats
  statsMembersLabel: string;
  statsCardsLabel: string;
  statsPartnersLabel: string;
  statsPointsLabel: string;

  // Reviews section
  reviewsBadge: string;
  reviewsTitle: string;

  // Footer & Branding
  footerTagline: string;
  footerPhone: string;
  footerEmail: string;
  footerHours: string;
  footerAddress: string;
  copyrightText: string;
}

export const defaultSiteContent: SiteContent = {
  // Hero
  heroBadge: 'الجيل الجديد لكروت ولاء العملاء والمكافآت الذكية',
  heroTitleLine1: 'كل عملية شراء لها قيمة، ومكافأتك بانتظارك مع',
  heroTitleHighlight: 'Sugar Business',
  heroDescription: 'احصل على كارتك البلاستيكي الذكي بتقنية الـ QR الموحدة للاستفادة من عروض وخصومات مئات الشركاء في جميع محافظات مصر، واجمع النقاط مع كل طلب شراء من متجر الموقع الرسمي لاستبدالها بجوائز حقيقية.',
  heroCtaButton: 'احصل على كارتك الآن',
  heroSecondaryButton: 'اكتشف المتاجر والشركاء',
  heroTrustBadge1: 'كروت بلاستيكية مشفرة',
  heroTrustBadge2: 'عروض وخصومات فورية',
  heroTrustBadge3: 'كسب واستبدال النقاط عبر المتجر',

  // How it works
  howItWorksBadge: 'خطوات بسيطة ومضمونة',
  howItWorksTitle: 'كيف تعمل منظومة Sugar Business؟',
  howItWorksSubtitle: 'صُمم النظام ليكون سريعاً وسلساً بين العميل والتاجر والمتجر الرسمي بدون تعقيدات أو انتظار.',
  step1Title: 'إنشاء الحساب',
  step1Desc: 'سجل بياناتك كعميل جديد عبر المنصة في دقائق معدودة مجاناً.',
  step2Title: 'الحصول على الكارت',
  step2Desc: 'استلم كارتك البلاستيكي الذكي المطبوع برقمك الخاص ورمز QR الشخصي.',
  step3Title: 'الاستفادة من عروض الشركاء',
  step3Desc: 'استخدم كارتك لدى شبكة المتاجر والكافيهات ومقدمي الخدمات المعتمدين للحصول على خصومات حصرية.',
  step4Title: 'مسح الكارت للتحقق',
  step4Desc: 'أبرز كارتك للكاشير لمسح رمز الـ QR وتأكيد عضويتك وتفعيل الخصم الفوري.',
  step5Title: 'كسب النقاط من متجر الموقع',
  step5Desc: 'تُضاف نقاط المكافأة فورياً إلى محفظتك عند شراء أي منتج نقدي من متجر الموقع الرسمي.',
  step6Title: 'استبدال النقاط بالمكافآت',
  step6Desc: 'استبدل نقاطك بمنتجات حصرية وتجارب فريدة من متجر المنظومة الرسمي.',

  // Services
  servicesBadge: 'تجارب استثنائية',
  servicesTitle: 'الخدمات المعتمدة',
  servicesSubtitle: 'باقة من أرقى الخدمات المختارة بعناية لأعضاء Sugar Business',
  servicesViewAllBtn: 'عرض جميع الخدمات',

  // Store
  storeBadge: 'مكافآت ومنتجات حقيقية',
  storeTitle: 'متجر الهدايا وكسب النقاط',
  storeSubtitle: 'اكسب نقاطك عند شراء المنتجات من المتجر، أو استبدل رصيدك بجوائز ومنتجات حصرية',
  storeViewAllBtn: 'تصفح جميع معروضات المتجر',

  // Stats
  statsMembersLabel: 'عضو نشط وموثق',
  statsCardsLabel: 'كارت بلاستيكي ذكي صادر',
  statsPartnersLabel: 'شريك ومتجر معتمد',
  statsPointsLabel: 'نقطة ولاء مكتسبة ومؤكدة',

  // Reviews
  reviewsBadge: 'آراء ومشاركات الشركاء والأعضاء',
  reviewsTitle: 'ماذا يقولون عن Sugar Business؟',

  // Footer & Branding
  footerTagline: 'المنظومة الأولى لربط ولاء العملاء بالكروت الذكية والمكافآت الفورية في مصر.',
  footerPhone: '01026541250',
  footerEmail: 'support@sugarbusiness.com',
  footerHours: 'يومياً من 9 صباحاً حتى 11 مساءً',
  footerAddress: 'جمهورية مصر العربية – تغطية شاملة لكافة المحافظات',
  copyrightText: 'جميع الحقوق محفوظة © 2026 Sugar Business Loyalty Network',
};

const STORAGE_KEY = 'sugar_site_frontend_content_v2';

interface ContentContextType {
  content: SiteContent;
  updateContent: (newContent: Partial<SiteContent>) => void;
  resetContent: () => void;
  saveAllContent: (allContent: SiteContent) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<SiteContent>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultSiteContent, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return defaultSiteContent;
  });

  const updateContent = (newContent: Partial<SiteContent>) => {
    setContent((prev) => {
      const updated = { ...prev, ...newContent };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save content to localStorage', e);
      }
      return updated;
    });
  };

  const saveAllContent = (allContent: SiteContent) => {
    setContent(allContent);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allContent));
    } catch (e) {
      console.error('Failed to save content to localStorage', e);
    }
  };

  const resetContent = () => {
    setContent(defaultSiteContent);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to reset content', e);
    }
  };

  return (
    <ContentContext.Provider value={{ content, updateContent, resetContent, saveAllContent }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useSiteContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useSiteContent must be used within a ContentProvider');
  }
  return context;
};
