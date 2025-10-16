#!/bin/bash

# Docker deployment script

echo "🚀 Deploying crypto portfolio application..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found! Please create it with required environment variables."
    exit 1
fi

# Create necessary directories
mkdir -p ssl
mkdir -p mongo-init

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images (optional)
read -p "Do you want to remove old images? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️ Removing old images..."
    docker image prune -f
fi

# Build and start services
echo "🏗️ Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service health
echo "🔍 Checking service health..."
docker-compose ps

# Show logs
echo "📋 Recent logs:"
docker-compose logs --tail=20

echo "✅ Deployment completed!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "🗄️ MongoDB: localhost:27017"
echo "🌍 Nginx Proxy: http://localhost"

echo ""
echo "📊 To view logs: docker-compose logs -f [service-name]"
echo "🛑 To stop: docker-compose down"
echo "🔄 To restart: docker-compose restart [service-name]"