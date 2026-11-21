import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  CreditCard,
  QrCode,
  Coins,
  ShoppingBag,
  Bell,
  Menu,
  X,
  User as UserIcon,
  LogOut,
  Shield,
  Layers,
  Sparkles,
  ChevronDown,
  Store,
  Compass,
  Tag,
} from 'lucide-react';
import { api } from '../../api/client';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { user, customer, business, logout, switchDemoRole } = useAuth();
  const { itemCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      api.getNotifications()
        .then((notifs) => {
          const unread = notifs.filter((n: any) => !n.isRead).length;
          setUnreadCount(unread);
        })
        .catch(() => {});
    } else {
      setUnreadCount(0);
    }
  }, [user, currentTab]);

  const navItemClass = (tab: string) =>
    `text-sm font-medium transition-colors cursor-pointer py-1.5 px-3 rounded-lg flex items-center gap-1.5 ${
      currentTab === tab
        ? 'text-sky-300 bg-sky-950/60 border border-sky-400/30 shadow-[0_0_12px_rgba(56,189,248,0.15)]'
        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
    }`;

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? 'py-2.5 bg-[#070a12]/95 backdrop-blur-md border-sky-500/15 shadow-xl shadow-black/40'
          : 'py-3 sm:py-4 bg-[#07090e]/85 backdrop-blur-sm border-slate-800/60'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group min-w-0"
            onClick={() => {
              setCurrentTab('home');
              setMobileMenuOpen(false);
            }}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-300 p-0.5 shadow-lg shadow-sky-500/25 group-hover:shadow-sky-400/40 transition-shadow shrink-0">
              <div className="w-full h-full bg-[#070a12] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-xl tracking-tight text-white group-hover:text-sky-300 transition-colors truncate">
                  Sugar Business
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-mono text-sky-400 bg-sky-950/80 px-1.5 py-0.5 rounded border border-sky-500/30 shrink-0">
                  PRO
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-400 -mt-0.5">منظومة الولاء والكروت الذكية</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <button type="button" onClick={() => setCurrentTab('home')} className={navItemClass('home')}>
              الرئيسية
            </button>

            {/* Role Specific Navigation */}
            {user?.role === 'CUSTOMER' && (
              <>
                <button type="button" onClick={() => setCurrentTab('card')} className={navItemClass('card')}>
                  <CreditCard className="w-4 h-4 text-sky-400" />
                  <span>كارتي الذكي</span>
                </button>
                <button type="button" onClick={() => setCurrentTab('points')} className={navItemClass('points')}>
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>النقاط</span>
                </button>
                <button type="button" onClick={() => setCurrentTab('customer-dashboard')} className={navItemClass('customer-dashboard')}>
                  <span>لوحة العميل</span>
                </button>
              </>
            )}

            {(user?.role === 'BUSINESS' || user?.role === 'EMPLOYEE') && (
              <>
                <button type="button" onClick={() => setCurrentTab('business-dashboard')} className={navItemClass('business-dashboard')}>
                  <QrCode className="w-4 h-4 text-sky-400" />
                  <span>مسح الكارت والشراء</span>
                </button>
              </>
            )}

            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <>
                <button type="button" onClick={() => setCurrentTab('admin-dashboard')} className={navItemClass('admin-dashboard')}>
                  <Shield className="w-4 h-4 text-sky-400" />
                  <span>لوحة الإدارة الشاملة</span>
                </button>
              </>
            )}

            {/* General Public/Platform Links */}
            <button type="button" onClick={() => setCurrentTab('directory')} className={navItemClass('directory')}>
              <Store className="w-4 h-4" />
              <span>دليل المتاجر</span>
            </button>
            <button type="button" onClick={() => setCurrentTab('discount-services')} className={navItemClass('discount-services')}>
              <Tag className="w-4 h-4 text-amber-400" />
              <span>خصمك عندنا</span>
            </button>
            <button type="button" onClick={() => setCurrentTab('services')} className={navItemClass('services')}>
              <span>الخدمات</span>
            </button>
            <button type="button" onClick={() => setCurrentTab('offers')} className={navItemClass('offers')}>
              <span>العروض</span>
            </button>
            <button type="button" onClick={() => setCurrentTab('store')} className={navItemClass('store')}>
              <ShoppingBag className="w-4 h-4" />
              <span>المتجر</span>
            </button>
            <button type="button" onClick={() => setCurrentTab('news')} className={navItemClass('news')}>
              <span>الأخبار</span>
            </button>
            <button type="button" onClick={() => setCurrentTab('support')} className={navItemClass('support')}>
              <span>الدعم</span>
            </button>
          </nav>

          {/* Right Action Icons & Auth Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Cart Icon */}
            <button
              type="button"
              onClick={() => setCurrentTab('cart')}
              className="relative p-2 rounded-lg text-slate-300 hover:text-sky-300 hover:bg-slate-800/60 transition-colors"
              title="سلة المشتريات"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-sky-500 text-slate-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Notifications Icon (if logged in) */}
            {user && (
              <button
                type="button"
                onClick={() => setCurrentTab('notifications')}
                className="relative p-2 rounded-lg text-slate-300 hover:text-sky-300 hover:bg-slate-800/60 transition-colors"
                title="الإشعارات"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-slate-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Login / Profile CTA */}
            {user ? (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') setCurrentTab('admin-dashboard');
                    else if (user.role === 'BUSINESS' || user.role === 'EMPLOYEE') setCurrentTab('business-dashboard');
                    else setCurrentTab('customer-dashboard');
                  }}
                  className="inline-flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-lg bg-sky-950/70 border border-sky-400/30 text-sky-200 text-xs font-semibold hover:bg-sky-900/60 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span className="max-w-[72px] sm:max-w-[110px] truncate">
                    {customer?.fullName || business?.businessName || user.phone}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setCurrentTab('home');
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  }}
                  className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentTab('login')}
                  className="text-xs font-semibold text-slate-200 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800/50 sm:bg-transparent hover:bg-slate-800/80 transition-colors whitespace-nowrap"
                >
                  دخول
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('register-customer')}
                  className="hidden sm:inline-flex text-xs font-bold text-slate-950 bg-gradient-to-r from-sky-400 to-cyan-300 hover:from-sky-300 hover:to-cyan-200 px-3.5 py-1.5 rounded-lg shadow-lg shadow-sky-500/25 transition-all whitespace-nowrap"
                >
                  احصل على كارتك
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="القائمة"
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-800 pb-4 space-y-1 text-right max-h-[calc(100vh-4.5rem)] overflow-y-auto">
            {!user && (
              <div className="grid grid-cols-2 gap-2 pb-3 mb-2 border-b border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('register-customer');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-400 to-cyan-300 text-slate-950 font-black text-xs text-center shadow-lg shadow-sky-500/20"
                >
                  احصل على كارتك الآن
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center"
                >
                  تسجيل الدخول
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setCurrentTab('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-right px-3 py-2.5 rounded-lg text-sm ${
                currentTab === 'home' ? 'bg-sky-950/60 text-sky-300 font-bold' : 'text-slate-200 hover:bg-slate-800/80'
              }`}
            >
              الرئيسية
            </button>
            {user?.role === 'CUSTOMER' && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('card');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-right px-3 py-2.5 rounded-lg text-sm text-sky-300 bg-sky-950/40 font-semibold"
                >
                  كارتي الذكي
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('points');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-right px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800/80"
                >
                  النقاط والمكافآت
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTab('customer-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-right px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800/80"
                >
                  لوحة تحكم العميل
                </button>
              </>
            )}
            {(user?.role === 'BUSINESS' || user?.role === 'EMPLOYEE') && (
              <button
                type="button"
                onClick={() => {
                  setCurrentTab('business-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-right px-3 py-2.5 rounded-lg text-sm text-sky-300 bg-sky-950/40 font-semibold"
              >
                مسح الكارت والشراء
              </button>
            )}
            {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
              <button
                type="button"
                onClick={() => {
                  setCurrentTab('admin-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-right px-3 py-2.5 rounded-lg text-sm text-sky-300 bg-sky-950/40 font-semibold"
              >
                لوحة الإدارة الشاملة
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setCurrentTab('directory');
                setMobileMenuOpen(false);
              }}
              className="w-full text-right px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800/80"
            >
              دليل المتاجر
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentTab('discount-services');
                setMobileMenuOpen(false);
              }}
              className="w-full text-right px-3 py-2.5 rounded-lg text-sm text-amber-300 hover:bg-slate-800/80 font-medium"
            >
              خصمك عندنا
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentTab('services');
                setMobileMenuOpen(false);
              }}
              className="w-full text-right px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800/80"
            >
              الخدمات
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentTab('offers');
                setMobileMenuOpen(false);
              }}
              className="w-full text-right px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800/80"
            >
              العروض الحصرية
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentTab('store');
                setMobileMenuOpen(false);
              }}
              className="w-full text-right px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800/80"
            >
              المتجر
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentTab('news');
                setMobileMenuOpen(false);
              }}
              className="w-full text-right px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800/80"
            >
              الأخبار والتحديثات
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentTab('governorates');
                setMobileMenuOpen(false);
              }}
              className="w-full text-right px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800/80"
            >
              تغطية المحافظات
            </button>
            <button
              type="button"
              onClick={() => {
                setCurrentTab('support');
                setMobileMenuOpen(false);
              }}
              className="w-full text-right px-3 py-2.5 rounded-lg text-sm text-slate-200 hover:bg-slate-800/80"
            >
              الدعم والمساعدة
            </button>
            {user && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setCurrentTab('home');
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                }}
                className="w-full text-right px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:bg-rose-950/40 flex items-center justify-between border-t border-slate-800/80 pt-3 mt-2 transition-colors"
              >
                <span>تسجيل الخروج</span>
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
