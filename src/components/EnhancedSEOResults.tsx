'use client'

import React, { useState } from 'react'

interface EnhancedSEOData {
  url: string
  title: string
  meta_description: string
  h1_tags: string[] | null
  h2_tags: string[] | null
  h3_tags: string[] | null
  h4_tags: string[] | null
  h5_tags: string[] | null
  h6_tags: string[] | null
  title_word_count: number | null
  meta_description_word_count: number | null
  h1_word_count: number | null
  h2_word_count: number | null
  h3_word_count: number | null
  h4_word_count: number | null
  h5_word_count: number | null
  h6_word_count: number | null
  images_without_alt: string[] | null
  images_with_alt: string[] | null
  internal_links: string[] | null
  external_links: string[] | null
  total_links: number | null
  total_images: number | null
  images_missing_alt: number | null
  internal_link_count: number | null
  external_link_count: number | null
  heading_structure: any
  broken_links: string[] | null
}

interface EnhancedSEOResultsProps {
  auditData: EnhancedSEOData
}

const EnhancedSEOResults: React.FC<EnhancedSEOResultsProps> = ({ auditData }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'headings' | 'images' | 'links'>('overview')

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'Good'
    if (score >= 60) return 'Needs Improvement'
    return 'Poor'
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'headings', label: 'Headings', icon: '📝' },
    { id: 'images', label: 'Images', icon: '🖼️' },
    { id: 'links', label: 'Links', icon: '🔗' }
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
        <h2 className="text-2xl font-bold mb-2">Enhanced SEO Analysis</h2>
        <p className="text-indigo-100 text-sm">{auditData.url || 'Unknown URL'}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{auditData.total_images || 0}</div>
                <div className="text-sm text-gray-600">Total Images</div>
                <div className="text-xs text-gray-500 mt-1">
                  {auditData.images_missing_alt || 0} missing alt text
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{auditData.total_links || 0}</div>
                <div className="text-sm text-gray-600">Total Links</div>
                <div className="text-xs text-gray-500 mt-1">
                  {auditData.internal_link_count || 0} internal, {auditData.external_link_count || 0} external
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{auditData.heading_structure?.total || 0}</div>
                <div className="text-sm text-gray-600">Total Headings</div>
                <div className="text-xs text-gray-500 mt-1">
                  H1: {auditData.h1_tags?.length || 0}, H2: {auditData.h2_tags?.length || 0}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900">{auditData.title_word_count || 0}</div>
                <div className="text-sm text-gray-600">Title Words</div>
                <div className={`text-xs mt-1 px-2 py-1 rounded-full inline-block ${
                  (auditData.title_word_count || 0) >= 30 && (auditData.title_word_count || 0) <= 60 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {(auditData.title_word_count || 0) >= 30 && (auditData.title_word_count || 0) <= 60 ? 'Optimal' : 'Review'}
                </div>
              </div>
            </div>

            {/* Title and Meta Description */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">📄</span>
                  Page Title
                </h3>
                <div className="text-sm text-gray-600 mb-2">{auditData.title || 'No title found'}</div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{auditData.title_word_count || 0} words</span>
                  <span className={`px-2 py-1 rounded-full ${
                    (auditData.title_word_count || 0) >= 30 && (auditData.title_word_count || 0) <= 60 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {(auditData.title_word_count || 0) >= 30 && (auditData.title_word_count || 0) <= 60 ? 'Optimal' : 'Review'}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">📝</span>
                  Meta Description
                </h3>
                <div className="text-sm text-gray-600 mb-2">
                  {auditData.meta_description || 'No meta description found'}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{auditData.meta_description_word_count || 0} words</span>
                  <span className={`px-2 py-1 rounded-full ${
                    (auditData.meta_description_word_count || 0) >= 120 && (auditData.meta_description_word_count || 0) <= 160 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {(auditData.meta_description_word_count || 0) >= 120 && (auditData.meta_description_word_count || 0) <= 160 ? 'Optimal' : 'Review'}
                  </span>
                </div>
              </div>
            </div>

            {/* Heading Structure */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="mr-2">🏗️</span>
                Heading Structure 
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((level) => {
                  const count = auditData.heading_structure?.[level] || 0
                  const wordCount = auditData[`${level}_word_count` as keyof EnhancedSEOData] as number || 0
                  return (
                    <div key={level} className="text-center">
                      <div className="text-lg font-bold text-gray-900">{count}</div>
                      <div className="text-xs text-gray-600 uppercase">{level}</div>
                      {/* <div className="text-xs text-gray-500">{wordCount || 0} words</div> */}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'headings' && (
          <div className="space-y-6">
            {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((level) => {
              const tags = auditData[`${level}_tags` as keyof EnhancedSEOData] as string[] | null
              const wordCount = auditData[`${level}_word_count` as keyof EnhancedSEOData] as number | null
              
              if (!tags || tags.length === 0) return null

              return (
                <div key={level} className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <span className="mr-2">📝</span>
                    {level.toUpperCase()} Tags ({tags.length})
                    <span className="ml-2 text-sm text-gray-500">({wordCount || 0} words total)</span>
                  </h3>
                  <div className="space-y-2">
                    {tags.map((tag, index) => (
                      <div key={index} className="bg-gray-50 rounded p-3 text-sm">
                        <div className="font-medium text-gray-900">{tag}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {tag.split(/\s+/).filter(word => word.length > 0).length} words ( {tag.length} characters)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {activeTab === 'images' && (
          <div className="space-y-6">
            {/* Image Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{auditData.images_with_alt?.length || 0}</div>
                <div className="text-sm text-green-700">Images with Alt Text</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">{auditData.images_missing_alt || 0}</div>
                <div className="text-sm text-red-700">Images Missing Alt Text</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-600">{auditData.total_images || 0}</div>
                <div className="text-sm text-gray-700">Total Images</div>
              </div>
            </div>

            {/* Images without Alt Text */}
            {auditData.images_without_alt && auditData.images_without_alt.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Images Missing Alt Text ({auditData.images_missing_alt || 0})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {auditData.images_without_alt.map((src, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                      <div className="font-mono text-xs text-red-700 break-all">{src}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Images with Alt Text */}
            {auditData.images_with_alt && auditData.images_with_alt.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">✅</span>
                  Images with Alt Text ({auditData.images_with_alt.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {auditData.images_with_alt.map((src, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded p-3 text-sm">
                      <div className="font-mono text-xs text-green-700 break-all">{src}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-6">
            {/* Link Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{auditData.internal_link_count || 0}</div>
                <div className="text-sm text-blue-700">Internal Links</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{auditData.external_link_count || 0}</div>
                <div className="text-sm text-purple-700">External Links</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">{auditData.broken_links?.length || 0}</div>
                <div className="text-sm text-red-700">Broken Links</div>
              </div>
            </div>

            {/* Internal Links */}
            {auditData.internal_links && auditData.internal_links.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">🔗</span>
                  Internal Links ({auditData.internal_link_count || 0})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {auditData.internal_links.map((link, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded p-3 text-sm">
                      <div className="font-mono text-xs text-blue-700 break-all">{link}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* External Links */}
            {auditData.external_links && auditData.external_links.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">🌐</span>
                  External Links ({auditData.external_link_count || 0})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {auditData.external_links.map((link, index) => (
                    <div key={index} className="bg-purple-50 border border-purple-200 rounded p-3 text-sm">
                      <div className="font-mono text-xs text-purple-700 break-all">{link}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Broken Links */}
            {auditData.broken_links && auditData.broken_links.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Broken Links ({auditData.broken_links.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {auditData.broken_links.map((link, index) => (
                    <div key={index} className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                      <div className="font-mono text-xs text-red-700 break-all">{link}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default EnhancedSEOResults
