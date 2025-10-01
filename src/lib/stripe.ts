import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// Client-side Stripe instance
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
}

// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  secretKey: process.env.STRIPE_SECRET_KEY!,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
}

// Validate Stripe configuration
export const validateStripeConfig = () => {
  const missing = []
  
  if (!STRIPE_CONFIG.publishableKey) missing.push('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY')
  if (!STRIPE_CONFIG.secretKey) missing.push('STRIPE_SECRET_KEY')
  
  if (missing.length > 0) {
    throw new Error(`Missing Stripe environment variables: ${missing.join(', ')}`)
  }
  
  return true
}




