import { apiClient } from './index';
import { CreateDishRequest, UpdateDishRequest } from '../types';

// Dishes API
export const dishesAPI = {
  // Get all dishes
  getDishes: (params?: { 
    page?: number; 
    limit?: number; 
    menuId?: string; 
    branchId?: string; 
    available?: boolean; 
    search?: string 
  }): Promise<any> =>
    apiClient.get('/dishes', { params }),

  // Get dish by ID
  getDishById: (id: string): Promise<any> =>
    apiClient.get(`/dishes/${id}`),

  // Create new dish
  createDish: (dishData: CreateDishRequest): Promise<any> =>
    apiClient.post('/dishes', dishData),

  // Update dish
  updateDish: (id: string, dishData: UpdateDishRequest): Promise<any> =>
    apiClient.put(`/dishes/${id}`, dishData),

  // Delete dish
  deleteDish: (id: string): Promise<{ message: string }> =>
    apiClient.delete(`/dishes/${id}`),

  // Toggle dish availability
  toggleAvailability: (id: string, available: boolean): Promise<any> =>
    apiClient.put(`/dishes/${id}/availability`, { available }),

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
