const { pool, sql } = require('../config/db');
const validators = require('../utils/validators');

module.exports = {
  
  getAll: async (req, res, next) => {
    try {
      // Chỉ lấy sản phẩm chưa bị xóa (Available = 1)
      const result = await pool.request().query(
        `SELECT 
          p.ProductID as id, 
          p.ProductName as productName, 
          p.UnitPrice as unitPrice, 
          p.Description as description, 
          p.CategoryID as categoryId,
          c.CategoryName as categoryName,
          p.Available as isAvailable
         FROM Products p 
         JOIN Categories c ON p.CategoryID = c.CategoryID
         WHERE p.Available = 1
         ORDER BY p.ProductName`
      );
      
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
          message: 'Invalid product ID' 
        });
      }

      const result = await pool.request()
        .input('ProductID', sql.Int, id)
        .query(`SELECT 
                  p.ProductID as id, 
                  p.ProductName as productName, 
                  p.UnitPrice as unitPrice, 
                  p.Description as description, 
                  p.CategoryID as categoryId,
                  c.CategoryName as categoryName,
                  p.Available as isAvailable
                FROM Products p 
                JOIN Categories c ON p.CategoryID = c.CategoryID
                WHERE p.ProductID = @ProductID AND p.Available = 1`);
      
      if (result.recordset.length === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Product not found' 
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
      console.log('📦 Creating product with data:', req.body);
      const { name, categoryId, price, imageUrl } = req.body;

      // Validate input
      const validation = validators.validateProduct({ name, categoryId, price });
      console.log('🔍 Validation result:', validation);
      if (!validation.isValid) {
        console.log('❌ Validation failed:', validation.errors);
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Validation failed',
          errors: validation.errors 
        });
      }

      // Validate imageUrl nếu có
      if (imageUrl && !validators.isValidUrl(imageUrl)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid image URL format' 
        });
      }

      // Check if category exists
      const categoryCheck = await pool.request()
        .input('CategoryID', sql.Int, categoryId)
        .query('SELECT CategoryID FROM Categories WHERE CategoryID = @CategoryID');

      if (categoryCheck.recordset.length === 0) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Category does not exist' 
        });
      }
      
      const insert = await pool.request()
        .input('ProductName', sql.VarChar(100), name.trim())
        .input('CategoryID', sql.Int, categoryId)
        .input('UnitPrice', sql.Decimal(10,2), price)
        .input('Description', sql.NVarChar(255), imageUrl?.trim() || null)
        .input('Available', sql.Bit, 1) // Mặc định available = true
        .query(`INSERT INTO Products (ProductName, CategoryID, UnitPrice, Description, Available) 
                OUTPUT INSERTED.ProductID 
                VALUES (@ProductName, @CategoryID, @UnitPrice, @Description, @Available)`);
      
      res.status(201).json({ 
        status: 'success', 
        data: { id: insert.recordset[0].ProductID } 
      });
    } catch (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(409).json({ 
          status: 'fail', 
          message: 'Product name already exists' 
        });
      }
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid product ID' 
        });
      }

      const { name, categoryId, price, imageUrl, isAvailable } = req.body;

      // Validate input
      const validation = validators.validateProduct({ name, categoryId, price });
      if (!validation.isValid) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Validation failed',
          errors: validation.errors 
        });
      }

      // Validate imageUrl nếu có
      if (imageUrl && !validators.isValidUrl(imageUrl)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid image URL format' 
        });
      }

      // Check if category exists
      const categoryCheck = await pool.request()
        .input('CategoryID', sql.Int, categoryId)
        .query('SELECT CategoryID FROM Categories WHERE CategoryID = @CategoryID');

      if (categoryCheck.recordset.length === 0) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Category does not exist' 
        });
      }
      
      const update = await pool.request()
        .input('ProductID', sql.Int, id)
        .input('ProductName', sql.VarChar(100), name.trim())
        .input('CategoryID', sql.Int, categoryId)
        .input('UnitPrice', sql.Decimal(10,2), price)
        .input('Description', sql.NVarChar(255), imageUrl?.trim() || null)
        .input('Available', sql.Bit, isAvailable !== undefined ? isAvailable : 1)
        .query(`UPDATE Products 
                SET ProductName=@ProductName, CategoryID=@CategoryID, UnitPrice=@UnitPrice, 
                    Description=@Description, Available=@Available 
                WHERE ProductID=@ProductID AND Available = 1`);
      
      if (update.rowsAffected[0] === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Product not found' 
        });
      }
      
      res.status(200).json({ 
        status: 'success', 
        message: 'Product updated successfully' 
      });
    } catch (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(409).json({ 
          status: 'fail', 
          message: 'Product name already exists' 
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
          message: 'Invalid product ID' 
        });
      }

      // Soft delete: set Available = 0
      const update = await pool.request()
        .input('ProductID', sql.Int, id)
        .query('UPDATE Products SET Available = 0 WHERE ProductID = @ProductID AND Available = 1');
      
      if (update.rowsAffected[0] === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Product not found or already deleted' 
        });
      }
      
      res.status(200).json({ 
        status: 'success', 
        message: 'Product deleted successfully' 
      });
    } catch (err) {
      next(err);
    }
  },

  // Thêm method để restore sản phẩm đã xóa
  restore: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid product ID' 
        });
      }

      const update = await pool.request()
        .input('ProductID', sql.Int, id)
        .query('UPDATE Products SET Available = 1 WHERE ProductID = @ProductID AND Available = 0');
      
      if (update.rowsAffected[0] === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Product not found or not deleted' 
        });
      }
      
      res.status(200).json({ 
        status: 'success', 
        message: 'Product restored successfully' 
      });
    } catch (err) {
      next(err);
    }
  },

  // Thêm method để xem sản phẩm đã xóa
  getDeleted: async (req, res, next) => {
    try {
      const result = await pool.request().query(
        `SELECT 
          p.ProductID as id, 
          p.ProductName as productName, 
          p.UnitPrice as unitPrice, 
          p.Description as description, 
          p.CategoryID as categoryId,
          c.CategoryName as categoryName,
          p.Available as isAvailable
         FROM Products p 
         JOIN Categories c ON p.CategoryID = c.CategoryID
         WHERE p.Available = 0
         ORDER BY p.ProductName`
      );
      
      res.status(200).json({ 
        status: 'success', 
        data: result.recordset 
      });
    } catch (err) {
      next(err);
    }
  }
  
};