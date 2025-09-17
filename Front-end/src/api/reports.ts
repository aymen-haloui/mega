import { apiClient } from './client';
import { BranchIncomeParams, FraudUserResponse, OrderExportData, BranchReportData } from './types';

// Reports API
export const reportsAPI = {
  // Get branch income report
  getBranchIncome: (params: BranchIncomeParams): Promise<any> =>
    apiClient.get('/reports/branch-income', { params }),

  // Get fraud/suspicious users
  getFraudUsers: (params?: { 
    maxCancellations?: number; 
    maxNoShows?: number; 
    page?: number; 
    limit?: number 
  }): Promise<any> =>
    apiClient.get('/reports/fraud-users', { params }),

  // Export orders to CSV
  exportOrders: (params: { 
    branchId?: string; 
    startDate: string; 
    endDate: string; 
    status?: string 
  }): Promise<Blob> =>
    apiClient.get('/reports/export/orders', { 
      params, 
      responseType: 'blob' 
    }),

  // Export branch report to CSV
  exportBranchReport: (params: { 
    branchId?: string; 
    startDate: string; 
    endDate: string 
  }): Promise<Blob> =>
    apiClient.get('/reports/export/branch-report', { 
      params, 
      responseType: 'blob' 
    }),

  // Get dashboard statistics
  getDashboardStats: (params?: { 
    branchId?: string; 
    period?: '1d' | '7d' | '30d' | '90d' 
  }): Promise<any> =>
    apiClient.get('/reports/dashboard', { params }),

  // Get audit log
  getAuditLog: (params?: { 
    page?: number; 
    limit?: number; 
    action?: string; 
    entity?: string; 
    userId?: string; 
    startDate?: string; 
    endDate?: string 
  }): Promise<any> =>
    apiClient.get('/reports/audit-log', { params }),

  // Get sales analytics
  getSalesAnalytics: (params?: { 
    branchId?: string; 
    startDate?: string; 
    endDate?: string; 
    groupBy?: 'day' | 'week' | 'month' 
  }): Promise<any> =>
    apiClient.get('/reports/sales-analytics', { params }),

  // Get popular dishes report
  getPopularDishes: (params?: { 
    branchId?: string; 
    startDate?: string; 
    endDate?: string; 
    limit?: number 
  }): Promise<any> =>
    apiClient.get('/reports/popular-dishes', { params }),

  // Get customer analytics
  getCustomerAnalytics: (params?: { 
    branchId?: string; 
    startDate?: string; 
    endDate?: string 
  }): Promise<any> =>
    apiClient.get('/reports/customer-analytics', { params }),
};

// Reports helper functions
export const reportHelpers = {
  // Format branch income data
  formatBranchIncome: (data: any[]) => {
    return data.map(branch => ({
      ...branch,
      totalRevenueFormatted: `$${(branch.totalRevenue / 100).toFixed(2)}`,
      averageTicketFormatted: `$${(branch.averageTicket / 100).toFixed(2)}`,
      cancelledRevenueFormatted: `$${(branch.cancelledRevenue / 100).toFixed(2)}`,
      completionRate: branch.ordersCount > 0 
        ? ((branch.ordersCount - branch.cancelledOrdersCount) / branch.ordersCount * 100).toFixed(1)
        : '0',
    }));
  },

  // Format fraud user data
  formatFraudUsers: (data: FraudUserResponse[]) => {
    return data.map(user => ({
      ...user,
      totalIssues: user.cancellationCount + user.noShowCount,
      riskLevel: reportHelpers.getRiskLevel(user),
      lastOrderFormatted: user.lastOrderAt 
        ? new Date(user.lastOrderAt).toLocaleDateString()
        : 'Never',
      totalSpentFormatted: `$${(user.totalSpent / 100).toFixed(2)}`,
    }));
  },

  // Get risk level for fraud user
  getRiskLevel: (user: FraudUserResponse): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' => {
    const totalIssues = user.cancellationCount + user.noShowCount;
    if (totalIssues >= 15) return 'CRITICAL';
    if (totalIssues >= 10) return 'HIGH';
    if (totalIssues >= 5) return 'MEDIUM';
    return 'LOW';
  },

  // Get risk color
  getRiskColor: (riskLevel: string): string => {
    const colorMap = {
      LOW: 'green',
      MEDIUM: 'yellow',
      HIGH: 'orange',
      CRITICAL: 'red',
    };
    return colorMap[riskLevel as keyof typeof colorMap] || 'gray';
  },

  // Format dashboard statistics
  formatDashboardStats: (stats: any) => {
    return {
      ...stats,
      revenue: {
        ...stats.revenue,
        totalFormatted: `$${(stats.revenue.total / 100).toFixed(2)}`,
        averageFormatted: `$${(stats.revenue.average / 100).toFixed(2)}`,
      },
      orders: {
        ...stats.orders,
        completionRateFormatted: `${stats.orders.completionRate.toFixed(1)}%`,
      },
      recentOrders: stats.recentOrders.map((order: any) => ({
        ...order,
        totalFormatted: `$${(order.totalCents / 100).toFixed(2)}`,
        createdAtFormatted: new Date(order.createdAt).toLocaleString(),
      })),
      topDishes: stats.topDishes.map((dish: any) => ({
        ...dish,
        revenueFormatted: `$${(dish.revenue / 100).toFixed(2)}`,
      })),
    };
  },

  // Format audit log data
  formatAuditLog: (logs: any[]) => {
    return logs.map(log => ({
      ...log,
      createdAtFormatted: new Date(log.createdAt).toLocaleString(),
      actionText: reportHelpers.getActionText(log.action),
      entityText: reportHelpers.getEntityText(log.entity),
    }));
  },

  // Get action display text
  getActionText: (action: string): string => {
    const actionMap: { [key: string]: string } = {
      CREATE: 'Created',
      UPDATE: 'Updated',
      DELETE: 'Deleted',
      LOGIN: 'Logged In',
      LOGOUT: 'Logged Out',
      BLOCK: 'Blocked',
      UNBLOCK: 'Unblocked',
    };
    return actionMap[action] || action;
  },

  // Get entity display text
  getEntityText: (entity: string): string => {
    const entityMap: { [key: string]: string } = {
      User: 'User',
      Branch: 'Branch',
      Menu: 'Menu',
      Dish: 'Dish',
      Order: 'Order',
      Ingredient: 'Ingredient',
    };
    return entityMap[entity] || entity;
  },

  // Download CSV file
  downloadCSV: (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Format date range for display
  formatDateRange: (startDate: string, endDate: string): string => {
    const start = new Date(startDate).toLocaleDateString();
    const end = new Date(endDate).toLocaleDateString();
    return `${start} - ${end}`;
  },

  // Get period display text
  getPeriodText: (period: string): string => {
    const periodMap: { [key: string]: string } = {
      '1d': 'Last 24 Hours',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 90 Days',
    };
    return periodMap[period] || period;
  },

  // Calculate growth percentage
  calculateGrowth: (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },

  // Format growth percentage
  formatGrowth: (growth: number): string => {
    const sign = growth >= 0 ? '+' : '';
    return `${sign}${growth.toFixed(1)}%`;
  },

  // Get growth color
  getGrowthColor: (growth: number): string => {
    if (growth > 0) return 'green';
    if (growth < 0) return 'red';
    return 'gray';
  },
};
