const Transaction = require('../models/Transaction');
const { asyncHandler } = require('../middleware/errorHandler');
const { Parser } = require('json2csv');

/**
 * GET /api/finance/summary
 * Get financial summary (balance, etc.)
 */
const getSummary = asyncHandler(async (req, res) => {
  // Mock balance for now
  const piBalance = 3250.90;
  const gcvEquivalent = 10402.88;

  res.status(200).json({
    success: true,
    piBalance,
    gcvEquivalent,
  });
});

/**
 * GET /api/finance/transactions
 * Get list of transactions with filtering
 */
const getTransactions = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const query = { user: req.user._id };

  if (type && ['income', 'expense'].includes(type)) {
    query.type = type;
  }

  const transactions = await Transaction.find(query).sort({ createdAt: -1 }).limit(50);
  res.status(200).json({ success: true, transactions });
});

/**
 * GET /api/finance/report
 * Download a CSV report of transactions
 */
const downloadReport = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();

  if (transactions.length === 0) {
    return res.status(404).json({ success: false, message: 'No transactions to report.' });
  }

  const fields = ['createdAt', 'type', 'project', 'amount', 'status'];
  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(transactions);

  res.header('Content-Type', 'text/csv');
  res.attachment(`smaj-pi-hub-report-${Date.now()}.csv`);
  res.send(csv);
});


module.exports = {
  getSummary,
  getTransactions,
  downloadReport,
};