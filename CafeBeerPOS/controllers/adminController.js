const { pool, sql } = require('../config/db');

module.exports = {
  // 🔄 Cập nhật Payment Methods từ E-Wallet thành Banking
  updatePaymentMethods: async (req, res, next) => {
    try {
      console.log('🔄 Admin: Updating E-Wallet to Banking...');

      // Kiểm tra dữ liệu hiện tại
      const currentData = await pool.request()
        .query(`
          SELECT 
            PaymentType, 
            COUNT(*) as count,
            SUM(Amount) as totalAmount
          FROM Payments 
          GROUP BY PaymentType
          ORDER BY PaymentType
        `);

      console.log('📊 Current payment methods:', currentData.recordset);

      // Đếm số records E-Wallet cần update
      const ewalletCount = await pool.request()
        .query(`
          SELECT COUNT(*) as count
          FROM Payments 
          WHERE PaymentType = 'E-Wallet'
        `);

      const recordsToUpdate = ewalletCount.recordset[0].count;
      console.log('🎯 E-Wallet records to update:', recordsToUpdate);

      if (recordsToUpdate === 0) {
        return res.status(200).json({
          status: 'success',
          message: 'No E-Wallet records found to update',
          data: {
            before: currentData.recordset,
            after: currentData.recordset,
            updatedRecords: 0
          }
        });
      }

      // Cập nhật E-Wallet thành Banking
      const updateResult = await pool.request()
        .query(`
          UPDATE Payments 
          SET PaymentType = 'Banking'
          WHERE PaymentType = 'E-Wallet'
        `);

      console.log('✅ Updated records:', updateResult.rowsAffected[0]);

      // Kiểm tra kết quả sau update
      const newData = await pool.request()
        .query(`
          SELECT 
            PaymentType, 
            COUNT(*) as count,
            SUM(Amount) as totalAmount
          FROM Payments 
          GROUP BY PaymentType
          ORDER BY PaymentType
        `);

      // Lấy sample records đã được update
      const sampleUpdated = await pool.request()
        .query(`
          SELECT TOP 5
            PaymentID,
            OrderID,
            PaymentType,
            Amount,
            PaymentDate
          FROM Payments 
          WHERE PaymentType = 'Banking'
          ORDER BY PaymentDate DESC
        `);

      console.log('📊 New payment methods distribution:', newData.recordset);

      res.status(200).json({
        status: 'success',
        message: `Successfully updated ${updateResult.rowsAffected[0]} payment records from E-Wallet to Banking`,
        data: {
          before: currentData.recordset,
          after: newData.recordset,
          updatedRecords: updateResult.rowsAffected[0],
          sampleRecords: sampleUpdated.recordset
        }
      });

    } catch (err) {
      console.error('❌ Update payment methods error:', err);
      next(err);
    }
  },

  // 📊 Kiểm tra phân bố Payment Methods hiện tại
  checkPaymentMethods: async (req, res, next) => {
    try {
      console.log('📊 Admin: Checking current payment methods...');

      const result = await pool.request()
        .query(`
          SELECT 
            PaymentType,
            COUNT(*) as paymentCount,
            SUM(Amount) as totalAmount,
            AVG(Amount) as averageAmount,
            MIN(Amount) as minAmount,
            MAX(Amount) as maxAmount,
            MIN(PaymentDate) as firstPayment,
            MAX(PaymentDate) as lastPayment
          FROM Payments 
          GROUP BY PaymentType
          ORDER BY totalAmount DESC
        `);

      // Tính tổng để có percentage
      const totalAmount = result.recordset.reduce((sum, method) => sum + parseFloat(method.totalAmount || 0), 0);
      const totalCount = result.recordset.reduce((sum, method) => sum + method.paymentCount, 0);

      const paymentMethodsWithPercentage = result.recordset.map(method => ({
        paymentType: method.PaymentType,
        paymentCount: method.paymentCount,
        totalAmount: parseFloat(method.totalAmount) || 0,
        averageAmount: parseFloat(method.averageAmount) || 0,
        minAmount: parseFloat(method.minAmount) || 0,
        maxAmount: parseFloat(method.maxAmount) || 0,
        firstPayment: method.firstPayment,
        lastPayment: method.lastPayment,
        amountPercentage: totalAmount > 0 ? parseFloat(((method.totalAmount / totalAmount) * 100).toFixed(2)) : 0,
        countPercentage: totalCount > 0 ? parseFloat(((method.paymentCount / totalCount) * 100).toFixed(2)) : 0
      }));

      console.log('📊 Payment methods distribution:', paymentMethodsWithPercentage);

      res.status(200).json({
        status: 'success',
        data: {
          paymentMethods: paymentMethodsWithPercentage,
          summary: {
            totalMethods: result.recordset.length,
            totalPayments: totalCount,
            totalAmount: parseFloat(totalAmount.toFixed(2))
          }
        }
      });

    } catch (err) {
      console.error('❌ Check payment methods error:', err);
      next(err);
    }
  },

  // 🔄 Rollback Banking về E-Wallet (nếu cần)
  rollbackPaymentMethods: async (req, res, next) => {
    try {
      console.log('🔄 Admin: Rolling back Banking to E-Wallet...');

      // Kiểm tra có Banking records không
      const bankingCount = await pool.request()
        .query(`
          SELECT COUNT(*) as count
          FROM Payments 
          WHERE PaymentType = 'Banking'
        `);

      const recordsToRollback = bankingCount.recordset[0].count;

      if (recordsToRollback === 0) {
        return res.status(200).json({
          status: 'success',
          message: 'No Banking records found to rollback',
          data: { updatedRecords: 0 }
        });
      }

      // Rollback Banking thành E-Wallet
      const rollbackResult = await pool.request()
        .query(`
          UPDATE Payments 
          SET PaymentType = 'E-Wallet'
          WHERE PaymentType = 'Banking'
        `);

      console.log('🔄 Rolled back records:', rollbackResult.rowsAffected[0]);

      res.status(200).json({
        status: 'success',
        message: `Successfully rolled back ${rollbackResult.rowsAffected[0]} payment records from Banking to E-Wallet`,
        data: {
          updatedRecords: rollbackResult.rowsAffected[0]
        }
      });

    } catch (err) {
      console.error('❌ Rollback payment methods error:', err);
      next(err);
    }
  }
};
