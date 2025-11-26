const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireManager, requireAnyRole } = require('../middleware/roleMiddleware');

// Public endpoints - không cần auth
router.get('/', productsController.getAll);
router.get('/:id', productsController.getById);

// Manager-only endpoints
router.get('/deleted', authMiddleware, requireManager, productsController.getDeleted);
router.post('/', authMiddleware, requireManager, productsController.create);
router.put('/:id', authMiddleware, requireManager, productsController.update);
router.delete('/:id', authMiddleware, requireManager, productsController.remove);
router.put('/:id/restore', authMiddleware, requireManager, productsController.restore);


/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - categoryId
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: The product name
 *         price:
 *           type: number
 *           format: decimal
 *           description: The product price
 *         imageUrl:
 *           type: string
 *           description: URL of the product image
 *         categoryId:
 *           type: integer
 *           description: The category ID
 *         categoryName:
 *           type: string
 *           description: The category name
 *         isAvailable:
 *           type: boolean
 *           description: Product availability (for soft delete)
 *       example:
 *         id: 1
 *         name: Cappuccino
 *         price: 45000
 *         imageUrl: https://example.com/cappuccino.jpg
 *         categoryId: 1
 *         categoryName: Coffee
 *         isAvailable: true
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management API
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all available products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of all available products
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
 *                     $ref: '#/components/schemas/Product'
 */
router.get('/', productsController.getAll);

/**
 * @swagger
 * /api/products/deleted:
 *   get:
 *     summary: Get all deleted products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all deleted products
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
 *                     $ref: '#/components/schemas/Product'
 */
router.get('/deleted', productsController.getDeleted);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.get('/:id', productsController.getById);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *           example:
 *             name: "Cappuccino"
 *             price: 45000
 *             imageUrl: "https://example.com/cappuccino.jpg"
 *             categoryId: 1
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', productsController.create);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               imageUrl:
 *                 type: string
 *               categoryId:
 *                 type: integer
 *               isAvailable:
 *                 type: boolean
 *           example:
 *             name: "Cappuccino"
 *             price: 45000
 *             imageUrl: "https://example.com/cappuccino.jpg"
 *             categoryId: 1
 *             isAvailable: true
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
router.put('/:id', productsController.update);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Soft delete product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully (soft delete)
 *       404:
 *         description: Product not found
 */
router.delete('/:id', productsController.remove);

/**
 * @swagger
 * /api/products/{id}/restore:
 *   put:
 *     summary: Restore deleted product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product restored successfully
 *       404:
 *         description: Product not found or not deleted
 */
router.put('/:id/restore', productsController.restore);

module.exports = router;