const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAnyRole, requireCashierOrManager } = require('../middleware/roleMiddleware');

// Tất cả authenticated users có thể xem và tạo orders
router.get('/', authMiddleware, requireAnyRole, ordersController.getAll);
router.post('/', authMiddleware, requireAnyRole, ordersController.createOrder);
router.get('/:orderId', authMiddleware, requireAnyRole, ordersController.getOrderDetails);
router.post('/:orderId/items', authMiddleware, requireAnyRole, ordersController.addOrderItem);
router.put('/:orderId/items/:itemId', authMiddleware, requireAnyRole, ordersController.updateOrderItem);
router.delete('/:orderId/items/:itemId', authMiddleware, requireAnyRole, ordersController.removeOrderItem);

// Chỉ Cashier và Manager mới được update status (thanh toán)
router.put('/:orderId/status', authMiddleware, requireCashierOrManager, ordersController.updateStatus);

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - tableId
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the order
 *         tableId:
 *           type: integer
 *           description: The table ID for this order
 *         userId:
 *           type: integer
 *           description: The user who created the order
 *         tableName:
 *           type: string
 *           description: The table name
 *         username:
 *           type: string
 *           description: The username who created the order
 *         userFullName:
 *           type: string
 *           description: The full name of user who created the order
 *         totalAmount:
 *           type: number
 *           format: decimal
 *           description: Total amount of the order
 *         status:
 *           type: string
 *           enum: [Ordering, Paid, Cancelled]
 *           description: Current status of the order
 *         orderDate:
 *           type: string
 *           format: date-time
 *           description: The date the order was created
 *       example:
 *         id: 1
 *         tableId: 1
 *         userId: 1
 *         tableName: "Bàn 1"
 *         username: "nvphan"
 *         userFullName: "Nguyễn Văn Phan"
 *         totalAmount: 150000
 *         status: Ordering
 *         orderDate: 2023-08-22T10:00:00.000Z
 *     OrderItem:
 *       type: object
 *       required:
 *         - productId
 *         - quantity
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the order item
 *         orderId:
 *           type: integer
 *           description: The order ID
 *         productId:
 *           type: integer
 *           description: The product ID
 *         productName:
 *           type: string
 *           description: The product name
 *         quantity:
 *           type: integer
 *           description: Quantity of the product
 *         unitPrice:
 *           type: number
 *           format: decimal
 *           description: Unit price at the time of order
 *         notes:
 *           type: string
 *           description: Special notes or instructions for this item
 *           example: "Ít đường, không đá"
 *         subtotal:
 *           type: number
 *           format: decimal
 *           description: Subtotal for this item
 *       example:
 *         id: 1
 *         orderId: 1
 *         productId: 1
 *         productName: "Espresso"
 *         quantity: 2
 *         unitPrice: 45000
 *         notes: "Ít đường, không đá"
 *         subtotal: 90000
 */

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management API (requires authentication)
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 */
router.get('/', ordersController.getAll);

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tableId
 *             properties:
 *               tableId:
 *                 type: integer
 *                 description: The table ID for this order
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid input
 */
router.post('/', ordersController.createOrder);

/**
 * @swagger
 * /api/orders/{orderId}/items:
 *   post:
 *     summary: Add item to order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: The product ID to add
 *               quantity:
 *                 type: integer
 *                 description: Quantity of the product
 *               notes:
 *                 type: string
 *                 description: Special notes or instructions for this item
 *                 example: "Ít đường, không đá"
 *     responses:
 *       201:
 *         description: Item added to order successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Order not found
 */
router.post('/:orderId/items', ordersController.addOrderItem);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get order details with items
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details retrieved successfully
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
 *                     order:
 *                       $ref: '#/components/schemas/Order'
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/OrderItem'
 *       404:
 *         description: Order not found
 */
router.get('/:orderId', ordersController.getOrderDetails);

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   put:
 *     summary: Update order status
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Ordering, Paid, Cancelled]
 *                 description: New status for the order
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Order not found
 */
router.put('/:orderId/status', ordersController.updateStatus);

/**
 * @swagger
 * /api/orders/{orderId}/items/{itemId}:
 *   delete:
 *     summary: Remove item from order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *       - in: path
 *         name: itemId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order Item ID to remove
 *     responses:
 *       200:
 *         description: Item removed from order successfully
 *       400:
 *         description: Cannot remove items from non-ordering order
 *       404:
 *         description: Order or item not found
 */
router.delete('/:orderId/items/:itemId', ordersController.removeOrderItem);

/**
 * @swagger
 * /api/orders/{orderId}/items/{itemId}:
 *   put:
 *     summary: Update item quantity in order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order ID
 *       - in: path
 *         name: itemId
 *         schema:
 *           type: integer
 *         required: true
 *         description: Order Item ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: New quantity for the item
 *                 minimum: 1
 *               notes:
 *                 type: string
 *                 description: Updated notes or instructions for this item
 *                 example: "Thêm kem, nóng"
 *     responses:
 *       200:
 *         description: Item quantity updated successfully
 *       400:
 *         description: Invalid quantity or cannot update non-ordering order
 *       404:
 *         description: Order or item not found
 */
router.put('/:orderId/items/:itemId', ordersController.updateOrderItem);

module.exports = router;
