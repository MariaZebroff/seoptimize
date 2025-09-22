"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AIInsights from './AIInsights'
import AIContentGenerator from './AIContentGenerator'
import AIKeywordResearch from './AIKeywordResearch'
import PremiumAIFeatures from './PremiumAIFeatures'
import AIKeySetup from './AIKeySetup'

interface AIDashboardProps {
  url: string
  auditResults: any
  currentContent?: string
  targetKeywords?: string[]
  industry?: string
  isPremium?: boolean
}

export default function AIDashboard({
  url,
  auditResults,
  currentContent = '',
  targetKeywords = [],
  industry = 'general',
  isPremium = false
}: AIDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'keywords' | 'competitors' | 'upgrade'>('overview')
  const [newUrl, setNewUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const router = useRouter()

  const tabs = [
    { id: 'overview', name: 'AI Overview', icon: '🤖', premium: false },
    { id: 'content', name: 'Content AI', icon: '✨', premium: true },
    { id: 'keywords', name: 'Keyword AI', icon: '🔍', premium: true },
    { id: 'competitors', name: 'Competitor AI', icon: '🏆', premium: true },
    { id: 'upgrade', name: 'Upgrade', icon: '💎', premium: false }
  ]

  // Calculate dynamic AI stats based on actual audit results
  const calculateAIStats = () => {
    const seoScore = auditResults?.seoScore || 0
    const performanceScore = auditResults?.performanceScore || 0
    const accessibilityScore = auditResults?.accessibilityScore || 0
    const bestPracticesScore = auditResults?.bestPracticesScore || 0
    
    // Calculate overall AI score (weighted average)
    const overallScore = Math.round((seoScore * 0.4 + performanceScore * 0.3 + accessibilityScore * 0.2 + bestPracticesScore * 0.1))
    
    // Get content quality from audit results
    const contentQuality = auditResults?.contentQuality || {}
    const contentScore = contentQuality.overallScore || 0
    const contentGrade = contentQuality.grade || 'F'
    
    // Calculate keyword opportunities (mock for now, would come from AI analysis)
    const keywordCount = auditResults?.keywordCount || 0
    const keywordOpportunities = Math.max(0, 20 - keywordCount) // Assume 20 is optimal
    
    // Calculate predicted impact based on current scores
    const improvementPotential = Math.max(0, 100 - overallScore)
    const predictedImpact = Math.round(improvementPotential * 0.3) // 30% of improvement potential
    
    return [
      {
        title: 'AI Analysis Score',
        value: `${overallScore}/100`,
        change: overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : 'Needs Work',
        trend: overallScore >= 70 ? 'up' : 'down',
        description: 'Overall AI-powered SEO assessment'
      },
      {
        title: 'Content Quality',
        value: contentGrade,
        change: contentScore >= 70 ? 'Good' : 'Needs Improvement',
        trend: contentScore >= 70 ? 'up' : 'down',
        description: 'AI-analyzed content optimization'
      },
      {
        title: 'Keyword Opportunities',
        value: keywordOpportunities.toString(),
        change: keywordOpportunities > 10 ? 'High' : keywordOpportunities > 5 ? 'Medium' : 'Low',
        trend: keywordOpportunities > 5 ? 'up' : 'down',
        description: 'High-value keywords discovered'
      },
      {
        title: 'Predicted Impact',
        value: `+${predictedImpact}%`,
        change: 'traffic',
        trend: predictedImpact > 20 ? 'up' : 'down',
        description: 'Expected improvement with AI recommendations'
      }
    ]
  }

  const aiStats = calculateAIStats()

  const quickActions = [
    {
      title: 'Generate Content',
      description: 'AI-powered titles and meta descriptions',
      icon: '📝',
      action: () => setActiveTab('content'),
      premium: true
    },
    {
      title: 'Research Keywords',
      description: 'Discover high-value keywords',
      icon: '🔍',
      action: () => setActiveTab('keywords'),
      premium: true
    },
    {
      title: 'Analyze Competitors',
      description: 'AI competitor insights',
      icon: '🏆',
      action: () => setActiveTab('competitors'),
      premium: true
    },
    {
      title: 'Get Full Analysis',
      description: 'Comprehensive AI insights',
      icon: '🤖',
      action: () => setActiveTab('overview'),
      premium: false
    }
  ]

  // Generate dynamic insights based on audit results
  const generateRecentInsights = () => {
    const insights = []
    
    // Check for title issues
    const titleLength = auditResults?.title?.length || 0
    if (titleLength > 60) {
      insights.push({
        type: 'content',
        title: 'Title Too Long',
        description: `Your title is ${titleLength} characters. Consider shortening to under 60 characters for better SEO.`,
        priority: 'high',
        impact: 'High impact on search result display'
      })
    } else if (titleLength < 30) {
      insights.push({
        type: 'content',
        title: 'Title Too Short',
        description: `Your title is only ${titleLength} characters. Consider adding more descriptive keywords.`,
        priority: 'medium',
        impact: 'Medium impact on keyword targeting'
      })
    }
    
    // Check for meta description issues
    const metaLength = auditResults?.metaDescription?.length || 0
    if (metaLength > 160) {
      insights.push({
        type: 'content',
        title: 'Meta Description Too Long',
        description: `Your meta description is ${metaLength} characters. Keep it under 160 for optimal display.`,
        priority: 'medium',
        impact: 'Medium impact on search result snippets'
      })
    } else if (metaLength < 120) {
      insights.push({
        type: 'content',
        title: 'Meta Description Too Short',
        description: `Your meta description is only ${metaLength} characters. Consider adding more compelling copy.`,
        priority: 'low',
        impact: 'Low impact on click-through rates'
      })
    }
    
    // Check for heading structure issues
    const h1Count = auditResults?.h1Count || 0
    if (h1Count === 0) {
      insights.push({
        type: 'content',
        title: 'Missing H1 Tag',
        description: 'Your page has no H1 heading. Add a descriptive H1 tag for better SEO structure.',
        priority: 'high',
        impact: 'High impact on content hierarchy and SEO'
      })
    }
    
    // Check for performance issues
    const performanceScore = auditResults?.performanceScore || 0
    if (performanceScore < 70) {
      insights.push({
        type: 'performance',
        title: 'Performance Issues',
        description: `Your performance score is ${performanceScore}/100. Consider optimizing images and reducing load time.`,
        priority: 'high',
        impact: 'High impact on user experience and rankings'
      })
    }
    
    // Check for SEO issues
    const seoScore = auditResults?.seoScore || 0
    if (seoScore < 70) {
      insights.push({
        type: 'seo',
        title: 'SEO Optimization Needed',
        description: `Your SEO score is ${seoScore}/100. Focus on technical SEO improvements.`,
        priority: 'high',
        impact: 'High impact on search rankings'
      })
    }
    
    // Check for broken links
    const brokenLinks = auditResults?.brokenLinks || []
    if (brokenLinks.length > 0) {
      insights.push({
        type: 'technical',
        title: 'Broken Links Found',
        description: `Found ${brokenLinks.length} broken link${brokenLinks.length > 1 ? 's' : ''}. Fix these to improve user experience.`,
        priority: 'medium',
        impact: 'Medium impact on user experience and SEO'
      })
    }
    
    // If no specific issues found, show general recommendations
    if (insights.length === 0) {
      insights.push({
        type: 'general',
        title: 'Good SEO Foundation',
        description: 'Your website has a solid SEO foundation. Consider advanced optimization strategies.',
        priority: 'low',
        impact: 'Low impact - focus on advanced strategies'
      })
    }
    
    return insights.slice(0, 3) // Show max 3 insights
  }

  const recentInsights = generateRecentInsights()

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'content': return '📝'
      case 'keyword': return '🔍'
      case 'competitor': return '🏆'
      case 'performance': return '⚡'
      case 'seo': return '🎯'
      case 'technical': return '🔧'
      case 'general': return '💡'
      default: return '📊'
    }
  }

  const handleAnalyzeNewUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUrl.trim()) return

    setIsAnalyzing(true)
    
    // Add protocol if missing
    let fullUrl = newUrl.trim()
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = `https://${fullUrl}`
    }

    // Navigate to AI dashboard with new URL
    router.push(`/ai?url=${encodeURIComponent(fullUrl)}`)
  }

  const handleRunFullAudit = () => {
    // Navigate to audit page with current URL
    router.push(`/audit?url=${encodeURIComponent(url)}`)
  }

  return (
    <div className="space-y-6">
      {/* API Key Setup Warning */}
      <AIKeySetup />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <span className="mr-3">🤖</span>
              AI SEO Dashboard
            </h1>
            <p className="text-purple-100 mt-2">
              Intelligent SEO optimization powered by advanced AI
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-purple-200">Plan Status</div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isPremium 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {isPremium ? 'AI Pro' : 'Free Plan'}
            </div>
          </div>
        </div>
        
        {/* Current URL Display */}
        <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-purple-200 mb-1">Currently Analyzing:</div>
              <div className="text-white font-medium">{url}</div>
            </div>
            <button
              onClick={handleRunFullAudit}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              📊 Run Full Audit
            </button>
          </div>
        </div>

        {/* URL Input Form */}
        <form onSubmit={handleAnalyzeNewUrl} className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Enter another website URL to analyze..."
              className="w-full px-4 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:ring-opacity-50"
              disabled={isAnalyzing}
            />
          </div>
          <button
            type="submit"
            disabled={isAnalyzing || !newUrl.trim()}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <span className="mr-2">🔍</span>
                Analyze
              </>
            )}
          </button>
        </form>
      </div>

      {/* AI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {aiStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
              <span className={`text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <p className="text-sm text-gray-500">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              disabled={action.premium && !isPremium}
              className={`p-4 rounded-lg border-2 transition-all ${
                action.premium && !isPremium
                  ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700 hover:text-purple-700'
              }`}
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <h3 className="font-medium mb-1">{action.title}</h3>
              <p className="text-sm text-gray-500">{action.description}</p>
              {action.premium && !isPremium && (
                <div className="mt-2">
                  <span className="inline-block px-2 py-1 bg-purple-100 text-purple-600 rounded text-xs font-medium">
                    Pro Feature
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Recent AI Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent AI Insights</h2>
        <div className="space-y-4">
          {recentInsights.map((insight, index) => (
            <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl mr-4">{getTypeIcon(insight.type)}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{insight.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(insight.priority)}`}>
                    {insight.priority.toUpperCase()}
                  </span>
                </div>
                <p className="text-gray-600 mb-2">{insight.description}</p>
                <p className="text-sm text-gray-500">{insight.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                disabled={tab.premium && !isPremium}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : tab.premium && !isPremium
                    ? 'border-transparent text-gray-400 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
                {tab.premium && !isPremium && (
                  <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-1 rounded">
                    Pro
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <AIInsights
              url={url}
              auditResults={auditResults}
              currentContent={currentContent}
              targetKeywords={targetKeywords}
              industry={industry}
            />
          )}

          {activeTab === 'content' && (
            <div>
              {isPremium ? (
                <AIContentGenerator
                  currentTitle={auditResults?.title || ''}
                  currentMetaDescription={auditResults?.metaDescription || ''}
                  content={currentContent}
                  targetKeywords={targetKeywords}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">✨</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Content Generation</h3>
                  <p className="text-gray-600 mb-6">
                    Generate optimized titles and meta descriptions with AI
                  </p>
                  <button
                    onClick={() => setActiveTab('upgrade')}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'keywords' && (
            <div>
              {isPremium ? (
                <AIKeywordResearch
                  url={url}
                  currentKeywords={targetKeywords}
                  industry={industry}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Keyword Research</h3>
                  <p className="text-gray-600 mb-6">
                    Discover high-value keywords with AI-powered analysis
                  </p>
                  <button
                    onClick={() => setActiveTab('upgrade')}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'competitors' && (
            <div>
              {isPremium ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🏆</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Competitor Analysis</h3>
                  <p className="text-gray-600 mb-6">
                    Coming soon! AI-powered competitor insights and gap analysis
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-blue-800 text-sm">
                      This feature is in development and will be available soon for Pro users.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🏆</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Competitor Analysis</h3>
                  <p className="text-gray-600 mb-6">
                    Get AI-powered insights on your competitors' strategies
                  </p>
                  <button
                    onClick={() => setActiveTab('upgrade')}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'upgrade' && (
            <PremiumAIFeatures />
          )}
        </div>
      </div>
    </div>
  )
}
