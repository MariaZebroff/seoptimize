"use client"

import { useState } from 'react'

interface PremiumAIFeaturesProps {
  onUpgrade?: () => void
}

export default function PremiumAIFeatures({ onUpgrade }: PremiumAIFeaturesProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly')

  const features = [
    {
      icon: '🤖',
      title: 'Advanced AI Insights',
      description: 'Get comprehensive SEO strategy recommendations powered by GPT-4',
      free: false
    },
    {
      icon: '📝',
      title: 'AI Content Generation',
      description: 'Generate unlimited optimized titles, meta descriptions, and content suggestions',
      free: false
    },
    {
      icon: '🔍',
      title: 'AI Keyword Research',
      description: 'Discover high-value keywords with AI-powered competition analysis',
      free: false
    },
    {
      icon: '🏆',
      title: 'Competitor Analysis',
      description: 'AI-powered competitor insights and gap analysis',
      free: false
    },
    {
      icon: '📊',
      title: 'Predictive Analytics',
      description: 'AI predictions for traffic, rankings, and conversion improvements',
      free: false
    },
    {
      icon: '🎯',
      title: 'Personalized Recommendations',
      description: 'AI that learns from your preferences and industry trends',
      free: false
    },
    {
      icon: '⚡',
      title: 'Priority Processing',
      description: 'Faster AI analysis and unlimited API requests',
      free: false
    },
    {
      icon: '📈',
      title: 'Advanced Reporting',
      description: 'Detailed AI insights reports with actionable recommendations',
      free: false
    }
  ]

  const plans = {
    monthly: {
      name: 'Monthly',
      price: '$29',
      period: '/month',
      savings: null,
      popular: false
    },
    yearly: {
      name: 'Yearly',
      price: '$290',
      period: '/year',
      savings: 'Save 17%',
      popular: true
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Unlock the Power of AI
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get advanced AI-powered SEO insights, content generation, and competitive analysis 
          to accelerate your website's growth and rankings.
        </p>
      </div>

      {/* Pricing Toggle */}
      <div className="flex justify-center">
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              selectedPlan === 'monthly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`px-6 py-2 rounded-md font-medium transition-colors ${
              selectedPlan === 'yearly'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Pricing Card */}
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {plans[selectedPlan].popular && (
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center py-2 text-sm font-medium">
              Most Popular
            </div>
          )}
          
          <div className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                AI Pro {plans[selectedPlan].name}
              </h3>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl font-bold text-gray-900">
                  {plans[selectedPlan].price}
                </span>
                <span className="text-xl text-gray-600 ml-1">
                  {plans[selectedPlan].period}
                </span>
              </div>
              {plans[selectedPlan].savings && (
                <p className="text-green-600 font-medium mt-2">
                  {plans[selectedPlan].savings}
                </p>
              )}
            </div>

            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-2xl mr-3">{feature.icon}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              Start Free Trial
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              14-day free trial • Cancel anytime • No credit card required
            </p>
          </div>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Feature Comparison</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Free
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  AI Pro
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Basic SEO Audit
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-green-600">✓</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-green-600">✓</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  AI Content Suggestions
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-gray-400">3 per day</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-green-600">Unlimited</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  AI Keyword Research
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-gray-400">5 keywords</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-green-600">Unlimited</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Competitor Analysis
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-red-600">✗</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-green-600">✓</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Predictive Analytics
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-red-600">✗</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-green-600">✓</span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Priority Support
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-gray-400">Community</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className="text-green-600">Email + Chat</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 rounded-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
          What Our Users Say
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {'★'.repeat(5)}
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              "The AI insights helped me increase my organic traffic by 150% in just 3 months. 
              The content suggestions are spot-on!"
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                JS
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">John Smith</p>
                <p className="text-sm text-gray-600">E-commerce Owner</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {'★'.repeat(5)}
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              "The keyword research feature is incredible. I found 20+ high-value keywords 
              I never would have discovered on my own."
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                MJ
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">Maria Johnson</p>
                <p className="text-sm text-gray-600">Blogger</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="flex text-yellow-400">
                {'★'.repeat(5)}
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              "The competitor analysis gave me insights that helped me outrank my biggest 
              competitor. Game changer!"
            </p>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                DR
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">David Rodriguez</p>
                <p className="text-sm text-gray-600">Marketing Director</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
          Frequently Asked Questions
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              How does the AI analysis work?
            </h4>
            <p className="text-gray-600">
              Our AI uses advanced machine learning models to analyze your website's content, 
              structure, and performance data. It then provides personalized recommendations 
              based on industry best practices and current SEO trends.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Can I cancel my subscription anytime?
            </h4>
            <p className="text-gray-600">
              Yes, you can cancel your subscription at any time. You'll continue to have 
              access to AI Pro features until the end of your current billing period.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Is there a free trial?
            </h4>
            <p className="text-gray-600">
              Yes! We offer a 14-day free trial with full access to all AI Pro features. 
              No credit card required to start your trial.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              How accurate are the AI predictions?
            </h4>
            <p className="text-gray-600">
              Our AI predictions are based on analysis of thousands of successful SEO campaigns. 
              While we can't guarantee specific results, our users typically see significant 
              improvements in their SEO performance.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
