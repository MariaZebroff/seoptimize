"use client"

import React, { useState } from 'react'
import { SEOAnalysisResult, SEOSuggestion } from '@/lib/enhancedSEOAnalysis'

interface EnhancedSEOResultsProps {
  analysis: SEOAnalysisResult | null | undefined
  auditData?: {
    h1_tags?: string[]
    h2_tags?: string[]
    h3_tags?: string[]
    h4_tags?: string[]
    h5_tags?: string[]
    h6_tags?: string[]
    h1_word_count?: number
    h2_word_count?: number
    h3_word_count?: number
    h4_word_count?: number
    h5_word_count?: number
    h6_word_count?: number
  }
}

export default function EnhancedSEOResults({ analysis, auditData }: EnhancedSEOResultsProps) {
  const [activeTab, setActiveTab] = useState<'details'>('details')
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null)

  // Debug logging
  console.log('🔍 EnhancedSEOResults received analysis:', {
    analysis: analysis,
    analysisType: typeof analysis,
    isNull: analysis === null,
    isUndefined: analysis === undefined,
    hasSeoScore: analysis?.seoScore,
    hasSuggestions: analysis?.suggestions?.length
  })

  // Add safety checks and fallbacks
  if (!analysis) {
    console.log('❌ EnhancedSEOResults: analysis is falsy, showing error message')
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <div className="text-yellow-600 text-lg font-semibold mb-2">⚠️ No SEO Analysis Data</div>
        <div className="text-yellow-700">Enhanced SEO analysis data is not available for this audit.</div>
      </div>
    )
  }

  // Ensure all required properties exist with fallbacks
  const safeAnalysis = {
    ...analysis,
    suggestions: analysis.suggestions || [],
    keywordDensity: analysis.keywordDensity || {},
    headingStructure: analysis.headingStructure || {
      h1Count: 0, h2Count: 0, h3Count: 0, h4Count: 0, h5Count: 0, h6Count: 0,
      totalHeadings: 0, structureScore: 0
    },
    metaTags: analysis.metaTags || {},
    contentAnalysis: analysis.contentAnalysis || {
      readabilityScore: 0, averageSentenceLength: 0, paragraphCount: 0,
      listCount: 0, imageCount: 0, videoCount: 0, linkCount: 0,
      internalLinkCount: 0, externalLinkCount: 0
    },
    seoScore: analysis.seoScore || 0,
    seoGrade: analysis.seoGrade || 'F',
    titleCharacterCount: analysis.titleCharacterCount || 0,
    metaDescriptionCharacterCount: analysis.metaDescriptionCharacterCount || 0,
    contentWordCount: analysis.contentWordCount || 0,
    contentCharacterCount: analysis.contentCharacterCount || 0,
    title: analysis.title || '',
    metaDescription: analysis.metaDescription || '',
    h1Tags: analysis.h1Tags || auditData?.h1_tags || [],
    h2Tags: analysis.h2Tags || auditData?.h2_tags || [],
    h3Tags: analysis.h3Tags || auditData?.h3_tags || [],
    h4Tags: analysis.h4Tags || auditData?.h4_tags || [],
    h5Tags: analysis.h5Tags || auditData?.h5_tags || [],
    h6Tags: analysis.h6Tags || auditData?.h6_tags || [],
    h1WordCount: analysis.h1WordCount || auditData?.h1_word_count || 0,
    h2WordCount: analysis.h2WordCount || auditData?.h2_word_count || 0,
    h3WordCount: analysis.h3WordCount || auditData?.h3_word_count || 0,
    h4WordCount: analysis.h4WordCount || auditData?.h4_word_count || 0,
    h5WordCount: analysis.h5WordCount || auditData?.h5_word_count || 0,
    h6WordCount: analysis.h6WordCount || auditData?.h6_word_count || 0
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800'
      case 'B': return 'bg-blue-100 text-blue-800'
      case 'C': return 'bg-yellow-100 text-yellow-800'
      case 'D': return 'bg-orange-100 text-orange-800'
      case 'F': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* SEO Score Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">SEO Score Overview</h3>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(safeAnalysis.seoGrade)}`}>
              Grade: {safeAnalysis.seoGrade}
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(safeAnalysis.seoScore)}`}>
              {safeAnalysis.seoScore}/100
            </div>
          </div>
      </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-500 ${
              safeAnalysis.seoScore >= 80 ? 'bg-green-500' : 
              safeAnalysis.seoScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${safeAnalysis.seoScore}%` }}
          ></div>
        </div>
      </div>

      {/* Character Counts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Title</h4>
          <div className="text-2xl font-bold text-gray-900">{safeAnalysis.titleCharacterCount}</div>
          <div className="text-sm text-gray-500">characters</div>
          <div className="text-xs text-gray-400 mt-1">
            {safeAnalysis.titleCharacterCount < 30 ? 'Too short' : 
             safeAnalysis.titleCharacterCount > 60 ? 'Too long' : 'Optimal'}
                </div>
              </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Meta Description</h4>
          <div className="text-2xl font-bold text-gray-900">{safeAnalysis.metaDescriptionCharacterCount}</div>
          <div className="text-sm text-gray-500">characters</div>
          <div className="text-xs text-gray-400 mt-1">
            {safeAnalysis.metaDescriptionCharacterCount < 120 ? 'Too short' : 
             safeAnalysis.metaDescriptionCharacterCount > 160 ? 'Too long' : 'Optimal'}
              </div>
            </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Content</h4>
          <div className="text-2xl font-bold text-gray-900">{safeAnalysis.contentWordCount}</div>
          <div className="text-sm text-gray-500">words</div>
          <div className="text-xs text-gray-400 mt-1">
            {safeAnalysis.contentWordCount < 300 ? 'Needs more content' : 'Good length'}
                </div>
              </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Readability</h4>
          <div className="text-2xl font-bold text-gray-900">{safeAnalysis.contentAnalysis.readabilityScore}</div>
          <div className="text-sm text-gray-500">score</div>
          <div className="text-xs text-gray-400 mt-1">
            {safeAnalysis.contentAnalysis.readabilityScore >= 60 ? 'Good' : 'Needs improvement'}
                </div>
              </div>
            </div>

            {/* Heading Structure */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Heading Structure</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { level: 'H1', count: safeAnalysis.headingStructure.h1Count, optimal: 1 },
            { level: 'H2', count: safeAnalysis.headingStructure.h2Count, optimal: '2+' },
            { level: 'H3', count: safeAnalysis.headingStructure.h3Count, optimal: '3+' },
            { level: 'H4', count: safeAnalysis.headingStructure.h4Count, optimal: '4+' },
            { level: 'H5', count: safeAnalysis.headingStructure.h5Count, optimal: '5+' },
            { level: 'H6', count: safeAnalysis.headingStructure.h6Count, optimal: '6+' }
          ].map(({ level, count, optimal }) => (
                    <div key={level} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{count}</div>
              <div className="text-sm text-gray-500">{level}</div>
              <div className="text-xs text-gray-400">Optimal: {optimal}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-500">Structure Score</div>
          <div className={`text-xl font-bold ${getScoreColor(safeAnalysis.headingStructure.structureScore)}`}>
            {safeAnalysis.headingStructure.structureScore}/100
          </div>
        </div>
      </div>

      {/* Top Keywords */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {Object.entries(safeAnalysis.keywordDensity)
            .slice(0, 10)
            .map(([keyword, density]) => (
              <span 
                key={keyword}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                {keyword} ({density.toFixed(1)}%)
              </span>
            ))}
        </div>
                        </div>
                      </div>
  )

  const renderSuggestions = () => (
    <div className="space-y-4">
      {safeAnalysis.suggestions.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-lg font-semibold mb-2">🎉 Great Job!</div>
          <div className="text-green-700">No SEO issues found. Your page is well optimized!</div>
        </div>
      ) : (
        safeAnalysis.suggestions.map((suggestion) => (
          <div key={suggestion.id} className="bg-white rounded-lg shadow border-l-4 border-l-blue-500">
            <div 
              className="p-4 cursor-pointer"
              onClick={() => setExpandedSuggestion(
                expandedSuggestion === suggestion.id ? null : suggestion.id
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(suggestion.priority)}`}>
                    {suggestion.priority.toUpperCase()}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getEffortColor(suggestion.effort)}`}>
                    {suggestion.effort.toUpperCase()}
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">{suggestion.title}</h4>
                </div>
                <div className="text-gray-400">
                  {expandedSuggestion === suggestion.id ? '▼' : '▶'}
          </div>
              </div>
              <p className="text-gray-600 mt-2">{suggestion.description}</p>
              <div className="mt-2 text-sm text-gray-500">
                <strong>Impact:</strong> {suggestion.impact}
              </div>
            </div>

            {expandedSuggestion === suggestion.id && (
              <div className="px-4 pb-4 border-t border-gray-200">
                <div className="mt-4 space-y-4">
                  {suggestion.currentValue && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Current Value:</h5>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{suggestion.currentValue}</p>
                    </div>
                  )}
                  
                  {suggestion.recommendedValue && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">Recommended Value:</h5>
                      <p className="text-sm text-gray-600 bg-green-50 p-2 rounded">{suggestion.recommendedValue}</p>
              </div>
            )}

                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Steps to Fix:</h5>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                      {suggestion.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  
                  {suggestion.resources.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Resources:</h5>
                      <ul className="space-y-1">
                        {suggestion.resources.map((resource, index) => (
                          <li key={index}>
                            <a 
                              href={resource} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              {resource}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
        )}
    </div>
  )

  const renderDetails = () => (
          <div className="space-y-6">
      {/* Meta Tags Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Meta Tags Analysis</h3>
        <div className="space-y-6">
          
          {/* Basic Meta Tags */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Basic Meta Tags
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'title', label: 'Page Title', value: safeAnalysis.metaTags.title || safeAnalysis.title },
                { key: 'description', label: 'Meta Description', value: safeAnalysis.metaTags.description || safeAnalysis.metaDescription },
                { key: 'keywords', label: 'Keywords', value: safeAnalysis.metaTags.keywords },
                { key: 'author', label: 'Author', value: safeAnalysis.metaTags.author },
                { key: 'robots', label: 'Robots', value: safeAnalysis.metaTags.robots },
                { key: 'viewport', label: 'Viewport', value: safeAnalysis.metaTags.viewport },
                { key: 'charset', label: 'Charset', value: safeAnalysis.metaTags.charset },
                { key: 'canonical', label: 'Canonical URL', value: safeAnalysis.metaTags.canonical }
              ].map(({ key, label, value }) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 mb-2">{label}</div>
                  <div className="text-sm text-gray-900 break-all">
                    {value ? (
                      <div className="bg-green-50 p-2 rounded border-l-4 border-green-400">
                        {value}
                      </div>
                    ) : (
                      <div className="bg-red-50 p-2 rounded border-l-4 border-red-400 text-red-600 italic">
                        Not set
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Open Graph Tags */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Open Graph Tags (Social Media)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'ogTitle', label: 'OG Title', value: safeAnalysis.metaTags.ogTitle },
                { key: 'ogDescription', label: 'OG Description', value: safeAnalysis.metaTags.ogDescription },
                { key: 'ogImage', label: 'OG Image', value: safeAnalysis.metaTags.ogImage }
              ].map(({ key, label, value }) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 mb-2">{label}</div>
                  <div className="text-sm text-gray-900 break-all">
                    {value ? (
                      <div className="bg-purple-50 p-2 rounded border-l-4 border-purple-400">
                        {value}
                      </div>
                    ) : (
                      <div className="bg-red-50 p-2 rounded border-l-4 border-red-400 text-red-600 italic">
                        Not set
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div className="text-sm text-blue-800">
                <strong>💡 Open Graph Tip:</strong> These tags control how your page appears when shared on Facebook, LinkedIn, and other social platforms.
              </div>
            </div>
          </div>

          {/* Twitter Card Tags */}
          <div>
            <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter Card Tags
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'twitterCard', label: 'Twitter Card Type', value: safeAnalysis.metaTags.twitterCard },
                { key: 'twitterTitle', label: 'Twitter Title', value: safeAnalysis.metaTags.twitterTitle },
                { key: 'twitterDescription', label: 'Twitter Description', value: safeAnalysis.metaTags.twitterDescription },
                { key: 'twitterImage', label: 'Twitter Image', value: safeAnalysis.metaTags.twitterImage }
              ].map(({ key, label, value }) => (
                <div key={key} className="border rounded-lg p-4">
                  <div className="text-sm font-medium text-gray-600 mb-2">{label}</div>
                  <div className="text-sm text-gray-900 break-all">
                    {value ? (
                      <div className="bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                        {value}
                      </div>
                    ) : (
                      <div className="bg-red-50 p-2 rounded border-l-4 border-red-400 text-red-600 italic">
                        Not set
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div className="text-sm text-blue-800">
                <strong>🐦 Twitter Tip:</strong> These tags control how your page appears when shared on Twitter/X. If not set, Twitter will fall back to Open Graph tags.
              </div>
            </div>
          </div>

          {/* Meta Tags Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">📊 Meta Tags Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">
                  {Object.values(safeAnalysis.metaTags).filter(value => value && value !== '').length}
                </div>
                <div className="text-gray-600">Tags Set</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">
                  {Object.values(safeAnalysis.metaTags).filter(value => !value || value === '').length}
                </div>
                <div className="text-gray-600">Missing</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">
                  {safeAnalysis.metaTags.ogTitle && safeAnalysis.metaTags.ogDescription && safeAnalysis.metaTags.ogImage ? '3' : '0'}
                </div>
                <div className="text-gray-600">OG Complete</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {safeAnalysis.metaTags.twitterCard && safeAnalysis.metaTags.twitterTitle ? '2' : '0'}
                </div>
                <div className="text-gray-600">Twitter Set</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Description Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Meta Description Details</h3>
        <div className="space-y-4">
          {/* Character Count Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-sm font-medium text-blue-600 mb-1">Character Count</div>
              <div className="text-2xl font-bold text-blue-800">{safeAnalysis.metaDescriptionCharacterCount}</div>
              <div className="text-xs text-blue-600 mt-1">characters</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-sm font-medium text-green-600 mb-1">Optimal Range</div>
              <div className="text-lg font-bold text-green-800">120-160</div>
              <div className="text-xs text-green-600 mt-1">characters</div>
            </div>
            
            <div className={`rounded-lg p-4 ${
              safeAnalysis.metaDescriptionCharacterCount >= 120 && safeAnalysis.metaDescriptionCharacterCount <= 160 
                ? 'bg-green-50' 
                : safeAnalysis.metaDescriptionCharacterCount < 120 
                  ? 'bg-yellow-50' 
                  : 'bg-red-50'
            }`}>
              <div className={`text-sm font-medium mb-1 ${
                safeAnalysis.metaDescriptionCharacterCount >= 120 && safeAnalysis.metaDescriptionCharacterCount <= 160 
                  ? 'text-green-600' 
                  : safeAnalysis.metaDescriptionCharacterCount < 120 
                    ? 'text-yellow-600' 
                    : 'text-red-600'
              }`}>Status</div>
              <div className={`text-lg font-bold ${
                safeAnalysis.metaDescriptionCharacterCount >= 120 && safeAnalysis.metaDescriptionCharacterCount <= 160 
                  ? 'text-green-800' 
                  : safeAnalysis.metaDescriptionCharacterCount < 120 
                    ? 'text-yellow-800' 
                    : 'text-red-800'
              }`}>
                {safeAnalysis.metaDescriptionCharacterCount >= 120 && safeAnalysis.metaDescriptionCharacterCount <= 160 
                  ? 'Optimal' 
                  : safeAnalysis.metaDescriptionCharacterCount < 120 
                    ? 'Too Short' 
                    : 'Too Long'}
              </div>
              <div className={`text-xs mt-1 ${
                safeAnalysis.metaDescriptionCharacterCount >= 120 && safeAnalysis.metaDescriptionCharacterCount <= 160 
                  ? 'text-green-600' 
                  : safeAnalysis.metaDescriptionCharacterCount < 120 
                    ? 'text-yellow-600' 
                    : 'text-red-600'
              }`}>
                {safeAnalysis.metaDescriptionCharacterCount < 120 
                  ? `Add ${120 - safeAnalysis.metaDescriptionCharacterCount} more characters`
                  : safeAnalysis.metaDescriptionCharacterCount > 160 
                    ? `Remove ${safeAnalysis.metaDescriptionCharacterCount - 160} characters`
                    : 'Perfect length for search results'}
              </div>
            </div>
                              </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>0</span>
              <span>120 (Min)</span>
              <span>160 (Max)</span>
              <span>320</span>
                              </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  safeAnalysis.metaDescriptionCharacterCount >= 120 && safeAnalysis.metaDescriptionCharacterCount <= 160 
                    ? 'bg-green-500' 
                    : safeAnalysis.metaDescriptionCharacterCount < 120 
                      ? 'bg-yellow-500' 
                      : 'bg-red-500'
                }`}
                style={{ 
                  width: `${Math.min(100, (safeAnalysis.metaDescriptionCharacterCount / 320) * 100)}%` 
                }}
              ></div>
                  </div>
                </div>

          {/* Actual Meta Description Text */}
          <div className="border rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Current Meta Description:</div>
            {safeAnalysis.metaDescription ? (
              <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded border-l-4 border-blue-400">
                "{safeAnalysis.metaDescription}"
              </div>
            ) : (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded border-l-4 border-red-400">
                ⚠️ No meta description found
              </div>
            )}
          </div>

          {/* SEO Tips */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">💡 SEO Tips for Meta Description:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Include your target keyword naturally</li>
              <li>• Write compelling copy that encourages clicks</li>
              <li>• Use action words and emotional triggers</li>
              <li>• Make it unique for each page</li>
              <li>• Avoid duplicate meta descriptions</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Content Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Analysis</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(safeAnalysis.contentAnalysis).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{value}</div>
              <div className="text-sm text-gray-500 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                              </div>
                        ))}
                </div>
              </div>

      {/* Headings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Headings</h3>
        <div className="space-y-6">
          {[
            { level: 'H1', tags: safeAnalysis.h1Tags, wordCount: safeAnalysis.h1WordCount },
            { level: 'H2', tags: safeAnalysis.h2Tags, wordCount: safeAnalysis.h2WordCount },
            { level: 'H3', tags: safeAnalysis.h3Tags, wordCount: safeAnalysis.h3WordCount },
            { level: 'H4', tags: safeAnalysis.h4Tags, wordCount: safeAnalysis.h4WordCount },
            { level: 'H5', tags: safeAnalysis.h5Tags, wordCount: safeAnalysis.h5WordCount },
            { level: 'H6', tags: safeAnalysis.h6Tags, wordCount: safeAnalysis.h6WordCount }
          ].map(({ level, tags, wordCount }) => {
            // Calculate character count for all tags of this level
            const characterCount = tags.reduce((total, tag) => total + tag.length, 0)
            
            return (
              <div key={level} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{level} Tags ({tags.length})</h4>
                  <div className="flex space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="font-medium text-blue-600">{wordCount}</span>
                      <span className="ml-1">words</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium text-green-600">{characterCount}</span>
                      <span className="ml-1">characters</span>
                    </div>
                  </div>
                </div>
                
                {tags.length > 0 ? (
                  <div className="space-y-2">
                    {tags.map((tag, index) => (
                      <div key={index} className="bg-gray-50 rounded p-3 border-l-4 border-blue-400">
                        <div className="text-sm text-gray-900 font-medium mb-1">{tag}</div>
                        <div className="text-xs text-gray-500">
                          {tag.split(/\s+/).filter(word => word.length > 0).length} words • {tag.length} characters
                      </div>
                      </div>
                    ))}
                      </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-400 italic">No {level} tags found</p>
                  </div>
                )}
                                </div>
            )
          })}
                          </div>
                </div>
              </div>
  )

  return (
    <div className="space-y-6">
      {/* Tab Navigation - Only Details */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <div className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">
            Details
          </div>
        </nav>
      </div>

      {/* Tab Content - Only Details */}
      {renderDetails()}
    </div>
  )
}