import React, { useState } from 'react';
import { Plus, Trash2, Bell, X } from 'lucide-react';

export const AdminNotificationsManager: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]); // Should fetch from API

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">إدارة الإشعارات</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-xl text-sm font-semibold hover:bg-sky-400">
          <Plus className="w-4 h-4" />
          إضافة إشعار جديد
        </button>
      </div>

      <div className="grid gap-4">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-400 border border-slate-700 rounded-2xl bg-slate-900/50">
            لا توجد إشعارات حالياً.
          </div>
        ) : (
          notifications.map((notification) => (
            <div key={notification.id} className="p-4 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Bell className="w-8 h-8 text-amber-400" />
                <div>
                  <h4 className="font-bold text-white">{notification.title}</h4>
                  <p className="text-sm text-slate-400">{notification.description}</p>
                </div>
              </div>
              <button className="text-rose-400 hover:text-rose-300">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
