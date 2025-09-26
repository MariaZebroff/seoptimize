"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("faq")
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I run my first SEO audit?",
          answer: "To run your first audit, go to the Audit page and enter your website URL. Click 'Start Audit' and wait for the analysis to complete. You'll receive comprehensive SEO insights including performance, accessibility, and best practices scores."
        },
        {
          question: "What's the difference between Free, Basic, and Pro plans?",
          answer: "Free Plan: 1 audit every 3 minutes, 1 site, 1 page per site. Basic Plan: 2 audits per day, 1 site, 3 pages per site, historical data. Pro Plan: Unlimited audits, 5 sites, unlimited pages, AI insights, competitor analysis, and priority support."
        },
        {
          question: "How accurate are the audit results?",
          answer: "Our audits use Google's PageSpeed Insights API and advanced web scraping techniques to provide highly accurate results. We analyze real-world performance metrics, accessibility standards, and SEO best practices."
        }
      ]
    },
    {
      category: "Account & Billing",
      questions: [
        {
          question: "How do I upgrade or downgrade my plan?",
          answer: "Go to the Pricing page and select your desired plan. For upgrades, you'll be charged immediately. For downgrades, changes take effect at your next billing cycle. You can also manage your subscription in your Account settings."
        },
        {
          question: "Can I cancel my subscription anytime?",
          answer: "Yes, you can cancel your subscription at any time from your Account page. Your access will continue until the end of your current billing period. You can also reactivate your subscription later if needed."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, MasterCard, American Express) and debit cards through our secure Stripe payment processor. All payments are processed securely and encrypted."
        },
        {
          question: "Do you offer refunds?",
          answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with our service, contact our support team within 30 days of your purchase for a full refund."
        }
      ]
    },
    {
      category: "Technical Issues",
      questions: [
        {
          question: "Why is my audit taking so long?",
          answer: "Audits typically take 30-60 seconds to complete. Longer times may occur for large websites or when the target site is slow to respond. If an audit takes more than 2 minutes, try refreshing the page or contact support."
        },
        {
          question: "What if my website is blocked or returns an error?",
          answer: "Some websites block automated requests for security reasons. Try using the HTTP audit method instead of PSI, or ensure your website allows our audit bots. Contact support if you continue experiencing issues."
        },
        {
          question: "Can I audit password-protected or private websites?",
          answer: "No, our audits can only analyze publicly accessible websites. Password-protected, private, or local development sites cannot be audited through our system."
        },
        {
          question: "Why am I getting 'Audit limit reached' errors?",
          answer: "Each plan has specific audit limits. Free users can run 1 audit every 3 minutes. If you've reached your limit, wait for the time period to reset or upgrade your plan for higher limits."
        }
      ]
    },
    {
      category: "Features & Usage",
      questions: [
        {
          question: "What SEO metrics do you analyze?",
          answer: "We analyze Core Web Vitals (LCP, FID, CLS), page speed, mobile optimization, accessibility, SEO best practices, content quality, meta tags, heading structure, image optimization, and link analysis."
        },
        {
          question: "Can I track my website's SEO progress over time?",
          answer: "Yes! Pro and Basic plan users get access to historical data and score trends. You can see how your website's performance improves over time and track your SEO optimization efforts."
        },
        {
          question: "How do I export my audit results?",
          answer: "Pro and Basic plan users can download detailed PDF reports of their audit results. Look for the 'Download PDF Report' button on your audit results page."
        },
        {
          question: "Can I audit multiple pages of my website?",
          answer: "Yes! Free users can audit 1 page per site, Basic users can audit 3 pages per site, and Pro users can audit unlimited pages. Use the 'Add Sub-page' feature to analyze additional pages."
        }
      ]
    }
  ]

  const filteredFaqs = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  const contactMethods = [
    {
      title: "Email Support",
      description: "Get help via email within 24 hours",
      contact: "support@seoptimize.com",
      icon: "📧"
    },
    {
      title: "Priority Support",
      description: "Pro plan users get priority support",
      contact: "support@seoptimize.com",
      icon: "⭐"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Support Center</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/")}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              How can we help you?
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Find answers to common questions or get in touch with our support team
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-10 pr-4 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border">
              <button
                onClick={() => setActiveTab("faq")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "faq"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                FAQ
              </button>
              <button
                onClick={() => setActiveTab("contact")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "contact"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Contact Us
              </button>
              <button
                onClick={() => setActiveTab("resources")}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "resources"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                Resources
              </button>
            </div>
          </div>

          {/* FAQ Tab */}
          {activeTab === "faq" && (
            <div className="space-y-8">
              {filteredFaqs.length === 0 && searchQuery ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No results found for "{searchQuery}"</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-4 text-indigo-600 hover:text-indigo-500"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                filteredFaqs.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-xl font-semibold text-gray-900">{category.category}</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {category.questions.map((faq, faqIndex) => (
                        <FAQItem key={faqIndex} question={faq.question} answer={faq.answer} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === "contact" && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Get in Touch</h2>
                <p className="text-gray-600">Choose the best way to reach our support team</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
                {contactMethods.map((method, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border p-6 text-center">
                    <div className="text-4xl mb-4">{method.icon}</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
                    <p className="text-gray-600 mb-4">{method.description}</p>
                    <p className="text-indigo-600 font-medium">{method.contact}</p>
                  </div>
                ))}
              </div>

              {/* Contact Form */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Send us a message</h3>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="What can we help you with?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Describe your issue or question..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === "resources" && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Helpful Resources</h2>
                <p className="text-gray-600">Learn more about SEO and how to use our platform</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ResourceCard
                  title="SEO Best Practices Guide"
                  description="Learn the fundamentals of SEO optimization"
                  type="Guide"
                  link="#"
                />
                <ResourceCard
                  title="Understanding Core Web Vitals"
                  description="Everything you need to know about Google's performance metrics"
                  type="Article"
                  link="#"
                />
                <ResourceCard
                  title="Video Tutorials"
                  description="Step-by-step video guides for using our platform"
                  type="Video"
                  link="#"
                />
                <ResourceCard
                  title="API Documentation"
                  description="Technical documentation for developers"
                  type="Documentation"
                  link="#"
                />
                <ResourceCard
                  title="Webinar: Advanced SEO"
                  description="Join our monthly webinar on advanced SEO techniques"
                  type="Webinar"
                  link="#"
                />
                <ResourceCard
                  title="Community Forum"
                  description="Connect with other users and share tips"
                  type="Community"
                  link="#"
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

// FAQ Item Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="px-6 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left flex justify-between items-center focus:outline-none"
      >
        <h3 className="text-lg font-medium text-gray-900 pr-4">{question}</h3>
        <svg
          className={`h-5 w-5 text-gray-500 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="mt-4 pr-8">
          <p className="text-gray-600 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

// Resource Card Component
function ResourceCard({ 
  title, 
  description, 
  type, 
  link 
}: { 
  title: string; 
  description: string; 
  type: string; 
  link: string; 
}) {
  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "guide": return "bg-blue-100 text-blue-800"
      case "article": return "bg-green-100 text-green-800"
      case "video": return "bg-purple-100 text-purple-800"
      case "documentation": return "bg-gray-100 text-gray-800"
      case "webinar": return "bg-orange-100 text-orange-800"
      case "community": return "bg-pink-100 text-pink-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(type)}`}>
          {type}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <a
        href={link}
        className="text-indigo-600 hover:text-indigo-500 font-medium text-sm"
      >
        Learn more →
      </a>
    </div>
  )
}
