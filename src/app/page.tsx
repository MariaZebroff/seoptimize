"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/supabaseAuth"
import type { User } from "@supabase/supabase-js"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const user = await getCurrentUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">SEO Optimize</h1>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
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
                  <Link
                    href="/dashboard"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/ai"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    AI Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Welcome to SEO Optimize
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Optimize your website&apos;s SEO with AI-powered insights and intelligent recommendations.
            </p>
            <div className="mt-5 max-w-2xl mx-auto sm:flex sm:justify-center md:mt-8">
              {user ? (
                <div className="rounded-md shadow">
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                <div className="rounded-md shadow sm:flex">
                  <Link
                    href="/auth/signup"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
                  >
                    Get started
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="mt-3 w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 md:mt-0 md:ml-3 md:py-4 md:text-lg md:px-10"
                  >
                    Sign in
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                AI-Powered SEO Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Leverage advanced AI to get intelligent insights and recommendations for your website
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Insights</h3>
                <p className="text-gray-600">
                  Get comprehensive SEO analysis powered by advanced AI that learns from your data and provides personalized recommendations.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Content Generation</h3>
                <p className="text-gray-600">
                  Generate optimized titles, meta descriptions, and content suggestions that are tailored to your target audience and keywords.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Keyword Research</h3>
                <p className="text-gray-600">
                  Discover high-value keywords with AI-powered analysis of search volume, competition, and relevance to your business.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Competitor Analysis</h3>
                <p className="text-gray-600">
                  Get AI-powered insights into your competitors' strategies and identify opportunities to outperform them.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Predictive Analytics</h3>
                <p className="text-gray-600">
                  AI predictions for traffic growth, ranking improvements, and conversion rate optimization based on your optimization efforts.
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Personalized Strategy</h3>
                <p className="text-gray-600">
                  AI that learns from your preferences and industry trends to provide increasingly relevant and effective recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
