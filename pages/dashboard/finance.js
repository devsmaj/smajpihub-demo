const express = require('express');
const router = express.Router();
const { getSummary, getTransactions, downloadReport } = require('../controllers/financeController');
const { auth } = require('../middleware/auth');

// @route   GET /api/finance/summary
// @desc    Get financial summary
router.get('/summary', auth, getSummary);

// @route   GET /api/finance/transactions
// @desc    Get list of transactions
router.get('/transactions', auth, getTransactions);

// @route   GET /api/finance/report
// @desc    Download transaction report
router.get('/report', auth, downloadReport);

module.exports = router;