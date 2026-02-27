const mongoose = require('mongoose');

const LoginActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ip: { type: String },
  userAgent: { type: String },
  location: { type: String, default: 'Unknown' }, // e.g., "San Francisco, US"
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const LoginActivity = mongoose.model('LoginActivity', LoginActivitySchema);

module.exports = LoginActivity;