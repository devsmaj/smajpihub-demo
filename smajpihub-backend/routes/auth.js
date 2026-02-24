const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { auth } = require('../middleware/auth');

/**
 * POST /api/connect-wallet
 * Connect Pi wallet and create session
 * Public endpoint - no auth required
 */
router.post('/connect-wallet', walletController.connectWallet);

/**
 * GET /api/user
 * Get current user info
 * Protected - requires JWT
 */
router.get('/user', auth, walletController.getUser);

/**
 * POST /api/logout
 * Logout user
 * Protected - requires JWT
 */
router.post('/logout', auth, walletController.logout);

/**
 * PUT /api/user/profile
 * Update user profile
 * Protected - requires JWT
 */
router.put('/user/profile', auth, walletController.updateProfile);

/**
 * PUT /api/user/role
 * Update user role
 * Protected - requires JWT
 */
router.put('/user/role', auth, walletController.updateRole);

/**
 * GET /api/sso-token
 * Generate SSO token for SMAJ STORE
 * Protected - requires JWT
 */
router.get('/sso-token', auth, walletController.getSSOToken);

module.exports = router;
