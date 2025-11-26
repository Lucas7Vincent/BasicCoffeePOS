const jwt = require('jsonwebtoken');
const secretKey = 'DucKy_key';

module.exports = {
  generateToken: (user) => {
    const payload = {
      userId: user.UserID,
      username: user.Username,
      role: user.Role,
      fullName: user.FullName
    };
    
    return jwt.sign(payload, secretKey, { 
      expiresIn: '24h' 
    });
  },

  verifyToken: (token) => {
    return jwt.verify(token, secretKey);
  }
};