const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['send', 'receive'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  counterparty: {
    type: String,
    trim: true,
    default: ''
  },
  note: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  externalId: {
    type: String,
    trim: true,
    default: ''
  },
  response: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

transactionSchema.index({ user: 1 });
transactionSchema.index({ walletAddress: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
