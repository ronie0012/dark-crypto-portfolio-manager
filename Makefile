# Crypto Portfolio Docker Management

.PHONY: help build dev prod test clean backup restore monitor

# Default target
help:
	@echo "Crypto Portfolio Docker Commands"
	@echo "================================"
	@echo "Development:"
	@echo "  make dev          Start development environment"
	@echo "  make dev-down     Stop development environment"
	@echo "  make dev-logs     Show development logs"
	@echo ""
	@echo "Production:"
	@echo "  make build        Build production images"
	@echo "  make prod         Deploy production stack"
	@echo "  make prod-down    Stop production stack"
	@echo "  make prod-logs    Show production logs"
	@echo ""
	@echo "Testing:"
	@echo "  make test         Run tests"
	@echo "  make test-build   Test build locally"
	@echo ""
	@echo "Maintenance:"
	@echo "  make backup       Backup database"
	@echo "  make restore      Restore database"
	@echo "  make clean        Clean up resources"
	@echo "  make monitor      Monitor services"
	@echo "  make ssl          Setup SSL certificates"

# Development commands
dev:
	@echo "🚀 Starting development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
	@echo "✅ Development environment started"
	@echo "🌐 App: http://localhost:3000"
	@echo "🗄️ MongoDB: localhost:27017"
	@echo "📊 Mongo Express: http://localhost:8081"

dev-down:
	@echo "🛑 Stopping development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

dev-logs:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml logs -f

# Production commands
build:
	@echo "📦 Building production images..."
	docker build -f Dockerfile.frontend -t crypto-app:latest .

prod: build
	@echo "🚀 Deploying production stack..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "✅ Production stack deployed"

prod-swarm: build
	@echo "🚀 Deploying to Docker Swarm..."
	./scripts/deploy-production.sh

prod-down:
	@echo "🛑 Stopping production stack..."
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Testing commands
test:
	@echo "🧪 Running tests..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml exec app npm test

test-build:
	@echo "🧪 Testing build locally..."
	npm ci
	npm run build

# Maintenance commands
backup:
	@echo "💾 Creating backup..."
	./scripts/monitor.sh backup

restore:
	@echo "📁 Restoring from backup..."
	./scripts/monitor.sh restore

clean:
	@echo "🧹 Cleaning up resources..."
	./scripts/monitor.sh cleanup

monitor:
	@echo "📊 Monitoring services..."
	./scripts/monitor.sh status

ssl:
	@echo "🔒 Setting up SSL certificates..."
	./scripts/setup-ssl.sh

# Quick commands
up: dev
down: dev-down
logs: dev-logs
status: monitor