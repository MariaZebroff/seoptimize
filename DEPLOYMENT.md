# 🚀 Deploy to Vercel - Step by Step Guide

Deploy your SEO Optimize app to Vercel for free with automatic deployments.

## 📋 Prerequisites

- ✅ Your app is working locally
- ✅ You have a GitHub account
- ✅ Your code is pushed to GitHub
- ✅ Your Supabase project is set up

## 🎯 Step 1: Prepare Your Code for Production

### 1.1 Update Environment Variables for Production

Create a `.env.production` file (optional, for reference):
```env
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-supabase-anon-key
```

### 1.2 Update Supabase Settings for Production

1. Go to your Supabase dashboard
2. Go to **Settings** → **API**
3. Copy your **Project URL** and **anon key** (same as development)
4. These will be used in Vercel environment variables

### 1.3 Update Google OAuth for Production (if using)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Edit your OAuth 2.0 Client ID
3. Add these **Authorized redirect URIs**:
   ```
   https://your-app-name.vercel.app/auth/callback
   https://your-app-name.vercel.app/api/auth/callback/google
   ```
4. Update Supabase Google OAuth settings with the new redirect URI

## 🎯 Step 2: Push Code to GitHub

### 2.1 Initialize Git (if not already done)
```bash
git init
git add .
git commit -m "Initial commit with authentication and site management"
```

### 2.2 Create GitHub Repository
1. Go to [GitHub](https://github.com)
2. Click **"New repository"**
3. Name it `seoptimize` (or your preferred name)
4. Make it **Public** (required for free Vercel)
5. Click **"Create repository"**

### 2.3 Push Code to GitHub
```bash
git remote add origin https://github.com/yourusername/seoptimize.git
git branch -M main
git push -u origin main
```

## 🎯 Step 3: Deploy to Vercel

### 3.1 Sign Up for Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

### 3.2 Import Your Project
1. In Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find your `seoptimize` repository
3. Click **"Import"**

### 3.3 Configure Project Settings
1. **Project Name**: `seoptimize` (or your choice)
2. **Framework Preset**: Next.js (should auto-detect)
3. **Root Directory**: `./` (default)
4. Click **"Deploy"**

## 🎯 Step 4: Set Environment Variables

### 4.1 Add Environment Variables in Vercel
1. Go to your project dashboard in Vercel
2. Click **"Settings"** tab
3. Click **"Environment Variables"** in sidebar
4. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL
Value: your-supabase-project-url
Environment: Production, Preview, Development

NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: your-supabase-anon-key
Environment: Production, Preview, Development
```

### 4.2 Redeploy After Adding Variables
1. Go to **"Deployments"** tab
2. Click the **"..."** menu on latest deployment
3. Click **"Redeploy"**

## 🎯 Step 5: Update Supabase for Production

### 5.1 Update Site URL in Supabase
1. Go to Supabase dashboard → **Settings** → **General**
2. Update **Site URL** to: `https://your-app-name.vercel.app`
3. Add **Additional Redirect URLs**:
   ```
   https://your-app-name.vercel.app/**
   ```

### 5.2 Update Google OAuth (if using)
1. In Supabase → **Authentication** → **Providers** → **Google**
2. Update **Redirect URL** to: `https://your-app-name.vercel.app/auth/callback`

## 🎯 Step 6: Test Your Deployment

### 6.1 Visit Your Live App
1. Go to `https://your-app-name.vercel.app`
2. Test the authentication flow
3. Test adding sites to your dashboard

### 6.2 Verify Everything Works
- ✅ Home page loads
- ✅ Sign up/Sign in works
- ✅ Dashboard loads for authenticated users
- ✅ Site management works
- ✅ Google OAuth works (if configured)

## 🎯 Step 7: Set Up Custom Domain (Optional)

### 7.1 Add Custom Domain
1. In Vercel dashboard → **Settings** → **Domains**
2. Add your domain (e.g., `seoptimize.com`)
3. Follow DNS configuration instructions

### 7.2 Update Supabase for Custom Domain
1. Update **Site URL** in Supabase to your custom domain
2. Update **Redirect URLs** to include your custom domain

## 🔧 Troubleshooting

### Common Issues:

**1. Environment Variables Not Working**
- Make sure you added them in Vercel dashboard
- Redeploy after adding variables
- Check variable names match exactly

**2. Authentication Not Working**
- Verify Supabase Site URL is correct
- Check redirect URLs in Supabase
- Ensure environment variables are set

**3. Google OAuth Not Working**
- Update Google Cloud Console with Vercel URL
- Update Supabase Google OAuth settings
- Check redirect URI matches exactly

**4. Database Connection Issues**
- Verify Supabase URL and keys are correct
- Check RLS policies are set up
- Ensure database schema is applied

## 🎉 Success!

Your SEO Optimize app is now live on Vercel! 

**Your app URL**: `https://your-app-name.vercel.app`

### Next Steps:
- Set up monitoring and analytics
- Configure custom domain
- Set up automated backups
- Add more SEO features

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Production Guide](https://supabase.com/docs/guides/platform/going-into-prod)
