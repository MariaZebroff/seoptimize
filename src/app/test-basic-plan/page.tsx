'use client'

import { useState, useEffect } from 'react'
import { getPlanById, type Plan } from '@/lib/plans'
import { SubscriptionClient } from '@/lib/subscriptionClient'

export default function TestBasicPlanPage() {
  const [userPlan, setUserPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [testMode, setTestMode] = useState(false)

  useEffect(() => {
    const loadPlan = async () => {
      try {
        if (testMode) {
          // Simulate Basic Plan for testing
          const basicPlan = getPlanById('basic')!
          setUserPlan(basicPlan)
        } else {
          // Load actual user plan
          const plan = await SubscriptionClient.getUserPlan()
          setUserPlan(plan)
        }
      } catch (error) {
        console.error('Error loading plan:', error)
        const freePlan = getPlanById('free')!
        setUserPlan(freePlan)
      } finally {
        setLoading(false)
      }
    }

    loadPlan()
  }, [testMode])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg">Loading plan information...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Basic Plan Test</h1>
          
          {/* Test Mode Toggle */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Test Mode</h3>
                <p className="text-gray-600">
                  Toggle to simulate Basic Plan for testing purposes
                </p>
              </div>
              <button
                onClick={() => setTestMode(!testMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  testMode
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {testMode ? 'Test Mode ON' : 'Test Mode OFF'}
              </button>
            </div>
          </div>

          {/* Plan Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Plan</h2>
            {userPlan ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                    <span className="text-lg font-semibold text-gray-900">
                      ${userPlan.price}/month
                    </span>
                  )}
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Plan Features:</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {userPlan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Plan Limits:</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Audits per month:</span>
                      <span className="ml-2 text-gray-600">
                        {userPlan.limits.auditsPerMonth === -1 ? 'Unlimited' : userPlan.limits.auditsPerMonth}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">AI Recommendations:</span>
                      <span className="ml-2 text-gray-600">
                        {userPlan.limits.aiRecommendations ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Competitor Analysis:</span>
                      <span className="ml-2 text-gray-600">
                        {userPlan.limits.competitorAnalysis ? 'Yes' : 'No'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Historical Data:</span>
                      <span className="ml-2 text-gray-600">
                        {userPlan.limits.historicalData ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No plan information available</p>
            )}
          </div>

          {/* Test Actions */}
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Test Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                View Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/audit'}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Test Audit Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}



