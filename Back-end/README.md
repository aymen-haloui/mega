# Restaurant Management System - Backend

A comprehensive backend API for managing restaurant operations including orders, menus, branches, users, and real-time updates.

## Features

### Core Functionality
- **User Management**: Admin and branch user roles with authentication
- **Branch Management**: Multi-location restaurant support
- **Menu & Dish Management**: Dynamic menu creation and dish management
- **Order Management**: Complete order lifecycle with real-time updates
- **Ingredient Management**: Track ingredient availability across branches
- **Real-time Updates**: Socket.IO integration for live order updates

### Advanced Features
- **Fraud Detection**: Identify suspicious users based on cancellation patterns
- **Analytics & Reports**: Comprehensive reporting with CSV export
- **Audit Logging**: Track all system changes
- **Role-based Access Control**: Secure access based on user roles
- **Search & Filtering**: Advanced search across all entities
- **Pagination**: Efficient data loading for large datasets

## Tech Stack

- **Node.js** with **TypeScript**
- **Express.js** for REST API
- **Prisma** as ORM
- **PostgreSQL** database
- **Socket.IO** for real-time updates
- **JWT** for authentication
- **Joi** for validation
- **CSV export** for reports

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Back-end
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/restaurant_management"
   JWT_SECRET="your-super-secret-jwt-key"
   PORT=3001
   NODE_ENV="development"
   CORS_ORIGIN="http://localhost:3000"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed database with sample data
   npm run db:seed
   ```

5. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## API Documentation

### Authentication

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "+1234567890",
  "password": "admin123"
}
```

#### Register (Admin only)
```http
POST /api/auth/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1987654321",
  "role": "BRANCH_USER",
  "branchId": "branch-uuid",
  "password": "password123"
}
```

### Users

#### Get Users
```http
GET /api/users?page=1&limit=10&search=john&role=BRANCH_USER
Authorization: Bearer <token>
```

#### Create User (Admin only)
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Jane Manager",
  "phone": "+1555123456",
  "role": "BRANCH_USER",
  "branchId": "branch-uuid"
}
```

#### Block/Unblock User
```http
PUT /api/users/:id/block
Authorization: Bearer <token>
Content-Type: application/json

{
  "isBlocked": true,
  "reason": "Suspicious activity"
}
```

### Branches

#### Get Branches
```http
GET /api/branches?page=1&limit=10&search=downtown
Authorization: Bearer <token>
```

#### Create Branch (Admin only)
```http
POST /api/branches
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Branch",
  "address": "789 Oak St, City, State 12345",
  "lat": 40.7128,
  "lng": -74.0060
}
```

#### Get Branch Statistics
```http
GET /api/branches/:id/stats?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

### Orders

#### Get Orders
```http
GET /api/orders?branchId=branch-uuid&status=PENDING&page=1&limit=10
Authorization: Bearer <token>
```

#### Create Order
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "branchId": "branch-uuid",
  "userName": "John Customer",
  "userPhone": "+1555000001",
  "items": [
    {
      "dishId": "dish-uuid",
      "qty": 2
    }
  ]
}
```

#### Update Order Status
```http
PUT /api/orders/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ACCEPTED"
}
```

#### Get Real-time Orders Feed
```http
GET /api/orders/feed/:branchId?status=PENDING&limit=50
Authorization: Bearer <token>
```

### Menus & Dishes

#### Get Menus
```http
GET /api/menus?branchId=branch-uuid&page=1&limit=10
Authorization: Bearer <token>
```

#### Create Menu
```http
POST /api/menus
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Lunch Menu",
  "branchId": "branch-uuid"
}
```

#### Create Dish
```http
POST /api/dishes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato and mozzarella",
  "priceCents": 1299,
  "menuId": "menu-uuid",
  "ingredients": [
    {
      "ingredientId": "ingredient-uuid",
      "required": true
    }
  ]
}
```

### Ingredients

#### Get Ingredients
```http
GET /api/ingredients?page=1&limit=10&search=tomato
Authorization: Bearer <token>
```

#### Update Ingredient Availability
```http
PUT /api/ingredients/:id/availability/:branchId
Authorization: Bearer <token>
Content-Type: application/json

{
  "available": false
}
```

#### Get Availability Map
```http
GET /api/ingredients/availability/map?branchId=branch-uuid
Authorization: Bearer <token>
```

### Reports

#### Get Branch Income Report
```http
GET /api/reports/branch-income?branchId=branch-uuid&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

#### Get Fraud Users
```http
GET /api/reports/fraud-users?maxCancellations=5&maxNoShows=3
Authorization: Bearer <token>
```

#### Export Orders to CSV
```http
GET /api/reports/export/orders?branchId=branch-uuid&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

#### Get Dashboard Statistics
```http
GET /api/reports/dashboard?branchId=branch-uuid&period=7d
Authorization: Bearer <token>
```

## Real-time Updates

The API supports real-time updates via Socket.IO:

### Client Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

// Join branch room
socket.emit('join-branch', 'branch-uuid');

// Listen for new orders
socket.on('new-order', (order) => {
  console.log('New order:', order);
});

// Listen for order status updates
socket.on('order-status-update', (update) => {
  console.log('Order status updated:', update);
});

// Listen for ingredient availability updates
socket.on('ingredient-availability-update', (update) => {
  console.log('Ingredient availability updated:', update);
});
```

## Database Schema

The system uses PostgreSQL with the following main entities:

- **Users**: Admin and branch users with role-based access
- **Branches**: Restaurant locations with coordinates
- **Menus**: Menu collections per branch
- **Dishes**: Individual menu items with ingredients
- **Ingredients**: Global ingredient registry
- **Orders**: Customer orders with items and status tracking
- **AuditLog**: System change tracking

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for admin and branch users
- **Input Validation**: Comprehensive request validation using Joi
- **Audit Logging**: Track all system changes
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet Security**: Security headers and protection

## Error Handling

The API provides consistent error responses:

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed database with sample data

### Code Structure

```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── routes/          # API route handlers
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Main application entry point
```

## Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   ```bash
   NODE_ENV=production
   DATABASE_URL=your-production-database-url
   JWT_SECRET=your-production-jwt-secret
   ```

3. **Run database migrations**
   ```bash
   npm run db:push
   ```

4. **Start the application**
   ```bash
   npm start
   ```

## Default Credentials

After running the seed script:

- **Admin**: `+1234567890` / `admin123`
- **Branch User 1**: `+1987654321` / `password123`
- **Branch User 2**: `+1555123456` / `password123`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
