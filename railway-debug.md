# Railway Deployment Debug Guide

## 🚨 Current Issue: Health Check Timeout (35+ minutes)

### Immediate Actions:

1. **Cancel the current deployment** in Railway dashboard
2. **Check Railway logs** for startup errors
3. **Verify environment variables** are set correctly

### Common Causes:

1. **Missing Environment Variables**
2. **Application not starting properly**
3. **Port binding issues**
4. **Chrome/Chromium installation problems**

## 🔧 Quick Fixes:

### 1. Check Railway Logs

Look for these error patterns:
```
❌ Error: Cannot find module
❌ EADDRINUSE: address already in use
❌ Chrome executable not found
❌ Database connection failed
```

### 2. Verify Environment Variables

Required variables in Railway dashboard:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ENABLE_LIGHTHOUSE=true
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### 3. Test Health Check Endpoint

The new health check endpoint should respond at:
```
GET /api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "api": "ok",
    "database": "ok",
    "lighthouse": "enabled"
  }
}
```

## 🚀 Deployment Steps:

1. **Commit and push** the latest changes
2. **Redeploy** on Railway
3. **Monitor logs** during startup
4. **Test health check** once deployed

## 🔍 Debugging Commands:

### Check if app is running:
```bash
curl https://your-app.railway.app/api/health
```

### Check if main page loads:
```bash
curl https://your-app.railway.app/
```

### Test audit endpoint:
```bash
curl -X POST https://your-app.railway.app/api/audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

## 🚨 Emergency Fallback:

If Dockerfile continues to fail, revert to Nixpacks:

1. **Change `railway.json`** to:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "chmod +x install-chrome.sh && ./install-chrome.sh && npm ci && npm run build"
  }
}
```

2. **Set environment variable**:
```bash
CHROME_PATH=/usr/bin/google-chrome-stable
```

## 📊 Expected Startup Logs:

```
🚀 Starting SEO Optimize application...
🔍 Checking environment variables...
✅ Chromium found at /usr/bin/chromium-browser
🚀 Starting Next.js application...
✓ Ready in 2.3s
```

## 🎯 Success Indicators:

- Health check responds within 60 seconds
- Application logs show "Ready in X.Xs"
- No Chrome/Chromium errors
- All environment variables are set
- Database connection successful
