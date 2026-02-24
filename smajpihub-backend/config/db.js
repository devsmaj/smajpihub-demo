const mongoose = require('mongoose');
const config = require('./index');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // In development, continue without database for testing
    if (config.nodeEnv === 'development') {
      console.log('Running in development mode without database connection');
      return null;
    }
    process.exit(1);
  }
};

module.exports = connectDB;
