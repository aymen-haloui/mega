// Force reload data script
// Run this in your browser console (F12) to force reload all data

console.log('=== FORCE RELOADING DATA ===');

// Clear all localStorage
const keysToRemove = [
  'aeh:users', 'aeh:orders', 'aeh:products', 'aeh:branches', 'aeh:categories',
  'users-store', 'orders-store', 'products-store', 'branches-store', 'categories-store',
  'cart-storage', 'auth-store'
];

console.log('Clearing localStorage keys...');
keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log(`Removed: ${key}`);
});

// Clear any cart storage for specific users
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.startsWith('cart-storage-') || key.includes('aeh'))) {
    localStorage.removeItem(key);
    console.log(`Removed additional key: ${key}`);
  }
}

console.log('All data cleared! Reloading page...');
location.reload();
