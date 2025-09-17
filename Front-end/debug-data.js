// Debug script to check data in localStorage
// Run this in your browser console (F12) to debug the data

console.log('=== DEBUGGING DATA ===');

// Check localStorage keys
console.log('All localStorage keys:', Object.keys(localStorage));

// Check users data
const usersData = localStorage.getItem('aeh:users');
console.log('Users data from localStorage:', usersData ? JSON.parse(usersData) : 'No users data');

// Check orders data
const ordersData = localStorage.getItem('aeh:orders');
console.log('Orders data from localStorage:', ordersData ? JSON.parse(ordersData) : 'No orders data');

// Check users store
const usersStore = localStorage.getItem('users-store');
console.log('Users store from localStorage:', usersStore ? JSON.parse(usersStore) : 'No users store');

// Check orders store
const ordersStore = localStorage.getItem('orders-store');
console.log('Orders store from localStorage:', ordersStore ? JSON.parse(ordersStore) : 'No orders store');

// Check specific client ID 9
if (usersData) {
  const users = JSON.parse(usersData);
  const client9 = users.find(u => u.id === '9');
  console.log('Client ID 9:', client9);
}

// Check specific order ID 9
if (ordersData) {
  const orders = JSON.parse(ordersData);
  const order9 = orders.find(o => o.id === '9');
  console.log('Order ID 9:', order9);
}

console.log('=== END DEBUG ===');
