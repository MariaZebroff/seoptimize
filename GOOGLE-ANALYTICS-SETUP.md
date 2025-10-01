# Google Analytics Setup Guide

This guide will help you set up Google Analytics tracking for your SEO Optimize app.

## Step 1: Create Google Analytics Account

1. Go to [Google Analytics](https://analytics.google.com/)
2. Sign in with your Google account
3. Click "Start measuring" or "Create Account"
4. Set up your property:
   - Account name: Your business name
   - Property name: SEO Optimize
   - Reporting time zone: Your timezone
   - Currency: Your preferred currency

## Step 2: Get Your Tracking ID

1. In your Google Analytics property, go to **Admin** (gear icon)
2. Under **Property**, click **Data Streams**
3. Click **Web** to add a web stream
4. Enter your website URL
5. Give your stream a name (e.g., "SEO Optimize Website")
6. Click **Create stream**
7. Copy your **Measurement ID** (starts with G-)

## Step 3: Add Environment Variable

Add your Google Analytics tracking ID to your `.env.local` file:

```env
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID from Google Analytics.

## Step 4: Verify Setup

1. Start your development server: `npm run dev`
2. Open your app in the browser
3. Open browser developer tools (F12)
4. Go to the **Network** tab
5. Look for requests to `googletagmanager.com` and `google-analytics.com`
6. In Google Analytics, go to **Reports** → **Realtime** to see live traffic

## Custom Event Tracking

The app includes custom event tracking for key user actions:

- **User Registration**: Tracks when users sign up
- **Audit Started**: Tracks when users start an SEO audit
- **Plan Upgrade**: Tracks when users upgrade to paid plans
- **Page Views**: Automatically tracks all page visits

## Privacy Considerations

- Google Analytics is only loaded in production (not in development)
- The tracking respects user privacy and follows GDPR guidelines
- Users can opt out using browser extensions or ad blockers

## Troubleshooting

### Analytics Not Working?
1. Check that `NEXT_PUBLIC_GA_ID` is set correctly in `.env.local`
2. Verify the tracking ID starts with `G-`
3. Make sure you're testing in production mode (`npm run build && npm start`)
4. Check browser console for any JavaScript errors

### No Data in Google Analytics?
- It can take 24-48 hours for data to appear in reports
- Use the **Realtime** report to see immediate traffic
- Check that your domain is properly configured in Google Analytics

## Advanced Configuration

For more advanced tracking, you can modify the `src/lib/gtag.ts` file to add custom events or modify the tracking configuration.
