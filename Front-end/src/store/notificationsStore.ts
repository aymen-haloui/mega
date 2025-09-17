import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Notification } from '@/types';

interface NotificationsStoreState {
  notifications: Notification[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => Promise<Notification>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  getUnreadCount: () => number;
  getNotificationsByType: (type: Notification['type']) => Notification[];
  getNotificationsByUser: (userId: string) => Notification[];
}

export const useNotificationsStore = create<NotificationsStoreState>()(
  persist(
    (set, get) => ({
      notifications: [],
      loaded: false,
      loading: false,
      error: null,

      load: async () => {
        set({ loading: true, error: null });
        try {
          const stored = localStorage.getItem('notifications');
          if (stored) {
            const notifications = JSON.parse(stored);
            set({ notifications, loaded: true, loading: false });
          } else {
            set({ notifications: [], loaded: true, loading: false });
          }
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      addNotification: async (notificationData) => {
        const newNotification: Notification = {
          ...notificationData,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          isRead: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const updatedNotifications = [newNotification, ...state.notifications];
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
          return { notifications: updatedNotifications };
        });

        return newNotification;
      },

      markAsRead: async (id: string) => {
        set((state) => {
          const updatedNotifications = state.notifications.map(notification =>
            notification.id === id ? { ...notification, isRead: true } : notification
          );
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
          return { notifications: updatedNotifications };
        });
      },

      markAllAsRead: async () => {
        set((state) => {
          const updatedNotifications = state.notifications.map(notification => ({
            ...notification,
            isRead: true
          }));
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
          return { notifications: updatedNotifications };
        });
      },

      deleteNotification: async (id: string) => {
        set((state) => {
          const updatedNotifications = state.notifications.filter(notification => notification.id !== id);
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
          return { notifications: updatedNotifications };
        });
      },

      clearAllNotifications: async () => {
        set({ notifications: [] });
        localStorage.removeItem('notifications');
      },

      getUnreadCount: () => {
        const { notifications } = get();
        return notifications.filter(notification => !notification.isRead).length;
      },

      getNotificationsByType: (type: Notification['type']) => {
        const { notifications } = get();
        return notifications.filter(notification => notification.type === type);
      },

      getNotificationsByUser: (userId: string) => {
        const { notifications } = get();
        return notifications.filter(notification => notification.userId === userId);
      },
    }),
    {
      name: 'notifications-storage',
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
);

// Notification helper functions
export const notificationHelpers = {
  showSuccess: (title: string, message: string, userId?: string) => {
    const { addNotification } = useNotificationsStore.getState();
    return addNotification({
      userId: userId || 'system',
      title,
      message,
      type: 'success'
    });
  },

  showError: (title: string, message: string, userId?: string) => {
    const { addNotification } = useNotificationsStore.getState();
    return addNotification({
      userId: userId || 'system',
      title,
      message,
      type: 'error'
    });
  },

  showWarning: (title: string, message: string, userId?: string) => {
    const { addNotification } = useNotificationsStore.getState();
    return addNotification({
      userId: userId || 'system',
      title,
      message,
      type: 'warning'
    });
  },

  showInfo: (title: string, message: string, userId?: string) => {
    const { addNotification } = useNotificationsStore.getState();
    return addNotification({
      userId: userId || 'system',
      title,
      message,
      type: 'info'
    });
  },

  // Specific notification types
  notifyNewOrder: (orderNumber: number, branchName: string, userId?: string) => {
    return notificationHelpers.showInfo(
      'Nouvelle Commande',
      `Commande #${orderNumber} reçue pour ${branchName}`,
      userId
    );
  },

  notifyOrderStatusChange: (orderNumber: number, status: string, userId?: string) => {
    return notificationHelpers.showInfo(
      'Statut de Commande Modifié',
      `Commande #${orderNumber} est maintenant ${status}`,
      userId
    );
  },

  notifyUserBlocked: (userName: string, userId?: string) => {
    return notificationHelpers.showWarning(
      'Utilisateur Bloqué',
      `L'utilisateur ${userName} a été bloqué`,
      userId
    );
  },

  notifyUserCreated: (userName: string, userId?: string) => {
    return notificationHelpers.showSuccess(
      'Nouvel Utilisateur',
      `L'utilisateur ${userName} a été créé avec succès`,
      userId
    );
  },

  notifyDishOutOfStock: (dishName: string, userId?: string) => {
    return notificationHelpers.showWarning(
      'Plat en Rupture',
      `Le plat "${dishName}" est en rupture de stock`,
      userId
    );
  },

  notifySystemMaintenance: (message: string, userId?: string) => {
    return notificationHelpers.showInfo(
      'Maintenance Système',
      message,
      userId
    );
  },
};

