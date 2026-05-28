'use strict';

const logger = require('./logger');

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const traceId = req.headers['x-amzn-trace-id'] || null;

  logger.error({
    message: err.message,
    status,
    path: req.originalUrl,
    method: req.method,
    traceId,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
  });

  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
    traceId
  });
}

module.exports = { errorHandler };
