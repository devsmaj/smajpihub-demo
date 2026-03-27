const express = require('express');
const { auth } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.get('/dashboard/sso-token', auth, dashboardController.createDashboardSSOToken);

module.exports = router;
