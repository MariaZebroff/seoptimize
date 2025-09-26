"use client"

import { useState, useEffect } from 'react'
import { getCurrentUser, signOut } from '@/lib/supabaseAuth'
import { SubscriptionClient, type UserSubscription } from '@/lib/subscriptionClient'
import { getPlanById, type Plan } from '@/lib/plans'
import type { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface UserUsage {
  id: string
  user_id: string
  month: string
  audits_used: number
  ai_calls_used: number
  created_at: string
  updated_at: string
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userPlan, setUserPlan] = useState<Plan | null>(null)
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [userUsage, setUserUsage] = useState<UserUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get current user
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/signin')
        return
      }
      setUser(currentUser)

      // Load user plan
      const plan = await SubscriptionClient.getUserPlan()
      setUserPlan(plan)

      // Load user subscription details
      try {
        const subscription = await SubscriptionClient.getUserSubscription(currentUser.id)
        console.log('Account page - subscription data:', subscription)
        setUserSubscription(subscription)
      } catch (error) {
        console.error('Error loading user subscription:', error)
        // Subscription is optional, don't fail the whole page
      }

      // Load user usage
      try {
        const usage = await SubscriptionClient.getUserUsage()
        setUserUsage(usage)
      } catch (error) {
        console.error('Error loading user usage:', error)
        // Usage is optional, don't fail the whole page
      }

    } catch (error) {
      console.error('Error loading user data:', error)
      setError('Failed to load account information')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Error signing out:', error)
      setError('Failed to sign out')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDaysRemaining = (endDate: string) => {
    const now = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getPlanBadgeColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'bg-gray-100 text-gray-800'
      case 'basic':
        return 'bg-blue-100 text-blue-800'
      case 'pro':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading account information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadUserData}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-semibold text-gray-900">Account Settings</h1>
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
                Page Audit
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {user?.user_metadata?.avatar_url && (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.user_metadata.avatar_url}
                    alt="Profile"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {user?.user_metadata?.name || user?.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600 mt-1">Manage your account information and subscription</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">Signed in as</p>
                <p className="font-medium text-gray-900">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">👤</span>
              Account Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="flex items-center">
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-500">Verified</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User ID
                </label>
                <input
                  type="text"
                  value={user?.id || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Created
                </label>
                <input
                  type="text"
                  value={user?.created_at ? formatDate(user.created_at) : ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Sign In
                </label>
                <input
                  type="text"
                  value={user?.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Subscription Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">💳</span>
              Subscription Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Plan
                </label>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanBadgeColor(userPlan?.id || 'free')}`}>
                    {userPlan?.name || 'Free Tier'}
                  </span>
                  {userPlan?.popular && (
                    <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      Most Popular
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Price
                </label>
                <div className="text-2xl font-bold text-gray-900">
                  {userPlan?.price === 0 ? 'Free' : `$${userPlan?.price}/month`}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Features
                </label>
                <div className="space-y-2">
                  {userPlan?.features.slice(0, 5).map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </div>
                  ))}
                  {userPlan?.features.length > 5 && (
                    <div className="text-sm text-gray-500">
                      +{userPlan.features.length - 5} more features
                    </div>
                  )}
                </div>
              </div>

              {userSubscription && userSubscription.plan_id !== 'free' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase Date
                    </label>
                    <div className="text-sm text-gray-900">
                      {formatDateTime(userSubscription.created_at)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Period
                    </label>
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">Started:</span> {formatDate(userSubscription.current_period_start)}
                      </div>
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">Ends:</span> {formatDate(userSubscription.current_period_end)}
                      </div>
                      <div className="text-sm">
                        <span className={`font-medium ${getDaysRemaining(userSubscription.current_period_end) <= 7 ? 'text-red-600' : 'text-gray-600'}`}>
                          {getDaysRemaining(userSubscription.current_period_end) > 0 
                            ? `${getDaysRemaining(userSubscription.current_period_end)} days remaining`
                            : 'Period ended'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subscription Status
                    </label>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        userSubscription.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : userSubscription.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {userSubscription.status.charAt(0).toUpperCase() + userSubscription.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Fallback for when subscription data is not available but user has a paid plan */}
              {!userSubscription && userPlan && userPlan.id !== 'free' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <span className="text-yellow-600 mr-2">⚠️</span>
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800">Subscription Details Unavailable</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your plan is active, but detailed subscription information is not available. 
                        This may be due to a recent payment or system update.
                      </p>
                      <div className="mt-2 space-x-2">
                        <button
                          onClick={loadUserData}
                          className="text-sm text-yellow-800 underline hover:text-yellow-900"
                        >
                          Refresh Data
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/test/create-subscription', { 
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                  userId: user?.id
                                })
                              })
                              const data = await response.json()
                              if (data.success) {
                                alert('Test subscription created successfully!')
                                loadUserData()
                              } else {
                                alert('Failed to create subscription: ' + data.error)
                              }
                            } catch (error) {
                              alert('Error creating subscription: ' + error)
                            }
                          }}
                          className="text-sm text-yellow-800 underline hover:text-yellow-900"
                        >
                          Create Test Subscription
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/test/check-table')
                              const data = await response.json()
                              console.log('Table check results:', data)
                              if (data.tableExists) {
                                alert('✅ Table exists and is accessible!')
                              } else {
                                alert('❌ Table issue. Check console (F12) for details. Error: ' + (data.error || 'Unknown'))
                              }
                            } catch (error) {
                              alert('Error checking table: ' + error)
                            }
                          }}
                          className="text-sm text-yellow-800 underline hover:text-yellow-900"
                        >
                          Check Table Status
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/test/debug-db')
                              const data = await response.json()
                              console.log('Debug data:', data)
                              alert('Debug info logged to console. Check browser console (F12) for details.')
                            } catch (error) {
                              alert('Error debugging: ' + error)
                            }
                          }}
                          className="text-sm text-yellow-800 underline hover:text-yellow-900"
                        >
                          Debug Database
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/test/direct-table-test')
                              const data = await response.json()
                              console.log('Direct table test:', data)
                              if (data.success) {
                                alert('✅ Table accessible with service role!')
                              } else {
                                alert('❌ Service role test failed: ' + data.error)
                              }
                            } catch (error) {
                              alert('Error in direct test: ' + error)
                            }
                          }}
                          className="text-sm text-yellow-800 underline hover:text-yellow-900"
                        >
                          Direct Table Test
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/subscription/cleanup-expired', { method: 'POST' })
                              const data = await response.json()
                              if (data.success) {
                                alert(`✅ Cleanup completed! Processed ${data.processed} expired subscriptions.`)
                                loadUserData()
                              } else {
                                alert('❌ Cleanup failed: ' + data.error)
                              }
                            } catch (error) {
                              alert('Error running cleanup: ' + error)
                            }
                          }}
                          className="text-sm text-yellow-800 underline hover:text-yellow-900"
                        >
                          Cleanup Expired
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <a
                  href="/pricing"
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <span className="mr-2">🔄</span>
                  {userPlan?.id === 'free' ? 'Upgrade Plan' : 'Change Plan'}
                </a>
                
                {userSubscription && userSubscription.plan_id !== 'free' && userSubscription.status === 'active' && (
                  <button
                    onClick={async () => {
                      if (confirm('Are you sure you want to cancel your subscription? You will keep access until the end of your current billing period, then automatically switch to Free Tier.')) {
                        try {
                          const response = await fetch('/api/subscription/cancel', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                              userId: user?.id
                            })
                          })
                          const data = await response.json()
                          if (data.success) {
                            alert('Subscription cancelled successfully! You will keep access until ' + new Date(userSubscription.current_period_end).toLocaleDateString() + ', then switch to Free Tier.')
                            loadUserData()
                          } else {
                            alert('Failed to cancel subscription: ' + data.error)
                          }
                        } catch (error) {
                          alert('Error cancelling subscription: ' + error)
                        }
                      }
                    }}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <span className="mr-2">❌</span>
                    Cancel Plan
                  </button>
                )}
                
                {userSubscription && userSubscription.status === 'cancelled' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <span className="text-yellow-600 mr-2">⚠️</span>
                      <div>
                        <h4 className="text-sm font-medium text-yellow-800">Subscription Cancelled</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Your subscription will end on {formatDate(userSubscription.current_period_end)} and you'll switch to Free Tier.
                        </p>
                        <button
                          onClick={async () => {
                            if (confirm('Are you sure you want to reactivate your subscription?')) {
                              try {
                                const response = await fetch('/api/subscription/reactivate', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json'
                                  },
                                  body: JSON.stringify({
                                    userId: user?.id
                                  })
                                })
                                const data = await response.json()
                                if (data.success) {
                                  alert('Subscription reactivated successfully!')
                                  loadUserData()
                                } else {
                                  alert('Failed to reactivate subscription: ' + data.error)
                                }
                              } catch (error) {
                                alert('Error reactivating subscription: ' + error)
                              }
                            }
                          }}
                          className="mt-2 text-sm text-yellow-800 underline hover:text-yellow-900"
                        >
                          Reactivate Subscription
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Usage Statistics */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">📊</span>
              Usage Statistics
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Month
                </label>
                <div className="text-lg font-semibold text-gray-900">
                  {userUsage?.month || new Date().toISOString().slice(0, 7)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {userUsage?.audits_used || 0}
                  </div>
                  <div className="text-sm text-blue-800">Audits Used</div>
                  <div className="text-xs text-blue-600 mt-1">
                    {userPlan?.limits.auditsPerMonth === -1 
                      ? 'Unlimited' 
                      : `of ${userPlan?.limits.auditsPerMonth || 0}`
                    }
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {userUsage?.ai_calls_used || 0}
                  </div>
                  <div className="text-sm text-green-800">AI Calls Used</div>
                  <div className="text-xs text-green-600 mt-1">
                    {userPlan?.limits.aiRecommendations ? 'Available' : 'Not Available'}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <a
                  href="/dashboard"
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <span className="mr-2">📈</span>
                  View Dashboard
                </a>
              </div>
            </div>
          </div>

          {/* Plan Limits */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="mr-2">⚙️</span>
              Plan Limits
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Sites</span>
                  <span className="font-medium text-gray-900">
                    {userPlan?.limits.maxSites === -1 ? 'Unlimited' : userPlan?.limits.maxSites}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Pages per Site</span>
                  <span className="font-medium text-gray-900">
                    {userPlan?.limits.maxPagesPerSite === -1 ? 'Unlimited' : userPlan?.limits.maxPagesPerSite}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Audits per Month</span>
                  <span className="font-medium text-gray-900">
                    {userPlan?.limits.auditsPerMonth === -1 ? 'Unlimited' : userPlan?.limits.auditsPerMonth}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">AI Recommendations</span>
                  <span className={`font-medium ${userPlan?.limits.aiRecommendations ? 'text-green-600' : 'text-red-600'}`}>
                    {userPlan?.limits.aiRecommendations ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Competitor Analysis</span>
                  <span className={`font-medium ${userPlan?.limits.competitorAnalysis ? 'text-green-600' : 'text-red-600'}`}>
                    {userPlan?.limits.competitorAnalysis ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Export Reports</span>
                  <span className={`font-medium ${userPlan?.limits.exportReports ? 'text-green-600' : 'text-red-600'}`}>
                    {userPlan?.limits.exportReports ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Historical Data</span>
                  <span className={`font-medium ${userPlan?.limits.historicalData ? 'text-green-600' : 'text-red-600'}`}>
                    {userPlan?.limits.historicalData ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="mr-2">🔧</span>
            Account Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/pricing"
              className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <span className="mr-2">💳</span>
              Manage Subscription
            </a>
            
            <a
              href="/dashboard"
              className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <span className="mr-2">📊</span>
              View Dashboard
            </a>
            
            <button
              onClick={handleSignOut}
              className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <span className="mr-2">🚪</span>
              Sign Out
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
