const { pool, sql } = require('../config/db');
const validators = require('../utils/validators');

module.exports = {
  // ✅ FIX: Get all orders với separate timestamp fields
  getAll: async (req, res, next) => {
    try {
      console.log('📋 Getting all orders with proper datetime handling...');
      
      const result = await pool.request()
        .query(`
          SELECT 
            o.OrderID as id,
            o.OrderDate as orderDate,
            o.Status as status,
            -- ✅ FIX: Always return separate fields, let frontend decide
            CASE 
              WHEN o.Status = 'Ordering' THEN ISNULL((SELECT SUM(oi.Quantity * oi.UnitPrice) FROM OrderItems oi WHERE oi.OrderID = o.OrderID), 0)
              ELSE ISNULL(o.TotalAmount, 0)
            END as totalAmount,
            o.TableID as tableId,
            o.UserID as userId,
            t.TableName as tableName,
            u.Username as username,
            u.FullName as userFullName,
            -- ✅ FIX: Always return payment info separately
            p.PaymentDate as paymentDate,
            p.PaymentType as paymentType,
            ISNULL(p.DiscountPercentage, 0) as discountPercentage,
            -- ✅ ADD: Display date logic in backend for frontend reference
            CASE 
              WHEN o.Status = 'Paid' AND p.PaymentDate IS NOT NULL THEN p.PaymentDate
              ELSE o.OrderDate 
            END as displayDate,
            -- ✅ ADD: Item count for dashboard
            ISNULL((SELECT COUNT(*) FROM OrderItems oi WHERE oi.OrderID = o.OrderID), 0) as itemCount,
            -- ✅ ADD: Server timezone info for debugging
            SYSDATETIMEOFFSET() as serverTimeWithTimezone,
            GETUTCDATE() as serverUTCTime
          FROM Orders o
          JOIN Tables t ON o.TableID = t.TableID  
          JOIN Users u ON o.UserID = u.UserID
          LEFT JOIN Payments p ON o.OrderID = p.OrderID
          ORDER BY 
            -- ✅ FIX: Sort by display date but return separate fields
            CASE 
              WHEN o.Status = 'Paid' AND p.PaymentDate IS NOT NULL THEN p.PaymentDate
              ELSE o.OrderDate 
            END DESC
        `);
      
      // ✅ ADD: Enhanced logging với timezone info
      const sample = result.recordset[0];
      if (sample) {
        console.log('🕒 Server timezone debug:', {
          serverTimeWithTZ: sample.serverTimeWithTimezone,
          serverUTC: sample.serverUTCTime,
          sampleOrderDate: sample.orderDate,
          samplePaymentDate: sample.paymentDate,
          sampleDisplayDate: sample.displayDate
        });
      }
      
      console.log(`✅ Retrieved ${result.recordset.length} orders with enhanced datetime`);
      
      res.status(200).json({ 
        status: 'success', 
        data: result.recordset,
        meta: {
          total: result.recordset.length,
          serverTime: new Date().toISOString(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      });
    } catch (err) {
      console.error('❌ Get all orders error:', err);
      next(err);
    }
  },

  // ✅ FIX: Get order details với enhanced datetime
  getOrderDetails: async (req, res, next) => {
    try {
      const orderId = parseInt(req.params.orderId);

      if (isNaN(orderId)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid order ID' 
        });
      }

      console.log('📋 Getting order details for ID:', orderId);

      const orderResult = await pool.request()
        .input('OrderID', sql.Int, orderId)
        .query(`
          SELECT 
            o.OrderID as id, 
            o.OrderDate as orderDate,
            o.Status as status,
            -- ✅ FIX: Dynamic total calculation
            CASE 
              WHEN o.Status = 'Ordering' THEN ISNULL((SELECT SUM(oi.Quantity * oi.UnitPrice) FROM OrderItems oi WHERE oi.OrderID = o.OrderID), 0)
              ELSE ISNULL(o.TotalAmount, 0)
            END as totalAmount,
            o.TableID as tableId,
            o.UserID as userId,
            t.TableName as tableName, 
            u.Username as username,
            u.FullName as userFullName,
            -- ✅ FIX: Separate payment fields
            p.PaymentDate as paymentDate,
            p.PaymentType as paymentType,
            ISNULL(p.DiscountPercentage, 0) as discountPercentage,
            p.Amount as paidAmount,
            -- ✅ ADD: Display date for frontend
            CASE 
              WHEN o.Status = 'Paid' AND p.PaymentDate IS NOT NULL THEN p.PaymentDate
              ELSE o.OrderDate 
            END as displayDate
          FROM Orders o
          JOIN Tables t ON o.TableID = t.TableID
          JOIN Users u ON o.UserID = u.UserID
          LEFT JOIN Payments p ON o.OrderID = p.OrderID
          WHERE o.OrderID = @OrderID
        `);

      if (orderResult.recordset.length === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Order not found' 
        });
      }

      const itemsResult = await pool.request()
        .input('OrderID', sql.Int, orderId)
        .query(`
          SELECT 
            oi.OrderItemID as id,
            oi.ProductID as productId,
            p.ProductName as productName, 
            oi.Quantity as quantity, 
            oi.UnitPrice as unitPrice,
            oi.Notes as notes,
            (oi.Quantity * oi.UnitPrice) as subtotal,
            p.Available as productAvailable,
            c.CategoryName as categoryName
          FROM OrderItems oi
          JOIN Products p ON oi.ProductID = p.ProductID
          JOIN Categories c ON p.CategoryID = c.CategoryID
          WHERE oi.OrderID = @OrderID
          ORDER BY oi.OrderItemID
        `);

      const order = orderResult.recordset[0];
      
      console.log('✅ Order details retrieved with datetime debug:', {
        orderId: order.id,
        status: order.status,
        orderDate: order.orderDate,
        paymentDate: order.paymentDate,
        displayDate: order.displayDate,
        serverTime: new Date().toISOString()
      });

      res.status(200).json({
        status: 'success',
        data: {
          order: {
            ...order,
            items: itemsResult.recordset // Include items in order object for frontend
          },
          items: itemsResult.recordset, // Also separate for backward compatibility
          summary: {
            totalItems: itemsResult.recordset.length,
            totalQuantity: itemsResult.recordset.reduce((sum, item) => sum + item.quantity, 0),
            calculatedTotal: itemsResult.recordset.reduce((sum, item) => sum + item.subtotal, 0)
          }
        }
      });

    } catch (err) {
      console.error('❌ Get order details error:', err);
      next(err);
    }
  },

  // ✅ FIX: Create order với proper datetime
  createOrder: async (req, res, next) => {
    try {
      const { tableId } = req.body;
      const userId = req.user?.id;
      
      console.log('🔍 Create Order Debug:', {
        tableId,
        userId,
        serverTime: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      });
      
      if (!tableId) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'tableId is required' 
        });
      }

      if (!userId) {
        console.log('❌ No userId found. User object:', req.user);
        return res.status(401).json({ 
          status: 'fail', 
          message: 'Authentication required - no user ID found' 
        });
      }

      // Validate table exists
      const tableCheck = await pool.request()
        .input('TableID', sql.Int, tableId)
        .query('SELECT TableID, TableName FROM Tables WHERE TableID = @TableID');

      if (tableCheck.recordset.length === 0) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Table does not exist' 
        });
      }

      // Check if table already has an active order
      const activeOrderCheck = await pool.request()
        .input('TableID', sql.Int, tableId)
        .query(`SELECT OrderID FROM Orders 
                WHERE TableID = @TableID AND Status = 'Ordering'`);

      if (activeOrderCheck.recordset.length > 0) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Table already has an active order in progress' 
        });
      }

      // ✅ FIX: Create order với explicit UTC time handling
      const insert = await pool.request()
        .input('TableID', sql.Int, tableId)
        .input('UserID', sql.Int, userId)
        .input('Status', sql.VarChar(20), 'Ordering')
        .query(`
          INSERT INTO Orders (TableID, UserID, Status, OrderDate) 
          OUTPUT INSERTED.OrderID, INSERTED.OrderDate, GETUTCDATE() as utcOrderDate
          VALUES (@TableID, @UserID, @Status, GETDATE())
        `);

      const newOrder = insert.recordset[0];
      
      console.log('✅ Order created successfully with datetime debug:', {
        orderId: newOrder.OrderID,
        localOrderDate: newOrder.OrderDate,
        utcOrderDate: newOrder.utcOrderDate,
        tableName: tableCheck.recordset[0].TableName,
        jsServerTime: new Date().toISOString()
      });

      res.status(201).json({ 
        status: 'success', 
        message: 'Order created successfully',
        data: { 
          id: newOrder.OrderID,
          orderDate: newOrder.OrderDate,
          tableName: tableCheck.recordset[0].TableName,
          status: 'Ordering'
        } 
      });
    } catch (err) {
      console.error('❌ Create order error:', err);
      next(err);
    }
  },

  addOrderItem: async (req, res, next) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const { productId, quantity } = req.body;

      if (isNaN(orderId)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid order ID' 
        });
      }

      if (!productId || !quantity || quantity <= 0) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'productId and quantity (positive integer) are required' 
        });
      }

      console.log('➕ Adding item to order:', { orderId, productId, quantity });

      // Check order exists and is in 'Ordering' status
      const orderCheck = await pool.request()
        .input('OrderID', sql.Int, orderId)
        .query('SELECT Status FROM Orders WHERE OrderID=@OrderID');
      
      if (orderCheck.recordset.length === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Order not found' 
        });
      }
      
      if (orderCheck.recordset[0].Status !== 'Ordering') {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Cannot add items to order that is not in ordering state' 
        });
      }
      
      // Check if product exists and is available
      const productCheck = await pool.request()
        .input('ProductID', sql.Int, productId)
        .query(`
          SELECT ProductID, ProductName, UnitPrice 
          FROM Products 
          WHERE ProductID = @ProductID AND ISNULL(Available, 1) = 1
        `);

      if (productCheck.recordset.length === 0) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Product not found or not available' 
        });
      }

      const product = productCheck.recordset[0];
      const unitPrice = product.UnitPrice;

      // Check if item already exists in order
      const existingItem = await pool.request()
        .input('OrderID', sql.Int, orderId)
        .input('ProductID', sql.Int, productId)
        .query(`
          SELECT OrderItemID, Quantity 
          FROM OrderItems 
          WHERE OrderID = @OrderID AND ProductID = @ProductID
        `);

      let result;
      if (existingItem.recordset.length > 0) {
        // Update existing item
        const newQuantity = existingItem.recordset[0].Quantity + quantity;
        const update = await pool.request()
          .input('OrderID', sql.Int, orderId)
          .input('ProductID', sql.Int, productId)
          .input('Quantity', sql.Int, newQuantity)
          .query(`
            UPDATE OrderItems 
            SET Quantity = @Quantity 
            WHERE OrderID = @OrderID AND ProductID = @ProductID
          `);
        
        result = { OrderItemID: existingItem.recordset[0].OrderItemID };
        console.log('✅ Updated existing item quantity:', newQuantity);
      } else {
        // Insert new order item
        const insert = await pool.request()
          .input('OrderID', sql.Int, orderId)
          .input('ProductID', sql.Int, productId)
          .input('Quantity', sql.Int, quantity)
          .input('UnitPrice', sql.Decimal(10,2), unitPrice)
          .input('Notes', sql.NVarChar(500), req.body.notes || null)
          .query(`
            INSERT INTO OrderItems (OrderID, ProductID, Quantity, UnitPrice, Notes ) 
            OUTPUT INSERTED.OrderItemID 
            VALUES (@OrderID, @ProductID, @Quantity, @UnitPrice, @Notes)
          `);
        
        result = insert.recordset[0];
        console.log('✅ Added new item to order');
      }

      res.status(201).json({ 
        status: 'success', 
        message: 'Item added to order successfully',
        data: { 
          id: result.OrderItemID,
          productName: product.ProductName,
          quantity: quantity,
          unitPrice: unitPrice,
          subtotal: quantity * unitPrice
        } 
      });
    } catch (err) {
      console.error('❌ Add order item error:', err);
      next(err);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const { status } = req.body;

      if (isNaN(orderId)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid order ID' 
        });
      }

      if (!status || !validators.isValidOrderStatus(status)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'status must be one of: Ordering, Paid, Cancelled' 
        });
      }

      console.log('🔄 Updating order status:', { orderId, status });

      // ✅ CHECK: Get current order status first
      const currentOrderCheck = await pool.request()
        .input('OrderID', sql.Int, orderId)
        .query('SELECT OrderID, Status FROM Orders WHERE OrderID=@OrderID');
      
      if (currentOrderCheck.recordset.length === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Order not found' 
        });
      }

      const currentStatus = currentOrderCheck.recordset[0].Status;
      console.log('📊 Current order status:', { orderId, currentStatus, requestedStatus: status });

      // ✅ If already in the requested status, return success (idempotent)
      if (currentStatus === status) {
        console.log('ℹ️ Order already in requested status, returning success');
        return res.status(200).json({ 
          status: 'success', 
          message: `Order already ${status}`,
          alreadyInStatus: true
        });
      }

      // ✅ Don't allow changing from Cancelled (except for specific cases)
      if (currentStatus === 'Cancelled' && status !== 'Cancelled') {
        console.log('⚠️ Cannot change status of cancelled order');
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Cannot change status of cancelled order',
          currentStatus: 'Cancelled'
        });
      }

      // ⚠️ WARNING: This method might conflict with payment processing
      if (status === 'Paid') {
        // Check if payment already exists
        const paymentCheck = await pool.request()
          .input('OrderID', sql.Int, orderId)
          .query('SELECT PaymentID FROM Payments WHERE OrderID = @OrderID');
        
        if (paymentCheck.recordset.length === 0) {
          return res.status(400).json({ 
            status: 'fail', 
            message: 'Cannot mark order as paid without payment record. Use /api/payments endpoint to process payment.' 
          });
        }
      }

      // Calculate total if changing to Paid status
      if (status === 'Paid') {
        const totalResult = await pool.request()
          .input('OrderID', sql.Int, orderId)
          .query(`
            SELECT ISNULL(SUM(Quantity * UnitPrice), 0) as calculatedTotal 
            FROM OrderItems 
            WHERE OrderID = @OrderID
          `);

        const calculatedTotal = totalResult.recordset[0].calculatedTotal;

        const update = await pool.request()
          .input('OrderID', sql.Int, orderId)
          .input('Status', sql.VarChar(20), status)
          .input('TotalAmount', sql.Decimal(10,2), calculatedTotal)
          .query('UPDATE Orders SET Status=@Status, TotalAmount=@TotalAmount WHERE OrderID=@OrderID');

        if (update.rowsAffected[0] === 0) {
          return res.status(404).json({ 
            status: 'fail', 
            message: 'Order not found' 
          });
        }
      } else {
        const update = await pool.request()
          .input('OrderID', sql.Int, orderId)
          .input('Status', sql.VarChar(20), status)
          .query('UPDATE Orders SET Status=@Status WHERE OrderID=@OrderID');

        if (update.rowsAffected[0] === 0) {
          return res.status(404).json({ 
            status: 'fail', 
            message: 'Order not found' 
          });
        }
      }

      console.log('✅ Order status updated successfully');

      res.status(200).json({ 
        status: 'success', 
        message: 'Order status updated successfully' 
      });
    } catch (err) {
      console.error('❌ Update order status error:', err);
      next(err);
    }
  },

  removeOrderItem: async (req, res, next) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const itemId = parseInt(req.params.itemId);

      console.log('🗑️ [START] Removing item from order:', { 
        orderId, 
        itemId,
        rawOrderId: req.params.orderId,
        rawItemId: req.params.itemId
      });

      if (isNaN(orderId) || isNaN(itemId)) {
        console.error('❌ Invalid ID format:', { orderId, itemId });
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid order ID or item ID' 
        });
      }

      // ✅ CHECK 1: Order exists
      const orderCheck = await pool.request()
        .input('OrderID', sql.Int, orderId)
        .query('SELECT OrderID, Status FROM Orders WHERE OrderID=@OrderID');
      
      console.log('📋 Order check result:', orderCheck.recordset);
      
      if (orderCheck.recordset.length === 0) {
        console.error('❌ Order not found:', orderId);
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Order not found' 
        });
      }
      
      const currentStatus = orderCheck.recordset[0].Status;
      console.log('📊 Current order status:', currentStatus);
      
      if (currentStatus !== 'Ordering') {
        console.error('❌ Order not in Ordering state:', { orderId, currentStatus });
        return res.status(400).json({ 
          status: 'fail', 
          message: `Cannot remove items from order that is not in ordering state (current: ${currentStatus})`,
          currentStatus: currentStatus
        });
      }

      // ✅ CHECK 2: Item exists before deleting
      const itemCheck = await pool.request()
        .input('OrderID', sql.Int, orderId)
        .input('OrderItemID', sql.Int, itemId)
        .query('SELECT OrderItemID, ProductID, Quantity FROM OrderItems WHERE OrderID=@OrderID AND OrderItemID=@OrderItemID');
      
      console.log('🔍 Item check result:', itemCheck.recordset);
      
      if (itemCheck.recordset.length === 0) {
        console.error('❌ Item not found:', { orderId, itemId });
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Order item not found' 
        });
      }

      // ✅ DELETE item
      const deleteResult = await pool.request()
        .input('OrderID', sql.Int, orderId)
        .input('OrderItemID', sql.Int, itemId)
        .query('DELETE FROM OrderItems WHERE OrderID=@OrderID AND OrderItemID=@OrderItemID');

      console.log('🗑️ Delete result:', { rowsAffected: deleteResult.rowsAffected[0] });

      if (deleteResult.rowsAffected[0] === 0) {
        console.error('❌ Delete failed - no rows affected');
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Order item not found or already deleted' 
        });
      }

      console.log('✅ Order item removed successfully');

      // ✅ CHECK: Nếu không còn items nào, tự động cancel order
      const remainingItems = await pool.request()
        .input('OrderID', sql.Int, orderId)
        .query('SELECT COUNT(*) as itemCount FROM OrderItems WHERE OrderID=@OrderID');

      const itemCount = remainingItems.recordset[0].itemCount;
      console.log('📊 Remaining items count:', itemCount);

      let orderCancelled = false;
      if (itemCount === 0) {
        console.log('⚠️ No items left in order, auto-cancelling...');
        
        const cancelResult = await pool.request()
          .input('OrderID', sql.Int, orderId)
          .query('UPDATE Orders SET Status=\'Cancelled\' WHERE OrderID=@OrderID');
        
        console.log('🔄 Cancel result:', { rowsAffected: cancelResult.rowsAffected[0] });
        console.log('✅ Order auto-cancelled due to empty items');
        orderCancelled = true;
      }

      console.log('🎉 [SUCCESS] Remove item completed:', { 
        orderId, 
        itemId, 
        orderCancelled, 
        remainingItems: itemCount 
      });

      res.status(200).json({ 
        status: 'success', 
        message: orderCancelled ? 'Order item removed and order cancelled (no items left)' : 'Order item removed successfully',
        orderCancelled: orderCancelled,
        remainingItems: itemCount
      });
    } catch (err) {
      console.error('❌ [ERROR] Remove order item error:', {
        message: err.message,
        stack: err.stack,
        orderId: req.params.orderId,
        itemId: req.params.itemId
      });
      next(err);
    }
  },

  updateOrderItem: async (req, res, next) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const itemId = parseInt(req.params.itemId);
      const { quantity } = req.body;

      if (isNaN(orderId) || isNaN(itemId)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid order ID or item ID' 
        });
      }

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'quantity must be a positive integer' 
        });
      }

      console.log('📝 Updating order item:', { orderId, itemId, quantity });

      const orderCheck = await pool.request()
        .input('OrderID', sql.Int, orderId)
        .query('SELECT Status FROM Orders WHERE OrderID=@OrderID');
      
      if (orderCheck.recordset.length === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Order not found' 
        });
      }
      
      if (orderCheck.recordset[0].Status !== 'Ordering') {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Cannot update items in order that is not in ordering state' 
        });
      }

      const itemCheck = await pool.request()
        .input('OrderID', sql.Int, orderId)
        .input('OrderItemID', sql.Int, itemId)
        .query('SELECT OrderItemID FROM OrderItems WHERE OrderID=@OrderID AND OrderItemID=@OrderItemID');

      if (itemCheck.recordset.length === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Order item not found' 
        });
      }

      const updateResult = await pool.request()
        .input('OrderID', sql.Int, orderId)
        .input('OrderItemID', sql.Int, itemId)
        .input('Quantity', sql.Int, quantity)
        .input('Notes', sql.NVarChar(500), req.body.notes || null)
        .query('UPDATE OrderItems SET Quantity=@Quantity, Notes=@Notes WHERE OrderID=@OrderID AND OrderItemID=@OrderItemID');

      if (updateResult.rowsAffected[0] === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Failed to update order item' 
        });
      }

      console.log('✅ Order item quantity updated successfully');

      res.status(200).json({ 
        status: 'success', 
        message: 'Order item quantity updated successfully' 
      });
    } catch (err) {
      console.error('❌ Update order item error:', err);
      next(err);
    }
  }
};