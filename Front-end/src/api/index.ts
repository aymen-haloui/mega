// Main API Export File
export { apiClient, default as api } from './index';
export * from './auth';
export * from './users';
export * from './branches';
export * from './menus';
export * from './dishes';
export * from './orders';
export * from './ingredients';
export * from './reports';
export * from './websocket';
export * from './types';
export * from './constants';

// Re-export all API modules for easy importing
import { authAPI, authHelpers } from './auth';
import { usersAPI, userHelpers } from './users';
import { branchesAPI, branchHelpers } from './branches';
import { menusAPI, menuHelpers } from './menus';
import { dishesAPI, dishHelpers } from './dishes';
import { ordersAPI, orderHelpers } from './orders';
import { ingredientsAPI, ingredientHelpers } from './ingredients';
import { reportsAPI, reportHelpers } from './reports';
import { useWebSocket, useWebSocketEvents, WS_EVENTS } from './websocket';

// Combined API object
export const API = {
  auth: authAPI,
  users: usersAPI,
  branches: branchesAPI,
  menus: menusAPI,
  dishes: dishesAPI,
  orders: ordersAPI,
  ingredients: ingredientsAPI,
  reports: reportsAPI,
  websocket: {
    useWebSocket,
    useWebSocketEvents,
    WS_EVENTS,
  },
} as const;

// Combined helpers object
export const Helpers = {
  auth: authHelpers,
  users: userHelpers,
  branches: branchHelpers,
  menus: menuHelpers,
  dishes: dishHelpers,
  orders: orderHelpers,
  ingredients: ingredientHelpers,
  reports: reportHelpers,
} as const;

// Default export
export default API;