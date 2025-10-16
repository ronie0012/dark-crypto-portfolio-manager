# Docker Deployment Guide

This guide explains how to deploy your crypto portfolio application using Docker containers.

## Architecture

The application is split into multiple containers:
- **Frontend**: Next.js application (port 3000)
- **Backend**: API routes (port 3001) 
- **MongoDB**: Database (port 27017)
- **Nginx**: Reverse proxy (port 80)

## Prerequisites

- Docker and Docker Compose installed
- `.env` file with required environment variables

## Quick Start

### 1. Build Images

```bash
# Build all images
docker-compose build

# Or build individually
docker build -f Dockerfile.frontend -t crypto-frontend .
docker build -f Dockerfile.backend -t crypto-backend .
```

### 2. Deploy Application

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Access Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Nginx Proxy**: http://localhost
- **MongoDB**: localhost:27017

## Environment Variables

Create a `.env` file with:

```env
TURSO_CONNECTION_URL=your_turso_url
TURSO_AUTH_TOKEN=your_turso_token
BETTER_AUTH_SECRET=your_auth_secret
COINGECKO_API_KEY=your_coingecko_key
```

## Management Commands

```bash
# Stop all services
docker-compose down

# Restart specific service
docker-compose restart frontend

# View service logs
docker-compose logs -f backend

# Scale services
docker-compose up -d --scale frontend=2

# Remove everything
docker-compose down -v --remove-orphans
```

## Production Deployment

### 1. Registry Push

```bash
# Tag for registry
docker tag crypto-frontend:latest your-registry.com/crypto-frontend:latest
docker tag crypto-backend:latest your-registry.com/crypto-backend:latest

# Push to registry
docker push your-registry.com/crypto-frontend:latest
docker push your-registry.com/crypto-backend:latest
```

### 2. SSL Configuration

Place SSL certificates in `./ssl/` directory:
- `ssl/cert.pem`
- `ssl/key.pem`

Update nginx.conf for HTTPS.

### 3. Environment-Specific Configs

Create separate docker-compose files:
- `docker-compose.prod.yml`
- `docker-compose.staging.yml`

```bash
# Deploy to production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Monitoring

### Health Checks

All services include health checks:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001/api/health`
- MongoDB: Internal mongosh ping

### Logs

```bash
# All services
docker-compose logs

# Specific service
docker-compose logs frontend

# Follow logs
docker-compose logs -f --tail=100
```

## Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in docker-compose.yml
2. **Environment variables**: Ensure .env file exists
3. **Build failures**: Check Dockerfile syntax
4. **Network issues**: Verify service names in configs

### Debug Commands

```bash
# Enter container shell
docker-compose exec frontend sh
docker-compose exec backend sh
docker-compose exec mongodb mongosh

# Check container resources
docker stats

# Inspect networks
docker network ls
docker network inspect crypto-network
```

## Performance Optimization

### Multi-stage Builds
Both Dockerfiles use multi-stage builds to minimize image size.

### Resource Limits
Add resource limits in docker-compose.yml:

```yaml
services:
  frontend:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

### Caching
- Use `.dockerignore` to exclude unnecessary files
- Leverage Docker layer caching
- Use registry caching for CI/CD

## Security

### Best Practices
- Use non-root users in containers
- Scan images for vulnerabilities
- Keep base images updated
- Use secrets management for sensitive data
- Enable firewall rules for production

### Network Security
- Use internal networks for service communication
- Expose only necessary ports
- Implement proper authentication