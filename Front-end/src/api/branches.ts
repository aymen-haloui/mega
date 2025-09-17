import { apiClient } from './client';
import { CreateBranchRequest, UpdateBranchRequest, BranchIncomeParams } from './types';
import { mockBranches, shouldUseMockData } from './mockData';

// Branches API
export const branchesAPI = {
  // Get all branches
  getBranches: async (params?: { page?: number; limit?: number; search?: string }): Promise<any> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter branches based on params
      let filteredBranches = [...mockBranches];
      
      if (params?.search) {
        const searchLower = params.search.toLowerCase();
        filteredBranches = filteredBranches.filter(branch => 
          branch.name.toLowerCase().includes(searchLower) ||
          branch.address.toLowerCase().includes(searchLower)
        );
      }
      
      return { data: filteredBranches };
    }
    return apiClient.get('/branches', { params });
  },

  // Get branch by ID
  getBranchById: (id: string): Promise<any> =>
    apiClient.get(`/branches/${id}`),

  // Create new branch (Admin only)
  createBranch: async (branchData: CreateBranchRequest): Promise<any> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create new branch with mock data
      const newBranch = {
        id: `branch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...branchData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current-user',
        updatedBy: 'current-user',
      };
      
      // Add to mock data
      mockBranches.push(newBranch);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('mockBranches', JSON.stringify(mockBranches));
      }
      
      return { data: newBranch };
    }
    return apiClient.post('/branches', branchData);
  },

  // Update branch
  updateBranch: async (id: string, branchData: UpdateBranchRequest): Promise<any> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Find and update branch in mock data
      const branchIndex = mockBranches.findIndex(b => b.id === id);
      if (branchIndex === -1) {
        throw new Error('Branch not found');
      }
      
      // Update the branch
      const updatedBranch = {
        ...mockBranches[branchIndex],
        ...branchData,
        updatedAt: new Date().toISOString(),
        updatedBy: 'current-user'
      };
      
      mockBranches[branchIndex] = updatedBranch;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('mockBranches', JSON.stringify(mockBranches));
      }
      
      return { data: updatedBranch };
    }
    return apiClient.put(`/branches/${id}`, branchData);
  },

  // Delete branch (Admin only)
  deleteBranch: async (id: string): Promise<{ message: string }> => {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Remove branch from mock data
      const branchIndex = mockBranches.findIndex(b => b.id === id);
      if (branchIndex === -1) {
        throw new Error('Branch not found');
      }
      
      mockBranches.splice(branchIndex, 1);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('mockBranches', JSON.stringify(mockBranches));
      }
      
      return { message: 'Branch deleted successfully' };
    }
    return apiClient.delete(`/branches/${id}`);
  },

  // Get nearby branches
  getNearbyBranches: (lat: number, lng: number, radius?: number): Promise<any> =>
    apiClient.get(`/branches/nearby/${lat}/${lng}`, { params: { radius } }),

  // Get branch statistics
  getBranchStats: (id: string, params?: { startDate?: string; endDate?: string }): Promise<any> =>
    apiClient.get(`/branches/${id}/stats`, { params }),

  // Get branch income report
  getBranchIncome: (params: BranchIncomeParams): Promise<any> =>
    apiClient.get('/branches/income', { params }),
};

// Branch helper functions
export const branchHelpers = {
  // Format branch data for display
  formatBranchData: (branch: any) => ({
    ...branch,
    displayName: branch.name,
    displayAddress: branch.address,
    coordinates: { lat: branch.lat, lng: branch.lng },
    userCount: branch.users?.length || 0,
    menuCount: branch.menus?.length || 0,
    orderCount: branch._count?.orders || 0,
  }),

  // Calculate distance between two coordinates
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  // Format branch statistics
  formatBranchStats: (stats: any) => ({
    ...stats,
    revenueFormatted: `$${(stats.revenue?.total || 0) / 100}`,
    averageTicketFormatted: `$${(stats.revenue?.average || 0) / 100}`,
    completionRateFormatted: `${stats.orders?.completionRate?.toFixed(1) || 0}%`,
    ordersText: `${stats.orders?.completed || 0} of ${stats.orders?.total || 0} completed`,
  }),

  // Check if branch is nearby
  isNearby: (branch: any, userLat: number, userLng: number, maxDistance: number = 50): boolean => {
    const distance = branchHelpers.calculateDistance(userLat, userLng, branch.lat, branch.lng);
    return distance <= maxDistance;
  },

  // Sort branches by distance
  sortByDistance: (branches: any[], userLat: number, userLng: number) => {
    return branches
      .map(branch => ({
        ...branch,
        distance: branchHelpers.calculateDistance(userLat, userLng, branch.lat, branch.lng)
      }))
      .sort((a, b) => a.distance - b.distance);
  },
};
