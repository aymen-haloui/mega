// Algeria Eats Hub - Cart Debug Component

import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { getUserCartData } from '@/utils/cartUtils';

export const CartDebug = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { items, userId, getItemCount, getTotal } = useCartStore();

  if (!isAuthenticated || !user) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold text-gray-800">Cart Debug - Not Authenticated</h3>
        <p className="text-sm text-gray-600">Please log in to see cart information</p>
      </div>
    );
  }

  const cartData = getUserCartData(user.id);

  return (
    <div className="p-4 bg-gray-100 rounded-lg space-y-2">
      <h3 className="font-bold text-gray-800">Cart Debug Information</h3>
      
      <div className="text-sm space-y-1">
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>User Name:</strong> {user.name}</p>
        <p><strong>Cart User ID:</strong> {userId || 'Not set'}</p>
        <p><strong>Items Count:</strong> {getItemCount()}</p>
        <p><strong>Total:</strong> {getTotal().toLocaleString()} DA</p>
        <p><strong>Items in Cart:</strong> {items.length}</p>
      </div>

      {items.length > 0 && (
        <div className="text-sm">
          <p><strong>Cart Items:</strong></p>
          <ul className="list-disc list-inside ml-2">
            {items.map((item, index) => (
              <li key={index}>
                {item.product.name} x{item.quantity} - {item.price.toLocaleString()} DA
              </li>
            ))}
          </ul>
        </div>
      )}

      {cartData && (
        <div className="text-sm">
          <p><strong>Stored Cart Data:</strong></p>
          <pre className="bg-white p-2 rounded text-xs overflow-auto">
            {JSON.stringify(cartData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
