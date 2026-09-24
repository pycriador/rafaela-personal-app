import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from './ui/Modal';
import { notificationRepository } from '../repositories/notificationRepository';
import { Notification } from '../types';
import { useAuth } from '../context/AuthContext';
import { Bell, CheckCheck, AlertCircle, Info, AlertTriangle, MessageSquare, Trash2, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = useCallback(async () => {
    if (user) {
      const list = await notificationRepository.getByRecipient(user.id, user.role);
      setNotifications(list);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, loadNotifications]);

  useEffect(() => {
    if (!isOpen) return;
    const handleUpdate = () => {
      loadNotifications();
    };
    window.addEventListener('rafaela_notification_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('rafaela_notification_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [isOpen, loadNotifications]);

  const handleMarkAllRead = async () => {
    if (!user) return;
    await notificationRepository.markAllAsRead(user.id);
    await loadNotifications();
  };

  const handleDeleteNotif = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await notificationRepository.delete(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleItemClick = async (notif: Notification) => {
    if (notif.link) {
      // Se for notificação de mensagem / conversa do aluno
      if (notif.type === 'message' || notif.link.includes('tab=conversa')) {
        const studentMatch = notif.link.match(/\/personal\/students\/([^/?#]+)/);
        if (studentMatch && studentMatch[1]) {
          await notificationRepository.deleteChatNotificationsForStudent(studentMatch[1]);
        }
        await notificationRepository.delete(notif.id);
      } else {
        await notificationRepository.markAsRead(notif.id);
      }
      onClose();
      navigate(notif.link);
    } else {
      await notificationRepository.markAsRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Central de Notificações" size="md">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-dark-border">
        <span className="text-xs text-slate-500 dark:text-dark-muted font-medium">
          {notifications.filter((n) => !n.read).length} não lidas (total: {notifications.length})
        </span>
        {notifications.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Marcar todas como lidas
          </Button>
        )}
      </div>

      <div className="divide-y divide-slate-100 dark:divide-dark-border max-h-[60vh] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs space-y-2">
            <Bell className="w-8 h-8 mx-auto opacity-30" />
            <p>Nenhuma notificação no momento.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors group relative ${
                notif.read
                  ? 'opacity-75 hover:bg-slate-50 dark:hover:bg-dark-cardElevated/50'
                  : 'bg-emerald-500/5 dark:bg-emerald-950/20 hover:bg-emerald-500/10'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {notif.type === 'message' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                )}
                {notif.type === 'alert' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                {notif.type === 'info' && <Info className="w-4 h-4 text-sky-500" />}
                {notif.type === 'success' && <CheckCheck className="w-4 h-4 text-emerald-500" />}
                {!notif.type && <Bell className="w-4 h-4 text-slate-400" />}
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {notif.title}
                  </p>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-600 dark:text-dark-muted mt-0.5 leading-relaxed break-words">
                  {notif.message}
                </p>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                  <span>
                    {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {notif.link && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-sans font-medium flex items-center gap-1 group-hover:underline">
                      Ir para conversa <ExternalLink className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              </div>

              {/* Botão de Excluir Notificação */}
              <button
                type="button"
                onClick={(e) => handleDeleteNotif(e, notif.id)}
                title="Excluir notificação"
                className="absolute top-3 right-3 p-1 text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 rounded-md hover:bg-slate-100 dark:hover:bg-dark-cardElevated transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};
