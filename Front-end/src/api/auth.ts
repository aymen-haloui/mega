import { apiClient } from './client';
import { LoginRequest, LoginResponse, CreateUserRequest, UpdateUserRequest, ApiResponse } from './types';
import { User } from '@/types';
import { mockUsers, shouldUseMockData } from './mockData';

// Authentication API
export const authAPI = {
  // Login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Find user by phone
      const user = mockUsers.find(u => u.phone === credentials.phone);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }
      
      // For mock data, validate password
      if (!credentials.password || credentials.password !== 'admin123') {
        throw new Error('Mot de passe incorrect');
      }
      
      if (user.isBlocked) {
        throw new Error('Compte bloqué');
      }
      
      // Mock successful login
      const mockResponse: LoginResponse = {
        user,
        token: `mock_token_${Date.now()}`,
      };
      
      return mockResponse;
    }
    return apiClient.post('/auth/login', credentials);
  },

  // Register new user (Admin only)
  register: (userData: CreateUserRequest): Promise<ApiResponse> =>
    apiClient.post('/auth/register', userData),


  // Get current user info
  getCurrentUser: (): Promise<ApiResponse> =>
    apiClient.get('/auth/me'),

  // Logout user
  logout: (): Promise<{ message: string }> =>
    apiClient.post('/auth/logout'),

  // Change password
  changePassword: (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> =>
    apiClient.put('/auth/change-password', data),

  // Refresh token (if implemented)
  refreshToken: (): Promise<{ token: string }> =>
    apiClient.post('/auth/refresh'),
};

// Auth helper functions
export const authHelpers = {
  // Store auth data in localStorage (compatible with Zustand persist)
  setAuthData: (token: string, user: User) => {
    const authData = { token, user };
    localStorage.setItem('authData', JSON.stringify(authData));
  },

  // Get auth data from localStorage
  getAuthData: () => {
    const authData = localStorage.getItem('authData');
    if (authData) {
      try {
        return JSON.parse(authData);
      } catch (error) {
        console.error('Error parsing auth data:', error);
        return { token: null, user: null };
      }
    }
    return { token: null, user: null };
  },

  // Clear auth data
  clearAuthData: () => {
    localStorage.removeItem('authData');
    localStorage.removeItem('auth-storage');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const { token } = authHelpers.getAuthData();
    return !!token;
  },

  // Get user role
  getUserRole: (): string | null => {
    const { user } = authHelpers.getAuthData();
    return user?.role || null;
  },

  // Check if user is admin
  isAdmin: (): boolean => {
    return authHelpers.getUserRole() === 'ADMIN';
  },

  // Check if user is branch user
  isBranchUser: (): boolean => {
    return authHelpers.getUserRole() === 'BRANCH_USER';
  },

  // Check if user is blocked
  isUserBlocked: (): boolean => {
    const { user } = authHelpers.getAuthData();
    return user?.isBlocked || false;
  },

  // Get user branch info
  getUserBranch: () => {
    const { user } = authHelpers.getAuthData();
    return user?.branch || null;
  },
};
