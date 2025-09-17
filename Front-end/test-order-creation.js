// Test script to verify order creation with complete information
// Run this in your browser console (F12) after the page loads

console.log('=== TESTING ORDER CREATION ===');

// Test creating an order with complete information
const testOrder = {
  branchId: '1',
  userId: '9', // Client 'heuss'
  phone: '+213 555 456 789',
  items: [
    { productId: '1', quantity: 2 },
    { productId: '2', quantity: 1 }
  ],
  deliveryAddress: '123 Test Street, Algiers',
  deliveryTime: '30-45 min',
  notes: 'Test order with complete information',
  paymentMethod: 'card'
};

console.log('Test order data:', testOrder);

// Check if ordersService is available
if (typeof window !== 'undefined' && window.ordersService) {
  try {
    const order = window.ordersService.create(testOrder);
    console.log('✅ Order created successfully:', order);
    console.log('Order has delivery address:', order.deliveryAddress);
    console.log('Order has delivery time:', order.deliveryTime);
    console.log('Order has notes:', order.notes);
    console.log('Order has payment method:', order.paymentMethod);
  } catch (error) {
    console.error('❌ Error creating order:', error);
  }
} else {
  console.log('ordersService not available in window object');
}

console.log('=== END TEST ===');
