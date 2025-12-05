/**
 * Server Entry Point
 * 
 * Initializes the Express application, connects to the database,
 * and starts the HTTP server.
 */

import dotenv from 'dotenv';
import { createApp } from './app';
import { connectDatabase } from './config/database';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000;

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Create Express app
    const app = createApp();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`🚀 ZeroTrace Backend running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
