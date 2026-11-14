import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes';
import { globalRateLimiter } from './middleware/rateLimiter';
import { globalErrorHandler } from './middleware/errorHandler';

const app: Application = express();

// Security Middlewares
app.use(helmet()); // Sets secure HTTP headers
app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // In development or when CORS_ORIGIN is *, reflect caller's origin so credentials: true is valid
    if (process.env.NODE_ENV !== 'production' || process.env.CORS_ORIGIN === '*' || !process.env.CORS_ORIGIN) {
      return callback(null, true);
    }

    const allowedOrigins = process.env.CORS_ORIGIN.split(',').map((o) => o.trim());
    if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }

    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// Performance Middlewares
app.use(compression()); // Compress response bodies

// Limit requests from same API
app.use('/api', globalRateLimiter);

// Body Parsing Middlewares
app.use(express.json({ limit: '10kb' })); // Parse JSON bodies (limited to 10kb to prevent payload attacks)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser()); // Parse cookies

// Mount API Routes
app.use('/api/v1', apiRoutes);

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'VinoSphere API is running' });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
