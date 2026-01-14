const { httpRequestDuration } = require("./metrics");

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
  metricsMiddleware,
};
