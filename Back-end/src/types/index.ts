import { User, Branch, Menu, Dish, Ingredient, Order, OrderItem, OrderStatus, Role } from '@prisma/client';

// Base types from Prisma
export type { User, Branch, Menu, Dish, Ingredient, Order, OrderItem, OrderStatus, Role };

// Extended types with relations
export interface UserWithBranch extends User {
  branch?: Branch | null;
}

export interface BranchWithUsers extends Branch {
  users: User[];
  menus: Menu[];
}

export interface MenuWithDishes extends Menu {
  dishes: Dish[];
  branch: Branch;
}

export interface DishWithIngredients extends Dish {
  ingredients: (DishIngredient & {
    ingredient: Ingredient;
  })[];
  menu: Menu;
}

export interface OrderWithItems extends Order {
  items: (OrderItem & {
    dish: Dish;
  })[];
  branch: Branch;
}

// Request/Response types
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserWithBranch;
}

export interface CreateUserRequest {
  name: string;
  phone: string;
  role: Role;
  branchId?: string;
  password?: string;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  role?: Role;
  branchId?: string;
  isBlocked?: boolean;
  notes?: string;
}

export interface CreateBranchRequest {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

export interface UpdateBranchRequest {
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
}

export interface CreateMenuRequest {
  name: string;
  branchId: string;
}

export interface UpdateMenuRequest {
  name?: string;
}

export interface CreateDishRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  priceCents: number;
  menuId: string;
  ingredients: {
    ingredientId: string;
    qtyUnit?: number;
    required?: boolean;
  }[];
}

export interface UpdateDishRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  priceCents?: number;
  available?: boolean;
  ingredients?: {
    ingredientId: string;
    qtyUnit?: number;
    required?: boolean;
  }[];
}

export interface CreateIngredientRequest {
  name: string;
}

export interface CreateOrderRequest {
  branchId: string;
  userName: string;
  userPhone: string;
  items: {
    dishId: string;
    qty: number;
  }[];
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  cancelReason?: string;
}

// Search and filter types
export interface UserSearchParams {
  search?: string; // phone or name
  role?: Role;
  branchId?: string;
  isBlocked?: boolean;
  page?: number;
  limit?: number;
}

export interface OrderSearchParams {
  branchId?: string;
  status?: OrderStatus;
  userPhone?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface BranchIncomeParams {
  branchId?: string;
  startDate: string;
  endDate: string;
}

export interface BranchIncomeResponse {
  branchId: string;
  branchName: string;
  totalRevenue: number;
  ordersCount: number;
  averageTicket: number;
  cancelledOrdersCount: number;
  cancelledRevenue: number;
}

export interface FraudUserResponse {
  user: User;
  cancellationCount: number;
  noShowCount: number;
  lastOrderAt: Date | null;
  totalSpent: number;
}

export interface IngredientAvailabilityResponse {
  ingredient: Ingredient;
  branches: {
    branchId: string;
    branchName: string;
    available: boolean;
    updatedAt: Date;
  }[];
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  role: Role;
  branchId?: string;
  iat: number;
  exp: number;
}

// Audit Log
export interface AuditLogData {
  action: string;
  entity: string;
  entityId: string;
  oldValues?: any;
  newValues?: any;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

// CSV Export types
export interface OrderExportData {
  orderNumber: number;
  branchName: string;
  userName: string;
  userPhone: string;
  status: string;
  totalCents: number;
  createdAt: string;
  items: string;
}

export interface BranchReportData {
  branchName: string;
  totalRevenue: number;
  ordersCount: number;
  averageTicket: number;
  cancelledOrders: number;
  period: string;
}

// Real-time events
export interface OrderStatusUpdateEvent {
  orderId: string;
  orderNumber: number;
  status: OrderStatus;
  branchId: string;
  timestamp: Date;
}

export interface IngredientAvailabilityUpdateEvent {
  ingredientId: string;
  branchId: string;
  available: boolean;
  timestamp: Date;
}
