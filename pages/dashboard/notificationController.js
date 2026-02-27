const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/notifications
 * Get user notifications
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { project } = req.query;
  const query = { user: req.user._id };

  if (project && project !== 'all') {
    query.project = project;
  }

  const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(20);
  res.status(200).json({ success: true, notifications });
});

/**
 * PUT /api/notifications/:id/read
 * Mark a notification as read
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' });
  res.status(200).json({ success: true, notification });
});

module.exports = { getNotifications, markAsRead };