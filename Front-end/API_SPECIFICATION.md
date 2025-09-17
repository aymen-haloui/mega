# 📋 Algeria Eats Hub - API Specification

This document provides the complete API specification that the backend must implement to work with the frontend.

## 🔐 Authentication

### JWT Token Format
```json
{
  "user": {
    "id": "string",
    "name": "string", 
    "phone": "string",
    "role": "ADMIN" | "BRANCH_USER",
    "branchId": "string" | null,
    "branch": "Branch" | null
  },
  "token": "string"
}
```

### Protected Routes
All API endpoints except `/auth/login` require JWT authentication:
```
Authorization: Bearer <jwt-token>
```

## 🛡️ API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
Login user and get JWT token.

**Request:**
```json
{
  "phone": "+213555000001",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "1",
      "name": "Admin General",
      "phone": "+213555000001",
      "role": "ADMIN",
      "branchId": null,
      "branch": null,
      "isBlocked": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET /api/auth/me
Get current authenticated user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Admin General",
    "phone": "+213555000001",
    "role": "ADMIN",
    // ... other user fields
  }
}
```

#### POST /api/auth/logout
Logout current user (invalidate token).

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### User Management

#### GET /api/users
Get all users (Admin only).

**Query Parameters:**
- `page`: number (optional, default: 1)
- `limit`: number (optional, default: 10)
- `search`: string (optional)
- `role`: "ADMIN" | "BRANCH_USER" (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Admin General",
      "phone": "+213555000001",
      "role": "ADMIN",
      "branchId": null,
      "branch": null,
      "isBlocked": false,
      "notes": "System administrator",
      "cancellationCount": 0,
      "noShowCount": 0,
      "lastOrderAt": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "createdBy": "system",
      "updatedBy": "system"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

#### POST /api/users
Create new user (Admin only).

**Request:**
```json
{
  "name": "New Branch Manager",
  "phone": "+213555000004",
  "role": "BRANCH_USER",
  "branchId": "1",
  "password": "password123",
  "notes": "Manager for Centre Ville branch"
}
```

#### PUT /api/users/:id
Update user (Admin only).

#### DELETE /api/users/:id
Delete user (Admin only).

#### PUT /api/users/:id/block
Block/unblock user (Admin only).

**Request:**
```json
{
  "isBlocked": true,
  "reason": "Suspicious activity"
}
```

### Branch Management

#### GET /api/branches
Get all branches.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Mega Pizza - Centre Ville",
      "address": "123 Rue de la Paix, Alger",
      "lat": 36.7538,
      "lng": 3.0588,
      "users": [],
      "menus": [],
      "orders": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/branches
Create new branch (Admin only).

**Request:**
```json
{
  "name": "Mega Pizza - New Location",
  "address": "456 Avenue Example, Algiers",
  "lat": 36.7538,
  "lng": 3.0588
}
```

#### GET /api/branches/:id
Get branch by ID.

#### PUT /api/branches/:id
Update branch (Admin only).

#### DELETE /api/branches/:id
Delete branch (Admin only).

#### GET /api/branches/nearby/:lat/:lng
Get nearby branches.

**Query Parameters:**
- `radius`: number (optional, default: 50km)

### Menu Management

#### GET /api/menus
Get all menus.

**Query Parameters:**
- `branchId`: string (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Menu Principal",
      "branchId": "1",
      "branch": {
        "id": "1",
        "name": "Mega Pizza - Centre Ville",
        // ... branch details
      },
      "dishes": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/menus
Create new menu.

#### GET /api/menus/:id
Get menu by ID.

#### PUT /api/menus/:id
Update menu.

#### DELETE /api/menus/:id
Delete menu.

### Dish Management

#### GET /api/dishes
Get all dishes.

**Query Parameters:**
- `page`: number (optional)
- `limit`: number (optional)
- `menuId`: string (optional)
- `branchId`: string (optional)
- `available`: boolean (optional)
- `search`: string (optional)
- `category`: string (optional)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Pizza Margherita",
      "description": "Tomate, mozzarella, basilic frais",
      "imageUrl": "/images/pizza-margherita.jpg",
      "priceCents": 120000,
      "menuId": "1",
      "menu": {
        "id": "1",
        "name": "Menu Principal",
        "branchId": "1",
        "branch": {
          "id": "1",
          "name": "Mega Pizza - Centre Ville"
        }
      },
      "ingredients": [
        {
          "id": "dish_ing_1",
          "dishId": "1",
          "ingredientId": "ing_1",
          "ingredient": {
            "id": "ing_1",
            "name": "Tomate",
            "createdAt": "2024-01-01T00:00:00.000Z"
          },
          "qtyUnit": 1,
          "required": true
        }
      ],
      "available": true,
      "category": "pizza",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/dishes
Create new dish.

**Request:**
```json
{
  "name": "Pizza Quattro Stagioni",
  "description": "Tomate, mozzarella, jambon, champignons, artichauts, olives",
  "priceCents": 180000,
  "menuId": "1",
  "ingredients": [
    {
      "ingredientId": "ing_1",
      "qtyUnit": 1,
      "required": true
    }
  ]
}
```

#### GET /api/dishes/:id
Get dish by ID.

#### PUT /api/dishes/:id
Update dish.

#### DELETE /api/dishes/:id
Delete dish.

#### PUT /api/dishes/:id/availability
Toggle dish availability.

**Request:**
```json
{
  "available": false
}
```

#### POST /api/dishes/:id/upload-image
Upload dish image.

**Request:** multipart/form-data with `image` field

**Response:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "https://your-domain.com/uploads/dishes/dish-1-image.jpg"
  }
}
```

### Order Management

#### GET /api/orders
Get all orders.

**Query Parameters:**
- `page`: number (optional)
- `limit`: number (optional)
- `branchId`: string (optional)
- `status`: OrderStatus (optional)
- `userPhone`: string (optional)
- `dateFrom`: string (optional, ISO date)
- `dateTo`: string (optional, ISO date)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "orderNumber": 1001,
      "branchId": "1",
      "branch": {
        "id": "1",
        "name": "Mega Pizza - Centre Ville",
        "address": "123 Rue de la Paix, Alger"
      },
      "userName": "Ahmed Benali",
      "userPhone": "+213555123456",
      "items": [
        {
          "id": "item_1",
          "orderId": "1",
          "dishId": "1",
          "dish": {
            "id": "1",
            "name": "Pizza Margherita",
            "priceCents": 120000
          },
          "qty": 2,
          "priceCents": 120000
        }
      ],
      "status": "PENDING",
      "totalCents": 240000,
      "canceled": false,
      "cancelReason": null,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-01-01T10:00:00.000Z"
    }
  ]
}
```

#### POST /api/orders
Create new order.

**Request:**
```json
{
  "branchId": "1",
  "userName": "Ahmed Benali",
  "userPhone": "+213555123456",
  "items": [
    {
      "dishId": "1",
      "qty": 2,
      "priceCents": 120000
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "order_123",
    "orderNumber": 1001,
    // ... full order object
  }
}
```

#### GET /api/orders/:id
Get order by ID.

#### PUT /api/orders/:id/status
Update order status.

**Request:**
```json
{
  "status": "PREPARING"
}
```

**Valid Status Transitions:**
- PENDING → ACCEPTED, CANCELED
- ACCEPTED → PREPARING, CANCELED
- PREPARING → READY, CANCELED
- READY → OUT_FOR_DELIVERY, COMPLETED, CANCELED
- OUT_FOR_DELIVERY → COMPLETED, CANCELED
- COMPLETED → (no transitions)
- CANCELED → (no transitions)

#### PUT /api/orders/:id/cancel
Cancel order.

**Request:**
```json
{
  "reason": "Customer requested cancellation"
}
```

#### GET /api/orders/user/:phone
Get orders by user phone.

#### GET /api/orders/feed/:branchId
Get real-time orders feed for branch.

**Query Parameters:**
- `status`: OrderStatus (optional)
- `limit`: number (optional)

### Ingredient Management

#### GET /api/ingredients
Get all ingredients.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ing_1",
      "name": "Tomate",
      "expired": false,
      "branchExpired": {
        "1": false,
        "2": true
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "branchAvails": [
        {
          "id": "avail_1",
          "branchId": "1",
          "ingredientId": "ing_1",
          "available": true,
          "updatedAt": "2024-01-01T00:00:00.000Z"
        }
      ]
    }
  ]
}
```

#### POST /api/ingredients
Create new ingredient.

#### GET /api/ingredients/:id
Get ingredient by ID.

#### PUT /api/ingredients/:id
Update ingredient.

#### DELETE /api/ingredients/:id
Delete ingredient.

#### PUT /api/ingredients/:id/availability
Update ingredient availability globally.

#### PUT /api/ingredients/:id/availability/:branchId
Update ingredient availability for specific branch.

**Request:**
```json
{
  "available": false
}
```

### Reports & Analytics

#### GET /api/reports/dashboard
Get dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 1250,
    "totalRevenue": 125000000,
    "totalDishes": 45,
    "totalUsers": 12,
    "ordersToday": 23,
    "revenueToday": 2300000,
    "topDishes": [],
    "recentOrders": []
  }
}
```

#### GET /api/reports/branch-income
Get branch income report.

#### GET /api/reports/fraud-users
Get fraud users report.

#### GET /api/reports/sales-analytics
Get sales analytics.

## 🔄 WebSocket Events (Optional)

If implementing real-time features:

### Connection
```javascript
const ws = new WebSocket('ws://localhost:8080/ws');
```

### Events to Emit
- `new-order`: When new order is created
- `order-status-update`: When order status changes
- `ingredient-availability-update`: When ingredient availability changes
- `system-notification`: System-wide notifications

### Event Format
```json
{
  "event": "new-order",
  "data": {
    "orderId": "123",
    "branchId": "1",
    "order": { /* full order object */ }
  },
  "timestamp": "2024-01-01T10:00:00.000Z"
}
```

## 📝 Error Handling

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "status": 400,
  "errors": {
    "field": ["Validation error message"]
  }
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `422`: Unprocessable Entity
- `500`: Internal Server Error

## 🔧 CORS Configuration

Your backend must configure CORS to allow requests from:
- `http://localhost:5173` (development)
- `http://localhost:3000` (alternative dev port)
- Your production domain

Required headers:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

## 📊 Database Schema Requirements

### Key Tables Structure

#### users
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
  last_order_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by VARCHAR(255),
  updated_by VARCHAR(255),
  FOREIGN KEY (branch_id) REFERENCES branches(id)
);
```

#### branches
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

#### orders
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

## 🧪 Testing Your Backend

Use the provided testing script:
```bash
npm run backend:test http://your-backend-url/api
```

This will test:
- Basic connectivity
- Authentication endpoints
- Protected routes
- CORS configuration
- All required endpoints

## 📦 Deployment Notes

### Environment Variables
Your backend should use these environment variables:
- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: Secret for JWT token signing
- `CORS_ORIGIN`: Allowed CORS origins
- `PORT`: Server port (default: 8080)
- `UPLOAD_PATH`: Path for file uploads

### Security Considerations
- Hash passwords using bcrypt
- Validate all input data
- Implement rate limiting
- Use HTTPS in production
- Sanitize database queries (prevent SQL injection)
- Validate JWT tokens on all protected routes

This specification ensures your backend will work seamlessly with the existing frontend! 🚀
