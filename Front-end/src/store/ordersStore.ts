import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Order } from '@/types';
import { ordersAPI } from '@/api/orders';

interface OrdersStoreState {
  orders: Order[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  addOrder: (order: Order) => void;
  createOrder: (input: { 
    branchId: string; 
    userName: string; 
    userPhone: string; 
    items: { dishId: string; qty: number; priceCents: number }[];
  }) => Promise<Order>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  updateOrderStatusLocal: (id: string, status: Order['status']) => void;
  getByBranch: (branchId: string) => Order[];
  getByUserPhone: (userPhone: string) => Order[];
  getById: (id: string) => Order | undefined;
}

export const useOrdersStore = create<OrdersStoreState>()(
  persist(
    (set, get) => ({
      orders: [],
      loaded: false,
      loading: false,
      error: null,
      
      load: async () => {
        set({ loading: true, error: null });
        try {
          const response = await ordersAPI.getOrders();
          set({ orders: response.data || response, loaded: true, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },
      
      refresh: async () => {
        console.log('OrdersStore - refresh called');
        set({ loading: true, error: null });
        try {
          const response = await ordersAPI.getOrders();
          console.log('OrdersStore - refresh response:', response.data || response);
          set({ orders: response.data || response, loading: false });
          console.log('OrdersStore - orders updated in store');
        } catch (error: any) {
          console.error('OrdersStore - refresh error:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      addOrder: (order) => {
        const orders = get().orders;
        const updated = [...orders, order];
        set({ orders: updated });
        // Zustand persist middleware handles localStorage sync automatically
      },
      
      createOrder: async (input) => {
        set({ loading: true, error: null });
        try {
          const response = await ordersAPI.createOrder(input);
          const newOrder = response.data || response;
          get().addOrder(newOrder);
          set({ loading: false });
          return newOrder;
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      updateOrderStatus: async (id, status) => {
        set({ loading: true, error: null });
        try {
          // Update locally first for immediate UI feedback
          get().updateOrderStatusLocal(id, status);
          
          // Then update via API (for backend sync)
          await ordersAPI.updateOrderStatus(id, { status });
          
          set({ loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },

      updateOrderStatusLocal: (id, status) => {
        const orders = get().orders;
        const updated = orders.map(order => 
          order.id === id ? { ...order, status, updatedAt: new Date().toISOString() } : order
        );
        set({ orders: updated });
        // Zustand persist middleware handles localStorage sync automatically
      },
      
      getByBranch: (branchId) => get().orders.filter(o => o.branchId === branchId),
      getByUserPhone: (userPhone) => get().orders.filter(o => o.userPhone === userPhone),
      getById: (id) => get().orders.find(o => o.id === id),
      
    }),
    { name: 'orders-store' }
  )
);

// Load orders on store initialization
if (typeof window !== 'undefined') {
  useOrdersStore.getState().load();
}


