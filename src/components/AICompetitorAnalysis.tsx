'use client'

import React, { useState } from 'react'

interface CompetitorAnalysis {
  competitor: string
  analysis: {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    recommendations: string[]
    comparison: {
      seoScore: number
      performanceScore: number
      contentQuality: number
      technicalSEO: number
    }
  }
}

interface AICompetitorAnalysisProps {
  currentUrl: string
  currentAuditData?: any
}

const AICompetitorAnalysis: React.FC<AICompetitorAnalysisProps> = ({ 
  currentUrl, 
  currentAuditData 
}) => {
  const [competitors, setCompetitors] = useState<string[]>([''])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<CompetitorAnalysis[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFallback, setIsFallback] = useState(false)

  const updateCompetitor = (index: number, value: string) => {
    const newCompetitors = [...competitors]
    newCompetitors[index] = value
    setCompetitors(newCompetitors)
  }

  const addCompetitorField = () => {
    if (competitors.length < 3) {
      setCompetitors([...competitors, ''])
    }
  }

  const removeCompetitorField = (index: number) => {
    if (competitors.length > 1) {
      const newCompetitors = competitors.filter((_, i) => i !== index)
      setCompetitors(newCompetitors)
    }
  }

  const validateUrl = (url: string) => {
    if (!url.trim()) return false
    
    try {
      const urlObj = new URL(url)
      // Check if it has a valid protocol
      if (!urlObj.protocol.startsWith('http')) return false
      
      // Check if it has a valid domain with TLD
      const hostname = urlObj.hostname
      if (!hostname.includes('.')) return false
      
      // Check for common TLDs
      const validTlds = ['.com', '.net', '.org', '.edu', '.gov', '.io', '.co', '.uk', '.de', '.fr', '.ca', '.au', '.jp', '.cn', '.in', '.br', '.ru', '.it', '.es', '.nl', '.se', '.no', '.dk', '.fi', '.pl', '.cz', '.hu', '.ro', '.bg', '.hr', '.si', '.sk', '.ee', '.lv', '.lt', '.mt', '.cy', '.ie', '.pt', '.gr', '.be', '.at', '.ch', '.lu', '.li', '.mc', '.ad', '.sm', '.va', '.mx', '.ar', '.cl', '.pe', '.co', '.ve', '.ec', '.bo', '.py', '.uy', '.gf', '.sr', '.gy', '.fk', '.gs', '.tc', '.vg', '.ai', '.ag', '.bb', '.bs', '.bz', '.dm', '.gd', '.jm', '.kn', '.lc', '.ms', '.pr', '.tt', '.vc', '.vi', '.zw', '.za', '.eg', '.ma', '.tn', '.dz', '.ly', '.sd', '.et', '.ke', '.ug', '.tz', '.rw', '.bi', '.dj', '.so', '.er', '.ss', '.cf', '.td', '.cm', '.gq', '.ga', '.cg', '.cd', '.ao', '.zm', '.mw', '.mz', '.mg', '.mu', '.sc', '.km', '.yt', '.re', '.bw', '.sz', '.ls', '.na', '.gh', '.tg', '.bj', '.ne', '.bf', '.ml', '.sn', '.gm', '.gn', '.gw', '.sl', '.lr', '.ci', '.cv', '.st', '.mr', '.dz', '.eh', '.ma', '.tn', '.ly', '.sd', '.et', '.ke', '.ug', '.tz', '.rw', '.bi', '.dj', '.so', '.er', '.ss', '.cf', '.td', '.cm', '.gq', '.ga', '.cg', '.cd', '.ao', '.zm', '.mw', '.mz', '.mg', '.mu', '.sc', '.km', '.yt', '.re', '.bw', '.sz', '.ls', '.na', '.gh', '.tg', '.bj', '.ne', '.bf', '.ml', '.sn', '.gm', '.gn', '.gw', '.sl', '.lr', '.ci', '.cv', '.st', '.mr']
      
      const hasValidTld = validTlds.some(tld => hostname.endsWith(tld))
      if (!hasValidTld) return false
      
      return true
    } catch {
      return false
    }
  }

  const hasValidCompetitors = () => {
    return competitors.some(url => url.trim() && validateUrl(url.trim()))
  }

  const analyzeCompetitors = async () => {
    const validCompetitors = competitors.filter(url => url.trim() && validateUrl(url.trim()))
    
    if (validCompetitors.length === 0) {
      setError('Please enter at least one valid competitor URL')
      return
    }

    setIsAnalyzing(true)
    setError(null)
    setAnalysisResults([])

    try {
      const response = await fetch('/api/ai/competitor-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentUrl,
          currentAuditData,
          competitors: validCompetitors
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze competitors')
      }

      console.log('API Response:', data)
      console.log('Analyses:', data.analyses)
      
      // Ensure we have the correct structure
      const analyses = (data.analyses || []).map((item: any) => {
        let competitorUrl = 'Unknown'
        
        if (typeof item.competitor === 'string') {
          competitorUrl = item.competitor
        } else if (item.competitor && typeof item.competitor === 'object') {
          // Handle case where competitor might be an object
          competitorUrl = item.competitor.competitor || item.competitor.current || item.competitor.url || 'Unknown'
        }
        
        return {
          competitor: competitorUrl,
          analysis: item.analysis
        }
      })
      
      setAnalysisResults(analyses)
      setIsFallback(data.isFallback || false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze competitors'
      
      // Check for rate limit errors
      if (errorMessage.includes('rate_limit_exceeded') || errorMessage.includes('Request too large')) {
        setError('AI service is currently busy. Please try again in a few minutes, or use the fallback analysis below.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h3 className="text-lg font-semibold text-gray-900">AI Competitor Analysis</h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-3 p-1 rounded-md hover:bg-gray-100 transition-colors"
            aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
          >
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <div className="text-sm text-gray-500">
          Compare your site with competitors
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Enter competitor URLs to get AI-powered analysis comparing their SEO performance, content strategy, and technical implementation with your page.
            </p>
            
            <div className="space-y-3">
              {competitors.map((competitor, index) => {
                const isValid = !competitor.trim() || validateUrl(competitor.trim())
                return (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={competitor}
                        onChange={(e) => updateCompetitor(index, e.target.value)}
                        placeholder={`Competitor ${index + 1} URL (e.g., https://example.com)`}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                          competitor.trim() && !isValid
                            ? 'border-red-300 focus:ring-red-500 bg-red-50'
                            : 'border-gray-300 focus:ring-indigo-500'
                        }`}
                      />
                      {competitor.trim() && !isValid && (
                        <p className="text-red-600 text-xs mt-1">
                          Please enter a valid URL (e.g., https://example.com)
                        </p>
                      )}
                    </div>
                    {competitors.length > 1 && (
                      <button
                        onClick={() => removeCompetitorField(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        aria-label="Remove competitor"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={addCompetitorField}
                disabled={competitors.length >= 3}
                className={`text-sm font-medium flex items-center ${
                  competitors.length >= 3 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-indigo-600 hover:text-indigo-700'
                }`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {competitors.length >= 3 ? 'Maximum 3 competitors' : 'Add Another Competitor'}
              </button>

              <div className="flex flex-col items-end">
                <button
                  onClick={analyzeCompetitors}
                  disabled={isAnalyzing || !hasValidCompetitors()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Analyze Competitors
                    </>
                  )}
                </button>
                {!hasValidCompetitors() && !isAnalyzing && (
                  <p className="text-gray-500 text-xs mt-1">
                    Enter at least one valid URL to analyze
                  </p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-red-800 font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {analysisResults.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">Competitor Analysis Results</h4>
                {isFallback && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-amber-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span className="text-amber-800 text-sm font-medium">Using fallback analysis</span>
                    </div>
                  </div>
                )}
              </div>
              
              {analysisResults.map((result, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-lg font-medium text-gray-900">
                      {typeof result.competitor === 'string' ? result.competitor : 'Unknown Competitor'}
                    </h5>
                    <div className="flex space-x-4 text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-1">SEO:</span>
                        <span className={`font-medium ${getScoreColor(result.analysis.comparison.seoScore)}`}>
                          {result.analysis.comparison.seoScore}/100
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-1">Performance:</span>
                        <span className={`font-medium ${getScoreColor(result.analysis.comparison.performanceScore)}`}>
                          {result.analysis.comparison.performanceScore}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <div>
                      <h6 className="font-medium text-green-800 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Strengths
                      </h6>
                      <ul className="space-y-1">
                        {result.analysis.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    <div>
                      <h6 className="font-medium text-red-800 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        Weaknesses
                      </h6>
                      <ul className="space-y-1">
                        {result.analysis.weaknesses.map((weakness, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Opportunities */}
                    <div>
                      <h6 className="font-medium text-blue-800 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Opportunities
                      </h6>
                      <ul className="space-y-1">
                        {result.analysis.opportunities.map((opportunity, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start">
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {opportunity}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h6 className="font-medium text-purple-800 mb-2 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Recommendations
                      </h6>
                      <ul className="space-y-1">
                        {result.analysis.recommendations.map((recommendation, i) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AICompetitorAnalysis
