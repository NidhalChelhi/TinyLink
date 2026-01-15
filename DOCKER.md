# Docker Deployment Guide

## Prerequisites

- Docker installed (v20.10+)
- Docker Compose installed (v2.0+)

## Building the Image

### Build locally

```bash
docker build -t tinylink: latest .
```

### Check image size

```bash
docker images tinylink
```

## Running with Docker

### Run single container

```bash
docker run -d \
  --name tinylink \
  -p 3000:3000 \
  -e NODE_ENV=production \
  tinylink:latest
```

### View logs

```bash
docker logs tinylink
```

### Stop container

```bash
docker stop tinylink
docker rm tinylink
```

## Running with Docker Compose

### Start services

```bash
docker-compose up -d
```

### View logs

```bash
docker-compose logs -f
```

### Stop services

```bash
docker-compose down
```

### Rebuild and restart

```bash
docker-compose up -d --build
```

## Health Check

The container includes a health check that runs every 30 seconds:

```bash
# Check container health status
docker ps
```

Look for "healthy" status in the STATUS column.

## Testing the Dockerized App

```bash
# Create short URL
curl -X POST http://localhost:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com"}'

# Check health
curl http://localhost:3000/health

# View metrics
curl http://localhost:3000/metrics
```

## Production Considerations

### Environment Variables

Create a `.env` file (not committed to git):

```env
NODE_ENV=production
PORT=3000
BASE_URL=https://yourdomain.com
```

Then use it in docker-compose:

```yaml
env_file:
  - .env
```

### Volume for Persistence

Add volumes to docker-compose. yml if using file-based storage:

```yaml
volumes:
  - ./data:/app/data
```

### Resource Limits

Add resource constraints:

```yaml
deploy:
  resources:
    limits:
      cpus: "0.5"
      memory: 512M
    reservations:
      memory: 256M
```

## Troubleshooting

### Container won't start

```bash
docker logs tinylink
```

### Check container details

```bash
docker inspect tinylink
```

### Access container shell

```bash
docker exec -it tinylink sh
```

### Clean up everything

```bash
docker-compose down -v
docker system prune -a
```
