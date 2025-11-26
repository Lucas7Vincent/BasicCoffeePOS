import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { authUtils } from './auth';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class ApiClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor để thêm token
    this.instance.interceptors.request.use(
      (config) => {
        const token = authUtils.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor để xử lý lỗi và transform response
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Transform response để extract data từ backend structure
        if (response.data && response.data.status === 'success' && response.data.data) {
          return { ...response, data: response.data.data };
        }
        return response;
      },
      (error) => {
        console.error('API Error:', error);
        
        if (error.response?.status === 401) {
          authUtils.removeToken();
          authUtils.removeUser();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          toast.error('Phiên đăng nhập đã hết hạn');
        } else if (error.response?.status >= 500) {
          // ✅ Only show server error for important operations, not for background syncs
          // Don't show toast for 500 errors - let the calling code handle it
          console.error('Server error:', error.response?.data);
        } else if (error.response?.data?.message) {
          // ✅ Only show error toast for user-initiated actions
          // Skip for auto-sync operations
          if (!error.config?.url?.includes('/items/') || error.config?.method !== 'delete') {
            toast.error(error.response.data.message);
          }
        } else if (error.code === 'ERR_NETWORK') {
          toast.error('Không thể kết nối tới server');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(credentials: { username: string; password: string }) {
    try {
      console.log('Sending login request:', credentials);
      const response = await this.instance.post('/users/login', credentials);
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Users endpoints
  async getUsers() {
    const response = await this.instance.get('/users');
    return response.data;
  }

  async createUser(userData: any) {
    const response = await this.instance.post('/users', userData);
    return response.data;
  }

  async updateUser(id: number, userData: any) {
    const response = await this.instance.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: number) {
    const response = await this.instance.delete(`/users/${id}`);
    return response.data;
  }

  async getUser(id: number) {
    const response = await this.instance.get(`/users/${id}`);
    return response.data;
  }

  async getDeletedUsers() {
    const response = await this.instance.get('/users/deleted');
    return response.data;
  }

  async restoreUser(id: number) {
    const response = await this.instance.put(`/users/${id}/restore`);
    return response.data;
  }

  // Categories endpoints
  async getCategories() {
    const response = await this.instance.get('/categories');
    return response.data;
  }

  async createCategory(categoryData: any) {
    console.log('🏷️ Frontend sending category data:', categoryData);
    const response = await this.instance.post('/categories', categoryData);
    console.log('✅ Category created:', response.data);
    return response.data;
  }

  async updateCategory(id: number, categoryData: any) {
    console.log('🏷️ Frontend updating category:', id, categoryData);
    const response = await this.instance.put(`/categories/${id}`, categoryData);
    console.log('✅ Category updated:', response.data);
    return response.data;
  }

  async deleteCategory(id: number) {
    console.log('🏷️ Frontend deleting category:', id);
    const response = await this.instance.delete(`/categories/${id}`);
    console.log('✅ Category deleted:', response.data);
    return response.data;
  }

  async getDeletedCategories() {
    const response = await this.instance.get('/categories/deleted');
    return response.data;
  }

  async getCategory(id: number) {
    const response = await this.instance.get(`/categories/${id}`);
    return response.data;
  }

  async restoreCategory(id: number) {
    const response = await this.instance.put(`/categories/${id}/restore`);
    return response.data;
  }

  // Products endpoints
  async getProducts() {
    const response = await this.instance.get('/products');
    return response.data;
  }

  async getProduct(id: number) {
    const response = await this.instance.get(`/products/${id}`);
    return response.data;
  }

  async createProduct(productData: any) {
    console.log('🚀 Frontend sending product data:', productData);
    const response = await this.instance.post('/products', productData);
    console.log('✅ Backend response:', response.data);
    return response.data;
  }

  async updateProduct(id: number, productData: any) {
    const response = await this.instance.put(`/products/${id}`, productData);
    return response.data;
  }

  async deleteProduct(id: number) {
    const response = await this.instance.delete(`/products/${id}`);
    return response.data;
  }

  async getDeletedProducts() {
    const response = await this.instance.get('/products/deleted');
    return response.data;
  }

  async restoreProduct(id: number) {
    const response = await this.instance.put(`/products/${id}/restore`);
    return response.data;
  }

  // Tables endpoints
  async getTables() {
    const response = await this.instance.get('/tables');
    return response.data;
  }

  async createTable(tableData: any) {
    const response = await this.instance.post('/tables', tableData);
    return response.data;
  }

  async updateTable(id: number, tableData: any) {
    const response = await this.instance.put(`/tables/${id}`, tableData);
    return response.data;
  }

  async deleteTable(id: number) {
    const response = await this.instance.delete(`/tables/${id}`);
    return response.data;
  }

  async getTable(id: number) {
    const response = await this.instance.get(`/tables/${id}`);
    return response.data;
  }

  // Orders endpoints
  async getOrders() {
    const response = await this.instance.get('/orders');
    return response.data;
  }

  async getOrder(id: number) {
    const response = await this.instance.get(`/orders/${id}`);
    return response.data;
  }

  async createOrder(orderData: any) {
    const response = await this.instance.post('/orders', orderData);
    return response.data;
  }

  async addOrderItem(orderId: number, itemData: any) {
    const response = await this.instance.post(`/orders/${orderId}/items`, itemData);
    return response.data;
  }

  async updateOrderItem(orderId: number, itemId: number, itemData: any) {
    const response = await this.instance.put(`/orders/${orderId}/items/${itemId}`, itemData);
    return response.data;
  }

  async deleteOrderItem(orderId: number, itemId: number) {
    try {
      console.log('🗑️ [API] Deleting order item:', { orderId, itemId, url: `/orders/${orderId}/items/${itemId}` });
      const response = await this.instance.delete(`/orders/${orderId}/items/${itemId}`);
      console.log('✅ [API] Delete response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [API] Delete order item error:', {
        orderId,
        itemId,
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: error.response?.data?.message || error.message,
        fullError: error.response?.data
      });
      throw error;
    }
  }

  async updateOrderStatus(orderId: number, status: string) {
    const response = await this.instance.put(`/orders/${orderId}/status`, { status });
    return response.data;
  }

  // Payments endpoints
  async createPayment(paymentData: any) {
    const response = await this.instance.post('/payments', paymentData);
    return response.data;
  }

  async getPayments() {
    const response = await this.instance.get('/payments');
    return response.data;
  }

  async getPayment(id: number) {
    const response = await this.instance.get(`/payments/${id}`);
    return response.data;
  }

  async getPaymentsByOrder(orderId: number) {
    const response = await this.instance.get(`/payments/order/${orderId}`);
    return response.data;
  }

  // Analytics endpoints
  async getRevenueSummary() {
    const response = await this.instance.get('/analytics/revenue/summary');
    return response.data;
  }

  async getDailyRevenue(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await this.instance.get(`/analytics/revenue/daily?${params.toString()}`);
    return response.data;
  }

  async getMonthlyRevenue(year?: number) {
    const params = year ? `?year=${year}` : '';
    const response = await this.instance.get(`/analytics/revenue/monthly${params}`);
    return response.data;
  }

  async getYearlyRevenue(years?: number) {
    const params = years ? `?years=${years}` : '';
    const response = await this.instance.get(`/analytics/revenue/yearly${params}`);
    return response.data;
  }

  async getTopSellingProducts(limit?: number, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await this.instance.get(`/analytics/products/top-selling?${params.toString()}`);
    return response.data;
  }

  async getProductsRevenue(startDate?: string, endDate?: string, categoryId?: number) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (categoryId) params.append('categoryId', categoryId.toString());
    
    const response = await this.instance.get(`/analytics/products/revenue?${params.toString()}`);
    return response.data;
  }

  async getCategoriesPerformance(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await this.instance.get(`/analytics/categories/performance?${params.toString()}`);
    return response.data;
  }

  // ✅ ADD: Missing analytics endpoints (matching backend routes)
  async getDiscountAnalysis(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await this.instance.get(`/analytics/discounts?${params.toString()}`);
    return response.data;
  }

  async getPaymentMethodAnalysis(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await this.instance.get(`/analytics/payment-methods?${params.toString()}`);
    return response.data;
  }

  async getComprehensiveReport(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await this.instance.get(`/analytics/comprehensive?${params.toString()}`);
    return response.data;
  }

  // ✅ EXCEL EXPORT API
  async exportAnalyticsExcel(
    type: 'comprehensive' | 'revenue-summary' | 'daily-revenue' | 'top-products' | 'payment-methods' | 'discount-analysis' = 'comprehensive',
    startDate?: string, 
    endDate?: string, 
    year?: number, 
    limit?: number,
    categoryId?: number
  ) {
    const params = new URLSearchParams();
    params.append('type', type);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (year) params.append('year', year.toString());
    if (limit) params.append('limit', limit.toString());
    if (categoryId) params.append('categoryId', categoryId.toString());
    
    const response = await this.instance.get(`/analytics/export/excel?${params.toString()}`, {
      responseType: 'blob' // Important for file download
    });
    
    return response;
  }
}

export const apiClient = new ApiClient();