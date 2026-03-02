require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // MongoDB
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/smajpihub',
  
  // Redis (optional)
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379
  },
  
  // JWT
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : ['http://localhost:5500', 'https://officialsmaj.github.io'],
  
  // Pi Network
  piNetworkSandbox: process.env.PI_NETWORK_SANDBOX === 'true',

  // AI Assistant
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini'
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  }
};
