import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('MongoDB connected');
    return conn;
  } catch (error) {
    // Log only a safe error category; never log connection URIs or credentials.
    const name = error?.name || 'UnknownError';
    const code = typeof error?.code === 'string' ? error.code : '';
    const category = name === 'MongoServerError' && error?.code === 18
      ? 'authentication'
      : /ServerSelection/.test(name)
        ? 'network-or-dns'
        : /Parse|Invalid/.test(name)
          ? 'uri-format'
          : 'other';
    console.error(`MongoDB connection failed (category=${category}, type=${name}${code ? `, code=${code}` : ''}).`);
    return null;
  }
};
