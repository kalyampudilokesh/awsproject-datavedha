'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const AWSXRay = require('aws-xray-sdk');

const productRoutes = require('./routes/products');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

const app = express();

// Security headers
app.use(helmet());

// CORS — restrict to frontend domain in production via env var
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Amzn-Trace-Id']
}));

// X-Ray middleware (wraps each request in a segment)
if (process.env.ENABLE_XRAY === 'true') {
  app.use(AWSXRay.express.openSegment('products-service'));
}

// JSON body parsing
app.use(express.json());

// HTTP request logging (structured JSON)
app.use(morgan('combined', {
  stream: { write: (message) => logger.info({ type: 'access', message: message.trim() }) }
}));

// Health check — used by ALB target group
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', service: 'products-service', timestamp: new Date().toISOString() });
});

// Product routes
app.use('/api/products', productRoutes);

// X-Ray close segment
if (process.env.ENABLE_XRAY === 'true') {
  app.use(AWSXRay.express.closeSegment());
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
