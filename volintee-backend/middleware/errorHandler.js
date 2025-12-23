/**
 * Error handling middleware
 * Handles different types of errors and returns appropriate responses
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    // In production, don't expose sensitive field values (like emails)
    const isProduction = process.env.NODE_ENV === 'production';
    const sensitiveFields = ['email', 'password', 'phone'];
    
    if (isProduction && sensitiveFields.includes(field.toLowerCase())) {
      const message = `A resource with this ${field} already exists`;
      error = { message, statusCode: 400 };
    } else {
      const value = err.keyValue?.[field] || 'value';
      const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;
      error = { message, statusCode: 400 };
    }
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map((val) => val.message);
    const message = messages.length > 0 ? messages.join(', ') : 'Validation error';
    error = { message, statusCode: 400 };
  }

  // MongoDB geo error
  if (err.code === 16755 || err.message?.includes('geo keys')) {
    const message = 'Invalid location data. Please provide valid coordinates.';
    error = { message, statusCode: 400 };
  }

  // MongoDB query execution error (e.g., missing index)
  if (err.code === 291 || err.codeName === 'NoQueryExecutionPlans') {
    const message = 'Query execution error. Please try again or contact support.';
    error = { message, statusCode: 500 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;

