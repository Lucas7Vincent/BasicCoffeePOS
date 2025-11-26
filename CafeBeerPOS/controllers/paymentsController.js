const { pool, sql } = require('../config/db');

module.exports = {
  // Create payment with discount percentage
  createPayment: async (req, res, next) => {
    try {
      const { OrderID, PaymentType, discountPercentage = 0 } = req.body;
      
      console.log('💳 Creating payment for:', { OrderID, PaymentType, discountPercentage });
      
      // Validation
      if (!OrderID || !PaymentType) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'OrderID and PaymentType are required' 
        });
      }
      
      if (!['Cash', 'Card', 'Banking'].includes(PaymentType)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'PaymentType must be one of: Cash, Card, Banking' 
        });
      }

      // Validate discount percentage
      if (discountPercentage < 0 || discountPercentage > 100) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'discountPercentage must be between 0 and 100' 
        });
      }

      // Kiểm tra order tồn tại và lấy thông tin
      const orderCheck = await pool.request()
        .input('OrderID', sql.Int, OrderID)
        .query(`
          SELECT 
            o.OrderID,
            o.Status,
            o.TotalAmount,
            ISNULL(SUM(oi.Quantity * oi.UnitPrice), 0) as CalculatedTotal
          FROM Orders o
          LEFT JOIN OrderItems oi ON o.OrderID = oi.OrderID
          WHERE o.OrderID = @OrderID
          GROUP BY o.OrderID, o.Status, o.TotalAmount
        `);
      
      if (orderCheck.recordset.length === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Order not found' 
        });
      }

      const order = orderCheck.recordset[0];
      console.log('📋 Order details:', order);

      // Kiểm tra order đã thanh toán chưa
      const existingPayment = await pool.request()
        .input('OrderID', sql.Int, OrderID)
        .query('SELECT PaymentID FROM Payments WHERE OrderID = @OrderID');
      
      if (existingPayment.recordset.length > 0) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Order has already been paid' 
        });
      }

      // Tính original amount từ OrderItems
      const originalAmount = parseFloat(order.CalculatedTotal);
      
      if (originalAmount <= 0) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Order has no items or invalid total amount' 
        });
      }

      // **🎯 TÍNH AMOUNT SAU KHI GIẢM GIÁ:**
      const discountAmount = (originalAmount * discountPercentage) / 100;
      const finalAmount = originalAmount - discountAmount;

      console.log('💰 Payment calculation:', {
        originalAmount,
        discountPercentage,
        discountAmount: discountAmount.toFixed(2),
        finalAmount: finalAmount.toFixed(2)
      });

      // Tạo payment record với discount percentage
      const insert = await pool.request()
        .input('OrderID', sql.Int, OrderID)
        .input('PaymentType', sql.VarChar(20), PaymentType)
        .input('Amount', sql.Decimal(12,2), finalAmount)
        .input('DiscountPercentage', sql.Decimal(5,2), discountPercentage)
        .query(`
          INSERT INTO Payments (OrderID, PaymentType, Amount, DiscountPercentage, PaymentDate) 
          OUTPUT INSERTED.PaymentID, INSERTED.PaymentDate
          VALUES (@OrderID, @PaymentType, @Amount, @DiscountPercentage, GETDATE())
        `);

      const paymentResult = insert.recordset[0];
      console.log('✅ Payment created:', paymentResult);

      // Cập nhật order status và TotalAmount (final amount sau discount)
      await pool.request()
        .input('OrderID', sql.Int, OrderID)
        .input('Status', sql.VarChar(20), 'Paid')
        .input('TotalAmount', sql.Decimal(12,2), finalAmount)
        .query(`
          UPDATE Orders 
          SET Status = @Status, TotalAmount = @TotalAmount 
          WHERE OrderID = @OrderID
        `);

      console.log('✅ Order status updated to Paid');

      // Lấy thông tin payment vừa tạo để trả về
      const paymentDetails = await pool.request()
        .input('PaymentID', sql.Int, paymentResult.PaymentID)
        .query(`
          SELECT 
            p.PaymentID as id,
            p.OrderID as orderId,
            p.PaymentType as paymentType,
            p.Amount as amount,
            p.DiscountPercentage as discountPercentage,
            p.PaymentDate as paymentDate,
            o.Status as orderStatus,
            -- Tính original amount để show
            ISNULL(SUM(oi.Quantity * oi.UnitPrice), 0) as originalAmount
          FROM Payments p
          JOIN Orders o ON p.OrderID = o.OrderID
          LEFT JOIN OrderItems oi ON o.OrderID = oi.OrderID
          WHERE p.PaymentID = @PaymentID
          GROUP BY p.PaymentID, p.OrderID, p.PaymentType, p.Amount, p.DiscountPercentage, p.PaymentDate, o.Status
        `);

      const result = paymentDetails.recordset[0];
      const originalAmt = parseFloat(result.originalAmount);
      const discountAmt = (originalAmt * result.discountPercentage) / 100;

      res.status(201).json({ 
        status: 'success', 
        data: {
          id: result.id,
          orderId: result.orderId,
          paymentType: result.paymentType,
          amount: parseFloat(result.amount),
          discountPercentage: parseFloat(result.discountPercentage),
          discountAmount: parseFloat(discountAmt.toFixed(2)),
          originalAmount: originalAmt,
          paymentDate: result.paymentDate,
          orderStatus: result.orderStatus
        }
      });
    } catch (err) {
      console.error('❌ Payment creation error:', err);
      next(err);
    }
  },

  // Get payment by ID - Updated to include discount info
  getPayment: async (req, res, next) => {
    try {
      const paymentId = parseInt(req.params.paymentId);
      
      if (isNaN(paymentId)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid payment ID' 
        });
      }

      const result = await pool.request()
        .input('PaymentID', sql.Int, paymentId)
        .query(`
          SELECT 
            p.PaymentID as id,
            p.OrderID as orderId,
            p.PaymentType as paymentType,
            p.Amount as amount,
            ISNULL(p.DiscountPercentage, 0) as discountPercentage,
            p.PaymentDate as paymentDate,
            o.Status as orderStatus,
            o.TotalAmount as orderTotal,
            -- Tính original amount từ OrderItems
            ISNULL(SUM(oi.Quantity * oi.UnitPrice), 0) as originalAmount
          FROM Payments p
          JOIN Orders o ON p.OrderID = o.OrderID
          LEFT JOIN OrderItems oi ON o.OrderID = oi.OrderID
          WHERE p.PaymentID = @PaymentID
          GROUP BY p.PaymentID, p.OrderID, p.PaymentType, p.Amount, p.DiscountPercentage, p.PaymentDate, o.Status, o.TotalAmount
        `);

      if (result.recordset.length === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Payment not found' 
        });
      }

      const payment = result.recordset[0];
      const originalAmt = parseFloat(payment.originalAmount);
      const discountAmt = (originalAmt * payment.discountPercentage) / 100;

      res.status(200).json({ 
        status: 'success', 
        data: {
          id: payment.id,
          orderId: payment.orderId,
          paymentType: payment.paymentType,
          amount: parseFloat(payment.amount),
          discountPercentage: parseFloat(payment.discountPercentage),
          discountAmount: parseFloat(discountAmt.toFixed(2)),
          originalAmount: originalAmt,
          paymentDate: payment.paymentDate,
          orderStatus: payment.orderStatus,
          orderTotal: parseFloat(payment.orderTotal)
        }
      });
    } catch (err) {
      console.error('❌ Get payment error:', err);
      next(err);
    }
  },

  // Get all payments - Updated to include discount info
  getAllPayments: async (req, res, next) => {
    try {
      const { startDate, endDate, paymentType, orderId } = req.query;
      
      let whereClause = 'WHERE 1=1';
      const request = pool.request();
      
      // Filter by date range
      if (startDate) {
        whereClause += ' AND CAST(p.PaymentDate AS DATE) >= @StartDate';
        request.input('StartDate', sql.Date, startDate);
      }
      
      if (endDate) {
        whereClause += ' AND CAST(p.PaymentDate AS DATE) <= @EndDate';
        request.input('EndDate', sql.Date, endDate);
      }
      
      // Filter by payment type
      if (paymentType && ['Cash', 'Card', 'Banking'].includes(paymentType)) {
        whereClause += ' AND p.PaymentType = @PaymentType';
        request.input('PaymentType', sql.VarChar(20), paymentType);
      }
      
      // Filter by order ID
      if (orderId) {
        whereClause += ' AND p.OrderID = @OrderID';
        request.input('OrderID', sql.Int, parseInt(orderId));
      }

      const result = await request.query(`
        SELECT 
          p.PaymentID as id,
          p.OrderID as orderId,
          p.PaymentType as paymentType,
          p.Amount as amount,
          ISNULL(p.DiscountPercentage, 0) as discountPercentage,
          p.PaymentDate as paymentDate,
          o.Status as orderStatus,
          o.TotalAmount as orderTotal,
          u.Username as processedBy,
          u.FullName as processedByFullName,
          -- Tính original amount từ OrderItems
          ISNULL(SUM(oi.Quantity * oi.UnitPrice), 0) as originalAmount
        FROM Payments p
        JOIN Orders o ON p.OrderID = o.OrderID
        JOIN Users u ON o.UserID = u.UserID
        LEFT JOIN OrderItems oi ON o.OrderID = oi.OrderID
        ${whereClause}
        GROUP BY p.PaymentID, p.OrderID, p.PaymentType, p.Amount, p.DiscountPercentage, p.PaymentDate, 
                 o.Status, o.TotalAmount, u.Username, u.FullName
        ORDER BY p.PaymentDate DESC
      `);

      // Add calculated discount amount to each payment
      const paymentsWithDiscount = result.recordset.map(payment => {
        const originalAmt = parseFloat(payment.originalAmount);
        const discountAmt = (originalAmt * payment.discountPercentage) / 100;
        
        return {
          id: payment.id,
          orderId: payment.orderId,
          paymentType: payment.paymentType,
          amount: parseFloat(payment.amount),
          discountPercentage: parseFloat(payment.discountPercentage),
          discountAmount: parseFloat(discountAmt.toFixed(2)),
          originalAmount: originalAmt,
          paymentDate: payment.paymentDate,
          orderStatus: payment.orderStatus,
          orderTotal: parseFloat(payment.orderTotal),
          processedBy: payment.processedBy,
          processedByFullName: payment.processedByFullName
        };
      });

      res.status(200).json({ 
        status: 'success', 
        data: paymentsWithDiscount
      });
    } catch (err) {
      console.error('❌ Get all payments error:', err);
      next(err);
    }
  },

  // Get payments by order ID - Updated to include discount info
  getPaymentsByOrder: async (req, res, next) => {
    try {
      const orderId = parseInt(req.params.orderId);
      
      if (isNaN(orderId)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid order ID' 
        });
      }

      const result = await pool.request()
        .input('OrderID', sql.Int, orderId)
        .query(`
          SELECT 
            p.PaymentID as id,
            p.OrderID as orderId,
            p.PaymentType as paymentType,
            p.Amount as amount,
            ISNULL(p.DiscountPercentage, 0) as discountPercentage,
            p.PaymentDate as paymentDate,
            o.Status as orderStatus,
            o.TotalAmount as orderTotal,
            -- Tính original amount từ OrderItems
            ISNULL(SUM(oi.Quantity * oi.UnitPrice), 0) as originalAmount
          FROM Payments p
          JOIN Orders o ON p.OrderID = o.OrderID
          LEFT JOIN OrderItems oi ON o.OrderID = oi.OrderID
          WHERE p.OrderID = @OrderID
          GROUP BY p.PaymentID, p.OrderID, p.PaymentType, p.Amount, p.DiscountPercentage, p.PaymentDate, o.Status, o.TotalAmount
          ORDER BY p.PaymentDate DESC
        `);

      // Add calculated discount amount to each payment
      const paymentsWithDiscount = result.recordset.map(payment => {
        const originalAmt = parseFloat(payment.originalAmount);
        const discountAmt = (originalAmt * payment.discountPercentage) / 100;
        
        return {
          id: payment.id,
          orderId: payment.orderId,
          paymentType: payment.paymentType,
          amount: parseFloat(payment.amount),
          discountPercentage: parseFloat(payment.discountPercentage),
          discountAmount: parseFloat(discountAmt.toFixed(2)),
          originalAmount: originalAmt,
          paymentDate: payment.paymentDate,
          orderStatus: payment.orderStatus,
          orderTotal: parseFloat(payment.orderTotal)
        };
      });

      res.status(200).json({ 
        status: 'success', 
        data: paymentsWithDiscount
      });
    } catch (err) {
      console.error('❌ Get payments by order error:', err);
      next(err);
    }
  }
};