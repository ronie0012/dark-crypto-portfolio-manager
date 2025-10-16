#!/bin/bash

# Production deployment script for Docker Swarm

set -e

echo "🚀 Starting production deployment..."

# Check if running as swarm manager
if ! docker info --format '{{.Swarm.LocalNodeState}}' | grep -q "active"; then
    echo "❌ Docker Swarm is not initialized. Run 'docker swarm init' first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please create it from .env.example"
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
required_vars=("TURSO_CONNECTION_URL" "TURSO_AUTH_TOKEN" "BETTER_AUTH_SECRET" "COINGECKO_API_KEY" "MONGO_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

# Build and push images
echo "📦 Building production images..."
docker build -f Dockerfile.frontend -t crypto-app:latest .

# Tag for registry if REGISTRY_URL is set
if [ ! -z "$REGISTRY_URL" ]; then
    echo "🏷️ Tagging images for registry..."
    docker tag crypto-app:latest $REGISTRY_URL/crypto-app:latest
    
    echo "📤 Pushing to registry..."
    docker push $REGISTRY_URL/crypto-app:latest
fi

# Create configs and secrets
echo "🔧 Setting up configs and secrets..."

# Create nginx config
docker config create nginx_config nginx.prod.conf 2>/dev/null || echo "Config nginx_config already exists"

# Create SSL secrets (if certificates exist)
if [ -f "ssl/cert.pem" ] && [ -f "ssl/key.pem" ]; then
    docker secret create ssl_cert ssl/cert.pem 2>/dev/null || echo "Secret ssl_cert already exists"
    docker secret create ssl_key ssl/key.pem 2>/dev/null || echo "Secret ssl_key already exists"
else
    echo "⚠️ SSL certificates not found. HTTPS will not be available."
fi

# Deploy stack
echo "🚀 Deploying stack..."
docker stack deploy -c docker-stack.yml crypto-stack

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service status
echo "🔍 Checking service status..."
docker stack services crypto-stack

# Show service logs
echo "📋 Recent logs:"
docker service logs --tail=20 crypto-stack_app

echo "✅ Production deployment completed!"
echo "🌐 Application should be available at your configured domain"
echo ""
echo "📊 Monitor with: docker stack services crypto-stack"
echo "📋 View logs: docker service logs -f crypto-stack_app"
echo "🛑 Remove stack: docker stack rm crypto-stack"