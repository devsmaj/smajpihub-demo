const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const config = require('./config');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const orderRoutes = require('./routes/orders');
const assistantRoutes = require('./routes/assistant');
const dashboardRoutes = require('./routes/dashboard');
const piTransactionRoutes = require('./routes/piTransactions');

// Import JWT utilities for public key endpoint
const jwtUtils = require('./utils/jwt');

const app = express();
const frontendRoot = path.resolve(__dirname, '..');

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (config.corsOrigin.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-sso-token']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SMAJ PI HUB API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SMAJ PI HUB API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/connect-wallet': 'Connect Pi wallet',
        'GET /api/user': 'Get current user (protected)',
        'POST /api/logout': 'Logout (protected)',
        'PUT /api/user/profile': 'Update profile (protected)',
        'PUT /api/user/role': 'Update role (protected)',
        'GET /api/sso-token?service=smajstore': 'Get SSO token (protected)'
      },
      services: {
        'GET /api/services': 'Get all services',
        'GET /api/services/categories': 'Get categories',
        'GET /api/services/:id': 'Get service details',
        'POST /api/services': 'Create service (vendor)',
        'PUT /api/services/:id': 'Update service',
        'DELETE /api/services/:id': 'Delete service'
      },
      orders: {
        'POST /api/order': 'Create order',
        'GET /api/orders': 'Get user orders',
        'GET /api/order/:id': 'Get order details',
        'PUT /api/order/:id/status': 'Update order status (vendor)',
        'PUT /api/order/:id/payment': 'Update payment (admin)'
      },
      assistant: {
        'POST /api/assistant': 'SMAJ AI assistant response (OpenAI with fallback)'
      }
    }
  });
});

// Public key endpoint for SMAJ STORE to verify tokens
app.get('/api/public-key', (req, res) => {
  try {
    const publicKey = jwtUtils.getPublicKey();
    res.status(200).json({
      success: true,
      publicKey
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve public key'
    });
  }
});

// API routes
app.use('/api', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api', orderRoutes);
app.use('/api', assistantRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', piTransactionRoutes);

// Frontend static routes
app.use('/assets', express.static(path.join(frontendRoot, 'assets')));
app.use('/css', express.static(path.join(frontendRoot, 'css')));
app.use('/js', express.static(path.join(frontendRoot, 'js')));
app.use('/pages', express.static(path.join(frontendRoot, 'pages')));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendRoot, 'index.html'));
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`SMAJ PI HUB API server running on port ${PORT} (${config.nodeEnv})`);
});

module.exports = app;
