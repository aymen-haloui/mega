import { apiClient } from './index';
import { CreateMenuRequest, UpdateMenuRequest } from '../types';

// Menus API
export const menusAPI = {
  // Get all menus
  getMenus: (params?: { page?: number; limit?: number; branchId?: string; search?: string }): Promise<any> =>
    apiClient.get('/menus', { params }),

  // Get menu by ID
  getMenuById: (id: string): Promise<any> =>
    apiClient.get(`/menus/${id}`),

  // Create new menu
  createMenu: (menuData: CreateMenuRequest): Promise<any> =>
    apiClient.post('/menus', menuData),

  // Update menu
  updateMenu: (id: string, menuData: UpdateMenuRequest): Promise<any> =>
    apiClient.put(`/menus/${id}`, menuData),

  // Delete menu
  deleteMenu: (id: string): Promise<{ message: string }> =>
    apiClient.delete(`/menus/${id}`),

  // Get menu dishes
  getMenuDishes: (id: string, params?: { available?: boolean; search?: string }): Promise<any> =>
    apiClient.get(`/menus/${id}/dishes`, { params }),

  // Get menu statistics
  getMenuStats: (id: string, params?: { startDate?: string; endDate?: string }): Promise<any> =>
    apiClient.get(`/menus/${id}/stats`, { params }),
};

// Menu helper functions
export const menuHelpers = {
  // Format menu data for display
  formatMenuData: (menu: any) => ({
    ...menu,
    displayName: menu.name,
    branchName: menu.branch?.name || 'Unknown Branch',
    dishCount: menu.dishes?.length || 0,
    availableDishCount: menu.dishes?.filter((dish: any) => dish.available).length || 0,
    createdAtFormatted: new Date(menu.createdAt).toLocaleDateString(),
  }),

  // Check if menu has available dishes
  hasAvailableDishes: (menu: any): boolean => {
    return menu.dishes?.some((dish: any) => dish.available) || false;
  },

  // Get menu availability status
  getMenuAvailabilityStatus: (menu: any): 'available' | 'limited' | 'unavailable' => {
    const totalDishes = menu.dishes?.length || 0;
    const availableDishes = menu.dishes?.filter((dish: any) => dish.available).length || 0;
    
    if (availableDishes === 0) return 'unavailable';
    if (availableDishes < totalDishes) return 'limited';
    return 'available';
  },

  // Format menu statistics
  formatMenuStats: (stats: any) => ({
    ...stats,
    totalRevenueFormatted: `$${(stats.totalRevenue || 0) / 100}`,
    averageOrderValueFormatted: `$${(stats.averageOrderValue || 0) / 100}`,
    popularDishes: stats.popularDishes?.map((dish: any) => ({
      ...dish,
      revenueFormatted: `$${(dish.revenue || 0) / 100}`,
    })) || [],
  }),

  // Sort dishes by availability and name
  sortDishes: (dishes: any[]) => {
    return dishes.sort((a, b) => {
      // Available dishes first
      if (a.available && !b.available) return -1;
      if (!a.available && b.available) return 1;
      // Then by name
      return a.name.localeCompare(b.name);
    });
  },

  // Get menu summary
  getMenuSummary: (menu: any) => {
    const totalDishes = menu.dishes?.length || 0;
    const availableDishes = menu.dishes?.filter((dish: any) => dish.available).length || 0;
    const totalPrice = menu.dishes?.reduce((sum: number, dish: any) => sum + dish.priceCents, 0) || 0;
    const averagePrice = totalDishes > 0 ? totalPrice / totalDishes : 0;

    return {
      totalDishes,
      availableDishes,
      unavailableDishes: totalDishes - availableDishes,
      totalPriceFormatted: `$${(totalPrice / 100).toFixed(2)}`,
      averagePriceFormatted: `$${(averagePrice / 100).toFixed(2)}`,
      availabilityPercentage: totalDishes > 0 ? Math.round((availableDishes / totalDishes) * 100) : 0,
    };
  },
};
