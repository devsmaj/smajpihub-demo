const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, requireRole } = require('../middleware/auth');

/**
 * POST /api/order
 * Create a new order for a service
 * Protected - requires JWT
 */
router.post('/', auth, orderController.createOrder);

/**
 * GET /api/orders
 * Get user's order history (as buyer or vendor)
 * Protected - requires JWT
 */
router.get('/', auth, orderController.getOrders);

/**
 * GET /api/order/:id
 * Get order details by ID
 * Protected - requires JWT
 */
router.get('/:id', auth, orderController.getOrderById);

/**
 * PUT /api/order/:id/status
 * Update order status
 * Protected - requires JWT and vendor role
 */
router.put('/:id/status', auth, requireRole('vendor', 'admin'), orderController.updateOrderStatus);

/**
 * PUT /api/order/:id/payment
 * Update payment status
 * Protected - requires JWT and admin role
 */
router.put('/:id/payment', auth, requireRole('admin'), orderController.updatePaymentStatus);

/**
 * POST /api/order/:id/message
 * Add a message to the order
 * Protected - requires JWT
 */
router.post('/:id/message', auth, orderController.addOrderMessage);

module.exports = router;
