import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { usersAPI } from '@/api/users';

interface UsersStoreState {
  users: User[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  refresh: () => void;
  addUser: (input: { 
    name: string; 
    phone: string; 
    role: 'ADMIN' | 'BRANCH_USER'; 
    branchId?: string; 
    password?: string;
    isBlocked?: boolean;
    cancellationCount?: number;
    noShowCount?: number;
    createdAt?: string;
    updatedAt?: string;
  }) => Promise<User>;
  updateUser: (id: string, input: { 
    name?: string; 
    phone?: string; 
    role?: 'ADMIN' | 'BRANCH_USER'; 
    branchId?: string; 
    isBlocked?: boolean; 
    notes?: string 
  }) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  getById: (id: string) => User | undefined;
  getByRole: (role: User['role']) => User[];
}

export const useUsersStore = create<UsersStoreState>()(
  persist(
    (set, get) => ({
      users: [],
      loaded: false,
      loading: false,
      error: null,
      
      load: async () => {
        set({ loading: true, error: null });
        try {
          const response = await usersAPI.getUsers();
          const users = response.data || response;
          set({ users, loaded: true, loading: false });
          
          // Ensure localStorage is synced with store data
          if (typeof window !== 'undefined') {
            localStorage.setItem('mockUsers', JSON.stringify(users));
          }
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },
      
      refresh: () => {
        // Refresh users from localStorage
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('mockUsers');
          if (stored) {
            const users = JSON.parse(stored);
            set({ users });
          }
        }
      },
      
      addUser: async (input) => {
        set({ loading: true, error: null });
        try {
          const response = await usersAPI.createUser(input);
          const newUser = response.data || response;
          set((state) => ({ 
            users: [...state.users, newUser], 
            loading: false 
          }));
          return newUser;
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      updateUser: async (id, input) => {
        set({ loading: true, error: null });
        try {
          const response = await usersAPI.updateUser(id, input);
          const updatedUser = response.data || response;
          set((state) => ({
            users: state.users.map(u => u.id === id ? updatedUser : u),
            loading: false
          }));
          return updatedUser;
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      deleteUser: async (id) => {
        set({ loading: true, error: null });
        try {
          await usersAPI.deleteUser(id);
          set((state) => ({
            users: state.users.filter(u => u.id !== id),
            loading: false
          }));
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      getById: (id) => get().users.find(u => u.id === id),
      getByRole: (role) => get().users.filter(u => u.role === role),
    }),
    { name: 'users-store' }
  )
);

// Load users on store initialization
if (typeof window !== 'undefined') {
  useUsersStore.getState().load();
}


