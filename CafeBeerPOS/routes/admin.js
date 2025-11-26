const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireManager } = require('../middleware/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative functions (Manager only)
 */

/**
 * @swagger
 * /api/admin/payment-methods/check:
 *   get:
 *     summary: Check current payment methods distribution
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods distribution with statistics
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
 *                     paymentMethods:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           paymentType:
 *                             type: string
 *                           paymentCount:
 *                             type: integer
 *                           totalAmount:
 *                             type: number
 *                           averageAmount:
 *                             type: number
 *                           amountPercentage:
 *                             type: number
 *                           countPercentage:
 *                             type: number
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalMethods:
 *                           type: integer
 *                         totalPayments:
 *                           type: integer
 *                         totalAmount:
 *                           type: number
 */
router.get('/payment-methods/check', requireManager, adminController.checkPaymentMethods);

/**
 * @swagger
 * /api/admin/payment-methods/update:
 *   put:
 *     summary: Update E-Wallet payment methods to Banking
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     before:
 *                       type: array
 *                       description: Payment methods distribution before update
 *                     after:
 *                       type: array
 *                       description: Payment methods distribution after update
 *                     updatedRecords:
 *                       type: integer
 *                       description: Number of records updated
 *                     sampleRecords:
 *                       type: array
 *                       description: Sample of updated records
 */
router.put('/payment-methods/update', requireManager, adminController.updatePaymentMethods);

/**
 * @swagger
 * /api/admin/payment-methods/rollback:
 *   put:
 *     summary: Rollback Banking payment methods to E-Wallet
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods rolled back successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedRecords:
 *                       type: integer
 *                       description: Number of records rolled back
 */
router.put('/payment-methods/rollback', requireManager, adminController.rollbackPaymentMethods);

module.exports = router;
