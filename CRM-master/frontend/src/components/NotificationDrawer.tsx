import React, { useEffect, useState } from 'react';
import { NotificationItem } from '../api/types';
import { api } from '../api/client';
import { Bell, Check, X } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getMyNotifications();
      setNotifications(data);
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readStatus: true } : n))
      );
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 p-4 flex flex-col glass-panel">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 text-indigo-400">
          <Bell className="w-5 h-5" />
          <h3 className="font-semibold text-lg text-slate-100">Notifications</h3>
        </div>
        <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {loading ? (
          <div className="text-center text-slate-500 py-8">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-slate-500 py-8">No notifications yet.</div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-lg border text-sm transition-all ${
                item.readStatus
                  ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                  : 'bg-indigo-950/30 border-indigo-500/30 text-slate-200 font-medium'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-indigo-300">{item.title}</span>
                {!item.readStatus && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    title="Mark as read"
                    className="text-xs text-indigo-400 hover:text-indigo-200 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Read
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-2">{item.message}</p>
              <div className="text-[10px] text-slate-500">
                {new Date(item.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-500">
        SMTP Alerts routed to MailHog (Port 8025)
      </div>
    </div>
  );
};
