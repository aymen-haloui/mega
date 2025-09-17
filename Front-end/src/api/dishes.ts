import { apiClient } from './client';
import { CreateDishRequest, UpdateDishRequest } from './types';
import { mockDishes, shouldUseMockData } from './mockData';

// Dishes API
export const dishesAPI = {
  // Get all dishes
  getDishes: async (params?: { 
    page?: number; 
    limit?: number; 
    menuId?: string; 
    branchId?: string; 
    available?: boolean; 
    search?: string 
  }): Promise<any> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get dishes from localStorage or use default mock data
      let filteredDishes = mockDishes;
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('mockDishes');
        if (stored) {
          filteredDishes = JSON.parse(stored);
        }
      }
      
      // Apply filters
      if (params?.branchId) {
        filteredDishes = filteredDishes.filter(dish => dish.menu.branchId === params.branchId);
      }
      if (params?.available !== undefined) {
        filteredDishes = filteredDishes.filter(dish => dish.available === params.available);
      }
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        filteredDishes = filteredDishes.filter(dish => 
          dish.name.toLowerCase().includes(searchLower) ||
          dish.description?.toLowerCase().includes(searchLower)
        );
      }
      
      return { data: filteredDishes };
    }
    return apiClient.get('/dishes', { params });
  },

  // Get dish by ID
  getDishById: (id: string): Promise<any> =>
    apiClient.get(`/dishes/${id}`),

  // Create new dish
  createDish: async (dishData: CreateDishRequest): Promise<any> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find the correct branch and menu for the dish
      const { mockBranches, mockMenus } = await import('./mockData');
      const targetBranch = mockBranches.find(b => b.id === dishData.menuId) || mockBranches[0];
      const targetMenu = mockMenus.find(m => m.branchId === targetBranch.id) || mockMenus[0];
      
      // Create new dish with mock data
      const newDish = {
        id: `dish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...dishData,
        available: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user',
        updatedBy: 'current-user',
        menu: {
          id: targetMenu.id,
          name: targetMenu.name,
          branchId: targetBranch.id,
          branch: targetBranch,
          createdAt: targetMenu.createdAt,
          updatedAt: targetMenu.updatedAt,
          createdBy: targetMenu.createdBy,
          updatedBy: targetMenu.updatedBy,
        },
        ingredients: dishData.ingredients?.map(ing => ({
          ...ing,
          ingredient: {
            id: ing.ingredientId,
            name: `Ingredient ${ing.ingredientId}`,
            category: 'General',
            available: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: 'system',
            updatedBy: 'system',
          }
        })) || []
      };
      
      // Store in localStorage for persistence
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('mockDishes');
        const existingDishes = stored ? JSON.parse(stored) : [];
        const updatedDishes = [...existingDishes, newDish];
        localStorage.setItem('mockDishes', JSON.stringify(updatedDishes));
      }
      
      return { data: newDish };
    }
    return apiClient.post('/dishes', dishData);
  },

  // Update dish
  updateDish: async (id: string, dishData: UpdateDishRequest): Promise<any> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update dish in localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('mockDishes');
        if (stored) {
          const existingDishes = JSON.parse(stored);
          const dishIndex = existingDishes.findIndex((dish: any) => dish.id === id);
          
          if (dishIndex !== -1) {
            // Update the dish
            const updatedDish = {
              ...existingDishes[dishIndex],
              ...dishData,
              updatedAt: new Date().toISOString(),
              updatedBy: 'current-user'
            };
            
            existingDishes[dishIndex] = updatedDish;
            localStorage.setItem('mockDishes', JSON.stringify(existingDishes));
            
            return { data: updatedDish };
          }
        }
      }
      
      // If not found in localStorage, return the updated data
      return { data: { id, ...dishData, updatedAt: new Date().toISOString() } };
    }
    return apiClient.put(`/dishes/${id}`, dishData);
  },

  // Delete dish
  deleteDish: async (id: string): Promise<{ message: string }> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove dish from localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('mockDishes');
        if (stored) {
          const existingDishes = JSON.parse(stored);
          const filteredDishes = existingDishes.filter((dish: any) => dish.id !== id);
          localStorage.setItem('mockDishes', JSON.stringify(filteredDishes));
        }
      }
      
      return { message: 'Dish deleted successfully' };
    }
    return apiClient.delete(`/dishes/${id}`);
  },

  // Toggle dish availability
  toggleAvailability: async (id: string, available: boolean): Promise<any> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update dish availability in localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('mockDishes');
        if (stored) {
          const existingDishes = JSON.parse(stored);
          const dishIndex = existingDishes.findIndex((dish: any) => dish.id === id);
          
          if (dishIndex !== -1) {
            existingDishes[dishIndex].available = available;
            existingDishes[dishIndex].updatedAt = new Date().toISOString();
            localStorage.setItem('mockDishes', JSON.stringify(existingDishes));
            
            return { data: existingDishes[dishIndex] };
          }
        }
      }
      
      return { data: { id, available, updatedAt: new Date().toISOString() } };
    }
    return apiClient.put(`/dishes/${id}/availability`, { available });
  },

  // Get dish order history
  getDishOrderHistory: (id: string, params?: { 
    page?: number; 
    limit?: number; 
    startDate?: string; 
    endDate?: string 
  }): Promise<any> =>
    apiClient.get(`/dishes/${id}/orders`, { params }),

  // Get dish statistics
  getDishStats: (id: string, params?: { startDate?: string; endDate?: string }): Promise<any> =>
    apiClient.get(`/dishes/${id}/stats`, { params }),

  // Upload dish image
  uploadDishImage: (id: string, imageFile: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return apiClient.post(`/dishes/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Dish helper functions
export const dishHelpers = {
  // Format dish data for display
  formatDishData: (dish: any) => ({
    ...dish,
    priceFormatted: `$${(dish.priceCents / 100).toFixed(2)}`,
    createdAtFormatted: new Date(dish.createdAt).toLocaleDateString(),
    updatedAtFormatted: new Date(dish.updatedAt).toLocaleDateString(),
    availabilityText: dish.available ? 'Available' : 'Unavailable',
    availabilityColor: dish.available ? 'green' : 'red',
    ingredientsText: dish.ingredients?.map((ing: any) => ing.ingredient.name).join(', ') || 'No ingredients',
    ingredientsCount: dish.ingredients?.length || 0,
    menuName: dish.menu?.name || 'Unknown Menu',
    branchName: dish.menu?.branch?.name || 'Unknown Branch',
  }),

  // Check if dish has all required ingredients available
  hasAllRequiredIngredients: (dish: any): boolean => {
    if (!dish.ingredients) return true;
    return dish.ingredients.every((ing: any) => !ing.required || ing.ingredient.available);
  },

  // Get dish availability status
  getDishAvailabilityStatus: (dish: any): 'available' | 'unavailable' | 'partial' => {
    if (!dish.ingredients || dish.ingredients.length === 0) return 'available';
    
    const requiredIngredients = dish.ingredients.filter((ing: any) => ing.required);
    const availableRequired = requiredIngredients.filter((ing: any) => ing.ingredient.available);
    
    if (availableRequired.length === requiredIngredients.length) return 'available';
    if (availableRequired.length === 0) return 'unavailable';
    return 'partial';
  },

  // Format dish statistics
  formatDishStats: (stats: any) => ({
    ...stats,
    totalRevenueFormatted: `$${(stats.totalRevenue || 0) / 100}`,
    averagePriceFormatted: `$${(stats.averagePrice || 0) / 100}`,
    totalOrdersFormatted: stats.totalOrders?.toLocaleString() || '0',
    popularityScore: stats.popularityScore || 0,
  }),

  // Sort dishes by availability and price
  sortDishes: (dishes: any[], sortBy: 'name' | 'price' | 'availability' | 'created' = 'name') => {
    return dishes.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.priceCents - b.priceCents;
        case 'availability':
          if (a.available && !b.available) return -1;
          if (!a.available && b.available) return 1;
          return 0;
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  },

  // Get dish summary
  getDishSummary: (dish: any) => {
    const ingredients = dish.ingredients || [];
    const requiredIngredients = ingredients.filter((ing: any) => ing.required);
    const availableRequired = requiredIngredients.filter((ing: any) => ing.ingredient.available);
    
    return {
      totalIngredients: ingredients.length,
      requiredIngredients: requiredIngredients.length,
      availableRequired: availableRequired.length,
      missingRequired: requiredIngredients.length - availableRequired.length,
      availabilityPercentage: requiredIngredients.length > 0 
        ? Math.round((availableRequired.length / requiredIngredients.length) * 100) 
        : 100,
      canMake: availableRequired.length === requiredIngredients.length,
    };
  },

  // Format ingredients for display
  formatIngredients: (ingredients: any[]) => {
    return ingredients.map(ing => ({
      ...ing,
      requiredText: ing.required ? 'Required' : 'Optional',
      qtyText: ing.qtyUnit ? `${ing.qtyUnit} units` : 'No quantity specified',
      availableText: ing.ingredient.available ? 'Available' : 'Unavailable',
      availableColor: ing.ingredient.available ? 'green' : 'red',
    }));
  },

  // Check if dish can be ordered
  canOrderDish: (dish: any): boolean => {
    return dish.available && dishHelpers.hasAllRequiredIngredients(dish);
  },

  // Get dish warning messages
  getDishWarnings: (dish: any): string[] => {
    const warnings = [];
    
    if (!dish.available) {
      warnings.push('Dish is currently unavailable');
    }
    
    if (!dishHelpers.hasAllRequiredIngredients(dish)) {
      warnings.push('Some required ingredients are not available');
    }
    
    if (dish.ingredients?.length === 0) {
      warnings.push('No ingredients specified');
    }
    
    return warnings;
  },
};
