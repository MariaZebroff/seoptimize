import { createClient } from '@supabase/supabase-js'
import { Plan } from './plans'

// Create Supabase client with service role key for server-side operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export interface UserSite {
  id: string
  user_id: string
  domain: string
  site_name: string | null
  created_at: string
  updated_at: string
}

export interface UserPage {
  id: string
  user_id: string
  site_id: string
  url: string
  page_title: string | null
  is_homepage: boolean
  created_at: string
  updated_at: string
}

export interface SiteLimitCheck {
  canAddSite: boolean
  canAddPage: boolean
  currentSiteCount: number
  currentPageCount: number
  maxSites: number
  maxPagesPerSite: number
  reason?: string
}

export class SiteLimitService {
  // Check if user can add a new site
  static async canUserAddSite(userId: string, plan: Plan): Promise<{
    canAdd: boolean
    currentCount: number
    maxSites: number
    reason?: string
  }> {
    try {
      const { data: sites, error } = await supabase
        .from('user_sites')
        .select('id')
        .eq('user_id', userId)

      if (error) {
        console.error('Error checking site count:', error)
        return {
          canAdd: true, // Allow if error (fallback)
          currentCount: 0,
          maxSites: plan.limits.maxSites
        }
      }

      const currentCount = sites?.length || 0
      const maxSites = plan.limits.maxSites
      const canAdd = maxSites === -1 || currentCount < maxSites

      let reason: string | undefined
      if (!canAdd) {
        if (maxSites === 1) {
          reason = 'You can only add 1 site. Upgrade to Pro plan for up to 5 sites.'
        } else {
          reason = `You have reached your limit of ${maxSites} sites. Upgrade to Enterprise plan for unlimited sites.`
        }
      }

      return {
        canAdd,
        currentCount,
        maxSites,
        reason
      }
    } catch (error) {
      console.error('Error in canUserAddSite:', error)
      return {
        canAdd: true, // Allow if error (fallback)
        currentCount: 0,
        maxSites: plan.limits.maxSites
      }
    }
  }

  // Check if user can add a new page to a site
  static async canUserAddPage(userId: string, siteId: string, plan: Plan): Promise<{
    canAdd: boolean
    currentCount: number
    maxPagesPerSite: number
    reason?: string
  }> {
    try {
      const { data: pages, error } = await supabase
        .from('user_pages')
        .select('id')
        .eq('user_id', userId)
        .eq('site_id', siteId)

      if (error) {
        console.error('Error checking page count:', error)
        return {
          canAdd: true, // Allow if error (fallback)
          currentCount: 0,
          maxPagesPerSite: plan.limits.maxPagesPerSite
        }
      }

      const currentCount = pages?.length || 0
      const maxPagesPerSite = plan.limits.maxPagesPerSite
      const canAdd = maxPagesPerSite === -1 || currentCount < maxPagesPerSite

      let reason: string | undefined
      if (!canAdd) {
        if (maxPagesPerSite === 2) {
          reason = 'You can only add 2 pages per site (home page + 1 subpage). Upgrade to Basic plan for up to 5 pages per site.'
        } else if (maxPagesPerSite === 5) {
          reason = 'You can only add 5 pages per site. Upgrade to Pro plan for up to 20 pages per site.'
        } else {
          reason = `You have reached your limit of ${maxPagesPerSite} pages per site. Upgrade to Enterprise plan for unlimited pages.`
        }
      }

      return {
        canAdd,
        currentCount,
        maxPagesPerSite,
        reason
      }
    } catch (error) {
      console.error('Error in canUserAddPage:', error)
      return {
        canAdd: true, // Allow if error (fallback)
        currentCount: 0,
        maxPagesPerSite: plan.limits.maxPagesPerSite
      }
    }
  }

  // Get or create site for a URL
  static async getOrCreateSite(userId: string, url: string, siteName?: string): Promise<{
    siteId: string
    isNewSite: boolean
  }> {
    try {
      // Extract domain from URL
      const domain = this.extractDomain(url)
      
      // Check if site already exists
      const { data: existingSite, error: findError } = await supabase
        .from('user_sites')
        .select('id')
        .eq('user_id', userId)
        .eq('domain', domain)
        .single()

      if (findError && findError.code !== 'PGRST116') {
        console.error('Error finding site:', findError)
        throw findError
      }

      if (existingSite) {
        return {
          siteId: existingSite.id,
          isNewSite: false
        }
      }

      // Create new site
      const { data: newSite, error: createError } = await supabase
        .from('user_sites')
        .insert({
          user_id: userId,
          domain: domain,
          site_name: siteName || domain
        })
        .select('id')
        .single()

      if (createError) {
        console.error('Error creating site:', createError)
        throw createError
      }

      return {
        siteId: newSite.id,
        isNewSite: true
      }
    } catch (error) {
      console.error('Error in getOrCreateSite:', error)
      throw error
    }
  }

  // Add page to site
  static async addPageToSite(userId: string, siteId: string, url: string, pageTitle?: string, isHomepage: boolean = false): Promise<{
    pageId: string
    isNewPage: boolean
  }> {
    try {
      // Check if page already exists
      const { data: existingPage, error: findError } = await supabase
        .from('user_pages')
        .select('id')
        .eq('user_id', userId)
        .eq('url', url)
        .single()

      if (findError && findError.code !== 'PGRST116') {
        console.error('Error finding page:', findError)
        throw findError
      }

      if (existingPage) {
        // Update existing page
        const { data: updatedPage, error: updateError } = await supabase
          .from('user_pages')
          .update({
            page_title: pageTitle,
            is_homepage: isHomepage,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPage.id)
          .select('id')
          .single()

        if (updateError) {
          console.error('Error updating page:', updateError)
          throw updateError
        }

        return {
          pageId: updatedPage.id,
          isNewPage: false
        }
      }

      // Create new page
      const { data: newPage, error: createError } = await supabase
        .from('user_pages')
        .insert({
          user_id: userId,
          site_id: siteId,
          url: url,
          page_title: pageTitle,
          is_homepage: isHomepage
        })
        .select('id')
        .single()

      if (createError) {
        console.error('Error creating page:', createError)
        throw createError
      }

      return {
        pageId: newPage.id,
        isNewPage: true
      }
    } catch (error) {
      console.error('Error in addPageToSite:', error)
      throw error
    }
  }

  // Get user's sites
  static async getUserSites(userId: string): Promise<UserSite[]> {
    try {
      const { data: sites, error } = await supabase
        .from('user_sites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user sites:', error)
        return []
      }

      return sites || []
    } catch (error) {
      console.error('Error in getUserSites:', error)
      return []
    }
  }

  // Get user's pages for a site
  static async getUserPages(userId: string, siteId: string): Promise<UserPage[]> {
    try {
      const { data: pages, error } = await supabase
        .from('user_pages')
        .select('*')
        .eq('user_id', userId)
        .eq('site_id', siteId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching user pages:', error)
        return []
      }

      return pages || []
    } catch (error) {
      console.error('Error in getUserPages:', error)
      return []
    }
  }

  // Extract domain from URL
  private static extractDomain(url: string): string {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname
    } catch (error) {
      // Fallback: simple regex extraction
      const match = url.match(/https?:\/\/([^\/]+)/)
      return match ? match[1] : url
    }
  }

  // Check site limits for a URL (combines site and page checks)
  static async checkSiteLimits(userId: string, url: string, plan: Plan): Promise<SiteLimitCheck> {
    try {
      const domain = this.extractDomain(url)
      
      // Check if site exists
      const { data: existingSite } = await supabase
        .from('user_sites')
        .select('id')
        .eq('user_id', userId)
        .eq('domain', domain)
        .single()

      let canAddSite = true
      let canAddPage = true
      let currentSiteCount = 0
      let currentPageCount = 0
      let reason: string | undefined

      if (existingSite) {
        // Site exists, check page limits
        const pageCheck = await this.canUserAddPage(userId, existingSite.id, plan)
        canAddPage = pageCheck.canAdd
        currentPageCount = pageCheck.currentCount
        reason = pageCheck.reason

        // Get current site count
        const siteCheck = await this.canUserAddSite(userId, plan)
        currentSiteCount = siteCheck.currentCount
      } else {
        // Site doesn't exist, check site limits
        const siteCheck = await this.canUserAddSite(userId, plan)
        canAddSite = siteCheck.canAdd
        currentSiteCount = siteCheck.currentCount
        reason = siteCheck.reason
      }

      return {
        canAddSite,
        canAddPage,
        currentSiteCount,
        currentPageCount,
        maxSites: plan.limits.maxSites,
        maxPagesPerSite: plan.limits.maxPagesPerSite,
        reason
      }
    } catch (error) {
      console.error('Error in checkSiteLimits:', error)
      return {
        canAddSite: true,
        canAddPage: true,
        currentSiteCount: 0,
        currentPageCount: 0,
        maxSites: plan.limits.maxSites,
        maxPagesPerSite: plan.limits.maxPagesPerSite
      }
    }
  }
}




