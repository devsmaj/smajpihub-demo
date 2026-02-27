const LoginActivity = require('../models/LoginActivity');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/activity/history
 * Get user's login history
 */
const getLoginHistory = asyncHandler(async (req, res) => {
  const activities = await LoginActivity.find({ user: req.user._id })
    .sort({ timestamp: -1 })
    .limit(10);

  res.status(200).json({ success: true, activities });
});

module.exports = {
  getLoginHistory,
};