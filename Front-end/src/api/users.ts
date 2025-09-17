import { apiClient } from './client';
import { UserSearchParams, CreateUserRequest, UpdateUserRequest, FraudUserResponse } from './types';
import { mockUsers, shouldUseMockData } from './mockData';

// Users API
export const usersAPI = {
  // Get all users with search and pagination
  getUsers: async (params?: UserSearchParams): Promise<any> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter mock users based on params
      let filteredUsers = [...mockUsers];
      
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        filteredUsers = filteredUsers.filter(user => 
          user.name.toLowerCase().includes(searchLower) ||
          user.phone.includes(searchLower)
        );
      }
      
      if (params?.role) {
        filteredUsers = filteredUsers.filter(user => user.role === params.role);
      }
      
      if (params?.branchId) {
        filteredUsers = filteredUsers.filter(user => user.branchId === params.branchId);
      }
      
      if (params?.isBlocked !== undefined) {
        filteredUsers = filteredUsers.filter(user => user.isBlocked === params.isBlocked);
      }
      
      return { data: filteredUsers };
    }
    return apiClient.get('/users', { params });
  },

  // Get user by ID
  getUserById: async (id: string): Promise<any> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const user = mockUsers.find(u => u.id === id);
      if (!user) {
        throw new Error('User not found');
      }
      
      return { data: user };
    }
    return apiClient.get(`/users/${id}`);
  },

  // Create new user (Admin only)
  createUser: async (userData: CreateUserRequest): Promise<any> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create new user with mock data
      const newUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...userData,
        isBlocked: userData.isBlocked ?? false,
        cancellationCount: userData.cancellationCount ?? 0,
        noShowCount: userData.noShowCount ?? 0,
        createdAt: userData.createdAt ?? new Date().toISOString(),
        updatedAt: userData.updatedAt ?? new Date().toISOString(),
        createdBy: 'current-user',
        updatedBy: 'current-user',
      };
      
      // Add to mock data
      mockUsers.push(newUser);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
      }
      
      return { data: newUser };
    }
    return apiClient.post('/users', userData);
  },

  // Update user
  updateUser: async (id: string, userData: UpdateUserRequest): Promise<any> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find and update user in mock data
      const userIndex = mockUsers.findIndex(u => u.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update the user
      const updatedUser = {
        ...mockUsers[userIndex],
        ...userData,
        updatedAt: new Date().toISOString(),
        updatedBy: 'current-user'
      };
      
      mockUsers[userIndex] = updatedUser;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
      }
      
      return { data: updatedUser };
    }
    return apiClient.put(`/users/${id}`, userData);
  },

  // Delete user (Admin only)
  deleteUser: async (id: string): Promise<{ message: string }> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove user from mock data
      const userIndex = mockUsers.findIndex(u => u.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      mockUsers.splice(userIndex, 1);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
      }
      
      return { message: 'User deleted successfully' };
    }
    return apiClient.delete(`/users/${id}`);
  },

  // Block/Unblock user
  toggleUserBlock: async (id: string, data: { isBlocked: boolean; reason?: string }): Promise<any> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find and update user in mock data
      const userIndex = mockUsers.findIndex(u => u.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      // Update the user's blocked status
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        isBlocked: data.isBlocked,
        updatedAt: new Date().toISOString(),
        updatedBy: 'current-user'
      };
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
      }
      
      return { data: mockUsers[userIndex] };
    }
    return apiClient.put(`/users/${id}/block`, data);
  },

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
