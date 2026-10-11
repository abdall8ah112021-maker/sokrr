import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import {
  Bell,
  CheckCheck,
  Trash2,
  Coins,
  CreditCard,
  ShoppingBag,
  Info,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsPageProps {
  setCurrentTab: (tab: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ setCurrentTab }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const loadNotifs = () => {
    api.getNotifications().then(setNotifications).catch(() => {});
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    loadNotifs();
  };

  const handleItemClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      await api.markNotificationRead(item.id);
      loadNotifs();
    }
    if (item.deepLink) {
      if (item.deepLink.startsWith('/card')) setCurrentTab('card');
      else if (item.deepLink.startsWith('/points')) setCurrentTab('points');
      else if (item.deepLink.startsWith('/orders')) setCurrentTab('customer-dashboard');
      else if (item.deepLink.startsWith('/store')) setCurrentTab('store');
    }
  };

  const handleHide = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.hideNotification(id);
    loadNotifs();
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 space-y-6 text-right">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-sky-400" />
            <span>صندوق الإشعارات والتنبيهات</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">تحديثات فورية حول رصيد نقاطك، الكارت البلاستيكي، وحالة طلباتك</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                filter === 'ALL' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              الكل
            </button>
            <button
              type="button"
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                filter === 'UNREAD' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400'
              }`}
            >
              غير المقروءة
            </button>
          </div>

          <button
            type="button"
            onClick={handleMarkAllRead}
            className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 flex items-center gap-1.5"
          >
            <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>تعيين الكل كمقروء</span>
          </button>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-[#0c101c] border border-slate-800 shadow-xl space-y-2">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-10">لا توجد إشعارات تطابق التصفية الحالية.</p>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !item.isRead
                  ? 'bg-sky-950/40 border-sky-500/30'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  {item.type === 'POINTS_EARNED' ? (
                    <Coins className="w-4 h-4 text-amber-400" />
                  ) : item.type === 'CARD_REQUEST' || item.type === 'CARD_EXPIRY' ? (
                    <CreditCard className="w-4 h-4 text-sky-400" />
                  ) : item.type === 'ORDER_STATUS' ? (
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Info className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs sm:text-sm text-white">{item.title}</h4>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-sky-400" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {new Date(item.createdAt).toLocaleString('ar-EG')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item.deepLink && (
                  <ExternalLink className="w-4 h-4 text-sky-400/60" />
                )}
                <button
                  type="button"
                  onClick={(e) => handleHide(item.id, e)}
                  className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                  title="إخفاء الإشعار"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
