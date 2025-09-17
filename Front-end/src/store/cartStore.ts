// Algeria Eats Hub - Cart Store (Zustand) - Updated for Prisma Schema

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Dish, CartState } from '@/types';
import { clearUserCartData, cleanCartItems } from '@/utils/cartUtils';

// Simple cart storage (no user accounts for clients)
const createCartStorage = () => {
  return {
    getItem: (name: string) => {
      const value = localStorage.getItem(name);
      if (!value) return null;
      
      try {
        const parsed = JSON.parse(value);
        // Clean and validate cart items
        if (parsed.state && parsed.state.items) {
          parsed.state.items = cleanCartItems(parsed.state.items);
        }
        return parsed;
      } catch (error) {
        console.error('Error parsing cart data:', error);
        return null;
      }
    },
    setItem: (name: string, value: any) => {
      localStorage.setItem(name, JSON.stringify(value));
    },
    removeItem: (name: string) => {
      localStorage.removeItem(name);
    },
  };
};

interface CartActions {
  addItem: (dish: Dish, quantity?: number, specialInstructions?: string) => void;
  removeItem: (dishId: string) => void;
  updateQuantity: (dishId: string, quantity: number) => void;
  updateInstructions: (dishId: string, instructions: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
}

type CartStore = CartState & CartActions;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      totalCents: 0,
      itemCount: 0,
      branchId: undefined,

      addItem: (dish: Dish, quantity: number = 1, specialInstructions?: string) => {
        set((state) => {
          const existingItem = state.items.find(item => item.dishId === dish.id);
          
          if (existingItem) {
            const updatedItems = state.items.map(item =>
              item.dishId === dish.id
                ? { ...item, quantity: item.quantity + quantity, specialInstructions: specialInstructions || item.specialInstructions }
                : item
            );
            
            const newTotalCents = updatedItems.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0);
            const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
            
            return {
              items: updatedItems,
              totalCents: newTotalCents,
              itemCount: newItemCount,
              branchId: dish.menu.branchId,
            };
          } else {
            const newItem: CartItem = {
              dishId: dish.id,
              quantity,
              priceCents: dish.priceCents,
              dish,
              specialInstructions,
            };
            
            const newItems = [...state.items, newItem];
            const newTotalCents = newItems.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0);
            const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
            
            return {
              items: newItems,
              totalCents: newTotalCents,
              itemCount: newItemCount,
              branchId: dish.menu.branchId,
            };
          }
        });
      },

      removeItem: (dishId: string) => {
        set((state) => {
          const updatedItems = state.items.filter(item => item.dishId !== dishId);
          const newTotalCents = updatedItems.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0);
          const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          
          return {
            items: updatedItems,
            totalCents: newTotalCents,
            itemCount: newItemCount,
          };
        });
      },

      updateQuantity: (dishId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(dishId);
          return;
        }

        set((state) => {
          const updatedItems = state.items.map(item =>
            item.dishId === dishId ? { ...item, quantity } : item
          );
          
          const newTotalCents = updatedItems.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0);
          const newItemCount = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
          
          return {
            items: updatedItems,
            totalCents: newTotalCents,
            itemCount: newItemCount,
          };
        });
      },

      updateInstructions: (dishId: string, instructions: string) => {
        set((state) => {
          const updatedItems = state.items.map(item =>
            item.dishId === dishId ? { ...item, specialInstructions: instructions } : item
          );
          
          return {
            items: updatedItems,
          };
        });
      },

      clearCart: () => {
        set({ items: [], totalCents: 0, itemCount: 0, branchId: undefined });
      },

      getItemCount: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getTotal: () => {
        const state = get();
        return state.items.reduce((sum, item) => sum + (item.priceCents * item.quantity), 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createCartStorage(),
      partialize: (state) => ({
        items: state.items,
        totalCents: state.totalCents,
        itemCount: state.itemCount,
        branchId: state.branchId,
      }),
    }
  )
);