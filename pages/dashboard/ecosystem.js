const express = require('express');
const router = express.Router();
const { getProjects } = require('../controllers/ecosystemController');
const { auth } = require('../middleware/auth');

// @route   GET /api/ecosystem/projects
// @desc    Get all ecosystem projects and their status
router.get('/projects', auth, getProjects);

module.exports = router;