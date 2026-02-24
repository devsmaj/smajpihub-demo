const Order = require('../models/Order');
const Service = require('../models/Service');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * POST /api/order
 * Create a new order for a service
 */
const createOrder = asyncHandler(async (req, res) => {
  const user = req.user;
  const { serviceId, requirements, message } = req.body;

  // Validate required fields
  if (!serviceId) {
    return res.status(400).json({
      success: false,
      message: 'Service ID is required.'
    });
  }

  // Find the service
  const service = await Service.findById(serviceId);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found.'
    });
  }

  if (service.status !== 'active') {
    return res.status(400).json({
      success: false,
      message: 'Service is not available for ordering.'
    });
  }

  // Prevent ordering own service
  if (service.vendorWallet.toLowerCase() === user.walletAddress.toLowerCase()) {
    return res.status(400).json({
      success: false,
      message: 'You cannot order your own service.'
    });
  }

  // Validate requirements if service requires them
  if (service.requirements && service.requirements.length > 0) {
    if (!requirements || Object.keys(requirements).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide required information.'
      });
    }
  }

  // Create order
  const order = await Order.create({
    buyer: user._id,
    buyerWallet: user.walletAddress,
    service: service._id,
    vendor: service.vendor,
    vendorWallet: service.vendorWallet,
    amount: service.price,
    amountPi: service.pricePi,
    requirements: requirements || {},
    message: message || '',
    status: 'pending',
    paymentStatus: 'unpaid'
  });

  // Populate order with service and vendor details
  await order.populate([
    { path: 'service', select: 'name description images price pricePi' },
    { path: 'vendor', select: 'walletAddress username profile' }
  ]);

  // Update service order count
  service.orderCount += 1;
  await service.save();

  res.status(201).json({
    success: true,
    message: 'Order created successfully.',
    data: order
  });
});

/**
 * GET /api/orders
 * Get user's order history (as buyer or vendor)
 */
const getOrders = asyncHandler(async (req, res) => {
  const user = req.user;
  const { role, status, page = 1, limit = 20 } = req.query;

  // Build query based on user's role
  let query = {};

  // If user is vendor, show orders where they're the vendor
  // If user is buyer, show orders where they're the buyer
  if (role === 'vendor' && (user.role === 'vendor' || user.role === 'admin')) {
    query.vendor = user._id;
  } else {
    query.buyer = user._id;
  }

  // Filter by status if provided
  if (status) {
    query.status = status;
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('service', 'name description images price pricePi')
      .populate('vendor', 'walletAddress username profile')
      .populate('buyer', 'walletAddress username profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Order.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

/**
 * GET /api/order/:id
 * Get order details by ID
 */
const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const order = await Order.findById(id)
    .populate('service', 'name description images price pricePi requirements')
    .populate('vendor', 'walletAddress username profile')
    .populate('buyer', 'walletAddress username profile');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found.'
    });
  }

  // Check if user is authorized to view this order
  const isBuyer = order.buyer._id.toString() === user._id.toString();
  const isVendor = order.vendor._id.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isBuyer && !isVendor && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to view this order.'
    });
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

/**
 * PUT /api/order/:id/status
 * Update order status (vendor or admin only)
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const user = req.user;

  // Validate status
  const validStatuses = ['pending', 'confirmed', 'processing', 'completed', 'cancelled', 'refunded'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status.'
    });
  }

  const order = await Order.findById(id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found.'
    });
  }

  // Check authorization
  const isVendor = order.vendor.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';

  if (!isVendor && !isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Only the vendor or admin can update order status.'
    });
  }

  // Update order status
  order.status = status;

  // Add timeline entry
  order.timeline.push({
    status,
    note: note || `Order ${status}`
  });

  // Set completedAt if status is completed
  if (status === 'completed') {
    order.completedAt = new Date();
  }

  await order.save();

  await order.populate([
    { path: 'service', select: 'name description images price pricePi' },
    { path: 'vendor', select: 'walletAddress username profile' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully.',
    data: order
  });
});

/**
 * PUT /api/order/:id/payment
 * Update payment status (admin only)
 */
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paymentStatus } = req.body;
  const user = req.user;

  // Validate payment status
  const validStatuses = ['unpaid', 'paid', 'refunded'];
  if (!paymentStatus || !validStatuses.includes(paymentStatus)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment status.'
    });
  }

  const order = await Order.findById(id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found.'
    });
  }

  // Only admin can update payment status
  if (user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only admin can update payment status.'
    });
  }

  order.paymentStatus = paymentStatus;
  order.timeline.push({
    status: order.status,
    note: `Payment ${paymentStatus}`
  });

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Payment status updated successfully.',
    data: order
  });
});

/**
 * POST /api/order/:id/message
 * Add a message to the order
 */
const addOrderMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const user = req.user;

  if (!message) {
    return res.status(400).json({
      success: false,
      message: 'Message is required.'
    });
  }

  const order = await Order.findById(id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found.'
    });
  }

  // Check authorization
  const isBuyer = order.buyer.toString() === user._id.toString();
  const isVendor = order.vendor.toString() === user._id.toString();

  if (!isBuyer && !isVendor && user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to add messages to this order.'
    });
  }

  // Add message to order (you might want a separate messages collection)
  order.message = message;
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Message added successfully.',
    data: order
  });
});

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  addOrderMessage
};
