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
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const isProduction = process.env.NODE_ENV === 'production';
    const normalizedOrigin = origin.replace(/\/+$/, '');

    // In local development, permit localhost and 127.0.0.1
    if (!isProduction) {
      if (
        normalizedOrigin.startsWith('http://localhost:') ||
        normalizedOrigin.startsWith('http://127.0.0.1:') ||
        !process.env.CORS_ORIGIN ||
        process.env.CORS_ORIGIN === '*'
      ) {
        return callback(null, true);
      }
    }

    // Explicit production allowlist:
    // Only allows our designated three production Vercel frontend domains.
    // Disallows localhost, wildcard '*', and untrusted *.vercel.app subdomains.
    const defaultProductionOrigins = [
      'https://vinosphere-consumer.vercel.app',
      'https://vinosphere-winery.vercel.app',
      'https://vinosphere-admin.vercel.app',
    ];

    const configuredOrigins = (process.env.CORS_ORIGIN || '')
      .split(',')
      .map((o) => o.trim().replace(/\/+$/, ''))
      .filter((o) => o && o !== '*');

    const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : defaultProductionOrigins;

    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }

    console.warn(`[CORS] Request from origin '${origin}' blocked by production policy`);
    return callback(new Error(`Origin ${origin} not allowed by CORS policy`));
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

// Health Check Routes
app.get(['/health', '/api/v1/health'], (req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    service: 'vinosphere-backend-api',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Global Error Handler
app.use(globalErrorHandler);

export default app;
