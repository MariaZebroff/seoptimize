"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface URLInputFormProps {
  onUrlSubmit?: (url: string) => void
  isLoading?: boolean
}

export default function URLInputForm({ onUrlSubmit, isLoading = false }: URLInputFormProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const validateUrl = (inputUrl: string): boolean => {
    try {
      // Add protocol if missing
      let fullUrl = inputUrl
      if (!inputUrl.startsWith('http://') && !inputUrl.startsWith('https://')) {
        fullUrl = `https://${inputUrl}`
      }
      
      new URL(fullUrl)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!url.trim()) {
      setError('Please enter a website URL')
      return
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid website URL (e.g., example.com or https://example.com)')
      return
    }

    // Add protocol if missing
    let fullUrl = url.trim()
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = `https://${fullUrl}`
    }

    if (onUrlSubmit) {
      onUrlSubmit(fullUrl)
    } else {
      // Navigate to AI dashboard with URL parameter
      router.push(`/ai?url=${encodeURIComponent(fullUrl)}`)
    }
  }

  const handleRunAudit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!url.trim()) {
      setError('Please enter a website URL')
      return
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid website URL (e.g., example.com or https://example.com)')
      return
    }

    // Add protocol if missing
    let fullUrl = url.trim()
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = `https://${fullUrl}`
    }

    // Navigate to audit page with URL parameter
    router.push(`/audit?url=${encodeURIComponent(fullUrl)}`)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🤖</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">AI SEO Dashboard</h1>
        <p className="text-xl text-gray-600 mb-2">
          Get AI-powered SEO insights and recommendations for your website
        </p>
        <p className="text-gray-500">
          Enter your website URL to start analyzing with advanced AI
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
            Website URL
          </label>
          <div className="relative">
            <input
              type="text"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your website URL (e.g., example.com)"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">🌐</span>
            </div>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>
                <span className="mr-2">🤖</span>
                Get AI Insights
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleRunAudit}
            disabled={isLoading}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <span className="mr-2">📊</span>
            Run Full Audit
          </button>
        </div>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">Or explore existing data:</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              View Dashboard
            </button>
            <button
              onClick={() => router.push("/audit")}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Browse Audits
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-blue-500 text-xl">💡</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">AI-Powered Analysis</h3>
            <p className="text-sm text-blue-700 mt-1">
              Our AI will analyze your website's SEO performance, content quality, and provide personalized recommendations to improve your search rankings.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
