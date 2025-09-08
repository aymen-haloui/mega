# Frontend API Structure

This directory contains a well-organized API layer for the restaurant management system frontend. Each file corresponds to a specific backend route and provides a clean, type-safe interface for making API calls.

## 📁 File Structure

```
src/api/
├── index.ts              # Main API configuration and exports
├── auth.ts               # Authentication API and helpers
├── users.ts              # User management API and helpers
├── branches.ts           # Branch management API and helpers
├── menus.ts              # Menu management API and helpers
├── dishes.ts             # Dish management API and helpers
├── orders.ts             # Order management API and helpers
├── ingredients.ts        # Ingredient management API and helpers
├── reports.ts            # Reports and analytics API and helpers
├── websocket.ts          # WebSocket connection and real-time events
├── types.ts              # TypeScript type definitions
├── constants.ts          # API constants and configuration
└── README.md             # This documentation
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { API, Helpers } from './api';

// Authentication
const loginResponse = await API.auth.login({
  phone: '+1234567890',
  password: 'password123'
});

// Get users
const users = await API.users.getUsers({
  page: 1,
  limit: 10,
  search: 'john'
});

// Create order
const order = await API.orders.createOrder({
  branchId: 'branch-uuid',
  userName: 'John Doe',
  userPhone: '+1555000001',
  items: [
    { dishId: 'dish-uuid', qty: 2 }
  ]
});
```

### Using Helpers

```typescript
import { Helpers } from './api';

// Format user data
const formattedUser = Helpers.users.formatUserData(user);

// Check if user is suspicious
const isSuspicious = Helpers.users.isSuspiciousUser(user);

// Format order data
const formattedOrder = Helpers.orders.formatOrderData(order);

// Get order status color
const statusColor = Helpers.orders.getStatusColor(order.status);
```

## 📋 API Modules

### 1. Authentication (`auth.ts`)

**API Methods:**
- `login(credentials)` - User login
- `register(userData)` - User registration (Admin only)
- `getCurrentUser()` - Get current user info
- `logout()` - User logout
- `changePassword(data)` - Change password

**Helper Functions:**
- `setAuthData(token, user)` - Store auth data
- `getAuthData()` - Get auth data
- `clearAuthData()` - Clear auth data
- `isAuthenticated()` - Check authentication status
- `isAdmin()` - Check if user is admin
- `isBranchUser()` - Check if user is branch user

### 2. Users (`users.ts`)

**API Methods:**
- `getUsers(params)` - Get users with search/pagination
- `getUserById(id)` - Get user by ID
- `createUser(userData)` - Create new user
- `updateUser(id, userData)` - Update user
- `deleteUser(id)` - Delete user
- `toggleUserBlock(id, data)` - Block/unblock user
- `addUserNotes(id, notes)` - Add notes to user
- `getFraudUsers(params)` - Get fraud users
- `searchUsers(query)` - Quick user search

**Helper Functions:**
- `formatUserData(user)` - Format user for display
- `isSuspiciousUser(user, thresholds)` - Check if user is suspicious
- `getUserRiskLevel(user)` - Get user risk level
- `formatFraudUserData(fraudUser)` - Format fraud user data

### 3. Branches (`branches.ts`)

**API Methods:**
- `getBranches(params)` - Get branches with search/pagination
- `getBranchById(id)` - Get branch by ID
- `createBranch(branchData)` - Create new branch
- `updateBranch(id, branchData)` - Update branch
- `deleteBranch(id)` - Delete branch
- `getNearbyBranches(lat, lng, radius)` - Get nearby branches
- `getBranchStats(id, params)` - Get branch statistics
- `getBranchIncome(params)` - Get branch income report

**Helper Functions:**
- `formatBranchData(branch)` - Format branch for display
- `calculateDistance(lat1, lng1, lat2, lng2)` - Calculate distance
- `formatBranchStats(stats)` - Format branch statistics
- `isNearby(branch, userLat, userLng, maxDistance)` - Check if branch is nearby
- `sortByDistance(branches, userLat, userLng)` - Sort branches by distance

### 4. Orders (`orders.ts`)

**API Methods:**
- `getOrders(params)` - Get orders with filters
- `getOrderById(id)` - Get order by ID
- `createOrder(orderData)` - Create new order
- `updateOrderStatus(id, statusData)` - Update order status
- `cancelOrder(id, reason)` - Cancel order
- `getOrdersByUserPhone(phone, params)` - Get orders by user phone
- `getOrdersFeed(branchId, params)` - Get real-time orders feed
- `getOrderStats(params)` - Get order statistics

**Helper Functions:**
- `formatOrderData(order)` - Format order for display
- `getStatusText(status)` - Get status display text
- `getStatusColor(status)` - Get status color for UI
- `canUpdateStatus(currentStatus, newStatus)` - Check if status can be updated
- `getNextStatuses(currentStatus)` - Get next possible statuses
- `calculateOrderTotal(items)` - Calculate order total
- `formatOrderItems(items)` - Format order items
- `isActiveOrder(status)` - Check if order is active
- `getOrderPriority(order)` - Get order priority

### 5. Menus (`menus.ts`)

**API Methods:**
- `getMenus(params)` - Get menus with filters
- `getMenuById(id)` - Get menu by ID
- `createMenu(menuData)` - Create new menu
- `updateMenu(id, menuData)` - Update menu
- `deleteMenu(id)` - Delete menu
- `getMenuDishes(id, params)` - Get menu dishes
- `getMenuStats(id, params)` - Get menu statistics

**Helper Functions:**
- `formatMenuData(menu)` - Format menu for display
- `hasAvailableDishes(menu)` - Check if menu has available dishes
- `getMenuAvailabilityStatus(menu)` - Get menu availability status
- `formatMenuStats(stats)` - Format menu statistics
- `sortDishes(dishes, sortBy)` - Sort dishes
- `getMenuSummary(menu)` - Get menu summary

### 6. Dishes (`dishes.ts`)

**API Methods:**
- `getDishes(params)` - Get dishes with filters
- `getDishById(id)` - Get dish by ID
- `createDish(dishData)` - Create new dish
- `updateDish(id, dishData)` - Update dish
- `deleteDish(id)` - Delete dish
- `toggleAvailability(id, available)` - Toggle dish availability
- `getDishOrderHistory(id, params)` - Get dish order history
- `getDishStats(id, params)` - Get dish statistics
- `uploadDishImage(id, imageFile)` - Upload dish image

**Helper Functions:**
- `formatDishData(dish)` - Format dish for display
- `hasAllRequiredIngredients(dish)` - Check if dish has all required ingredients
- `getDishAvailabilityStatus(dish)` - Get dish availability status
- `formatDishStats(stats)` - Format dish statistics
- `sortDishes(dishes, sortBy)` - Sort dishes
- `getDishSummary(dish)` - Get dish summary
- `formatIngredients(ingredients)` - Format ingredients
- `canOrderDish(dish)` - Check if dish can be ordered
- `getDishWarnings(dish)` - Get dish warning messages

### 7. Ingredients (`ingredients.ts`)

**API Methods:**
- `getIngredients(params)` - Get ingredients with search
- `getIngredientById(id)` - Get ingredient by ID
- `createIngredient(ingredientData)` - Create new ingredient
- `updateIngredient(id, name)` - Update ingredient
- `deleteIngredient(id)` - Delete ingredient
- `getIngredientAvailability(id)` - Get ingredient availability
- `updateIngredientAvailability(ingredientId, branchId, available)` - Update availability
- `getAvailabilityMap(params)` - Get availability map
- `bulkUpdateAvailability(branchId, updates)` - Bulk update availability
- `getIngredientStats(id, params)` - Get ingredient statistics

**Helper Functions:**
- `formatIngredientData(ingredient)` - Format ingredient for display
- `formatAvailabilityData(availability)` - Format availability data
- `getAvailabilityStatus(ingredient, branchId)` - Get availability status
- `getAvailabilityColor(status)` - Get availability color
- `getAvailabilityText(status)` - Get availability text
- `sortIngredients(ingredients, sortBy)` - Sort ingredients
- `getIngredientSummary(ingredient)` - Get ingredient summary
- `isCriticalIngredient(ingredient, threshold)` - Check if ingredient is critical
- `getCriticalIngredients(ingredients, threshold)` - Get critical ingredients
- `formatAvailabilityMap(mapData)` - Format availability map

### 8. Reports (`reports.ts`)

**API Methods:**
- `getBranchIncome(params)` - Get branch income report
- `getFraudUsers(params)` - Get fraud users
- `exportOrders(params)` - Export orders to CSV
- `exportBranchReport(params)` - Export branch report to CSV
- `getDashboardStats(params)` - Get dashboard statistics
- `getAuditLog(params)` - Get audit log
- `getSalesAnalytics(params)` - Get sales analytics
- `getPopularDishes(params)` - Get popular dishes
- `getCustomerAnalytics(params)` - Get customer analytics

**Helper Functions:**
- `formatBranchIncome(data)` - Format branch income data
- `formatFraudUsers(data)` - Format fraud users data
- `getRiskLevel(user)` - Get risk level
- `getRiskColor(riskLevel)` - Get risk color
- `formatDashboardStats(stats)` - Format dashboard statistics
- `formatAuditLog(logs)` - Format audit log
- `getActionText(action)` - Get action display text
- `getEntityText(entity)` - Get entity display text
- `downloadCSV(blob, filename)` - Download CSV file
- `formatDateRange(startDate, endDate)` - Format date range
- `getPeriodText(period)` - Get period display text
- `calculateGrowth(current, previous)` - Calculate growth percentage
- `formatGrowth(growth)` - Format growth percentage
- `getGrowthColor(growth)` - Get growth color

### 9. WebSocket (`websocket.ts`)

**WebSocket Service:**
- `connect(token)` - Connect to WebSocket server
- `disconnect()` - Disconnect from server
- `joinBranch(branchId)` - Join branch room
- `leaveBranch(branchId)` - Leave branch room
- `isConnected()` - Check connection status
- `getConnectionStatus()` - Get connection status

**React Hooks:**
- `useWebSocket()` - Basic WebSocket hook
- `useWebSocketEvents()` - WebSocket events hook

**Events:**
- `NEW_ORDER` - New order received
- `ORDER_STATUS_UPDATE` - Order status updated
- `INGREDIENT_AVAILABILITY_UPDATE` - Ingredient availability updated
- `SYSTEM_NOTIFICATION` - System notification
- `ERROR` - WebSocket error
- `RECONNECT_FAILED` - Reconnection failed

## 🔧 Configuration

### Environment Variables

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=http://localhost:3001
```

### API Client Configuration

The API client is configured with:
- Automatic token injection
- Request/response interceptors
- Error handling
- Timeout configuration
- CORS support

## 📝 Usage Examples

### Authentication Flow

```typescript
import { API, Helpers } from './api';

// Login
const loginResponse = await API.auth.login({
  phone: '+1234567890',
  password: 'password123'
});

// Store auth data
Helpers.auth.setAuthData(loginResponse.token, loginResponse.user);

// Check if authenticated
if (Helpers.auth.isAuthenticated()) {
  console.log('User is authenticated');
}

// Get current user
const currentUser = await API.auth.getCurrentUser();
```

### Real-time Updates

```typescript
import { useWebSocketEvents } from './api';

const MyComponent = () => {
  const {
    onNewOrder,
    onOrderStatusUpdate,
    connect,
    joinBranch
  } = useWebSocketEvents();

  useEffect(() => {
    // Connect to WebSocket
    connect();

    // Join branch room
    joinBranch('branch-uuid');

    // Listen for new orders
    const unsubscribeNewOrder = onNewOrder((order) => {
      console.log('New order:', order);
    });

    // Listen for order status updates
    const unsubscribeStatusUpdate = onOrderStatusUpdate((update) => {
      console.log('Order status updated:', update);
    });

    return () => {
      unsubscribeNewOrder();
      unsubscribeStatusUpdate();
    };
  }, []);

  return <div>My Component</div>;
};
```

### Error Handling

```typescript
import { API } from './api';

try {
  const users = await API.users.getUsers();
} catch (error) {
  if (error.response?.status === 401) {
    // Handle unauthorized
    Helpers.auth.clearAuthData();
    window.location.href = '/login';
  } else if (error.response?.status === 403) {
    // Handle forbidden
    console.error('Access denied');
  } else {
    // Handle other errors
    console.error('API Error:', error.message);
  }
}
```

### File Upload

```typescript
import { API } from './api';

const uploadDishImage = async (dishId: string, imageFile: File) => {
  try {
    const response = await API.dishes.uploadDishImage(dishId, imageFile);
    console.log('Image uploaded:', response.imageUrl);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### CSV Export

```typescript
import { API, Helpers } from './api';

const exportOrders = async () => {
  try {
    const blob = await API.reports.exportOrders({
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      branchId: 'branch-uuid'
    });
    
    Helpers.reports.downloadCSV(blob, 'orders-2024-01.csv');
  } catch (error) {
    console.error('Export failed:', error);
  }
};
```

## 🎯 Best Practices

1. **Always use the API modules** instead of direct axios calls
2. **Use helper functions** for data formatting and validation
3. **Handle errors appropriately** with try-catch blocks
4. **Use TypeScript types** for better type safety
5. **Implement loading states** for better UX
6. **Use WebSocket events** for real-time updates
7. **Cache frequently used data** to reduce API calls
8. **Implement proper error boundaries** for error handling

## 🔄 Integration with Backend

This frontend API structure is designed to work seamlessly with the backend API routes. Each frontend API module corresponds to a backend route group:

- `auth.ts` ↔ `/api/auth/*`
- `users.ts` ↔ `/api/users/*`
- `branches.ts` ↔ `/api/branches/*`
- `menus.ts` ↔ `/api/menus/*`
- `dishes.ts` ↔ `/api/dishes/*`
- `orders.ts` ↔ `/api/orders/*`
- `ingredients.ts` ↔ `/api/ingredients/*`
- `reports.ts` ↔ `/api/reports/*`

The API client automatically handles authentication, error responses, and data formatting to provide a clean interface for your React components.
