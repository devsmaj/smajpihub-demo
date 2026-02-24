const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    trim: true,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ['buyer', 'vendor', 'admin'],
    default: 'buyer'
  },
  profile: {
    fullName: String,
    avatar: String,
    bio: String
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
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

// Index for faster queries
userSchema.index({ walletAddress: 1 });
userSchema.index({ email: 1 });

// Compare wallet addresses
userSchema.methods.compareWalletAddress = function(walletAddress) {
  return this.walletAddress.toLowerCase() === walletAddress.toLowerCase();
};

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
