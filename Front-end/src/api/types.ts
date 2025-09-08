// API Types and Interfaces
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  error: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

// Authentication Types
export interface LoginRequest {
  phone: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    phone: string;
    role: 'ADMIN' | 'BRANCH_USER';
    branchId?: string;
    branch?: any;
  };
}

export interface CreateUserRequest {
  name: string;
  phone: string;
  role: 'ADMIN' | 'BRANCH_USER';
  branchId?: string;
  password?: string;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  role?: 'ADMIN' | 'BRANCH_USER';
  branchId?: string;
  isBlocked?: boolean;
  notes?: string;
}

// User Types
export interface UserSearchParams {
  search?: string;
  role?: 'ADMIN' | 'BRANCH_USER';
  branchId?: string;
  isBlocked?: boolean;
  page?: number;
  limit?: number;
}

export interface FraudUserResponse {
  user: any;
  cancellationCount: number;
  noShowCount: number;
  lastOrderAt: Date | null;
  totalSpent: number;
}

// Branch Types
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

// Menu Types
export interface CreateMenuRequest {
  name: string;
  branchId: string;
}

export interface UpdateMenuRequest {
  name?: string;
}

// Dish Types
export interface CreateDishRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  priceCents: number;
  menuId: string;
  ingredients: Array<{
    ingredientId: string;
    qtyUnit?: number;
    required?: boolean;
  }>;
}

export interface UpdateDishRequest {
  name?: string;
  description?: string;
  imageUrl?: string;
  priceCents?: number;
  available?: boolean;
  ingredients?: Array<{
    ingredientId: string;
    qtyUnit?: number;
    required?: boolean;
  }>;
}

// Order Types
export interface CreateOrderRequest {
  branchId: string;
  userName: string;
  userPhone: string;
  items: Array<{
    dishId: string;
    qty: number;
  }>;
}

export interface UpdateOrderStatusRequest {
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'CANCELED';
  cancelReason?: string;
}

export interface OrderSearchParams {
  branchId?: string;
  status?: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'CANCELED';
  userPhone?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'CANCELED';

// Ingredient Types
export interface CreateIngredientRequest {
  name: string;
}

export interface IngredientAvailabilityResponse {
  ingredient: any;
  branches: Array<{
    branchId: string;
    branchName: string;
    available: boolean;
    updatedAt: Date;
  }>;
}

// Report Types
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

// WebSocket Types
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

export interface SystemNotification {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  branchId?: string;
}

// Common Types
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface TableColumn {
  key: string;
  title: string;
  dataIndex: string;
  render?: (value: any, record: any, index: number) => React.ReactNode;
  sorter?: boolean;
  filterable?: boolean;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange' | 'number';
  options?: SelectOption[];
  placeholder?: string;
}

export interface SortOption {
  field: string;
  order: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

// API Error Types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'date' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    message?: string;
  };
}

export interface FormData {
  [key: string]: any;
}

// Chart Types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }>;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: {
    legend?: {
      display?: boolean;
      position?: 'top' | 'bottom' | 'left' | 'right';
    };
    title?: {
      display?: boolean;
      text?: string;
    };
  };
  scales?: {
    x?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
    y?: {
      display?: boolean;
      title?: {
        display?: boolean;
        text?: string;
      };
    };
  };
}
