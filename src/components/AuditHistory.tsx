"use client"

import { useState, useEffect } from "react"
import { getAuditHistory, deleteAudit } from "@/lib/supabaseAuth"
import AuditScoreChart from "./AuditScoreChart"
import AuditMetricsChart from "./AuditMetricsChart"
import PDFReport from "./PDFReport"
import EnhancedSEOResults from "./EnhancedSEOResults"

interface AuditRecord {
  id: string
  url: string
  title: string
  meta_description: string
  h1_tags: string[]
  h2_tags: string[]
  h3_tags: string[]
  h4_tags: string[]
  h5_tags: string[]
  h6_tags: string[]
  title_word_count: number
  meta_description_word_count: number
  h1_word_count: number
  h2_word_count: number
  h3_word_count: number
  h4_word_count: number
  h5_word_count: number
  h6_word_count: number
  images_without_alt: string[]
  images_with_alt: string[]
  internal_links: Array<{url: string, text: string}>
  external_links: Array<{url: string, text: string}>
  total_links: number
  total_images: number
  images_missing_alt: number
  internal_link_count: number
  external_link_count: number
  heading_structure: any
  broken_links: Array<{url: string, text: string}>
  broken_link_details?: any[]
  broken_link_summary?: {
    total: number
    broken: number
    status: string
    duration: number
  }
  mobile_score: number
  performance_score: number
  accessibility_score: number
  seo_score: number
  best_practices_score: number
  status: 'success' | 'error'
  error_message?: string
  created_at: string
  enhancedSEOAnalysis?: any
}

interface AuditHistoryProps {
  siteId?: string
  limit?: number
}

export default function AuditHistory({ siteId, limit = 20 }: AuditHistoryProps) {
  const [audits, setAudits] = useState<AuditRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'images' | 'links'>('images')

  useEffect(() => {
    // Add a small delay to ensure database has been updated
    const timer = setTimeout(() => {
      loadAuditHistory()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [siteId, limit])

  const loadAuditHistory = async () => {
    try {
      setLoading(true)
      const { data, error } = await getAuditHistory(siteId, limit)
      if (error) {
        setError(error.message)
      } else {
        // Map database column names to expected property names
        const mappedAudits = (data || []).map(audit => ({
          ...audit,
          enhancedSEOAnalysis: audit.enhanced_seo_analysis
        }))
        setAudits(mappedAudits)
      }
    } catch (err) {
      setError('Failed to load audit history')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAudit = async (auditId: string) => {
    if (!confirm('Are you sure you want to delete this audit record?')) {
      return
    }

    try {
      const { error } = await deleteAudit(auditId)
      if (error) {
        alert('Failed to delete audit record')
      } else {
        setAudits(audits.filter(audit => audit.id !== auditId))
      }
    } catch (err) {
      alert('Failed to delete audit record')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 70) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* PDF Report Loading */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Download PDF Report</h3>
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
        
        {/* Charts Loading */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Trends</h3>
            <div className="h-80 animate-pulse">
              <div className="h-full bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="h-80 animate-pulse">
              <div className="h-full bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* History Loading */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Audit History</h3>
          <div className="animate-pulse">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* PDF Report Error */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Download PDF Report</h3>
          <div className="text-center text-gray-500 py-8">
            Unable to load report data
          </div>
        </div>
        
        {/* Charts Error */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Trends</h3>
            <div className="text-center text-gray-500 py-8">
              Unable to load chart data
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="text-center text-gray-500 py-8">
              Unable to load metrics data
            </div>
          </div>
        </div>
        
        {/* History Error */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Audit History</h3>
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    )
  }

  if (audits.length === 0) {
    return (
      <div className="space-y-6">
        {/* PDF Report Empty State */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Download PDF Report</h3>
          <div className="text-center text-gray-500 py-8">
            No audit data available for report generation
          </div>
        </div>
        
        {/* Charts Empty State */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Trends</h3>
            <div className="text-center text-gray-500 py-8">
              No audit data available for charting
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
            <div className="text-center text-gray-500 py-8">
              No audit data available for metrics
            </div>
          </div>
        </div>
        
        {/* History Empty State */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Audit History</h3>
          <div className="text-gray-500 text-center py-8">
            No audit history found. Run your first audit to see results here.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* PDF Report Section */}
      <PDFReport 
        auditData={audits} 
        siteName={audits.length > 0 ? audits[0].url : undefined}
        siteUrl={audits.length > 0 ? audits[0].url : undefined}
      />
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AuditScoreChart 
          auditData={audits} 
          siteName={audits.length > 0 ? audits[0].url : undefined}
        />
        <AuditMetricsChart 
          auditData={audits} 
          siteName={audits.length > 0 ? audits[0].url : undefined}
        />
      </div>
      
      {/* Enhanced SEO Analysis Section */}
      {audits.length > 0 && audits[0].status === 'success' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Latest SEO Analysis</h3>
          <EnhancedSEOResults analysis={audits[0].enhancedSEOAnalysis} />
        </div>
      )}

      {/* Image and Link Analysis Section with Tabs */}
      {audits.length > 0 && audits[0].status === 'success' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Image & Link Analysis</h3>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveAnalysisTab('images')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeAnalysisTab === 'images'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Images ({audits[0].total_images || 0})
                </div>
              </button>
              <button
                onClick={() => setActiveAnalysisTab('links')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeAnalysisTab === 'links'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Links ({audits[0].total_links || 0})
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeAnalysisTab === 'images' && (
            <div className="space-y-6">
              {/* Image Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Images</span>
                  <span className="text-2xl font-bold text-blue-600">{audits[0].total_images || 0}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">With Alt Text</span>
                  <span className="text-2xl font-bold text-green-600">{audits[0].images_with_alt?.length || 0}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Missing Alt Text</span>
                  <span className="text-2xl font-bold text-red-600">{audits[0].images_missing_alt || 0}</span>
                </div>
              </div>

              {/* Images with Alt Text */}
              {audits[0].images_with_alt && audits[0].images_with_alt.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Images with Alt Text ({audits[0].images_with_alt.length})
                  </h4>
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    <div className="space-y-2 p-4">
                      {audits[0].images_with_alt.map((image, index) => (
                        <div key={index} className="text-sm text-gray-600 bg-green-50 p-3 rounded border-l-4 border-green-400">
                          <div className="font-medium text-green-800">✓ {image}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Images without Alt Text */}
              {audits[0].images_without_alt && audits[0].images_without_alt.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Images Missing Alt Text ({audits[0].images_without_alt.length})
                  </h4>
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    <div className="space-y-2 p-4">
                      {audits[0].images_without_alt.map((image, index) => (
                        <div key={index} className="text-sm text-gray-600 bg-red-50 p-3 rounded border-l-4 border-red-400">
                          <div className="font-medium text-red-800">⚠ {image}</div>
                          <div className="text-xs text-red-600 mt-1">Add alt text for accessibility</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(!audits[0].images_with_alt || audits[0].images_with_alt.length === 0) && 
               (!audits[0].images_without_alt || audits[0].images_without_alt.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p>No images found on this page</p>
                </div>
              )}
            </div>
          )}

          {activeAnalysisTab === 'links' && (
            <div className="space-y-6">
              {/* Link Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Total Links</span>
                  <span className="text-2xl font-bold text-blue-600">{audits[0].total_links || 0}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Internal</span>
                  <span className="text-2xl font-bold text-blue-600">{audits[0].internal_link_count || 0}</span>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">External</span>
                  <span className="text-2xl font-bold text-purple-600">{audits[0].external_link_count || 0}</span>
                </div>
                
                {audits[0].broken_links && audits[0].broken_links.length > 0 && (
                  <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Broken</span>
                    <span className="text-2xl font-bold text-red-600">{audits[0].broken_links.length}</span>
                  </div>
                )}
              </div>

              {/* Internal Links */}
              {audits[0].internal_links && audits[0].internal_links.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Internal Links ({audits[0].internal_links.length})
                  </h4>
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    <div className="space-y-2 p-4">
                      {audits[0].internal_links.map((link, index) => (
                        <div key={index} className="text-sm bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                          <div className="font-medium text-blue-800">{link.text || 'No text'}</div>
                          <div className="text-xs text-blue-600 mt-1 break-all">{link.url}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* External Links */}
              {audits[0].external_links && audits[0].external_links.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    External Links ({audits[0].external_links.length})
                  </h4>
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    <div className="space-y-2 p-4">
                      {audits[0].external_links.map((link, index) => (
                        <div key={index} className="text-sm bg-purple-50 p-3 rounded border-l-4 border-purple-400">
                          <div className="font-medium text-purple-800">{link.text || 'No text'}</div>
                          <div className="text-xs text-purple-600 mt-1 break-all">{link.url}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Broken Links */}
              {audits[0].broken_links && audits[0].broken_links.length > 0 && (
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Broken Links ({audits[0].broken_links.length})
                  </h4>
                  <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                    <div className="space-y-2 p-4">
                      {audits[0].broken_links.map((link, index) => (
                        <div key={index} className="text-sm bg-red-50 p-3 rounded border-l-4 border-red-400">
                          <div className="font-medium text-red-800">{link.text || 'No text'}</div>
                          <div className="text-xs text-red-600 mt-1 break-all">{link.url}</div>
                          <div className="text-xs text-red-500 mt-1">⚠ This link appears to be broken</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {(!audits[0].internal_links || audits[0].internal_links.length === 0) && 
               (!audits[0].external_links || audits[0].external_links.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  <p>No links found on this page</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Audit History Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Audit History</h3>
          <button
            onClick={loadAuditHistory}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Refresh
          </button>
        </div>
        
        <div className="space-y-4">
          {audits.map((audit) => (
            <div key={audit.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {audit.title || audit.url}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      audit.status === 'success' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {audit.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{audit.url}</p>
                  <p className="text-xs text-gray-500">{formatDate(audit.created_at)}</p>
                </div>
                <button
                  onClick={() => handleDeleteAudit(audit.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                  title="Delete audit record"
                >
                  Delete
                </button>
              </div>

              {audit.status === 'success' ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className={`text-center p-2 rounded ${getScoreBgColor(audit.performance_score)}`}>
                    <div className={`text-sm font-medium ${getScoreColor(audit.performance_score)}`}>
                      {audit.performance_score}
                    </div>
                    <div className="text-xs text-gray-600">Performance</div>
                  </div>
                  <div className={`text-center p-2 rounded ${getScoreBgColor(audit.seo_score)}`}>
                    <div className={`text-sm font-medium ${getScoreColor(audit.seo_score)}`}>
                      {audit.seo_score}
                    </div>
                    <div className="text-xs text-gray-600">SEO</div>
                  </div>
                  <div className={`text-center p-2 rounded ${getScoreBgColor(audit.accessibility_score)}`}>
                    <div className={`text-sm font-medium ${getScoreColor(audit.accessibility_score)}`}>
                      {audit.accessibility_score}
                    </div>
                    <div className="text-xs text-gray-600">Accessibility</div>
                  </div>
                  <div className={`text-center p-2 rounded ${getScoreBgColor(audit.best_practices_score)}`}>
                    <div className={`text-sm font-medium ${getScoreColor(audit.best_practices_score)}`}>
                      {audit.best_practices_score}
                    </div>
                    <div className="text-xs text-gray-600">Best Practices</div>
                  </div>
                  <div className={`text-center p-2 rounded ${getScoreBgColor(audit.mobile_score)}`}>
                    <div className={`text-sm font-medium ${getScoreColor(audit.mobile_score)}`}>
                      {audit.mobile_score}
                    </div>
                    <div className="text-xs text-gray-600">Mobile</div>
                  </div>
                </div>
              ) : (
                <div className="text-red-600 text-sm">
                  Error: {audit.error_message || 'Unknown error'}
                </div>
              )}

              {audit.status === 'success' && audit.h1_tags && audit.h1_tags.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">H1 Tags:</span> {audit.h1_tags.join(', ')}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
