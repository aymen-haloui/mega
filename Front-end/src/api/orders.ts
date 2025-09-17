import { apiClient } from './client';
import { CreateOrderRequest, UpdateOrderStatusRequest, OrderSearchParams, OrderStatus } from './types';
import { shouldUseMockData, mockOrders } from './mockData';

// Orders API
export const ordersAPI = {
  // Get all orders
  getOrders: async (params?: OrderSearchParams): Promise<any> => {
    if (shouldUseMockData()) {
      console.log('OrdersAPI - getOrders called in mock mode');
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get orders from the store (which is already persisted by Zustand)
      const { useOrdersStore } = await import('@/store/ordersStore');
      const storeOrders = useOrdersStore.getState().orders;
      
      console.log('OrdersAPI - store orders:', storeOrders.length, 'orders');
      
      // If store is empty, return mock orders, otherwise return store orders
      const ordersToReturn = storeOrders.length > 0 ? storeOrders : mockOrders;
      
      console.log('OrdersAPI - returning orders:', ordersToReturn.length, 'orders');
      return { data: ordersToReturn };
    }
    return apiClient.get('/orders', { params });
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<any> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get order from store
      const { useOrdersStore } = await import('@/store/ordersStore');
      const order = useOrdersStore.getState().getById(id);
      
      return { data: order || null };
    }
    return apiClient.get(`/orders/${id}`);
  },

  // Create new order
  createOrder: async (orderData: CreateOrderRequest): Promise<any> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock order with proper Prisma schema structure
      const mockOrder = {
        id: `order_${Date.now()}`,
        orderNumber: Math.floor(Math.random() * 10000) + 1000,
        branchId: orderData.branchId,
        branch: {
          id: orderData.branchId,
          name: 'Mega Pizza - Centre Ville', // Mock branch name
          address: '123 Rue de la Paix, Alger',
          lat: 36.7538,
          lng: 3.0588,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        userName: orderData.userName,
        userPhone: orderData.userPhone,
        items: orderData.items.map(item => ({
          id: `item_${Date.now()}_${Math.random()}`,
          orderId: `order_${Date.now()}`,
          dishId: item.dishId,
          dish: {
            id: item.dishId,
            name: 'Pizza Margherita', // Mock dish name
            description: 'Tomate, mozzarella, basilic frais',
            imageUrl: null,
            priceCents: item.priceCents,
            menuId: '1',
            available: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          qty: item.qty,
          priceCents: item.priceCents,
        })),
        status: 'PENDING' as const,
        totalCents: orderData.items.reduce((total, item) => total + (item.priceCents * item.qty), 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        canceled: false,
        cancelReason: null,
        createdBy: null,
        updatedBy: null,
      };
      
      // Return the order - the store will handle adding it
      console.log('OrdersAPI - created order:', mockOrder.id);
      return { data: mockOrder };
    }
    return apiClient.post('/orders', orderData);
  },

  // Update order status
  updateOrderStatus: async (id: string, statusData: UpdateOrderStatusRequest): Promise<any> => {
    if (shouldUseMockData()) {
      console.log('OrdersAPI - updateOrderStatus called for order', id, 'new status:', statusData.status);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update the order in the store
      const { useOrdersStore } = await import('@/store/ordersStore');
      const store = useOrdersStore.getState();
      const orders = store.orders;
      console.log('OrdersAPI - current orders before update:', orders.map(o => ({ id: o.id, status: o.status })));
      
      const updatedOrders = orders.map(order => 
        order.id === id ? { ...order, status: statusData.status, updatedAt: new Date().toISOString() } : order
      );
      
      console.log('OrdersAPI - updated orders after status change:', updatedOrders.map(o => ({ id: o.id, status: o.status })));
      
      // Update the store with the new orders
      useOrdersStore.setState({ orders: updatedOrders });
      console.log('OrdersAPI - store updated with new orders');
      
      // Save to localStorage for persistence
      localStorage.setItem('ordersData', JSON.stringify(updatedOrders));
      console.log('OrdersAPI - orders saved to localStorage for persistence');
      
      return { data: { id, status: statusData.status } };
    }
    return apiClient.put(`/orders/${id}/status`, statusData);
  },

  // Cancel order
  cancelOrder: async (id: string, reason: string): Promise<any> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For mock data, just return success
      return { data: { id, canceled: true, cancelReason: reason } };
    }
    return apiClient.put(`/orders/${id}/cancel`, { reason });
  },

  // Get orders by user phone
  getOrdersByUserPhone: async (phone: string, params?: { page?: number; limit?: number; branchId?: string }): Promise<any> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get orders from store by user phone
      const { useOrdersStore } = await import('@/store/ordersStore');
      const orders = useOrdersStore.getState().getByUserPhone(phone);
      
      return { data: orders };
    }
    return apiClient.get(`/orders/user/${phone}`, { params });
  },

  // Get real-time orders feed for branch
  getOrdersFeed: async (branchId: string, params?: { status?: OrderStatus; limit?: number }): Promise<any> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get orders from store by branch
      const { useOrdersStore } = await import('@/store/ordersStore');
      const orders = useOrdersStore.getState().getByBranch(branchId);
      
      return { data: orders };
    }
    return apiClient.get(`/orders/feed/${branchId}`, { params });
  },

  // Get order statistics
  getOrderStats: async (params?: { branchId?: string; startDate?: string; endDate?: string }): Promise<any> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For mock data, return empty stats
      return { data: { total: 0, pending: 0, completed: 0, canceled: 0, revenue: 0 } };
    }
    return apiClient.get('/orders/stats', { params });
  },
};

// Order helper functions
export const orderHelpers = {
  // Format order data for display
  formatOrderData: (order: any) => ({
    ...order,
    orderNumberFormatted: `#${order.orderNumber}`,
    totalFormatted: `$${(order.totalCents / 100).toFixed(2)}`,
    createdAtFormatted: new Date(order.createdAt).toLocaleString(),
    updatedAtFormatted: new Date(order.updatedAt).toLocaleString(),
    statusText: orderHelpers.getStatusText(order.status),
    statusColor: orderHelpers.getStatusColor(order.status),
    itemsCount: order.items?.length || 0,
    itemsText: order.items?.map((item: any) => `${item.dish.name} x${item.qty}`).join(', ') || '',
  }),

  // Get status display text
  getStatusText: (status: OrderStatus): string => {
    const statusMap: { [key in OrderStatus]: string } = {
      PENDING: 'Pending',
      ACCEPTED: 'Accepted',
      PREPARING: 'Preparing',
      READY: 'Ready',
      OUT_FOR_DELIVERY: 'Out for Delivery',
      COMPLETED: 'Completed',
      CANCELED: 'Canceled',
    };
    return statusMap[status] || status;
  },

  // Get status color for UI
  getStatusColor: (status: OrderStatus): string => {
    const colorMap: { [key in OrderStatus]: string } = {
      PENDING: 'orange',
      ACCEPTED: 'blue',
      PREPARING: 'purple',
      READY: 'green',
      OUT_FOR_DELIVERY: 'teal',
      COMPLETED: 'success',
      CANCELED: 'red',
    };
    return colorMap[status] || 'gray';
  },

  // Check if order can be updated
  canUpdateStatus: (currentStatus: OrderStatus, newStatus: OrderStatus): boolean => {
    const validTransitions: { [key in OrderStatus]: OrderStatus[] } = {
      PENDING: ['ACCEPTED', 'CANCELED'],
      ACCEPTED: ['PREPARING', 'CANCELED'],
      PREPARING: ['READY', 'CANCELED'],
      READY: ['OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELED'],
      OUT_FOR_DELIVERY: ['COMPLETED', 'CANCELED'],
      COMPLETED: [],
      CANCELED: [],
    };
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  },

  // Get next possible statuses
  getNextStatuses: (currentStatus: OrderStatus): OrderStatus[] => {
    const validTransitions: { [key in OrderStatus]: OrderStatus[] } = {
      PENDING: ['ACCEPTED', 'CANCELED'],
      ACCEPTED: ['PREPARING', 'CANCELED'],
      PREPARING: ['READY', 'CANCELED'],
      READY: ['OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELED'],
      OUT_FOR_DELIVERY: ['COMPLETED', 'CANCELED'],
      COMPLETED: [],
      CANCELED: [],
    };
    return validTransitions[currentStatus] || [];
  },

  // Calculate order total
  calculateOrderTotal: (items: any[]): number => {
    return items.reduce((total, item) => total + (item.priceCents * item.qty), 0);
  },

  // Format order items for display
  formatOrderItems: (items: any[]) => {
    return items.map(item => ({
      ...item,
      totalFormatted: `$${((item.priceCents * item.qty) / 100).toFixed(2)}`,
      priceFormatted: `$${(item.priceCents / 100).toFixed(2)}`,
    }));
  },

  // Check if order is active
  isActiveOrder: (status: OrderStatus): boolean => {
    return !['COMPLETED', 'CANCELED'].includes(status);
  },

  // Get order priority
  getOrderPriority: (order: any): 'high' | 'medium' | 'low' => {
    const age = Date.now() - new Date(order.createdAt).getTime();
    const ageMinutes = age / (1000 * 60);
    
    if (ageMinutes > 30) return 'high';
    if (ageMinutes > 15) return 'medium';
    return 'low';
  },
};
