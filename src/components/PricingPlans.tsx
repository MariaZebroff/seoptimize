'use client'

import React, { useState, useEffect } from 'react'
import PaymentForm from './PaymentForm'
import { PLANS, Plan } from '@/lib/plans'
import { getCurrentUser } from '@/lib/supabaseAuth'
import { SubscriptionClient, type UserSubscription } from '@/lib/subscriptionClient'
import { useNotification } from '@/hooks/useNotification'
import type { User } from '@supabase/supabase-js'

const PricingPlans: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null)
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const { success, error: showError, warning } = useNotification()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        setLoading(true)
        const currentUser = await getCurrentUser()
        setUser(currentUser)
        
        if (currentUser) {
          // Load current plan
          const plan = await SubscriptionClient.getUserPlan()
          setCurrentPlan(plan)
          
          // Load subscription details
          const subscription = await SubscriptionClient.getUserSubscription(currentUser.id)
          setUserSubscription(subscription)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadUserData()
  }, [])

  const handleSelectPlan = (plan: Plan) => {
    // Check if user is already on this plan
    if (currentPlan && plan.id === currentPlan.id) {
      warning(`You are already on the ${plan.name}!`, 'Current Plan')
      return
    }
    
    // Skip free plan - no payment needed
    if (plan.id === 'free') {
      if (confirm('Are you sure you want to switch to the Free plan? You will lose access to premium features.')) {
        // Handle downgrade to free plan
        handlePlanChange(plan)
      }
      return
    }
    
    setSelectedPlan(plan)
    setShowPaymentForm(true)
  }

  const handlePlanChange = async (plan: Plan) => {
    try {
      const response = await fetch('/api/subscription/change-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          planId: plan.id
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        success(`Successfully switched to ${plan.name}!`, 'Plan Changed')
        // Reload user data
        window.location.reload()
      } else {
        showError('Failed to change plan: ' + result.error, 'Plan Change Failed')
      }
    } catch (error) {
      console.error('Error changing plan:', error)
      showError('Error changing plan: ' + error, 'Plan Change Error')
    }
  }

  const handlePaymentSuccess = async (paymentIntent: any) => {
    console.log('Payment successful:', paymentIntent)
    
    // Ensure subscription is created in database
    if (selectedPlan && user) {
      try {
        console.log('Creating subscription in database for plan:', selectedPlan.id)
        const response = await fetch('/api/payment/create-subscription', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            amount: selectedPlan.price
          })
        })
        
        const result = await response.json()
        if (result.success) {
          console.log('✅ Subscription created successfully:', result.subscription)
          success('Payment successful! Your plan is now active. Redirecting to dashboard...', 'Payment Complete')
        } else {
          console.error('❌ Subscription creation failed:', result.error)
          console.error('Error details:', result.details)
          console.error('Error solution:', result.solution)
          
          let errorMessage = 'Payment successful but failed to activate plan.\n\n'
          errorMessage += `Error: ${result.error}\n`
          if (result.details) {
            errorMessage += `Details: ${result.details}\n`
          }
          if (result.solution) {
            errorMessage += `Solution: ${result.solution}`
          }
          
          showError(errorMessage, 'Activation Failed')
        }
      } catch (error) {
        console.error('Error creating subscription:', error)
        showError('Payment successful but failed to activate plan. Please contact support.', 'Activation Error')
      }
    }
    
    setShowPaymentForm(false)
    setSelectedPlan(null)
    
    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = '/dashboard'
    }, 2000)
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    showError(`Payment failed: ${error}`, 'Payment Error')
  }

  if (showPaymentForm && selectedPlan) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Your Purchase
            </h2>
            <p className="text-gray-600">
              {selectedPlan.name} - ${selectedPlan.price}/month
            </p>
          </div>
          
          <PaymentForm
            amount={selectedPlan.price}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            metadata={{
              plan: selectedPlan.id,
              planName: selectedPlan.name,
              userId: user?.id || ''
            }}
          />
          
          <button
            onClick={() => setShowPaymentForm(false)}
            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to plans
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading your current plan...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {user ? 'Change Your Plan' : 'Choose Your Plan'}
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {user 
            ? `You are currently on the ${currentPlan?.name || 'Free Tier'}. Choose a different plan below.`
            : 'Get comprehensive SEO insights and improve your website\'s performance with our powerful audit tools.'
          }
        </p>
        {user && currentPlan && (
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            <span className="mr-2">📋</span>
            Current Plan: {currentPlan.name} - ${currentPlan.price === 0 ? 'Free' : currentPlan.price}/month
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan && plan.id === currentPlan.id
          const isCancelled = userSubscription?.status === 'cancelled' || false
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-lg shadow-lg p-8 ${
                plan.popular && !isCurrentPlan ? 'ring-2 ring-indigo-500 transform scale-105' : ''
              } ${isCurrentPlan ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
            >
              {plan.popular && !isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              {isCurrentPlan && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                    isCancelled 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-green-500 text-white'
                  }`}>
                    {isCancelled ? 'Current (Cancelled)' : 'Current Plan'}
                  </span>
                </div>
              )}

            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h3>
              <p className="text-gray-600 mb-4">
                {plan.description}
              </p>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {plan.price === 0 ? 'Free' : `$${plan.price}`}
                {plan.price > 0 && <span className="text-lg font-normal text-gray-500">/month</span>}
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSelectPlan(plan)}
              disabled={!!(isCurrentPlan && !isCancelled)}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                isCurrentPlan && !isCancelled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : plan.id === 'free'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : plan.popular
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {isCurrentPlan && !isCancelled 
                ? 'Current Plan' 
                : isCurrentPlan && isCancelled
                ? 'Switch to Free'
                : plan.id === 'free' 
                ? 'Switch to Free' 
                : 'Upgrade to ' + plan.name
              }
            </button>
          </div>
          )
        })}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">
          Cancel anytime. No long-term commitments.
        </p>
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure payments
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Money-back guarantee
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingPlans
