"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getCurrentUser, getUserSites } from "@/lib/supabaseAuth"
import AuditResults from "@/components/AuditResults"
import AuditHistory from "@/components/AuditHistory"
import type { User } from "@supabase/supabase-js"

interface AuditResult {
  title: string
  metaDescription: string
  h1Tags: string[]
  brokenLinks: Array<{url: string, text: string}>
  brokenLinkDetails?: Array<{
    url: string
    statusCode: number
    statusText: string
    reason: string
    parent: string
    tag: string
    attribute: string
    linkText: string
    isInternal: boolean
    isBroken: boolean
  }>
  brokenLinkSummary?: {
    total: number
    broken: number
    status: string
    duration: number
  }
  mobileScore: number
  performanceScore: number
  accessibilityScore: number
  seoScore: number
  bestPracticesScore: number
  url: string
  timestamp: string
  status: 'success' | 'error'
  error?: string
}

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
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const getUser = async () => {
      const user = await getCurrentUser()
      if (!user) {
        router.push("/auth/signin")
      } else {
        setUser(user)
        // Load user's sites
        const { data: sitesData } = await getUserSites()
        setSites(sitesData || [])
      }
      setLoading(false)
    }
    getUser()
  }, [router])

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
        },
        body: JSON.stringify({ url: url.trim(), siteId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to run audit')
      }

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

  if (!user) {
    return null
  }

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
            <h1 className="text-3xl font-bold text-gray-900">Website Audit</h1>
            <p className="mt-2 text-gray-600">
              Analyze your website&apos;s SEO performance, accessibility, and technical metrics.
            </p>
          </div>

          {/* Audit Form */}
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Run New Audit For Websitenk cell</h2>
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
                  {isAuditing ? 'Running Audit...' : 'Start Audit'}
                </button>
              </div>
            </form>
          </div>

          {/* Audit Results */}
          <AuditResults 
            result={auditResult} 
            loading={isAuditing} 
            error={error} 
          />

          {/* Audit History for this specific website */}
          {url && (
            <div className="mt-8">
              <AuditHistory siteId={siteId} limit={20} />
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
