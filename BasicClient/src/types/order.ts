export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
}

export interface PaymentDetails {
  method: 'cash' | 'credit' | 'debit' | 'mobile';
  amount: number;
  timestamp: Date;
}
