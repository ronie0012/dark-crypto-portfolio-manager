@echo off
echo 🧪 Testing Next.js build locally...

echo 📦 Installing dependencies...
npm ci

echo 🏗️ Building application...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful! Ready for Docker deployment.
    echo 🐳 Run 'docker-compose up --build -d' to deploy
) else (
    echo ❌ Build failed. Please fix the errors above before deploying.
    echo 🔍 Check the error messages and fix any TypeScript or build issues.
)

pause