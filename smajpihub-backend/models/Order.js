const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerWallet: {
    type: String,
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
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
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  amountPi: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  requirements: {
    type: Map,
    of: String
  },
  message: {
    type: String,
    default: ''
  },
  timeline: [{
    status: String,
    note: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  completedAt: {
    type: Date,
    default: null
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

// Indexes
orderSchema.index({ orderId: 1 });
orderSchema.index({ buyer: 1 });
orderSchema.index({ vendor: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order ID before saving
orderSchema.pre('save', async function(next) {
  if (!this.orderId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    this.orderId = `ORD-${timestamp}-${random}`.toUpperCase();
  }
  
  // Add initial timeline entry
  if (this.isNew && this.timeline.length === 0) {
    this.timeline.push({
      status: 'pending',
      note: 'Order created'
    });
  }
  
  this.updatedAt = Date.now();
  next();
});

// Virtual for order ID
orderSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

// Ensure virtuals are included in JSON
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);
