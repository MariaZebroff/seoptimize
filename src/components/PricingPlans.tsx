'use client'

import React, { useState, useEffect } from 'react'
import PaymentForm from './PaymentForm'
import { PLANS, Plan } from '@/lib/plans'
import { getCurrentUser } from '@/lib/supabaseAuth'
import type { User } from '@supabase/supabase-js'

const PricingPlans: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    loadUser()
  }, [])

  const handleSelectPlan = (plan: Plan) => {
    // Skip free plan - no payment needed
    if (plan.id === 'free') {
      alert('You are already on the Free plan! You can start using the basic features right away.')
      return
    }
    
    setSelectedPlan(plan)
    setShowPaymentForm(true)
  }

  const handlePaymentSuccess = async (paymentIntent: any) => {
    console.log('Payment successful:', paymentIntent)
    
    try {
      // Directly update the user's subscription in the database
      const response = await fetch('/api/test/set-basic-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('Payment successful! Your plan has been activated. Redirecting to dashboard...')
        setShowPaymentForm(false)
        setSelectedPlan(null)
        // Redirect to dashboard to see the updated plan
        window.location.href = '/dashboard'
      } else {
        alert('Payment successful but failed to update subscription. Please contact support.')
        console.error('Failed to update subscription:', result.error)
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      alert('Payment successful but failed to update subscription. Please contact support.')
    }
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    alert(`Payment failed: ${error}`)
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get comprehensive SEO insights and improve your website's performance with our powerful audit tools.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-lg shadow-lg p-8 ${
              plan.popular ? 'ring-2 ring-indigo-500 transform scale-105' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-indigo-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
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
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                plan.id === 'free'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : plan.popular
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {plan.id === 'free' ? 'Start Free' : 'Get Started'}
            </button>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-600 mb-4">
          All plans include a 14-day free trial. Cancel anytime.
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
