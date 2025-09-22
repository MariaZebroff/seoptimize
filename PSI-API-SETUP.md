# 🔑 PageSpeed Insights API Setup Guide

## Why PageSpeed Insights API?

Your app now uses Google's official PageSpeed Insights API instead of running Chrome locally. This provides:

✅ **Official Lighthouse Scores**: Real Google Lighthouse data  
✅ **No Chrome Installation**: No need for headless browsers  
✅ **Reliable Performance**: Google's infrastructure  
✅ **Easy Deployment**: Works on any hosting platform  
✅ **Cost Effective**: Free tier with generous limits  

## 🎯 Step 1: Get Your API Key

### 1.1 Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing one

### 1.2 Enable PageSpeed Insights API
1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "PageSpeed Insights API"
3. Click on **PageSpeed Insights API**
4. Click **Enable**

### 1.3 Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy your API key (it will look like: `AIzaSyB...`)
4. **Important**: Restrict your API key for security:
   - Click on your API key
   - Under **Application restrictions**, select **HTTP referrers**
   - Add your domain(s): `https://yourdomain.com/*`
   - Under **API restrictions**, select **Restrict key**
   - Choose **PageSpeed Insights API**

## 🎯 Step 2: Set Up Environment Variables

### 2.1 Local Development (.env.local)
Create a `.env.local` file in your project root:

```env
PAGESPEED_INSIGHTS_API_KEY=your-api-key-here
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2.2 Production Environment
Add the environment variable to your hosting platform:

**Vercel:**
1. Go to your project dashboard
2. Settings → Environment Variables
3. Add: `PAGESPEED_INSIGHTS_API_KEY` = `your-api-key-here`

**DigitalOcean App Platform:**
1. Go to your app dashboard
2. Settings → Environment Variables
3. Add: `PAGESPEED_INSIGHTS_API_KEY` = `your-api-key-here`

**Railway:**
1. Go to your project dashboard
2. Variables tab
3. Add: `PAGESPEED_INSIGHTS_API_KEY` = `your-api-key-here`

## 🎯 Step 3: Test Your Setup

### 3.1 Test Locally
```bash
# Start your development server
npm run dev

# Test an audit
curl -X POST http://localhost:3000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### 3.2 Verify API Key Works
You can test your API key directly:

```bash
curl "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://example.com&key=YOUR_API_KEY"
```

## 🔧 Troubleshooting

### Common Issues:

**1. "API key not found" Error**
- Make sure `PAGESPEED_INSIGHTS_API_KEY` is set in your environment
- Check the variable name is exactly correct
- Restart your development server after adding the variable

**2. "API key not valid" Error**
- Verify your API key is correct
- Check that PageSpeed Insights API is enabled in Google Cloud Console
- Ensure your API key restrictions allow your domain

**3. "Quota exceeded" Error**
- You've hit the free tier limit (25,000 requests/day)
- Consider upgrading to a paid plan in Google Cloud Console
- Implement request caching to reduce API calls

**4. "Request failed" Error**
- Check your internet connection
- Verify the URL you're testing is accessible
- Some URLs may be blocked by Google's crawler

## 💰 API Pricing

### Free Tier
- **25,000 requests per day**
- **100 requests per 100 seconds**
- Perfect for most applications

### Paid Tier
- **$5 per 1,000 requests** after free tier
- **$0.50 per 1,000 requests** for high-volume users
- Contact Google for enterprise pricing

## 🚀 Benefits of This Approach

### ✅ **Reliability**
- No Chrome installation issues
- No memory/CPU constraints
- Google's infrastructure handles the heavy lifting

### ✅ **Performance**
- Faster than running Chrome locally
- Consistent results
- No browser crashes or timeouts

### ✅ **Deployment**
- Works on any hosting platform
- No special server requirements
- Easy to scale

### ✅ **Maintenance**
- No browser updates to manage
- No Puppeteer version conflicts
- Google handles Lighthouse updates

## 📊 What You Get

Your app now provides:

1. **Official Lighthouse Scores** (Performance, Accessibility, SEO, Best Practices)
2. **Core Web Vitals** (FCP, LCP, CLS, FID)
3. **Detailed Audit Results** with recommendations
4. **Mobile and Desktop Scores**
5. **Real-time Performance Data**

## 🎉 Success!

Your SEO Optimize app is now powered by Google's official PageSpeed Insights API!

### Next Steps:
- Test your app with the new PSI integration
- Deploy to your chosen hosting platform
- Monitor your API usage in Google Cloud Console
- Set up alerts for quota limits

## 📚 Additional Resources

- [PageSpeed Insights API Documentation](https://developers.google.com/speed/docs/insights/v5/get-started)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
