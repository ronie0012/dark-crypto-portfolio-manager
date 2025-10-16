# 🚀 Vercel Deployment Fix Guide

## Issue
Vercel build failing with error: `"broadcastMessage" is not a valid Route export field` in SSE route.

## ✅ Solution Steps

### 1. Clear Vercel Cache
In your Vercel dashboard:
- Go to your project settings
- Navigate to "Functions" tab
- Click "Clear Cache" or redeploy with cache cleared

### 2. Force Fresh Deployment
```bash
# Option A: Push a small change to trigger rebuild
git add .
git commit -m "fix: force vercel rebuild"
git push

# Option B: Redeploy from Vercel dashboard
# Go to Deployments → Click "Redeploy" on latest deployment
```

### 3. Verify File Structure
Ensure these files are correct in your repository:

**src/app/api/chat/sse/route.ts** - Should ONLY export GET function:
```typescript
import { NextRequest } from "next/server";
import { sseClients, broadcastUserCount } from "@/lib/sse-utils";

export async function GET(request: NextRequest) {
  // ... implementation
}
```

**src/lib/sse-utils.ts** - Contains the utility functions:
```typescript
export function broadcastMessage(message: any) {
  // ... implementation
}

export function broadcastUserCount() {
  // ... implementation
}
```

### 4. Environment Variables
Ensure these are set in Vercel:
```
TURSO_CONNECTION_URL=your_turso_url
TURSO_AUTH_TOKEN=your_turso_token
BETTER_AUTH_SECRET=your_auth_secret
COINGECKO_API_KEY=your_coingecko_key
SKIP_ENV_VALIDATION=1
```

### 5. Build Configuration
Add to your `package.json` if not present:
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start"
  }
}
```

### 6. Vercel Configuration (Optional)
Create `vercel.json` in root:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

## 🔍 Debugging Steps

### Check Current File Content
1. Go to your GitHub repository
2. Navigate to `src/app/api/chat/sse/route.ts`
3. Verify it only has the GET export (no broadcastMessage export)

### Local Build Test
```bash
# Test build locally
npm run build

# If it fails locally, the issue is in your code
# If it passes locally but fails on Vercel, it's a cache issue
```

### Vercel Logs
1. Go to Vercel dashboard
2. Click on failed deployment
3. Check "Build Logs" for detailed error information

## 🚨 Common Issues

### Issue 1: Old File Version
**Problem**: Vercel is using cached/old version of the file
**Solution**: Force redeploy or clear cache

### Issue 2: Git Not Updated
**Problem**: Changes not pushed to repository
**Solution**: 
```bash
git add src/app/api/chat/sse/route.ts
git add src/lib/sse-utils.ts
git commit -m "fix: remove invalid exports from SSE route"
git push
```

### Issue 3: TypeScript Strict Mode
**Problem**: Vercel using stricter TypeScript settings
**Solution**: Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": false,
    "skipLibCheck": true
  }
}
```

## ✅ Expected Result
After applying these fixes, your Vercel build should succeed with:
- ✅ TypeScript compilation passes
- ✅ All API routes properly exported
- ✅ SSE functionality working
- ✅ Application deploys successfully

## 📞 If Still Failing
1. Check Vercel build logs for exact error
2. Compare local vs deployed file content
3. Try deploying from a fresh branch
4. Contact Vercel support if cache issues persist