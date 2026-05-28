// Datavedha Analytics - Products Microservice
// Entry point: initialises X-Ray tracing, Express app, DB connection

'use strict';

const AWSXRay = require('aws-xray-sdk');
const http = require('http');
const https = require('https');

// Patch AWS SDK and HTTP calls for X-Ray tracing (no-op locally if XRAY_DAEMON_ADDRESS not set)
if (process.env.ENABLE_XRAY === 'true') {
  AWSXRay.captureHTTPsGlobal(http, true);
  AWSXRay.captureHTTPsGlobal(https, true);
}

require('dotenv').config();
const app = require('./app');
const { initDb } = require('./db/pool');
const logger = require('./middleware/logger');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await initDb();
    logger.info('Database connection established');

    const server = app.listen(PORT, () => {
      logger.info({ message: 'Products service started', port: PORT, env: process.env.NODE_ENV });
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info({ message: `${signal} received, shutting down gracefully` });
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.error({ message: 'Failed to start service', error: err.message });
    process.exit(1);
  }
}

start();
