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
      // For testing: use test endpoint that returns Basic Plan
      const response = await fetch('/api/test/basic-plan-test')
      if (!response.ok) {
        return getDefaultPlan() // Return free plan if error
      }
      const data = await response.json()
      return data.plan || getDefaultPlan()
    } catch (error) {
      console.error('Error fetching user plan:', error)
      return getDefaultPlan()
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
