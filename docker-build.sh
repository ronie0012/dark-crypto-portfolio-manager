#!/bin/bash

# Docker build and deployment script for crypto portfolio app

echo "🚀 Building Docker images for crypto portfolio app..."

# Build frontend image
echo "📦 Building frontend image..."
docker build -f Dockerfile.frontend -t crypto-frontend:latest .

# Build backend image
echo "📦 Building backend image..."
docker build -f Dockerfile.backend -t crypto-backend:latest .

# Pull MongoDB image
echo "📦 Pulling MongoDB image..."
docker pull mongo:7.0

# Pull Nginx image
echo "📦 Pulling Nginx image..."
docker pull nginx:alpine

echo "✅ All images built successfully!"

# Optional: Push to registry
read -p "Do you want to push images to Docker registry? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Pushing images to registry..."
    
    # Tag images for registry (replace with your registry URL)
    REGISTRY_URL="your-registry.com"
    
    docker tag crypto-frontend:latest $REGISTRY_URL/crypto-frontend:latest
    docker tag crypto-backend:latest $REGISTRY_URL/crypto-backend:latest
    
    docker push $REGISTRY_URL/crypto-frontend:latest
    docker push $REGISTRY_URL/crypto-backend:latest
    
    echo "✅ Images pushed to registry!"
fi

echo "🎉 Build process completed!"
echo "Run 'docker-compose up -d' to start the application"