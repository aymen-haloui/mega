// Clear localStorage script
// Run this in browser console to clear all stored data

console.log('Clearing localStorage...');

// Clear all relevant localStorage keys
localStorage.removeItem('aeh:users');
localStorage.removeItem('aeh:orders');
localStorage.removeItem('aeh:branches');
localStorage.removeItem('aeh:products');
localStorage.removeItem('users-store');
localStorage.removeItem('orders-store');
localStorage.removeItem('branches-store');
localStorage.removeItem('products-store');

console.log('localStorage cleared! Reloading page...');

// Reload the page
location.reload();
