// server/config/db.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Add debugging
console.log('MONGO_URI from env:', process.env.MONGO_URI);
console.log('All env variables:', Object.keys(process.env));

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Database connected successfully: ${conn.connection.host}`);
  } catch (err) {
    console.error('Error in DB connection:', err.message || err);
    process.exit(1);
  }
};

export default connectDB;