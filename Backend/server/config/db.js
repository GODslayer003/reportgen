// server/config/db.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Database connected successfully: ${conn.connection.host}`);
  } catch (err) {
    console.error('Error in DB connection:', err.message || err);
    process.exit(1); // Exit process on failure
  }
};

export default connectDB;
