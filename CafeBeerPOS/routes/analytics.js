const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { requireCashierOrManager } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Revenue and sales analytics API (Cashier/Manager only)
 */

/**
 * @swagger
 * /api/analytics/revenue/summary:
 *   get:
 *     summary: Get revenue summary (today, this month, this year)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Revenue summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     today:
 *                       type: object
 *                       properties:
 *                         revenue:
 *                           type: number
 *                         orders:
 *                           type: integer
 *                         growth:
 *                           type: number
 *                     thisMonth:
 *                       type: object
 *                       properties:
 *                         revenue:
 *                           type: number
 *                         orders:
 *                           type: integer
 *                         growth:
 *                           type: number
 *                     thisYear:
 *                       type: object
 *                       properties:
 *                         revenue:
 *                           type: number
 */
// ✅ Chỉ dùng requireCashierOrManager (auth đã có ở server.js)
router.get('/revenue/summary', requireCashierOrManager, analyticsController.getRevenueSummary);

/**
 * @swagger
 * /api/analytics/revenue/daily:
 *   get:
 *     summary: Get daily revenue (with date range)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Daily revenue data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: object
 *                       properties:
 *                         startDate:
 *                           type: string
 *                         endDate:
 *                           type: string
 *                     dailyRevenue:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           revenue:
 *                             type: number
 *                           orders:
 *                             type: integer
 *                           averageOrderValue:
 *                             type: number
 */
router.get('/revenue/daily', requireCashierOrManager, analyticsController.getDailyRevenue);

/**
 * @swagger
 * /api/analytics/revenue/monthly:
 *   get:
 *     summary: Get monthly revenue
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year (default: current year)
 *     responses:
 *       200:
 *         description: Monthly revenue data
 */
router.get('/revenue/monthly', requireCashierOrManager, analyticsController.getMonthlyRevenue);

/**
 * @swagger
 * /api/analytics/revenue/yearly:
 *   get:
 *     summary: Get yearly revenue
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: years
 *         schema:
 *           type: integer
 *         description: Number of years to show (default: 5)
 *     responses:
 *       200:
 *         description: Yearly revenue data
 */
router.get('/revenue/yearly', requireCashierOrManager, analyticsController.getYearlyRevenue);

/**
 * @swagger
 * /api/analytics/products/top-selling:
 *   get:
 *     summary: Get top selling products
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of products to return (default: 10)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Top selling products data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: object
 *                     topProducts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: integer
 *                           productName:
 *                             type: string
 *                           categoryName:
 *                             type: string
 *                           unitPrice:
 *                             type: number
 *                           totalQuantitySold:
 *                             type: integer
 *                           totalRevenue:
 *                             type: number
 *                           orderCount:
 *                             type: integer
 *                           averageQuantityPerOrder:
 *                             type: number
 */
router.get('/products/top-selling', requireCashierOrManager, analyticsController.getTopSellingProducts);

/**
 * @swagger
 * /api/analytics/products/revenue:
 *   get:
 *     summary: Get products revenue analysis
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *     responses:
 *       200:
 *         description: Products revenue analysis
 */
router.get('/products/revenue', requireCashierOrManager, analyticsController.getProductsRevenue);

/**
 * @swagger
 * /api/analytics/categories/performance:
 *   get:
 *     summary: Get categories performance
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Categories performance data
 */
router.get('/categories/performance', requireCashierOrManager, analyticsController.getCategoriesPerformance);

/**
 * @swagger
 * /api/analytics/discounts:
 *   get:
 *     summary: Get discount and promotion analysis
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Discount analysis data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalRevenue:
 *                           type: number
 *                         totalDiscountAmount:
 *                           type: number
 *                         discountOrderPercentage:
 *                           type: number
 *                     discountTiers:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/discounts', requireCashierOrManager, analyticsController.getDiscountAnalysis);

/**
 * @swagger
 * /api/analytics/payment-methods:
 *   get:
 *     summary: Get payment method analysis
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Payment method analysis data
 */
router.get('/payment-methods', requireCashierOrManager, analyticsController.getPaymentMethodAnalysis);

/**
 * @swagger
 * /api/analytics/comprehensive:
 *   get:
 *     summary: Get comprehensive business report
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Comprehensive business analytics with hourly/daily patterns
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     revenueOverview:
 *                       type: object
 *                       properties:
 *                         grossRevenue:
 *                           type: number
 *                         netRevenue:
 *                           type: number
 *                         totalDiscounts:
 *                           type: number
 *                         discountRate:
 *                           type: number
 *                     hourlyAnalysis:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           hour:
 *                             type: integer
 *                           orderCount:
 *                             type: integer
 *                           revenue:
 *                             type: number
 *                     weekdayAnalysis:
 *                       type: array
 *                     topPerformingDays:
 *                       type: array
 */
router.get('/comprehensive', requireCashierOrManager, analyticsController.getComprehensiveReport);

/**
 * @swagger
 * /api/analytics/export/excel:
 *   get:
 *     summary: Export analytics data to Excel (Universal endpoint)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [comprehensive, revenue-summary, daily-revenue, top-products, payment-methods, discount-analysis]
 *           default: comprehensive
 *         description: Type of analytics to export
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: Year for monthly revenue (default current year)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limit for top products
 *     responses:
 *       200:
 *         description: Excel file download
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/export/excel', requireCashierOrManager, analyticsController.exportExcel);

module.exports = router;