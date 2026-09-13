import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationItem } from '../types';
import { notificationService } from '../services/notifications';

export interface ToastMessage {
  id: string;
  type: 'success' | 'xp_drop' | 'level_up' | 'achievement_unlocked' | 'error' | 'info';
  title: string;
  message: string;
  xp?: number;
  gold?: number;
  attribute?: string;
  duration?: number;
}

interface NotificationContextType {
  toasts: ToastMessage[];
  notifications: NotificationItem[];
  unreadCount: number;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  loadNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.success && Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch {
      // safe fallback
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastMessage, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: ToastMessage = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = toast.duration || (toast.type === 'level_up' || toast.type === 'achievement_unlocked' ? 6000 : 4000);
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    try {
      await notificationService.markAsRead(id);
    } catch {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = async () => {
    setNotifications([]);
    try {
      await notificationService.clearAll();
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        toasts,
        notifications,
        unreadCount,
        addToast,
        removeToast,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
