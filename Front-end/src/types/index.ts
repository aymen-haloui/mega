// Algeria Eats Hub - TypeScript Interfaces (Updated for Prisma Schema)

// User Types (Admin and Branch Users only - no client accounts)
export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'ADMIN' | 'BRANCH_USER';
  branchId?: string;
  branch?: Branch;
  password?: string; // Added password field for backend compatibility
  createdAt: string;
  updatedAt: string;
  isBlocked: boolean;
  notes?: string;
  cancellationCount: number;
  noShowCount: number;
  lastOrderAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Branch Types
export interface Branch {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  users?: User[];
  menus?: Menu[];
  orders?: Order[];
  branchIngredientAvails?: BranchIngredientAvailability[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Menu Types
export interface Menu {
  id: string;
  name: string;
  branch: Branch;
  branchId: string;
  dishes?: Dish[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Dish Types (replaces Product)
export interface Dish {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  priceCents: number;
  menu: Menu;
  menuId: string;
  ingredients?: DishIngredient[];
  orderItems?: OrderItem[];
  available: boolean;
  isAvailable?: boolean; // Alias for available
  category?: string; // Computed category based on dish name
  categoryId?: string; // Alias for category
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Ingredient Types
export interface Ingredient {
  id: string;
  name: string;
  createdAt: string;
  expired?: boolean; // Global expiration status
  branchExpired?: { [branchId: string]: boolean }; // Branch-specific expiration
  branchAvails?: BranchIngredientAvailability[];
  dishLinks?: DishIngredient[];
  createdBy?: string;
}

// Dish Ingredient Junction
export interface DishIngredient {
  id: string;
  dish: Dish;
  dishId: string;
  ingredient: Ingredient;
  ingredientId: string;
  qtyUnit?: number;
  required: boolean;
}

// Branch Ingredient Availability
export interface BranchIngredientAvailability {
  id: string;
  branch: Branch;
  branchId: string;
  ingredient: Ingredient;
  ingredientId: string;
  available: boolean;
  updatedAt: string;
  updatedBy?: string;
}

// Order Types (Updated for new schema)
export interface Order {
  id: string;
  orderNumber: number;
  branch: Branch;
  branchId: string;
  userName: string; // Client name (no account needed)
  userPhone: string; // Client phone (no account needed)
  items: OrderItem[];
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'CANCELED';
  totalCents: number;
  createdAt: string;
  updatedAt: string;
  canceled: boolean;
  cancelReason?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Order Item Types
export interface OrderItem {
  id: string;
  order: Order;
  orderId: string;
  dish: Dish;
  dishId: string;
  qty: number;
  priceCents: number;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  userId?: string;
  createdAt: string;
  ipAddress?: string;
  userAgent?: string;
}

// Cart Item Types (Updated for new schema)
export interface CartItem {
  dishId: string;
  quantity: number;
  priceCents: number;
  dish: Dish;
  specialInstructions?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

// Review Types (if needed for future features)
export interface Review {
  id: string;
  dishId: string;
  userName: string; // No user account needed
  userPhone: string; // No user account needed
  rating: number;
  comment: string;
  createdAt: string;
}

// Category Types (if needed for future features)
export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// Dashboard Stats Types (Updated for new schema)
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalDishes: number;
  totalUsers: number;
  ordersToday: number;
  revenueToday: number;
  topDishes: Dish[];
  recentOrders: Order[];
}

export interface BranchStats {
  branchId: string;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  popularDishes: Dish[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Cart State Types (Updated for new schema)
export interface CartState {
  items: CartItem[];
  totalCents: number;
  itemCount: number;
  branchId?: string;
  // No userId since clients don't have accounts
}

export interface UIState {
  sidebarOpen: boolean;
  notifications: Notification[];
  theme: 'dark' | 'light';
  loading: boolean;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter and Search types (Updated for new schema)
export interface DishFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  available?: boolean;
  search?: string;
  sortBy?: "name" | "priceCents" | "rating" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface OrderFilters {
  status?: Order["status"];
  branchId?: string;
  userPhone?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: "createdAt" | "totalCents" | "status";
  sortOrder?: "asc" | "desc";
}