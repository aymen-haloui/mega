import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Ingredient, BranchIngredientAvailability, DishIngredient } from '@/types';

interface IngredientsStoreState {
  ingredients: Ingredient[];
  branchAvailabilities: BranchIngredientAvailability[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'createdAt'>) => Promise<Ingredient>;
  updateIngredient: (id: string, ingredient: Partial<Ingredient>) => Promise<Ingredient>;
  deleteIngredient: (id: string) => Promise<void>;
  getIngredientById: (id: string) => Ingredient | undefined;
  getIngredientsByBranch: (branchId: string) => Ingredient[];
  getAvailableIngredients: (branchId: string) => Ingredient[];
  getUnavailableIngredients: (branchId: string) => Ingredient[];
  updateBranchAvailability: (ingredientId: string, branchId: string, available: boolean) => Promise<void>;
  getBranchAvailability: (ingredientId: string, branchId: string) => boolean;
  toggleIngredientExpiration: (ingredientId: string) => Promise<void>;
  toggleBranchIngredientExpiration: (ingredientId: string, branchId: string) => Promise<void>;
  getIngredientStats: (ingredientId: string) => {
    totalBranches: number;
    availableBranches: number;
    unavailableBranches: number;
    usageCount: number;
  };
}

export const useIngredientsStore = create<IngredientsStoreState>()(
  persist(
    (set, get) => ({
      ingredients: [],
      branchAvailabilities: [],
      loaded: false,
      loading: false,
      error: null,

      load: async () => {
        set({ loading: true, error: null });
        try {
          const storedIngredients = localStorage.getItem('ingredients');
          const storedAvailabilities = localStorage.getItem('branchIngredientAvailabilities');
          
          let ingredients: Ingredient[] = [];
          let branchAvailabilities: BranchIngredientAvailability[] = [];
          
          if (storedIngredients) {
            ingredients = JSON.parse(storedIngredients);
          }
          
          if (storedAvailabilities) {
            branchAvailabilities = JSON.parse(storedAvailabilities);
          }
          
          if (ingredients.length > 0) {
            set({ ingredients, branchAvailabilities, loaded: true, loading: false });
          } else {
            // Initialize with default ingredients
            const defaultIngredients: Ingredient[] = [
              {
                id: 'ing_1',
                name: 'Tomate',
                expired: false,
                createdAt: new Date().toISOString(),
                createdBy: 'system'
              },
              {
                id: 'ing_2',
                name: 'Mozzarella',
                expired: false,
                createdAt: new Date().toISOString(),
                createdBy: 'system'
              },
              {
                id: 'ing_3',
                name: 'Basilic',
                expired: false,
                createdAt: new Date().toISOString(),
                createdBy: 'system'
              },
              {
                id: 'ing_4',
                name: 'Pâte à Pizza',
                expired: false,
                createdAt: new Date().toISOString(),
                createdBy: 'system'
              },
              {
                id: 'ing_5',
                name: 'Jambon',
                expired: false,
                createdAt: new Date().toISOString(),
                createdBy: 'system'
              },
              {
                id: 'ing_6',
                name: 'Champignons',
                expired: false,
                createdAt: new Date().toISOString(),
                createdBy: 'system'
              },
              {
                id: 'ing_7',
                name: 'Olives',
                expired: false,
                createdAt: new Date().toISOString(),
                createdBy: 'system'
              },
              {
                id: 'ing_8',
                name: 'Parmesan',
                expired: false,
                createdAt: new Date().toISOString(),
                createdBy: 'system'
              },
              {
                id: 'ing_9',
                name: 'Pepperoni',
                expired: false,
                createdAt: new Date().toISOString(),
                createdBy: 'system'
              },
              {
                id: 'ing_10',
                name: 'Ananas',
                expired: false,
                createdAt: new Date().toISOString(),
                createdBy: 'system'
              }
            ];
            set({ ingredients: defaultIngredients, branchAvailabilities, loaded: true, loading: false });
            localStorage.setItem('ingredients', JSON.stringify(defaultIngredients));
          }
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      addIngredient: async (ingredientData) => {
        const newIngredient: Ingredient = {
          ...ingredientData,
          id: `ing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        };

        set((state) => {
          const updatedIngredients = [...state.ingredients, newIngredient];
          localStorage.setItem('ingredients', JSON.stringify(updatedIngredients));
          return { ingredients: updatedIngredients };
        });

        return newIngredient;
      },

      updateIngredient: async (id: string, ingredientData) => {
        set((state) => {
          const updatedIngredients = state.ingredients.map(ingredient =>
            ingredient.id === id ? { ...ingredient, ...ingredientData } : ingredient
          );
          localStorage.setItem('ingredients', JSON.stringify(updatedIngredients));
          return { ingredients: updatedIngredients };
        });

        const updatedIngredient = get().ingredients.find(ing => ing.id === id);
        if (!updatedIngredient) throw new Error('Ingredient not found');
        return updatedIngredient;
      },

      deleteIngredient: async (id: string) => {
        set((state) => {
          const updatedIngredients = state.ingredients.filter(ingredient => ingredient.id !== id);
          localStorage.setItem('ingredients', JSON.stringify(updatedIngredients));
          return { ingredients: updatedIngredients };
        });
      },

      getIngredientById: (id: string) => {
        const { ingredients } = get();
        return ingredients.find(ingredient => ingredient.id === id);
      },

      getIngredientsByBranch: (branchId: string) => {
        const { ingredients, branchAvailabilities } = get();
        const branchIngredientIds = branchAvailabilities
          .filter(avail => avail.branchId === branchId)
          .map(avail => avail.ingredientId);
        
        return ingredients.filter(ingredient => branchIngredientIds.includes(ingredient.id));
      },

      getAvailableIngredients: (branchId: string) => {
        const { ingredients, branchAvailabilities } = get();
        const availableIngredientIds = branchAvailabilities
          .filter(avail => avail.branchId === branchId && avail.available)
          .map(avail => avail.ingredientId);
        
        return ingredients.filter(ingredient => availableIngredientIds.includes(ingredient.id));
      },

      getUnavailableIngredients: (branchId: string) => {
        const { ingredients, branchAvailabilities } = get();
        const unavailableIngredientIds = branchAvailabilities
          .filter(avail => avail.branchId === branchId && !avail.available)
          .map(avail => avail.ingredientId);
        
        return ingredients.filter(ingredient => unavailableIngredientIds.includes(ingredient.id));
      },

      updateBranchAvailability: async (ingredientId: string, branchId: string, available: boolean) => {
        console.log('Store: Updating branch availability', { ingredientId, branchId, available });
        set((state) => {
          const existingIndex = state.branchAvailabilities.findIndex(
            avail => avail.ingredientId === ingredientId && avail.branchId === branchId
          );

          let updatedAvailabilities;
          if (existingIndex >= 0) {
            updatedAvailabilities = state.branchAvailabilities.map((avail, index) =>
              index === existingIndex 
                ? { ...avail, available, updatedAt: new Date().toISOString() }
                : avail
            );
            console.log('Store: Updated existing availability');
          } else {
            const newAvailability: BranchIngredientAvailability = {
              id: `avail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              branchId,
              ingredientId,
              available,
              updatedAt: new Date().toISOString(),
              updatedBy: 'system'
            };
            updatedAvailabilities = [...state.branchAvailabilities, newAvailability];
            console.log('Store: Created new availability');
          }

          localStorage.setItem('branchIngredientAvailabilities', JSON.stringify(updatedAvailabilities));
          console.log('Store: Saved to localStorage', updatedAvailabilities);
          return { branchAvailabilities: updatedAvailabilities };
        });
      },

      getBranchAvailability: (ingredientId: string, branchId: string) => {
        const { branchAvailabilities } = get();
        const availability = branchAvailabilities.find(
          avail => avail.ingredientId === ingredientId && avail.branchId === branchId
        );
        return availability ? availability.available : true; // Default to available
      },

      toggleIngredientExpiration: async (ingredientId: string) => {
        set((state) => {
          const updatedIngredients = state.ingredients.map(ingredient => {
            if (ingredient.id === ingredientId) {
              return { ...ingredient, expired: !ingredient.expired };
            }
            return ingredient;
          });
          
          localStorage.setItem('ingredients', JSON.stringify(updatedIngredients));
          return { ingredients: updatedIngredients };
        });
      },

      toggleBranchIngredientExpiration: async (ingredientId: string, branchId: string) => {
        set((state) => {
          const updatedIngredients = state.ingredients.map(ingredient => {
            if (ingredient.id === ingredientId) {
              const currentBranchExpired = ingredient.branchExpired || {};
              const currentExpiredStatus = currentBranchExpired[branchId] || false;
              const newBranchExpired = {
                ...currentBranchExpired,
                [branchId]: !currentExpiredStatus
              };
              
              
              return { 
                ...ingredient, 
                branchExpired: newBranchExpired 
              };
            }
            return ingredient;
          });
          
          localStorage.setItem('ingredients', JSON.stringify(updatedIngredients));
          return { ingredients: updatedIngredients };
        });
      },

      getIngredientStats: (ingredientId: string) => {
        const { branchAvailabilities, ingredients } = get();
        const ingredient = ingredients.find(ing => ing.id === ingredientId);
        const ingredientAvailabilities = branchAvailabilities.filter(
          avail => avail.ingredientId === ingredientId
        );

        const totalBranches = ingredientAvailabilities.length;
        
        // Calculate available branches considering both availability and expiration
        const availableBranches = ingredientAvailabilities.filter(avail => {
          const baseAvailability = avail.available;
          const isBranchExpired = ingredient?.branchExpired?.[avail.branchId] || false;
          return baseAvailability && !isBranchExpired;
        }).length;
        
        const unavailableBranches = totalBranches - availableBranches;

        // This would need to be calculated from dish ingredients in a real app
        const usageCount = 0; // Placeholder

        return {
          totalBranches,
          availableBranches,
          unavailableBranches,
          usageCount
        };
      },
    }),
    {
      name: 'ingredients-storage',
      partialize: (state) => ({ 
        ingredients: state.ingredients,
        branchAvailabilities: state.branchAvailabilities
      }),
    }
  )
);
