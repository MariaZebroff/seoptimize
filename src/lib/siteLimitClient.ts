import { Plan } from './plans'

export interface SiteLimitCheck {
  canAdd: boolean
  currentCount: number
  maxSites: number
  reason?: string
}

export interface PageLimitCheck {
  canAdd: boolean
  currentCount: number
  maxPagesPerSite: number
  reason?: string
}

export class SiteLimitClient {
  // Check if user can add a new site
  static async canUserAddSite(planId: string): Promise<SiteLimitCheck> {
    try {
      const response = await fetch(`/api/site-limits/check-site?planId=${encodeURIComponent(planId)}`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to check site limits')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error checking site limits:', error)
      // Fallback to allowing addition if API fails
      return {
        canAdd: true,
        currentCount: 0,
        maxSites: 1,
      }
    }
  }

  // Check if user can add a new page to a site
  static async canUserAddPage(siteId: string, planId: string): Promise<PageLimitCheck> {
    try {
      const response = await fetch(`/api/site-limits/check-page?siteId=${encodeURIComponent(siteId)}&planId=${encodeURIComponent(planId)}`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to check page limits')
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error checking page limits:', error)
      // Fallback to allowing addition if API fails
      return {
        canAdd: true,
        currentCount: 0,
        maxPagesPerSite: 5,
      }
    }
  }
}
