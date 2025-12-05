/**
 * Express Application Configuration
 * 
 * This module sets up the Express app with middleware, routes, and error handling.
 * It is separated from index.ts to allow for easier testing.
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import healthRouter from './routes/health';
// Import other routes as they are created
// import authRoutes from './routes/auth.routes';
// import certificateRoutes from './routes/certificate.routes';

export function createApp(): Application {
  const app: Application = express();

  // Security middleware
  app.use(helmet());
  
  // CORS configuration
  app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  }));

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/health', healthRouter);
  // app.use('/api/auth', authRoutes);
  // app.use('/api/certificates', certificateRoutes);

  return app;
}
