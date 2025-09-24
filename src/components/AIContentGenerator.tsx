"use client"

import { useState } from 'react'

interface AIContentGeneratorProps {
  currentTitle?: string
  currentMetaDescription?: string
  content: string
  targetKeywords: string[]
  onTitleGenerated?: (titles: string[]) => void
  onMetaDescriptionGenerated?: (descriptions: string[]) => void
}

export default function AIContentGenerator({
  currentTitle = '',
  currentMetaDescription = '',
  content,
  targetKeywords = [],
  onTitleGenerated,
  onMetaDescriptionGenerated
}: AIContentGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedTitles, setGeneratedTitles] = useState<string[]>([])
  const [generatedDescriptions, setGeneratedDescriptions] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<'titles' | 'descriptions'>('titles')
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([])

  // Extract keywords from content if none provided
  const extractKeywordsFromContent = (text: string): string[] => {
    // Simple keyword extraction - get words that appear multiple times and are meaningful
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3) // Only words longer than 3 characters
    
    const wordCount: { [key: string]: number } = {}
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })
    
    // Return words that appear at least 2 times, sorted by frequency
    return Object.entries(wordCount)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word, _]) => word)
  }

  // Get effective keywords (use provided or extract from content)
  const getEffectiveKeywords = (): string[] => {
    if (targetKeywords.length > 0) {
      return targetKeywords
    }
    
    if (extractedKeywords.length > 0) {
      return extractedKeywords
    }
    
    // Extract keywords from content
    const keywords = extractKeywordsFromContent(content)
    setExtractedKeywords(keywords)
    return keywords
  }

  const generateTitles = async () => {
    setLoading(true)
    setError(null)

    try {
      const effectiveKeywords = getEffectiveKeywords()
      console.log('Generating titles with keywords:', effectiveKeywords)
      
      const response = await fetch('/api/ai/titles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentTitle,
          content,
          targetKeywords: effectiveKeywords,
          count: 5,
          forceKeywords: true // Force AI to include keywords
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate title suggestions')
      }

      const data = await response.json()
      setGeneratedTitles(data.titles)
      onTitleGenerated?.(data.titles)
      
      if (data.isFallback) {
        setError('AI service unavailable. Showing fallback suggestions.')
      }
    } catch (err) {
      console.error('Error generating titles:', err)
      setError('Failed to generate title suggestions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const generateMetaDescriptions = async () => {
    setLoading(true)
    setError(null)

    try {
      const effectiveKeywords = getEffectiveKeywords()
      console.log('Generating meta descriptions with keywords:', effectiveKeywords)
      
      const response = await fetch('/api/ai/meta-descriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: currentTitle,
          content,
          targetKeywords: effectiveKeywords,
          count: 3,
          forceKeywords: true, // Force AI to include keywords
          includeCTA: true // Force AI to include call-to-action
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate meta description suggestions')
      }

      const data = await response.json()
      setGeneratedDescriptions(data.descriptions)
      onMetaDescriptionGenerated?.(data.descriptions)
      
      if (data.isFallback) {
        setError('AI service unavailable. Showing fallback suggestions.')
      }
    } catch (err) {
      console.error('Error generating meta descriptions:', err)
      setError('Failed to generate meta description suggestions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could add a toast notification here
  }

  const getCharacterCountColor = (count: number, type: 'title' | 'description') => {
    const limits = type === 'title' ? { min: 30, max: 60 } : { min: 120, max: 160 }
    
    if (count < limits.min) return 'text-red-600'
    if (count > limits.max) return 'text-orange-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <span className="mr-3">✨</span>
              AI Content Generator
            </h2>
            <p className="text-indigo-100 mt-1">
              Generate optimized titles and meta descriptions with AI
            </p>
          </div>
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
            <button
              onClick={() => setActiveTab('titles')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'titles'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">📝</span>
              Title Suggestions
            </button>
            <button
              onClick={() => setActiveTab('descriptions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'descriptions'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">📄</span>
              Meta Descriptions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Title Suggestions Tab */}
          {activeTab === 'titles' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Title Suggestions</h3>
                  <p className="text-gray-600 mt-1">
                    Generate SEO-optimized titles (50-60 characters recommended)
                  </p>
                  {getEffectiveKeywords().length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">Target keywords: </span>
                      <span className="text-sm font-medium text-indigo-600">
                        {getEffectiveKeywords().join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={generateTitles}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </div>
                  ) : (
                    'Generate Titles'
                  )}
                </button>
              </div>

              {currentTitle && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Current Title:</h4>
                  <p className="text-gray-700">{currentTitle}</p>
                  <p className={`text-sm mt-1 ${getCharacterCountColor(currentTitle.length, 'title')}`}>
                    {currentTitle.length} characters
                  </p>
                </div>
              )}

              {generatedTitles.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">AI-Generated Titles:</h4>
                  {generatedTitles.map((title, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium mb-2">{title}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`${getCharacterCountColor(title.length, 'title')}`}>
                              {title.length} characters
                            </span>
                            <span className="text-gray-500">
                              Keywords: {getEffectiveKeywords().filter(keyword => 
                                title.toLowerCase().includes(keyword.toLowerCase())
                              ).length}/{getEffectiveKeywords().length}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(title)}
                          className="ml-4 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {generatedTitles.length === 0 && !loading && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📝</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Generate Title Suggestions</h4>
                  <p className="text-gray-600">
                    Click "Generate Titles" to get AI-powered title suggestions optimized for SEO
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Meta Descriptions Tab */}
          {activeTab === 'descriptions' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Meta Description Suggestions</h3>
                  <p className="text-gray-600 mt-1">
                    Generate compelling meta descriptions (150-160 characters recommended)
                  </p>
                  {getEffectiveKeywords().length > 0 && (
                    <div className="mt-2">
                      <span className="text-sm text-gray-500">Target keywords: </span>
                      <span className="text-sm font-medium text-indigo-600">
                        {getEffectiveKeywords().join(', ')}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={generateMetaDescriptions}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </div>
                  ) : (
                    'Generate Descriptions'
                  )}
                </button>
              </div>

              {currentMetaDescription && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Current Meta Description:</h4>
                  <p className="text-gray-700">{currentMetaDescription}</p>
                  <p className={`text-sm mt-1 ${getCharacterCountColor(currentMetaDescription.length, 'description')}`}>
                    {currentMetaDescription.length} characters
                  </p>
                </div>
              )}

              {generatedDescriptions.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">AI-Generated Meta Descriptions:</h4>
                  {generatedDescriptions.map((description, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-gray-900 mb-2">{description}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`${getCharacterCountColor(description.length, 'description')}`}>
                              {description.length} characters
                            </span>
                            <span className="text-gray-500">
                              Keywords: {getEffectiveKeywords().filter(keyword => 
                                description.toLowerCase().includes(keyword.toLowerCase())
                              ).length}/{getEffectiveKeywords().length}
                            </span>
                            <span className="text-gray-500">
                              CTA: {description.includes('!') || description.includes('Learn') || description.includes('Discover') ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(description)}
                          className="ml-4 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {generatedDescriptions.length === 0 && !loading && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">📄</div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Generate Meta Descriptions</h4>
                  <p className="text-gray-600">
                    Click "Generate Descriptions" to get AI-powered meta descriptions optimized for clicks
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <span className="text-blue-600 mr-2">💡</span>
          AI Generation Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">For Titles:</h4>
            <ul className="space-y-1">
              <li>• Include your primary keyword</li>
              <li>• Keep it under 60 characters</li>
              <li>• Make it compelling and click-worthy</li>
              <li>• Use power words when appropriate</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">For Meta Descriptions:</h4>
            <ul className="space-y-1">
              <li>• Include a clear call-to-action</li>
              <li>• Keep it between 150-160 characters</li>
              <li>• Summarize the page content</li>
              <li>• Include relevant keywords naturally</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
