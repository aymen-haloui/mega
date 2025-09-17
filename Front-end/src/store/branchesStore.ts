import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Branch } from '@/types';
import { branchesAPI } from '@/api/branches';

interface BranchesStoreState {
  branches: Branch[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  refresh: () => Promise<void>;
  create: (input: { name: string; address: string; lat: number; lng: number }) => Promise<Branch>;
  update: (id: string, input: { name?: string; address?: string; lat?: number; lng?: number }) => Promise<Branch>;
  remove: (id: string) => Promise<void>;
  getById: (id: string) => Branch | undefined;
  getActive: () => Branch[];
}

export const useBranchesStore = create<BranchesStoreState>()(
  persist(
    (set, get) => ({
      branches: [],
      loaded: false,
      loading: false,
      error: null,
      
      load: async () => {
        set({ loading: true, error: null });
        try {
          const response = await branchesAPI.getBranches();
          set({ branches: response.data || response, loaded: true, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },
      
      refresh: async () => {
        set({ loading: true, error: null });
        try {
          const response = await branchesAPI.getBranches();
          set({ branches: response.data || response, loading: false });
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },
      
      create: async (input) => {
        set({ loading: true, error: null });
        try {
          const response = await branchesAPI.createBranch(input);
          const newBranch = response.data || response;
          set((state) => ({ 
            branches: [...state.branches, newBranch], 
            loading: false 
          }));
          return newBranch;
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      update: async (id, input) => {
        set({ loading: true, error: null });
        try {
          const response = await branchesAPI.updateBranch(id, input);
          const updatedBranch = response.data || response;
          set((state) => ({
            branches: state.branches.map(b => b.id === id ? updatedBranch : b),
            loading: false
          }));
          return updatedBranch;
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      remove: async (id) => {
        set({ loading: true, error: null });
        try {
          await branchesAPI.deleteBranch(id);
          set((state) => ({
            branches: state.branches.filter(b => b.id !== id),
            loading: false
          }));
        } catch (error: any) {
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      getById: (id) => get().branches.find(b => b.id === id),
      getActive: () => get().branches, // All branches are active in new schema
    }),
    { name: 'branches-store' }
  )
);

// Load branches on store initialization
if (typeof window !== 'undefined') {
  useBranchesStore.getState().load();
}


