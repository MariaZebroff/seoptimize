# Stripe Setup Guide

## Environment Variables Setup

Create a `.env.local` file in your project root with the following variables:

```bash
# Stripe Configuration
# Get these from your Stripe Dashboard: https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Stripe Webhook Secret (we'll set this up later)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Your app URL (for webhooks and redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## How to Get Your Stripe Keys:

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Click "Developers" → "API keys"
3. Copy your:
   - **Publishable key** (starts with `pk_test_`)
   - **Secret key** (starts with `sk_test_`)

## Important Security Notes:

- ✅ **Publishable key**: Safe to use in client-side code
- ❌ **Secret key**: NEVER expose in client-side code, only use in server-side API routes
- 🔒 Keep your secret key secure and never commit it to version control

## Test Mode vs Live Mode:

- **Test Mode**: Use `pk_test_` and `sk_test_` keys for development
- **Live Mode**: Use `pk_live_` and `sk_live_` keys for production (only after testing thoroughly)

## Testing Your Integration

### Test Cards (Test Mode Only)

Use these test card numbers to test different scenarios:

| Card Number | Description |
|-------------|-------------|
| `4242424242424242` | Visa - Successful payment |
| `4000000000000002` | Visa - Declined (generic decline) |
| `4000000000009995` | Visa - Insufficient funds |
| `4000000000009987` | Visa - Lost card |
| `4000000000009979` | Visa - Stolen card |
| `4000000000000069` | Visa - Expired card |
| `4000000000000127` | Visa - Incorrect CVC |
| `4000000000000119` | Visa - Processing error |

### Test Details:
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### Testing Steps:

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Visit the pricing page**:
   ```
   http://localhost:3000/pricing
   ```

3. **Test a payment**:
   - Select a plan
   - Use test card `4242424242424242`
   - Complete the payment

4. **Check the results**:
   - Payment should succeed
   - You should be redirected to success page
   - Check your Stripe Dashboard for the test payment

## Setting Up Webhooks (For Production)

1. **Install Stripe CLI** (for local testing):
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe
   
   # Or download from: https://github.com/stripe/stripe-cli/releases
   ```

2. **Login to Stripe CLI**:
   ```bash
   stripe login
   ```

3. **Forward webhooks to your local server**:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. **Copy the webhook secret** from the CLI output and add it to your `.env.local`

5. **For production**, create a webhook endpoint in your Stripe Dashboard:
   - Go to "Developers" → "Webhooks"
   - Add endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Select events: `payment_intent.succeeded`, `checkout.session.completed`, etc.
   - Copy the webhook secret to your production environment

## Features Implemented:

✅ **Payment Forms**: Secure card input with Stripe Elements
✅ **API Routes**: Payment intent creation and status checking
✅ **Pricing Plans**: Beautiful pricing page with plan selection
✅ **Success/Cancel Pages**: User-friendly payment result pages
✅ **Webhook Handling**: Server-side event processing
✅ **Error Handling**: Comprehensive error management
✅ **Test Mode**: Full testing capabilities with test cards

## Next Steps:

1. **Set up your environment variables** with your Stripe keys
2. **Test the integration** using the test cards above
3. **Customize the pricing plans** to match your business model
4. **Set up webhooks** for production
5. **Add user management** to track subscriptions
6. **Implement premium features** based on subscription status
