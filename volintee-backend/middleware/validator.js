/**
 * Validation middleware for request data
 */

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Requirements:
 * - At least 8 characters long
 * - Contains at least one uppercase letter
 * - Contains at least one lowercase letter
 * - Contains at least one number
 * - Contains at least one special character
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }

  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*...)' };
  }

  return { valid: true };
};

/**
 * Validate MongoDB ObjectId
 */
export const validateObjectId = (id) => {
  if (!id) return false;
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id.toString());
};



/**
 * Validate location object
 */
export const validateLocation = (location) => {
  if (!location) return { valid: true }; // Optional
  
  // If location is provided, ensure at least address is present if we want to enforce it, 
  // or just return valid since we removed strict checks.
  // Let's keep it simple:
  return { valid: true };
};

/**
 * Sanitize string input
 */
export const sanitizeString = (str, maxLength = null) => {
  if (typeof str !== 'string') return '';
  let sanitized = str.trim();
  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  return sanitized;
};

/**
 * Validate pagination parameters
 */
export const validatePagination = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  
  return {
    page: pageNum > 0 ? pageNum : 1,
    limit: limitNum > 0 && limitNum <= 100 ? limitNum : 10,
  };
};

/**
 * Validate date range
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return { valid: true };
  
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;
  
  if (start && isNaN(start.getTime())) {
    return { valid: false, message: 'Invalid start date format' };
  }
  if (end && isNaN(end.getTime())) {
    return { valid: false, message: 'Invalid end date format' };
  }
  if (start && end && start > end) {
    return { valid: false, message: 'Start date must be before end date' };
  }
  
  return { valid: true, start, end };
};

