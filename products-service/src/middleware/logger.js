'use strict';

const { createLogger, format, transports } = require('winston');

// Structured JSON logging — CloudWatch Log Insights can query these fields
const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: {
    service: 'products-service',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [new transports.Console()]
});

module.exports = logger;
