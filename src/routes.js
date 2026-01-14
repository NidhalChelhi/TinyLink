const express = require("express");
const storage = require("./storage");
const { generateShortCode, isValidUrl } = require("./utils");
const config = require("./config");
const { urlsCreated, urlRedirects } = require("./metrics");
const logger = require("./logger");
const { validateShortenRequest, validateShortCode } = require("./validation");
const { ValidationError, NotFoundError, ServerError } = require("./errors");

const router = express.Router();

// POST /shorten - Shorten a URL
router.post("/shorten", (req, res, next) => {
  try {
    logger.info("Received shorten request", { url: req.body.url });

    // Validate request body
    const { error, value } = validateShortenRequest(req.body);

    if (error) {
      logger.warn("Validation failed for shorten request", {
        error: error.details[0].message,
        url: req.body.url,
      });
      throw new ValidationError(error.details[0].message);
    }

    const { url } = value;

    // Generate unique short code
    let shortCode;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      shortCode = generateShortCode();
      attempts++;

      if (attempts > maxAttempts) {
        logger.error("Failed to generate unique short code", {
          attempts: maxAttempts,
        });
        throw new ServerError(
          "Failed to generate unique short code.  Please try again."
        );
      }
    } while (storage.exists(shortCode));

    // Save to storage
    storage.save(shortCode, url);
    urlsCreated.inc();

    logger.info("URL shortened successfully", { shortCode, url, attempts });

    res.status(201).json({
      originalUrl: url,
      shortUrl: `${config.baseUrl}/${shortCode}`,
      shortCode: shortCode,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// GET /stats/:shortCode - Get statistics for a short URL
router.get("/stats/:shortCode", (req, res, next) => {
  try {
    const { shortCode } = req.params;

    logger.debug("Stats request received", { shortCode });

    // Validate short code format
    const { error } = validateShortCode(shortCode);

    if (error) {
      logger.warn("Invalid short code format for stats", { shortCode });
      throw new ValidationError(error.details[0].message);
    }

    // Get URL data
    const urlData = storage.get(shortCode);

    if (!urlData) {
      logger.warn("Stats requested for non-existent short code", { shortCode });
      throw new NotFoundError(
        `No statistics found for short code: ${shortCode}`
      );
    }

    logger.info("Stats retrieved", { shortCode, clicks: urlData.clicks });

    res.json({
      shortCode: shortCode,
      originalUrl: urlData.originalUrl,
      clicks: urlData.clicks,
      createdAt: urlData.createdAt,
      shortUrl: `${config.baseUrl}/${shortCode}`,
    });
  } catch (err) {
    next(err);
  }
});

// GET /:shortCode - Redirect to original URL
router.get("/:shortCode", (req, res, next) => {
  try {
    const { shortCode } = req.params;

    logger.debug("Redirect request received", { shortCode });

    // Validate short code format
    const { error } = validateShortCode(shortCode);

    if (error) {
      logger.warn("Invalid short code format for redirect", { shortCode });
      throw new ValidationError(error.details[0].message);
    }

    // Get URL data
    const urlData = storage.get(shortCode);

    if (!urlData) {
      logger.warn("Redirect attempted for non-existent short code", {
        shortCode,
      });
      throw new NotFoundError(`Short URL not found:  ${shortCode}`);
    }

    // Increment clicks and redirect
    storage.incrementClicks(shortCode);
    urlRedirects.inc();

    logger.info("Redirect performed", {
      shortCode,
      originalUrl: urlData.originalUrl,
      clicks: urlData.clicks + 1,
    });

    res.redirect(301, urlData.originalUrl);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
