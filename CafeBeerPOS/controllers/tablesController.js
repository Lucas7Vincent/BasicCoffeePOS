const { pool, sql } = require('../config/db');
const validators = require('../utils/validators');

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const result = await pool.request()
        .query('SELECT TableID as id, TableName as tableName, SeatingCapacity as seatingCapacity, Description as description FROM Tables ORDER BY TableName');
      
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
          message: 'Invalid table ID' 
        });
      }

      const result = await pool.request()
        .input('TableID', sql.Int, id)
        .query('SELECT TableID as id, TableName as tableName, SeatingCapacity as seatingCapacity, Description as description FROM Tables WHERE TableID = @TableID');
      
      if (result.recordset.length === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Table not found' 
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
      const { tableName, seatingCapacity, description } = req.body;

      // Validate input
      const validation = validators.validateTable({ tableName, seatingCapacity });
      if (!validation.isValid) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Validation failed',
          errors: validation.errors 
        });
      }

      const insert = await pool.request()
        .input('TableName', sql.VarChar(50), tableName.trim())
        .input('SeatingCapacity', sql.Int, seatingCapacity)
        .input('Description', sql.NVarChar(255), description?.trim() || null)
        .query('INSERT INTO Tables (TableName, SeatingCapacity, Description) OUTPUT INSERTED.TableID VALUES (@TableName, @SeatingCapacity, @Description)');

      res.status(201).json({ 
        status: 'success', 
        data: { id: insert.recordset[0].TableID } 
      });
    } catch (err) {
      if (err.message.includes('UNIQUE') || err.message.includes('duplicate')) {
        return res.status(409).json({ 
          status: 'fail', 
          message: 'Table name already exists' 
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
          message: 'Invalid table ID' 
        });
      }

      const { tableName, seatingCapacity, description } = req.body;

      // Validate input
      const validation = validators.validateTable({ tableName, seatingCapacity });
      if (!validation.isValid) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Validation failed',
          errors: validation.errors 
        });
      }

      const update = await pool.request()
        .input('TableID', sql.Int, id)
        .input('TableName', sql.VarChar(50), tableName.trim())
        .input('SeatingCapacity', sql.Int, seatingCapacity)
        .input('Description', sql.NVarChar(255), description?.trim() || null)
        .query('UPDATE Tables SET TableName=@TableName, SeatingCapacity=@SeatingCapacity, Description=@Description WHERE TableID=@TableID');

      if (update.rowsAffected[0] === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Table not found' 
        });
      }
      
      res.status(200).json({ 
        status: 'success', 
        message: 'Table updated successfully' 
      });
    } catch (err) {
      if (err.message.includes('UNIQUE') || err.message.includes('duplicate')) {
        return res.status(409).json({ 
          status: 'fail', 
          message: 'Table name already exists' 
        });
      }
      next(err);
    }
  },
  remove: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid table ID' 
        });
      }

      const del = await pool.request()
        .input('TableID', sql.Int, id)
        .query('DELETE FROM Tables WHERE TableID=@TableID');
      
      if (del.rowsAffected[0] === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'Table not found' 
        });
      }
      
      res.status(200).json({ 
        status: 'success', 
        message: 'Table deleted successfully' 
      });
    } catch (err) {
      // Check for foreign key constraint
      if (err.message.includes('REFERENCE constraint')) {
        return res.status(409).json({ 
          status: 'fail', 
          message: 'Cannot delete table: table has related orders' 
        });
      }
      next(err);
    }
  }
};
