const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireManager } = require('../middleware/roleMiddleware');

// Public endpoint - no auth required
router.post('/login', usersController.login);      

// Token verification endpoint - requires auth
router.get('/verify', authMiddleware, usersController.verifyToken);

// Manager-only endpoints - require both auth and manager role
router.get('/', authMiddleware, requireManager, usersController.getAll);
router.get('/deleted', authMiddleware, requireManager, usersController.getDeleted);
router.get('/:id', authMiddleware, requireManager, usersController.getById);
router.post('/', authMiddleware, requireManager, usersController.create);
router.put('/:id', authMiddleware, requireManager, usersController.update);
router.delete('/:id', authMiddleware, requireManager, usersController.remove);
router.put('/:id/restore', authMiddleware, requireManager, usersController.restore);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - fullName
 *         - role
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The username
 *         password:
 *           type: string
 *           description: The user password
 *         fullName:
 *           type: string
 *           description: The user full name
 *         role:
 *           type: string
 *           enum: [Staff, Cashier, Manager]
 *           description: The user role
 *         isAvailable:
 *           type: boolean
 *           description: User availability (for soft delete)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the user was created
 *       example:
 *         id: 1
 *         username: "nvphan"
 *         fullName: "Nguyễn Văn Phan"
 *         role: "Staff"
 *         isAvailable: true
 *         createdAt: "2023-08-22T10:00:00.000Z"
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API (Manager only)
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *           example:
 *             username: "nvphan"
 *             password: "password123"
 *     responses:
 *       200:
 *         description: Login successful
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
 *                     token:
 *                       type: string
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', usersController.login);      

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (Manager only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all active users
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
 *                     $ref: '#/components/schemas/User'
 *       403:
 *         description: Access denied - Manager role required
 */
router.get('/', authMiddleware, requireManager, usersController.getAll);

/**
 * @swagger
 * /api/users/deleted:
 *   get:
 *     summary: Get all deleted users (Manager only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all deleted users
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
 *                     $ref: '#/components/schemas/User'
 *       403:
 *         description: Access denied - Manager role required
 */
router.get('/deleted', authMiddleware, requireManager, usersController.getDeleted);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (Manager only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Access denied - Manager role required
 *       404:
 *         description: User not found
 */
router.get('/:id', authMiddleware, requireManager, usersController.getById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create new user (Manager only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - fullName
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Staff, Cashier, Manager]
 *           example:
 *             username: "nvthuong"
 *             password: "password123"
 *             fullName: "Trần Thị Thương"
 *             role: "Cashier"
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Access denied - Manager role required
 *       409:
 *         description: Username already exists
 */
router.post('/', authMiddleware, requireManager, usersController.create);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user (Manager only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *               fullName:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Staff, Cashier, Manager]
 *               isAvailable:
 *                 type: boolean
 *           example:
 *             fullName: "Trần Thị Thương Updated"
 *             role: "Cashier"
 *             isAvailable: true
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input or cannot modify own account
 *       403:
 *         description: Access denied - Manager role required
 *       404:
 *         description: User not found
 */
router.put('/:id', authMiddleware, requireManager, usersController.update);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Soft delete user (Manager only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully (soft delete)
 *       400:
 *         description: Cannot delete own account
 *       403:
 *         description: Access denied - Manager role required
 *       404:
 *         description: User not found
 */
router.delete('/:id', authMiddleware, requireManager, usersController.remove);

/**
 * @swagger
 * /api/users/{id}/restore:
 *   put:
 *     summary: Restore deleted user (Manager only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User restored successfully
 *       403:
 *         description: Access denied - Manager role required
 *       404:
 *         description: User not found or not deleted
 */
router.put('/:id/restore', authMiddleware, requireManager, usersController.restore);

module.exports = router;