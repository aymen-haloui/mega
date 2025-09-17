import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Category } from '@/types';

interface CategoriesStoreState {
  categories: Category[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  getCategoriesByColor: (color: string) => Category[];
}

export const useCategoriesStore = create<CategoriesStoreState>()(
  persist(
    (set, get) => ({
      categories: [],
      loaded: false,
      loading: false,
      error: null,

      load: async () => {
        set({ loading: true, error: null });
        try {
          const stored = localStorage.getItem('categories');
          if (stored) {
            const categories = JSON.parse(stored);
            set({ categories, loaded: true, loading: false });
          } else {
            // Initialize with default categories
            const defaultCategories: Category[] = [
              {
                id: 'cat_1',
                name: 'Pizzas',
                description: 'Pizzas traditionnelles et spéciales',
                icon: '🍕',
                color: '#FF6B6B'
              },
              {
                id: 'cat_2',
                name: 'Pâtes',
                description: 'Pâtes fraîches et sauces maison',
                icon: '🍝',
                color: '#4ECDC4'
              },
              {
                id: 'cat_3',
                name: 'Salades',
                description: 'Salades fraîches et équilibrées',
                icon: '🥗',
                color: '#45B7D1'
              },
              {
                id: 'cat_4',
                name: 'Boissons',
                description: 'Boissons chaudes et froides',
                icon: '🥤',
                color: '#96CEB4'
              },
              {
                id: 'cat_5',
                name: 'Desserts',
                description: 'Desserts sucrés et gourmands',
                icon: '🍰',
                color: '#FFEAA7'
              },
              {
                id: 'cat_6',
                name: 'Entrées',
                description: 'Entrées et apéritifs',
                icon: '🥖',
                color: '#DDA0DD'
              }
            ];
            set({ categories: defaultCategories, loaded: true, loading: false });
            localStorage.setItem('categories', JSON.stringify(defaultCategories));
          }
        } catch (error: any) {
          set({ error: error.message, loading: false });
        }
      },

      addCategory: async (categoryData) => {
        const newCategory: Category = {
          ...categoryData,
          id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        };

        set((state) => {
          const updatedCategories = [...state.categories, newCategory];
          localStorage.setItem('categories', JSON.stringify(updatedCategories));
          return { categories: updatedCategories };
        });

        return newCategory;
      },

      updateCategory: async (id: string, categoryData) => {
        set((state) => {
          const updatedCategories = state.categories.map(category =>
            category.id === id ? { ...category, ...categoryData } : category
          );
          localStorage.setItem('categories', JSON.stringify(updatedCategories));
          return { categories: updatedCategories };
        });

        const updatedCategory = get().categories.find(cat => cat.id === id);
        if (!updatedCategory) throw new Error('Category not found');
        return updatedCategory;
      },

      deleteCategory: async (id: string) => {
        set((state) => {
          const updatedCategories = state.categories.filter(category => category.id !== id);
          localStorage.setItem('categories', JSON.stringify(updatedCategories));
          return { categories: updatedCategories };
        });
      },

      getCategoryById: (id: string) => {
        const { categories } = get();
        return categories.find(category => category.id === id);
      },

      getCategoriesByColor: (color: string) => {
        const { categories } = get();
        return categories.filter(category => category.color === color);
      },
    }),
    {
      name: 'categories-storage',
      partialize: (state) => ({ categories: state.categories }),
    }
  )
);

