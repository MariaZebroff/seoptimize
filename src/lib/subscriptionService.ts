import { createClient } from '@supabase/supabase-js'
import { Plan, getPlanById, getDefaultPlan } from './plans'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

export class SubscriptionService {
  // Get user's current subscription
  static async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      console.log('SubscriptionService: Fetching subscription for user:', userId)
      
      // First try to get any subscription (not just active)
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .single()

      console.log('SubscriptionService: Query result:', { data, error })

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('SubscriptionService: No subscription found for user')
          return null
        }
        console.error('Error fetching user subscription:', error)
        return null
      }

      console.log('SubscriptionService: Found subscription:', data)
      return data
    } catch (error) {
      console.error('Error accessing user_subscriptions table:', error)
      return null // Return null if table doesn't exist
    }
  }

  // Get user's current plan
  static async getUserPlan(userId: string): Promise<Plan> {
    try {
      console.log('SubscriptionService: Getting plan for user:', userId)
      
      // First try to get the most recent subscription
      const subscription = await this.getUserSubscription(userId)
      
      if (subscription) {
        console.log('SubscriptionService: Found subscription:', subscription.plan_id, 'status:', subscription.status)
        const plan = getPlanById(subscription.plan_id)
        if (plan) {
          console.log('SubscriptionService: Returning plan:', plan.name)
          return plan
        }
      }

      // If no subscription found, check for any active subscription
      console.log('SubscriptionService: No subscription found, checking for active subscriptions...')
      try {
        const { data: activeSubscription, error } = await supabase
          .from('user_subscriptions')
          .select('plan_id, status')
          .eq('user_id', userId)
          .eq('status', 'active')
          .single()

        if (!error && activeSubscription) {
          console.log('SubscriptionService: Found active subscription for user:', userId, 'plan:', activeSubscription.plan_id)
          const plan = getPlanById(activeSubscription.plan_id)
          if (plan) {
            console.log('SubscriptionService: Returning active plan:', plan.name)
            return plan
          }
        }
      } catch (error) {
        console.error('SubscriptionService: Error checking for active subscription:', error)
      }

      // No subscription found, return Free Plan
      console.log('SubscriptionService: No subscription found for user:', userId, '- returning Free Plan')
      return getDefaultPlan()
    } catch (error) {
      console.error('SubscriptionService: Error getting user plan:', error)
      return getDefaultPlan()
    }
  }

  // Get user's usage for current month
  static async getUserUsage(userId: string): Promise<UserUsage> {
    const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM format

    try {
      const { data, error } = await supabase
        .from('user_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('month', currentMonth)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user usage:', error)
        return {
          id: '',
          user_id: userId,
          month: currentMonth,
          audits_used: 0,
          ai_calls_used: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }

      return data || {
        id: '',
        user_id: userId,
        month: currentMonth,
        audits_used: 0,
        ai_calls_used: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error accessing user_usage table:', error)
      return {
        id: '',
        user_id: userId,
        month: currentMonth,
        audits_used: 0,
        ai_calls_used: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  }

  // Check if user can perform an audit (with optional page URL for page-specific limits)
  static async canUserPerformAudit(userId: string, pageUrl?: string): Promise<{
    canPerform: boolean
    reason?: string
    remainingAudits: number
  }> {
    const [plan, usage] = await Promise.all([
      this.getUserPlan(userId),
      this.getUserUsage(userId)
    ])

    // For Basic Plan, check page-specific limits if pageUrl is provided
    if (plan.id === 'basic' && pageUrl) {
      return await this.checkPageSpecificAuditLimits(userId, pageUrl, plan)
    }

    // Check limits in priority order: 3-day, daily, then monthly
    const threeDayLimit = plan.limits.auditsPer3Days
    const dailyLimit = plan.limits.auditsPerDay
    const monthlyLimit = plan.limits.auditsPerMonth
    
    let canPerform: boolean
    let remainingAudits: number
    let reason: string | undefined

    if (threeDayLimit !== undefined && threeDayLimit > 0) {
      // Use 3-day limits for Free Tier
      console.log('Main service: Checking 3-day limits for user:', userId, 'threeDayLimit:', threeDayLimit)
      const threeDayUsage = await this.getUser3DayUsage(userId)
      console.log('Main service: Current 3-day usage:', threeDayUsage)
      canPerform = threeDayLimit === -1 || threeDayUsage < threeDayLimit
      remainingAudits = threeDayLimit === -1 ? -1 : Math.max(0, threeDayLimit - threeDayUsage)
      
      console.log('Main service: Can perform audit (3-day):', canPerform, 'remainingAudits:', remainingAudits)
      
      if (!canPerform) {
        reason = `You have reached your limit of ${threeDayLimit} audit every 3 minutes. Please wait before running another audit.`
        console.log('Main service: Blocking audit (3-day), reason:', reason)
      }
    } else if (dailyLimit !== undefined) {
      // Use daily limits - need to check daily usage
      console.log('Main service: Checking daily limits for user:', userId, 'dailyLimit:', dailyLimit)
      
      if (dailyLimit === -1) {
        // Unlimited daily audits (Pro plan)
        console.log('Main service: Pro plan - unlimited daily audits')
        canPerform = true
        remainingAudits = -1
      } else {
        const dailyUsage = await this.getUserDailyUsage(userId)
        console.log('Main service: Current daily usage:', dailyUsage)
        canPerform = dailyUsage < dailyLimit
        remainingAudits = Math.max(0, dailyLimit - dailyUsage)
        
        console.log('Main service: Can perform audit:', canPerform, 'remainingAudits:', remainingAudits)
        
        if (!canPerform) {
          if (plan.id === 'basic') {
            reason = `You have reached your daily limit of ${dailyLimit} audits. Upgrade to Pro plan for unlimited audits.`
          } else {
            reason = `You have reached your daily limit of ${dailyLimit} audits.`
          }
          console.log('Main service: Blocking audit, reason:', reason)
        }
      }
    } else {
      // Fall back to monthly limits
      console.log('Main service: Checking monthly limits for user:', userId, 'monthlyLimit:', monthlyLimit)
      
      if (monthlyLimit === -1) {
        // Unlimited monthly audits (Pro plan)
        console.log('Main service: Pro plan - unlimited monthly audits')
        canPerform = true
        remainingAudits = -1
      } else {
        canPerform = usage.audits_used < monthlyLimit
        remainingAudits = Math.max(0, monthlyLimit - usage.audits_used)
        
        console.log('Main service: Can perform audit (monthly):', canPerform, 'remainingAudits:', remainingAudits)
        
        if (!canPerform) {
          if (plan.id === 'free') {
            reason = 'You have reached your limit of 1 audit every 3 minutes. Please wait before running another audit.'
          } else if (plan.id === 'basic') {
            reason = `You have reached your monthly limit of ${monthlyLimit} audits. Upgrade to Pro plan for unlimited audits.`
          } else {
            reason = `You have reached your monthly limit of ${monthlyLimit} audits. Upgrade to Pro plan for unlimited audits.`
          }
        }
      }
    }

    return { canPerform, reason, remainingAudits }
  }

  // Check page-specific audit limits for Basic Plan users
  private static async checkPageSpecificAuditLimits(userId: string, pageUrl: string, plan: Plan): Promise<{
    canPerform: boolean
    reason?: string
    remainingAudits: number
  }> {
    try {
      const maxAuditsPerPage = 2 // Basic Plan allows 2 audits per page per day
      
      // Get current audit count for this page today
      const { data, error } = await supabase
        .from('page_audit_usage')
        .select('audit_count')
        .eq('user_id', userId)
        .eq('page_url', pageUrl)
        .eq('last_audit_date', new Date().toISOString().slice(0, 10))
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking page audit limits:', error)
        // Fallback to allowing audit if there's an error
        return { canPerform: true, remainingAudits: maxAuditsPerPage }
      }

      const currentCount = data?.audit_count || 0
      const canPerform = currentCount < maxAuditsPerPage
      const remainingAudits = Math.max(0, maxAuditsPerPage - currentCount)

      let reason: string | undefined
      if (!canPerform) {
        reason = `You have reached your limit of ${maxAuditsPerPage} audits per page per day. You can audit other pages or upgrade to Pro plan for unlimited audits.`
      }

      console.log(`Page audit check for ${pageUrl}: current=${currentCount}, max=${maxAuditsPerPage}, canPerform=${canPerform}`)

      return { canPerform, reason, remainingAudits }
    } catch (error) {
      console.error('Error in checkPageSpecificAuditLimits:', error)
      // Fallback to allowing audit if there's an error
      return { canPerform: true, remainingAudits: 2 }
    }
  }

  // Get user's daily audit usage
  static async getUserDailyUsage(userId: string): Promise<number> {
    try {
      const currentDay = new Date().toISOString().slice(0, 10) // YYYY-MM-DD format
      
      // Check if we have a daily usage table, if not, use in-memory tracking
      const { data, error } = await supabase
        .from('user_daily_usage')
        .select('audits_used')
        .eq('user_id', userId)
        .eq('date', currentDay)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily usage:', error)
        // Fallback to in-memory tracking
        return this.getInMemoryDailyUsage(userId)
      }

      return data?.audits_used || 0
    } catch (error) {
      console.error('Error accessing user_daily_usage table:', error)
      // Fallback to in-memory tracking
      return this.getInMemoryDailyUsage(userId)
    }
  }

  // Get user's 3-minute usage (for 3-minute limits - testing)
  static async getUser3DayUsage(userId: string): Promise<number> {
    try {
      const threeMinutesAgo = new Date()
      threeMinutesAgo.setMinutes(threeMinutesAgo.getMinutes() - 3)
      
      // Count audits from the last 3 minutes
      const { data, error } = await supabase
        .from('audits')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', threeMinutesAgo.toISOString())

      if (error) {
        console.error('Error fetching 3-minute usage:', error)
        return 0
      }

      return data?.length || 0
    } catch (error) {
      console.error('Error in getUser3DayUsage:', error)
      return 0
    }
  }

  // Get in-memory daily usage (fallback)
  private static getInMemoryDailyUsage(userId: string): number {
    // Use the same in-memory tracking as the fallback service
    const auditUsage = (global as any).__auditUsage || {}
    const currentDay = new Date().toISOString().slice(0, 10)
    const dailyKey = `${userId}-${currentDay}`
    const usage = auditUsage[dailyKey] || 0
    console.log('Main service: In-memory daily usage for', userId, 'on', currentDay, ':', usage)
    console.log('Main service: All audit usage:', auditUsage)
    return usage
  }

  // Record an audit usage (with optional page URL for page-specific tracking)
  static async recordAuditUsage(userId: string, pageUrl?: string): Promise<void> {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const currentDay = new Date().toISOString().slice(0, 10)
    
    // Record monthly usage
    const { data: existingUsage } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .single()

    if (existingUsage) {
      // Update existing usage
      await supabase
        .from('user_usage')
        .update({
          audits_used: existingUsage.audits_used + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUsage.id)
    } else {
      // Create new usage record
      await supabase
        .from('user_usage')
        .insert({
          user_id: userId,
          month: currentMonth,
          audits_used: 1,
          ai_calls_used: 0
        })
    }

    // Record page-specific usage if pageUrl is provided
    if (pageUrl) {
      await this.recordPageAuditUsage(userId, pageUrl)
    }

    // Record daily usage (in-memory fallback)
    this.recordInMemoryDailyUsage(userId)
  }

  // Record page-specific audit usage
  private static async recordPageAuditUsage(userId: string, pageUrl: string): Promise<void> {
    try {
      const currentDate = new Date().toISOString().slice(0, 10)
      
      // First, try to get existing record
      const { data: existingRecord, error: fetchError } = await supabase
        .from('page_audit_usage')
        .select('audit_count')
        .eq('user_id', userId)
        .eq('page_url', pageUrl)
        .eq('last_audit_date', currentDate)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching existing page audit usage:', fetchError)
        return
      }

      if (existingRecord) {
        // Update existing record by incrementing audit count
        const { error: updateError } = await supabase
          .from('page_audit_usage')
          .update({
            audit_count: existingRecord.audit_count + 1,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('page_url', pageUrl)
          .eq('last_audit_date', currentDate)

        if (updateError) {
          console.error('Error updating page audit usage:', updateError)
        } else {
          console.log(`Page audit usage updated for ${pageUrl}: ${existingRecord.audit_count + 1} audits`)
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('page_audit_usage')
          .insert({
            user_id: userId,
            page_url: pageUrl,
            audit_count: 1,
            last_audit_date: currentDate,
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error('Error inserting page audit usage:', insertError)
        } else {
          console.log(`Page audit usage recorded for ${pageUrl}: 1 audit`)
        }
      }
    } catch (error) {
      console.error('Error in recordPageAuditUsage:', error)
    }
  }

  // Record in-memory daily usage
  private static recordInMemoryDailyUsage(userId: string): void {
    // Use the same in-memory tracking as the fallback service
    if (!(global as any).__auditUsage) {
      (global as any).__auditUsage = {}
    }
    
    const auditUsage = (global as any).__auditUsage
    const currentDay = new Date().toISOString().slice(0, 10)
    const dailyKey = `${userId}-${currentDay}`
    
    if (!auditUsage[dailyKey]) {
      auditUsage[dailyKey] = 0
    }
    auditUsage[dailyKey]++
    
    console.log('Main service: Basic Plan user', userId, 'has now used', auditUsage[dailyKey], 'audits today')
  }

  // Record AI call usage
  static async recordAIUsage(userId: string): Promise<void> {
    const currentMonth = new Date().toISOString().slice(0, 7)
    
    const { data: existingUsage } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('month', currentMonth)
      .single()

    if (existingUsage) {
      // Update existing usage
      await supabase
        .from('user_usage')
        .update({
          ai_calls_used: existingUsage.ai_calls_used + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingUsage.id)
    } else {
      // Create new usage record
      await supabase
        .from('user_usage')
        .insert({
          user_id: userId,
          month: currentMonth,
          audits_used: 0,
          ai_calls_used: 1
        })
    }
  }

  // Create or update user subscription
  static async createOrUpdateSubscription(
    userId: string,
    planId: string,
    stripeCustomerId?: string,
    stripeSubscriptionId?: string
  ): Promise<UserSubscription> {
    const now = new Date()
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())

    const subscriptionData = {
      user_id: userId,
      plan_id: planId,
      status: 'active' as const,
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      updated_at: now.toISOString()
    }

    // Check if subscription exists
    const { data: existing } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existing) {
      // Update existing subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update(subscriptionData)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // Create new subscription
      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert(subscriptionData)
        .select()
        .single()

      if (error) throw error
      return data
    }
  }

  // Cancel user subscription
  static async cancelSubscription(userId: string): Promise<void> {
    await supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('status', 'active')
  }
}
