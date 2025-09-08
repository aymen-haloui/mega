import { apiClient } from './index';
import { CreateOrderRequest, UpdateOrderStatusRequest, OrderSearchParams, OrderStatus } from '../types';

// Orders API
export const ordersAPI = {
  // Get all orders
  getOrders: (params?: OrderSearchParams): Promise<any> =>
    apiClient.get('/orders', { params }),

  // Get order by ID
  getOrderById: (id: string): Promise<any> =>
    apiClient.get(`/orders/${id}`),

  // Create new order
  createOrder: (orderData: CreateOrderRequest): Promise<any> =>
    apiClient.post('/orders', orderData),

  // Update order status
  updateOrderStatus: (id: string, statusData: UpdateOrderStatusRequest): Promise<any> =>
    apiClient.put(`/orders/${id}/status`, statusData),

  // Cancel order
  cancelOrder: (id: string, reason: string): Promise<any> =>
    apiClient.put(`/orders/${id}/cancel`, { reason }),

  // Get orders by user phone
  getOrdersByUserPhone: (phone: string, params?: { page?: number; limit?: number; branchId?: string }): Promise<any> =>
    apiClient.get(`/orders/user/${phone}`, { params }),

  // Get real-time orders feed for branch
  getOrdersFeed: (branchId: string, params?: { status?: OrderStatus; limit?: number }): Promise<any> =>
    apiClient.get(`/orders/feed/${branchId}`, { params }),

  // Get order statistics
  getOrderStats: (params?: { branchId?: string; startDate?: string; endDate?: string }): Promise<any> =>
    apiClient.get('/orders/stats', { params }),
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
