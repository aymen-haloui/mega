// Algeria Eats Hub - Cart Utilities

import { CartItem } from '@/types';

/**
 * Get all cart storage keys for a specific user
 */
export const getUserCartKeys = (userId: string): string[] => {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('cart-storage-') && key.endsWith(`-${userId}`)) {
      keys.push(key);
    }
  }
  return keys;
};

/**
 * Clear all cart data for a specific user
 */
export const clearUserCartData = (userId: string): void => {
  const cartKeys = getUserCartKeys(userId);
  cartKeys.forEach(key => {
    localStorage.removeItem(key);
  });
};

/**
 * Get cart data for a specific user
 */
export const getUserCartData = (userId: string): any => {
  const cartKey = `cart-storage-${userId}`;
  try {
    const data = localStorage.getItem(cartKey);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting user cart data:', error);
    return null;
  }
};

/**
 * Validate cart item structure
 */
export const validateCartItem = (item: any): item is CartItem => {
  return (
    item &&
    typeof item.dishId === 'string' &&
    typeof item.quantity === 'number' &&
    typeof item.priceCents === 'number' &&
    item.dish &&
    typeof item.dish.id === 'string' &&
    typeof item.dish.name === 'string'
  );
};

/**
 * Clean up invalid cart items
 */
export const cleanCartItems = (items: any[]): CartItem[] => {
  return items.filter(validateCartItem);
};
