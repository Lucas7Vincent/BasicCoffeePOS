'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Order } from '@/types/pos';
import { formatCurrency, formatDate, getTimestampLabel } from '@/lib/utils';
import { 
  Calendar, 
  User, 
  Table as TableIcon, 
  ShoppingCart, 
  StickyNote, 
  Printer 
} from 'lucide-react';
import { PrintButton } from '@/components/common/PrintButton';

interface OrderDetailsModalProps {
  open: boolean;
  onClose: () => void;
  order: Order | null;
  onUpdateStatus: (orderId: number, status: string) => void;
  onPaymentClick?: (order: Order) => void;
  isUpdating?: boolean;
}

export function OrderDetailsModal({
  open,
  onClose,
  order,
  onUpdateStatus,
  onPaymentClick,
  isUpdating = false,
}: OrderDetailsModalProps) {
  if (!order) return null;

  // Tính toán tổng đơn hàng
  const calculateTotal = () => {
    if (order.totalAmount && order.totalAmount > 0) {
      return order.totalAmount;
    }
    
    // Fallback: Tính từ các mục
    if (order.items && order.items.length > 0) {
      return order.items.reduce((total, item) => total + (item.subtotal || (item.quantity * item.unitPrice)), 0);
    }
    
    return 0;
  };

  const calculatedTotal = calculateTotal();

  // Tính toán chi tiết thanh toán
  const paymentBreakdown = (() => {
    const discountPercentage = order.discountPercentage || 0;
    
    let originalAmount, finalAmount, discountAmount;
    
    if (order.status === 'Paid' && discountPercentage > 0) {
      finalAmount = order.paidAmount || order.totalAmount || calculatedTotal;
      originalAmount = Math.round(finalAmount / (1 - discountPercentage / 100));
      discountAmount = originalAmount - finalAmount;
    } else {
      originalAmount = order.originalAmount || calculatedTotal;
      discountAmount = originalAmount * discountPercentage / 100;
      finalAmount = originalAmount - discountAmount;
    }
    
    return {
      originalAmount,
      discountPercentage,
      discountAmount,
      finalAmount,
    };
  })();

  const getStatusBadgeVariant = (status: string) => {
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn hàng #{order.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thông tin đơn hàng */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <TableIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Bàn:</span>
                  <span className="font-medium">{order.tableName}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Nhân viên:</span>
                  <span className="font-medium">{order.userFullName || 'N/A'}</span>
                </div>
                
                <div className="space-y-1">
                  {order.orderDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Đặt hàng:</span>
                      <span className="font-medium">{formatDate(order.orderDate)}</span>
                    </div>
                  )}
                  
                  {order.status === 'Paid' && order.paymentDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600">Thanh toán:</span>
                      <span className="font-medium text-green-600">
                        {formatDate(order.paymentDate)} 💳
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Trạng thái:</span>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chi tiết sản phẩm */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-4">Chi tiết sản phẩm</h3>
              
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{item.productName}</h4>
                          {item.notes && (
                            <div className="flex items-center gap-1 text-amber-600">
                              <StickyNote className="h-4 w-4" />
                              <span className="text-xs font-medium">Có ghi chú</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.unitPrice)} × {item.quantity}
                        </p>
                        {item.notes && (
                          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                            <div className="flex items-start gap-2">
                              <StickyNote className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="text-xs font-medium text-amber-700">Ghi chú:</span>
                                <p className="text-sm text-amber-800 mt-1">{item.notes}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Tổng đơn hàng:</span>
                  <span className="text-primary">{formatCurrency(calculatedTotal)}</span>
                </div>
                
                {order.status === 'Paid' && (
                  <div className="border-t pt-3 mt-3 space-y-2">
                    <h4 className="font-medium text-green-600">Chi tiết thanh toán</h4>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Phương thức thanh toán:</span>
                      <div className="flex items-center gap-2">
                        {order.paymentType === 'Cash' && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                            <span className="text-green-600">💰</span>
                            <span className="font-medium text-green-700">Tiền mặt</span>
                          </div>
                        )}
                        {order.paymentType === 'Card' && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                            <span className="text-blue-600">💳</span>
                            <span className="font-medium text-blue-700">Thẻ ngân hàng</span>
                          </div>
                        )}
                        {order.paymentType === 'Banking' && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full">
                            <span className="text-purple-600">👝</span>
                            <span className="font-medium text-purple-700">Chuyển khoản</span>
                          </div>
                        )}
                        {!order.paymentType && (
                          <span className="text-muted-foreground">Không rõ</span>
                        )}
                      </div>
                    </div>
                    
                    {paymentBreakdown.discountPercentage > 0 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Tạm tính:</span>
                          <span>{formatCurrency(paymentBreakdown.originalAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-green-600">
                          <span>Giảm giá ({paymentBreakdown.discountPercentage}%):</span>
                          <span>-{formatCurrency(paymentBreakdown.discountAmount)}</span>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                      <span>Đã thanh toán:</span>
                      <span className="text-green-600">{formatCurrency(paymentBreakdown.finalAmount)}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Các nút thao tác */}
          {order.status === 'Ordering' && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onUpdateStatus(order.id!, 'Cancelled')}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? 'Đang xử lý...' : 'Hủy đơn'}
              </Button>
              <Button
                onClick={() => {
                  if (onPaymentClick) {
                    onPaymentClick(order);
                    onClose(); // Đóng modal chi tiết để hiển thị modal thanh toán
                  } else {
                    // Fallback: Cập nhật trạng thái trực tiếp
                    onUpdateStatus(order.id!, 'Paid');
                  }
                }}
                disabled={isUpdating}
                className="flex-1"
              >
                {isUpdating ? 'Đang xử lý...' : 'Thanh toán'}
              </Button>
            </div>
          )}

          {/* Print button for paid orders */}
          {order.status === 'Paid' && (
            <div className="flex justify-center">
              <PrintButton
                order={order}
                variant="reprint"
                paymentMethod={order.paymentType === 'Cash' ? 'Tiền mặt' : 
                             order.paymentType === 'Card' ? 'Thẻ ngân hàng' : 
                             order.paymentType === 'Banking' ? 'Chuyển khoản' : 'Tiền mặt'}
                discountPercentage={order.discountPercentage}
                cashierName="Thu ngân"
                size="default"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}