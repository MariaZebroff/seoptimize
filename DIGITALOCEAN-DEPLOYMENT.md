# 🚀 Deploy to DigitalOcean App Platform - Complete Guide

## Why DigitalOcean App Platform?

Your SEO Optimize app uses Puppeteer, Chrome, and Lighthouse which require:
- ✅ Long execution times (30-90 seconds)
- ✅ Significant memory and CPU resources
- ✅ Full Chrome browser installation
- ✅ No timeout restrictions

DigitalOcean App Platform provides all of this for just **$5/month**.

## 📋 Prerequisites

- ✅ Your app works locally
- ✅ GitHub repository with your code
- ✅ DigitalOcean account (free to create)
- ✅ Supabase project configured

## 🎯 Step 1: Prepare Your App for DigitalOcean

### 1.1 Update package.json for Production

Ensure your `package.json` has the correct build scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

### 1.2 Create .do/app.yaml Configuration

Create a `.do/app.yaml` file in your project root:

```yaml
name: seoptimize
services:
- name: web
  source_dir: /
  github:
    repo: yourusername/seoptimize
    branch: main
  run_command: npm start
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 3000
  routes:
  - path: /
  envs:
  - key: NODE_ENV
    value: production
  - key: NEXT_PUBLIC_SUPABASE_URL
    value: your-supabase-url
  - key: NEXT_PUBLIC_SUPABASE_ANON_KEY
    value: your-supabase-anon-key
```

### 1.3 Update next.config.ts for DigitalOcean

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['puppeteer'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('puppeteer');
    }
    return config;
  },
  // DigitalOcean specific optimizations
  output: 'standalone',
  experimental: {
    outputFileTracingRoot: undefined,
  }
};

export default nextConfig;
```

## 🎯 Step 2: Set Up DigitalOcean Account

### 2.1 Create DigitalOcean Account
1. Go to [digitalocean.com](https://digitalocean.com)
2. Sign up for a free account
3. Add a payment method (required for App Platform)

### 2.2 Connect GitHub
1. In DigitalOcean dashboard, go to **Apps**
2. Click **Create App**
3. Connect your GitHub account
4. Select your `seoptimize` repository

## 🎯 Step 3: Configure Your App

### 3.1 App Configuration
1. **App Name**: `seoptimize`
2. **Region**: Choose closest to your users
3. **Source**: GitHub repository
4. **Branch**: `main`

### 3.2 Service Configuration
1. **Type**: Web Service
2. **Build Command**: `npm run build`
3. **Run Command**: `npm start`
4. **HTTP Port**: `3000`
5. **Instance Size**: Basic XXS ($5/month)

### 3.3 Environment Variables
Add these environment variables in the DigitalOcean dashboard:

```
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🎯 Step 4: Deploy Your App

### 4.1 Initial Deployment
1. Click **Create Resources**
2. Wait for the build process (5-10 minutes)
3. Your app will be available at `https://your-app-name.ondigitalocean.app`

### 4.2 Verify Deployment
1. Visit your app URL
2. Test the authentication flow
3. Run a test audit to ensure Chrome/Puppeteer works

## 🎯 Step 5: Update Supabase Configuration

### 5.1 Update Site URL
1. Go to Supabase dashboard → **Settings** → **General**
2. Update **Site URL** to: `https://your-app-name.ondigitalocean.app`
3. Add **Additional Redirect URLs**:
   ```
   https://your-app-name.ondigitalocean.app/**
   ```

### 5.2 Update Google OAuth (if using)
1. In Supabase → **Authentication** → **Providers** → **Google**
2. Update **Redirect URL** to: `https://your-app-name.ondigitalocean.app/auth/callback`

## 🎯 Step 6: Optimize for Production

### 6.1 Enable HTTPS
DigitalOcean App Platform automatically provides HTTPS certificates.

### 6.2 Set Up Custom Domain (Optional)
1. In DigitalOcean dashboard → **Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update Supabase settings with your custom domain

### 6.3 Monitor Performance
1. Use DigitalOcean's built-in monitoring
2. Set up alerts for high CPU/memory usage
3. Monitor audit execution times

## 🔧 Troubleshooting

### Common Issues:

**1. Build Failures**
- Check that all dependencies are in `package.json`
- Ensure build command is correct
- Check DigitalOcean build logs

**2. Chrome/Puppeteer Issues**
- Verify Chrome is installed in the container
- Check memory limits (upgrade to larger instance if needed)
- Review audit timeout settings

**3. Environment Variables**
- Ensure all required variables are set
- Check variable names match exactly
- Redeploy after adding variables

**4. Performance Issues**
- Monitor CPU and memory usage
- Consider upgrading to larger instance
- Optimize audit timeout settings

## 💰 Cost Breakdown

- **Basic XXS**: $5/month
  - 512MB RAM
  - 1 vCPU
  - 1GB SSD storage
  - 1TB bandwidth

- **Basic XS**: $12/month (if you need more resources)
  - 1GB RAM
  - 1 vCPU
  - 2GB SSD storage
  - 2TB bandwidth

## 🎉 Success!

Your SEO Optimize app is now running on DigitalOcean App Platform with full Chrome and Lighthouse support!

**Your app URL**: `https://your-app-name.ondigitalocean.app`

### Next Steps:
- Monitor performance and usage
- Set up custom domain if desired
- Configure automated backups
- Add monitoring and alerts

## 📚 Additional Resources

- [DigitalOcean App Platform Documentation](https://docs.digitalocean.com/products/app-platform/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Puppeteer Deployment Best Practices](https://pptr.dev/guides/deployment)
