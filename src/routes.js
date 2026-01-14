const express = require("express");
const storage = require("./storage");
const { generateShortCode, isValidUrl } = require("./utils");
const config = require("./config");

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

  // Return response
  res.status(201).json({
    originalUrl: url,
    shortUrl: `${config.baseUrl}/${shortCode}`,
    shortCode: shortCode,
    createdAt: new Date().toISOString(),
  });
});

module.exports = router;
