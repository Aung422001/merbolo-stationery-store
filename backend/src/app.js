import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

import { runSeed } from './seed/seedData.js';

dotenv.config();

const app = express();

// Security headers
app.use(helmet());

// CORS
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman or server-to-server)
      if (!origin) return callback(null, true);
      // Allow configured clientUrl, localhost, or any onrender.com subdomains
      if (
        origin === clientUrl ||
        origin === clientUrl.replace(/\/$/, '') ||
        origin.includes('localhost') ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting on Auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Root & Health check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'MerboloEbook API Server is running',
    health: '/api/health'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'MerboloEbook API is healthy',
    timestamp: new Date().toISOString()
  });
});

// One-click Database Seeder endpoint
app.get('/api/seed', async (req, res, next) => {
  try {
    const result = await runSeed();
    res.status(200).json({
      success: true,
      message: 'Database seeded successfully!',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// API Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Centralized error handler
app.use(errorHandler);

export default app;
