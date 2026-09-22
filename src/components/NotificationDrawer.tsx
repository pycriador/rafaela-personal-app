import React, { useEffect, useState } from 'react';
import { Modal } from './ui/Modal';
import { notificationRepository } from '../repositories/notificationRepository';
import { Notification } from '../types';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCheck, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (isOpen && user) {
      notificationRepository.getByRecipient(user.id, user.role).then(setNotifications);
    }
  }, [isOpen, user]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationRepository.markAllAsRead(user.id);
    const updated = await notificationRepository.getByRecipient(user.id, user.role);
    setNotifications(updated);
  };

  const handleItemClick = async (notif: Notification) => {
    await notificationRepository.markAsRead(notif.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notificações" size="md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
        <span className="text-xs text-slate-500 dark:text-dark-muted font-medium">
          {notifications.filter((n) => !n.read).length} novas notificações
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleMarkAllRead}
          leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
          className="text-xs"
        >
          Marcar todas como lidas
        </Button>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-dark-border max-h-[60vh] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-xs">
            Nenhuma notificação no momento.
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                notif.read
                  ? 'opacity-70 hover:bg-slate-50 dark:hover:bg-dark-cardElevated/50'
                  : 'bg-emerald-500/5 dark:bg-emerald-950/20 hover:bg-emerald-500/10'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {notif.type === 'alert' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                {notif.type === 'info' && <Info className="w-4 h-4 text-cyan-500" />}
                {!notif.type && <Bell className="w-4 h-4 text-emerald-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {notif.title}
                  </p>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-dark-muted mt-0.5 leading-relaxed">
                  {notif.message}
                </p>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
