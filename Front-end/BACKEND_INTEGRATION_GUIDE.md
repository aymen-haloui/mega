# 🚀 Backend Integration Guide

## Step 1: Environment Configuration

Create a `.env` file in your project root:

```bash
# Algeria Eats Hub - Environment Configuration

# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK_DATA=false

# WebSocket Configuration  
VITE_WS_URL=ws://localhost:8080/ws

# Authentication
VITE_JWT_SECRET_KEY=your-jwt-secret-key

# File Upload
VITE_UPLOAD_MAX_SIZE=5242880
VITE_UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,image/webp

# Development Settings
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=info
```

## Step 2: Update API Client Configuration

Your API client in `src/api/client.ts` is already configured to read from environment variables:

```typescript
// This line automatically reads from VITE_API_BASE_URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
```

## Step 3: Disable Mock Data

Update `src/api/mockData.ts`:

```typescript
// Helper function to check if we should use mock data
export const shouldUseMockData = (): boolean => {
  // Read from environment variable
  return import.meta.env.VITE_USE_MOCK_DATA === 'true';
};
```

## Step 4: Backend API Requirements

Your friend's backend must implement these endpoints exactly as defined in `src/api/constants.ts`:

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (Admin only)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/change-password` - Change password

### User Management
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/block` - Block/unblock user

### Branch Management
- `GET /api/branches` - Get all branches
- `POST /api/branches` - Create branch
- `GET /api/branches/:id` - Get branch by ID
- `PUT /api/branches/:id` - Update branch
- `DELETE /api/branches/:id` - Delete branch
- `GET /api/branches/nearby/:lat/:lng` - Get nearby branches

### Menu & Dish Management
- `GET /api/menus` - Get all menus
- `POST /api/menus` - Create menu
- `GET /api/dishes` - Get all dishes
- `POST /api/dishes` - Create dish
- `PUT /api/dishes/:id` - Update dish
- `DELETE /api/dishes/:id` - Delete dish
- `PUT /api/dishes/:id/availability` - Toggle availability

### Order Management
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/user/:phone` - Get orders by user phone
- `GET /api/orders/feed/:branchId` - Get branch order feed

### Ingredient Management
- `GET /api/ingredients` - Get all ingredients
- `POST /api/ingredients` - Create ingredient
- `PUT /api/ingredients/:id/availability` - Update ingredient availability

## Step 5: Data Schema Requirements

Your backend must use the exact same data structures defined in `src/types/index.ts`:

### User Schema
```typescript
interface User {
  id: string;
  name: string;
  phone: string;
  role: 'ADMIN' | 'BRANCH_USER';
  branchId?: string;
  branch?: Branch;
  password?: string;
  createdAt: string;
  updatedAt: string;
  isBlocked: boolean;
  // ... other fields
}
```

### Order Schema
```typescript
interface Order {
  id: string;
  orderNumber: number;
  branchId: string;
  branch: Branch;
  userName: string;
  userPhone: string;
  items: OrderItem[];
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'CANCELED';
  totalCents: number;
  createdAt: string;
  updatedAt: string;
  // ... other fields
}
```

### Dish Schema
```typescript
interface Dish {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  priceCents: number;
  menuId: string;
  menu: Menu;
  ingredients?: DishIngredient[];
  available: boolean;
  createdAt: string;
  updatedAt: string;
  // ... other fields
}
```

## Step 6: Authentication Flow

Your backend must implement JWT authentication:

1. **Login Request:**
```typescript
POST /api/auth/login
{
  "phone": "+213555000001",
  "password": "admin123"
}
```

2. **Login Response:**
```typescript
{
  "user": {
    "id": "1",
    "name": "Admin General",
    "phone": "+213555000001",
    "role": "ADMIN",
    // ... other user fields
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

3. **Protected Requests:**
All API requests must include the JWT token in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 7: WebSocket Integration (Optional)

For real-time order updates, implement WebSocket endpoints:

```typescript
// WebSocket Events
WS_EVENTS = {
  NEW_ORDER: 'new-order',
  ORDER_STATUS_UPDATE: 'order-status-update',
  INGREDIENT_AVAILABILITY_UPDATE: 'ingredient-availability-update',
  SYSTEM_NOTIFICATION: 'system-notification',
}
```

## Step 8: File Upload Support

For dish images, implement file upload:

```typescript
POST /api/dishes/:id/upload-image
Content-Type: multipart/form-data

FormData: {
  image: File
}

Response: {
  imageUrl: "https://your-domain.com/images/dish-123.jpg"
}
```

## Step 9: Error Handling

Your backend must return consistent error responses:

```typescript
// Error Response Format
{
  "success": false,
  "message": "Error description",
  "status": 400,
  "data": null
}

// Success Response Format
{
  "success": true,
  "message": "Success message",
  "data": { /* actual data */ }
}
```

## Step 10: Testing the Connection

Once your backend is ready:

1. **Update Environment:**
```bash
# .env
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=http://your-backend-url/api
```

2. **Test Authentication:**
```bash
curl -X POST http://your-backend-url/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone": "+213555000001", "password": "admin123"}'
```

3. **Test Protected Endpoints:**
```bash
curl -X GET http://your-backend-url/api/users \
  -H "Authorization: Bearer your-jwt-token"
```

## Step 11: Deployment Configuration

### Development
```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_USE_MOCK_DATA=false
```

### Production
```bash
VITE_API_BASE_URL=https://your-production-api.com/api
VITE_USE_MOCK_DATA=false
```

## Step 12: Database Migration

Your friend should create database tables matching your schema:

### Users Table
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  role ENUM('ADMIN', 'BRANCH_USER') NOT NULL,
  branch_id VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  is_blocked BOOLEAN DEFAULT FALSE,
  notes TEXT,
  cancellation_count INT DEFAULT 0,
  no_show_count INT DEFAULT 0,
  last_order_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);
```

### Branches Table
```sql
CREATE TABLE branches (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id VARCHAR(255) PRIMARY KEY,
  order_number INT AUTO_INCREMENT UNIQUE,
  branch_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_phone VARCHAR(20) NOT NULL,
  status ENUM('PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELED') DEFAULT 'PENDING',
  total_cents INT NOT NULL,
  canceled BOOLEAN DEFAULT FALSE,
  cancel_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);
```

### Dishes Table
```sql
CREATE TABLE dishes (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  price_cents INT NOT NULL,
  menu_id VARCHAR(255) NOT NULL,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  updated_by VARCHAR(255)
);
```

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Backend must enable CORS for your frontend domain
   - Include credentials in CORS configuration

2. **Authentication Errors:**
   - Verify JWT token format and expiration
   - Check Authorization header format

3. **Data Format Mismatches:**
   - Ensure backend returns data in exact same format as mock data
   - Check date formats (ISO 8601 strings)
   - Verify price format (cents as integers)

4. **Missing Endpoints:**
   - Implement all endpoints from `src/api/constants.ts`
   - Match exact URL patterns and HTTP methods

### Testing Commands:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Your frontend is already perfectly structured to work with a real backend. Just follow these steps and your friend's backend will integrate seamlessly! 🚀
