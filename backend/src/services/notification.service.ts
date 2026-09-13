import { rpgStore } from '../database/rpgStore.js';
import { NotificationItem } from '../types/index.js';

export class NotificationService {
  async getNotifications(userId: string): Promise<NotificationItem[]> {
    return rpgStore.getNotifications(userId);
  }

  async markAsRead(userId: string, notifId: string): Promise<NotificationItem | { id: string; read: boolean }> {
    await rpgStore.markNotificationRead(userId, notifId);
    const notifications = await rpgStore.getNotifications(userId);
    return notifications.find(n => n.id === notifId) || { id: notifId, read: true };
  }

  async clearAll(userId: string): Promise<boolean> {
    return rpgStore.clearNotifications(userId);
  }
}

export const notificationService = new NotificationService();
