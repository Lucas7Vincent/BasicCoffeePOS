const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const { requireCashierOrManager, requireAnyRole } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentRequest:
 *       type: object
 *       required:
 *         - OrderID
 *         - PaymentType
 *       properties:
 *         OrderID:
 *           type: integer
 *           description: The order ID to process payment for
 *           example: 1
 *         PaymentType:
 *           type: string
 *           enum: [Cash, Card, Banking]
 *           description: Payment method
 *           example: "Cash"
 *         discountPercentage:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           maximum: 100
 *           description: Discount percentage (0-100)
 *           example: 10.5
 *           default: 0
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Payment ID
 *         orderId:
 *           type: integer
 *           description: Order ID
 *         paymentType:
 *           type: string
 *           enum: [Cash, Card, Banking]
 *           description: Payment method
 *         amount:
 *           type: number
 *           format: decimal
 *           description: Final payment amount (after discount)
 *         discountPercentage:
 *           type: number
 *           format: decimal
 *           description: Applied discount percentage
 *         discountAmount:
 *           type: number
 *           format: decimal
 *           description: Discount amount in currency
 *         originalAmount:
 *           type: number
 *           format: decimal
 *           description: Original amount before discount
 *         paymentDate:
 *           type: string
 *           format: date-time
 *           description: Payment date
 *         orderStatus:
 *           type: string
 *           description: Order status
 *       example:
 *         id: 1
 *         orderId: 1
 *         paymentType: "Cash"
 *         amount: 130500.00
 *         discountPercentage: 10.0
 *         discountAmount: 14500.00
 *         originalAmount: 145000.00
 *         paymentDate: "2025-08-22T19:59:48.090Z"
 *         orderStatus: "Paid"
 */

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing API (Cashier/Manager only)
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Process payment with optional percentage discount
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentRequest'
 *           examples:
 *             no_discount:
 *               summary: Payment without discount
 *               value:
 *                 OrderID: 1
 *                 PaymentType: "Cash"
 *             with_discount:
 *               summary: Payment with 10% discount
 *               value:
 *                 OrderID: 1
 *                 PaymentType: "Cash"
 *                 discountPercentage: 10
 *     responses:
 *       201:
 *         description: Payment processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Invalid input or validation error
 *       404:
 *         description: Order not found
 */
router.post('/', requireCashierOrManager, paymentsController.createPayment);


/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments with optional filters (Manager only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments from this date (YYYY-MM-DD)
 *         example: "2025-08-22"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter payments to this date (YYYY-MM-DD)
 *         example: "2025-08-23"
 *       - in: query
 *         name: paymentType
 *         schema:
 *           type: string
 *           enum: [Cash, Card, Banking]
 *         description: Filter by payment type
 *         example: "Cash"
 *       - in: query
 *         name: orderId
 *         schema:
 *           type: integer
 *         description: Filter by specific order ID
 *         example: 1
 *     responses:
 *       200:
 *         description: List of payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Payment'
 *                       - type: object
 *                         properties:
 *                           processedBy:
 *                             type: string
 *                             description: Username who processed the payment
 *                           processedByFullName:
 *                             type: string
 *                             description: Full name of who processed the payment
 */
router.get('/', requireCashierOrManager, paymentsController.getAllPayments);

/**
 * @swagger
 * /api/payments/{paymentId}:
 *   get:
 *     summary: Get payment details by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Payment ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Payment'
 *       404:
 *         description: Payment not found
 */
router.get('/:paymentId', requireAnyRole, paymentsController.getPayment);

/**
 * @swagger
 * /api/payments/order/{orderId}:
 *   get:
 *     summary: Get all payments for a specific order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Order payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Invalid order ID
 */
router.get('/order/:orderId', requireAnyRole, paymentsController.getPaymentsByOrder);

module.exports = router;