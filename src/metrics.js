const client = require("prom-client");

// Create a Registry
const register = new client.Registry();

// Add default metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const urlsCreated = new client.Counter({
  name: "urls_created_total",
  help: "Total number of URLs shortened",
  registers: [register],
});

const urlRedirects = new client.Counter({
  name: "url_redirects_total",
  help: "Total number of redirects performed",
  registers: [register],
});

module.exports = {
  register,
  httpRequestDuration,
  urlsCreated,
  urlRedirects,
};
