"use client"

import { useState, useEffect } from 'react'
import { AIService } from '@/lib/aiService'

interface AIInsightsProps {
  url: string
  auditResults: any
  currentContent?: string
  targetKeywords?: string[]
  industry?: string
}

interface TitleSuggestion {
  title: string
  reasoning: string
  impact: 'high' | 'medium' | 'low'
}

interface MetaDescriptionSuggestion {
  description: string
  reasoning: string
  impact: 'high' | 'medium' | 'low'
}

export default function AIInsights({ 
  url, 
  auditResults, 
  currentContent = '', 
  targetKeywords = [], 
  industry = 'general' 
}: AIInsightsProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [titleSuggestions, setTitleSuggestions] = useState<TitleSuggestion[]>([])
  const [metaSuggestions, setMetaSuggestions] = useState<MetaDescriptionSuggestion[]>([])
  const [isFallback, setIsFallback] = useState(false)

  const generateAIInsights = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log('Generating AI insights for URL:', url)
      console.log('Audit results:', auditResults)
      
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auditResults,
          url,
          currentContent,
          targetKeywords,
          industry
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate AI insights')
      }

      const data = await response.json()
      
      setSeoInsights(data.seoInsights)
      setContentSuggestions(data.contentSuggestions)
      setContentAnalysis(data.contentAnalysis)
      setKeywordSuggestions(data.keywordSuggestions)
      setIsFallback(data.isFallback || false)

    } catch (err) {
      console.error('Error generating AI insights:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate AI insights. Please try again.'
      setError(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'easy': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'hard': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-50'
      case 'B': return 'text-blue-600 bg-blue-50'
      case 'C': return 'text-yellow-600 bg-yellow-50'
      case 'D': return 'text-orange-600 bg-orange-50'
      case 'F': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const tabs = [
    { id: 'overview', name: 'AI Overview', icon: '🤖' },
    { id: 'content', name: 'Content AI', icon: '📝' },
    { id: 'keywords', name: 'Keyword AI', icon: '🔍' },
    { id: 'competitors', name: 'Competitor AI', icon: '🏆' },
    { id: 'strategy', name: 'Strategy AI', icon: '📊' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <span className="mr-3">🤖</span>
              AI-Powered SEO Insights
            </h2>
            <p className="text-purple-100 mt-1">
              Get intelligent recommendations powered by advanced AI
            </p>
          </div>
          <button
            onClick={generateAIInsights}
            disabled={loading}
            className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                Generating...
              </div>
            ) : (
              'Generate AI Insights'
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 text-xl mr-2">⚠️</span>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* AI Overview Tab */}
          {activeTab === 'overview' && seoInsights && (
            <div className="space-y-6">
              {isFallback && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <span className="text-yellow-500 text-xl">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Using Fallback Insights</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        AI service is currently unavailable. Showing general SEO recommendations based on best practices.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-green-800">Overall Score</h3>
                    <span className="text-3xl font-bold text-green-600">{seoInsights.overallScore}/100</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    AI-powered SEO assessment based on comprehensive analysis
                  </p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-blue-800">Predicted Impact</h3>
                    <span className="text-2xl font-bold text-blue-600">+{seoInsights.predictedImpact.traffic}%</span>
                  </div>
                  <p className="text-blue-700 text-sm">
                    Expected traffic increase with recommended improvements
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-purple-800">Quick Wins</h3>
                    <span className="text-2xl font-bold text-purple-600">{seoInsights.quickWins.length}</span>
                  </div>
                  <p className="text-purple-700 text-sm">
                    Easy improvements you can implement today
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="text-green-600 mr-2">✅</span>
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {seoInsights.keyStrengths.map((strength, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-1">•</span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <span className="text-red-600 mr-2">🚨</span>
                    Critical Issues
                  </h3>
                  <ul className="space-y-2">
                    {seoInsights.criticalIssues.map((issue, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-red-500 mr-2 mt-1">•</span>
                        <span className="text-gray-700">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-blue-600 mr-2">⚡</span>
                  Quick Wins
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {seoInsights.quickWins.map((win, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="text-green-600 mr-2 mt-1">✓</span>
                        <span className="text-gray-700">{win}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content AI Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {contentSuggestions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="text-purple-600 mr-2">📝</span>
                    AI Content Suggestions
                  </h3>
                  {contentSuggestions.map((suggestion, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 capitalize mb-2">
                            {suggestion.type.replace('-', ' ')} Optimization
                          </h4>
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Original:</p>
                              <p className="text-gray-800 bg-gray-50 p-2 rounded">{suggestion.original}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">AI Suggestion:</p>
                              <p className="text-gray-800 bg-green-50 p-2 rounded border border-green-200">
                                {suggestion.suggestion}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Reasoning:</p>
                              <p className="text-gray-700">{suggestion.reasoning}</p>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex flex-col space-y-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getImpactColor(suggestion.impact)}`}>
                            {suggestion.impact.toUpperCase()} IMPACT
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEffortColor(suggestion.effort)}`}>
                            {suggestion.effort.toUpperCase()} EFFORT
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {contentAnalysis && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <span className="text-blue-600 mr-2">📊</span>
                    AI Content Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Readability</h4>
                      <div className="text-center">
                        <div className={`text-3xl font-bold mb-2 ${getScoreColor(contentAnalysis.readability.score)}`}>
                          {contentAnalysis.readability.score}
                        </div>
                        <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(contentAnalysis.readability.grade)}`}>
                          Grade {contentAnalysis.readability.grade}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">SEO Optimization</h4>
                      <div className="text-center">
                        <div className={`text-3xl font-bold mb-2 ${getScoreColor(contentAnalysis.seoOptimization.score)}`}>
                          {contentAnalysis.seoOptimization.score}
                        </div>
                        <p className="text-sm text-gray-600">SEO Score</p>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-3">Engagement</h4>
                      <div className="text-center">
                        <div className={`text-3xl font-bold mb-2 ${getScoreColor(contentAnalysis.engagement.score)}`}>
                          {contentAnalysis.engagement.score}
                        </div>
                        <p className="text-sm text-gray-600">Engagement Score</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Keyword AI Tab */}
          {activeTab === 'keywords' && keywordSuggestions.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="text-green-600 mr-2">🔍</span>
                AI Keyword Suggestions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {keywordSuggestions.map((keyword, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">{keyword.keyword}</h4>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          keyword.searchVolume === 'high' ? 'bg-green-100 text-green-800' :
                          keyword.searchVolume === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {keyword.searchVolume} volume
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          keyword.competition === 'high' ? 'bg-red-100 text-red-800' :
                          keyword.competition === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {keyword.competition} competition
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{keyword.reasoning}</p>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Related Keywords:</p>
                      <div className="flex flex-wrap gap-2">
                        {keyword.suggestions.map((suggestion, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {suggestion}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competitor AI Tab */}
          {activeTab === 'competitors' && (
            <div className="space-y-6">
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">🏆</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitor Analysis</h3>
                <p className="text-gray-600">
                  Enter competitor URLs to get AI-powered competitive insights
                </p>
                <button className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  Add Competitors
                </button>
              </div>
            </div>
          )}

          {/* Strategy AI Tab */}
          {activeTab === 'strategy' && seoInsights && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <span className="text-purple-600 mr-2">📊</span>
                AI Long-Term Strategy
              </h3>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Strategic Recommendations</h4>
                <div className="space-y-4">
                  {seoInsights.longTermStrategy.map((strategy, index) => (
                    <div key={index} className="flex items-start p-4 bg-purple-50 rounded-lg">
                      <span className="text-purple-600 mr-3 mt-1 font-bold">{index + 1}.</span>
                      <span className="text-gray-700">{strategy}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Predicted Impact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      +{seoInsights.predictedImpact.traffic}%
                    </div>
                    <p className="text-gray-600">Traffic Increase</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      +{seoInsights.predictedImpact.rankings}%
                    </div>
                    <p className="text-gray-600">Ranking Improvement</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      +{seoInsights.predictedImpact.conversions}%
                    </div>
                    <p className="text-gray-600">Conversion Boost</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!seoInsights && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🤖</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for AI Insights</h3>
              <p className="text-gray-600 mb-6">
                Click "Generate AI Insights" to get intelligent recommendations powered by advanced AI
              </p>
              <button
                onClick={generateAIInsights}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Generate AI Insights
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
