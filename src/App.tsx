import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ContentProvider } from './context/ContentContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { AdminDataProvider } from './context/AdminDataContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { SmartFloatingButton } from './components/common/SmartFloatingButton';
import { CookieConsent } from './components/common/CookieConsent';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterCustomerPage } from './pages/RegisterCustomerPage';
import { RegisterBusinessPage } from './pages/RegisterBusinessPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { BusinessDashboardPage } from './pages/BusinessDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CardPage } from './pages/CardPage';
import { PointsPage } from './pages/PointsPage';
import { BusinessDirectoryPage } from './pages/BusinessDirectoryPage';
import { BusinessDetailPage } from './pages/BusinessDetailPage';
import { ServicesPage } from './pages/ServicesPage';
import { OffersPage } from './pages/OffersPage';
import { StorePage } from './pages/StorePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { DiscountServicesPage } from './pages/DiscountServicesPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { NewsPage } from './pages/NewsPage';
import { SupportPage } from './pages/SupportPage';
import { GovernoratesPage } from './pages/GovernoratesPage';
import { CMSPage } from './pages/CMSPage';
import { NotFoundPage } from './pages/NotFoundPage';

const MaintenanceOverlay = () => {
  const { settings } = useSettings();
  if (!settings.isMaintenanceMode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090e] text-center p-6">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-rose-500">نحن حالياً في وضع الصيانة</h1>
        <p className="text-xl text-slate-300">نعمل على تحديث المنظومة لتوفير تجربة أفضل. نعتذر عن هذا التوقف المؤقت.</p>
      </div>
    </div>
  );
};

function AppContent() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('biz_01');
  const [selectedProductId, setSelectedProductId] = useState<string>('prd_01');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('srv_01');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('ord_01');

  const { customer } = useAuth();
  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomePage
            setCurrentTab={setCurrentTab}
            setSelectedBusinessId={setSelectedBusinessId}
            setSelectedProductId={setSelectedProductId}
            setSelectedServiceId={setSelectedServiceId}
          />
        );
      case 'login':
        return <LoginPage setCurrentTab={setCurrentTab} />;
      case 'register-customer':
        return <RegisterCustomerPage setCurrentTab={setCurrentTab} />;
      case 'register-business':
        return <RegisterBusinessPage setCurrentTab={setCurrentTab} />;
      case 'customer-dashboard':
        return <CustomerDashboardPage setCurrentTab={setCurrentTab} setSelectedOrderId={setSelectedOrderId} />;
      case 'business-dashboard':
        return <BusinessDashboardPage />;
      case 'admin-dashboard':
        return <AdminDashboardPage />;
      case 'card':
        return <CardPage setCurrentTab={setCurrentTab} />;
      case 'points':
        return <PointsPage setCurrentTab={setCurrentTab} />;
      case 'directory':
        return (
          <BusinessDirectoryPage
            setCurrentTab={setCurrentTab}
            setSelectedBusinessId={setSelectedBusinessId}
          />
        );
      case 'business-detail':
        return (
          <BusinessDetailPage
            businessId={selectedBusinessId}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'services':
        if (!customer) {
          return <LoginPage setCurrentTab={setCurrentTab} />; // Or a custom "Login Required" message
        }
        return (
          <ServicesPage
            setCurrentTab={setCurrentTab}
            setSelectedServiceId={setSelectedServiceId}
          />
        );
      case 'offers':
        if (!customer) {
          return <LoginPage setCurrentTab={setCurrentTab} />;
        }
        return (
          <OffersPage
            setCurrentTab={setCurrentTab}
            setSelectedBusinessId={setSelectedBusinessId}
          />
        );
      case 'store':
        return (
          <StorePage
            setCurrentTab={setCurrentTab}
            setSelectedProductId={setSelectedProductId}
          />
        );
      case 'product-detail':
        return (
          <ProductDetailPage
            productId={selectedProductId}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'cart':
        return (
          <CartPage
            setCurrentTab={setCurrentTab}
            setSelectedOrderId={setSelectedOrderId}
          />
        );
      case 'order-detail':
        return (
          <OrderDetailsPage
            orderId={selectedOrderId}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'notifications':
        return <NotificationsPage setCurrentTab={setCurrentTab} />;
      case 'news':
        return <NewsPage setCurrentTab={setCurrentTab} />;
      case 'support':
        return <SupportPage setCurrentTab={setCurrentTab} initialTab="tickets" />;
      case 'faq':
        return <SupportPage setCurrentTab={setCurrentTab} initialTab="faq" />;
      case 'governorates':
        return <GovernoratesPage setCurrentTab={setCurrentTab} />;
      case 'cms-about':
        return <CMSPage slug="about-us" setCurrentTab={setCurrentTab} />;
      case 'cms-terms':
        return <CMSPage slug="terms-and-conditions" setCurrentTab={setCurrentTab} />;
      case 'cms-privacy':
        return <CMSPage slug="privacy-policy" setCurrentTab={setCurrentTab} />;
      case 'discount-services':
        return <DiscountServicesPage setCurrentTab={setCurrentTab} />;
      default:
        return <NotFoundPage setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-['Cairo',sans-serif]">
      <MaintenanceOverlay />
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1">
        {renderContent()}
      </main>

      <Footer setCurrentTab={setCurrentTab} />
      <SmartFloatingButton currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <CookieConsent />
    </div>
  );
}

const queryClient = new QueryClient();

export function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <ContentProvider>
              <SettingsProvider>
                <AdminDataProvider>
                  <ErrorBoundary>
                    <AppContent />
                  </ErrorBoundary>
                </AdminDataProvider>
              </SettingsProvider>
            </ContentProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
