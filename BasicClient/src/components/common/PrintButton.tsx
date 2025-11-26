'use client';

import { Button } from '@/components/ui/button';
import { usePrint } from '@/hooks/usePrint';
import { Order } from '@/types/pos';
import { ChefHat, Receipt, Printer } from 'lucide-react';

interface PrintButtonProps {
  order: Order;
  variant: 'kitchen' | 'temporary' | 'customer' | 'reprint';
  paymentMethod?: string;
  discountPercentage?: number;
  cashierName?: string;
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function PrintButton({
  order,
  variant,
  paymentMethod = 'Tiền mặt',
  discountPercentage,
  cashierName = 'Thu ngân',
  size = 'default',
  disabled = false,
  className = ''
}: PrintButtonProps) {
  const { printKitchenOrder, printTemporaryReceipt, printCustomerReceipt, isLoading } = usePrint();

  const handlePrint = () => {
    switch (variant) {
      case 'kitchen':
        printKitchenOrder(order, cashierName);
        break;
      case 'temporary':
        printTemporaryReceipt(order, cashierName);
        break;
      case 'customer':
      case 'reprint':
        printCustomerReceipt(order, paymentMethod, cashierName, discountPercentage);
        break;
    }
  };

  const getButtonConfig = () => {
    switch (variant) {
      case 'kitchen':
        return {
          icon: <ChefHat className="h-4 w-4" />,
          text: '🍽️ In chuẩn bị',
          variant: 'outline' as const,
          className: 'text-orange-600 border-orange-200 hover:bg-orange-50'
        };
      case 'temporary':
        return {
          icon: <Receipt className="h-4 w-4" />,
          text: '🧾 In tạm tính',
          variant: 'outline' as const,
          className: 'text-blue-600 border-blue-200 hover:bg-blue-50'
        };
      case 'customer':
        return {
          icon: <Printer className="h-4 w-4" />,
          text: '✅ In hóa đơn',
          variant: 'default' as const,
          className: 'bg-green-600 hover:bg-green-700 text-white'
        };
      case 'reprint':
        return {
          icon: <Printer className="h-4 w-4" />,
          text: '🔄 In lại',
          variant: 'outline' as const,
          className: 'text-gray-600 border-gray-200 hover:bg-gray-50'
        };
    }
  };

  const config = getButtonConfig();

  return (
    <Button
      variant={config.variant}
      size={size}
      onClick={handlePrint}
      disabled={disabled || isLoading}
      className={`flex items-center gap-2 ${config.className} ${className}`}
    >
      {config.icon}
      <span className={size === 'sm' ? 'text-xs' : ''}>{config.text}</span>
    </Button>
  );
}
