"use client"



import { useState, useEffect, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getCurrentUser, getUserSites } from "@/lib/supabaseAuth"
import AuditResults from "@/components/AuditResults"
import AuditHistory from "@/components/AuditHistory"
import { AuditLimitGuard, PlanRestrictionGuard } from "@/components/PlanRestrictionGuard"
import { SubscriptionClient } from '@/lib/subscriptionClient'
import { Plan } from '@/lib/plans'
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

  // Load user plan
  const loadUserPlan = useCallback(async () => {
    try {
      if (user) {
        // Check localStorage for recent Pro Plan payment first
        try {
          const paymentData = localStorage.getItem('pro_plan_payment')
          if (paymentData) {
            const payment = JSON.parse(paymentData)
            // Check if payment is for this user and recent (within last 24 hours)
            if (payment.userId === user.id && 
                payment.planId === 'pro' && 
                (Date.now() - payment.timestamp) < 24 * 60 * 60 * 1000) {
              console.log('Audit page: Found recent Pro Plan payment for user:', user.id)
              const { getPlanById } = await import('@/lib/plans')
              const proPlan = getPlanById('pro')!
              setUserPlan(proPlan)
              return
            }
          }
        } catch (error) {
          console.error('Error checking localStorage payment:', error)
        }

        // Use proper subscription API to get user's actual plan
        const response = await fetch('/api/subscription/plan')
        if (response.ok) {
          const data = await response.json()
          if (data.plan) {
            setUserPlan(data.plan)
            console.log('Audit page: Loaded user plan:', data.plan.name)
          } else {
            // No subscription found, use basic plan for authenticated users
            const { getPlanById } = await import('@/lib/plans')
            const basicPlan = getPlanById('basic')!
            setUserPlan(basicPlan)
            console.log('Audit page: No subscription found, using basic plan')
          }
        } else {
          // API error, fallback to basic plan
          const { getPlanById } = await import('@/lib/plans')
          const basicPlan = getPlanById('basic')!
          setUserPlan(basicPlan)
          console.log('Audit page: API error, using basic plan')
        }
      } else {
        // For unauthenticated users, use free plan
        const { getPlanById } = await import('@/lib/plans')
        const freePlan = getPlanById('free')!
        setUserPlan(freePlan)
        console.log('Audit page: Using Free Plan for unauthenticated user')
      }
    } catch (error) {
      console.error('Error loading user plan:', error)
      // Fallback to Basic Plan for testing
      const { getPlanById } = await import('@/lib/plans')
      const basicPlan = getPlanById('basic')!
      setUserPlan(basicPlan)
    } finally {
      setPlanLoading(false)
    }
  }, [user])

  useEffect(() => {
    const getUser = async () => {
      const user = await getCurrentUser()
      console.log('Audit page: User state:', user ? 'authenticated' : 'unauthenticated')
      setUser(user) // Allow both authenticated and unauthenticated users
      
      if (user) {
        // Load user's sites only if authenticated
        const { data: sitesData } = await getUserSites()
        setSites(sitesData || [])
      }
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

  const runAudit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

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
        body: JSON.stringify({ 
          url: url.trim(), 
          siteId,
          userId: user?.id, // Pass user ID from client
          timestamp: Date.now() // Cache busting
        }),
      })

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsAuditing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  // Allow both authenticated and unauthenticated users to access the page

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Site Audit</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  ← Back to Dashboard
                </button>
              ) : (
                <button
                  onClick={() => router.push("/")}
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  ← Back to Home
                </button>
              )}
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
          {user && (
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
                      {userPlan.limits.auditsPerDay !== undefined 
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
          )}

          {/* Audit Form */}
          <AuditLimitGuard user={user}>
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Run New Page Audit</h2>
              <form onSubmit={runAudit} className="space-y-4">
                <div>
                  {url}
                </div>
                <div className="flex justify-end">
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
