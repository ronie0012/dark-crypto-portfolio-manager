@echo off
echo 🚀 Building Docker images for crypto portfolio app...

REM Build main application image
echo 📦 Building application image...
docker build -f Dockerfile.frontend -t crypto-app:latest .

REM Pull MongoDB image
echo 📦 Pulling MongoDB image...
docker pull mongo:7.0

REM Pull Nginx image
echo 📦 Pulling Nginx image...
docker pull nginx:alpine

echo ✅ All images built successfully!

REM Optional: Push to registry
set /p push="Do you want to push images to Docker registry? (y/n): "
if /i "%push%"=="y" (
    echo 🚀 Pushing images to registry...
    
    REM Tag images for registry (replace with your registry URL)
    set REGISTRY_URL=your-registry.com
    
    docker tag crypto-app:latest %REGISTRY_URL%/crypto-app:latest
    docker push %REGISTRY_URL%/crypto-app:latest
    
    echo ✅ Images pushed to registry!
)

echo 🎉 Build process completed!
echo Run 'docker-compose up -d' to start the application
pause