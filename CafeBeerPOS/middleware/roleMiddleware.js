const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Kiểm tra user đã được authenticate chưa
      if (!req.user) {
        return res.status(401).json({
          status: 'fail',
          message: 'Authentication required'
        });
      }

      // Kiểm tra role của user
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          status: 'fail',
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({
        status: 'error',
        message: 'Authorization error'
      });
    }
  };
};

module.exports = {
  requireManager: roleMiddleware(['Manager']),
  requireCashierOrManager: roleMiddleware(['Cashier', 'Manager']),
  requireAnyRole: roleMiddleware(['Staff', 'Cashier', 'Manager']),
  roleMiddleware // Export function để tạo custom role requirements
};