// Algeria Eats Hub - Cart Sync Hook

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

export const useCartSync = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Since clients don't have accounts, we don't need to sync cart with user authentication
    // The cart persists in localStorage without user association
    // Only clear cart if an admin user logs out (optional behavior)
    if (isAuthenticated && user && (user.role === 'ADMIN' || user.role === 'BRANCH_USER')) {
      // Admin users don't use the client cart, so we can clear it
      // This is optional - you might want to keep the cart for admin users too
      // clearCart();
    }
  }, [isAuthenticated, user, clearCart]);
};
