// Algeria Eats Hub - Auth Store (Zustand) - Updated for Prisma Schema

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthState } from '@/types';
import { authAPI, authHelpers } from '@/api/auth';
import { LoginRequest } from '@/api/types';

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  restoreSession: () => void;
  checkUserBlocked: () => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ loading: true, error: null });
        
        try {
          const response = await authAPI.login(credentials);
          
          if (response.token && response.user) {
            // Store auth data using helpers
            authHelpers.setAuthData(response.token, response.user);
            
            set({
              user: response.user,
              isAuthenticated: true,
              error: null,
              loading: false,
            });
            return { success: true };
          } else {
            set({
              user: null,
              isAuthenticated: false,
              error: 'Erreur de connexion',
              loading: false,
            });
            return { success: false, message: 'Erreur de connexion' };
          }
        } catch (error: any) {
          const errorMessage = error.message || 'Erreur lors de la connexion';
          set({
            user: null,
            isAuthenticated: false,
            error: errorMessage,
            loading: false,
          });
          return { success: false, message: errorMessage };
        }
      },


      logout: () => {
        // Clear auth data using helpers
        authHelpers.clearAuthData();
        
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          loading: false,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          // Update user locally (API calls will be handled by components)
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      setLoading: (loading: boolean) => {
        set({ loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      restoreSession: () => {
        const { token, user } = authHelpers.getAuthData();
        if (token && user && !authHelpers.isUserBlocked()) {
          set({ 
            user,
            isAuthenticated: true 
          });
        } else {
          set({
            user: null,
            isAuthenticated: false,
          });
        }
      },

      checkUserBlocked: () => {
        return authHelpers.isUserBlocked();
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);