const config = require('../config');

/**
 * Not Found Handler - 404
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  // Log error in development
  if (config.nodeEnv === 'development') {
    console.error('Error:', err);
  }

  // Default error status
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for ${field}`;
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * API Response Helpers
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

const errorResponse = (res, message = 'Error', statusCode = 500) => {
  res.status(statusCode).json({
    success: false,
    message
  });
};

const validationResponse = (res, errors) => {
  res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors
  });
};

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  successResponse,
  errorResponse,
  validationResponse
};
