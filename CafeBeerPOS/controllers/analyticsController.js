const { pool, sql } = require('../config/db');
const moment = require('moment');

module.exports = {
  // Revenue Summary
  getRevenueSummary: async (req, res, next) => {
    try {
      console.log('📊 Analytics: Getting revenue summary...');
      
      const today = moment().format('YYYY-MM-DD');
      const startOfMonth = moment().startOf('month').format('YYYY-MM-DD');
      const startOfYear = moment().startOf('year').format('YYYY-MM-DD');
      const yesterday = moment().subtract(1, 'day').format('YYYY-MM-DD');
      const lastMonth = moment().subtract(1, 'month').startOf('month').format('YYYY-MM-DD');
      const lastMonthEnd = moment().subtract(1, 'month').endOf('month').format('YYYY-MM-DD');

      console.log('📅 Date ranges:', {
        today, startOfMonth, startOfYear, yesterday, lastMonth, lastMonthEnd
      });

      const result = await pool.request()
        .input('Today', sql.Date, today)
        .input('StartOfMonth', sql.Date, startOfMonth)
        .input('StartOfYear', sql.Date, startOfYear)
        .input('Yesterday', sql.Date, yesterday)
        .input('LastMonth', sql.Date, lastMonth)
        .input('LastMonthEnd', sql.Date, lastMonthEnd)
        .query(`
          SELECT 
            -- Hôm nay
            (SELECT ISNULL(SUM(CAST(TotalAmount AS DECIMAL(18,2))), 0) 
             FROM Orders 
             WHERE CAST(OrderDate AS DATE) = @Today 
               AND Status = 'Paid'
               AND TotalAmount IS NOT NULL) as todayRevenue,
            
            -- Hôm qua  
            (SELECT ISNULL(SUM(CAST(TotalAmount AS DECIMAL(18,2))), 0) 
             FROM Orders 
             WHERE CAST(OrderDate AS DATE) = @Yesterday 
               AND Status = 'Paid'
               AND TotalAmount IS NOT NULL) as yesterdayRevenue,
            
            -- Tháng này
            (SELECT ISNULL(SUM(CAST(TotalAmount AS DECIMAL(18,2))), 0) 
             FROM Orders 
             WHERE CAST(OrderDate AS DATE) >= @StartOfMonth 
               AND Status = 'Paid'
               AND TotalAmount IS NOT NULL) as thisMonthRevenue,
            
            -- Tháng trước
            (SELECT ISNULL(SUM(CAST(TotalAmount AS DECIMAL(18,2))), 0) 
             FROM Orders 
             WHERE CAST(OrderDate AS DATE) BETWEEN @LastMonth AND @LastMonthEnd 
               AND Status = 'Paid'
               AND TotalAmount IS NOT NULL) as lastMonthRevenue,
            
            -- Năm này
            (SELECT ISNULL(SUM(CAST(TotalAmount AS DECIMAL(18,2))), 0) 
             FROM Orders 
             WHERE CAST(OrderDate AS DATE) >= @StartOfYear 
               AND Status = 'Paid'
               AND TotalAmount IS NOT NULL) as thisYearRevenue,
            
            -- Tổng số đơn hàng hôm nay
            (SELECT COUNT(*) 
             FROM Orders 
             WHERE CAST(OrderDate AS DATE) = @Today 
               AND Status = 'Paid') as todayOrders,
            
            -- Tổng số đơn hàng tháng này
            (SELECT COUNT(*) 
             FROM Orders 
             WHERE CAST(OrderDate AS DATE) >= @StartOfMonth 
               AND Status = 'Paid') as thisMonthOrders
        `);

      const summary = result.recordset[0];
      console.log('📊 Raw summary data:', summary);
      
      // Tính growth rate với validation
      const dailyGrowth = summary.yesterdayRevenue > 0 
        ? ((summary.todayRevenue - summary.yesterdayRevenue) / summary.yesterdayRevenue * 100)
        : (summary.todayRevenue > 0 ? 100 : 0);
      
      const monthlyGrowth = summary.lastMonthRevenue > 0 
        ? ((summary.thisMonthRevenue - summary.lastMonthRevenue) / summary.lastMonthRevenue * 100)
        : (summary.thisMonthRevenue > 0 ? 100 : 0);

      const responseData = {
        today: {
          revenue: parseFloat(summary.todayRevenue) || 0,
          orders: summary.todayOrders || 0,
          growth: parseFloat(dailyGrowth.toFixed(2))
        },
        thisMonth: {
          revenue: parseFloat(summary.thisMonthRevenue) || 0,
          orders: summary.thisMonthOrders || 0,
          growth: parseFloat(monthlyGrowth.toFixed(2))
        },
        thisYear: {
          revenue: parseFloat(summary.thisYearRevenue) || 0
        }
      };

      console.log('✅ Final response data:', responseData);

      res.status(200).json({
        status: 'success',
        data: responseData
      });
    } catch (err) {
      console.error('❌ Revenue summary error:', err);
      next(err);
    }
  },

  // Daily Revenue - Fixed theo schema
  getDailyRevenue: async (req, res, next) => {
    try {
      console.log('📊 Analytics: Getting daily revenue...');
      
      const { startDate, endDate } = req.query;
      
      // Default: 30 ngày gần nhất
      const end = endDate ? moment(endDate) : moment();
      const start = startDate ? moment(startDate) : moment().subtract(30, 'days');
      
      if (!start.isValid() || !end.isValid()) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid date format. Use YYYY-MM-DD'
        });
      }

      console.log('📅 Date range:', {
        start: start.format('YYYY-MM-DD'),
        end: end.format('YYYY-MM-DD')
      });

      const result = await pool.request()
        .input('StartDate', sql.Date, start.format('YYYY-MM-DD'))
        .input('EndDate', sql.Date, end.format('YYYY-MM-DD'))
        .query(`
          SELECT 
            CAST(OrderDate AS DATE) as date,
            ISNULL(SUM(CAST(TotalAmount AS DECIMAL(18,2))), 0) as revenue,
            COUNT(*) as orders,
            ISNULL(AVG(CAST(TotalAmount AS DECIMAL(18,2))), 0) as averageOrderValue
          FROM Orders 
          WHERE CAST(OrderDate AS DATE) BETWEEN @StartDate AND @EndDate 
            AND Status = 'Paid'
            AND TotalAmount IS NOT NULL
          GROUP BY CAST(OrderDate AS DATE)
          ORDER BY date DESC
        `);

      console.log('📊 Daily revenue results:', result.recordset.length, 'records');

      res.status(200).json({
        status: 'success',
        data: {
          period: {
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD')
          },
          dailyRevenue: result.recordset.map(row => ({
            date: moment(row.date).format('YYYY-MM-DD'),
            revenue: parseFloat(row.revenue) || 0,
            orders: row.orders || 0,
            averageOrderValue: parseFloat(row.averageOrderValue.toFixed(2)) || 0
          }))
        }
      });
    } catch (err) {
      console.error('❌ Daily revenue error:', err);
      next(err);
    }
  },

  // Monthly Revenue - Fixed
  getMonthlyRevenue: async (req, res, next) => {
    try {
      console.log('📊 Analytics: Getting monthly revenue...');
      
      const year = parseInt(req.query.year) || moment().year();
      console.log('📅 Year filter:', year);
      
      const result = await pool.request()
        .input('Year', sql.Int, year)
        .query(`
          SELECT 
            MONTH(OrderDate) as month,
            YEAR(OrderDate) as year,
            ISNULL(SUM(CAST(TotalAmount AS DECIMAL(18,2))), 0) as revenue,
            COUNT(*) as orders
          FROM Orders 
          WHERE YEAR(OrderDate) = @Year 
            AND Status = 'Paid'
            AND TotalAmount IS NOT NULL
          GROUP BY YEAR(OrderDate), MONTH(OrderDate)
          ORDER BY month
        `);

      console.log('📊 Monthly revenue results:', result.recordset.length, 'months with data');

      // Tạo data cho 12 tháng
      const monthlyData = [];
      for (let month = 1; month <= 12; month++) {
        const monthData = result.recordset.find(row => row.month === month);
        monthlyData.push({
          month,
          monthName: moment().month(month - 1).format('MMMM'),
          year: parseInt(year),
          revenue: monthData ? parseFloat(monthData.revenue) || 0 : 0,
          orders: monthData ? monthData.orders || 0 : 0
        });
      }

      const totalRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0);
      const totalOrders = monthlyData.reduce((sum, month) => sum + month.orders, 0);

      res.status(200).json({
        status: 'success',
        data: {
          year: parseInt(year),
          monthlyRevenue: monthlyData,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalOrders
        }
      });
    } catch (err) {
      console.error('❌ Monthly revenue error:', err);
      next(err);
    }
  },

  // Yearly Revenue - Fixed
  getYearlyRevenue: async (req, res, next) => {
    try {
      console.log('📊 Analytics: Getting yearly revenue...');
      
      const years = parseInt(req.query.years) || 5;
      const currentYear = moment().year();
      const startYear = currentYear - years + 1;

      console.log('📅 Year range:', { startYear, currentYear, years });

      const result = await pool.request()
        .input('StartYear', sql.Int, startYear)
        .input('EndYear', sql.Int, currentYear)
        .query(`
          SELECT 
            YEAR(OrderDate) as year,
            ISNULL(SUM(CAST(TotalAmount AS DECIMAL(18,2))), 0) as revenue,
            COUNT(*) as orders
          FROM Orders 
          WHERE YEAR(OrderDate) BETWEEN @StartYear AND @EndYear 
            AND Status = 'Paid'
            AND TotalAmount IS NOT NULL
          GROUP BY YEAR(OrderDate)
          ORDER BY year
        `);

      console.log('📊 Yearly revenue results:', result.recordset.length, 'years with data');

      // Tạo data cho tất cả các năm
      const yearlyData = [];
      for (let year = startYear; year <= currentYear; year++) {
        const yearData = result.recordset.find(row => row.year === year);
        yearlyData.push({
          year,
          revenue: yearData ? parseFloat(yearData.revenue) || 0 : 0,
          orders: yearData ? yearData.orders || 0 : 0
        });
      }

      const totalRevenue = yearlyData.reduce((sum, year) => sum + year.revenue, 0);
      const totalOrders = yearlyData.reduce((sum, year) => sum + year.orders, 0);

      res.status(200).json({
        status: 'success',
        data: {
          period: `${startYear}-${currentYear}`,
          yearlyRevenue: yearlyData,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalOrders
        }
      });
    } catch (err) {
      console.error('❌ Yearly revenue error:', err);
      next(err);
    }
  },

  // Top Selling Products
  getTopSellingProducts: async (req, res, next) => {
    try {
      console.log('📊 Analytics: Getting top selling products...');
      
      const limit = parseInt(req.query.limit) || 10;
      const { startDate, endDate } = req.query;
      
      // Default: 30 ngày gần nhất
      const end = endDate ? moment(endDate) : moment();
      const start = startDate ? moment(startDate) : moment().subtract(30, 'days');

      console.log('📅 Product analysis period:', {
        start: start.format('YYYY-MM-DD'),
        end: end.format('YYYY-MM-DD'),
        limit
      });

      const result = await pool.request()
        .input('StartDate', sql.Date, start.format('YYYY-MM-DD'))
        .input('EndDate', sql.Date, end.format('YYYY-MM-DD'))
        .input('Limit', sql.Int, limit)
        .query(`
          SELECT TOP (@Limit)
            p.ProductID as productId,
            p.ProductName as productName,
            ISNULL(c.CategoryName, 'No Category') as categoryName,
            p.UnitPrice as unitPrice,
            ISNULL(SUM(oi.Quantity), 0) as totalQuantitySold,
            ISNULL(SUM(oi.Quantity * oi.UnitPrice), 0) as totalRevenue,
            ISNULL(COUNT(DISTINCT o.OrderID), 0) as orderCount,
            CASE 
              WHEN SUM(oi.Quantity) > 0 THEN ISNULL(AVG(CAST(oi.Quantity as FLOAT)), 0)
              ELSE 0 
            END as averageQuantityPerOrder
          FROM OrderItems oi
          JOIN Orders o ON oi.OrderID = o.OrderID
          JOIN Products p ON oi.ProductID = p.ProductID
          LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
          WHERE CAST(o.OrderDate AS DATE) BETWEEN @StartDate AND @EndDate 
            AND o.Status = 'Paid'
            AND ISNULL(p.Available, 1) = 1
          GROUP BY p.ProductID, p.ProductName, c.CategoryName, p.UnitPrice
          ORDER BY totalQuantitySold DESC
        `);

      console.log('📊 Top products results:', result.recordset.length, 'products');

      res.status(200).json({
        status: 'success',
        data: {
          period: {
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD')
          },
          topProducts: result.recordset.map(row => ({
            productId: row.productId,
            productName: row.productName,
            categoryName: row.categoryName,
            unitPrice: parseFloat(row.unitPrice) || 0,
            totalQuantitySold: row.totalQuantitySold || 0,
            totalRevenue: parseFloat(row.totalRevenue) || 0,
            orderCount: row.orderCount || 0,
            averageQuantityPerOrder: parseFloat(row.averageQuantityPerOrder.toFixed(2)) || 0
          }))
        }
      });
    } catch (err) {
      console.error('❌ Top products error:', err);
      next(err);
    }
  },

  // Products Revenue - FIXED để tính từ OrderItems
  getProductsRevenue: async (req, res, next) => {
    try {
      console.log('📊 Analytics: Getting products revenue...');
      
      const { startDate, endDate, categoryId } = req.query;
      
      // Default: 30 ngày gần nhất
      const end = endDate ? moment(endDate) : moment();
      const start = startDate ? moment(startDate) : moment().subtract(30, 'days');

      console.log('📅 Products revenue period:', {
        start: start.format('YYYY-MM-DD'),
        end: end.format('YYYY-MM-DD'),
        categoryId
      });

      let categoryFilter = '';
      const request = pool.request()
        .input('StartDate', sql.Date, start.format('YYYY-MM-DD'))
        .input('EndDate', sql.Date, end.format('YYYY-MM-DD'));

      if (categoryId) {
        categoryFilter = 'AND p.CategoryID = @CategoryID';
        request.input('CategoryID', sql.Int, categoryId);
      }

      const result = await request.query(`
        SELECT 
          p.ProductID as productId,
          p.ProductName as productName,
          ISNULL(c.CategoryName, 'No Category') as categoryName,
          p.UnitPrice as unitPrice,
          ISNULL(SUM(oi.Quantity), 0) as totalQuantitySold,
          ISNULL(SUM(oi.Quantity * oi.UnitPrice), 0) as totalRevenue,
          ISNULL(COUNT(DISTINCT o.OrderID), 0) as orderCount
        FROM Products p
        LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
        LEFT JOIN OrderItems oi ON p.ProductID = oi.ProductID
        LEFT JOIN Orders o ON oi.OrderID = o.OrderID 
          AND CAST(o.OrderDate AS DATE) BETWEEN @StartDate AND @EndDate 
          AND o.Status = 'Paid'
        WHERE ISNULL(p.Available, 1) = 1 ${categoryFilter}
        GROUP BY p.ProductID, p.ProductName, c.CategoryName, p.UnitPrice
        ORDER BY totalRevenue DESC
      `);

      console.log('📊 Products revenue results:', result.recordset.length, 'products');

      const totalRevenue = result.recordset.reduce((sum, product) => sum + parseFloat(product.totalRevenue || 0), 0);

      res.status(200).json({
        status: 'success',
        data: {
          period: {
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD')
          },
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          products: result.recordset.map(row => ({
            productId: row.productId,
            productName: row.productName,
            categoryName: row.categoryName,
            unitPrice: parseFloat(row.unitPrice) || 0,
            totalQuantitySold: row.totalQuantitySold || 0,
            totalRevenue: parseFloat(row.totalRevenue) || 0,
            orderCount: row.orderCount || 0,
            revenuePercentage: totalRevenue > 0 ? parseFloat(((row.totalRevenue / totalRevenue) * 100).toFixed(2)) : 0
          }))
        }
      });
    } catch (err) {
      console.error('❌ Products revenue error:', err);
      next(err);
    }
  },

  // Categories Performance
  getCategoriesPerformance: async (req, res, next) => {
    try {
      console.log('📊 Analytics: Getting categories performance...');
      
      const { startDate, endDate } = req.query;
      
      // Default: 30 ngày gần nhất
      const end = endDate ? moment(endDate) : moment();
      const start = startDate ? moment(startDate) : moment().subtract(30, 'days');

      console.log('📅 Categories performance period:', {
        start: start.format('YYYY-MM-DD'),
        end: end.format('YYYY-MM-DD')
      });

      const result = await pool.request()
        .input('StartDate', sql.Date, start.format('YYYY-MM-DD'))
        .input('EndDate', sql.Date, end.format('YYYY-MM-DD'))
        .query(`
          SELECT 
            c.CategoryID as categoryId,
            c.CategoryName as categoryName,
            COUNT(DISTINCT p.ProductID) as totalProducts,
            ISNULL(SUM(oi.Quantity), 0) as totalQuantitySold,
            ISNULL(SUM(oi.Quantity * oi.UnitPrice), 0) as totalRevenue,
            ISNULL(COUNT(DISTINCT o.OrderID), 0) as orderCount,
            CASE 
              WHEN COUNT(DISTINCT o.OrderID) > 0 THEN ISNULL(AVG(oi.Quantity * oi.UnitPrice), 0)
              ELSE 0 
            END as averageItemValue
          FROM Categories c
          LEFT JOIN Products p ON c.CategoryID = p.CategoryID AND ISNULL(p.Available, 1) = 1
          LEFT JOIN OrderItems oi ON p.ProductID = oi.ProductID
          LEFT JOIN Orders o ON oi.OrderID = o.OrderID 
            AND CAST(o.OrderDate AS DATE) BETWEEN @StartDate AND @EndDate 
            AND o.Status = 'Paid'
          WHERE ISNULL(c.Available, 1) = 1
          GROUP BY c.CategoryID, c.CategoryName
          ORDER BY totalRevenue DESC
        `);

      console.log('📊 Categories performance results:', result.recordset.length, 'categories');

      const totalRevenue = result.recordset.reduce((sum, category) => sum + parseFloat(category.totalRevenue || 0), 0);

      res.status(200).json({
        status: 'success',
        data: {
          period: {
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD')
          },
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          categories: result.recordset.map(row => ({
            categoryId: row.categoryId,
            categoryName: row.categoryName,
            totalProducts: row.totalProducts || 0,
            totalQuantitySold: row.totalQuantitySold || 0,
            totalRevenue: parseFloat(row.totalRevenue) || 0,
            orderCount: row.orderCount || 0,
            averageItemValue: parseFloat(row.averageItemValue.toFixed(2)) || 0,
            revenuePercentage: totalRevenue > 0 ? parseFloat(((row.totalRevenue / totalRevenue) * 100).toFixed(2)) : 0
          }))
        }
      });
    } catch (err) {
      console.error('❌ Categories performance error:', err);
      next(err);
    }
  },

  // 💰 BÁO CÁO GIẢM GIÁ VÀ KHUYẾN MÃI
  getDiscountAnalysis: async (req, res, next) => {
    try {
      console.log('📊 Analytics: Getting discount analysis...');
      
      const { startDate, endDate } = req.query;
      
      const end = endDate ? moment(endDate) : moment();
      const start = startDate ? moment(startDate) : moment().subtract(30, 'days');

      console.log('📅 Discount analysis period:', {
        start: start.format('YYYY-MM-DD'),
        end: end.format('YYYY-MM-DD')
      });

      const result = await pool.request()
        .input('StartDate', sql.Date, start.format('YYYY-MM-DD'))
        .input('EndDate', sql.Date, end.format('YYYY-MM-DD'))
        .query(`
          SELECT 
            -- Tổng doanh thu trước giảm giá
            ISNULL(SUM(o.TotalAmount), 0) as totalRevenue,
            
            -- Tổng số tiền giảm giá
            ISNULL(SUM(
              CASE 
                WHEN p.DiscountPercentage > 0 THEN (o.TotalAmount * p.DiscountPercentage / 100)
                ELSE 0
              END
            ), 0) as totalDiscountAmount,
            
            -- Doanh thu sau giảm giá
            ISNULL(SUM(p.Amount), 0) as totalPaidAmount,
            
            -- Số đơn hàng có giảm giá
            COUNT(CASE WHEN p.DiscountPercentage > 0 THEN 1 END) as discountedOrders,
            
            -- Tổng số đơn hàng
            COUNT(*) as totalOrders,
            
            -- Phần trăm đơn hàng có giảm giá
            CASE 
              WHEN COUNT(*) > 0 THEN CAST(COUNT(CASE WHEN p.DiscountPercentage > 0 THEN 1 END) AS FLOAT) / COUNT(*) * 100
              ELSE 0
            END as discountOrderPercentage,
            
            -- Giảm giá trung bình
            ISNULL(AVG(CASE WHEN p.DiscountPercentage > 0 THEN p.DiscountPercentage END), 0) as averageDiscountPercentage
            
          FROM Orders o
          LEFT JOIN Payments p ON o.OrderID = p.OrderID
          WHERE CAST(o.OrderDate AS DATE) BETWEEN @StartDate AND @EndDate 
            AND o.Status = 'Paid'
        `);

      // Phân tích giảm giá theo mức độ
      const discountTiers = await pool.request()
        .input('StartDate', sql.Date, start.format('YYYY-MM-DD'))
        .input('EndDate', sql.Date, end.format('YYYY-MM-DD'))
        .query(`
          SELECT 
            CASE 
              WHEN p.DiscountPercentage = 0 THEN 'No Discount'
              WHEN p.DiscountPercentage <= 5 THEN '1-5%'
              WHEN p.DiscountPercentage <= 10 THEN '6-10%'
              WHEN p.DiscountPercentage <= 20 THEN '11-20%'
              WHEN p.DiscountPercentage <= 50 THEN '21-50%'
              ELSE 'Over 50%'
            END as discountTier,
            COUNT(*) as orderCount,
            SUM(o.TotalAmount) as originalAmount,
            SUM(p.Amount) as paidAmount,
            SUM(o.TotalAmount - p.Amount) as discountAmount
          FROM Orders o
          JOIN Payments p ON o.OrderID = p.OrderID
          WHERE CAST(o.OrderDate AS DATE) BETWEEN @StartDate AND @EndDate 
            AND o.Status = 'Paid'
          GROUP BY 
            CASE 
              WHEN p.DiscountPercentage = 0 THEN 'No Discount'
              WHEN p.DiscountPercentage <= 5 THEN '1-5%'
              WHEN p.DiscountPercentage <= 10 THEN '6-10%'
              WHEN p.DiscountPercentage <= 20 THEN '11-20%'
              WHEN p.DiscountPercentage <= 50 THEN '21-50%'
              ELSE 'Over 50%'
            END
          ORDER BY discountTier
        `);

      const summary = result.recordset[0];
      
      res.status(200).json({
        status: 'success',
        data: {
          period: {
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD')
          },
          summary: {
            totalRevenue: parseFloat(summary.totalRevenue) || 0,
            totalDiscountAmount: parseFloat(summary.totalDiscountAmount) || 0,
            totalPaidAmount: parseFloat(summary.totalPaidAmount) || 0,
            totalOrders: summary.totalOrders || 0,
            discountedOrders: summary.discountedOrders || 0,
            discountOrderPercentage: parseFloat(summary.discountOrderPercentage.toFixed(2)) || 0,
            averageDiscountPercentage: parseFloat(summary.averageDiscountPercentage.toFixed(2)) || 0,
            discountImpact: summary.totalRevenue > 0 ? parseFloat(((summary.totalDiscountAmount / summary.totalRevenue) * 100).toFixed(2)) : 0
          },
          discountTiers: discountTiers.recordset.map(tier => ({
            tier: tier.discountTier,
            orderCount: tier.orderCount || 0,
            originalAmount: parseFloat(tier.originalAmount) || 0,
            paidAmount: parseFloat(tier.paidAmount) || 0,
            discountAmount: parseFloat(tier.discountAmount) || 0
          }))
        }
      });
    } catch (err) {
      console.error('❌ Discount analysis error:', err);
      next(err);
    }
  },

  // 💳 BÁO CÁO PHƯƠNG THỨC THANH TOÁN
  getPaymentMethodAnalysis: async (req, res, next) => {
    try {
      console.log('📊 Analytics: Getting payment method analysis...');
      
      const { startDate, endDate } = req.query;
      
      const end = endDate ? moment(endDate) : moment();
      const start = startDate ? moment(startDate) : moment().subtract(30, 'days');

      const result = await pool.request()
        .input('StartDate', sql.Date, start.format('YYYY-MM-DD'))
        .input('EndDate', sql.Date, end.format('YYYY-MM-DD'))
        .query(`
          SELECT 
            ISNULL(p.PaymentType, 'Unknown') as paymentMethod,
            COUNT(*) as transactionCount,
            SUM(p.Amount) as totalAmount,
            AVG(p.Amount) as averageAmount,
            MIN(p.Amount) as minAmount,
            MAX(p.Amount) as maxAmount
          FROM Payments p
          JOIN Orders o ON p.OrderID = o.OrderID
          WHERE CAST(o.OrderDate AS DATE) BETWEEN @StartDate AND @EndDate 
            AND o.Status = 'Paid'
          GROUP BY p.PaymentType
          ORDER BY totalAmount DESC
        `);

      const totalAmount = result.recordset.reduce((sum, method) => sum + parseFloat(method.totalAmount || 0), 0);

      res.status(200).json({
        status: 'success',
        data: {
          period: {
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD')
          },
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          paymentMethods: result.recordset.map(method => ({
            paymentMethod: method.paymentMethod,
            transactionCount: method.transactionCount || 0,
            totalAmount: parseFloat(method.totalAmount) || 0,
            averageAmount: parseFloat(method.averageAmount.toFixed(2)) || 0,
            minAmount: parseFloat(method.minAmount) || 0,
            maxAmount: parseFloat(method.maxAmount) || 0,
            percentage: totalAmount > 0 ? parseFloat(((method.totalAmount / totalAmount) * 100).toFixed(2)) : 0
          }))
        }
      });
    } catch (err) {
      console.error('❌ Payment method analysis error:', err);
      next(err);
    }
  },

  // 📈 BÁO CÁO TỔNG HỢP TOÀN DIỆN
  getComprehensiveReport: async (req, res, next) => {
    try {
      console.log('📊 Analytics: Getting comprehensive report...');
      
      const { startDate, endDate } = req.query;
      
      const end = endDate ? moment(endDate) : moment();
      const start = startDate ? moment(startDate) : moment().subtract(30, 'days');

      // 1. Tổng quan doanh thu
      const revenueOverview = await pool.request()
        .input('StartDate', sql.Date, start.format('YYYY-MM-DD'))
        .input('EndDate', sql.Date, end.format('YYYY-MM-DD'))
        .query(`
          SELECT 
            COUNT(*) as totalOrders,
            SUM(o.TotalAmount) as grossRevenue,
            SUM(p.Amount) as netRevenue,
            SUM(o.TotalAmount - p.Amount) as totalDiscounts,
            AVG(o.TotalAmount) as averageOrderValue,
            AVG(p.Amount) as averagePayment,
            MIN(o.TotalAmount) as minOrderValue,
            MAX(o.TotalAmount) as maxOrderValue
          FROM Orders o
          JOIN Payments p ON o.OrderID = p.OrderID
          WHERE CAST(o.OrderDate AS DATE) BETWEEN @StartDate AND @EndDate 
            AND o.Status = 'Paid'
        `);

      // 2. Phân tích theo giờ trong ngày
      const hourlyAnalysis = await pool.request()
        .input('StartDate', sql.Date, start.format('YYYY-MM-DD'))
        .input('EndDate', sql.Date, end.format('YYYY-MM-DD'))
        .query(`
          SELECT 
            DATEPART(HOUR, o.OrderDate) as hour,
            COUNT(*) as orderCount,
            SUM(p.Amount) as revenue,
            AVG(p.Amount) as averageOrderValue
          FROM Orders o
          JOIN Payments p ON o.OrderID = p.OrderID
          WHERE CAST(o.OrderDate AS DATE) BETWEEN @StartDate AND @EndDate 
            AND o.Status = 'Paid'
          GROUP BY DATEPART(HOUR, o.OrderDate)
          ORDER BY hour
        `);

      // 3. Phân tích theo ngày trong tuần
      const weekdayAnalysis = await pool.request()
        .input('StartDate', sql.Date, start.format('YYYY-MM-DD'))
        .input('EndDate', sql.Date, end.format('YYYY-MM-DD'))
        .query(`
          SELECT 
            DATEPART(WEEKDAY, o.OrderDate) as weekday,
            DATENAME(WEEKDAY, o.OrderDate) as weekdayName,
            COUNT(*) as orderCount,
            SUM(p.Amount) as revenue,
            AVG(p.Amount) as averageOrderValue
          FROM Orders o
          JOIN Payments p ON o.OrderID = p.OrderID
          WHERE CAST(o.OrderDate AS DATE) BETWEEN @StartDate AND @EndDate 
            AND o.Status = 'Paid'
          GROUP BY DATEPART(WEEKDAY, o.OrderDate), DATENAME(WEEKDAY, o.OrderDate)
          ORDER BY weekday
        `);

      // 4. Top performing days
      const topDays = await pool.request()
        .input('StartDate', sql.Date, start.format('YYYY-MM-DD'))
        .input('EndDate', sql.Date, end.format('YYYY-MM-DD'))
        .query(`
          SELECT TOP 10
            CAST(o.OrderDate AS DATE) as date,
            COUNT(*) as orderCount,
            SUM(p.Amount) as revenue,
            AVG(p.Amount) as averageOrderValue
          FROM Orders o
          JOIN Payments p ON o.OrderID = p.OrderID
          WHERE CAST(o.OrderDate AS DATE) BETWEEN @StartDate AND @EndDate 
            AND o.Status = 'Paid'
          GROUP BY CAST(o.OrderDate AS DATE)
          ORDER BY revenue DESC
        `);

      // 5. Performance metrics
      const performanceMetrics = await pool.request()
        .input('StartDate', sql.Date, start.format('YYYY-MM-DD'))
        .input('EndDate', sql.Date, end.format('YYYY-MM-DD'))
        .query(`
          SELECT 
            -- Customer metrics - FIX
            COUNT(DISTINCT o.OrderID) as uniqueOrders,
            
            -- Product metrics  
            COUNT(DISTINCT oi.ProductID) as uniqueProductsSold,
            SUM(oi.Quantity) as totalItemsSold,
            
            -- Table metrics
            COUNT(DISTINCT o.TableID) as tablesUsed,
            
            -- Time metrics
            COUNT(DISTINCT CAST(o.OrderDate AS DATE)) as activeDays
            
          FROM Orders o
          JOIN Payments p ON o.OrderID = p.OrderID
          JOIN OrderItems oi ON o.OrderID = oi.OrderID
          WHERE CAST(o.OrderDate AS DATE) BETWEEN @StartDate AND @EndDate 
            AND o.Status = 'Paid'
        `);

      const overview = revenueOverview.recordset[0];
      const metrics = performanceMetrics.recordset[0];

      res.status(200).json({
        status: 'success',
        data: {
          period: {
            startDate: start.format('YYYY-MM-DD'),
            endDate: end.format('YYYY-MM-DD'),
            totalDays: end.diff(start, 'days') + 1
          },
          revenueOverview: {
            totalOrders: overview.totalOrders || 0,
            grossRevenue: parseFloat(overview.grossRevenue) || 0,
            netRevenue: parseFloat(overview.netRevenue) || 0,
            totalDiscounts: parseFloat(overview.totalDiscounts) || 0,
            averageOrderValue: parseFloat(overview.averageOrderValue.toFixed(2)) || 0,
            averagePayment: parseFloat(overview.averagePayment.toFixed(2)) || 0,
            minOrderValue: parseFloat(overview.minOrderValue) || 0,
            maxOrderValue: parseFloat(overview.maxOrderValue) || 0,
            discountRate: overview.grossRevenue > 0 ? parseFloat(((overview.totalDiscounts / overview.grossRevenue) * 100).toFixed(2)) : 0
          },
          performanceMetrics: {
            uniqueOrders: metrics.uniqueOrders || 0,
            uniqueProductsSold: metrics.uniqueProductsSold || 0,
            totalItemsSold: metrics.totalItemsSold || 0,
            tablesUsed: metrics.tablesUsed || 0,
            activeDays: metrics.activeDays || 0,
            ordersPerDay: metrics.activeDays > 0 ? parseFloat((overview.totalOrders / metrics.activeDays).toFixed(2)) : 0,
            revenuePerDay: metrics.activeDays > 0 ? parseFloat((overview.netRevenue / metrics.activeDays).toFixed(2)) : 0
          },
          hourlyAnalysis: hourlyAnalysis.recordset.map(hour => ({
            hour: hour.hour,
            orderCount: hour.orderCount || 0,
            revenue: parseFloat(hour.revenue) || 0,
            averageOrderValue: parseFloat(hour.averageOrderValue.toFixed(2)) || 0
          })),
          weekdayAnalysis: weekdayAnalysis.recordset.map(day => ({
            weekday: day.weekday,
            weekdayName: day.weekdayName,
            orderCount: day.orderCount || 0,
            revenue: parseFloat(day.revenue) || 0,
            averageOrderValue: parseFloat(day.averageOrderValue.toFixed(2)) || 0
          })),
          topPerformingDays: topDays.recordset.map(day => ({
            date: moment(day.date).format('YYYY-MM-DD'),
            orderCount: day.orderCount || 0,
            revenue: parseFloat(day.revenue) || 0,
            averageOrderValue: parseFloat(day.averageOrderValue.toFixed(2)) || 0
          }))
        }
      });
    } catch (err) {
      console.error('❌ Comprehensive report error:', err);
      next(err);
    }
  }
};

// 🔧 HELPER FUNCTIONS FOR EXCEL GENERATION

// Generate Revenue Summary Sheet
async function generateRevenueSummarySheet(workbook, startDate, endDate) {
  const sheet = workbook.addWorksheet('Revenue Summary');
  
  // Get revenue summary data
  const end = endDate ? moment(endDate) : moment();
  const start = startDate ? moment(startDate) : moment().subtract(30, 'days');
  
  const result = await pool.request()
    .input('StartDate', sql.Date, start.format('YYYY-MM-DD'))
    .input('EndDate', sql.Date, end.format('YYYY-MM-DD'))
    .query(`
      SELECT 
        ISNULL(SUM(CAST(TotalAmount AS DECIMAL(18,2))), 0) as totalRevenue,
        COUNT(*) as totalOrders,
        ISNULL(AVG(CAST(TotalAmount AS DECIMAL(18,2))), 0) as averageOrderValue,
        ISNULL(MIN(CAST(TotalAmount AS DECIMAL(18,2))), 0) as minOrderValue,
        ISNULL(MAX(CAST(TotalAmount AS DECIMAL(18,2))), 0) as maxOrderValue
      FROM Orders 
      WHERE CAST(OrderDate AS DATE) BETWEEN @StartDate AND @EndDate 
        AND Status = 'Paid'
    `);

  const data = result.recordset[0];
  
  // Create header
  sheet.addRow(['📊 REVENUE SUMMARY REPORT']);
  sheet.addRow(['Generated:', moment().format('YYYY-MM-DD HH:mm:ss')]);
  sheet.addRow(['Period:', `${start.format('YYYY-MM-DD')} to ${end.format('YYYY-MM-DD')}`]);
  sheet.addRow([]); // Empty row

  // Headers
  sheet.addRow(['Metric', 'Value', 'Currency']);
  
  // Data rows
  sheet.addRow(['Total Revenue', parseFloat(data.totalRevenue) || 0, 'VND']);
  sheet.addRow(['Total Orders', data.totalOrders || 0, 'Orders']);
  sheet.addRow(['Average Order Value', parseFloat(data.averageOrderValue) || 0, 'VND']);
  sheet.addRow(['Min Order Value', parseFloat(data.minOrderValue) || 0, 'VND']);
  sheet.addRow(['Max Order Value', parseFloat(data.maxOrderValue) || 0, 'VND']);
  
  // Styling
  sheet.getRow(1).font = { bold: true, size: 16, color: { argb: 'FF0066CC' } };
  sheet.getRow(5).font = { bold: true };
  sheet.columns = [
    { width: 25 },
    { width: 20 },
    { width: 15 }
  ];
  
  // Number formatting
  sheet.getColumn(2).numFmt = '#,##0.00';
}

// Generate Daily Revenue Sheet
async function generateDailyRevenueSheet(workbook, startDate, endDate) {
  const sheet = workbook.addWorksheet('Daily Revenue');
  
  const end = endDate ? moment(endDate) : moment();
  const start = startDate ? moment(startDate) : moment().subtract(30, 'days');
  
  const result = await pool.request()
    .input('StartDate', sql.Date, start.format('YYYY-MM-DD'))
    .input('EndDate', sql.Date, end.format('YYYY-MM-DD'))
    .query(`
      SELECT 
        CAST(OrderDate AS DATE) as date,
        ISNULL(SUM(CAST(TotalAmount AS DECIMAL(18,2))), 0) as revenue,
        COUNT(*) as orders,
        ISNULL(AVG(CAST(TotalAmount AS DECIMAL(18,2))), 0) as averageOrderValue
      FROM Orders 
      WHERE CAST(OrderDate AS DATE) BETWEEN @StartDate AND @EndDate 
        AND Status = 'Paid'
      GROUP BY CAST(OrderDate AS DATE)
      ORDER BY date DESC
    `);

  // Headers
  sheet.addRow(['📅 DAILY REVENUE ANALYSIS']);
  sheet.addRow(['Period:', `${start.format('YYYY-MM-DD')} to ${end.format('YYYY-MM-DD')}`]);
  sheet.addRow([]);
  sheet.addRow(['Date', 'Revenue (VND)', 'Orders', 'Avg Order Value (VND)']);
  
  // Data
  result.recordset.forEach(row => {
    sheet.addRow([
      moment(row.date).format('YYYY-MM-DD'),
      parseFloat(row.revenue) || 0,
      row.orders || 0,
      parseFloat(row.averageOrderValue) || 0
    ]);
  });
  
  // Styling
  sheet.getRow(1).font = { bold: true, size: 16 };
  sheet.getRow(4).font = { bold: true };
  sheet.columns = [
    { width: 15 },
    { width: 20 },
    { width: 10 },
    { width: 20 }
  ];
  
  // Number formatting
  sheet.getColumn(2).numFmt = '#,##0.00';
  sheet.getColumn(4).numFmt = '#,##0.00';
}

// Generate Top Products Sheet
async function generateTopProductsSheet(workbook, startDate, endDate, limit) {
  const sheet = workbook.addWorksheet('Top Products');
  
  const end = endDate ? moment(endDate) : moment();
  const start = startDate ? moment(startDate) : moment().subtract(30, 'days');
  
  const result = await pool.request()
    .input('StartDate', sql.Date, start.format('YYYY-MM-DD'))
    .input('EndDate', sql.Date, end.format('YYYY-MM-DD'))
    .input('Limit', sql.Int, parseInt(limit) || 10)
    .query(`
      SELECT TOP (@Limit)
        p.ProductName as productName,
        ISNULL(c.CategoryName, 'No Category') as categoryName,
        p.UnitPrice as unitPrice,
        ISNULL(SUM(oi.Quantity), 0) as totalQuantitySold,
        ISNULL(SUM(oi.Quantity * oi.UnitPrice), 0) as totalRevenue,
        ISNULL(COUNT(DISTINCT o.OrderID), 0) as orderCount
      FROM OrderItems oi
      JOIN Orders o ON oi.OrderID = o.OrderID
      JOIN Products p ON oi.ProductID = p.ProductID
      LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
      WHERE CAST(o.OrderDate AS DATE) BETWEEN @StartDate AND @EndDate 
        AND o.Status = 'Paid'
      GROUP BY p.ProductName, c.CategoryName, p.UnitPrice
      ORDER BY totalQuantitySold DESC
    `);

  // Headers
  sheet.addRow(['🏆 TOP SELLING PRODUCTS']);
  sheet.addRow(['Period:', `${start.format('YYYY-MM-DD')} to ${end.format('YYYY-MM-DD')}`]);
  sheet.addRow(['Top:', `${limit || 10} products`]);
  sheet.addRow([]);
  sheet.addRow(['Rank', 'Product Name', 'Category', 'Unit Price', 'Qty Sold', 'Revenue', 'Orders']);
  
  // Data
  result.recordset.forEach((product, index) => {
    sheet.addRow([
      index + 1,
      product.productName,
      product.categoryName,
      parseFloat(product.unitPrice) || 0,
      product.totalQuantitySold || 0,
      parseFloat(product.totalRevenue) || 0,
      product.orderCount || 0
    ]);
  });
  
  // Styling
  sheet.getRow(1).font = { bold: true, size: 16 };
  sheet.getRow(5).font = { bold: true };
  sheet.columns = [
    { width: 8 },
    { width: 30 },
    { width: 15 },
    { width: 15 },
    { width: 12 },
    { width: 20 },
    { width: 10 }
  ];
  
  // Number formatting
  sheet.getColumn(4).numFmt = '#,##0.00';
  sheet.getColumn(6).numFmt = '#,##0.00';
}

// Generate Payment Methods Sheet
async function generatePaymentMethodsSheet(workbook, startDate, endDate) {
  const sheet = workbook.addWorksheet('Payment Methods');
  
  const end = endDate ? moment(endDate) : moment();
  const start = startDate ? moment(startDate) : moment().subtract(30, 'days');
  
  const result = await pool.request()
    .input('StartDate', sql.Date, start.format('YYYY-MM-DD'))
    .input('EndDate', sql.Date, end.format('YYYY-MM-DD'))
    .query(`
      SELECT 
        ISNULL(p.PaymentType, 'Unknown') as paymentMethod,
        COUNT(*) as transactionCount,
        SUM(p.Amount) as totalAmount,
        AVG(p.Amount) as averageAmount,
        MIN(p.Amount) as minAmount,
        MAX(p.Amount) as maxAmount
      FROM Payments p
      JOIN Orders o ON p.OrderID = o.OrderID
      WHERE CAST(o.OrderDate AS DATE) BETWEEN @StartDate AND @EndDate 
        AND o.Status = 'Paid'
      GROUP BY p.PaymentType
      ORDER BY totalAmount DESC
    `);

  const totalAmount = result.recordset.reduce((sum, method) => sum + parseFloat(method.totalAmount || 0), 0);

  // Headers
  sheet.addRow(['💳 PAYMENT METHODS ANALYSIS']);
  sheet.addRow(['Period:', `${start.format('YYYY-MM-DD')} to ${end.format('YYYY-MM-DD')}`]);
  sheet.addRow([]);
  sheet.addRow(['Payment Method', 'Transactions', 'Total Amount', 'Percentage', 'Avg Amount', 'Min Amount', 'Max Amount']);
  
  // Data
  result.recordset.forEach(method => {
    const percentage = totalAmount > 0 ? ((method.totalAmount / totalAmount) * 100) : 0;
    sheet.addRow([
      method.paymentMethod,
      method.transactionCount || 0,
      parseFloat(method.totalAmount) || 0,
      `${percentage.toFixed(2)}%`,
      parseFloat(method.averageAmount) || 0,
      parseFloat(method.minAmount) || 0,
      parseFloat(method.maxAmount) || 0
    ]);
  });
  
  // Styling
  sheet.getRow(1).font = { bold: true, size: 16 };
  sheet.getRow(4).font = { bold: true };
  sheet.columns = [
    { width: 18 },
    { width: 15 },
    { width: 20 },
    { width: 12 },
    { width: 20 },
    { width: 15 },
    { width: 15 }
  ];
  
  // Number formatting
  sheet.getColumn(3).numFmt = '#,##0.00';
  sheet.getColumn(5).numFmt = '#,##0.00';
  sheet.getColumn(6).numFmt = '#,##0.00';
  sheet.getColumn(7).numFmt = '#,##0.00';
}

// Generate Discount Analysis Sheet
async function generateDiscountAnalysisSheet(workbook, startDate, endDate) {
  const sheet = workbook.addWorksheet('Discount Analysis');
  
  const end = endDate ? moment(endDate) : moment();
  const start = startDate ? moment(startDate) : moment().subtract(30, 'days');
  
  const result = await pool.request()
    .input('StartDate', sql.Date, start.format('YYYY-MM-DD'))
    .input('EndDate', sql.Date, end.format('YYYY-MM-DD'))
    .query(`
      SELECT 
        ISNULL(SUM(o.TotalAmount), 0) as totalRevenue,
        ISNULL(SUM(
          CASE 
            WHEN p.DiscountPercentage > 0 THEN (o.TotalAmount * p.DiscountPercentage / 100)
            ELSE 0
          END
        ), 0) as totalDiscountAmount,
        ISNULL(SUM(p.Amount), 0) as totalPaidAmount,
        COUNT(CASE WHEN p.DiscountPercentage > 0 THEN 1 END) as discountedOrders,
        COUNT(*) as totalOrders
      FROM Orders o
      LEFT JOIN Payments p ON o.OrderID = p.OrderID
      WHERE CAST(o.OrderDate AS DATE) BETWEEN @StartDate AND @EndDate 
        AND o.Status = 'Paid'
    `);

  const data = result.recordset[0];
  const discountRate = data.totalRevenue > 0 ? (data.totalDiscountAmount / data.totalRevenue * 100) : 0;
  const discountOrderPercentage = data.totalOrders > 0 ? (data.discountedOrders / data.totalOrders * 100) : 0;

  // Headers
  sheet.addRow(['💰 DISCOUNT ANALYSIS']);
  sheet.addRow(['Period:', `${start.format('YYYY-MM-DD')} to ${end.format('YYYY-MM-DD')}`]);
  sheet.addRow([]);
  sheet.addRow(['Metric', 'Value', 'Percentage']);
  
  // Data
  sheet.addRow(['Total Revenue (Before Discount)', parseFloat(data.totalRevenue) || 0, '100.00%']);
  sheet.addRow(['Total Discount Amount', parseFloat(data.totalDiscountAmount) || 0, `${discountRate.toFixed(2)}%`]);
  sheet.addRow(['Total Paid Amount', parseFloat(data.totalPaidAmount) || 0, `${((data.totalPaidAmount / data.totalRevenue) * 100).toFixed(2)}%`]);
  sheet.addRow(['Total Orders', data.totalOrders || 0, '100.00%']);
  sheet.addRow(['Discounted Orders', data.discountedOrders || 0, `${discountOrderPercentage.toFixed(2)}%`]);
  sheet.addRow(['Orders without Discount', (data.totalOrders - data.discountedOrders) || 0, `${(100 - discountOrderPercentage).toFixed(2)}%`]);
  
  // Styling
  sheet.getRow(1).font = { bold: true, size: 16 };
  sheet.getRow(4).font = { bold: true };
  sheet.columns = [
    { width: 30 },
    { width: 20 },
    { width: 15 }
  ];
  
  // Number formatting
  sheet.getColumn(2).numFmt = '#,##0.00';
}

module.exports.exportExcel = async (req, res, next) => {
  try {
    const { 
      type = 'comprehensive', 
      startDate, 
      endDate, 
      year, 
      limit = 10,
      categoryId 
    } = req.query;

    console.log(`📊 Excel Export: ${type} with params:`, req.query);

    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    
    // Company info
    workbook.creator = 'CafeBeer POS System';
    workbook.created = new Date();

    let filename = `analytics-${type}-${moment().format('YYYY-MM-DD-HHmm')}`;

    // Switch theo type để generate different sheets
    switch (type) {
      case 'revenue-summary':
        await generateRevenueSummarySheet(workbook, startDate, endDate);
        filename = `revenue-summary-${moment().format('YYYY-MM-DD')}`;
        break;

      case 'daily-revenue':
        await generateDailyRevenueSheet(workbook, startDate, endDate);
        filename = `daily-revenue-${startDate || 'recent'}-to-${endDate || moment().format('YYYY-MM-DD')}`;
        break;

      case 'top-products':
        await generateTopProductsSheet(workbook, startDate, endDate, limit);
        filename = `top-products-${limit}-${moment().format('YYYY-MM-DD')}`;
        break;

      case 'payment-methods':
        await generatePaymentMethodsSheet(workbook, startDate, endDate);
        filename = `payment-methods-${moment().format('YYYY-MM-DD')}`;
        break;

      case 'discount-analysis':
        await generateDiscountAnalysisSheet(workbook, startDate, endDate);
        filename = `discount-analysis-${moment().format('YYYY-MM-DD')}`;
        break;

      case 'comprehensive':
      default:
        // Generate ALL sheets in one workbook
        await generateRevenueSummarySheet(workbook, startDate, endDate);
        await generateDailyRevenueSheet(workbook, startDate, endDate);
        await generateTopProductsSheet(workbook, startDate, endDate, limit);
        await generatePaymentMethodsSheet(workbook, startDate, endDate);
        await generateDiscountAnalysisSheet(workbook, startDate, endDate);
        filename = `comprehensive-analytics-${moment().format('YYYY-MM-DD')}`;
        break;
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);

    // Stream Excel file
    await workbook.xlsx.write(res);
    res.end();

    console.log(`✅ Excel exported: ${filename}.xlsx`);

  } catch (err) {
    console.error('❌ Excel export error:', err);
    next(err);
  }
};