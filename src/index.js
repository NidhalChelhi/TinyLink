const app = require("./app");
const config = require("./config");
const logger = require("./logger");

// Start server
app.listen(config.port, () => {
  logger.info("TinyLink server started", {
    port: config.port,
    environment: config.nodeEnv,
    healthCheck: `http://localhost:${config.port}/health`,
    metrics: `http://localhost:${config.port}/metrics`,
  });
});
