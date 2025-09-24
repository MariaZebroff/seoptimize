import { createClient } from '@supabase/supabase-js'

// Create Supabase client for client-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface PageAuditUsage {
  id: string
  user_id: string
  page_url: string
  audit_count: number
  last_audit_date: string
  created_at: string
  updated_at: string
}

export interface PageAuditStatus {
  pageUrl: string
  auditCount: number
  maxAudits: number
  remainingAudits: number
  canAudit: boolean
  status: 'available' | 'limit_reached' | 'no_usage'
}

export class PageAuditUsageClient {
  // Get page audit usage for a specific user and page URLs
  static async getPageAuditStatus(userId: string, pageUrls: string[]): Promise<PageAuditStatus[]> {
    try {
      if (!pageUrls.length) return []

      const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD format
      
      const { data, error } = await supabase
        .from('page_audit_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('last_audit_date', today)
        .in('page_url', pageUrls)

      if (error) {
        console.error('Error fetching page audit usage:', error)
        // Return default status for all pages (assume they can be audited)
        return pageUrls.map(url => ({
          pageUrl: url,
          auditCount: 0,
          maxAudits: 2,
          remainingAudits: 2,
          canAudit: true,
          status: 'no_usage' as const
        }))
      }

      // Create a map of existing usage
      const usageMap = new Map<string, PageAuditUsage>()
      data?.forEach(usage => {
        usageMap.set(usage.page_url, usage)
      })

      // Create status for each page URL
      return pageUrls.map(url => {
        const usage = usageMap.get(url)
        const auditCount = usage?.audit_count || 0
        const maxAudits = 2 // Basic Plan limit
        const remainingAudits = Math.max(0, maxAudits - auditCount)
        const canAudit = auditCount < maxAudits
        const status = auditCount === 0 ? 'no_usage' : canAudit ? 'available' : 'limit_reached'

        return {
          pageUrl: url,
          auditCount,
          maxAudits,
          remainingAudits,
          canAudit,
          status
        }
      })
    } catch (error) {
      console.error('Error in getPageAuditStatus:', error)
      // Return default status for all pages (assume they can be audited)
      return pageUrls.map(url => ({
        pageUrl: url,
        auditCount: 0,
        maxAudits: 2,
        remainingAudits: 2,
        canAudit: true,
        status: 'no_usage' as const
      }))
    }
  }

  // Get all page audit usage for a user (for dashboard overview)
  static async getAllPageAuditUsage(userId: string): Promise<PageAuditUsage[]> {
    try {
      const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD format
      
      const { data, error } = await supabase
        .from('page_audit_usage')
        .select('*')
        .eq('user_id', userId)
        .eq('last_audit_date', today)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching all page audit usage:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error in getAllPageAuditUsage:', error)
      return []
    }
  }

  // Get page audit usage summary for dashboard
  static async getPageAuditSummary(userId: string): Promise<{
    totalPagesAudited: number
    totalAuditsUsed: number
    pagesWithLimitsReached: number
    pagesAvailable: number
  }> {
    try {
      const usage = await this.getAllPageAuditUsage(userId)
      
      const totalPagesAudited = usage.length
      const totalAuditsUsed = usage.reduce((sum, u) => sum + u.audit_count, 0)
      const pagesWithLimitsReached = usage.filter(u => u.audit_count >= 2).length
      const pagesAvailable = totalPagesAudited - pagesWithLimitsReached

      return {
        totalPagesAudited,
        totalAuditsUsed,
        pagesWithLimitsReached,
        pagesAvailable
      }
    } catch (error) {
      console.error('Error in getPageAuditSummary:', error)
      return {
        totalPagesAudited: 0,
        totalAuditsUsed: 0,
        pagesWithLimitsReached: 0,
        pagesAvailable: 0
      }
    }
  }
}
