const express = require("express");
const config = require("./config");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get("/", (req, res) => {
  res.json({
    service: "TinyLink",
    version: "1.0.0",
    status: "running",
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`🚀 TinyLink server running on port ${config.port}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
});
