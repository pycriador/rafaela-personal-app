import { Notification, UserRole } from '../types';
import { getItem, setItem, STORAGE_KEYS, isSimulationModeActive } from './storage';
import { initialNotifications } from '../data/notifications';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface INotificationRepository {
  getByRecipient(recipientId: string, role?: UserRole): Promise<Notification[]>;
  markAsRead(id: string): Promise<boolean>;
  markAllAsRead(recipientId: string): Promise<void>;
  create(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<Notification>;
  getUnreadCount(recipientId: string): Promise<number>;
}

function mapFromDb(row: any): Notification {
  return {
    id: row.id,
    recipientId: row.recipient_id || row.recipientId,
    recipientRole: row.recipient_role || row.recipientRole,
    title: row.title,
    message: row.message,
    read: row.read ?? false,
    type: row.type || 'info',
    link: row.link || undefined,
    timestamp: row.timestamp || row.created_at,
  };
}

export class SupabaseNotificationRepository implements INotificationRepository {
  async getByRecipient(recipientId: string, role?: UserRole): Promise<Notification[]> {
    if (isSupabaseConfigured) {
      try {
        let query = supabase
          .from('notifications')
          .select('*')
          .order('timestamp', { ascending: false });

        if (role) {
          query = query.or(`recipient_id.eq.${recipientId},recipient_role.eq.${role}`);
        } else {
          query = query.eq('recipient_id', recipientId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map(mapFromDb);
        }
      } catch (err) {
        // fallback
      }
    }

    const list = getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    return list.filter(
      (n) => n.recipientId === recipientId || (role && n.recipientRole === role)
    );
  }

  async markAsRead(id: string): Promise<boolean> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
        if (!error) return true;
      } catch (err) {
        // fallback
      }
    }

    const list = getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    const index = list.findIndex((n) => n.id === id);
    if (index === -1) return false;
    list[index].read = true;
    setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    return true;
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('notifications').update({ read: true }).eq('recipient_id', recipientId);
      } catch (err) {
        // fallback
      }
    }

    const list = getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    list.forEach((n) => {
      if (n.recipientId === recipientId) n.read = true;
    });
    setItem(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  async create(data: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<Notification> {
    const newNotification: Notification = {
      ...data,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };

    if (isSupabaseConfigured && !isSimulationModeActive()) {
      try {
        await supabase.from('notifications').insert({
          id: newNotification.id,
          recipient_id: newNotification.recipientId,
          recipient_role: newNotification.recipientRole,
          title: newNotification.title,
          message: newNotification.message,
          read: newNotification.read,
          type: newNotification.type,
          link: newNotification.link || null,
          timestamp: newNotification.timestamp,
        });
      } catch (err) {
        // fallback
      }
    }

    const list = getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    list.unshift(newNotification);
    setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    return newNotification;
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    if (isSupabaseConfigured) {
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', recipientId)
          .eq('read', false);

        if (!error && typeof count === 'number') {
          return count;
        }
      } catch (err) {
        // fallback
      }
    }

    const items = await this.getByRecipient(recipientId);
    return items.filter((n) => !n.read).length;
  }
}

export const notificationRepository = new SupabaseNotificationRepository();
