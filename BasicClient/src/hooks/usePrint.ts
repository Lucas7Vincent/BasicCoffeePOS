import { useState } from 'react';
import { PrintService, KitchenOrderData, TemporaryReceiptData, CustomerReceiptData } from '@/services/printService';
import { Order } from '@/types/pos';

export function usePrint() {
  const [isLoading, setIsLoading] = useState(false);

  // 🍽️ In đơn hàng chuẩn bị (cho bếp)
  const printKitchenOrder = async (order: Order, cashierName?: string) => {
    try {
      setIsLoading(true);
      const kitchenData = PrintService.orderToKitchenData(order, cashierName);
      PrintService.printKitchenOrder(kitchenData);
    } catch (error) {
      console.error('Lỗi in đơn hàng chuẩn bị:', error);
      alert('Không thể in đơn hàng chuẩn bị. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // 🧾 In hóa đơn tạm tính (khách - chưa thanh toán)
  const printTemporaryReceipt = async (order: Order, cashierName: string) => {
    try {
      setIsLoading(true);
      const temporaryData = PrintService.orderToTemporaryReceiptData(order, cashierName);
      PrintService.printTemporaryReceipt(temporaryData);
    } catch (error) {
      console.error('Lỗi in hóa đơn tạm tính:', error);
      alert('Không thể in hóa đơn tạm tính. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ In hóa đơn chính thức (khách - đã thanh toán)
  const printCustomerReceipt = async (
    order: Order, 
    paymentMethod: string,
    cashierName: string,
    discountPercentage?: number
  ) => {
    try {
      setIsLoading(true);
      const customerData = PrintService.orderToCustomerReceiptData(
        order, 
        paymentMethod, 
        cashierName, 
        discountPercentage
      );
      PrintService.printCustomerReceipt(customerData);
    } catch (error) {
      console.error('Lỗi in hóa đơn chính thức:', error);
      alert('Không thể in hóa đơn chính thức. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    printKitchenOrder,
    printTemporaryReceipt,
    printCustomerReceipt,
    isLoading
  };
}
