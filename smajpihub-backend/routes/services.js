const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { auth, requireRole, optionalAuth } = require('../middleware/auth');

/**
 * GET /api/services
 * Get all active services
 * Public - no auth required
 */
router.get('/', optionalAuth, serviceController.getServices);

/**
 * GET /api/services/categories
 * Get all service categories
 * Public - no auth required
 */
router.get('/categories', serviceController.getCategories);

/**
 * GET /api/services/my
 * Get vendor's own services
 * Protected - requires JWT and vendor role
 */
router.get('/my', auth, requireRole('vendor', 'admin'), serviceController.getMyServices);

/**
 * GET /api/services/:id
 * Get service details by ID
 * Public - no auth required
 */
router.get('/:id', optionalAuth, serviceController.getServiceById);

/**
 * POST /api/services
 * Create a new service
 * Protected - requires JWT and vendor role
 */
router.post('/', auth, requireRole('vendor', 'admin'), serviceController.createService);

/**
 * PUT /api/services/:id
 * Update a service
 * Protected - requires JWT and ownership
 */
router.put('/:id', auth, serviceController.updateService);

/**
 * DELETE /api/services/:id
 * Delete a service
 * Protected - requires JWT and ownership
 */
router.delete('/:id', auth, serviceController.deleteService);

module.exports = router;
