"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/supabaseAuth"
import { event } from "@/lib/gtag"
import Footer from "@/components/Footer"
import { useEffect } from "react"
import Link from "next/link"

export default function LandingPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.log('No user logged in')
      } finally {
        setLoading(false)
      }
    }
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 5000) // 5 second timeout
    
    checkUser()
    
    return () => clearTimeout(timeout)
  }, [])

  const pricingPlans = [
    {
      name: "Free",
      price: 0,
      period: "forever",
      description: "Perfect for getting started with page analysis",
      features: [
        "1 audit every 3 minutes",
        "1 website",
        "1 page per site",
        "Basic SEO analysis",
        "Performance metrics",
        "Accessibility checks"
      ],
      cta: "Start Free",
      popular: false,
      color: "gray"
    },
    {
      name: "Basic",
      price: 9.99,
      period: "month",
      description: "Ideal for small websites and blogs",
      features: [
        "2 audits per day",
        "1 website",
        "3 pages per site",
        "Historical data tracking",
        "PDF report downloads",
        "Score trends analysis",
        "Priority email support"
      ],
      cta: "Start Basic",
      popular: true,
      color: "blue"
    },
    {
      name: "Pro",
      price: 49.99,
      period: "month",
      description: "For agencies and growing businesses",
      features: [
        "Unlimited audits",
        "5 websites",
        "Unlimited pages per site",
        "AI-powered insights",
        "Competitor analysis",
        "White-label reports",
        "API access",
        "Priority support"
      ],
      cta: "Start Pro",
      popular: false,
      color: "purple"
    }
  ]

  const features = [
    {
      icon: "🔍",
      title: "Page-by-Page Analysis",
      description: "Analyze individual pages with detailed SEO insights, not just site-wide overviews. Get specific recommendations for each page."
    },
    {
      icon: "⚡",
      title: "Core Web Vitals",
      description: "Track Google's Core Web Vitals metrics including LCP, FID, and CLS for each page to improve search rankings."
    },
    {
      icon: "♿",
      title: "Accessibility Audits",
      description: "Ensure your pages are accessible to all users with comprehensive accessibility testing and improvement suggestions."
    },
    {
      icon: "📊",
      title: "Performance Insights",
      description: "Get detailed performance metrics, load times, and optimization recommendations for faster page speeds."
    },
    {
      icon: "📈",
      title: "Historical Tracking",
      description: "Monitor your page performance over time with historical data and trend analysis (Basic & Pro plans)."
    },
    {
      icon: "🤖",
      title: "AI Recommendations",
      description: "Get intelligent, actionable SEO recommendations powered by AI to improve your page rankings (Pro plan)."
    }
  ]

  const handleGetStarted = () => {
    if (user) {
      router.push("/dashboard")
    } else {
      router.push("/auth/signin")
    }
  }

  const handleStartAudit = () => {
    if (user) {
      router.push("/audit")
    } else {
      router.push("/auth/signin")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading SEO Optimize...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                SEO Optimize
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      event({
                        action: 'click',
                        category: 'navigation',
                        label: 'dashboard_button'
                      })
                      router.push("/dashboard")
                    }}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => {
                      event({
                        action: 'click',
                        category: 'navigation',
                        label: 'start_audit_button'
                      })
                      router.push("/audit")
                    }}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Start Audit
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      event({
                        action: 'click',
                        category: 'navigation',
                        label: 'signin_button'
                      })
                      router.push("/auth/signin")
                    }}
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      event({
                        action: 'click',
                        category: 'navigation',
                        label: 'signup_button'
                      })
                      router.push("/auth/signup")
                    }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Audit Your Website
              <span className="block text-indigo-600">Page by Page</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Get detailed SEO analysis for individual pages, not just site-wide overviews. 
              Analyze each page thoroughly with comprehensive insights and actionable recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleGetStarted}
                className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg"
              >
                {user ? "Go to Dashboard" : "Get Started Free"}
              </button>
              <button
                onClick={handleStartAudit}
                className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-colors shadow-lg"
              >
                {user ? "Start Page Audit" : "Sign Up to Start Audit"}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No credit card required • Free signup to get started
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Page-by-Page Analysis?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Traditional SEO tools analyze your entire website. We go deeper, analyzing each page individually 
              to give you specific, actionable insights for maximum impact.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get detailed page analysis in just 3 simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Enter Page URL</h3>
              <p className="text-gray-600">
                Simply paste the URL of the specific page you want to analyze. 
                No need to analyze your entire website.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-indigo-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Deep Analysis</h3>
              <p className="text-gray-600">
                Our system performs comprehensive analysis including SEO, performance, 
                accessibility, and Core Web Vitals for that specific page.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-indigo-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Insights</h3>
              <p className="text-gray-600">
                Receive detailed reports with specific recommendations to improve 
                that page's SEO performance and user experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600">
              Start free and upgrade as you need more detailed analysis
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                  plan.popular 
                    ? 'border-indigo-500 ring-2 ring-indigo-200' 
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => {
                    if (user) {
                      router.push("/pricing")
                    } else {
                      router.push("/auth/signup")
                    }
                  }}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : plan.name === 'Free'
                      ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Analyze Your Pages?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Start with a free page audit and see the difference detailed analysis can make 
            for your website's SEO performance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartAudit}
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              {user ? "Start Free Page Audit" : "Sign Up to Start Audit"}
            </button>
            <button
              onClick={() => router.push("/pricing")}
              className="bg-transparent text-white px-8 py-4 rounded-lg text-lg font-semibold border-2 border-white hover:bg-white hover:text-indigo-600 transition-colors"
            >
              View All Plans
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}