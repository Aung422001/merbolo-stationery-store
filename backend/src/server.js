import dotenv from 'dotenv';
import app from './app.js';
import { connectDB } from './config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Start HTTP Server immediately so Render port binding succeeds
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  connectDB();
});
