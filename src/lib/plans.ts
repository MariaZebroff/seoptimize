export interface PlanLimits {
  auditsPerMonth: number
  auditsPerDay?: number  // Optional daily limit
  auditsPer3Days?: number // Optional 3-day limit for free users
  maxSites: number       // Maximum number of sites/domains
  maxPagesPerSite: number // Maximum pages per site
  aiRecommendations: boolean
  competitorAnalysis: boolean
  historicalData: boolean
  exportReports: boolean
  apiAccess: boolean
  whiteLabel: boolean
  prioritySupport: boolean
  customIntegrations: boolean
}

export interface Plan {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  limits: PlanLimits
  popular?: boolean
  stripePriceId?: string
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free Tier',
    price: 0,
    description: 'Perfect for getting started with basic SEO analysis',
    features: [
      '1 page audit every 3 days',
      '1 site with up to 5 pages',
      'Basic SEO metrics',
      'Performance analysis',
      'Accessibility checks',
      'Community support'
    ],
    limits: {
      auditsPerMonth: 1,
      auditsPerDay: 0,  // 0 audits per day (will use 3-day tracking)
      auditsPer3Days: 1, // 1 audit every 3 days for free users
      maxSites: 1,      // 1 site for free users
      maxPagesPerSite: 5, // 5 pages per site (1 main page + 4 subpages)
      aiRecommendations: false,
      competitorAnalysis: false,
      historicalData: false,
      exportReports: false,
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: false,
      customIntegrations: false
    }
  },
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 9.99,
    description: 'Perfect for small websites and personal projects',
    features: [
      '2 audits per page per day',
      '1 site with up to 5 pages',
      'Basic SEO analysis',
      'Performance metrics',
      'Accessibility checks',
      'Historical data & charts',
      'Email support'
    ],
    limits: {
      auditsPerMonth: 2, // 2 audits per day (will be handled as daily limit)
      auditsPerDay: 2,   // New daily limit
      auditsPer3Days: undefined, // Not used for Basic plan
      maxSites: 1,       // 1 site for basic users
      maxPagesPerSite: 5, // 5 pages per site (1 main page + 4 subpages)
      aiRecommendations: false,
      competitorAnalysis: false,
      historicalData: true,
      exportReports: false,
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: false,
      customIntegrations: false
    }
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: 49.99,
    description: 'Ideal for growing businesses and agencies',
    features: [
      'Unlimited page audits',
      '5 sites with up to 20 pages',
      'Advanced SEO analysis',
      'AI-powered insights',
      'Competitor analysis',
      'Content quality analysis',
      'Historical data tracking',
      'Export reports to PDF and HTML formats',
      'Priority support'
    ],
    limits: {
      auditsPerMonth: -1, // -1 means unlimited
      auditsPerDay: -1,   // -1 means unlimited daily
      auditsPer3Days: undefined, // Not used for Pro plan
      maxSites: 5,        // 5 sites for pro users
      maxPagesPerSite: 20, // 20 pages per site
      aiRecommendations: true,
      competitorAnalysis: true,
      historicalData: true,
      exportReports: true,
      apiAccess: false,
      whiteLabel: false,
      prioritySupport: true,
      customIntegrations: false
    },
    popular: true
  }
]

export const getPlanById = (planId: string): Plan | undefined => {
  return PLANS.find(plan => plan.id === planId)
}

export const getDefaultPlan = (): Plan => {
  return PLANS.find(plan => plan.id === 'free')!
}

export const canUserPerformAction = (
  userPlan: Plan,
  action: keyof PlanLimits
): boolean => {
  return userPlan.limits[action] === true
}

export const canUserPerformAudit = (
  userPlan: Plan,
  currentMonthAudits: number
): boolean => {
  if (userPlan.limits.auditsPerMonth === -1) {
    return true // Unlimited
  }
  return currentMonthAudits < userPlan.limits.auditsPerMonth
}

export const getRemainingAudits = (
  userPlan: Plan,
  currentMonthAudits: number
): number => {
  if (userPlan.limits.auditsPerMonth === -1) {
    return -1 // Unlimited
  }
  return Math.max(0, userPlan.limits.auditsPerMonth - currentMonthAudits)
}
