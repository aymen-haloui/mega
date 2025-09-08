// API Constants and Configuration

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
    REFRESH: '/auth/refresh',
  },
  
  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    BLOCK: (id: string) => `/users/${id}/block`,
    NOTES: (id: string) => `/users/${id}/notes`,
    FRAUD_LIST: '/users/fraud/list',
    SEARCH: '/users/search/quick',
    ORDERS_BY_PHONE: (phone: string) => `/users/phone/${phone}/orders`,
  },
  
  // Branches
  BRANCHES: {
    BASE: '/branches',
    BY_ID: (id: string) => `/branches/${id}`,
    NEARBY: (lat: number, lng: number) => `/branches/nearby/${lat}/${lng}`,
    STATS: (id: string) => `/branches/${id}/stats`,
    INCOME: '/branches/income',
  },
  
  // Menus
  MENUS: {
    BASE: '/menus',
    BY_ID: (id: string) => `/menus/${id}`,
    DISHES: (id: string) => `/menus/${id}/dishes`,
    STATS: (id: string) => `/menus/${id}/stats`,
  },
  
  // Dishes
  DISHES: {
    BASE: '/dishes',
    BY_ID: (id: string) => `/dishes/${id}`,
    AVAILABILITY: (id: string) => `/dishes/${id}/availability`,
    ORDERS: (id: string) => `/dishes/${id}/orders`,
    STATS: (id: string) => `/dishes/${id}/stats`,
    UPLOAD_IMAGE: (id: string) => `/dishes/${id}/upload-image`,
  },
  
  // Orders
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    STATUS: (id: string) => `/orders/${id}/status`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    USER_ORDERS: (phone: string) => `/orders/user/${phone}`,
    FEED: (branchId: string) => `/orders/feed/${branchId}`,
    STATS: '/orders/stats',
  },
  
  // Ingredients
  INGREDIENTS: {
    BASE: '/ingredients',
    BY_ID: (id: string) => `/ingredients/${id}`,
    AVAILABILITY: (id: string) => `/ingredients/${id}/availability`,
    AVAILABILITY_BY_BRANCH: (id: string, branchId: string) => `/ingredients/${id}/availability/${branchId}`,
    AVAILABILITY_MAP: '/ingredients/availability/map',
    BULK_AVAILABILITY: '/ingredients/bulk-availability',
    STATS: (id: string) => `/ingredients/${id}/stats`,
  },
  
  // Reports
  REPORTS: {
    BRANCH_INCOME: '/reports/branch-income',
    FRAUD_USERS: '/reports/fraud-users',
    EXPORT_ORDERS: '/reports/export/orders',
    EXPORT_BRANCH_REPORT: '/reports/export/branch-report',
    DASHBOARD: '/reports/dashboard',
    AUDIT_LOG: '/reports/audit-log',
    SALES_ANALYTICS: '/reports/sales-analytics',
    POPULAR_DISHES: '/reports/popular-dishes',
    CUSTOMER_ANALYTICS: '/reports/customer-analytics',
  },
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  BRANCH_USER: 'BRANCH_USER',
} as const;

// Order Statuses
export const ORDER_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
} as const;

// Order Status Colors
export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDING]: 'orange',
  [ORDER_STATUS.ACCEPTED]: 'blue',
  [ORDER_STATUS.PREPARING]: 'purple',
  [ORDER_STATUS.READY]: 'green',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 'teal',
  [ORDER_STATUS.COMPLETED]: 'success',
  [ORDER_STATUS.CANCELED]: 'red',
} as const;

// Order Status Labels
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.ACCEPTED]: 'Accepted',
  [ORDER_STATUS.PREPARING]: 'Preparing',
  [ORDER_STATUS.READY]: 'Ready',
  [ORDER_STATUS.OUT_FOR_DELIVERY]: 'Out for Delivery',
  [ORDER_STATUS.COMPLETED]: 'Completed',
  [ORDER_STATUS.CANCELED]: 'Canceled',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  PAGE_SIZES: [10, 20, 50, 100],
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DD HH:mm:ss',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
} as const;

// Time Periods
export const TIME_PERIODS = {
  TODAY: '1d',
  WEEK: '7d',
  MONTH: '30d',
  QUARTER: '90d',
} as const;

// Time Period Labels
export const TIME_PERIOD_LABELS = {
  [TIME_PERIODS.TODAY]: 'Last 24 Hours',
  [TIME_PERIODS.WEEK]: 'Last 7 Days',
  [TIME_PERIODS.MONTH]: 'Last 30 Days',
  [TIME_PERIODS.QUARTER]: 'Last 90 Days',
} as const;

// Risk Levels
export const RISK_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;

// Risk Level Colors
export const RISK_LEVEL_COLORS = {
  [RISK_LEVELS.LOW]: 'green',
  [RISK_LEVELS.MEDIUM]: 'yellow',
  [RISK_LEVELS.HIGH]: 'orange',
  [RISK_LEVELS.CRITICAL]: 'red',
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
} as const;

// Validation Rules
export const VALIDATION = {
  PHONE: {
    PATTERN: /^\+?[1-9]\d{1,14}$/,
    MESSAGE: 'Please enter a valid phone number',
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address',
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MESSAGE: 'Password must be at least 6 characters long',
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    MESSAGE: 'Name must be between 2 and 100 characters',
  },
} as const;

// API Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  TIMEOUT: 'Request timeout. Please try again.',
} as const;

// WebSocket Events
export const WS_EVENTS = {
  NEW_ORDER: 'new-order',
  ORDER_STATUS_UPDATE: 'order-status-update',
  INGREDIENT_AVAILABILITY_UPDATE: 'ingredient-availability-update',
  SYSTEM_NOTIFICATION: 'system-notification',
  ERROR: 'error',
  RECONNECT_FAILED: 'reconnect-failed',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  BRANCH_ID: 'branchId',
} as const;

// API Timeouts
export const API_TIMEOUTS = {
  DEFAULT: 10000, // 10 seconds
  UPLOAD: 30000, // 30 seconds
  DOWNLOAD: 60000, // 60 seconds
} as const;

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  DELAY: 1000, // 1 second
  BACKOFF_FACTOR: 2,
} as const;

// Chart Colors
export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#10B981',
  SUCCESS: '#059669',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
  GRAY: '#6B7280',
  COLORS: [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
  ],
} as const;

// Table Configuration
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  SORT_DIRECTIONS: ['asc', 'desc'] as const,
  FILTER_DEBOUNCE: 300, // milliseconds
} as const;

// Form Configuration
export const FORM_CONFIG = {
  DEBOUNCE_DELAY: 300, // milliseconds
  VALIDATION_DELAY: 500, // milliseconds
  AUTO_SAVE_DELAY: 2000, // milliseconds
} as const;
