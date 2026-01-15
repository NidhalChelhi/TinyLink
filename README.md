# TinyLink - URL Shortener

[![CI Pipeline](https://github.com/NidhalChelhi/tinylink/actions/workflows/ci.yml/badge.svg)](https://github.com/NidhalChelhi/tinylink/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/NidhalChelhi/tinylink/actions/workflows/cd.yml/badge.svg)](https://github.com/NidhalChelhi/tinylink/actions/workflows/cd.yml)

A simple, fast, and production-ready URL shortening service built with Node.js and Express.

## Features

- 🔗 URL Shortening with unique 6-character codes
- ↪️ Fast redirects with click tracking
- 📊 Statistics endpoint for analytics
- 🏥 Health check endpoint
- 📈 Prometheus metrics for monitoring
- 📝 Structured logging with Winston
- ✅ Input validation and error handling
- 🐳 Docker support

## Quick Start

### Using Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/NidhalChelhi/tinylink.git
cd tinylink

# Start with Docker Compose
docker-compose up -d

# Check health
curl http://localhost:3000/health
```

### Using Node.js

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

## API Endpoints

### Shorten URL

```bash
POST /shorten
Content-Type: application/json

{
  "url": "https://example.com"
}
```

### Redirect

```bash
GET /:shortCode
```

### Get Statistics

```bash
GET /stats/:shortCode
```

### Health Check

```bash
GET /health
```

### Prometheus Metrics

```bash
GET /metrics
```

## Docker

See [DOCKER.md](DOCKER.md) for detailed Docker deployment instructions.

## Environment Variables

```env
NODE_ENV=development    # development | production
PORT=3000              # Server port
BASE_URL=http://localhost:3000  # Base URL for short links
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests (if available)
npm test
```

## Technology Stack

- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Validation:** Joi
- **Logging:** Winston
- **Metrics:** prom-client (Prometheus)
- **Containerization:** Docker & Docker Compose

## Project Structure

```
tinylink/
├── src/
│   ├── index.js          # Main server file
│   ├── routes.js         # API routes
│   ├── storage.js        # In-memory storage
│   ├── utils.js          # Utilities
│   ├── config.js         # Configuration
│   ├── logger.js         # Winston logger
│   ├── metrics.js        # Prometheus metrics
│   ├── middleware.js     # Express middleware
│   ├── validation.js     # Joi schemas
│   └── errors.js         # Custom error classes
├── Dockerfile            # Docker image definition
├── docker-compose.yml    # Docker Compose configuration
├── package.json          # Dependencies
└── README.md            # This file
```

## License

MIT

## Author

Nidhal Chelhi
