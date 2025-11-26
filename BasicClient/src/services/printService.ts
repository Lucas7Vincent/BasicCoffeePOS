/**
 * Dịch vụ in ấn cho hệ thống POS
 * 
 * 3 loại in chính:
 * 1. 🍽️ In đơn hàng chuẩn bị (cho bếp) - khi chưa thanh toán
 * 2. 🧾 In hóa đơn tạm tính (cho khách) - khi chưa thanh toán  
 * 3. ✅ In hóa đơn chính thức (cho khách) - khi đã thanh toán
 */
import { Order, OrderItem } from '@/types/pos';
import { formatCurrency } from '@/lib/utils';

// Interface cho đơn hàng chuẩn bị (bếp)
export interface KitchenOrderData {
  orderNumber: string;
  tableNumber: number;
  items: Array<{
    productName: string;
    quantity: number;
    notes: string;
  }>;
  timestamp: Date;
  cashierName?: string;
}

// Interface cho hóa đơn tạm tính (khách - chưa thanh toán)
export interface TemporaryReceiptData {
  orderNumber: string;
  tableName: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    notes: string;
  }>;
  subtotal: number;
  timestamp: Date;
  cashierName: string;
}

// Interface cho hóa đơn chính thức (khách - đã thanh toán)
export interface CustomerReceiptData {
  orderNumber: string;
  tableName: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    notes: string;
  }>;
  subtotal: number;
  discountPercentage?: number;
  discountAmount?: number;
  total: number;
  paymentMethod: string;
  timestamp: Date;
  cashierName: string;
}

export class PrintService {
  // CSS chung cho máy in nhiệt 80mm
  private static getCommonStyles(): string {
    return `
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 10px;
          font-size: 12px;
          line-height: 1.3;
        }
        .receipt-container {
          max-width: 300px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          border-bottom: 1px dashed #000;
          padding-bottom: 8px;
          margin-bottom: 8px;
        }
        .title {
          font-size: 16px;
          font-weight: bold;
          margin: 0 0 5px 0;
        }
        .subtitle {
          font-size: 11px;
          color: #666;
          margin: 0;
        }
        .order-info {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          font-size: 11px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 10px 0;
        }
        .items-table th {
          border-bottom: 1px solid #000;
          padding: 3px 0;
          text-align: left;
          font-size: 11px;
          font-weight: bold;
        }
        .items-table td {
          padding: 2px 0;
          font-size: 11px;
          vertical-align: top;
        }
        .item-name {
          width: 60%;
        }
        .item-qty {
          width: 15%;
          text-align: center;
        }
        .item-price {
          width: 25%;
          text-align: right;
        }
        .notes {
          font-style: italic;
          color: #666;
          font-size: 10px;
          margin-left: 10px;
        }
        .total-section {
          border-top: 1px dashed #000;
          padding-top: 8px;
          margin-top: 8px;
        }
        .total-line {
          display: flex;
          justify-content: space-between;
          margin: 2px 0;
          font-size: 11px;
        }
        .total-line.final {
          font-weight: bold;
          font-size: 12px;
          border-top: 1px solid #000;
          padding-top: 3px;
          margin-top: 5px;
        }
        .footer {
          text-align: center;
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px dashed #000;
          font-size: 10px;
        }
        .emoji {
          font-size: 14px;
          margin-right: 5px;
        }
        @media print {
          @page { 
            margin: 0; 
            size: 80mm auto; 
          }
          body { 
            margin: 0;
            padding: 5px;
          }
        }
      </style>
    `;
  }

  // 🍽️ In đơn hàng chuẩn bị (cho bếp)
  static printKitchenOrder(data: KitchenOrderData): void {
    const html = this.generateKitchenOrderHtml(data);
    this.printToWindow(html, 'Đơn hàng chuẩn bị');
  }

  // 🧾 In hóa đơn tạm tính (khách - chưa thanh toán)
  static printTemporaryReceipt(data: TemporaryReceiptData): void {
    const html = this.generateTemporaryReceiptHtml(data);
    this.printToWindow(html, 'Hóa đơn tạm tính');
  }

  // ✅ In hóa đơn chính thức (khách - đã thanh toán)
  static printCustomerReceipt(data: CustomerReceiptData): void {
    const html = this.generateCustomerReceiptHtml(data);
    this.printToWindow(html, 'Hóa đơn thanh toán');
  }

  // Tạo HTML cho đơn hàng chuẩn bị (bếp)
  private static generateKitchenOrderHtml(data: KitchenOrderData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Đơn hàng chuẩn bị</title>
          ${this.getCommonStyles()}
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="title">
                <span class="emoji">🍽️</span>ĐƠN HÀNG CHUẨN BỊ
              </div>
              <div class="subtitle">Kitchen Order</div>
            </div>
            
            <div class="order-info">
              <span><strong>Đơn số:</strong> ${data.orderNumber}</span>
              <span><strong>Bàn:</strong> ${data.tableNumber}</span>
            </div>
            <div class="order-info">
              <span><strong>Thời gian:</strong> ${data.timestamp.toLocaleString('vi-VN')}</span>
            </div>
            ${data.cashierName ? `
            <div class="order-info">
              <span><strong>Thu ngân:</strong> ${data.cashierName}</span>
            </div>
            ` : ''}

            <table class="items-table">
              <thead>
                <tr>
                  <th class="item-name">Món ăn</th>
                  <th class="item-qty">SL</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map(item => `
                  <tr>
                    <td class="item-name">
                      ${item.productName}
                      ${item.notes ? `<div class="notes">📝 ${item.notes}</div>` : ''}
                    </td>
                    <td class="item-qty">${item.quantity}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              <strong>⏰ VUI LÒNG CHUẨN BỊ CẨN THẬN</strong><br>
              <small>Đơn hàng cho bếp - ${new Date().toLocaleTimeString('vi-VN')}</small>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Tạo HTML cho hóa đơn tạm tính (khách - chưa thanh toán)
  private static generateTemporaryReceiptHtml(data: TemporaryReceiptData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Hóa đơn tạm tính</title>
          ${this.getCommonStyles()}
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="title">
                <span class="emoji">🧾</span>HÓA ĐƠN TẠM TÍNH
              </div>
              <div class="subtitle">Temporary Receipt</div>
            </div>
            
            <div class="order-info">
              <span><strong>Số đơn:</strong> ${data.orderNumber}</span>
              <span><strong>Bàn:</strong> ${data.tableName}</span>
            </div>
            <div class="order-info">
              <span><strong>Thời gian:</strong> ${data.timestamp.toLocaleString('vi-VN')}</span>
            </div>
            <div class="order-info">
              <span><strong>Thu ngân:</strong> ${data.cashierName}</span>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th class="item-name">Món</th>
                  <th class="item-qty">SL</th>
                  <th class="item-price">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map(item => `
                  <tr>
                    <td class="item-name">
                      ${item.productName}
                      ${item.notes ? `<div class="notes">📝 ${item.notes}</div>` : ''}
                    </td>
                    <td class="item-qty">${item.quantity}</td>
                    <td class="item-price">${formatCurrency(item.subtotal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total-section">
              <div class="total-line final">
                <span>TỔNG TẠM TÍNH:</span>
                <span>${formatCurrency(data.subtotal)}</span>
              </div>
            </div>

            <div class="footer">
              <strong>⚠️ ĐÂY LÀ HÓA ĐƠN TẠM TÍNH</strong><br>
              <small>Chưa thanh toán - Vui lòng giữ hóa đơn này</small><br>
              <small>CoffeeBeer POS - ${new Date().toLocaleTimeString('vi-VN')}</small>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Tạo HTML cho hóa đơn chính thức (khách - đã thanh toán)
  private static generateCustomerReceiptHtml(data: CustomerReceiptData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Hóa đơn thanh toán</title>
          ${this.getCommonStyles()}
        </head>
        <body>
          <div class="receipt-container">
            <div class="header">
              <div class="title">
                <span class="emoji">✅</span>HÓA ĐƠN THANH TOÁN
              </div>
              <div class="subtitle">Payment Receipt</div>
            </div>
            
            <div class="order-info">
              <span><strong>Số đơn:</strong> ${data.orderNumber}</span>
              <span><strong>Bàn:</strong> ${data.tableName}</span>
            </div>
            <div class="order-info">
              <span><strong>Thời gian:</strong> ${data.timestamp.toLocaleString('vi-VN')}</span>
            </div>
            <div class="order-info">
              <span><strong>Thu ngân:</strong> ${data.cashierName}</span>
            </div>

            <table class="items-table">
              <thead>
                <tr>
                  <th class="item-name">Món</th>
                  <th class="item-qty">SL</th>
                  <th class="item-price">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${data.items.map(item => `
                  <tr>
                    <td class="item-name">
                      ${item.productName}
                      ${item.notes ? `<div class="notes">📝 ${item.notes}</div>` : ''}
                    </td>
                    <td class="item-qty">${item.quantity}</td>
                    <td class="item-price">${formatCurrency(item.subtotal)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total-section">
              <div class="total-line">
                <span>Tạm tính:</span>
                <span>${formatCurrency(data.subtotal)}</span>
              </div>
              ${data.discountPercentage ? `
              <div class="total-line">
                <span>Giảm giá (${data.discountPercentage}%):</span>
                <span>-${formatCurrency(data.discountAmount || 0)}</span>
              </div>
              ` : ''}
              <div class="total-line final">
                <span>TỔNG THANH TOÁN:</span>
                <span>${formatCurrency(data.total)}</span>
              </div>
              <div class="total-line">
                <span>Phương thức:</span>
                <span>${data.paymentMethod}</span>
              </div>
            </div>

            <div class="footer">
              <strong>🎉 CẢM ƠN QUÝ KHÁCH!</strong><br>
              <small>Đã thanh toán - Hẹn gặp lại</small><br>
              <small>CoffeeBeer POS - ${new Date().toLocaleTimeString('vi-VN')}</small>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  // Gửi HTML đến cửa sổ in
  private static printToWindow(html: string, title: string): void {
    try {
      const printWindow = window.open('', '_blank', 'width=400,height=600,scrollbars=yes');
      
      if (!printWindow) {
        throw new Error('Không thể mở cửa sổ in. Vui lòng kiểm tra popup blocker.');
      }

      printWindow.document.write(html);
      printWindow.document.close();

      // Đợi load xong rồi in
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        
        // Đóng cửa sổ sau khi in xong
        printWindow.onafterprint = () => {
          printWindow.close();
        };
      };

    } catch (error) {
      console.error('Lỗi in ấn:', error);
      alert(`Đã xảy ra lỗi khi in ${title}. Vui lòng thử lại.`);
    }
  }

  // Utility method để chuyển đổi Order sang KitchenOrderData
  static orderToKitchenData(order: Order, cashierName?: string): KitchenOrderData {
    return {
      orderNumber: (order.id || Date.now()).toString(),
      tableNumber: parseInt(order.tableName?.replace('Bàn ', '') || '0'),
      items: order.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        notes: item.notes || ''
      })),
      timestamp: new Date(),
      cashierName
    };
  }

  // Utility method để chuyển đổi Order sang TemporaryReceiptData
  static orderToTemporaryReceiptData(order: Order, cashierName: string): TemporaryReceiptData {
    return {
      orderNumber: (order.id || Date.now()).toString(),
      tableName: order.tableName || 'Không xác định',
      items: order.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        notes: item.notes || ''
      })),
      subtotal: order.totalAmount,
      timestamp: new Date(),
      cashierName
    };
  }

  // Utility method để chuyển đổi Order sang CustomerReceiptData
  static orderToCustomerReceiptData(
    order: Order, 
    paymentMethod: string,
    cashierName: string,
    discountPercentage?: number
  ): CustomerReceiptData {
    const discountAmount = discountPercentage ? (order.totalAmount * discountPercentage) / 100 : 0;
    const total = order.totalAmount - discountAmount;

    return {
      orderNumber: (order.id || Date.now()).toString(),
      tableName: order.tableName || 'Không xác định',
      items: order.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        notes: item.notes || ''
      })),
      subtotal: order.totalAmount,
      discountPercentage,
      discountAmount,
      total,
      paymentMethod,
      timestamp: new Date(),
      cashierName
    };
  }
}
