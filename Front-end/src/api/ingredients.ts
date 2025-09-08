import { apiClient } from './index';
import { CreateIngredientRequest, IngredientAvailabilityResponse } from '../types';

// Ingredients API
export const ingredientsAPI = {
  // Get all ingredients
  getIngredients: (params?: { page?: number; limit?: number; search?: string }): Promise<any> =>
    apiClient.get('/ingredients', { params }),

  // Get ingredient by ID
  getIngredientById: (id: string): Promise<any> =>
    apiClient.get(`/ingredients/${id}`),

  // Create new ingredient (Admin only)
  createIngredient: (ingredientData: CreateIngredientRequest): Promise<any> =>
    apiClient.post('/ingredients', ingredientData),

  // Update ingredient (Admin only)
  updateIngredient: (id: string, name: string): Promise<any> =>
    apiClient.put(`/ingredients/${id}`, { name }),

  // Delete ingredient (Admin only)
  deleteIngredient: (id: string): Promise<{ message: string }> =>
    apiClient.delete(`/ingredients/${id}`),

  // Get ingredient availability across branches
  getIngredientAvailability: (id: string): Promise<IngredientAvailabilityResponse> =>
    apiClient.get(`/ingredients/${id}/availability`),

  // Update ingredient availability for a branch
  updateIngredientAvailability: (ingredientId: string, branchId: string, available: boolean): Promise<any> =>
    apiClient.put(`/ingredients/${ingredientId}/availability/${branchId}`, { available }),

  // Get availability map (heatmap data)
  getAvailabilityMap: (params?: { branchId?: string }): Promise<any> =>
    apiClient.get('/ingredients/availability/map', { params }),

  // Bulk update ingredient availability
  bulkUpdateAvailability: (branchId: string, updates: Array<{ ingredientId: string; available: boolean }>): Promise<any> =>
    apiClient.put('/ingredients/bulk-availability', { branchId, updates }),

  // Get ingredient statistics
  getIngredientStats: (id: string, params?: { startDate?: string; endDate?: string }): Promise<any> =>
    apiClient.get(`/ingredients/${id}/stats`, { params }),
};

// Ingredient helper functions
export const ingredientHelpers = {
  // Format ingredient data for display
  formatIngredientData: (ingredient: any) => ({
    ...ingredient,
    displayName: ingredient.name,
    createdAtFormatted: new Date(ingredient.createdAt).toLocaleDateString(),
    dishCount: ingredient.dishLinks?.length || 0,
    branchCount: ingredient.branchAvails?.length || 0,
  }),

  // Format availability data
  formatAvailabilityData: (availability: IngredientAvailabilityResponse) => ({
    ...availability,
    totalBranches: availability.branches.length,
    availableBranches: availability.branches.filter(b => b.available).length,
    unavailableBranches: availability.branches.filter(b => !b.available).length,
    availabilityPercentage: availability.branches.length > 0 
      ? Math.round((availability.branches.filter(b => b.available).length / availability.branches.length) * 100)
      : 0,
  }),

  // Get ingredient availability status
  getAvailabilityStatus: (ingredient: any, branchId?: string): 'available' | 'unavailable' | 'partial' => {
    if (!ingredient.branchAvails || ingredient.branchAvails.length === 0) return 'unavailable';
    
    const availabilities = ingredient.branchAvails;
    const availableCount = availabilities.filter(av => av.available).length;
    const totalCount = availabilities.length;
    
    if (branchId) {
      const branchAvailability = availabilities.find(av => av.branchId === branchId);
      return branchAvailability?.available ? 'available' : 'unavailable';
    }
    
    if (availableCount === 0) return 'unavailable';
    if (availableCount === totalCount) return 'available';
    return 'partial';
  },

  // Get availability color for UI
  getAvailabilityColor: (status: 'available' | 'unavailable' | 'partial'): string => {
    const colorMap = {
      available: 'green',
      unavailable: 'red',
      partial: 'orange',
    };
    return colorMap[status] || 'gray';
  },

  // Get availability text
  getAvailabilityText: (status: 'available' | 'unavailable' | 'partial'): string => {
    const textMap = {
      available: 'Available',
      unavailable: 'Unavailable',
      partial: 'Partially Available',
    };
    return textMap[status] || 'Unknown';
  },

  // Sort ingredients by availability and name
  sortIngredients: (ingredients: any[], sortBy: 'name' | 'availability' | 'usage' = 'name') => {
    return ingredients.sort((a, b) => {
      switch (sortBy) {
        case 'availability':
          const aStatus = ingredientHelpers.getAvailabilityStatus(a);
          const bStatus = ingredientHelpers.getAvailabilityStatus(b);
          const statusOrder = { available: 0, partial: 1, unavailable: 2 };
          return statusOrder[aStatus] - statusOrder[bStatus];
        case 'usage':
          const aUsage = a.dishLinks?.length || 0;
          const bUsage = b.dishLinks?.length || 0;
          return bUsage - aUsage;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });
  },

  // Get ingredient summary
  getIngredientSummary: (ingredient: any) => {
    const availabilities = ingredient.branchAvails || [];
    const availableCount = availabilities.filter(av => av.available).length;
    const totalCount = availabilities.length;
    
    return {
      totalBranches: totalCount,
      availableBranches: availableCount,
      unavailableBranches: totalCount - availableCount,
      availabilityPercentage: totalCount > 0 ? Math.round((availableCount / totalCount) * 100) : 0,
      usageCount: ingredient.dishLinks?.length || 0,
      status: ingredientHelpers.getAvailabilityStatus(ingredient),
    };
  },

  // Check if ingredient is critical
  isCriticalIngredient: (ingredient: any, threshold: number = 0.5): boolean => {
    const summary = ingredientHelpers.getIngredientSummary(ingredient);
    return summary.availabilityPercentage < (threshold * 100);
  },

  // Get critical ingredients
  getCriticalIngredients: (ingredients: any[], threshold: number = 0.5): any[] => {
    return ingredients.filter(ingredient => 
      ingredientHelpers.isCriticalIngredient(ingredient, threshold)
    );
  },

  // Format availability map data
  formatAvailabilityMap: (mapData: any[]) => {
    return mapData.map(item => ({
      ...item,
      ingredient: item.ingredient,
      totalBranches: item.branches.length,
      availableBranches: item.branches.filter((b: any) => b.available).length,
      availabilityPercentage: item.branches.length > 0 
        ? Math.round((item.branches.filter((b: any) => b.available).length / item.branches.length) * 100)
        : 0,
      status: item.branches.length > 0 
        ? (item.branches.filter((b: any) => b.available).length === item.branches.length ? 'available' : 'partial')
        : 'unavailable',
    }));
  },
};
