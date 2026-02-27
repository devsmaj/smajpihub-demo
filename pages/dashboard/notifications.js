const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead } = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get user notifications
router.get('/', auth, getNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Mark a notification as read
router.put('/:id/read', auth, markAsRead);

module.exports = router;