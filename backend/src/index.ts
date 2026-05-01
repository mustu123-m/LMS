import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import applicationRoutes from './routes/application';
import dashboardRoutes from './routes/dashboard';
import { errorHandler } from './middleware/error';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    /\.vercel\.app$/,
  ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/application', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
