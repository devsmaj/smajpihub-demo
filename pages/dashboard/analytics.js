const express = require('express');
const router = express.Router();
const { getSummary } = require('../controllers/analyticsController');
const { auth } = require('../middleware/auth');

// @route   GET /api/analytics/summary
// @desc    Get dashboard analytics summary
router.get('/summary', auth, getSummary);

module.exports = router;