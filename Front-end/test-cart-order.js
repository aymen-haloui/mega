// Test script to verify cart order creation
// Run this in your browser console (F12) after the page loads

console.log('=== TESTING CART ORDER CREATION ===');

// Test data that should be saved
const testCartOrder = {
  branchId: '1',
  userId: '9', // Client 'heuss'
  phone: '+213 555 456 789',
  deliveryAddress: '123 Test Street, Algiers, Algeria',
  deliveryTime: '30-45 min',
  notes: 'Please ring the doorbell and call when you arrive',
  paymentMethod: 'cash',
  items: [
    { productId: '1', quantity: 2 },
    { productId: '2', quantity: 1 }
  ]
};

console.log('Test cart order data:', testCartOrder);

// Check if ordersService is available
if (typeof window !== 'undefined' && window.ordersService) {
  try {
    const order = window.ordersService.create(testCartOrder);
    console.log('✅ Cart order created successfully:', order);
    console.log('✅ Delivery address saved:', order.deliveryAddress);
    console.log('✅ Phone number saved:', order.phone);
    console.log('✅ Notes saved:', order.notes);
    console.log('✅ Payment method saved:', order.paymentMethod);
    console.log('✅ Delivery time saved:', order.deliveryTime);
  } catch (error) {
    console.error('❌ Error creating cart order:', error);
  }
} else {
  console.log('ordersService not available in window object');
}

// Check localStorage for orders
const ordersData = localStorage.getItem('aeh:orders');
if (ordersData) {
  const orders = JSON.parse(ordersData);
  console.log('📦 Orders in localStorage:', orders.length);
  const latestOrder = orders[0]; // Most recent order
  if (latestOrder) {
    console.log('📦 Latest order details:', {
      id: latestOrder.id,
      deliveryAddress: latestOrder.deliveryAddress,
      phone: latestOrder.phone,
      notes: latestOrder.notes,
      paymentMethod: latestOrder.paymentMethod
    });
  }
}

console.log('=== END CART ORDER TEST ===');
