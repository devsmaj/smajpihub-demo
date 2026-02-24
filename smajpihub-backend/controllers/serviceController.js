const Service = require('../models/Service');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/services
 * Get all active services with optional filtering
 */
const getServices = asyncHandler(async (req, res) => {
  const { category, vendor, search, page = 1, limit = 20 } = req.query;

  // Build query
  const query = { status: 'active' };

  if (category) {
    query.category = category;
  }

  if (vendor) {
    query.vendorWallet = vendor.toLowerCase();
  }

  if (search) {
    query.$text = { $search: search };
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Execute query
  const [services, total] = await Promise.all([
    Service.find(query)
      .populate('vendor', 'walletAddress username profile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Service.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    data: services,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

/**
 * GET /api/services/categories
 * Get all service categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Service.distinct('category', { status: 'active' });

  res.status(200).json({
    success: true,
    data: categories
  });
});

/**
 * GET /api/service/:id
 * Get service details by ID
 */
const getServiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const service = await Service.findById(id)
    .populate('vendor', 'walletAddress username profile');

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found.'
    });
  }

  // Increment view count (optional)
  // service.viewCount += 1;
  // await service.save();

  res.status(200).json({
    success: true,
    data: service
  });
});

/**
 * POST /api/service
 * Create a new service (vendor only)
 */
const createService = asyncHandler(async (req, res) => {
  const user = req.user;

  // Check if user is a vendor
  if (user.role !== 'vendor' && user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only vendors can create services.'
    });
  }

  const {
    name,
    description,
    category,
    price,
    pricePi,
    images,
    features,
    requirements,
    deliveryTime
  } = req.body;

  // Validate required fields
  if (!name || !description || !category || price === undefined || pricePi === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields.'
    });
  }

  // Create service
  const service = await Service.create({
    name,
    description,
    category,
    price,
    pricePi,
    vendor: user._id,
    vendorWallet: user.walletAddress,
    images: images || [],
    features: features || [],
    requirements: requirements || [],
    deliveryTime: deliveryTime || 7,
    status: 'active'
  });

  await service.populate('vendor', 'walletAddress username profile');

  res.status(201).json({
    success: true,
    message: 'Service created successfully.',
    data: service
  });
});

/**
 * PUT /api/service/:id
 * Update a service (vendor only)
 */
const updateService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const service = await Service.findById(id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found.'
    });
  }

  // Check ownership
  if (service.vendor.toString() !== user._id.toString() && user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only update your own services.'
    });
  }

  const {
    name,
    description,
    category,
    price,
    pricePi,
    images,
    features,
    requirements,
    deliveryTime,
    status
  } = req.body;

  // Update fields
  if (name) service.name = name;
  if (description) service.description = description;
  if (category) service.category = category;
  if (price !== undefined) service.price = price;
  if (pricePi !== undefined) service.pricePi = pricePi;
  if (images) service.images = images;
  if (features) service.features = features;
  if (requirements) service.requirements = requirements;
  if (deliveryTime) service.deliveryTime = deliveryTime;
  if (status && user.role === 'admin') service.status = status;

  await service.save();
  await service.populate('vendor', 'walletAddress username profile');

  res.status(200).json({
    success: true,
    message: 'Service updated successfully.',
    data: service
  });
});

/**
 * DELETE /api/service/:id
 * Delete a service (vendor only)
 */
const deleteService = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const service = await Service.findById(id);

  if (!service) {
    return res.status(404).json({
      success: false,
      message: 'Service not found.'
    });
  }

  // Check ownership
  if (service.vendor.toString() !== user._id.toString() && user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only delete your own services.'
    });
  }

  await Service.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: 'Service deleted successfully.'
  });
});

/**
 * GET /api/services/my
 * Get vendor's own services
 */
const getMyServices = asyncHandler(async (req, res) => {
  const user = req.user;

  const services = await Service.find({ vendor: user._id })
    .populate('vendor', 'walletAddress username profile')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: services
  });
});

module.exports = {
  getServices,
  getCategories,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getMyServices
};
