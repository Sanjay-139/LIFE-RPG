import { api } from './api';
import { ApiResponse, NotificationItem } from '../types';

export const notificationService = {
  async getNotifications(): Promise<ApiResponse<NotificationItem[]>> {
    return api.get<NotificationItem[]>('/notifications');
  },

  async markAsRead(id: string): Promise<ApiResponse<NotificationItem>> {
    return api.patch<NotificationItem>(`/notifications/${id}/read`);
  },

  async clearAll(): Promise<ApiResponse<boolean>> {
    return api.delete<boolean>('/notifications');
  },
};
