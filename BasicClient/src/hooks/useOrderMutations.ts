/**
 * Centralized Order Mutations
 * Consistent error handling and cache invalidation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { QUERY_KEYS, MESSAGES } from '@/config/constants';
import { handleError, handleSilentError } from '@/lib/errorHandler';
import { toast } from 'react-hot-toast';

export function useOrderMutations() {
  const queryClient = useQueryClient();

  // Helper to invalidate all order-related queries
  const invalidateOrderQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ORDERS }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TABLES }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_STATS }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.RECENT_ORDERS }),
    ]);
  };

  // Create Order
  const createOrder = useMutation({
    mutationFn: (data: { tableId: number }) => apiClient.createOrder(data),
    onSuccess: async () => {
      await invalidateOrderQueries();
      toast.success('Đơn hàng đã được tạo');
    },
    onError: (error) => {
      handleError(error, { customMessage: 'Không thể tạo đơn hàng' });
    },
  });

  // Add Order Item
  const addOrderItem = useMutation({
    mutationFn: ({ orderId, itemData }: { orderId: number; itemData: any }) =>
      apiClient.addOrderItem(orderId, itemData),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.ORDER_DETAIL(variables.orderId) 
      });
      await invalidateOrderQueries();
    },
    onError: (error) => {
      handleError(error, { customMessage: 'Không thể thêm sản phẩm' });
    },
  });

  // Delete Order Item
  const deleteOrderItem = useMutation({
    mutationFn: ({ orderId, itemId }: { orderId: number; itemId: number }) =>
      apiClient.deleteOrderItem(orderId, itemId),
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.ORDER_DETAIL(variables.orderId) 
      });
      await invalidateOrderQueries();
      
      // Check if order was auto-cancelled
      if (data?.orderCancelled) {
        toast.success('Bàn đã được clear');
      }
    },
    onError: (error, variables) => {
      // Silent error for auto-sync operations
      handleSilentError(error);
    },
  });

  // Update Order Status
  const updateOrderStatus = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      apiClient.updateOrderStatus(orderId, status),
    onSuccess: async (data) => {
      await invalidateOrderQueries();
      
      // Don't show toast if already in status (idempotent)
      if (!data?.alreadyInStatus) {
        toast.success('Cập nhật trạng thái thành công');
      }
    },
    onError: (error) => {
      handleSilentError(error);
    },
  });

  // Process Payment
  const processPayment = useMutation({
    mutationFn: (paymentData: any) => apiClient.createPayment(paymentData),
    onSuccess: async () => {
      await invalidateOrderQueries();
      toast.success(MESSAGES.SUCCESS.PAYMENT_SUCCESS, {
        icon: '💳',
        duration: 3000,
      });
    },
    onError: (error) => {
      handleError(error, { customMessage: 'Lỗi khi xử lý thanh toán' });
    },
  });

  return {
    createOrder,
    addOrderItem,
    deleteOrderItem,
    updateOrderStatus,
    processPayment,
    invalidateOrderQueries,
  };
}

