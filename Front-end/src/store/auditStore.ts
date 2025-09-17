import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuditLog } from '@/types';

interface AuditStoreState {
  logs: AuditLog[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  addLog: (log: Omit<AuditLog, 'id' | 'createdAt'>) => Promise<AuditLog>;
  getLogsByEntity: (entity: string, entityId: string) => AuditLog[];
  getLogsByUser: (userId: string) => AuditLog[];
  getLogsByAction: (action: string) => AuditLog[];
  getRecentLogs: (limit?: number) => AuditLog[];
  clearLogs: () => void;
}

export const useAuditStore = create<AuditStoreState>()(
  persist(
    (set, get) => ({
      logs: [],
      loaded: false,
      loading: false,
      error: null,

      load: async () => {
        set({ loading: true, error: null });
        try {
          // Load from localStorage for now
          const stored = localStorage.getItem('auditLogs');
          if (stored) {
            const logs = JSON.parse(stored);
            set({ logs, loaded: true, loading: false });
          } else {
            set({ logs: [], loaded: true, loading: false });
          }
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      addLog: async (logData) => {
        const newLog: AuditLog = {
          ...logData,
          id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const updatedLogs = [newLog, ...state.logs];
          localStorage.setItem('auditLogs', JSON.stringify(updatedLogs));
          return { logs: updatedLogs };
        });

        return newLog;
      },

      getLogsByEntity: (entity: string, entityId: string) => {
        const { logs } = get();
        return logs.filter(log => log.entity === entity && log.entityId === entityId);
      },

      getLogsByUser: (userId: string) => {
        const { logs } = get();
        return logs.filter(log => log.userId === userId);
      },

      getLogsByAction: (action: string) => {
        const { logs } = get();
        return logs.filter(log => log.action === action);
      },

      getRecentLogs: (limit = 50) => {
        const { logs } = get();
        return logs.slice(0, limit);
      },

      clearLogs: () => {
        set({ logs: [] });
        localStorage.removeItem('auditLogs');
      },
    }),
    {
      name: 'audit-storage',
      partialize: (state) => ({ logs: state.logs }),
    }
  )
);

// Audit helper functions
export const auditHelpers = {
  logUserAction: (action: string, entity: string, entityId: string, userId?: string, oldValues?: any, newValues?: any) => {
    const { addLog } = useAuditStore.getState();
    return addLog({
      action,
      entity,
      entityId,
      userId,
      oldValues,
      newValues,
      ipAddress: '127.0.0.1', // Mock IP for development
      userAgent: navigator.userAgent,
    });
  },

  logUserLogin: (userId: string) => {
    return auditHelpers.logUserAction('LOGIN', 'User', userId, userId);
  },

  logUserLogout: (userId: string) => {
    return auditHelpers.logUserAction('LOGOUT', 'User', userId, userId);
  },

  logUserCreate: (userId: string, newUser: any) => {
    return auditHelpers.logUserAction('CREATE', 'User', userId, undefined, undefined, newUser);
  },

  logUserUpdate: (userId: string, oldUser: any, newUser: any) => {
    return auditHelpers.logUserAction('UPDATE', 'User', userId, undefined, oldUser, newUser);
  },

  logUserDelete: (userId: string, deletedUser: any) => {
    return auditHelpers.logUserAction('DELETE', 'User', userId, undefined, deletedUser, undefined);
  },

  logOrderCreate: (orderId: string, userId?: string, orderData?: any) => {
    return auditHelpers.logUserAction('CREATE', 'Order', orderId, userId, undefined, orderData);
  },

  logOrderUpdate: (orderId: string, userId?: string, oldOrder?: any, newOrder?: any) => {
    return auditHelpers.logUserAction('UPDATE', 'Order', orderId, userId, oldOrder, newOrder);
  },

  logDishCreate: (dishId: string, userId?: string, dishData?: any) => {
    return auditHelpers.logUserAction('CREATE', 'Dish', dishId, userId, undefined, dishData);
  },

  logDishUpdate: (dishId: string, userId?: string, oldDish?: any, newDish?: any) => {
    return auditHelpers.logUserAction('UPDATE', 'Dish', dishId, userId, oldDish, newDish);
  },

  logBranchCreate: (branchId: string, userId?: string, branchData?: any) => {
    return auditHelpers.logUserAction('CREATE', 'Branch', branchId, userId, undefined, branchData);
  },

  logBranchUpdate: (branchId: string, userId?: string, oldBranch?: any, newBranch?: any) => {
    return auditHelpers.logUserAction('UPDATE', 'Branch', branchId, userId, oldBranch, newBranch);
  },
};

