const express = require('express');
const router = express.Router();
const tablesController = require('../controllers/tablesController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Table:
 *       type: object
 *       required:
 *         - tableName
 *         - seatingCapacity
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the table
 *         tableName:
 *           type: string
 *           description: The table name
 *         seatingCapacity:
 *           type: integer
 *           description: Number of people the table can accommodate
 *         description:
 *           type: string
 *           description: Description of the table
 *       example:
 *         id: 1
 *         tableName: "Bàn 1"
 *         seatingCapacity: 4
 *         description: "Gần cửa sổ"
 */

/**
 * @swagger
 * tags:
 *   name: Tables
 *   description: Table management API
 */

/**
 * @swagger
 * /api/tables:
 *   get:
 *     summary: Get all tables
 *     tags: [Tables]
 *     responses:
 *       200:
 *         description: List of all tables
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
 *                     $ref: '#/components/schemas/Table'
 */
router.get('/', tablesController.getAll);

/**
 * @swagger
 * /api/tables/{id}:
 *   get:
 *     summary: Get table by ID
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Table ID
 *     responses:
 *       200:
 *         description: Table found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Table'
 *       404:
 *         description: Table not found
 */
router.get('/:id', tablesController.getById);

/**
 * @swagger
 * /api/tables:
 *   post:
 *     summary: Create new table
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tableName
 *               - seatingCapacity
 *             properties:
 *               tableName:
 *                 type: string
 *               seatingCapacity:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Table created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', tablesController.create);

/**
 * @swagger
 * /api/tables/{id}:
 *   put:
 *     summary: Update table
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Table ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tableName:
 *                 type: string
 *               seatingCapacity:
 *                 type: integer
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Table updated successfully
 *       404:
 *         description: Table not found
 */
router.put('/:id', tablesController.update);

/**
 * @swagger
 * /api/tables/{id}:
 *   delete:
 *     summary: Delete table
 *     tags: [Tables]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Table ID
 *     responses:
 *       200:
 *         description: Table deleted successfully
 *       404:
 *         description: Table not found
 */
router.delete('/:id', tablesController.remove);

module.exports = router;
