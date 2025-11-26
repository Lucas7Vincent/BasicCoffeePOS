'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Order } from '@/types/pos';
import { formatCurrency } from '@/lib/utils';
import { PrintService } from '@/services/printService';
import { CreditCard, Wallet, Banknote, Percent, Printer } from 'lucide-react';

interface OrderPaymentModalProps {
  open: boolean;
  onClose: () => void;
  order: Order;
  onProcessPayment: (paymentType: 'Cash' | 'Card' | 'Banking', discountPercentage?: number) => void;
  isProcessing?: boolean;
}

export function OrderPaymentModal({ 
  open, 
  onClose, 
  order, 
  onProcessPayment, 
  isProcessing = false 
}: OrderPaymentModalProps) {
  const [selectedPaymentType, setSelectedPaymentType] = useState<'Cash' | 'Card' | 'Banking' | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [printCopies, setPrintCopies] = useState<number>(1);

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

  // Tính toán giảm giá
  const discountCalculation = useMemo(() => {
    const originalAmount = order.totalAmount || 0;
    const discountAmount = (originalAmount * discountPercentage) / 100;
    const finalAmount = originalAmount - discountAmount;
    
    return {
      originalAmount,
      discountAmount,
      finalAmount: Math.max(0, finalAmount),
    };
  }, [order.totalAmount, discountPercentage]);

  const handlePayment = () => {
    if (selectedPaymentType) {
      // Xử lý thanh toán
      onProcessPayment(selectedPaymentType, discountPercentage > 0 ? discountPercentage : undefined);
      
      // In hóa đơn
      PrintService.printPaymentReceipt(order, 
        { 
          method: selectedPaymentType, 
          amount: discountCalculation.finalAmount,
          timestamp: new Date() 
        },
        { 
          copies: printCopies,
          printType: 'payment_receipt' 
        }
      );

      // In phiếu bếp
      PrintService.printOrderPreparation(order, {
        copies: 1,
        printType: 'kitchen_slip'
      });

      // Reset trạng thái
      setDiscountPercentage(0);
      setSelectedPaymentType(null);
      setPrintCopies(1);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset trạng thái khi đóng
    setDiscountPercentage(0);
    setSelectedPaymentType(null);
    setPrintCopies(1);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xử lý thanh toán - Đơn hàng #{order.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Thông tin đơn hàng */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bàn:</span>
                  <span className="font-medium">{order.tableName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số món:</span>
                  <span className="font-medium">{order.items?.length || 0} món</span>
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

          {/* Cài đặt in */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Label htmlFor="print-copies" className="flex items-center gap-2 text-sm font-medium">
                  <Printer className="h-4 w-4 text-blue-600" />
                  Số bản in hóa đơn
                </Label>
                <Input
                  id="print-copies"
                  type="number"
                  min="1"
                  max="5"
                  value={printCopies}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 1;
                    setPrintCopies(Math.min(5, Math.max(1, value)));
                  }}
                  placeholder="Nhập số bản in (1-5)"
                  className="text-center"
                  disabled={isProcessing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Giảm giá */}
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
                  disabled={isProcessing}
                />
                {discountPercentage > 0 && (
                  <div className="text-xs text-center text-muted-foreground">
                    Tiết kiệm: {formatCurrency(discountCalculation.discountAmount)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Phương thức thanh toán */}
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
                    disabled={isProcessing}
                  >
                    <Icon className={`h-5 w-5 ${method.color}`} />
                    {method.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Nút thao tác */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={handleClose}
              disabled={isProcessing}
            >
              Hủy
            </Button>
            <Button 
              className="flex-1" 
              onClick={handlePayment}
              disabled={!selectedPaymentType || isProcessing}
            >
              {isProcessing ? 'Đang xử lý...' : 'Xử lý thanh toán'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
