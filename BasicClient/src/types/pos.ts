export interface Category {
    id: number;
    categoryName: string;
    description?: string;
  }
  
  export interface Product {
    id: number;
    productName: string;
    categoryId: number;
    categoryName: string;
    unitPrice: number;
    description?: string;
  }
  
  export interface Table {
    id: number;
    tableName: string;
    seatingCapacity: number;
    description?: string;
    hasActiveOrder?: boolean;
  }
  
  export interface OrderItem {
    id?: number;
    orderId?: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    price: number; // ✅ ADD: Alias for unitPrice for compatibility
    subtotal: number;
    notes?: string; // ✅ ADD: Ghi chú cho món (VD: "Ít đường", "Thêm kem")
  }
  
  export interface Order {
    id?: number;
    tableId: number;
    tableName: string;
    userId?: number;
    username?: string;
    userFullName?: string;
    totalAmount: number;
    status: 'Ordering' | 'Paid' | 'Cancelled';
    orderDate?: string;
    // **🎯 PAYMENT FIELDS**
    paymentDate?: string;
    paymentMethod?: string; // ✅ CHANGED: Make it string for compatibility
    paymentType?: 'Cash' | 'Card' | 'Banking'; // ✅ KEEP: For backend compatibility
    displayDate?: string; // Computed field từ backend
    // **💰 DISCOUNT & PAYMENT DETAILS**
    discountPercentage?: number;
    discountAmount?: number;
    originalAmount?: number;
    finalAmount?: number; // ✅ ADD: Final amount after discount
    paidAmount?: number;
    paidAt?: string | Date; // ✅ ADD: Payment timestamp (string or Date)
    items: OrderItem[];
  }
  
  export interface Payment {
    id?: number;
    orderId: number;
    paymentType: 'Cash' | 'Card' | 'Banking';
    amount: number;
    paymentDate?: string;
    // ✅ ADD: Discount fields từ backend
    discountPercentage?: number;
    discountAmount?: number;
    originalAmount?: number;
  }
  
  export interface POSState {
    currentOrder: Order | null;
    selectedTable: Table | null;
    cart: OrderItem[];
    setCurrentOrder: (order: Order | null) => void;
    setSelectedTable: (table: Table | null) => void;
    addToCart: (product: Product) => void;
    updateCartItem: (productId: number, quantity: number) => void;
    removeFromCart: (productId: number) => void;
    clearCart: () => void;
    calculateTotal: () => number;
    loadOrderItems: (orderItems: any[], products: Product[]) => void;
    updateCartItemNotes: (productId: number, notes: string) => void; // ✅ ADD: Update notes method
  }