"use client"



import { useState, useEffect, useCallback, Suspense, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getCurrentUser, getUserSites } from "@/lib/supabaseAuth"
import AuditResults from "@/components/AuditResults"
import AuditHistory from "@/components/AuditHistory"
import { AuditLimitGuard, PlanRestrictionGuard } from "@/components/PlanRestrictionGuard"
import { SubscriptionClient } from '@/lib/subscriptionClient'
import { Plan } from '@/lib/plans'
import { event } from "@/lib/gtag"
import type { User } from "@supabase/supabase-js"

// Use the same interface as AuditResults component
type AuditResult = any 

interface Site {
  id: string
  url: string
  title: string | null
  created_at: string
}

function AuditPageContent() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [url, setUrl] = useState("")
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null)
  const [isAuditing, setIsAuditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sites, setSites] = useState<Site[]>([])
  const [siteId, setSiteId] = useState<string | undefined>(undefined)
  const [userPlan, setUserPlan] = useState<Plan | null>(null)
  const [planLoading, setPlanLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Ref to store AbortController for canceling ongoing audits
  const abortControllerRef = useRef<AbortController | null>(null)

  // Load user plan
  const loadUserPlan = useCallback(async () => {
    try {
      if (user) {
        // Use SubscriptionClient which handles localStorage and database fallback
        const plan = await SubscriptionClient.getUserPlan()
        setUserPlan(plan)
        console.log('Audit page: Loaded user plan:', plan.name)
      } else {
        // For unauthenticated users, use free plan
        const { getPlanById } = await import('@/lib/plans')
        const freePlan = getPlanById('free')!
        setUserPlan(freePlan)
        console.log('Audit page: Using Free Plan for unauthenticated user')
      }
    } catch (error) {
      console.error('Error loading user plan:', error)
      // Fallback to Free Plan
      const { getPlanById } = await import('@/lib/plans')
      const freePlan = getPlanById('free')!
      setUserPlan(freePlan)
    } finally {
      setPlanLoading(false)
    }
  }, [user])

  useEffect(() => {
    const getUser = async () => {
      const user = await getCurrentUser()
      console.log('Audit page: User state:', user ? 'authenticated' : 'unauthenticated')
      
      if (!user) {
        // Redirect to sign in if not authenticated
        router.push('/auth/signin')
        return
      }
      
      setUser(user)
      // Load user's sites
      const { data: sitesData } = await getUserSites()
      setSites(sitesData || [])
      setLoading(false)
    }
    getUser()
  }, [router])

  // Load user plan when user changes
  useEffect(() => {
    if (!loading) {
      loadUserPlan()
    }
  }, [user, loading, loadUserPlan])

  useEffect(() => {
    const urlParam = searchParams.get('url')
    if (urlParam) {
      setUrl(urlParam)
    }
  }, [searchParams])

  // Find site ID when URL or sites change
  useEffect(() => {
    if (url && sites.length > 0) {
      const matchingSite = sites.find(site => site.url === url)
      setSiteId(matchingSite?.id)
    } else {
      setSiteId(undefined)
    }
  }, [url, sites])

  // Handle beforeunload warning when audit is in progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isAuditing) {
        e.preventDefault()
        e.returnValue = 'An audit is currently in progress. Are you sure you want to leave?'
        return 'An audit is currently in progress. Are you sure you want to leave?'
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isAuditing])

  // Cleanup function to cancel ongoing audits when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        console.log('Component unmounting, canceling ongoing audit...')
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const runAudit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    // Cancel any existing audit
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new AbortController for this audit
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    setIsAuditing(true)
    setError(null)
    setAuditResult(null)

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        credentials: 'include',
        signal: abortController.signal, // Add abort signal
        body: JSON.stringify({ 
          url: url.trim(), 
          siteId,
          userId: user?.id, // Pass user ID from client
          timestamp: Date.now() // Cache busting
        }),
      })

      // Check if the request was aborted
      if (abortController.signal.aborted) {
        console.log('Audit request was aborted')
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run audit')
      }

      // Debug logging
      console.log('🔍 Audit result received:', {
        hasEnhancedSEOAnalysis: !!data.enhancedSEOAnalysis,
        enhancedSEOKeys: data.enhancedSEOAnalysis ? Object.keys(data.enhancedSEOAnalysis) : [],
        seoScore: data.enhancedSEOAnalysis?.seoScore,
        dataKeys: Object.keys(data)
      })

      setAuditResult(data)
      
      // Track successful audit completion
      event({
        action: 'audit_completed',
        category: 'engagement',
        label: userPlan?.name || 'free',
        value: 1
      })
    } catch (err) {
      // Don't show error if the request was aborted
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Audit was cancelled by user')
        return
      }
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsAuditing(false)
      // Clear the abort controller reference
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Authentication required to access the audit page

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Site Audit</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/account")}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Account
              </button>
              <button
                onClick={() => router.push("/support")}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Support
              </button>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Page Audit</h1>
            <p className="mt-2 text-gray-600">
              Audit your website pages more thoroughly with comprehensive SEO analysis, accessibility checks, and technical metrics.
            </p>
          </div>

          {/* User Information */}
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>
                  <p className="text-gray-900">{user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Current Plan:</span>
                  {planLoading ? (
                    <p className="text-gray-500">Loading...</p>
                  ) : userPlan ? (
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        userPlan.id === 'free' 
                          ? 'bg-gray-100 text-gray-800'
                          : userPlan.id === 'basic'
                          ? 'bg-blue-100 text-blue-800'
                          : userPlan.id === 'pro'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {userPlan.name}
                      </span>
                      {userPlan.price > 0 && (
                        <span className="text-gray-600">${userPlan.price}/month</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500">Unknown</p>
                  )}
                </div>
                <div>
                  <span className="font-medium text-gray-700">Plan Features:</span>
                  {planLoading ? (
                    <p className="text-gray-500">Loading...</p>
                  ) : userPlan ? (
                    <p className="text-gray-900">
                      {userPlan.limits.auditsPer3Days !== undefined 
                        ? (userPlan.limits.auditsPer3Days === -1 ? 'Unlimited' : userPlan.limits.auditsPer3Days) + ' audit every 3 minutes (testing)'
                        : userPlan.limits.auditsPerDay !== undefined 
                        ? (userPlan.limits.auditsPerDay === -1 ? 'Unlimited' : userPlan.limits.auditsPerDay) + ' audits/day'
                        : (userPlan.limits.auditsPerMonth === -1 ? 'Unlimited' : userPlan.limits.auditsPerMonth) + ' audits/month'
                      }
                      {userPlan.limits.maxSites !== undefined && (
                        userPlan.limits.maxSites === -1 
                          ? ' • Unlimited sites'
                          : ` • ${userPlan.limits.maxSites} site${userPlan.limits.maxSites > 1 ? 's' : ''}`
                      )}
                      {userPlan.limits.maxPagesPerSite !== undefined && (
                        userPlan.limits.maxPagesPerSite === -1 
                          ? ' • Unlimited pages/site'
                          : ` • ${userPlan.limits.maxPagesPerSite} pages/site`
                      )}
                      {userPlan.limits.aiRecommendations && ' • AI insights'}
                      {userPlan.limits.historicalData && ' • Historical data'}
                      {userPlan.limits.competitorAnalysis && ' • Competitor analysis'}
                    </p>
                  ) : (
                    <p className="text-gray-500">Unknown</p>
                  )}
                </div>
              </div>
            </div>

          {/* Audit Form */}
          <AuditLimitGuard user={user}>
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Run New Page Audit</h2>
              <form onSubmit={runAudit} className="space-y-4">
                <div>
                  {url}
                </div>
                <div className="flex justify-end space-x-3">
                  {isAuditing && (
                    <button
                      type="button"
                      onClick={() => {
                        if (abortControllerRef.current) {
                          abortControllerRef.current.abort()
                          setIsAuditing(false)
                          setError(null)
                        }
                      }}
                      className="px-6 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                    >
                      Cancel Audit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isAuditing || !url.trim()}
                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAuditing ? 'Analyzing Page...' : 'Start Audit'}
                  </button>
                </div>
              </form>
            </div>
          </AuditLimitGuard>

          {/* Audit Results */}
          <AuditResults 
            result={auditResult} 
            loading={isAuditing} 
            error={error}
            url={url}
            user={user}
          />


          {/* Audit History for this specific website - Restricted for free tier */}
          {url && (
            <div className="mt-8">
              <PlanRestrictionGuard user={user} requiredFeature="historicalData">
                <AuditHistory 
                  siteId={siteId} 
                  limit={20} 
                  latestAuditResult={auditResult}
                  url={url}
                  user={user}
                />
              </PlanRestrictionGuard>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function AuditPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-lg">Loading...</div></div>}>
      <AuditPageContent />
    </Suspense>
  )
}
