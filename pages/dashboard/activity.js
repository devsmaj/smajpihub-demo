const express = require('express');
const router = express.Router();
const { getLoginHistory } = require('../controllers/activityController');
const { auth } = require('../middleware/auth');

// @route   GET /api/activity/history
// @desc    Get user login history
router.get('/history', auth, getLoginHistory);

module.exports = router;