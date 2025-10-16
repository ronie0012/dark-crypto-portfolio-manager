@echo off
echo 🚀 Deploying crypto portfolio application...

REM Check if .env file exists
if not exist .env (
    echo ❌ .env file not found! Please create it with required environment variables.
    pause
    exit /b 1
)

REM Create necessary directories
if not exist ssl mkdir ssl
if not exist mongo-init mkdir mongo-init

REM Stop existing containers
echo 🛑 Stopping existing containers...
docker-compose down

REM Remove old images (optional)
set /p cleanup="Do you want to remove old images? (y/n): "
if /i "%cleanup%"=="y" (
    echo 🗑️ Removing old images...
    docker image prune -f
)

REM Build and start services
echo 🏗️ Building and starting services...
docker-compose up --build -d

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak

REM Check service health
echo 🔍 Checking service health...
docker-compose ps

REM Show logs
echo 📋 Recent logs:
docker-compose logs --tail=20

echo ✅ Deployment completed!
echo 🌐 Application: http://localhost:3000
echo 🗄️ MongoDB: localhost:27017
echo 🌍 Nginx Proxy: http://localhost

echo.
echo 📊 To view logs: docker-compose logs -f [service-name]
echo 🛑 To stop: docker-compose down
echo 🔄 To restart: docker-compose restart [service-name]
pause