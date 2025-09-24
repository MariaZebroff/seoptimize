'use client'

import React, { useState, useEffect } from 'react'
import { SubscriptionClient } from '@/lib/subscriptionClient'
import { Plan, getPlanById } from '@/lib/plans'
import { User } from '@supabase/supabase-js'

interface PlanRestrictionGuardProps {
  children: React.ReactNode
  requiredFeature?: keyof Plan['limits']
  fallbackComponent?: React.ReactNode
  user: User | null
}

export const PlanRestrictionGuard: React.FC<PlanRestrictionGuardProps> = ({
  children,
  requiredFeature,
  fallbackComponent,
  user
}) => {
  const [userPlan, setUserPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(true) // Default to true for unauthenticated users

  useEffect(() => {
    const checkAccess = async () => {
      console.log('PlanRestrictionGuard: Starting checkAccess, user:', user ? 'authenticated' : 'unauthenticated', 'requiredFeature:', requiredFeature)
      try {
        if (!user) {
          // For unauthenticated users, use free plan
          const freePlan = getPlanById('free')!
          setUserPlan(freePlan)
          setHasAccess(requiredFeature ? freePlan.limits[requiredFeature] === true : true)
        } else {
          // Check localStorage for recent Pro Plan payment first
          try {
            const paymentData = localStorage.getItem('pro_plan_payment')
            if (paymentData) {
              const payment = JSON.parse(paymentData)
              // Check if payment is for this user and recent (within last 24 hours)
              if (payment.userId === user.id && 
                  payment.planId === 'pro' && 
                  (Date.now() - payment.timestamp) < 24 * 60 * 60 * 1000) {
                console.log('PlanRestrictionGuard: Found recent Pro Plan payment for user:', user.id)
                const proPlan = getPlanById('pro')!
                setUserPlan(proPlan)
                
                if (requiredFeature) {
                  const hasFeatureAccess = proPlan.limits[requiredFeature] === true
                  setHasAccess(hasFeatureAccess)
                  console.log('PlanRestrictionGuard: Pro Plan feature access for', requiredFeature, ':', proPlan.limits[requiredFeature], 'hasAccess:', hasFeatureAccess)
                } else {
                  setHasAccess(true)
                }
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
              console.log('PlanRestrictionGuard: Loaded user plan:', data.plan.name)
              
              if (requiredFeature) {
                const hasFeatureAccess = data.plan.limits[requiredFeature] === true
                setHasAccess(hasFeatureAccess)
                console.log('PlanRestrictionGuard: Feature access for', requiredFeature, ':', data.plan.limits[requiredFeature], 'hasAccess:', hasFeatureAccess)
              } else {
                setHasAccess(true)
              }
              return
            }
          }

          // Fallback to Basic Plan for authenticated users
          const basicPlan = getPlanById('basic')!
          setUserPlan(basicPlan)
          console.log('PlanRestrictionGuard: Using Basic Plan for authenticated user:', user.id)

          if (requiredFeature) {
            const hasFeatureAccess = basicPlan.limits[requiredFeature] === true
            setHasAccess(hasFeatureAccess)
            console.log('PlanRestrictionGuard: Feature access for', requiredFeature, ':', basicPlan.limits[requiredFeature], 'hasAccess:', hasFeatureAccess)
          } else {
            setHasAccess(true)
          }
        }
      } catch (error) {
        console.error('Error checking plan access:', error)
        // Fallback plan based on user authentication status
        if (!user) {
          // For unauthenticated users, use free plan
          const freePlan = getPlanById('free')!
          setUserPlan(freePlan)
          setHasAccess(requiredFeature ? freePlan.limits[requiredFeature] === true : true)
        } else {
          // Check localStorage for recent Pro Plan payment in error fallback
          try {
            const paymentData = localStorage.getItem('pro_plan_payment')
            if (paymentData) {
              const payment = JSON.parse(paymentData)
              if (payment.userId === user.id && 
                  payment.planId === 'pro' && 
                  (Date.now() - payment.timestamp) < 24 * 60 * 60 * 1000) {
                const proPlan = getPlanById('pro')!
                setUserPlan(proPlan)
                setHasAccess(requiredFeature ? proPlan.limits[requiredFeature] === true : true)
                return
              }
            }
          } catch (error) {
            console.error('Error checking localStorage payment in fallback:', error)
          }

          // For authenticated users, use Basic Plan for testing
          const basicPlan = getPlanById('basic')!
          setUserPlan(basicPlan)
          setHasAccess(requiredFeature ? basicPlan.limits[requiredFeature] === true : true)
        }
      } finally {
        setLoading(false)
      }
    }

    checkAccess()
  }, [user, requiredFeature])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-gray-500">Checking access...</div>
      </div>
    )
  }

  if (!hasAccess) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>
    }

    // Show different messages based on the user's plan and feature
    const isBasicPlan = userPlan?.id === 'basic'
    const isHistoricalData = requiredFeature === 'historicalData'

    if (isBasicPlan && isHistoricalData) {
      // Special message for Basic Plan users about historical data
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-lg font-medium text-blue-800">
              Historical Data & Charts
            </h3>
          </div>
          <p className="mt-2 text-blue-700">
            Here you will see your audit history and performance charts. Start your first audit to begin tracking your website's progress over time.
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-800 bg-blue-100">
              ✓ Available with Basic Plan
            </span>
          </div>
        </div>
      )
    }

    // Default restriction message for other cases
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-yellow-800">
            {requiredFeature === 'aiRecommendations' && 'AI Recommendations'}
            {requiredFeature === 'competitorAnalysis' && 'Competitor Analysis'}
            {requiredFeature === 'historicalData' && 'Historical Data'}
            {requiredFeature === 'exportReports' && 'Export Reports'}
            {requiredFeature === 'apiAccess' && 'API Access'}
            {requiredFeature === 'whiteLabel' && 'White-label Reports'}
            {requiredFeature === 'prioritySupport' && 'Priority Support'}
            {requiredFeature === 'customIntegrations' && 'Custom Integrations'}
            {' '}Not Available
          </h3>
        </div>
        <p className="mt-2 text-yellow-700">
          This feature is not available in your current plan ({userPlan?.name || 'Free'}).
        </p>
        <div className="mt-4">
          <a
            href="/pricing"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Upgrade Plan
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

interface AuditLimitGuardProps {
  children: React.ReactNode
  user: User | null
  onLimitReached?: () => void
}

export const AuditLimitGuard: React.FC<AuditLimitGuardProps> = ({
  children,
  user,
  onLimitReached
}) => {
  const [canPerformAudit, setCanPerformAudit] = useState(true) // Default to true for unauthenticated users
  const [remainingAudits, setRemainingAudits] = useState(0)
  const [loading, setLoading] = useState(true)
  const [reason, setReason] = useState<string>()

  useEffect(() => {
    const checkAuditLimit = async () => {
      console.log('AuditLimitGuard: Checking audit limit for user:', user ? 'authenticated' : 'unauthenticated')
      
      try {
        if (!user) {
          // For unauthenticated users, use free plan with weekly limits
          console.log('AuditLimitGuard: Using Free Plan for unauthenticated user')
          const freePlan = getPlanById('free')!
          setCanPerformAudit(true) // Allow first audit
          setRemainingAudits(freePlan.limits.auditsPerMonth)
          setReason(undefined)
        } else {
          // Check localStorage for recent Pro Plan payment first
          try {
            const paymentData = localStorage.getItem('pro_plan_payment')
            if (paymentData) {
              const payment = JSON.parse(paymentData)
              // Check if payment is for this user and recent (within last 24 hours)
              if (payment.userId === user.id && 
                  payment.planId === 'pro' && 
                  (Date.now() - payment.timestamp) < 24 * 60 * 60 * 1000) {
                console.log('AuditLimitGuard: Found recent Pro Plan payment for user:', user.id)
                const proPlan = getPlanById('pro')!
                setCanPerformAudit(true) // Pro Plan has unlimited audits
                setRemainingAudits(-1) // -1 means unlimited
                setReason(undefined)
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
              console.log('AuditLimitGuard: Loaded user plan:', data.plan.name)
              setCanPerformAudit(true) // Allow audits (limits enforced by API)
              setRemainingAudits(data.plan.limits.auditsPerMonth)
              setReason(undefined)
              return
            }
          }

          // Fallback to Basic Plan for authenticated users
          console.log('AuditLimitGuard: Using Basic Plan for authenticated user')
          const basicPlan = getPlanById('basic')!
          setCanPerformAudit(true) // Allow audits (limits enforced by API)
          setRemainingAudits(basicPlan.limits.auditsPerMonth)
          setReason(undefined)
        }
      } catch (error) {
        console.error('Error checking audit limit:', error)
        
        // Check localStorage for recent Pro Plan payment in error fallback
        if (user) {
          try {
            const paymentData = localStorage.getItem('pro_plan_payment')
            if (paymentData) {
              const payment = JSON.parse(paymentData)
              if (payment.userId === user.id && 
                  payment.planId === 'pro' && 
                  (Date.now() - payment.timestamp) < 24 * 60 * 60 * 1000) {
                const proPlan = getPlanById('pro')!
                setCanPerformAudit(true)
                setRemainingAudits(-1) // -1 means unlimited
                setReason(undefined)
                return
              }
            }
          } catch (error) {
            console.error('Error checking localStorage payment in fallback:', error)
          }
        }
        
        // Fallback to allowing audits
        const basicPlan = getPlanById('basic')!
        setCanPerformAudit(true)
        setRemainingAudits(basicPlan.limits.auditsPerMonth)
        setReason(undefined)
      } finally {
        setLoading(false)
      }
    }

    checkAuditLimit()
  }, [user, onLimitReached])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-sm text-gray-500">Checking audit limit...</div>
      </div>
    )
  }

  if (!canPerformAudit) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-red-800">
            Monthly Audit Limit Reached
          </h3>
        </div>
        <p className="mt-2 text-red-700">
          {reason || 'You have reached your monthly audit limit.'}
        </p>
        <div className="mt-4">
          <a
            href="/pricing"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Upgrade Plan
          </a>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
