const { pool, sql } = require('../config/db');
const bcrypt = require('bcrypt');
const jwtUtils = require('../utils/jwtUtils');
const validators = require('../utils/validators');

const saltRounds = 10;

module.exports = {
  login: async (req, res, next) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'username and password are required' 
        });
      }

      // Kiểm tra user tồn tại và chưa bị xóa
      const result = await pool.request()
        .input('Username', sql.VarChar(50), username)
        .query('SELECT * FROM Users WHERE Username = @Username AND ISNULL(Available, 1) = 1');

      if (result.recordset.length === 0) {
        return res.status(401).json({ 
          status: 'fail', 
          message: 'Invalid username or password' 
        });
      }

      const user = result.recordset[0];
      const match = await bcrypt.compare(password, user.PasswordHash);
      
      if (!match) {
        return res.status(401).json({ 
          status: 'fail', 
          message: 'Invalid username or password' 
        });
      }

      const token = jwtUtils.generateToken(user);
      
      // Trả về user info với mapping fields
      const userResponse = {
        id: user.UserID,
        username: user.Username,
        fullName: user.FullName,
        role: user.Role,
        createdAt: user.CreatedAt
      };
      
      res.status(200).json({ 
        status: 'success', 
        data: { 
          token, 
          user: userResponse 
        } 
      });

    } catch (err) {
      next(err);
    }
  },

  // Chỉ Manager mới được xem danh sách users
  getAll: async (req, res, next) => {
    try {
      // Lấy tất cả users chưa bị xóa
      const result = await pool.request()
        .query(`SELECT UserID as id, Username as username, FullName as fullName, 
                Role as role, CreatedAt as createdAt, ISNULL(Available, 1) as isAvailable 
                FROM Users 
                WHERE ISNULL(Available, 1) = 1 
                ORDER BY CreatedAt DESC`);
      
      res.status(200).json({ 
        status: 'success', 
        data: result.recordset 
      });
    } catch (err) {
      next(err);
    }
  },

  // Chỉ Manager mới được xem chi tiết user
  getById: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid user ID' 
        });
      }

      const result = await pool.request()
        .input('UserID', sql.Int, id)
        .query(`SELECT UserID as id, Username as username, FullName as fullName, 
                Role as role, CreatedAt as createdAt, ISNULL(Available, 1) as isAvailable 
                FROM Users 
                WHERE UserID = @UserID AND ISNULL(Available, 1) = 1`);
      
      if (result.recordset.length === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'User not found' 
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

  // Chỉ Manager mới được tạo user
  create: async (req, res, next) => {
    try {
      const { username, password, fullName, role } = req.body;

      // Validate input
      const validation = validators.validateUser({ username, password, fullName, role });
      if (!validation.isValid) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Validation failed',
          errors: validation.errors 
        });
      }

      // Kiểm tra username đã tồn tại (kể cả đã xóa)
      const existing = await pool.request()
        .input('Username', sql.VarChar(50), username.trim())
        .query('SELECT UserID, ISNULL(Available, 1) as Available FROM Users WHERE Username = @Username');

      if (existing.recordset.length > 0) {
        if (existing.recordset[0].Available === 1) {
          return res.status(409).json({ 
            status: 'fail', 
            message: 'Username already exists' 
          });
        } else {
          // Nếu user đã tồn tại nhưng bị xóa, không cho phép tạo lại với cùng username
          return res.status(409).json({ 
            status: 'fail', 
            message: 'Username already exists (previously deleted). Please use a different username.' 
          });
        }
      }

      // Hash password
      const hash = await bcrypt.hash(password, saltRounds);

      const insert = await pool.request()
        .input('Username', sql.VarChar(50), username.trim())
        .input('PasswordHash', sql.VarChar(256), hash)
        .input('FullName', sql.NVarChar(100), fullName.trim())
        .input('Role', sql.VarChar(20), role)
        .input('Available', sql.Bit, 1)
        .query(`INSERT INTO Users (Username, PasswordHash, FullName, Role, Available) 
                OUTPUT INSERTED.UserID 
                VALUES (@Username, @PasswordHash, @FullName, @Role, @Available)`);

      res.status(201).json({ 
        status: 'success', 
        data: { id: insert.recordset[0].UserID },
        message: 'User created successfully'
      });
    } catch (err) {
      next(err);
    }
  },

  // Chỉ Manager mới được update user
  update: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid user ID' 
        });
      }

      const { password, fullName, role, isAvailable } = req.body;

      // Validate role if provided
      if (role && !['Staff', 'Cashier', 'Manager'].includes(role)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'role must be Staff, Cashier or Manager' 
        });
      }

      // Ngăn Manager xóa chính mình
      if (req.user.id === id && isAvailable === false) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Cannot deactivate your own account' 
        });
      }

      // Ngăn Manager hạ cấp chính mình
      if (req.user.id === id && role && role !== 'Manager') {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Cannot change your own role' 
        });
      }

      // Check if user exists and available
      const userResult = await pool.request()
        .input('UserID', sql.Int, id)
        .query('SELECT * FROM Users WHERE UserID = @UserID AND ISNULL(Available, 1) = 1');
      
      if (userResult.recordset.length === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'User not found' 
        });
      }

      const user = userResult.recordset[0];
      let hash = user.PasswordHash;

      // Hash new password if provided
      if (password) {
        if (password.length < 6) {
          return res.status(400).json({ 
            status: 'fail', 
            message: 'password must be at least 6 characters' 
          });
        }
        hash = await bcrypt.hash(password, saltRounds);
      }

      const update = await pool.request()
        .input('UserID', sql.Int, id)
        .input('PasswordHash', sql.VarChar(256), hash)
        .input('FullName', sql.NVarChar(100), fullName?.trim() || user.FullName)
        .input('Role', sql.VarChar(20), role || user.Role)
        .input('Available', sql.Bit, isAvailable !== undefined ? isAvailable : 1)
        .query(`UPDATE Users SET PasswordHash=@PasswordHash, FullName=@FullName, 
                Role=@Role, Available=@Available WHERE UserID=@UserID`);

      res.status(200).json({ 
        status: 'success', 
        message: 'User updated successfully' 
      });
    } catch (err) {
      next(err);
    }
  },

  // Chỉ Manager mới được soft delete user
  remove: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid user ID' 
        });
      }

      // Ngăn Manager xóa chính mình
      if (req.user.id === id) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Cannot delete your own account' 
        });
      }

      // Soft delete: set Available = 0
      const update = await pool.request()
        .input('UserID', sql.Int, id)
        .query('UPDATE Users SET Available = 0 WHERE UserID = @UserID AND ISNULL(Available, 1) = 1');
      
      if (update.rowsAffected[0] === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'User not found or already deleted' 
        });
      }
      
      res.status(200).json({ 
        status: 'success', 
        message: 'User deleted successfully' 
      });
    } catch (err) {
      next(err);
    }
  },

  // Restore user đã xóa
  restore: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Invalid user ID' 
        });
      }

      const update = await pool.request()
        .input('UserID', sql.Int, id)
        .query('UPDATE Users SET Available = 1 WHERE UserID = @UserID AND Available = 0');
      
      if (update.rowsAffected[0] === 0) {
        return res.status(404).json({ 
          status: 'fail', 
          message: 'User not found or not deleted' 
        });
      }
      
      res.status(200).json({ 
        status: 'success', 
        message: 'User restored successfully' 
      });
    } catch (err) {
      next(err);
    }
  },

  // Xem users đã xóa
  getDeleted: async (req, res, next) => {
    try {
      const result = await pool.request()
        .query(`SELECT UserID as id, Username as username, FullName as fullName, 
                Role as role, CreatedAt as createdAt, Available as isAvailable 
                FROM Users 
                WHERE Available = 0 
                ORDER BY CreatedAt DESC`);
      
      res.status(200).json({ 
        status: 'success', 
        data: result.recordset 
      });
    } catch (err) {
      next(err);
    }
  },

  // Verify JWT token
  verifyToken: async (req, res, next) => {
    try {
      // Token đã được verify trong authMiddleware
      // req.user đã chứa thông tin user từ token
      res.status(200).json({
        status: 'success',
        message: 'Token is valid',
        data: {
          user: {
            id: req.user.id,
            username: req.user.username,
            fullName: req.user.fullName,
            role: req.user.role,
            verifiedAt: new Date().toISOString()
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }
};