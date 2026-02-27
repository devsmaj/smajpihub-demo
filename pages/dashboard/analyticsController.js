const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/analytics/summary
 * Get data for dashboard charts
 */
const getSummary = asyncHandler(async (req, res) => {
  // This is a mock implementation. In a real app, you'd run
  // more complex aggregation queries on your database.

  const totalTransactions = await Transaction.countDocuments({ user: req.user._id });
  const totalEarnings = await Transaction.aggregate([
    { $match: { user: req.user._id, type: 'income', status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // Mock data for charts
  const monthlyActivity = [35, 52, 44, 75, 61, 88, 78];
  const ecosystemUsage = {
    store: 40,
    jobs: 30,
    services: 20,
    other: 10
  };

  res.status(200).json({
    success: true,
    totalTransactions,
    totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].total : 0,
    monthlyActivity,
    ecosystemUsage,
  });
});

module.exports = {
  getSummary,
};