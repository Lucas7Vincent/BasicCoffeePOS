'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Order } from '@/types/pos';
import { 
  CreditCard, 
  Wallet, 
  Banknote, 
  Printer, 
  Copy, 
  Settings 
} from 'lucide-react';

interface PrintSettingsModalProps {
  open: boolean;
  onClose: () => void;
  order: Order;
  onPrint: (paymentMethod: 'Cash' | 'Card' | 'Banking') => void;
}

export function PrintSettingsModal({ 
  open, 
  onClose, 
  order, 
  onPrint 
}: PrintSettingsModalProps) {
  const [copies, setCopies] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'Cash' | 'Card' | 'Banking' | null>(null);

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

  const handlePrint = () => {
    if (selectedPaymentMethod) {
      onPrint(selectedPaymentMethod);
      onClose();
    }
  };

  const handleClose = () => {
    // Reset trạng thái khi đóng
    setSelectedPaymentMethod(null);
    setCopies(1);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cài đặt in hóa đơn - Đơn hàng #{order.id}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Số bản in */}
          <div className="space-y-3">
            <Label htmlFor="print-copies" className="flex items-center gap-2">
              <Copy className="h-4 w-4 text-blue-600" />
              Số bản in
            </Label>
            <Input
              id="print-copies"
              type="number"
              min="1"
              max="5"
              value={copies}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1;
                setCopies(Math.min(5, Math.max(1, value)));
              }}
              placeholder="Nhập số bản in (1-5)"
              className="text-center"
            />
          </div>

          {/* Phương thức thanh toán */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Chọn phương thức thanh toán</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Button
                    key={method.type}
                    variant={selectedPaymentMethod === method.type ? "default" : "outline"}
                    className="justify-start gap-3 h-12"
                    onClick={() => setSelectedPaymentMethod(method.type)}
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
            >
              Hủy
            </Button>
            <Button 
              className="flex-1 flex items-center gap-2" 
              onClick={handlePrint}
              disabled={!selectedPaymentMethod}
            >
              <Printer className="h-4 w-4" />
              In hóa đơn
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
