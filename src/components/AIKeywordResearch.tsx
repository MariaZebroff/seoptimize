"use client"

import { useState } from 'react'
import { AIKeywordSuggestion } from '@/lib/aiService'

interface AIKeywordResearchProps {
  url: string
  currentKeywords: string[]
  industry?: string
  onKeywordsGenerated?: (keywords: AIKeywordSuggestion[]) => void
}

export default function AIKeywordResearch({
  url,
  currentKeywords,
  industry = 'general',
  onKeywordsGenerated
}: AIKeywordResearchProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [generatedKeywords, setGeneratedKeywords] = useState<AIKeywordSuggestion[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([])


  const generateKeywords = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/ai/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          currentKeywords,
          industry
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate keyword suggestions')
      }

      const data = await response.json()
      setGeneratedKeywords(data.keywords)
      onKeywordsGenerated?.(data.keywords)
      
      if (data.isFallback) {
        setError('AI service unavailable. Showing fallback suggestions.')
      }
    } catch (err) {
      console.error('Error generating keywords:', err)
      setError('Failed to generate keyword suggestions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleKeywordSelection = (keyword: string) => {
    setSelectedKeywords(prev => 
      prev.includes(keyword) 
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    )
  }

  const exportKeywords = () => {
    if (selectedKeywords.length === 0) {
      setError('Please select keywords to export')
      return
    }

    // Get selected keyword objects
    const selectedKeywordObjects = generatedKeywords.filter(keyword => 
      selectedKeywords.includes(keyword.keyword)
    )

    // Create CSV content
    const csvContent = [
      'Keyword,Search Volume,Competition,Relevance,Reasoning,Suggestions',
      ...selectedKeywordObjects.map(keyword => 
        `"${keyword.keyword}","${keyword.searchVolume}","${keyword.competition}","${keyword.relevance}","${keyword.reasoning}","${keyword.suggestions?.join('; ') || ''}"`
      )
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const downloadUrl = URL.createObjectURL(blob)
    link.setAttribute('href', downloadUrl)
    link.setAttribute('download', `seo-keywords-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setSuccess(`Exported ${selectedKeywords.length} keywords to CSV file`)
    setError(null)
  }

  const createContentPlan = () => {
    if (selectedKeywords.length === 0) {
      setError('Please select keywords to create a content plan')
      return
    }

    // Get selected keyword objects
    const selectedKeywordObjects = generatedKeywords.filter(keyword => 
      selectedKeywords.includes(keyword.keyword)
    )

    // Create content plan
    const contentPlan = {
      title: `Content Plan for ${url}`,
      date: new Date().toISOString().split('T')[0],
      keywords: selectedKeywordObjects.map(keyword => ({
        keyword: keyword.keyword,
        searchVolume: keyword.searchVolume,
        competition: keyword.competition,
        relevance: keyword.relevance,
        contentIdeas: [
          `Ultimate Guide to ${keyword.keyword}`,
          `${keyword.keyword}: Best Practices and Tips`,
          `How to Choose the Right ${keyword.keyword}`,
          `${keyword.keyword} Trends for 2024`,
          `Common ${keyword.keyword} Mistakes to Avoid`
        ],
        suggestedContent: [
          `Blog post: "Complete Guide to ${keyword.keyword}"`,
          `Infographic: "${keyword.keyword} Statistics"`,
          `Video: "Introduction to ${keyword.keyword}"`,
          `Case study: "Success with ${keyword.keyword}"`,
          `Tool/Resource: "${keyword.keyword} Checklist"`
        ]
      }))
    }

    // Create and download file
    const jsonContent = JSON.stringify(contentPlan, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const link = document.createElement('a')
    const downloadUrl = URL.createObjectURL(blob)
    link.setAttribute('href', downloadUrl)
    link.setAttribute('download', `content-plan-${new Date().toISOString().split('T')[0]}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setSuccess(`Created content plan with ${selectedKeywords.length} keywords`)
    setError(null)
  }

  const getVolumeColor = (volume: string) => {
    switch (volume) {
      case 'high': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 8) return 'text-green-600'
    if (relevance >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredKeywords = generatedKeywords.filter(keyword => {
    // If no search query, show all valid keywords
    if (!searchQuery.trim()) {
      return keyword && keyword.keyword
    }
    
    // If search query exists, filter by keyword or suggestions
    return keyword && 
      keyword.keyword && 
      (keyword.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (keyword.suggestions && keyword.suggestions.some(suggestion => 
        suggestion && suggestion.toLowerCase().includes(searchQuery.toLowerCase())
      )))
  })


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <span className="mr-3">🔍</span>
              AI Keyword Research
            </h2>
            <p className="text-green-100 mt-1">
              Discover high-value keywords with AI-powered analysis
            </p>
          </div>
          <button
            onClick={generateKeywords}
            disabled={loading}
            className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                Researching...
              </div>
            ) : (
              'Research Keywords'
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

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-green-600 text-xl mr-2">✅</span>
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      {/* Current Keywords */}
      {currentKeywords.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {currentKeywords.map((keyword, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter */}
      {generatedKeywords.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">AI Keyword Suggestions</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
              <span className="text-sm text-gray-600">
                {selectedKeywords.length} selected
              </span>
            </div>
          </div>

          {/* Keyword Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKeywords.map((keyword, index) => {
              // Skip rendering if keyword data is malformed
              if (!keyword || !keyword.keyword) {
                return null
              }
              
              return (
                <div 
                  key={index} 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedKeywords.includes(keyword.keyword)
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => keyword.keyword && toggleKeywordSelection(keyword.keyword)}
                >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-gray-900 flex-1">{keyword.keyword}</h4>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    selectedKeywords.includes(keyword.keyword)
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedKeywords.includes(keyword.keyword) && (
                      <span className="text-white text-xs">✓</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Search Volume:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getVolumeColor(keyword.searchVolume || 'low')}`}>
                      {keyword.searchVolume || 'low'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Competition:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCompetitionColor(keyword.competition || 'medium')}`}>
                      {keyword.competition || 'medium'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Relevance:</span>
                    <span className={`text-sm font-medium ${getRelevanceColor(keyword.relevance || 5)}`}>
                      {keyword.relevance || 5}/10
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{keyword.reasoning || 'No reasoning provided for this keyword.'}</p>

                {keyword.suggestions && keyword.suggestions.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Related Keywords:</p>
                    <div className="flex flex-wrap gap-1">
                      {keyword.suggestions.slice(0, 3).map((suggestion, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {suggestion}
                        </span>
                      ))}
                      {keyword.suggestions.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                          +{keyword.suggestions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
                </div>
              )
            })}
          </div>

          {filteredKeywords.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-4">🔍</div>
              <p className="text-gray-600">
                {searchQuery.trim() 
                  ? `No keywords match "${searchQuery}"` 
                  : 'No keywords generated yet. Click "Generate Keywords" to get started.'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selected Keywords Summary */}
      {selectedKeywords.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Keywords</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedKeywords.map((keyword, index) => (
              <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm flex items-center">
                {keyword}
                <button
                  onClick={() => toggleKeywordSelection(keyword)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={exportKeywords}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={selectedKeywords.length === 0}
            >
              Export Keywords ({selectedKeywords.length})
            </button>
            <button 
              onClick={createContentPlan}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={selectedKeywords.length === 0}
            >
              Create Content Plan ({selectedKeywords.length})
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {generatedKeywords.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Keyword Research</h3>
          <p className="text-gray-600 mb-6">
            Click "Research Keywords" to discover high-value keywords for your website
          </p>
          <button
            onClick={generateKeywords}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Research Keywords
          </button>
        </div>
      )}

      {/* Keyword Research Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
          <span className="text-green-600 mr-2">💡</span>
          Keyword Research Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
          <div>
            <h4 className="font-medium mb-2">Volume vs Competition:</h4>
            <ul className="space-y-1">
              <li>• High volume + Low competition = Best opportunities</li>
              <li>• Medium volume + Medium competition = Good targets</li>
              <li>• High volume + High competition = Difficult but valuable</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Relevance Scoring:</h4>
            <ul className="space-y-1">
              <li>• 8-10: Highly relevant to your content</li>
              <li>• 6-7: Moderately relevant</li>
              <li>• 1-5: Low relevance, consider avoiding</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
