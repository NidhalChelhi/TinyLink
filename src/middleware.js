const crypto = require("crypto");
const { httpRequestDuration } = require("./metrics");

// Generate unique request ID
function generateRequestId() {
  return crypto.randomUUID();
}

// Tracing middleware - adds unique request ID to each request
function tracingMiddleware(req, res, next) {
  // Use existing request ID from header or generate new one
  const requestId = req.headers["x-request-id"] || generateRequestId();
  
  // Attach to request object for use in handlers
  req.requestId = requestId;
  
  // Add to response headers for client correlation
  res.setHeader("x-request-id", requestId);
  
  // Store start time for duration tracking
  req.startTime = Date.now();
  
  next();
}

// Metrics middleware
function metricsMiddleware(req, res, next) {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });

  next();
}

module.exports = {
  tracingMiddleware,
  metricsMiddleware,
};
