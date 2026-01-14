const express = require("express");
const storage = require("./storage");
const { generateShortCode, isValidUrl } = require("./utils");
const config = require("./config");
const { urlsCreated, urlRedirects } = require("./metrics");
const logger = require("./logger");

const router = express.Router();

// POST /shorten - Shorten a URL
router.post("/shorten", (req, res) => {
  const { url } = req.body;

  logger.info("Received shorten request", { url });

  if (!url) {
    logger.warn("Shorten request missing URL");
    return res.status(400).json({
      error: "URL is required",
      message: 'Please provide a "url" field in the request body',
    });
  }

  if (!isValidUrl(url)) {
    logger.warn("Invalid URL provided", { url });
    return res.status(400).json({
      error: "Invalid URL",
      message: "Please provide a valid HTTP or HTTPS URL",
    });
  }

  let shortCode;
  let attempts = 0;
  do {
    shortCode = generateShortCode();
    attempts++;
    if (attempts > 10) {
      logger.error("Failed to generate unique short code after 10 attempts");
      return res.status(500).json({
        error: "Failed to generate unique short code",
      });
    }
  } while (storage.exists(shortCode));

  storage.save(shortCode, url);
  urlsCreated.inc();

  logger.info("URL shortened successfully", { shortCode, url, attempts });

  res.status(201).json({
    originalUrl: url,
    shortUrl: `${config.baseUrl}/${shortCode}`,
    shortCode: shortCode,
    createdAt: new Date().toISOString(),
  });
});

// GET /stats/:shortCode - Get statistics for a short URL
router.get("/stats/:shortCode", (req, res) => {
  const { shortCode } = req.params;

  logger.debug("Stats request received", { shortCode });

  const urlData = storage.get(shortCode);

  if (!urlData) {
    logger.warn("Stats requested for non-existent short code", { shortCode });
    return res.status(404).json({
      error: "Short URL not found",
      message: `No statistics found for short code: ${shortCode}`,
    });
  }

  logger.info("Stats retrieved", { shortCode, clicks: urlData.clicks });

  res.json({
    shortCode: shortCode,
    originalUrl: urlData.originalUrl,
    clicks: urlData.clicks,
    createdAt: urlData.createdAt,
    shortUrl: `${config.baseUrl}/${shortCode}`,
  });
});

// GET /:shortCode - Redirect to original URL
router.get("/:shortCode", (req, res) => {
  const { shortCode } = req.params;

  logger.debug("Redirect request received", { shortCode });

  const urlData = storage.get(shortCode);

  if (!urlData) {
    logger.warn("Redirect attempted for non-existent short code", {
      shortCode,
    });
    return res.status(404).json({
      error: "Short URL not found",
      message: `No URL found for short code: ${shortCode}`,
    });
  }

  storage.incrementClicks(shortCode);
  urlRedirects.inc();

  logger.info("Redirect performed", {
    shortCode,
    originalUrl: urlData.originalUrl,
    clicks: urlData.clicks + 1,
  });

  res.redirect(301, urlData.originalUrl);
});

module.exports = router;
