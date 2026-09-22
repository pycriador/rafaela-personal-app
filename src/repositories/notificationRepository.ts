import { Notification, UserRole } from '../types';
import { getItem, setItem, STORAGE_KEYS } from './storage';
import { initialNotifications } from '../data/notifications';

export interface INotificationRepository {
  getByRecipient(recipientId: string, role?: UserRole): Promise<Notification[]>;
  markAsRead(id: string): Promise<boolean>;
  markAllAsRead(recipientId: string): Promise<void>;
  create(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<Notification>;
  getUnreadCount(recipientId: string): Promise<number>;
}

export class MockNotificationRepository implements INotificationRepository {
  async getByRecipient(recipientId: string, role?: UserRole): Promise<Notification[]> {
    const list = getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    return list.filter(
      (n) => n.recipientId === recipientId || (role && n.recipientRole === role)
    );
  }

  async markAsRead(id: string): Promise<boolean> {
    const list = getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    const index = list.findIndex((n) => n.id === id);
    if (index === -1) return false;
    list[index].read = true;
    setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    return true;
  }

  async markAllAsRead(recipientId: string): Promise<void> {
    const list = getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    list.forEach((n) => {
      if (n.recipientId === recipientId) n.read = true;
    });
    setItem(STORAGE_KEYS.NOTIFICATIONS, list);
  }

  async create(data: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<Notification> {
    const list = getItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    const newNotification: Notification = {
      ...data,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    list.unshift(newNotification);
    setItem(STORAGE_KEYS.NOTIFICATIONS, list);
    return newNotification;
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    const items = await this.getByRecipient(recipientId);
    return items.filter((n) => !n.read).length;
  }
}

export const notificationRepository = new MockNotificationRepository();
