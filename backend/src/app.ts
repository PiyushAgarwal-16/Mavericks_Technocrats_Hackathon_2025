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
import authRoutes from './routes/auth';
import certificateRoutes from './routes/certificates';

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
  app.use('/auth', authRoutes);
  app.use('/certificates', certificateRoutes);

  return app;
}
