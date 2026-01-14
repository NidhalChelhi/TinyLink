const express = require("express");
const config = require("./config");
const routes = require("./routes");
const { register } = require("./metrics");
const { metricsMiddleware } = require("./middleware");
const logger = require("./logger");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(metricsMiddleware);

// Request logging middleware
app.use((req, res, next) => {
  logger.http(`${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "TinyLink",
    version: "1.0.0",
  });
});

// Metrics endpoint for Prometheus
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    service: "TinyLink",
    version: "1.0.0",
    status: "running",
    endpoints: {
      shorten: "POST /shorten",
      redirect: "GET /:shortCode",
      stats: "GET /stats/:shortCode",
      health: "GET /health",
      metrics: "GET /metrics",
    },
  });
});

// API routes
app.use("/", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  res.status(500).json({
    error: "Internal server error",
    message:
      config.nodeEnv === "development" ? err.message : "Something went wrong",
  });
});

// Start server
app.listen(config.port, () => {
  logger.info("TinyLink server started", {
    port: config.port,
    environment: config.nodeEnv,
    healthCheck: `http://localhost:${config.port}/health`,
    metrics: `http://localhost:${config.port}/metrics`,
  });
});
