const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  project: { type: String, required: true }, // e.g., 'store', 'jobs', 'wallet'
  title: { type: String, required: true },
  message: { type: String, required: true },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

NotificationSchema.index({ user: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;