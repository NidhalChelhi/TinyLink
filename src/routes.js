const express = require("express");
const storage = require("./storage");
const { generateShortCode, isValidUrl } = require("./utils");
const config = require("./config");
const { urlsCreated, urlRedirects } = require("./metrics");

const router = express.Router();

// POST /shorten - Shorten a URL
router.post("/shorten", (req, res) => {
  const { url } = req.body;

  // Validate input
  if (!url) {
    return res.status(400).json({
      error: "URL is required",
      message: 'Please provide a "url" field in the request body',
    });
  }

  if (!isValidUrl(url)) {
    return res.status(400).json({
      error: "Invalid URL",
      message: "Please provide a valid HTTP or HTTPS URL",
    });
  }

  // Generate unique short code
  let shortCode;
  let attempts = 0;
  do {
    shortCode = generateShortCode();
    attempts++;
    if (attempts > 10) {
      return res.status(500).json({
        error: "Failed to generate unique short code",
      });
    }
  } while (storage.exists(shortCode));

  // Save to storage
  storage.save(shortCode, url);

  // Increment metric
  urlsCreated.inc();

  // Return response
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

  const urlData = storage.get(shortCode);

  if (!urlData) {
    return res.status(404).json({
      error: "Short URL not found",
      message: `No statistics found for short code: ${shortCode}`,
    });
  }

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

  // Get URL from storage
  const urlData = storage.get(shortCode);

  if (!urlData) {
    return res.status(404).json({
      error: "Short URL not found",
      message: `No URL found for short code: ${shortCode}`,
    });
  }

  // Increment click counter
  storage.incrementClicks(shortCode);

  // Increment metric
  urlRedirects.inc();

  // Redirect to original URL
  res.redirect(301, urlData.originalUrl);
});

module.exports = router;
