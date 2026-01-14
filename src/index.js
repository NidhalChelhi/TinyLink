const express = require("express");
const config = require("./config");
const routes = require("./routes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    service: "TinyLink",
    version: "1.0.0",
    status: "running",
    endpoints: {
      shorten: "POST /shorten",
      redirect: "GET /:shortCode",
      stats: "GET /stats/: shortCode",
    },
  });
});

// API routes
app.use("/", routes);

// Start server
app.listen(config.port, () => {
  console.log(`🚀 TinyLink server running on port ${config.port}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
});
