'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { OrderDetailsModal } from '@/components/management/OrderDetailsModal';
import { OrderPaymentModal } from '@/components/management/OrderPaymentModal';
import { apiClient } from '@/lib/api';
import { formatCurrency, formatOrderTimestamp, getTimestampWithSource } from '@/lib/utils';
import { Order } from '@/types/pos';
import { Search, Eye, Filter, Calendar, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderToPayment, setOrderToPayment] = useState<Order | null>(null);
  
  const queryClient = useQueryClient();

  // 🚀 Enhanced query with better cache management
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () => apiClient.getOrders(),
    refetchInterval: 10000, // Refresh every 10 seconds for real-time feel
    staleTime: 0,
    gcTime: 1000 * 60, // Changed from cacheTime to gcTime
  });

  // Mutation để cập nhật trạng thái order
  const updateOrderStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) => 
      apiClient.updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
      toast.success('Cập nhật trạng thái đơn hàng thành công!');
    },
    onError: () => {
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    },
  });

  // ✅ ADD: Payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: (paymentData: { OrderID: number; PaymentType: string; discountPercentage?: number }) => 
      apiClient.createPayment(paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-orders'] });
      toast.success('Thanh toán thành công!');
      setShowPaymentModal(false);
      setOrderToPayment(null);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi xử lý thanh toán';
      toast.error(errorMessage);
    },
  });

  // Filtered orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order?.tableName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      order?.userFullName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      order?.id?.toString().includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Status options
  const statusOptions = [
    { value: 'all', label: 'Tất cả', count: orders.length },
    { value: 'Ordering', label: 'Đang order', count: orders.filter(o => o.status === 'Ordering').length },
    { value: 'Paid', label: 'Đã thanh toán', count: orders.filter(o => o.status === 'Paid').length },
    { value: 'Cancelled', label: 'Đã hủy', count: orders.filter(o => o.status === 'Cancelled').length },
  ];

  // Handlers
  const handleViewDetails = async (order: Order) => {
    try {
      console.log('🔍 Loading order details for ID:', order.id);
      const response = await apiClient.getOrder(order.id!);
      console.log('📦 Raw API response:', response);
      
      // ✅ FIX: Properly extract order from backend response structure
      let orderDetails;
      if (response.order) {
        // Backend returns { order: {...}, items: [...], summary: {...} }
        orderDetails = response.order;
      } else if (response.data?.order) {
        // Fallback if interceptor didn't work
        orderDetails = response.data.order;
      } else {
        // Last fallback - assume response is the order itself
        orderDetails = response;
      }
      
      console.log('✅ Processed order details:', orderDetails);
      console.log('🧮 Order total amount:', orderDetails.totalAmount);
      console.log('📋 Order items:', orderDetails.items);
      
      setSelectedOrder(orderDetails);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('❌ Order details error:', error);
      toast.error('Không thể tải chi tiết đơn hàng');
    }
  };

  const handleUpdateStatus = (orderId: number, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  // ✅ ADD: Payment handlers
  const handlePaymentClick = (order: Order) => {
    setOrderToPayment(order);
    setShowPaymentModal(true);
  };

  const handleProcessPayment = (paymentType: 'Cash' | 'Card' | 'Banking', discountPercentage?: number) => {
    if (!orderToPayment) return;
    
    const paymentData = {
      OrderID: orderToPayment.id!,
      PaymentType: paymentType,
      discountPercentage: discountPercentage || 0,
    };
    
    processPaymentMutation.mutate(paymentData);
  };

  const getStatusBadgeVariant = (status: string): "default" | "warning" | "success" | "destructive" => {
    switch (status) {
      case 'Ordering':
        return 'warning';
      case 'Paid':
        return 'success';
      case 'Cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Ordering':
        return 'Đang order';
      case 'Paid':
        return 'Đã thanh toán';
      case 'Cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  // 🎯 CLEAN ORDER ROW COMPONENT 
  const OrderRow = ({ order }: { order: Order }) => {
    const timestampInfo = getTimestampWithSource(order);

    return (
      <TableRow>
        <TableCell className="font-medium">
          #{order.id}
        </TableCell>
        <TableCell>
          {order.tableName}
        </TableCell>
        <TableCell>
          {order.userFullName || 'N/A'}
        </TableCell>
        <TableCell className="font-semibold text-primary">
          {formatCurrency(order.totalAmount)}
        </TableCell>
        <TableCell>
          <Badge variant={getStatusBadgeVariant(order.status)}>
            {getStatusText(order.status)}
          </Badge>
        </TableCell>
        <TableCell>
          {/* ✅ CLEAN TIMESTAMP DISPLAY */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-medium">{timestampInfo.formatted}</span>
              {/* Simple icon indicator without debug text */}
              {order.status === 'Paid' && (
                <span className="text-green-600 text-sm">💳</span>
              )}
            </div>
            
            {/* Show dual timestamps for paid orders - clean format */}
            {order.status === 'Paid' && order.orderDate && order.paymentDate && (
              <div className="text-xs text-gray-500 space-y-0.5">
                <div>📝 Đặt hàng: {formatOrderTimestamp({ 
                  status: 'Ordering', 
                  orderDate: order.orderDate 
                })}</div>
                <div className="text-green-600">💳 Thanh toán: {formatOrderTimestamp({ 
                  status: 'Paid', 
                  paymentDate: order.paymentDate 
                })}</div>
              </div>
            )}
          </div>
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleViewDetails(order)}
              className="gap-1"
            >
              <Eye className="h-4 w-4" />
              Xem
            </Button>
            
            {order.status === 'Ordering' && (
              <Button
                size="sm"
                onClick={() => handlePaymentClick(order)}
                disabled={processPaymentMutation.isPending}
                className="gap-1"
              >
                {processPaymentMutation.isPending && orderToPayment?.id === order.id 
                  ? 'Đang xử lý...' 
                  : 'Thanh toán'
                }
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý tất cả đơn hàng với timestamp chính xác
          </p>
        </div>
      </div>

      {/* Enhanced Stats Cards with Real-time Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statusOptions.map((option) => (
          <Card key={option.value} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setStatusFilter(option.value)}>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{option.count}</div>
                <div className="text-sm text-muted-foreground">{option.label}</div>
                {/* Real-time indicator */}
                <div className="mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mx-auto animate-pulse"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Danh sách đơn hàng
            {isLoading && (
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            )}
          </CardTitle>
          
          {/* Enhanced Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo ID, bàn, nhân viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={statusFilter === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(option.value)}
                  className="gap-1"
                >
                  <Filter className="h-4 w-4" />
                  {option.label}
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                    {option.count}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2">Đang tải đơn hàng...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Bàn</TableHead>
                    <TableHead>Nhân viên</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="w-64">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Thời gian
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </TableBody>
              </Table>
              
              {filteredOrders.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>
                    {searchTerm || statusFilter !== 'all'
                      ? 'Không tìm thấy đơn hàng nào phù hợp' 
                      : 'Chưa có đơn hàng nào'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <OrderDetailsModal
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        order={selectedOrder}
        onUpdateStatus={handleUpdateStatus}
        onPaymentClick={handlePaymentClick} // ✅ ADD: Payment callback
        isUpdating={updateOrderStatusMutation.isPending}
      />

      {/* ✅ ADD: Payment Modal */}
      {orderToPayment && (
        <OrderPaymentModal
          open={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setOrderToPayment(null);
          }}
          order={orderToPayment}
          onProcessPayment={handleProcessPayment}
          isProcessing={processPaymentMutation.isPending}
        />
      )}
    </div>
  );
}