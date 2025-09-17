import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Dish, Ingredient } from '@/types';
import { dishesAPI } from '@/api/dishes';

interface DishesStoreState {
  dishes: Dish[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  refresh: () => void;
  create: (input: { 
    name: string; 
    description?: string; 
    imageUrl?: string; 
    priceCents: number; 
    categoryId?: string;
    menuId: string; 
    ingredients: Array<{ ingredientId: string; qtyUnit?: number; required?: boolean }> 
  }) => Promise<Dish>;
  update: (id: string, input: { 
    name?: string; 
    description?: string; 
    imageUrl?: string; 
    priceCents?: number; 
    categoryId?: string;
    available?: boolean; 
    ingredients?: Array<{ ingredientId: string; qtyUnit?: number; required?: boolean }> 
  }) => Promise<Dish>;
  remove: (id: string) => Promise<void>;
  toggleAvailability: (id: string) => Promise<Dish>;
  getByBranch: (branchId: string) => Dish[];
  getByMenu: (menuId: string) => Dish[];
  getById: (id: string) => Dish | undefined;
  isDishAvailable: (dish: Dish, branchId?: string) => boolean;
}

export const useDishesStore = create<DishesStoreState>()(
  persist(
    (set, get) => ({
      dishes: [],
      loaded: false,
      loading: false,
      error: null,
      
      load: async () => {
        set({ loading: true, error: null });
        try {
          const response = await dishesAPI.getDishes();
          const dishes = response.data || response;
          set({ dishes, loaded: true, loading: false });
          
          // Ensure localStorage is synced with store data
          if (typeof window !== 'undefined') {
            localStorage.setItem('mockDishes', JSON.stringify(dishes));
          }
        } catch (error: unknown) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
        }
      },
      
      refresh: () => {
        // Refresh dishes from localStorage
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('mockDishes');
          if (stored) {
            const dishes = JSON.parse(stored);
            set({ dishes });
          }
        }
      },
      
      create: async (input) => {
        set({ loading: true, error: null });
        try {
          const response = await dishesAPI.createDish(input);
          const newDish = response.data || response;
          set((state) => ({ 
            dishes: [...state.dishes, newDish], 
            loading: false 
          }));
          return newDish;
        } catch (error: unknown) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
          throw error;
        }
      },
      
      update: async (id, input) => {
        set({ loading: true, error: null });
        try {
          const response = await dishesAPI.updateDish(id, input);
          const updatedDish = response.data || response;
          set((state) => ({
            dishes: state.dishes.map(d => d.id === id ? updatedDish : d),
            loading: false
          }));
          
          // Sync with localStorage for mock data
          if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('mockDishes');
            if (stored) {
              const existingDishes = JSON.parse(stored);
              const dishIndex = existingDishes.findIndex((dish: Dish) => dish.id === id);
              if (dishIndex !== -1) {
                existingDishes[dishIndex] = updatedDish;
                localStorage.setItem('mockDishes', JSON.stringify(existingDishes));
              }
            }
          }
          
          return updatedDish;
        } catch (error: unknown) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
          throw error;
        }
      },
      
      remove: async (id) => {
        set({ loading: true, error: null });
        try {
          await dishesAPI.deleteDish(id);
          set((state) => ({
            dishes: state.dishes.filter(d => d.id !== id),
            loading: false
          }));
        } catch (error: unknown) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
          throw error;
        }
      },
      
      toggleAvailability: async (id) => {
        set({ loading: true, error: null });
        try {
          const dish = get().dishes.find(d => d.id === id);
          if (!dish) throw new Error('Dish not found');
          
          const response = await dishesAPI.toggleAvailability(id, !dish.available);
          const updatedDish = response.data || response;
          set((state) => ({
            dishes: state.dishes.map(d => d.id === id ? updatedDish : d),
            loading: false
          }));
          return updatedDish;
        } catch (error: unknown) {
          set({ error: error instanceof Error ? error.message : 'Unknown error', loading: false });
          throw error;
        }
      },
      
      getByBranch: (branchId) => get().dishes.filter(d => d.menuId === branchId),
      getByMenu: (menuId) => get().dishes.filter(d => d.menuId === menuId),
      getById: (id) => get().dishes.find(d => d.id === id),
      
      isDishAvailable: (dish, branchId?: string) => {
        // First check if the dish itself is marked as available
        if (!dish.available) return false;
        
        // Check if any required ingredients are expired
        if (dish.ingredients && dish.ingredients.length > 0) {
          // Get ingredients from localStorage to check expiration status
          if (typeof window !== 'undefined') {
            const storedIngredients = localStorage.getItem('ingredients');
            if (storedIngredients) {
              try {
                const ingredients = JSON.parse(storedIngredients);
                
                // Check if any required ingredient is expired
                const hasExpiredIngredient = dish.ingredients.some(dishIngredient => {
                  if (dishIngredient.required) {
                    const ingredient = ingredients.find((ing: Ingredient) => ing.id === dishIngredient.ingredientId);
                    if (ingredient) {
                      // Check global expiration first
                      if (ingredient.expired === true) return true;
                      
                      // Check branch-specific expiration if branchId is provided
                      if (branchId && ingredient.branchExpired && ingredient.branchExpired[branchId] === true) {
                        return true;
                      }
                    }
                  }
                  return false;
                });
                
                return !hasExpiredIngredient;
              } catch (error) {
                console.error('Error parsing ingredients from localStorage:', error);
              }
            }
          }
        }
        
        return true; // If no ingredients or no expiration data, assume available
      },
    }),
    { name: 'dishes-store' }
  )
);

// Load dishes on store initialization
if (typeof window !== 'undefined') {
  useDishesStore.getState().load();
}


