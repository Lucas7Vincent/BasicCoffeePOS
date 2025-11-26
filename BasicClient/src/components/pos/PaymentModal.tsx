'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Order } from '@/types/pos';
import { formatCurrency } from '@/lib/utils';
import { CreditCard, Wallet, Banknote, Percent } from 'lucide-react';
import { PrintButton } from '@/components/common/PrintButton';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  order: Order;
  onPayment: (paymentType: 'Cash' | 'Card' | 'Banking', discountPercentage?: number) => void;
  cashierName?: string;
}

export function PaymentModal({ open, onClose, order, onPayment, cashierName = 'Thu ngân' }: PaymentModalProps) {
  const [selectedPaymentType, setSelectedPaymentType] = useState<'Cash' | 'Card' | 'Banking' | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [finalOrder, setFinalOrder] = useState<Order | null>(null);

  const paymentMethods = [
    {
      type: 'Cash' as const,
      label: 'Tiền mặt',
      icon: Banknote,
      color: 'text-green-600',
    },
    {
      type: 'Card' as const,
      label: 'Thẻ ngân hàng',
      icon: CreditCard,
      color: 'text-blue-600',
    },
    {
      type: 'Banking' as const,
      label: 'Chuyển khoản',
      icon: Wallet,
      color: 'text-purple-600',
    },
  ];

  // ✅ ADD: Calculate discount amounts
  const discountCalculation = useMemo(() => {
    const originalAmount = order.totalAmount;
    const discountAmount = (originalAmount * discountPercentage) / 100;
    const finalAmount = originalAmount - discountAmount;
    
    return {
      originalAmount,
      discountAmount,
      finalAmount: Math.max(0, finalAmount), // Ensure non-negative
    };
  }, [order.totalAmount, discountPercentage]);

  const handlePayment = () => {
    if (selectedPaymentType) {
      // Create final order with payment details
      const orderWithPayment = {
        ...order,
        paymentMethod: getPaymentMethodName(selectedPaymentType),
        discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
        totalAmount: discountCalculation.finalAmount,
        paidAt: new Date()
      };

      setFinalOrder(orderWithPayment);
      setPaymentCompleted(true);
      
      // Call parent payment handler
      onPayment(selectedPaymentType, discountPercentage > 0 ? discountPercentage : undefined);
    }
  };

  const getPaymentMethodName = (type: 'Cash' | 'Card' | 'Banking'): string => {
    const names = {
      'Cash': 'Tiền mặt',
      'Card': 'Thẻ ngân hàng', 
      'Banking': 'Chuyển khoản'
    };
    return names[type];
  };

  const handleClose = () => {
    onClose();
    // Reset all states
    setTimeout(() => {
      setPaymentCompleted(false);
      setFinalOrder(null);
      setDiscountPercentage(0);
      setSelectedPaymentType(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {paymentCompleted ? '✅ Thanh toán thành công' : 'Thanh toán đơn hàng'}
          </DialogTitle>
        </DialogHeader>

        {paymentCompleted && finalOrder ? (
          // ✅ Payment Success Screen
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-green-600 text-2xl mb-2">🎉</div>
                <h3 className="font-semibold text-lg">Thanh toán thành công!</h3>
                <p className="text-muted-foreground text-sm">
                  Đơn hàng #{finalOrder.id} đã được thanh toán
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h4 className="font-medium">In hóa đơn:</h4>
              <div className="grid grid-cols-1 gap-2">
                <PrintButton
                  order={finalOrder}
                  variant="customer"
                  paymentMethod={finalOrder.paymentMethod}
                  discountPercentage={finalOrder.discountPercentage}
                  cashierName={cashierName}
                  size="default"
                />
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleClose}
            >
              Đóng
            </Button>
          </div>
        ) : (
          // ✅ Payment Form Screen
          <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bàn:</span>
                  <span className="font-medium">{order.tableName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số món:</span>
                  <span className="font-medium">{order.items.length} món</span>
                </div>
                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính:</span>
                    <span>{formatCurrency(discountCalculation.originalAmount)}</span>
                  </div>
                  {discountPercentage > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá ({discountPercentage}%):</span>
                      <span>-{formatCurrency(discountCalculation.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold border-t pt-1">
                    <span>Thanh toán:</span>
                    <span className="text-primary">{formatCurrency(discountCalculation.finalAmount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discount Input */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Label htmlFor="discount" className="flex items-center gap-2 text-sm font-medium">
                  <Percent className="h-4 w-4 text-amber-600" />
                  Giảm giá (%)
                </Label>
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={discountPercentage || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setDiscountPercentage(Math.min(100, Math.max(0, value)));
                  }}
                  placeholder="Nhập % giảm giá (0-100)"
                  className="text-center"
                />
                {discountPercentage > 0 && (
                  <div className="text-xs text-center text-muted-foreground">
                    Tiết kiệm: {formatCurrency(discountCalculation.discountAmount)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h3 className="font-medium">Chọn phương thức thanh toán:</h3>
            <div className="grid grid-cols-1 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Button
                    key={method.type}
                    variant={selectedPaymentType === method.type ? "default" : "outline"}
                    className="justify-start gap-3 h-12"
                    onClick={() => setSelectedPaymentType(method.type)}
                  >
                    <Icon className={`h-5 w-5 ${method.color}`} />
                    {method.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Hủy
            </Button>
            <Button 
              className="flex-1" 
              onClick={handlePayment}
              disabled={!selectedPaymentType}
            >
              Thanh toán
            </Button>
          </div>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}