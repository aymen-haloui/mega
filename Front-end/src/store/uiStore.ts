// Algeria Eats Hub - UI Store (Zustand)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UIState, Notification } from '@/types';

interface UIStore extends UIState {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'fr' | 'ar' | 'en') => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: number) => void;
  markNotificationAsRead: (id: number) => void;
  clearNotifications: () => void;
  getUnreadCount: () => number;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sidebarOpen: false,
      theme: 'dark', // Default to dark theme
      language: 'fr',
      loading: false,
      notifications: [],

      // Actions
      toggleSidebar: () => {
        const state = get();
        set({ sidebarOpen: !state.sidebarOpen });
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },

      setTheme: (theme) => {
        set({ theme });
        
        // Apply theme to document
        if (typeof window !== 'undefined') {
          const root = document.documentElement;
          if (theme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      },

      setLanguage: (language) => {
        set({ language });
        
        // Update document language
        if (typeof window !== 'undefined') {
          document.documentElement.lang = language;
        }
      },

      setLoading: (loading) => {
        set({ loading });
      },

      addNotification: (notificationData) => {
        const state = get();
        const newNotification: Notification = {
          ...notificationData,
          id: Date.now() + Math.random(),
          createdAt: new Date().toISOString(),
        };
        
        set({
          notifications: [newNotification, ...state.notifications],
        });

        // Auto-remove after 5 seconds for non-error notifications
        if (notificationData.type !== 'error') {
          setTimeout(() => {
            get().removeNotification(newNotification.id);
          }, 5000);
        }
      },

      removeNotification: (id) => {
        const state = get();
        set({
          notifications: state.notifications.filter(n => n.id !== id),
        });
      },

      markNotificationAsRead: (id) => {
        const state = get();
        set({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        });
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      getUnreadCount: () => {
        const state = get();
        return state.notifications.filter(n => !n.read).length;
      },
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const { theme } = useUIStore.getState();
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}