"use client"

import { useState } from "react"

interface AuditResult {
  title: string
  metaDescription: string
  h1Tags: string[]
  brokenLinks: string[]
  brokenLinkDetails?: Array<{
    url: string
    statusCode: number
    statusText: string
    reason: string
    parent: string
    tag: string
    attribute: string
    linkText: string
    isInternal: boolean
    isBroken: boolean
  }>
  brokenLinkSummary?: {
    total: number
    broken: number
    status: string
    duration: number
  }
  mobileScore: number
  performanceScore: number
  accessibilityScore: number
  seoScore: number
  bestPracticesScore: number
  url: string
  timestamp: string
  status: 'success' | 'error'
  error?: string
}

interface AuditResultsProps {
  result: AuditResult | null
  loading: boolean
  error: string | null
}

const ScoreCard = ({ title, score, color }: { title: string; score: number; color: string }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 50) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(score)} ${getScoreColor(score)}`}>
          {score}/100
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  )
}

const SEODataCard = ({ title, content, type = 'text' }: { title: string; content: string | string[]; type?: 'text' | 'list' }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      {type === 'list' && Array.isArray(content) ? (
        <ul className="space-y-2">
          {content.length > 0 ? (
            content.map((item, index) => (
              <li key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {item}
              </li>
            ))
          ) : (
            <p className="text-sm text-gray-500 italic">None found</p>
          )}
        </ul>
      ) : (
        <p className="text-sm text-gray-600">
          {content || <span className="text-gray-500 italic">Not found</span>}
        </p>
      )}
    </div>
  )
}

const BrokenLinksCard = ({ brokenLinkDetails, brokenLinkSummary }: { 
  brokenLinkDetails?: AuditResult['brokenLinkDetails']
  brokenLinkSummary?: AuditResult['brokenLinkSummary']
}) => {
  const getStatusColor = (statusCode: number) => {
    if (statusCode >= 500) return 'text-red-600 bg-red-50'
    if (statusCode === 404) return 'text-red-600 bg-red-50'
    return 'text-gray-600 bg-gray-50'
  }

  const getStatusIcon = (statusCode: number) => {
    if (statusCode >= 500) return '🔴'
    if (statusCode === 404) return '🔴'
    return '🟢'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Broken Links Analysis</h3>
      
      {brokenLinkSummary && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{brokenLinkSummary.total}</div>
              <div className="text-sm text-gray-500">Total Links</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{brokenLinkSummary.broken}</div>
              <div className="text-sm text-gray-500">Broken Links</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{brokenLinkSummary.total - brokenLinkSummary.broken}</div>
              <div className="text-sm text-gray-500">Working Links</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{(brokenLinkSummary.duration / 1000).toFixed(1)}s</div>
              <div className="text-sm text-gray-500">Check Duration</div>
            </div>
          </div>
        </div>
      )}

      {brokenLinkDetails && brokenLinkDetails.length > 0 ? (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Broken Link Details:</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link Text
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {brokenLinkDetails.map((link, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                      <div className="truncate" title={link.url}>
                        {link.url}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      <div className="truncate" title={link.linkText || 'No link text'}>
                        {link.linkText || <span className="text-gray-400 italic">No text</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(link.statusCode)}`}>
                        {getStatusIcon(link.statusCode)} {link.statusCode} {link.statusText}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {link.isInternal ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Internal</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">External</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {link.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-green-600 text-4xl mb-2">✅</div>
          <p className="text-gray-500">No broken links found!</p>
        </div>
      )}
    </div>
  )
}

export default function AuditResults({ result, loading, error }: AuditResultsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'seo' | 'performance'>('overview')

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Running site audit...</span>
        </div>
        <p className="text-center text-sm text-gray-500 mt-4">
          This may take 30-60 seconds depending on the website size
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Audit Failed</h3>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return null
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'seo', name: 'SEO Data', icon: '🔍' },
    { id: 'performance', name: 'Performance', icon: '⚡' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Audit Results</h2>
            <p className="text-gray-600 mt-1">{result.url}</p>
            <p className="text-sm text-gray-500 mt-1">
              Audited on {new Date(result.timestamp).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-indigo-600">
              {Math.round((result.performanceScore + result.seoScore + result.accessibilityScore + result.bestPracticesScore) / 4)}
            </div>
            <div className="text-sm text-gray-500">Overall Score</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'seo' | 'performance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
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
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <ScoreCard 
                title="Performance" 
                score={result.performanceScore} 
                color="bg-blue-500" 
              />
              <ScoreCard 
                title="SEO" 
                score={result.seoScore} 
                color="bg-green-500" 
              />
              <ScoreCard 
                title="Accessibility" 
                score={result.accessibilityScore} 
                color="bg-purple-500" 
              />
              <ScoreCard 
                title="Best Practices" 
                score={result.bestPracticesScore} 
                color="bg-orange-500" 
              />
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SEODataCard 
                  title="Page Title" 
                  content={result.title} 
                />
                <SEODataCard 
                  title="Meta Description" 
                  content={result.metaDescription} 
                />
                <SEODataCard 
                  title="H1 Tags" 
                  content={result.h1Tags} 
                  type="list"
                />
                <SEODataCard 
                  title="Basic Broken Links" 
                  content={result.brokenLinks} 
                  type="list"
                />
              </div>
              
              {/* Comprehensive Broken Links Analysis */}
              <BrokenLinksCard 
                brokenLinkDetails={result.brokenLinkDetails}
                brokenLinkSummary={result.brokenLinkSummary}
              />
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScoreCard 
                  title="Mobile Performance" 
                  score={result.mobileScore} 
                  color="bg-indigo-500" 
                />
                <ScoreCard 
                  title="Overall Performance" 
                  score={result.performanceScore} 
                  color="bg-blue-500" 
                />
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Insights</h3>
                <div className="space-y-3">
                  {result.performanceScore >= 90 && (
                    <div className="flex items-center text-green-600">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Excellent performance score!
                    </div>
                  )}
                  {result.performanceScore < 90 && result.performanceScore >= 50 && (
                    <div className="flex items-center text-yellow-600">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Performance could be improved
                    </div>
                  )}
                  {result.performanceScore < 50 && (
                    <div className="flex items-center text-red-600">
                      <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Performance needs significant improvement
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
