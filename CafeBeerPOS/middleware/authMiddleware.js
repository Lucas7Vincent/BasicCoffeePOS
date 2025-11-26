const jwt = require('jsonwebtoken');
const jwtUtils = require('../utils/jwtUtils');
const secretKey = 'DucKy_key'; 

// Main authentication middleware
const authMiddleware = (req, res, next) => {
  console.log('Auth Headers:', req.headers['authorization']); // Debug log
  
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    console.log('No authorization header provided'); // Debug log
    return res.status(401).json({ 
      status: 'fail', 
      message: 'No token provided' 
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('Invalid token format:', authHeader); // Debug log
    return res.status(401).json({ 
      status: 'fail', 
      message: 'Invalid token format' 
    });
  }

  try {
    const payload = jwt.verify(token, secretKey);
    console.log('JWT Payload:', payload); // Debug log
    
    // Kiểm tra role hợp lệ
    if (!['Staff', 'Cashier', 'Manager'].includes(payload.role)) {
      console.log('Invalid role:', payload.role); // Debug log
      return res.status(403).json({ 
        status: 'fail', 
        message: 'Invalid user role' 
      });
    }

    // Set user info vào req để các middleware khác sử dụng
    req.user = {
      id: payload.userId || payload.UserID,
      username: payload.username || payload.Username,
      role: payload.role || payload.Role,
      fullName: payload.fullName || payload.FullName
    };
    
    next();
  } catch (err) {
    console.log('JWT verification failed:', err.message); // Debug log
    return res.status(401).json({ 
      status: 'fail', 
      message: 'Invalid or expired token' 
    });
  }
};

module.exports = authMiddleware;