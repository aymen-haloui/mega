import { apiClient } from './index';
import { LoginRequest, LoginResponse, CreateUserRequest, UpdateUserRequest } from '../types';

// Authentication API
export const authAPI = {
  // Login user
  login: (credentials: LoginRequest): Promise<LoginResponse> =>
    apiClient.post('/auth/login', credentials),

  // Register new user (Admin only)
  register: (userData: CreateUserRequest): Promise<any> =>
    apiClient.post('/auth/register', userData),

  // Get current user info
  getCurrentUser: (): Promise<any> =>
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
  // Store auth data in localStorage
  setAuthData: (token: string, user: any) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Get auth data from localStorage
  getAuthData: () => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return {
      token,
      user: user ? JSON.parse(user) : null,
    };
  },

  // Clear auth data
  clearAuthData: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Get user role
  getUserRole: (): string | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).role : null;
  },

  // Check if user is admin
  isAdmin: (): boolean => {
    return authHelpers.getUserRole() === 'ADMIN';
  },

  // Check if user is branch user
  isBranchUser: (): boolean => {
    return authHelpers.getUserRole() === 'BRANCH_USER';
  },
};
