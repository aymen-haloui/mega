import { apiClient } from './index';
import { UserSearchParams, CreateUserRequest, UpdateUserRequest, FraudUserResponse } from '../types';

// Users API
export const usersAPI = {
  // Get all users with search and pagination
  getUsers: (params?: UserSearchParams): Promise<any> =>
    apiClient.get('/users', { params }),

  // Get user by ID
  getUserById: (id: string): Promise<any> =>
    apiClient.get(`/users/${id}`),

  // Create new user (Admin only)
  createUser: (userData: CreateUserRequest): Promise<any> =>
    apiClient.post('/users', userData),

  // Update user
  updateUser: (id: string, userData: UpdateUserRequest): Promise<any> =>
    apiClient.put(`/users/${id}`, userData),

  // Delete user (Admin only)
  deleteUser: (id: string): Promise<{ message: string }> =>
    apiClient.delete(`/users/${id}`),

  // Block/Unblock user
  toggleUserBlock: (id: string, data: { isBlocked: boolean; reason?: string }): Promise<any> =>
    apiClient.put(`/users/${id}/block`, data),

  // Add notes to user
  addUserNotes: (id: string, notes: string): Promise<any> =>
    apiClient.put(`/users/${id}/notes`, { notes }),

  // Get fraud/suspicious users
  getFraudUsers: (params?: { maxCancellations?: number; maxNoShows?: number; page?: number; limit?: number }): Promise<any> =>
    apiClient.get('/users/fraud/list', { params }),

  // Quick search users by phone/name
  searchUsers: (query: string): Promise<any> =>
    apiClient.get('/users/search/quick', { params: { q: query } }),

  // Get user orders by phone
  getUserOrders: (phone: string, params?: { page?: number; limit?: number; branchId?: string }): Promise<any> =>
    apiClient.get(`/users/phone/${phone}/orders`, { params }),
};

// User helper functions
export const userHelpers = {
  // Format user data for display
  formatUserData: (user: any) => ({
    ...user,
    displayName: user.name,
    displayPhone: user.phone,
    statusText: user.isBlocked ? 'Blocked' : 'Active',
    roleText: user.role === 'ADMIN' ? 'Administrator' : 'Branch User',
  }),

  // Check if user is suspicious
  isSuspiciousUser: (user: any, thresholds = { maxCancellations: 5, maxNoShows: 3 }) => {
    return user.cancellationCount >= thresholds.maxCancellations || 
           user.noShowCount >= thresholds.maxNoShows;
  },

  // Get user risk level
  getUserRiskLevel: (user: any) => {
    const totalIssues = (user.cancellationCount || 0) + (user.noShowCount || 0);
    if (totalIssues >= 10) return 'HIGH';
    if (totalIssues >= 5) return 'MEDIUM';
    if (totalIssues >= 2) return 'LOW';
    return 'NONE';
  },

  // Format fraud user data
  formatFraudUserData: (fraudUser: FraudUserResponse) => ({
    ...fraudUser,
    riskLevel: userHelpers.getUserRiskLevel(fraudUser.user),
    totalIssues: fraudUser.cancellationCount + fraudUser.noShowCount,
    lastOrderText: fraudUser.lastOrderAt 
      ? new Date(fraudUser.lastOrderAt).toLocaleDateString()
      : 'Never',
    totalSpentFormatted: `$${(fraudUser.totalSpent / 100).toFixed(2)}`,
  }),
};
