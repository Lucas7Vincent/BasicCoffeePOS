import { create } from 'zustand';
import { POSState, Order, Table, OrderItem, Product } from '@/types/pos';

export const usePOSStore = create<POSState>((set, get) => ({
  currentOrder: null,
  selectedTable: null,
  cart: [],

  setCurrentOrder: (order: Order | null) => {
    set({ currentOrder: order });
  },

  setSelectedTable: (table: Table | null) => {
    set({ selectedTable: table });
  },

  addToCart: (product: Product) => {
    const { cart } = get();
    const existingItem = cart.find(item => item.productId === product.id);

    if (existingItem) {
      set({
        cart: cart.map(item =>
          item.productId === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unitPrice,
              }
            : item
        ),
      });
    } else {
      const newItem: OrderItem = {
        productId: product.id,
        productName: product.productName,
        quantity: 1,
        unitPrice: product.unitPrice,
        subtotal: product.unitPrice,
      };
      set({ cart: [...cart, newItem] });
    }
  },

  updateCartItem: (productId: number, quantity: number) => {
    const { cart } = get();
    if (quantity <= 0) {
      set({ cart: cart.filter(item => item.productId !== productId) });
    } else {
      set({
        cart: cart.map(item =>
          item.productId === productId
            ? {
                ...item,
                quantity,
                subtotal: quantity * item.unitPrice,
              }
            : item
        ),
      });
    }
  },

  removeFromCart: (productId: number) => {
    const { cart } = get();
    set({ cart: cart.filter(item => item.productId !== productId) });
  },

  clearCart: () => {
    set({ cart: [] });
  },

  calculateTotal: () => {
    const { cart } = get();
    return cart.reduce((total, item) => total + item.subtotal, 0);
  },

  loadOrderItems: (orderItems: any[], products: Product[]) => {
    const cartItems: OrderItem[] = orderItems.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: product?.productName || item.productName || 'Unknown Product',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
        notes: item.notes || '', // ✅ ADD: Load notes từ backend
      };
    });
    set({ cart: cartItems });
  },

  // ✅ ADD: Method để update notes cho item
  updateCartItemNotes: (productId: number, notes: string) => {
    const { cart } = get();
    set({
      cart: cart.map(item =>
        item.productId === productId
          ? { ...item, notes }
          : item
      ),
    });
  },
}));