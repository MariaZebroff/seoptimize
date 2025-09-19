# Railway Deployment Guide for SEO Optimize

## 🚀 Lighthouse Chrome Fix for Railway

This guide will help you deploy SEO Optimize to Railway with working Lighthouse audits.

## 📋 Prerequisites

1. Railway account
2. Supabase project
3. Environment variables configured

## 🔧 Deployment Steps

### 1. Railway Configuration

The project now uses **Dockerfile** deployment for better Chrome/Chromium support:

- **`railway.json`** - Configured to use Dockerfile builder
- **`Dockerfile`** - Alpine-based image with Chromium pre-installed
- **`.dockerignore`** - Optimized build context

### 2. Environment Variables

Set these in your Railway project settings:

```bash
# Enable Lighthouse audits
ENABLE_LIGHTHOUSE=true

# Chrome/Chromium path (automatically set by Dockerfile)
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Next.js Configuration
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=your_nextauth_secret
```

### 3. Deploy to Railway

1. **Connect your GitHub repository** to Railway
2. **Railway will automatically detect** the Dockerfile
3. **Set environment variables** in Railway dashboard
4. **Deploy** - Railway will build using the Dockerfile

## 🐳 Dockerfile Details

The Dockerfile includes:

- **Multi-stage build** for optimized production image
- **Node.js 18 Alpine** base image
- **Chromium browser** pre-installed
- **All required dependencies** for Lighthouse
- **TailwindCSS and devDependencies** for build process
- **Production-only dependencies** in final image
- **Non-root user** for security

## 🔍 Chrome Path Detection

The application now checks these paths in order:

1. `process.env.CHROME_PATH`
2. `process.env.PUPPETEER_EXECUTABLE_PATH` (set by Dockerfile)
3. `/usr/bin/chromium-browser` (Alpine default)
4. `/usr/bin/chromium`
5. `/usr/bin/google-chrome-stable`
6. And other common paths...

## 🧪 Testing the Build

### Local Docker Test (Optional)

Test the Dockerfile locally before deploying:

```bash
# Make the test script executable
chmod +x test-docker-build.sh

# Run the test
./test-docker-build.sh
```

This will:
- Build the Docker image
- Test if it starts correctly
- Verify the application responds
- Clean up test containers

### Testing Lighthouse in Production

After deployment, test with:

```bash
curl -X POST https://your-app.railway.app/api/audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

Look for these success indicators in logs:

```
✅ Chrome launched on port: [port]
✅ Lighthouse audit completed successfully!
📊 Scores: Performance: [score], Accessibility: [score], etc.
```

## 🚨 Troubleshooting

### Chrome Not Found Error

If you still see "Chrome executable not found":

1. **Check Railway logs** during build
2. **Verify environment variables** are set
3. **Ensure Dockerfile** is being used (not Nixpacks)

### Build Failures

1. **Check Dockerfile syntax**
2. **Verify all dependencies** are available
3. **Check Railway build logs** for specific errors

### Lighthouse Timeouts

1. **Increase timeout** in Railway settings
2. **Check memory limits** (Lighthouse needs ~1GB)
3. **Verify network connectivity** from Railway

## 📊 Expected Results

After successful deployment:

- ✅ **Lighthouse audits work** in production
- ✅ **Real performance scores** (not static fallbacks)
- ✅ **All SEO analysis features** functional
- ✅ **PDF/HTML reports** generate correctly

## 🔄 Alternative: Nixpacks + Chrome Script

If Dockerfile doesn't work, you can revert to Nixpacks:

1. **Change `railway.json`** back to:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "chmod +x install-chrome.sh && ./install-chrome.sh && npm ci && npm run build"
  }
}
```

2. **Use the improved `install-chrome.sh`** script
3. **Set `CHROME_PATH=/usr/bin/google-chrome-stable`** environment variable

## 🎯 Success Indicators

You'll know it's working when you see:

```
🚀 PRODUCTION: Starting MANDATORY Lighthouse audit...
✅ Chrome launched on port: [port]
✅ Lighthouse audit completed successfully!
📊 Raw Lighthouse results structure:
   Performance score: [real score]
   Accessibility score: [real score]
   Best Practices score: [real score]
   SEO score: [real score]
```

Instead of:

```
❌ Lighthouse error: Chrome executable not found
⚠️ Using ENHANCED STATIC scores (Lighthouse failed)
```

## 📞 Support

If you encounter issues:

1. **Check Railway build logs** first
2. **Verify environment variables** are set correctly
3. **Test locally** with Docker to ensure Dockerfile works
4. **Check Railway documentation** for platform-specific issues

---

**🎉 With this setup, your Lighthouse audits should work perfectly on Railway!**
