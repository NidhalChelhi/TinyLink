const express = require("express");
const config = require("./config");
const routes = require("./routes");
const storage = require("./storage");
const { register } = require("./metrics");
const { metricsMiddleware } = require("./middleware");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(metricsMiddleware);

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

// Start server
app.listen(config.port, () => {
  console.log(`🚀 TinyLink server running on port ${config.port}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`💚 Health check: http://localhost:${config.port}/health`);
  console.log(`📊 Metrics: http://localhost:${config.port}/metrics`);
});
