const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true
  },
  project: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

TransactionSchema.index({ user: 1, createdAt: -1 });

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;