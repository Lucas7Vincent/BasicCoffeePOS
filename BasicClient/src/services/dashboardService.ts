import { apiClient } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

// 🎯 ENHANCED INTERFACES WITH CLEAR TIMESTAMP LOGIC
export interface DashboardStats {
  revenue: {
    today: number;
    yesterday: number;
    thisMonth: number;
    lastMonth: number;
    change: number;
    monthlyChange: number;
    changeType: 'increase' | 'decrease' | 'neutral';
    monthlyChangeType: 'increase' | 'decrease' | 'neutral';
  };
  orders: {
    today: number;
    yesterday: number;
    thisMonth: number;
    lastMonth: number;
    change: number;
    monthlyChange: number;
    changeType: 'increase' | 'decrease' | 'neutral';
    monthlyChangeType: 'increase' | 'decrease' | 'neutral';
    pending: number;
    completed: number;
  };
  products: {
    total: number;
    categories: number;
    lowStock: number;
  };
  tables: {
    total: number;
    occupied: number;
    available: number;
    occupancyRate: number;
  };
}

export interface RecentOrder {
  id: number;
  tableName: string;
  totalAmount: number;
  status: 'Ordering' | 'Paid' | 'Cancelled';
  displayTimestamp: string; // 🎯 CLEAR: Always contains the correct timestamp
  userFullName: string;
  itemCount: number;
  timestampSource: 'orderDate' | 'paymentDate'; // 🔍 DEBUG INFO
  // ✅ ADD: Raw timestamps for debugging
  rawOrderDate?: string;
  rawPaymentDate?: string;
}

export interface TopProduct {
  productId: number;
  productName: string;
  categoryName: string;
  totalSold: number;
  revenue: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface HourlyRevenue {
  hour: number;
  revenue: number;
  orderCount: number;
}

// 🛠️ ENHANCED UTILITY FUNCTIONS FOR CLEAN CODE
class TimestampUtils {
  /**
   * ✅ FIX: Enhanced timestamp determination with backend sync
   */
  static getDisplayTimestamp(order: any): { timestamp: string; source: 'orderDate' | 'paymentDate' } {
    // ✅ FIX: Use backend's displayDate first if available
    if (order.displayDate) {
      // Determine source based on status and paymentDate availability
      const source = (order.status === 'Paid' && order.paymentDate) ? 'paymentDate' : 'orderDate';
      return { timestamp: order.displayDate, source };
    }
    
    // ✅ FIX: Fallback logic for paid orders
    if (order.status === 'Paid' && order.paymentDate) {
      return { timestamp: order.paymentDate, source: 'paymentDate' };
    }
    
    // Default to orderDate for ordering/cancelled orders
    return { 
      timestamp: order.orderDate || '', 
      source: 'orderDate' 
    };
  }

  /**
   * ✅ FIX: Enhanced date string extraction with timezone handling
   */
  static getDateString(dateInput: string | Date): string {
    if (!dateInput) return '';
    
    try {
      // Handle both SQL Server datetime strings and JS Date objects
      const date = new Date(dateInput);
      
      // ✅ FIX: Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date input:', dateInput);
        return '';
      }
      
      // Use local date to match SQL Server GETDATE() behavior
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error parsing date:', dateInput, error);
      return '';
    }
  }

  /**
   * Calculates percentage change between two values
   */
  static calculatePercentageChange(current: number, previous: number): number {
    return previous > 0 ? ((current - previous) / previous) * 100 : 0;
  }

  /**
   * Determines change type for UI display
   */
  static getChangeType(change: number): 'increase' | 'decrease' | 'neutral' {
    return change > 0 ? 'increase' : change < 0 ? 'decrease' : 'neutral';
  }

  /**
   * ✅ ADD: Debug timestamp information
   */
  static debugTimestamp(order: any, label: string = '') {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🕒 ${label} Timestamp Debug for Order #${order.id}:`, {
        status: order.status,
        orderDate: order.orderDate,
        paymentDate: order.paymentDate,
        displayDate: order.displayDate,
        jsParseOrderDate: order.orderDate ? new Date(order.orderDate).toISOString() : null,
        jsParsePaymentDate: order.paymentDate ? new Date(order.paymentDate).toISOString() : null,
        jsParseDisplayDate: order.displayDate ? new Date(order.displayDate).toISOString() : null,
        extractedDateString: TimestampUtils.getDateString(order.orderDate),
        clientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
    }
  }
}

class DashboardService {
  private readonly isDev = false; // ✅ FIX: Disable debug logs for clean UI

  /**
   * 📊 Get analytics-powered dashboard statistics
   * ✅ NEW: Using real analytics API endpoints
   */
  async getAnalyticsDashboardStats() {
    try {
      console.log('🔥 Using new analytics APIs...');
      const revenueSummary = await apiClient.getRevenueSummary();
      console.log('📊 Analytics revenue summary:', revenueSummary);
      
      const [products, categories, tables] = await Promise.all([
        apiClient.getProducts(),
        apiClient.getCategories(),
        apiClient.getTables(),
      ]);

      const activeOrders = await apiClient.getOrders();
      const occupiedTables = new Set(
        activeOrders
          .filter((order: any) => order.status === 'Ordering')
          .map((order: any) => order.tableId)
      ).size;
      const occupancyRate = tables.length > 0 ? (occupiedTables / tables.length) * 100 : 0;

      return {
        revenue: {
          today: revenueSummary.today?.revenue || 0,
          yesterday: revenueSummary.yesterday?.revenue || 0,
          thisMonth: revenueSummary.thisMonth?.revenue || 0,
          lastMonth: revenueSummary.lastMonth?.revenue || 0,
          change: Math.abs(revenueSummary.today?.growth || 0),
          monthlyChange: Math.abs(revenueSummary.thisMonth?.growth || 0),
          changeType: TimestampUtils.getChangeType(revenueSummary.today?.growth || 0),
          monthlyChangeType: TimestampUtils.getChangeType(revenueSummary.thisMonth?.growth || 0),
        },
        orders: {
          today: revenueSummary.today?.orders || 0,
          yesterday: revenueSummary.yesterday?.orders || 0,
          thisMonth: revenueSummary.thisMonth?.orders || 0,
          lastMonth: revenueSummary.lastMonth?.orders || 0,
          change: Math.abs(revenueSummary.today?.ordersGrowth || 0),
          monthlyChange: Math.abs(revenueSummary.thisMonth?.ordersGrowth || 0),
          changeType: TimestampUtils.getChangeType(revenueSummary.today?.ordersGrowth || 0),
          monthlyChangeType: TimestampUtils.getChangeType(revenueSummary.thisMonth?.ordersGrowth || 0),
          pending: activeOrders.filter((order: any) => order.status === 'Ordering').length,
          completed: activeOrders.filter((order: any) => order.status === 'Paid').length,
        },
        products: {
          total: products.length,
          categories: categories.length,
          lowStock: 0,
        },
        tables: {
          total: tables.length,
          occupied: occupiedTables,
          available: tables.length - occupiedTables,
          occupancyRate,
        }
      };
    } catch (error) {
      console.error('❌ Analytics API failed, falling back to manual calculation:', error);
      return this.getDashboardStats();
    }
  }

  /**
   * 📊 Calculate comprehensive dashboard statistics (Fallback method)
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const [orders, payments, products, categories, tables] = await Promise.all([
        apiClient.getOrders(),
        apiClient.getPayments(),
        apiClient.getProducts(),
        apiClient.getCategories(),
        apiClient.getTables(),
      ]);

      // ✅ FIX: Enhanced date calculation with timezone awareness
      const now = new Date();
      const today = TimestampUtils.getDateString(now);
      const yesterday = TimestampUtils.getDateString(
        new Date(now.getTime() - 24 * 60 * 60 * 1000)
      );

      if (this.isDev) {
        console.log('📅 Date calculation debug:', {
          now: now.toISOString(),
          today,
          yesterday,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
      }

      // 💰 Revenue calculations based on payment dates
      const todayRevenue = this.calculateRevenueForDate(payments, today);
      const yesterdayRevenue = this.calculateRevenueForDate(payments, yesterday);
      const revenueChange = TimestampUtils.calculatePercentageChange(todayRevenue, yesterdayRevenue);

      // 📋 Order statistics based on correct timestamps
      const todayOrders = this.getOrdersForDate(orders, today);
      const yesterdayOrders = this.getOrdersForDate(orders, yesterday);
      const orderChange = TimestampUtils.calculatePercentageChange(todayOrders.length, yesterdayOrders.length);

      // 🪑 Table occupancy calculation
      const activeOrders = orders.filter((order: any) => order.status === 'Ordering');
      const occupiedTables = new Set(activeOrders.map((order: any) => order.tableId)).size;
      const occupancyRate = tables.length > 0 ? (occupiedTables / tables.length) * 100 : 0;

      const stats = {
        revenue: {
          today: todayRevenue,
          yesterday: yesterdayRevenue,
          thisMonth: todayRevenue * 30, // Mock calculation
          lastMonth: yesterdayRevenue * 30, // Mock calculation
          change: Math.abs(revenueChange),
          monthlyChange: Math.abs(revenueChange), // Mock
          changeType: TimestampUtils.getChangeType(revenueChange),
          monthlyChangeType: TimestampUtils.getChangeType(revenueChange),
        },
        orders: {
          today: todayOrders.length,
          yesterday: yesterdayOrders.length,
          thisMonth: todayOrders.length * 30, // Mock calculation
          lastMonth: yesterdayOrders.length * 30, // Mock calculation
          change: Math.abs(orderChange),
          monthlyChange: Math.abs(orderChange), // Mock
          changeType: TimestampUtils.getChangeType(orderChange),
          monthlyChangeType: TimestampUtils.getChangeType(orderChange),
          pending: orders.filter((order: any) => order.status === 'Ordering').length,
          completed: orders.filter((order: any) => order.status === 'Paid').length,
        },
        products: {
          total: products.length,
          categories: categories.length,
          lowStock: 0, // TODO: Implement when inventory management is added
        },
        tables: {
          total: tables.length,
          occupied: occupiedTables,
          available: tables.length - occupiedTables,
          occupancyRate,
        }
      };

      if (this.isDev) {
        console.log('📊 Dashboard Stats Calculated:', {
          todayRevenue,
          yesterdayRevenue,
          todayOrdersCount: todayOrders.length,
          yesterdayOrdersCount: yesterdayOrders.length,
          sampleTodayOrders: todayOrders.slice(0, 2).map(o => ({
            id: o.id,
            orderDate: o.orderDate,
            paymentDate: o.paymentDate,
            displayDate: o.displayDate
          }))
        });
      }

      return stats;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * 🕒 Get recent orders with correct timestamp logic
   */
  async getRecentOrders(limit: number = 5): Promise<RecentOrder[]> {
    try {
      const orders = await apiClient.getOrders();
      
      if (this.isDev) {
        console.log('🔍 Raw orders from API (first 2):', 
          orders.slice(0, 2).map((o: any) => ({
            id: o.id,
            status: o.status,
            orderDate: o.orderDate,
            paymentDate: o.paymentDate,
            displayDate: o.displayDate
          }))
        );
      }
      
      const processedOrders = orders
        .map((order: any) => {
          // ✅ FIX: Enhanced timestamp processing with debugging
          TimestampUtils.debugTimestamp(order, 'Processing');
          
          const { timestamp, source } = TimestampUtils.getDisplayTimestamp(order);
          
          if (this.isDev) {
            console.log(`📋 Order #${order.id} processed:`, {
              status: order.status,
              selectedTimestamp: timestamp,
              source,
              parsedTimestamp: timestamp ? new Date(timestamp).toISOString() : null
            });
          }

          return {
            id: order.id,
            tableName: order.tableName,
            totalAmount: order.totalAmount,
            status: order.status,
            displayTimestamp: timestamp,
            userFullName: order.userFullName || 'Unknown',
            itemCount: order.itemCount || order.items?.length || 0,
            timestampSource: source,
            // ✅ ADD: Raw timestamps for debugging
            rawOrderDate: order.orderDate,
            rawPaymentDate: order.paymentDate,
            // Keep raw data for sorting
            _sortKey: timestamp,
          };
        })
        .filter((order: any) => order._sortKey) // Remove orders without valid timestamps
        .sort((a: any, b: any) => {
          const dateA = new Date(a._sortKey).getTime();
          const dateB = new Date(b._sortKey).getTime();
          return dateB - dateA; // Newest first
        })
        .slice(0, limit)
        .map(({ _sortKey, ...order }: any) => order); // Remove internal sorting key
      if (this.isDev) {
        console.log('✅ Processed recent orders:', processedOrders.map((o: { id: string; status: string; displayTimestamp: string; timestampSource: string }) => ({
          id: o.id,
          status: o.status,
          displayTimestamp: o.displayTimestamp,
          timestampSource: o.timestampSource
        })));
      }

      return processedOrders;
    } catch (error) {
      console.error('❌ Error fetching recent orders:', error);
      throw error;
    }
  }

  /**
   * 🏆 Get top products using analytics API
   * ✅ NEW: Using real analytics endpoint
   */
  async getAnalyticsTopProducts(limit: number = 5): Promise<TopProduct[]> {
    try {
      console.log('🔥 Using analytics top-selling products API...');
      const topProductsData = await apiClient.getTopSellingProducts(limit);
      console.log('📊 Analytics top products:', topProductsData);
      
      if (topProductsData?.topProducts && Array.isArray(topProductsData.topProducts)) {
        return topProductsData.topProducts.map((product: any) => ({
          productId: product.productId,
          productName: product.productName,
          categoryName: product.categoryName,
          totalSold: product.totalQuantitySold,
          revenue: product.totalRevenue,
          trend: 'neutral' as const // TODO: Calculate trend from historical data
        }));
      }
      
      console.log('⚠️ No top products from analytics, falling back...');
      return this.getTopProducts(limit);
    } catch (error) {
      console.error('❌ Analytics top products failed, falling back:', error);
      return this.getTopProducts(limit);
    }
  }

  /**
   * 🏆 Get top selling products with analytics (Fallback method)
   */
  async getTopProducts(limit: number = 5): Promise<TopProduct[]> {
    try {
      const [orders, products] = await Promise.all([
        apiClient.getOrders(),
        apiClient.getProducts(),
      ]);

      const productSales = new Map<number, { quantity: number; revenue: number }>();

      // Only count completed (paid) orders
      orders
        .filter((order: any) => order.status === 'Paid' && order.items)
        .forEach((order: any) => {
          order.items.forEach((item: any) => {
            const current = productSales.get(item.productId) || { quantity: 0, revenue: 0 };
            productSales.set(item.productId, {
              quantity: current.quantity + item.quantity,
              revenue: current.revenue + item.subtotal,
            });
          });
        });

      const topProducts = Array.from(productSales.entries())
        .map(([productId, sales]) => {
          const product = products.find((p: any) => p.id === productId);
          return {
            productId,
            productName: product?.productName || 'Unknown Product',
            categoryName: product?.categoryName || 'Unknown Category',
            totalSold: sales.quantity,
            revenue: sales.revenue,
            trend: 'neutral' as const, // TODO: Calculate trend with historical data
          };
        })
        .sort((a, b) => b.totalSold - a.totalSold)
        .slice(0, limit);

      return topProducts;
    } catch (error) {
      console.error('❌ Error fetching top products:', error);
      throw error;
    }
  }

  /**
   * ⏰ Get hourly revenue data for charts
   */
  async getHourlyRevenue(): Promise<HourlyRevenue[]> {
    try {
      const payments = await apiClient.getPayments();
      const today = TimestampUtils.getDateString(new Date());
      
      const hourlyData: HourlyRevenue[] = Array.from({ length: 24 }, (_, hour) => ({
        hour,
        revenue: 0,
        orderCount: 0,
      }));

      payments
        .filter((payment: any) => 
          payment.paymentDate && 
          TimestampUtils.getDateString(payment.paymentDate) === today
        )
        .forEach((payment: any) => {
          try {
            const hour = new Date(payment.paymentDate).getHours();
            if (hour >= 0 && hour < 24) {
              hourlyData[hour].revenue += payment.amount || 0;
              hourlyData[hour].orderCount += 1;
            }
          } catch (error) {
            console.warn('Error parsing payment date for hourly revenue:', payment.paymentDate);
          }
        });

      return hourlyData;
    } catch (error) {
      console.error('❌ Error fetching hourly revenue:', error);
      throw error;
    }
  }

  /**
   * 🪑 Get real-time table status
   */
  async getTableStatus() {
    try {
      const [tables, orders] = await Promise.all([
        apiClient.getTables(),
        apiClient.getOrders(),
      ]);

      const activeOrders = orders.filter((order: any) => order.status === 'Ordering');
      const occupiedTableIds = new Set(activeOrders.map((order: any) => order.tableId));

      return tables.map((table: any) => ({
        ...table,
        isOccupied: occupiedTableIds.has(table.id),
        currentOrder: activeOrders.find((order: any) => order.tableId === table.id) || null,
      }));
    } catch (error) {
      console.error('❌ Error fetching table status:', error);
      throw error;
    }
  }

  // 🛠️ PRIVATE HELPER METHODS

  /**
   * Calculate total revenue for a specific date
   */
  private calculateRevenueForDate(payments: any[], dateStr: string): number {
    if (!dateStr) return 0;
    
    return payments
      .filter((payment: any) => {
        if (!payment.paymentDate) return false;
        return TimestampUtils.getDateString(payment.paymentDate) === dateStr;
      })
      .reduce((sum: number, payment: any) => sum + (payment.amount || 0), 0);
  }

  /**
   * ✅ FIX: Get orders for a specific date using enhanced timestamp logic
   */
  private getOrdersForDate(orders: any[], dateStr: string): any[] {
    if (!dateStr) return [];
    
    return orders.filter((order: any) => {
      const { timestamp } = TimestampUtils.getDisplayTimestamp(order);
      if (!timestamp) return false;
      
      const orderDateStr = TimestampUtils.getDateString(timestamp);
      return orderDateStr === dateStr;
    });
  }
}

export const dashboardService = new DashboardService();