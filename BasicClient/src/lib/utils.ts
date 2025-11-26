import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | null | undefined): string {
  // ✅ FIX: Handle NaN, null, undefined
  if (amount == null || isNaN(amount)) {
    return '0 ₫';
  }
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

/**
 * 💰 Smart currency formatter for dashboard cards
 * Automatically abbreviates large numbers for better display
 */
export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B ₫`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M ₫`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K ₫`;
  } else {
    return `${amount.toLocaleString('vi-VN')} ₫`;
  }
}

/**
 * 📊 Get appropriate text size class based on amount length
 */
export function getCurrencyTextSize(amount: number): string {
  const formatted = formatCompactCurrency(amount);
  if (formatted.length > 12) return 'text-xl xl:text-2xl';
  if (formatted.length > 8) return 'text-2xl xl:text-3xl';
  return 'text-3xl xl:text-4xl';
}

// ✅ FIX: Enhanced date formatting with timezone awareness
export function formatDate(date: string | Date): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date input for formatting:', date);
      return 'Invalid Date';
    }
    
    // ✅ FIX: Always clean format without timezone info
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return 'Format Error';
  }
}

// 🎯 ENHANCED TIMESTAMP UTILITIES FOR ORDERS

/**
 * ✅ FIX: Smart timestamp formatter with backend sync
 */
export function formatOrderTimestamp(order: {
  status: string;
  orderDate?: string;
  paymentDate?: string;
  displayDate?: string;
}): string {
  // ✅ FIX: Use displayDate first if available (from backend)
  if (order.displayDate) {
    return formatDate(order.displayDate);
  }
  
  // Fallback logic for backward compatibility
  if (order.status === 'Paid' && order.paymentDate) {
    return formatDate(order.paymentDate);
  }
  
  if (order.orderDate) {
    return formatDate(order.orderDate);
  }
  
  return 'N/A';
}

/**
 * ✅ FIX: Enhanced timestamp with source information
 */
export function getTimestampWithSource(order: {
  status: string;
  orderDate?: string;
  paymentDate?: string;
  displayDate?: string;
}): { 
  formatted: string; 
  source: 'orderDate' | 'paymentDate' | 'displayDate';
  raw: string;
  isValid: boolean;
} {
  let timestamp: string;
  let source: 'orderDate' | 'paymentDate' | 'displayDate';
  let isValid = false;
  
  // ✅ FIX: Priority logic aligned with backend
  if (order.displayDate) {
    timestamp = order.displayDate;
    source = 'displayDate';
    isValid = true;
  } else if (order.status === 'Paid' && order.paymentDate) {
    timestamp = order.paymentDate;
    source = 'paymentDate';
    isValid = true;
  } else if (order.orderDate) {
    timestamp = order.orderDate;
    source = 'orderDate';
    isValid = true;
  } else {
    timestamp = '';
    source = 'orderDate';
    isValid = false;
  }
  
  // ✅ ADD: Validate timestamp
  if (timestamp && isValid) {
    try {
      const dateObj = new Date(timestamp);
      isValid = !isNaN(dateObj.getTime());
    } catch {
      isValid = false;
    }
  }
  
  return {
    formatted: isValid ? formatDate(timestamp) : 'N/A',
    source,
    raw: timestamp,
    isValid
  };
}

/**
 * ✅ FIX: Enhanced label with backend sync
 */
export function getTimestampLabel(order: {
  status: string;
  orderDate?: string;
  paymentDate?: string;
  displayDate?: string;
}): { label: string; timestamp: string; icon: string; source: string } {
  const timestampInfo = getTimestampWithSource(order);
  
  if (order.status === 'Paid' && (order.paymentDate || (order.displayDate && timestampInfo.source === 'displayDate'))) {
    return {
      label: 'Thanh toán',
      timestamp: timestampInfo.formatted,
      icon: '💳',
      source: timestampInfo.source
    };
  }
  
  return {
    label: 'Đặt hàng',
    timestamp: timestampInfo.formatted,
    icon: '📝',
    source: timestampInfo.source
  };
}

/**
 * ✅ FIX: Enhanced debug helper with timezone info
 */
export function debugOrderTimestamp(order: any, label: string = ''): void {
  if (process.env.NODE_ENV === 'development') {
    const timestampInfo = getTimestampWithSource(order);
    
    console.log(`🔍 ${label} Order #${order.id} Timestamp Debug:`, {
      status: order.status,
      orderDate: order.orderDate,
      paymentDate: order.paymentDate,
      displayDate: order.displayDate,
      selectedSource: timestampInfo.source,
      selectedTimestamp: timestampInfo.raw,
      formatted: timestampInfo.formatted,
      isValid: timestampInfo.isValid,
      // ✅ ADD: Detailed parsing info
      parseResults: {
        orderDateParsed: order.orderDate ? new Date(order.orderDate).toISOString() : null,
        paymentDateParsed: order.paymentDate ? new Date(order.paymentDate).toISOString() : null,
        displayDateParsed: order.displayDate ? new Date(order.displayDate).toISOString() : null,
      },
      clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      serverTime: new Date().toISOString()
    });
  }
}

/**
 * Validates if a timestamp is recent (within last 24 hours)
 */
export function isRecentTimestamp(timestamp: string): boolean {
  if (!timestamp) return false;
  
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours24 = 24 * 60 * 60 * 1000;
    
    return diff <= hours24 && diff >= 0; // Also check not in future
  } catch {
    return false;
  }
}

/**
 * ✅ FIX: Enhanced relative time with better error handling
 */
export function getRelativeTime(timestamp: string): string {
  if (!timestamp) return 'Unknown';
  
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'Invalid';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Handle future dates
    if (diff < 0) return 'Trong tương lai';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    
    return formatDate(date);
  } catch (error) {
    console.error('Error calculating relative time:', timestamp, error);
    return 'Error';
  }
}

/**
 * ✅ ADD: Date comparison utility
 */
export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  try {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  } catch {
    return false;
  }
}

/**
 * ✅ ADD: Extract date string in YYYY-MM-DD format
 */
export function extractDateString(dateInput: string | Date): string {
  if (!dateInput) return '';
  
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}