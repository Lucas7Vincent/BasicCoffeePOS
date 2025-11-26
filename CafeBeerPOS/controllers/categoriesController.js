const { pool, sql } = require('../config/db');
const validators = require('../utils/validators');

module.exports = {
  getAll: async (req, res, next) => {
    try {
      // Chỉ lấy categories chưa bị xóa (Available = 1 hoặc NULL)
      const result = await pool.request()
        .query(`SELECT CategoryID as id, CategoryName as categoryName, 
                ISNULL(Available, 1) as isAvailable 
                FROM Categories 
                WHERE ISNULL(Available, 1) = 1 
                ORDER BY CategoryName`);

      res.status(200).json({ 
        status: 'success', 
        data: result.recordset 
      });
    } catch (err) {
      next(err);
    }
  },

  getById: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid category ID' 
        });
      }

      const result = await pool.request()
        .input('CategoryID', sql.Int, id)
        .query(`SELECT CategoryID as id, CategoryName as categoryName, 
                ISNULL(Available, 1) as isAvailable 
                FROM Categories 
                WHERE CategoryID = @CategoryID AND ISNULL(Available, 1) = 1`);
      
      if (result.recordset.length === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Category not found' 
        });
      }
      
      res.status(200).json({ 
        status: 'success', 
        data: result.recordset[0] 
      });
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      console.log('🏷️ Creating category with data:', req.body);
      const { name } = req.body;

      // Validate input
      const validation = validators.validateCategory({ name });
      if (!validation.isValid) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Validation failed',
          errors: validation.errors 
        });
      }

      // Kiểm tra tên category đã tồn tại (kể cả đã xóa)
      const existing = await pool.request()
        .input('CategoryName', sql.NVarChar(50), name.trim())
        .query('SELECT CategoryID, ISNULL(Available, 1) as Available FROM Categories WHERE CategoryName = @CategoryName');

      if (existing.recordset.length > 0) {
        if (existing.recordset[0].Available === 1) {
          return res.status(409).json({ 
            status: 'fail', 
            message: 'Category name already exists' 
          });
        } else {
          // Nếu category đã tồn tại nhưng bị xóa, restore nó
          await pool.request()
            .input('CategoryID', sql.Int, existing.recordset[0].CategoryID)
            .query('UPDATE Categories SET Available = 1 WHERE CategoryID = @CategoryID');
          
          return res.status(201).json({ 
            status: 'success', 
            data: { id: existing.recordset[0].CategoryID },
            message: 'Category restored successfully'
          });
        }
      }

      const insert = await pool.request()
        .input('CategoryName', sql.NVarChar(50), name.trim())
        .query('INSERT INTO Categories (CategoryName, Available) OUTPUT INSERTED.CategoryID VALUES (@CategoryName, 1)');

      res.status(201).json({ 
        status: 'success', 
        data: { id: insert.recordset[0].CategoryID } 
      });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid category ID' 
        });
      }

      const { name, isAvailable } = req.body;

      // Validate input
      const validation = validators.validateCategory({ name });
      if (!validation.isValid) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Validation failed',
          errors: validation.errors 
        });
      }

      const update = await pool.request()
        .input('CategoryID', sql.Int, id)
        .input('CategoryName', sql.NVarChar(50), name.trim())
        .input('Available', sql.Bit, isAvailable !== undefined ? isAvailable : 1)
        .query(`UPDATE Categories 
                SET CategoryName = @CategoryName, Available = @Available 
                WHERE CategoryID = @CategoryID AND ISNULL(Available, 1) = 1`);

      if (update.rowsAffected[0] === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Category not found' 
        });
      }
      
      res.status(200).json({ 
        status: 'success', 
        message: 'Category updated successfully' 
      });
    } catch (err) {
      if (err.message.includes('UNIQUE') || err.message.includes('duplicate')) {
        return res.status(409).json({ 
          status: 'fail', 
          message: 'Category name already exists' 
        });
      }
      next(err);
    }
  },

  // Soft delete - set Available = 0
  remove: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid category ID' 
        });
      }

      // Kiểm tra có products nào đang sử dụng category này không (chỉ products available)
      const productsCheck = await pool.request()
        .input('CategoryID', sql.Int, id)
        .query('SELECT COUNT(*) as count FROM Products WHERE CategoryID = @CategoryID AND ISNULL(Available, 1) = 1');

      if (productsCheck.recordset[0].count > 0) {
        return res.status(409).json({ 
          status: 'fail', 
          message: 'Cannot delete category: category has active products. Please remove products first.' 
        });
      }

      // Soft delete: set Available = 0
      const update = await pool.request()
        .input('CategoryID', sql.Int, id)
        .query('UPDATE Categories SET Available = 0 WHERE CategoryID = @CategoryID AND ISNULL(Available, 1) = 1');

      if (update.rowsAffected[0] === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Category not found or already deleted' 
        });
      }
      
      res.status(200).json({ 
        status: 'success', 
        message: 'Category deleted successfully' 
      });
    } catch (err) {
      next(err);
    }
  },

  // Thêm method để restore category đã xóa
  restore: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid category ID' 
        });
      }

      const update = await pool.request()
        .input('CategoryID', sql.Int, id)
        .query('UPDATE Categories SET Available = 1 WHERE CategoryID = @CategoryID AND Available = 0');
      
      if (update.rowsAffected[0] === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Category not found or not deleted' 
        });
      }
      
      res.status(200).json({ 
        status: 'success', 
        message: 'Category restored successfully' 
      });
    } catch (err) {
      next(err);
    }
  },

  // Thêm method để xem categories đã xóa
  getDeleted: async (req, res, next) => {
    try {
      const result = await pool.request()
        .query(`SELECT CategoryID as id, CategoryName as categoryName, 
                Available as isAvailable 
                FROM Categories 
                WHERE Available = 0 
                ORDER BY CategoryName`);
      
      res.status(200).json({ 
        status: 'success', 
        data: result.recordset 
      });
    } catch (err) {
      next(err);
    }
  }
};