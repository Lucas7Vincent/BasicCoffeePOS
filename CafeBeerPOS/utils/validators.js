module.exports = {
  validateUser: (data) => {
    const { username, password, fullName, role } = data;
    const errors = [];
    
    if (!username || typeof username !== 'string' || username.trim() === '') {
      errors.push('username is required and must be a non-empty string');
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      errors.push('password is required and must be at least 6 characters');
    }
    if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
      errors.push('fullName is required and must be a non-empty string');
    }
    if (!role || !['Staff', 'Cashier', 'Manager'].includes(role)) {
      errors.push('role is required and must be Staff, Cashier or Manager');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
   validateProduct: (data) => {
    const { name, categoryId, price, imageUrl } = data;
    const errors = [];
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      errors.push('name is required and must be a non-empty string');
    }
    if (categoryId == null || !Number.isInteger(Number(categoryId)) || Number(categoryId) <= 0) {
      errors.push('categoryId is required and must be a positive integer');
    }
    if (price == null || isNaN(Number(price)) || Number(price) < 0) {
      errors.push('price is required and must be a non-negative number');
    }
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim() !== '' && !module.exports.isValidUrl(imageUrl)) {
      errors.push('imageUrl must be a valid URL');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  isValidUrl: (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  },
  
  validateCategory: (data) => {
    const { name } = data;
    const errors = [];
    
    if (!name || typeof name !== 'string' || name.trim() === '') {
      errors.push('name is required and must be a non-empty string');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  validateTable: (data) => {
    const { tableName, seatingCapacity } = data;
    const errors = [];
    
    if (!tableName || typeof tableName !== 'string' || tableName.trim() === '') {
      errors.push('tableName is required and must be a non-empty string');
    }
    if (!seatingCapacity || !Number.isInteger(Number(seatingCapacity)) || Number(seatingCapacity) <= 0) {
      errors.push('seatingCapacity is required and must be a positive integer');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  isValidOrderStatus: (status) => {
    return ['Ordering', 'Paid', 'Cancelled'].includes(status);
  }
};
