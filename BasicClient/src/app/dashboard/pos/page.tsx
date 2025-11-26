'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TableGrid } from '@/components/pos/TableGrid';
import { ProductGrid } from '@/components/pos/ProductGrid';
import { OrderCart } from '@/components/pos/OrderCart';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { usePOSStore } from '@/stores/posStore';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/lib/api';
import { Table, Product, Category, Order } from '@/types/pos';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, CreditCard } from 'lucide-react';

export default function POSPage() {
  const [step, setStep] = useState<'select-table' | 'order'>('select-table');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // ✅ Auto sync debounce ref
  const autoSyncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const {
    selectedTable,
    cart,
    setSelectedTable,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    calculateTotal,
    loadOrderItems,
    updateCartItemNotes, // ✅ ADD: Notes update method
  } = usePOSStore();

  // Queries
  const { data: tables = [] } = useQuery<Table[]>({
    queryKey: ['tables'],
    queryFn: () => apiClient.getTables(),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient.getOrders(),
    refetchInterval: 5000, // Refresh every 5 seconds để check real-time
  });

  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => apiClient.getProducts(),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
  });

  // Mutations
  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => apiClient.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Đơn hàng đã được tạo thành công!');
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: (paymentData: any) => apiClient.createPayment(paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Thanh toán thành công!');
      handleReset();
    },
  });

  // Enhanced tables with active order status
  // Enhanced tables với active order status (chỉ khi có items thật)
  const enhancedTables = tables.map(table => {
    const activeOrder = orders.find((order: any) => 
      order.tableId === table.id && 
      order.status === 'Ordering'  // Only count Ordering orders, exclude Cancelled/Paid
    );
    
    // ✅ FIX: Order có thể tồn tại nhưng không có items (empty order)
    // Chỉ считать là active khi thực sự có items hoặc totalAmount > 0
    const hasActiveOrder = activeOrder && (
      (activeOrder.itemCount && activeOrder.itemCount > 0) || 
      (activeOrder.totalAmount && activeOrder.totalAmount > 0)
    );
    
    // Debug log để track table status
    if (activeOrder) {
      console.log(`🏓 Table ${table.tableName}:`, {
        orderId: activeOrder.id,
        status: activeOrder.status,
        totalAmount: activeOrder.totalAmount,
        itemCount: activeOrder.itemCount || 0,
        hasActiveOrder: Boolean(hasActiveOrder),
        // ✅ ADD: Check if this is an empty order that should be ignored
        isEmpty: !hasActiveOrder && activeOrder.status === 'Ordering'
      });
    }
    
    return {
      ...table,
      hasActiveOrder: Boolean(hasActiveOrder)
    };
  });

  // Handlers
  const handleTableSelect = async (table: Table) => {
    setSelectedTable(table);
    
    // ✅ FIX: Always refresh orders data trước khi check để có data fresh nhất
    console.log('🔄 Refreshing orders data để check fresh table status...');
    await queryClient.refetchQueries({ queryKey: ['orders'] });
    
    // ✅ Get fresh orders data sau khi refetch
    const freshOrders = queryClient.getQueryData(['orders']) as any[] || [];
    
    // ✅ Tìm ANY order với status 'Ordering' (không check itemCount vì có thể được cancel rồi)
    const activeOrder = freshOrders.find((order: any) => 
      order.tableId === table.id && order.status === 'Ordering'
    );
    
    console.log('🔍 Fresh table selection check:', {
      tableId: table.id,
      tableName: table.tableName,
      hasActiveOrderFlag: table.hasActiveOrder,
      foundFreshActiveOrder: !!activeOrder,
      freshActiveOrderId: activeOrder?.id,
      freshActiveOrderStatus: activeOrder?.status,
      freshItemCount: activeOrder?.itemCount || 0,
      freshTotalAmount: activeOrder?.totalAmount || 0
    });
    
    if (activeOrder) {
      console.log('📋 Found active order for table:', activeOrder);
      
      try {
        // ✅ FIX: Force invalidate cache trước khi load để đảm bảo fresh data
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['order', activeOrder.id] });
        
        // Wait một chút để cache clear
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Lấy chi tiết order với items (fresh from server)
        const orderResponse = await apiClient.getOrder(activeOrder.id);
        console.log('📄 Order response loaded (fresh):', orderResponse);
        
        // Clear cart hiện tại và load items từ order
        clearCart();
        
        // ✅ FIX: Backend trả về {order: {items: []}, items: []} 
        const orderItems = orderResponse.order?.items || orderResponse.items || [];
        console.log('📋 Order items found (fresh):', orderItems, 'Length:', orderItems.length);
        
        // Load items vào cart với đúng quantity
        if (orderItems && orderItems.length > 0) {
          loadOrderItems(orderItems, products);
          const totalItems = orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
          toast.success(`📋 ${table.tableName} (${totalItems} món)`, {
            duration: 2000,
            icon: '📝',
          });
        } else {
          console.log('🚫 Order has no items - cart will remain empty');
          // ✅ Removed confusing toast - user sẽ thấy empty cart là đủ
        }
      } catch (error: any) {
        console.error('❌ Error loading order details:', error);
        toast.error('Không thể tải thông tin đơn hàng hiện tại');
      }
    } else {
      // Bàn trống, clear cart để bắt đầu order mới
      clearCart();
      toast.success(`🎯 ${table.tableName}`, {
        duration: 1500,
        icon: '🆕',
      });
    }
    
    setStep('order');
  };

  // ✅ DEBOUNCED AUTO SYNC: Tránh quá nhiều API calls
  const triggerAutoSync = () => {
    if (!selectedTable?.hasActiveOrder) return;
    
    console.log('🔔 Triggering auto sync for cart changes...', { cartLength: cart.length });
    
    // Clear timeout cũ nếu có
    if (autoSyncTimeoutRef.current) {
      clearTimeout(autoSyncTimeoutRef.current);
    }
    
    // Set timeout mới
    autoSyncTimeoutRef.current = setTimeout(() => {
      handleAutoSyncCart();
    }, 1000); // 1 giây debounce
  };

  const handleProductAdd = (product: Product) => {
    addToCart(product);
    // ✅ Removed verbose notification - visual cart update is sufficient feedback
    triggerAutoSync();
  };

  const handleUpdateCartItem = (productId: number, quantity: number) => {
    const itemBefore = cart.find(item => item.productId === productId);
    const cartLengthAfter = quantity <= 0 ? cart.length - 1 : cart.length;
    
    updateCartItem(productId, quantity);
    
    console.log('📝 Updated cart item:', {
      productId,
      productName: itemBefore?.productName,
      oldQuantity: itemBefore?.quantity,
      newQuantity: quantity,
      cartLengthAfter,
      willBeEmpty: cartLengthAfter === 0
    });
    
    // ✅ Special handling khi update quantity làm cart empty
    if (cartLengthAfter === 0 && selectedTable?.hasActiveOrder) {
      // ✅ Removed duplicate notification - auto-sync will show final result
    }
    
    triggerAutoSync();
  };

  const handleRemoveFromCart = (productId: number) => {
    const itemToRemove = cart.find(item => item.productId === productId);
    const remainingCartLength = cart.length - 1;
    
    removeFromCart(productId);
    
    console.log('🗑️ Removed item from cart:', {
      productId,
      productName: itemToRemove?.productName,
      remainingCartLength,
      selectedTableActiveOrder: selectedTable?.hasActiveOrder,
      willBeEmpty: remainingCartLength === 0
    });
    
    // ✅ Removed verbose notification - visual cart update is sufficient
    
    // ✅ Special handling khi xóa hết items
    if (remainingCartLength === 0 && selectedTable?.hasActiveOrder) {
      // ✅ Removed duplicate notification - auto-sync will show final result
    }
    
    triggerAutoSync();
  };

  // ✅ ADD: Handle notes update
  const handleNotesUpdate = (productId: number, notes: string) => {
    updateCartItemNotes(productId, notes);
    triggerAutoSync(); // Auto-sync notes changes
  };

  const handleSaveOrder = async () => {
    if (!selectedTable || cart.length === 0 || !user) return;

    try {
      console.log('🛒 Saving order with items:', cart);
      console.log('🏓 Table info:', {
        id: selectedTable.id,
        name: selectedTable.tableName,
        hasActiveOrderFlag: selectedTable.hasActiveOrder
      });
      
      let orderId: number;
      
      // ✅ FIX: Always check backend directly để tránh hasActiveOrder flag ko chính xác
      const activeOrder = orders.find((order: any) => 
        order.tableId === selectedTable.id && order.status === 'Ordering'
      );
      
      console.log('🔍 Backend check result:', {
        foundActiveOrder: !!activeOrder,
        activeOrderId: activeOrder?.id,
        activeOrderStatus: activeOrder?.status,
        willCreateNewOrder: !activeOrder
      });
      
      if (activeOrder) {
        // Update existing order
        orderId = activeOrder.id;
        console.log('🔄 Updating existing order:', orderId);
        
        // Xóa tất cả items hiện tại của order (để thay thế)
        const existingOrderResponse = await apiClient.getOrder(orderId);
        const existingItems = existingOrderResponse.order?.items || existingOrderResponse.items || [];
        console.log('🗑️ Deleting existing items:', existingItems);
        
        let orderWasCancelled = false;
        if (existingItems && existingItems.length > 0) {
          for (const item of existingItems) {
            try {
              const deleteResponse = await apiClient.deleteOrderItem(orderId, item.id);
              // ✅ Check nếu order bị auto-cancelled sau khi xóa item cuối
              if (deleteResponse?.orderCancelled) {
                console.log('🛑 Order was auto-cancelled, will create new order');
                orderWasCancelled = true;
                break;
              }
            } catch (error: any) {
              console.log('⚠️ Delete item error:', error?.message);
              // Nếu lỗi vì order đã cancelled, set flag
              if (error?.response?.status === 400 || error?.response?.data?.message?.includes('not in ordering state')) {
                orderWasCancelled = true;
                break;
              }
            }
          }
        }
        
        // ✅ Nếu order bị cancelled, tạo order mới
        if (orderWasCancelled) {
          console.log('🆕 Creating new order because old one was cancelled');
          const orderData = {
            tableId: selectedTable.id,
          };
          const order = await createOrderMutation.mutateAsync(orderData);
          orderId = order.id;
          console.log('✅ New order created:', order);
        }
      } else {
        // Tạo order mới
        const orderData = {
          tableId: selectedTable.id,
        };
        console.log('📝 Creating new order:', orderData);
        const order = await createOrderMutation.mutateAsync(orderData);
        orderId = order.id;
        console.log('✅ Order created:', order);
      }

      // Thêm tất cả items từ cart vào order
      for (const item of cart) {
        const itemData = {
          productId: item.productId,
          quantity: item.quantity,
          notes: item.notes || null, // ✅ ADD: Include notes when saving
        };
        console.log(`➕ Adding item to order ${orderId}:`, itemData);
        await apiClient.addOrderItem(orderId, itemData);
      }

      console.log('✅ All items saved successfully');
      toast.success(selectedTable.hasActiveOrder ? 'Đơn hàng đã được cập nhật!' : 'Đơn hàng đã được lưu thành công!');
      
      // Refresh orders để cập nhật UI
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (error: any) {
      console.error('❌ Save order error:', error);
      toast.error('Lỗi khi lưu đơn hàng: ' + (error?.response?.data?.message || error?.message || 'Lỗi không xác định'));
    }
  };

  const handlePayment = async (paymentType: 'Cash' | 'Card' | 'Banking', discountPercentage?: number) => {
    if (!selectedTable || cart.length === 0) return;

    try {
      console.log('💳 Processing payment:', { paymentType, total: calculateTotal(), discountPercentage });
      
      let orderId: number;
      
      // ✅ FIX: Always check backend directly để tránh hasActiveOrder flag ko chính xác
      const activeOrder = orders.find((order: any) => 
        order.tableId === selectedTable.id && order.status === 'Ordering'
      );
      
      if (activeOrder) {
        // ✅ Kiểm tra xem order có thực sự còn tồn tại và đang ở trạng thái Ordering không
        try {
          const orderCheck = await apiClient.getOrder(activeOrder.id);
          if (orderCheck.order?.status === 'Ordering' || orderCheck.status === 'Ordering') {
            // Order còn valid, sử dụng nó
            orderId = activeOrder.id;
            console.log('💳 Using existing order for payment:', orderId);
          } else {
            // Order đã không còn ở trạng thái Ordering, tạo mới
            console.log('⚠️ Order not in Ordering state, creating new order');
            throw new Error('Order not valid');
          }
        } catch (error) {
          // Nếu order không valid hoặc bị lỗi, tạo order mới
          console.log('🆕 Creating new order for payment because old one is invalid');
          const orderData = {
            tableId: selectedTable.id,
          };
          const order = await createOrderMutation.mutateAsync(orderData);
          orderId = order.id;
          
          // Thêm items vào order mới
          for (const item of cart) {
            await apiClient.addOrderItem(orderId, {
              productId: item.productId,
              quantity: item.quantity,
              notes: item.notes || null,
            });
          }
          console.log('✅ New order created with items for payment:', orderId);
        }
        
        // Update existing order với cart hiện tại
        const existingOrderResponse = await apiClient.getOrder(orderId);
        const existingItems = existingOrderResponse.order?.items || existingOrderResponse.items || [];
        
        // Xóa items cũ
        if (existingItems && existingItems.length > 0) {
          for (const item of existingItems) {
            await apiClient.deleteOrderItem(orderId, item.id);
          }
        }
        
        // Thêm items mới từ cart
        for (const item of cart) {
          const itemData = {
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes || null, // ✅ ADD: Include notes when processing payment
          };
          await apiClient.addOrderItem(orderId, itemData);
        }
      } else {
        // Tạo order mới
        const orderData = {
          tableId: selectedTable.id,
        };
        console.log('📝 Creating new order for payment:', orderData);

        const order = await createOrderMutation.mutateAsync(orderData);
        orderId = order.id;
        console.log('✅ Order created for payment:', order);

        // Thêm items vào order mới
        for (const item of cart) {
          const itemData = {
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes || null, // ✅ ADD: Include notes when creating new order for payment
          };
          console.log(`➕ Adding item to order ${orderId}:`, itemData);
          await apiClient.addOrderItem(orderId, itemData);
        }
      }

      // Tạo payment với đúng format backend cần
      const paymentData = {
        OrderID: orderId,  // ✅ FIX: Backend cần OrderID (không phải orderId)
        PaymentType: paymentType,  // ✅ FIX: Backend cần PaymentType
        discountPercentage: discountPercentage || 0,  // ✅ ADD: Include discount from UI
      };
      console.log('💰 Creating payment:', paymentData);

      await createPaymentMutation.mutateAsync(paymentData);
      console.log('✅ Payment processed successfully');
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      toast.error('Lỗi khi xử lý thanh toán: ' + (error?.response?.data?.message || error?.message || 'Lỗi không xác định'));
    }
  };

  // ✅ AUTO SYNC: Tự động sync cart với database cho existing orders
  const handleAutoSyncCart = async () => {
    if (!selectedTable) return;
    
    try {
      // ✅ FIX: Always check backend directly để tránh hasActiveOrder flag ko chính xác
      const activeOrder = orders.find((order: any) => 
        order.tableId === selectedTable.id && order.status === 'Ordering'
      );
      
      if (!activeOrder) return;
      
      console.log('🔄 Auto syncing cart with database...', { cartItems: cart.length });
      
      // Lấy items hiện tại từ database
      const existingOrderResponse = await apiClient.getOrder(activeOrder.id);
      const existingItems = existingOrderResponse.order?.items || existingOrderResponse.items || [];
      
      // Xóa tất cả items cũ
      if (existingItems && existingItems.length > 0) {
        for (const item of existingItems) {
          try {
            const deleteResponse = await apiClient.deleteOrderItem(activeOrder.id, item.id);
            // Nếu order đã bị auto-cancelled, dừng vòng lặp
            if (deleteResponse?.orderCancelled) {
              console.log('🛑 Order auto-cancelled, stopping delete loop');
              break;
            }
          } catch (error: any) {
            // Bỏ qua lỗi nếu order đã bị cancelled hoặc item không tồn tại
            console.log('⚠️ Delete item error (may be already cancelled):', error?.message);
            break;
          }
        }
      }
      
      // Thêm items mới từ cart (nếu có)
      if (cart.length > 0) {
        for (const item of cart) {
          const itemData = {
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes || null, // ✅ ADD: Include notes when syncing
          };
          await apiClient.addOrderItem(activeOrder.id, itemData);
        }
      } else {
        // ✅ FIX: Nếu cart empty, đánh dấu order là cancelled để clean up
        console.log('🗑️ Cart is empty, marking order as cancelled to clean up...');
        try {
          const cancelResponse = await apiClient.updateOrderStatus(activeOrder.id, 'Cancelled');
          if (cancelResponse?.alreadyInStatus) {
            console.log('ℹ️ Order already cancelled');
          } else {
            console.log('✅ Empty order marked as cancelled');
          }
        } catch (error: any) {
          // ✅ Bỏ qua lỗi nếu order đã cancelled hoặc không tồn tại
          console.log('⚠️ Could not cancel order (may be already cancelled):', error?.response?.data?.message || error?.message);
          // Don't show error to user - this is expected behavior
        }
      }
      
      // Refresh orders data để cập nhật UI và table status
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.invalidateQueries({ queryKey: ['order', activeOrder.id] });
      
      // ✅ FIX: Force refetch và WAIT for completion để đảm bảo data fresh
      await queryClient.refetchQueries({ queryKey: ['orders'] });
      
      // ✅ CRITICAL: Wait extra time để đảm bảo backend processing hoàn thành
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Cart synced successfully', { 
        removed: existingItems.length, 
        added: cart.length,
        orderId: activeOrder.id,
        orderCancelled: cart.length === 0
      });
      
      // ✅ Show subtle feedback khi auto-clear table
      if (cart.length === 0) {
        // ✅ CRITICAL: Invalidate tất cả queries liên quan để đảm bảo data fresh
        await queryClient.invalidateQueries({ queryKey: ['orders'] });
        await queryClient.invalidateQueries({ queryKey: ['tables'] });
        
        // ✅ Force refetch để UI update ngay lập tức
        await queryClient.refetchQueries({ queryKey: ['orders'] });
        await queryClient.refetchQueries({ queryKey: ['tables'] });
        
        // ✅ CRITICAL: Clear local selected table để force UI re-render
        clearCart();
        setSelectedTable(null);
        setStep('select-table');
        
        setTimeout(() => {
          toast('✅ Bàn đã được clear', {
            duration: 1500,
            style: {
              background: '#22c55e',
              color: 'white',
            },
          });
        }, 300); // Faster feedback
      }
      
    } catch (error: any) {
      console.error('❌ Auto sync failed:', error);
      // ✅ Force refresh data ngay cả khi có lỗi
      await queryClient.invalidateQueries({ queryKey: ['orders'] });
      await queryClient.invalidateQueries({ queryKey: ['tables'] });
      
      // Show error nếu auto-sync fail để user biết
      if (cart.length === 0) {
        toast.error('⚠️ Lỗi khi clear bàn - Vui lòng thử lại');
      }
    }
  };

  const handleReset = () => {
    setSelectedTable(null);
    clearCart();
    setStep('select-table');
    setShowPaymentModal(false);
  };

  // ✅ Cleanup timeout khi component unmount
  useEffect(() => {
    return () => {
      if (autoSyncTimeoutRef.current) {
        clearTimeout(autoSyncTimeoutRef.current);
      }
    };
  }, []);

  const canProceedToPayment = cart.length > 0 && selectedTable;
  const total = calculateTotal();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">POS - Bán hàng</h1>
          <p className="text-muted-foreground">
            {step === 'select-table' 
              ? 'Chọn bàn để bắt đầu order' 
              : selectedTable?.hasActiveOrder 
                ? `Bàn: ${selectedTable?.tableName} (Đang có order)` 
                : `Bàn: ${selectedTable?.tableName} (Order mới)`
            }
          </p>
        </div>

        {step === 'order' && (
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Chọn bàn khác
          </Button>
        )}
      </div>

      {step === 'select-table' && (
        <Card>
          <CardHeader>
            <CardTitle>Chọn bàn</CardTitle>
          </CardHeader>
          <CardContent>
            <TableGrid
              tables={enhancedTables}
              onTableSelect={handleTableSelect}
            />
          </CardContent>
        </Card>
      )}

      {step === 'order' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Chọn sản phẩm</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductGrid
                  products={products}
                  categories={categories}
                  onProductAdd={handleProductAdd}
                />
              </CardContent>
            </Card>
          </div>

          {/* Cart */}
          <div className="space-y-4">
            <OrderCart
              items={cart}
              onUpdateQuantity={handleUpdateCartItem}
              onRemoveItem={handleRemoveFromCart}
              onUpdateNotes={handleNotesUpdate}
              total={total}
              tableName={selectedTable?.tableName}
              cashierName={user?.fullName || 'Thu ngân'}
            />

            {cart.length > 0 && (
              <div className="space-y-2">
                <Button
                  className="w-full gap-2"
                  onClick={handleSaveOrder}
                  disabled={createOrderMutation.isPending}
                >
                  <Save className="h-4 w-4" />
                  {createOrderMutation.isPending 
                    ? 'Đang lưu...' 
                    : selectedTable?.hasActiveOrder 
                      ? 'Cập nhật đơn hàng' 
                      : 'Lưu đơn hàng'
                  }
                </Button>

                <Button
                  className="w-full gap-2"
                  variant="secondary"
                  onClick={() => setShowPaymentModal(true)}
                  disabled={!canProceedToPayment}
                >
                  <CreditCard className="h-4 w-4" />
                  Thanh toán ngay
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {selectedTable && (
        <PaymentModal
          open={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          order={{
            id: Date.now(), // Temporary ID for display
            tableId: selectedTable.id,
            tableName: selectedTable.tableName,
            items: cart,
            totalAmount: total,
            status: 'Ordering',
          }}
          onPayment={handlePayment}
          cashierName={user?.fullName || 'Thu ngân'}
        />
      )}
    </div>
  );
}