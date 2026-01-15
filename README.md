# TinyLink – URL Shortener

[![CI Pipeline](https://github.com/NidhalChelhi/tinylink/actions/workflows/ci.yml/badge.svg)](https://github.com/NidhalChelhi/tinylink/actions/workflows/ci.yml)
[![CD Pipeline](https://github.com/NidhalChelhi/tinylink/actions/workflows/cd.yml/badge.svg)](https://github.com/NidhalChelhi/tinylink/actions/workflows/cd.yml)

A simple, fast, and production-ready URL shortening service built with **Node.js** and **Express**.

---

## ✨ Features

- 🔗 URL shortening with unique 6-character codes
- ↪️ Fast redirects with click tracking
- 📊 Statistics endpoint for analytics
- 🏥 Health check endpoint
- 📈 Prometheus metrics for monitoring
- 📝 Structured logging with Winston
- ✅ Input validation and error handling
- 🐳 Docker support
- ☸️ Kubernetes deployment ready

---

## 🚀 Quick Start

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

---

### Using Node.js

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run in production mode
npm start
```

---

### Using Kubernetes

```bash
# Deploy to Kubernetes cluster
kubectl apply -f k8s/all-in-one.yaml

# Check deployment status
kubectl get pods -n tinylink

# Access via port-forward
kubectl port-forward -n tinylink svc/tinylink-service 8080:80
curl http://localhost:8080/health
```

---

## 📡 API Endpoints

### Shorten URL

```http
POST /shorten
Content-Type: application/json
```

```json
{
  "url": "https://example.com"
}
```

**Response**

```json
{
  "originalUrl": "https://example.com",
  "shortUrl": "http://localhost:3000/aBc123",
  "shortCode": "aBc123",
  "createdAt": "2026-01-15T10:30:00.000Z"
}
```

---

### Redirect

```http
GET /:shortCode
```

Redirects to the original URL with **301** status code.

---

### Get Statistics

```http
GET /stats/:shortCode
```

**Response**

```json
{
  "shortCode": "aBc123",
  "originalUrl": "https://example.com",
  "clicks": 42,
  "createdAt": "2026-01-15T10:30:00.000Z",
  "shortUrl": "http://localhost:3000/aBc123"
}
```

---

### Health Check

```http
GET /health
```

**Response**

```json
{
  "status": "healthy",
  "uptime": 123.45,
  "timestamp": "2026-01-15T10:30:00.000Z",
  "service": "TinyLink",
  "version": "1.0.0"
}
```

---

### Prometheus Metrics

```http
GET /metrics
```

Returns metrics in **Prometheus format**.

---

## 📦 Deployment

### Docker

See [DOCKER.md](DOCKER.md) for detailed instructions.

```bash
# Build image
docker build -t tinylink:latest .

# Run container
docker run -d -p 3000:3000 tinylink:latest

# Using Docker Compose
docker-compose up -d
```

---

### Kubernetes

See [KUBERNETES.md](KUBERNETES.md) for full documentation.

```bash
# Deploy everything
kubectl apply -f k8s/all-in-one.yaml

# Check status
kubectl get all -n tinylink

# View logs
kubectl logs -f -l app=tinylink -n tinylink

# Scale deployment
kubectl scale deployment tinylink -n tinylink --replicas=5

# Delete deployment
kubectl delete -f k8s/all-in-one.yaml
```

---

## ⚙️ Environment Variables

```env
NODE_ENV=development           # development | production
PORT=3000                      # Server port
BASE_URL=http://localhost:3000 # Base URL for short links
```

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run linter
npm run lint
```

---

## 🧰 Technology Stack

- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Validation:** Joi
- **Logging:** Winston
- **Metrics:** prom-client (Prometheus)
- **Containerization:** Docker & Docker Compose
- **Orchestration:** Kubernetes

---

## 📁 Project Structure

```text
tinylink/
├── src/
│   ├── index.js
│   ├── routes.js
│   ├── storage.js
│   ├── utils.js
│   ├── config.js
│   ├── logger.js
│   ├── metrics.js
│   ├── middleware.js
│   ├── validation.js
│   └── errors.js
├── k8s/
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── hpa.yaml
│   └── all-in-one.yaml
├── .github/
│   ├── workflows/
│   │   ├── ci.yml
│   │   └── cd.yml
│   └── dependabot.yml
├── Dockerfile
├── docker-compose.yml
├── package.json
├── DOCKER.md
├── KUBERNETES.md
├── CI-CD.md
└── README.md
```

---

## 🔄 CI/CD Pipeline

**GitHub Actions** is used for CI/CD.

### CI Pipeline

- Linting and testing
- Docker image build
- Security scanning with Trivy

### CD Pipeline

- Runs on merge to `main`
- Builds production Docker images
- Tags images with version & commit SHA
- Simulated staging deployment

See [CI-CD.md](CI-CD.md) for details.

---

## 📊 Monitoring & Observability

### Health Check

```bash
curl http://localhost:3000/health
```

### Metrics

```bash
curl http://localhost:3000/metrics
```

**Available metrics**

- `urls_created_total`
- `url_redirects_total`
- `http_request_duration_seconds`
- Default Node.js metrics (CPU, memory)

---

## 🧪 Testing

```bash
npm test
npm run test:watch
npm test -- --coverage
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

---

## 📄 License

MIT

---

## 👤 Author

**Nidhal Chelhi**

---

## 🔗 Links

- Repository: [https://github.com/NidhalChelhi/tinylink](https://github.com/NidhalChelhi/tinylink)
- Issues: [https://github.com/NidhalChelhi/tinylink/issues](https://github.com/NidhalChelhi/tinylink/issues)
- GitHub Actions: [https://github.com/NidhalChelhi/tinylink/actions](https://github.com/NidhalChelhi/tinylink/actions)
