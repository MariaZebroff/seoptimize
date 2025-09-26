import { Plan, getDefaultPlan, getPlanById } from './plans'
import { createClient } from '@supabase/supabase-js'

// Create Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Simple in-memory storage for fallback service
// Using a global variable to persist across requests
declare global {
  var __auditUsage: { [userId: string]: number } | undefined
  var __anonymousAuditCount: number | undefined
  var __lastResetTime: number | undefined
}

const getAuditUsage = () => {
  if (!global.__auditUsage) {
    global.__auditUsage = {}
  }
  return global.__auditUsage
}

const getAnonymousAuditCount = () => {
  if (global.__anonymousAuditCount === undefined) {
    global.__anonymousAuditCount = 0
  }
  return global.__anonymousAuditCount
}

// Reset counter every 1 week
const getAnonymousAuditCountWithReset = () => {
  const now = Date.now()
  const lastReset = global.__lastResetTime || 0
  const resetInterval = 7 * 24 * 60 * 60 * 1000 // 1 week in milliseconds
  
  // If more than 1 week has passed, reset the counter
  if (now - lastReset > resetInterval) {
    global.__anonymousAuditCount = 0
    global.__lastResetTime = now
    console.log('Fallback: Reset anonymous audit count after 1 week')
  }
  
  return getAnonymousAuditCount()
}

const incrementAnonymousAuditCount = () => {
  // First check if we need to reset (this will reset if 1 week has passed)
  getAnonymousAuditCountWithReset()
  global.__anonymousAuditCount = getAnonymousAuditCount() + 1
  return global.__anonymousAuditCount
}

const resetAnonymousAuditCount = () => {
  global.__anonymousAuditCount = 0
}

// Fallback subscription service that doesn't require database tables
export class SubscriptionServiceFallback {
  // Get user's current plan
  static async getUserPlan(userId: string): Promise<Plan> {
    // For anonymous users, return Free Plan with 3-minute limits
    if (userId === 'anonymous-user') {
      const freePlan = getDefaultPlan()
      console.log('Fallback: Returning Free Plan for anonymous user:', userId)
      return freePlan
    }
    
    // For authenticated users, return Basic Plan for testing
    const basicPlan = getPlanById('basic')!
    console.log('Fallback: Returning Basic Plan for authenticated user (testing mode):', userId)
    return basicPlan
  }

  // Get user's usage for current day
  static async getUserUsage(userId: string): Promise<{
    id: string
    user_id: string
    month: string
    audits_used: number
    ai_calls_used: number
    created_at: string
    updated_at: string
  }> {
    const currentDay = new Date().toISOString().slice(0, 10) // YYYY-MM-DD format
    
    // For anonymous users, use in-memory tracking
    if (userId === 'anonymous-user') {
      const auditUsage = getAuditUsage()
      const dailyKey = `${userId}-${currentDay}`
      const dailyUsage = auditUsage[dailyKey] || 0
      
      console.log('Fallback: Getting anonymous user usage (Basic Plan):', dailyUsage, 'for day:', currentDay)
      
      return {
        id: '',
        user_id: userId,
        month: currentDay, // Use current day instead of month
        audits_used: dailyUsage, // Use actual daily usage
        ai_calls_used: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
    
    // For authenticated users, track usage based on plan
    const auditUsage = getAuditUsage()
    const plan = await this.getUserPlan(userId)
    
    let currentUsage = 0
    let trackingKey = ''
    
    if (plan.id === 'free' && plan.limits.auditsPer3Days !== undefined) {
      // For free users, track usage over 3-day periods
      const threeDayPeriod = this.getThreeDayPeriod(currentDay)
      trackingKey = `${userId}-3day-${threeDayPeriod}`
      currentUsage = auditUsage[trackingKey] || 0
      console.log('Fallback: Getting 3-day usage for free user:', userId, 'period:', threeDayPeriod, 'usage:', currentUsage)
    } else {
      // For other users, track daily usage
      trackingKey = `${userId}-${currentDay}`
      currentUsage = auditUsage[trackingKey] || 0
      console.log('Fallback: Getting daily usage for user:', userId, 'day:', currentDay, 'usage:', currentUsage)
    }
    
    return {
      id: '',
      user_id: userId,
      month: currentDay, // Use current day instead of month
      audits_used: currentUsage,
      ai_calls_used: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  // Fallback method to count anonymous audits from audit history
  private static async getAnonymousUsageFromAuditHistory(currentMonth: string): Promise<{
    id: string
    user_id: string
    month: string
    audits_used: number
    ai_calls_used: number
    created_at: string
    updated_at: string
  }> {
    try {
      console.log('Fallback: Counting anonymous audits from audit history for month:', currentMonth)
      
      const { data: auditHistory, error } = await supabase
        .from('audits')
        .select('id, created_at')
        .eq('user_id', 'anonymous-user')
        .gte('created_at', `${currentMonth}-01T00:00:00.000Z`)
        .lt('created_at', `${currentMonth}-32T00:00:00.000Z`)

      if (error) {
        console.error('Fallback: Error counting audit history:', error)
        console.log('Fallback: Database error, using fallback approach - return 0 to allow first audit')
        // If we can't count from database, return 0 to allow the first audit
        return {
          id: '',
          user_id: 'anonymous-user',
          month: currentMonth,
          audits_used: 0, // Return 0 to allow first audit
          ai_calls_used: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }

      const auditCount = auditHistory ? auditHistory.length : 0
      console.log('Fallback: Found', auditCount, 'audits for anonymous user in', currentMonth)

      return {
        id: '',
        user_id: 'anonymous-user',
        month: currentMonth,
        audits_used: auditCount,
        ai_calls_used: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    } catch (error) {
      console.error('Fallback: Error in getAnonymousUsageFromAuditHistory:', error)
      console.log('Fallback: Exception occurred, using fallback approach - return 0 to allow first audit')
      return {
        id: '',
        user_id: 'anonymous-user',
        month: currentMonth,
        audits_used: 0, // Return 0 to allow first audit
        ai_calls_used: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    }
  }

  // Check if user can perform an audit
  static async canUserPerformAudit(userId: string): Promise<{
    canPerform: boolean
    reason?: string
    remainingAudits: number
  }> {
    const plan = await this.getUserPlan(userId)
    const usage = await this.getUserUsage(userId)

    console.log('Fallback: Checking audit limit for user:', userId)
    console.log('Fallback: Plan:', plan.id, 'Limit:', plan.limits.auditsPerMonth)
    console.log('Fallback: Usage:', usage.audits_used)

    // Check limits in priority order: 3-day, daily, then monthly
    const threeDayLimit = plan.limits.auditsPer3Days
    const dailyLimit = plan.limits.auditsPerDay
    const monthlyLimit = plan.limits.auditsPerMonth
    
    let canPerform: boolean
    let remainingAudits: number
    let reason: string | undefined

    if (threeDayLimit !== undefined && threeDayLimit > 0) {
      // Use 3-day limits for Free Tier
      console.log('Fallback: Checking 3-day limits for user:', userId, 'threeDayLimit:', threeDayLimit)
      const threeDayUsage = await this.getUser3DayUsage(userId)
      console.log('Fallback: Current 3-day usage:', threeDayUsage)
      canPerform = threeDayLimit === -1 || threeDayUsage < threeDayLimit
      remainingAudits = threeDayLimit === -1 ? -1 : Math.max(0, threeDayLimit - threeDayUsage)
      
      console.log('Fallback: Can perform audit (3-day):', canPerform, 'remainingAudits:', remainingAudits)
      
      if (!canPerform) {
        reason = `You have reached your limit of ${threeDayLimit} audit every 3 minutes. Please wait before running another audit.`
        console.log('Fallback: Blocking audit (3-day), reason:', reason)
      }
    } else if (dailyLimit !== undefined && dailyLimit > 0) {
      // Use daily limits
      canPerform = dailyLimit === -1 || usage.audits_used < dailyLimit
      remainingAudits = dailyLimit === -1 ? -1 : Math.max(0, dailyLimit - usage.audits_used)
      
      if (!canPerform) {
        if (plan.id === 'basic') {
          reason = `You have reached your daily limit of ${dailyLimit} audits. Upgrade to Pro plan for unlimited audits.`
        } else {
          reason = `You have reached your daily limit of ${dailyLimit} audits.`
        }
      }
    } else {
      // Fall back to monthly limits
      canPerform = monthlyLimit === -1 || usage.audits_used < monthlyLimit
      remainingAudits = monthlyLimit === -1 ? -1 : Math.max(0, monthlyLimit - usage.audits_used)
      
      if (!canPerform) {
        if (plan.id === 'free') {
          reason = 'You have reached your limit of 1 audit every 3 days. Upgrade to Basic plan for 2 audits per day.'
        } else if (plan.id === 'basic') {
          reason = `You have reached your monthly limit of ${monthlyLimit} audits. Upgrade to Pro plan for unlimited audits.`
        } else {
          reason = `You have reached your monthly limit of ${monthlyLimit} audits. Upgrade to Pro plan for unlimited audits.`
        }
      }
    }

    console.log('Fallback: Result - canPerform:', canPerform, 'remainingAudits:', remainingAudits, 'reason:', reason)

    return { canPerform, reason, remainingAudits }
  }

  // Record an audit usage
  static async recordAuditUsage(userId: string): Promise<void> {
    console.log('Fallback: Recording audit usage for user:', userId)
    
    // For anonymous users, use simple in-memory counter
    if (userId === 'anonymous-user') {
      const newCount = incrementAnonymousAuditCount()
      console.log('Fallback: Incremented anonymous user audit count to:', newCount)
      return
    }
    
    // For authenticated users (Basic Plan), track daily usage in memory
    const auditUsage = getAuditUsage()
    const currentDay = new Date().toISOString().slice(0, 10) // YYYY-MM-DD format
    const dailyKey = `${userId}-${currentDay}` // Track per user per day
    
    if (!auditUsage[dailyKey]) {
      auditUsage[dailyKey] = 0
    }
    auditUsage[dailyKey]++
    
    console.log('Fallback: Basic Plan user', userId, 'has now used', auditUsage[dailyKey], 'audits today')
  }

  // Record AI call usage (no-op for now)
  static async recordAIUsage(userId: string): Promise<void> {
    console.log('Fallback: Recording AI usage for user:', userId)
    // No-op for now
  }

  // Get user's 3-minute usage (for 3-minute limits - testing)
  static async getUser3DayUsage(userId: string): Promise<number> {
    try {
      const threeMinutesAgo = new Date()
      threeMinutesAgo.setMinutes(threeMinutesAgo.getMinutes() - 3)
      
      // Count audits from the last 3 minutes from database
      const { data, error } = await supabase
        .from('audits')
        .select('id')
        .eq('user_id', userId)
        .gte('created_at', threeMinutesAgo.toISOString())

      if (error) {
        console.error('Error fetching 3-minute usage (fallback):', error)
        return 0
      }

      const count = data?.length || 0
      console.log('Fallback: 3-minute usage for user:', userId, 'count:', count)
      return count
    } catch (error) {
      console.error('Error in getUser3DayUsage (fallback):', error)
      return 0
    }
  }

  // Helper method to get 3-day period identifier
  private static getThreeDayPeriod(dateString: string): string {
    // Convert date string to Date object
    const date = new Date(dateString)
    const year = date.getFullYear()
    const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    
    // Group days into 3-day periods (0-2, 3-5, 6-8, etc.)
    const threeDayPeriod = Math.floor(dayOfYear / 3)
    
    return `${year}-${threeDayPeriod}`
  }
}
