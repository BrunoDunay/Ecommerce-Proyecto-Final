import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const dbConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ecommerce-db';

  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is not configured. Using default local MongoDB URL.');
  }

  try {
    await mongoose.connect(dbURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log('MongoDB is connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    console.warn('Continuing without database connection for development mode.');
  }
};

export const isDbConnected = () => mongoose.connection.readyState === 1;

export default dbConnection;