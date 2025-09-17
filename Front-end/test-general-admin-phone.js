// Test script to verify phone numbers display in general admin
// Run this in your browser console (F12) after the page loads

console.log('=== TESTING GENERAL ADMIN PHONE DISPLAY ===');

// Check if orders have phone numbers
const ordersData = localStorage.getItem('aeh:orders');
if (ordersData) {
  const orders = JSON.parse(ordersData);
  console.log('📦 Orders in localStorage:', orders.length);
  
  orders.forEach(order => {
    console.log(`Order #${order.id}:`, {
      phone: order.phone,
      clientId: order.clientId,
      deliveryAddress: order.deliveryAddress
    });
  });
  
  // Check if orders have phone numbers
  const ordersWithPhone = orders.filter(o => o.phone && o.phone !== 'N/A');
  console.log('✅ Orders with phone numbers:', ordersWithPhone.length);
  
  const ordersWithoutPhone = orders.filter(o => !o.phone || o.phone === 'N/A');
  console.log('❌ Orders without phone numbers:', ordersWithoutPhone.length);
  
} else {
  console.log('No orders data found in localStorage');
}

// Check users data
const usersData = localStorage.getItem('aeh:users');
if (usersData) {
  const users = JSON.parse(usersData);
  console.log('👥 Users in localStorage:', users.length);
  
  const usersWithPhone = users.filter(u => u.phone && u.phone !== 'N/A');
  console.log('✅ Users with phone numbers:', usersWithPhone.length);
}

console.log('=== END GENERAL ADMIN PHONE TEST ===');
