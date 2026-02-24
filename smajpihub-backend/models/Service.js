const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['digital', 'physical', 'subscription', 'service', 'other'],
    default: 'service'
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  pricePi: {
    type: Number,
    required: true,
    min: 0
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendorWallet: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  features: [{
    type: String
  }],
  requirements: [{
    type: String
  }],
  deliveryTime: {
    type: Number, // in days
    default: 7
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending', 'rejected'],
    default: 'active'
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  orderCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
serviceSchema.index({ status: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ vendor: 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ name: 'text', description: 'text' });

// Virtual for service ID
serviceSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtuals are included in JSON
serviceSchema.set('toJSON', { virtuals: true });
serviceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Service', serviceSchema);
