/**
 * Application Constants
 * Centralized configuration values
 */

// ⏱️ Timing & Delays
export const TIMING = {
  // API Polling
  ORDERS_REFETCH_INTERVAL: 10_000, // 10 seconds
  TABLES_REFETCH_INTERVAL: 15_000, // 15 seconds
  
  // Debouncing
  SEARCH_DEBOUNCE: 500, // 500ms
  AUTO_SYNC_DEBOUNCE: 1_000, // 1 second
  
  // Timeouts
  API_TIMEOUT: 10_000, // 10 seconds
  TOAST_DURATION: 2_000, // 2 seconds
  
  // Delays
  CACHE_CLEAR_DELAY: 100, // 100ms
  AUTO_CLEAR_TABLE_DELAY: 300, // 300ms
  SUCCESS_FEEDBACK_DELAY: 800, // 800ms
} as const;

// 💰 Business Rules
export const BUSINESS = {
  // Discounts
  MIN_DISCOUNT_PERCENT: 0,
  MAX_DISCOUNT_PERCENT: 100,
  
  // Orders
  MAX_ITEMS_PER_ORDER: 50,
  MAX_QUANTITY_PER_ITEM: 100,
  
  // Notes
  MAX_NOTE_LENGTH: 500,
  
  // Print
  MIN_PRINT_COPIES: 1,
  MAX_PRINT_COPIES: 5,
} as const;

// 🎨 UI Configuration
export const UI = {
  // Sidebar
  SIDEBAR_WIDTH_EXPANDED: 240, // 60 * 4 = 240px (w-60)
  SIDEBAR_WIDTH_COLLAPSED: 64, // 16 * 4 = 64px (w-16)
  
  // Cart
  CART_MAX_HEIGHT: 256, // max-h-64
  
  // Pagination
  ITEMS_PER_PAGE: 20,
  
  // Search
  MIN_SEARCH_LENGTH: 2,
} as const;

// 🔐 Authentication
export const AUTH = {
  TOKEN_KEY: 'auth-token',
  USER_KEY: 'auth-user',
  TOKEN_EXPIRY_HOURS: 24,
} as const;

// 📊 Query Keys
export const QUERY_KEYS = {
  ORDERS: ['orders'],
  ORDER_DETAIL: (id: number) => ['order', id],
  TABLES: ['tables'],
  TABLE_DETAIL: (id: number) => ['table', id],
  PRODUCTS: ['products'],
  PRODUCT_DETAIL: (id: number) => ['product', id],
  CATEGORIES: ['categories'],
  USERS: ['users'],
  DASHBOARD_STATS: ['dashboard-stats'],
  RECENT_ORDERS: ['recent-orders'],
  ANALYTICS: ['analytics'],
} as const;

// 🎯 API Endpoints
export const API_ENDPOINTS = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  
  // Auth
  LOGIN: '/api/users/login',
  LOGOUT: '/api/users/logout',
  
  // Orders
  ORDERS: '/api/orders',
  ORDER_ITEMS: (orderId: number) => `/api/orders/${orderId}/items`,
  ORDER_STATUS: (orderId: number) => `/api/orders/${orderId}/status`,
  
  // Products
  PRODUCTS: '/api/products',
  
  // Tables
  TABLES: '/api/tables',
  
  // Payments
  PAYMENTS: '/api/payments',
  
  // Analytics
  ANALYTICS: '/api/analytics',
} as const;

// 🖨️ Print Configuration
export const PRINT = {
  // Paper size
  PAPER_WIDTH_MM: 80,
  PAPER_MARGIN_MM: 5,
  
  // Font sizes
  TITLE_FONT_SIZE: 16,
  NORMAL_FONT_SIZE: 12,
  SMALL_FONT_SIZE: 11,
  TINY_FONT_SIZE: 10,
  
  // Types
  TYPES: {
    KITCHEN_ORDER: 'order_preparation',
    TEMPORARY_RECEIPT: 'temporary_receipt',
    CUSTOMER_RECEIPT: 'payment_receipt',
    KITCHEN_SLIP: 'kitchen_slip',
  }
} as const;

// 🎨 Colors (cho consistency)
export const COLORS = {
  STATUS: {
    ORDERING: 'warning',
    PAID: 'success',
    CANCELLED: 'destructive',
  },
  
  PAYMENT: {
    CASH: 'green',
    CARD: 'blue',
    BANKING: 'purple',
  },
} as const;

// ✅ Validation Messages
export const MESSAGES = {
  SUCCESS: {
    ORDER_SAVED: 'Đơn hàng đã được lưu thành công',
    ORDER_UPDATED: 'Đơn hàng đã được cập nhật',
    PAYMENT_SUCCESS: 'Thanh toán thành công',
    TABLE_CLEARED: 'Bàn đã được clear',
  },
  
  ERROR: {
    NETWORK: 'Không thể kết nối tới server',
    SERVER: 'Lỗi server, vui lòng thử lại',
    AUTH_EXPIRED: 'Phiên đăng nhập đã hết hạn',
    INVALID_INPUT: 'Dữ liệu không hợp lệ',
    ORDER_NOT_FOUND: 'Không tìm thấy đơn hàng',
  },
  
  WARNING: {
    EMPTY_CART: 'Giỏ hàng đang trống',
    CONFIRM_DELETE: 'Bạn có chắc muốn xóa?',
  },
} as const;

// 🔢 Default Values
export const DEFAULTS = {
  DISCOUNT_PERCENT: 0,
  PRINT_COPIES: 1,
  CASHIER_NAME: 'Thu ngân',
  TABLE_CAPACITY: 4,
} as const;

// Export all as single object for easier imports
export default {
  TIMING,
  BUSINESS,
  UI,
  AUTH,
  QUERY_KEYS,
  API_ENDPOINTS,
  PRINT,
  COLORS,
  MESSAGES,
  DEFAULTS,
};

