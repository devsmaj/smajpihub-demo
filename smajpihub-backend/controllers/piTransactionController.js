const Transaction = require('../models/Transaction');
const { broadcastPiTransaction } = require('../services/piService');
const { asyncHandler } = require('../middleware/errorHandler');

const createTransaction = asyncHandler(async (req, res) => {
  const { type, amount, counterparty, note, piPayload } = req.body;
  const normalizedType = String(type || 'send').toLowerCase() === 'receive' ? 'receive' : 'send';
  const numericAmount = Number(amount);

  if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Amount must be a positive number.'
    });
  }

  if (!counterparty || !String(counterparty).trim()) {
    return res.status(400).json({
      success: false,
      message: 'Counterparty wallet or Pi ID is required.'
    });
  }

  const user = req.user;
  const transaction = await Transaction.create({
    user: user._id,
    walletAddress: user.walletAddress,
    type: normalizedType,
    amount: numericAmount,
    counterparty: counterparty.trim(),
    note: String(note || '').trim(),
    status: 'pending'
  });

  try {
    const result = await broadcastPiTransaction({
      userId: user._id.toString(),
      walletAddress: user.walletAddress,
      type: normalizedType,
      amount: numericAmount,
      counterparty: counterparty.trim(),
      note: String(note || '').trim(),
      piPayload: piPayload || null
    });

    transaction.status = result.status || 'confirmed';
    transaction.externalId = result.data?.transactionId || result.data?.txId || '';
    transaction.response = result;
    await transaction.save();

    res.status(200).json({
      success: true,
      message: result.success ? 'Transaction submitted successfully.' : 'Transaction submission received.',
      transaction
    });
  } catch (error) {
    transaction.status = 'failed';
    transaction.response = {
      message: error.message,
      detail: error.response || null
    };
    await transaction.save();

    res.status(500).json({
      success: false,
      message: 'Failed to broadcast transaction.',
      error: error.message,
      transaction
    });
  }
});

const listTransactions = asyncHandler(async (req, res) => {
  const records = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  res.status(200).json({
    success: true,
    transactions: records
  });
});

const clearTransactions = asyncHandler(async (req, res) => {
  await Transaction.deleteMany({ user: req.user._id });
  res.status(200).json({
    success: true,
    message: 'Transaction history cleared.'
  });
});

module.exports = {
  createTransaction,
  listTransactions,
  clearTransactions
};
