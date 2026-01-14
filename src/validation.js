const Joi = require("joi");

// Schema for URL shortening request
const shortenSchema = Joi.object({
  url: Joi.string()
    .uri({ scheme: ["http", "https"] })
    .max(2048)
    .required()
    .messages({
      "string.uri": "Please provide a valid HTTP or HTTPS URL",
      "string.max": "URL must not exceed 2048 characters",
      "any.required": "URL is required",
    }),
});

// Schema for short code parameter
const shortCodeSchema = Joi.string().alphanum().length(6).required().messages({
  "string.alphanum": "Short code must contain only letters and numbers",
  "string.length": "Short code must be exactly 6 characters",
  "any.required": "Short code is required",
});

// Validate URL shortening request
function validateShortenRequest(data) {
  return shortenSchema.validate(data);
}

// Validate short code
function validateShortCode(shortCode) {
  return shortCodeSchema.validate(shortCode);
}

module.exports = {
  validateShortenRequest,
  validateShortCode,
};
