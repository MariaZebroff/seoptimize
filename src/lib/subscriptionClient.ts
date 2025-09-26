import { Plan, getPlanById, getDefaultPlan } from './plans'

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'cancelled' | 'past_due' | 'incomplete'
  stripe_customer_id?: string
  stripe_subscription_id?: string
  current_period_start: string
  current_period_end: string
  created_at: string
  updated_at: string
}

export interface UserUsage {
  id: string
  user_id: string
  month: string // YYYY-MM format
  audits_used: number
  ai_calls_used: number
  created_at: string
  updated_at: string
}

export class SubscriptionClient {
  // Get user's current plan via API
  static async getUserPlan(): Promise<Plan> {
    try {
      // Check localStorage first for immediate response
      try {
        const paymentData = localStorage.getItem('pro_plan_payment')
        if (paymentData) {
          const payment = JSON.parse(paymentData)
          // Check if payment is recent (within last 24 hours)
          if ((payment.planId === 'pro' || payment.planId === 'basic') && 
              (Date.now() - payment.timestamp) < 24 * 60 * 60 * 1000) {
            console.log('SubscriptionClient: Found recent payment for plan:', payment.planId)
            const plan = getPlanById(payment.planId)!
            return plan
          }
        }
      } catch (error) {
        console.error('Error checking localStorage payment:', error)
      }

      // Check database for subscription
      console.log('SubscriptionClient: Fetching plan from database...')
      
      const response = await fetch('/api/subscription/plan')
      if (!response.ok) {
        console.log('SubscriptionClient: API error, using free plan')
        return getDefaultPlan()
      }
      
      const data = await response.json()
      const plan = data.plan || getDefaultPlan()
      console.log('SubscriptionClient: Database plan:', plan.name)
      
      // Update localStorage with database result and store user email in cookie
      try {
        if (plan.id !== 'free') {
          localStorage.setItem('pro_plan_payment', JSON.stringify({
            userId: 'current-user',
            planId: plan.id,
            timestamp: Date.now()
          }))
          console.log('SubscriptionClient: Cached database plan in localStorage')
          
          // Store user email in cookie for fallback (try multiple auth token keys)
          try {
            const possibleKeys = [
              'sb-rarheulwybeiltuvubid-auth-token',
              'supabase.auth.token',
              'sb-auth-token',
              'auth-token'
            ]
            
            let userEmail = null
            for (const key of possibleKeys) {
              const authToken = localStorage.getItem(key)
              if (authToken) {
                try {
                  const authData = JSON.parse(authToken)
                  if (authData.currentSession?.user?.email) {
                    userEmail = authData.currentSession.user.email
                    break
                  } else if (authData.user?.email) {
                    userEmail = authData.user.email
                    break
                  }
                } catch (parseError) {
                  // Continue to next key
                }
              }
            }
            
            if (userEmail) {
              document.cookie = `user-email=${userEmail}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
              console.log('SubscriptionClient: Stored user email in cookie for fallback:', userEmail)
            }
          } catch (cookieError) {
            console.log('SubscriptionClient: Could not store user email in cookie')
          }
        }
      } catch (error) {
        console.error('Error caching plan in localStorage:', error)
      }
      
      return plan
    } catch (error) {
      console.error('Error fetching user plan:', error)
      return getDefaultPlan()
    }
  }

  // Get user's subscription details via API
  static async getUserSubscription(userId?: string): Promise<UserSubscription | null> {
    try {
      console.log('SubscriptionClient: Fetching subscription details...')
      
      // Get user ID from localStorage if not provided
      let effectiveUserId = userId
      if (!effectiveUserId) {
        try {
          const paymentData = localStorage.getItem('pro_plan_payment')
          if (paymentData) {
            const payment = JSON.parse(paymentData)
            effectiveUserId = payment.userId
          }
        } catch (error) {
          console.error('Error getting userId from localStorage:', error)
        }
      }
      
      if (!effectiveUserId) {
        console.log('SubscriptionClient: No userId available')
        return null
      }
      
      const response = await fetch(`/api/subscription/details?userId=${effectiveUserId}`)
      console.log('SubscriptionClient: Response status:', response.status)
      if (!response.ok) {
        console.log('SubscriptionClient: Response not ok, returning null')
        return null
      }
      const data = await response.json()
      console.log('SubscriptionClient: Response data:', data)
      return data.subscription
    } catch (error) {
      console.error('Error fetching user subscription:', error)
      return null
    }
  }

  // Get user's usage for current month via API
  static async getUserUsage(): Promise<UserUsage> {
    try {
      const response = await fetch('/api/subscription/usage')
      if (!response.ok) {
        const currentMonth = new Date().toISOString().slice(0, 7)
        return {
          id: '',
          user_id: '',
          month: currentMonth,
          audits_used: 0,
          ai_calls_used: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
      const data = await response.json()
      return data.usage
    } catch (error) {
      console.error('Error fetching user usage:', error)
      const currentMonth = new Date().toISOString().slice(0, 7)
      return {
        id: '',
        user_id: '',
        month: currentMonth,
        audits_used: 0,
        ai_calls_used: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  }

  // Check if user can perform an audit via API
  static async canUserPerformAudit(): Promise<{
    canPerform: boolean
    reason?: string
    remainingAudits: number
  }> {
    try {
      // Check localStorage for recent payment first
      try {
        const paymentData = localStorage.getItem('pro_plan_payment')
        if (paymentData) {
          const payment = JSON.parse(paymentData)
          // Check if payment is recent (within last 24 hours)
          if ((payment.planId === 'pro' || payment.planId === 'basic') && 
              (Date.now() - payment.timestamp) < 24 * 60 * 60 * 1000) {
            console.log('SubscriptionClient: Found recent payment for plan:', payment.planId, 'allowing audits')
            return {
              canPerform: true,
              remainingAudits: payment.planId === 'pro' ? -1 : 2 // Pro = unlimited, Basic = 2 per day
            }
          }
        }
      } catch (error) {
        console.error('Error checking localStorage payment:', error)
      }

      const response = await fetch('/api/subscription/audit-check')
      if (!response.ok) {
        return {
          canPerform: false,
          reason: 'Unable to check audit limits',
          remainingAudits: 0
        }
      }
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error checking audit limits:', error)
      return {
        canPerform: false,
        reason: 'Error checking audit limits',
        remainingAudits: 0
      }
    }
  }
}
