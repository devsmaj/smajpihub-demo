const jwt = require('jsonwebtoken');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

/**
 * Middleware to verify JWT token and attach user to request
 */
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Check token type
    if (decoded.type !== 'session') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type. Session token required.'
      });
    }

    // Find user by wallet address
    const user = await User.findOne({ 
      walletAddress: decoded.wallet_address.toLowerCase() 
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please reconnect your wallet.'
      });
    }

    // Attach user to request
    req.user = user;
    req.token = token;
    req.decoded = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please reconnect your wallet.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please reconnect your wallet.'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

/**
 * Middleware to verify SSO token (for SMAJ STORE integration)
 */
const verifySSO = async (req, res, next) => {
  try {
    const token = req.query.token || req.headers['x-sso-token'];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'SSO token required.'
      });
    }

    const decoded = verifyToken(token);
    
    if (decoded.type !== 'sso') {
      return res.status(401).json({
        success: false,
        message: 'Invalid SSO token.'
      });
    }

    // Find or create user based on SSO
    let user = await User.findOne({ 
      walletAddress: decoded.wallet_address.toLowerCase() 
    });

    if (!user) {
      // Create new user from SSO data
      user = await User.create({
        walletAddress: decoded.wallet_address.toLowerCase(),
        role: decoded.role || 'buyer'
      });
    }

    req.user = user;
    req.token = token;
    req.decoded = decoded;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'SSO token expired.'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid SSO token.'
    });
  }
};

/**
 * Middleware to check if user has specific role
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }

    next();
  };
};

/**
 * Optional auth - doesn't fail if no token, but attaches user if valid
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    const user = await User.findOne({ 
      walletAddress: decoded.wallet_address.toLowerCase() 
    });

    if (user) {
      req.user = user;
      req.token = token;
    }
    
    next();
  } catch (error) {
    // Silently continue without auth
    next();
  }
};

module.exports = {
  auth,
  verifySSO,
  requireRole,
  optionalAuth
};
