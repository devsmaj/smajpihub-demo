const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const config = require('../config');

// Paths to key files
const keysDir = path.join(__dirname, '..', 'keys');
const privateKeyPath = path.join(keysDir, 'private.pem');
const publicKeyPath = path.join(keysDir, 'public.pem');

// Load keys or generate temporary keys for development
let privateKey = null;
let publicKey = null;

function loadKeys() {
  try {
    if (fs.existsSync(privateKeyPath)) {
      privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    }
    if (fs.existsSync(publicKeyPath)) {
      publicKey = fs.readFileSync(publicKeyPath, 'utf8');
    }
    
    // If keys don't exist, generate temporary keys for development
    if (!privateKey || !publicKey) {
      console.log('Generating temporary keys for development...');
      const { publicKey: pubKey, privateKey: privKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });
      privateKey = privKey;
      publicKey = pubKey;
    }
  } catch (error) {
    console.error('Error loading keys:', error.message);
    // Generate temporary keys
    const { publicKey: pubKey, privateKey: privKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    privateKey = privKey;
    publicKey = pubKey;
  }
}

// Initialize keys
loadKeys();

/**
 * Sign a JWT token with RS256
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Expiration time (default: 1h)
 * @returns {string} Signed JWT token
 */
function signToken(payload, expiresIn = config.jwtExpiresIn) {
  if (!privateKey) {
    throw new Error('Private key not available');
  }
  
  return jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: expiresIn
  });
}

/**
 * Verify a JWT token with RS256
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
function verifyToken(token) {
  if (!publicKey) {
    throw new Error('Public key not available');
  }
  
  return jwt.verify(token, publicKey, {
    algorithms: ['RS256']
  });
}

/**
 * Generate a session token for wallet connection
 * @param {Object} user - User object with walletAddress and role
 * @returns {Object} Token and expiration info
 */
function generateSessionToken(user) {
  const payload = {
    wallet_address: user.walletAddress,
    role: user.role || 'buyer',
    type: 'session'
  };
  
  const token = signToken(payload);
  const decoded = jwt.decode(token);
  
  return {
    token,
    expiresAt: decoded.exp * 1000, // Convert to milliseconds
    expiresIn: config.jwtExpiresIn
  };
}

/**
 * Generate an SSO token for SMAJ STORE
 * @param {Object} user - User object with walletAddress and role
 * @returns {Object} Token and expiration info
 */
function generateSSOToken(user) {
  const payload = {
    wallet_address: user.walletAddress,
    role: user.role || 'buyer',
    type: 'sso',
    service: 'smajstore'
  };
  
  const token = signToken(payload);
  const decoded = jwt.decode(token);
  
  return {
    token,
    expiresAt: decoded.exp * 1000,
    expiresIn: config.jwtExpiresIn
  };
}

/**
 * Generate dashboard SSO token
 * @param {Object} user
 */
function generateDashboardSSOToken(user) {
  const payload = {
    wallet_address: user.walletAddress,
    role: user.role || 'buyer',
    type: 'sso',
    service: 'smajdashboard'
  };

  const token = signToken(payload);
  const decoded = jwt.decode(token);

  return {
    token,
    expiresAt: decoded.exp * 1000,
    expiresIn: config.jwtExpiresIn
  };
}

/**
 * Get the public key (for sharing with SMAJ STORE)
 * @returns {string} Public key in PEM format
 */
function getPublicKey() {
  return publicKey;
}

module.exports = {
  signToken,
  verifyToken,
  generateSessionToken,
  generateSSOToken,
  generateDashboardSSOToken,
  getPublicKey,
  loadKeys
};
