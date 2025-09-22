"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getCurrentUser } from "@/lib/supabaseAuth"
import AIDashboard from "@/components/AIDashboard"
import AIKeySetup from "@/components/AIKeySetup"
import URLInputForm from "@/components/URLInputForm"
import type { User } from "@supabase/supabase-js"

export default function AIPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [auditResults, setAuditResults] = useState<any>(null)
  const [auditLoading, setAuditLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const url = searchParams.get('url') || ''

  // Function to fetch audit results for a URL
  const fetchAuditResults = async (targetUrl: string) => {
    if (!targetUrl) return null
    
    setAuditLoading(true)
    try {
      const response = await fetch(`/api/audits?url=${encodeURIComponent(targetUrl)}`)
      if (response.ok) {
        const data = await response.json()
        return data.length > 0 ? data[0] : null
      }
    } catch (error) {
      console.error('Error fetching audit results:', error)
    } finally {
      setAuditLoading(false)
    }
    return null
  }

  useEffect(() => {
    const getUser = async () => {
      const user = await getCurrentUser()
      if (!user) {
        router.push("/auth/signin")
      } else {
        setUser(user)
      }
      setLoading(false)
    }
    getUser()
  }, [router])

  // Fetch audit results when URL changes
  useEffect(() => {
    if (url && user) {
      fetchAuditResults(url).then(setAuditResults)
    }
  }, [url, user])

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

  // Use real audit results or fallback to mock data
  const currentAuditResults = auditResults || {
    url: url || 'https://example.com',
    title: 'Example Website - Your Trusted Partner',
    metaDescription: 'Discover our comprehensive services and solutions designed to help your business grow and succeed in today\'s competitive market.',
    h1Count: 1,
    h2Count: 3,
    h3Count: 3,
    performanceScore: 75,
    seoScore: 82,
    accessibilityScore: 88,
    bestPracticesScore: 91,
    mobileScore: 78,
    timestamp: new Date().toISOString(),
    status: 'success' as const
  }

  const currentContent = auditResults 
    ? `${auditResults.title || ''} ${auditResults.metaDescription || ''}`
    : `${currentAuditResults.title} ${currentAuditResults.metaDescription}`
  
  const currentKeywords = auditResults?.keywords || ['business solutions', 'professional services', 'growth strategy', 'market success']

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-semibold text-gray-900">AI SEO Dashboard</h1>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </button>
              <button
                onClick={() => router.push("/audit")}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Site Audit
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user.user_metadata?.avatar_url && (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user.user_metadata?.name || user.email}
                </span>
              </div>
              <button
                onClick={() => router.push("/")}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <AIKeySetup />
          {url ? (
            auditLoading ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🤖</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading AI Analysis</h3>
                <p className="text-gray-600">Fetching audit results and preparing AI insights...</p>
                <div className="mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              </div>
            ) : (
              <AIDashboard
                url={url}
                auditResults={currentAuditResults}
                currentContent={currentContent}
                targetKeywords={currentKeywords}
                industry="business"
                isPremium={false} // This would come from user subscription status
              />
            )
          ) : (
            <URLInputForm />
          )}
        </div>
      </main>
    </div>
  )
}
