"use client"

import React, { useState } from 'react'
import { SEOAnalysisResult, SEOSuggestion } from '@/lib/enhancedSEOAnalysis'

interface EnhancedSEOResultsProps {
  analysis: SEOAnalysisResult | null | undefined
}

export default function EnhancedSEOResults({ analysis }: EnhancedSEOResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'suggestions' | 'details'>('overview')
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
    h1Tags: analysis.h1Tags || [],
    h2Tags: analysis.h2Tags || [],
    h3Tags: analysis.h3Tags || [],
    h4Tags: analysis.h4Tags || [],
    h5Tags: analysis.h5Tags || [],
    h6Tags: analysis.h6Tags || []
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
      {/* Meta Tags */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Meta Tags</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(safeAnalysis.metaTags).map(([key, value]) => (
            <div key={key} className="border rounded-lg p-3">
              <div className="text-sm font-medium text-gray-500 mb-1">{key}</div>
              <div className="text-sm text-gray-900 break-all">
                {value || <span className="text-gray-400 italic">Not set</span>}
              </div>
            </div>
          ))}
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
        <div className="space-y-4">
          {[
            { level: 'H1', tags: safeAnalysis.h1Tags },
            { level: 'H2', tags: safeAnalysis.h2Tags },
            { level: 'H3', tags: safeAnalysis.h3Tags },
            { level: 'H4', tags: safeAnalysis.h4Tags },
            { level: 'H5', tags: safeAnalysis.h5Tags },
            { level: 'H6', tags: safeAnalysis.h6Tags }
          ].map(({ level, tags }) => (
            <div key={level}>
              <h4 className="font-medium text-gray-900 mb-2">{level} Tags ({tags.length})</h4>
              {tags.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {tags.map((tag, index) => (
                    <li key={index}>{tag}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400 italic">No {level} tags found</p>
              )}
                        </div>
                      ))}
                    </div>
                </div>
              </div>
  )

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'suggestions', label: `Suggestions (${safeAnalysis.suggestions.length})` },
            { id: 'details', label: 'Details' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'suggestions' && renderSuggestions()}
      {activeTab === 'details' && renderDetails()}
    </div>
  )
}