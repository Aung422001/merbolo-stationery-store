import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    return conn;
  } catch (error) {
    console.error('MongoDB connection failed; verify database connectivity and configuration.');
    // Do not call process.exit(1) so Express server can stay online and serve diagnostic info
  }
};
