@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting production deployment...

REM Check if Docker Swarm is initialized
docker info --format "{{.Swarm.LocalNodeState}}" | findstr "active" >nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Docker Swarm is not initialized. Run 'docker swarm init' first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo ❌ .env file not found! Please create it from .env.example
    pause
    exit /b 1
)

REM Build production images
echo 📦 Building production images...
docker build -f Dockerfile.frontend -t crypto-app:latest .

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

REM Create configs and secrets
echo 🔧 Setting up configs and secrets...

REM Create nginx config
docker config create nginx_config nginx.prod.conf 2>nul || echo Config nginx_config already exists

REM Create SSL secrets (if certificates exist)
if exist ssl\cert.pem (
    if exist ssl\key.pem (
        docker secret create ssl_cert ssl\cert.pem 2>nul || echo Secret ssl_cert already exists
        docker secret create ssl_key ssl\key.pem 2>nul || echo Secret ssl_key already exists
    ) else (
        echo ⚠️ SSL certificates not found. HTTPS will not be available.
    )
) else (
    echo ⚠️ SSL certificates not found. HTTPS will not be available.
)

REM Deploy stack
echo 🚀 Deploying stack...
docker stack deploy -c docker-stack.yml crypto-stack

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Stack deployment failed!
    pause
    exit /b 1
)

REM Wait for services to be ready
echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Check service status
echo 🔍 Checking service status...
docker stack services crypto-stack

REM Show service logs
echo 📋 Recent logs:
docker service logs --tail=20 crypto-stack_app

echo ✅ Production deployment completed!
echo 🌐 Application should be available at your configured domain
echo.
echo 📊 Monitor with: docker stack services crypto-stack
echo 📋 View logs: docker service logs -f crypto-stack_app
echo 🛑 Remove stack: docker stack rm crypto-stack
pause