"use client"

import { useState, useEffect } from "react"
import { getAuditHistory, deleteAudit } from "@/lib/supabaseAuth"
import AuditScoreChart from "./AuditScoreChart"
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
  
  // Performance Metrics
  fcp_score?: number
  lcp_score?: number
  cls_score?: number
  fid_score?: number
  load_time?: number
  performance_metrics?: any
  
  // Accessibility Data
  accessibility_issues?: any
  accessibility_recommendations?: any
  accessibility_audit?: any
  
  // Best Practices Data
  best_practices_issues?: any
  best_practices_recommendations?: any
  best_practices_audit?: any
  
  // Detailed Results
  detailed_results?: any
  lighthouse_results?: any
}

interface AuditHistoryProps {
  siteId?: string
  limit?: number
  latestAuditResult?: any
}

export default function AuditHistory({ siteId, limit = 20, latestAuditResult }: AuditHistoryProps) {
  const [audits, setAudits] = useState<AuditRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'images' | 'links'>('images')
  const [expandedAudits, setExpandedAudits] = useState<Set<string>>(new Set())
  const [activeDetailTab, setActiveDetailTab] = useState<{[auditId: string]: 'seo'}>({})

  useEffect(() => {
    // Add a small delay to ensure database has been updated
    const timer = setTimeout(() => {
      loadAuditHistory()
    }, 500)
    
    return () => clearTimeout(timer)
  }, [siteId, limit])

  // Update audits when latestAuditResult changes
  useEffect(() => {
    if (latestAuditResult && latestAuditResult.status === 'success') {
      // Convert the latest audit result to match the AuditRecord format
      const latestAudit: AuditRecord = {
        id: `latest-${Date.now()}`, // Temporary ID for latest result
        url: latestAuditResult.url,
        title: latestAuditResult.title,
        meta_description: latestAuditResult.metaDescription,
        h1_tags: latestAuditResult.h1Tags || [],
        h2_tags: latestAuditResult.h2Tags || [],
        h3_tags: latestAuditResult.h3Tags || [],
        h4_tags: latestAuditResult.h4Tags || [],
        h5_tags: latestAuditResult.h5Tags || [],
        h6_tags: latestAuditResult.h6Tags || [],
        title_word_count: latestAuditResult.titleWordCount || 0,
        meta_description_word_count: latestAuditResult.metaDescriptionWordCount || 0,
        h1_word_count: latestAuditResult.h1WordCount || 0,
        h2_word_count: latestAuditResult.h2WordCount || 0,
        h3_word_count: latestAuditResult.h3WordCount || 0,
        h4_word_count: latestAuditResult.h4WordCount || 0,
        h5_word_count: latestAuditResult.h5WordCount || 0,
        h6_word_count: latestAuditResult.h6WordCount || 0,
        images_without_alt: latestAuditResult.imagesWithoutAlt || [],
        images_with_alt: latestAuditResult.imagesWithAlt || [],
        internal_links: latestAuditResult.internalLinks || [],
        external_links: latestAuditResult.externalLinks || [],
        total_links: latestAuditResult.totalLinks || 0,
        total_images: latestAuditResult.totalImages || 0,
        images_missing_alt: latestAuditResult.imagesMissingAlt || 0,
        internal_link_count: latestAuditResult.internalLinkCount || 0,
        external_link_count: latestAuditResult.externalLinkCount || 0,
        heading_structure: latestAuditResult.headingStructure || {},
        broken_links: latestAuditResult.brokenLinks || [],
        broken_link_details: latestAuditResult.brokenLinkDetails,
        broken_link_summary: latestAuditResult.brokenLinkSummary,
        mobile_score: latestAuditResult.mobileScore || 0,
        performance_score: latestAuditResult.performanceScore || 0,
        accessibility_score: latestAuditResult.accessibilityScore || 0,
        seo_score: latestAuditResult.seoScore || 0,
        best_practices_score: latestAuditResult.bestPracticesScore || 0,
        status: latestAuditResult.status || 'success',
        error_message: latestAuditResult.error,
        created_at: latestAuditResult.timestamp || new Date().toISOString(),
        enhancedSEOAnalysis: latestAuditResult.enhancedSEOAnalysis,
        
        // Performance Metrics
        fcp_score: latestAuditResult.fcpScore,
        lcp_score: latestAuditResult.lcpScore,
        cls_score: latestAuditResult.clsScore,
        fid_score: latestAuditResult.fidScore,
        load_time: latestAuditResult.loadTime,
        performance_metrics: latestAuditResult.performanceMetrics,
        
        // Accessibility Data
        accessibility_issues: latestAuditResult.accessibilityIssues,
        accessibility_recommendations: latestAuditResult.accessibilityRecommendations,
        accessibility_audit: latestAuditResult.accessibilityAudit,
        
        // Best Practices Data
        best_practices_issues: latestAuditResult.bestPracticesIssues,
        best_practices_recommendations: latestAuditResult.bestPracticesRecommendations,
        best_practices_audit: latestAuditResult.bestPracticesAudit,
        
        // Detailed Results
        detailed_results: latestAuditResult.detailedResults,
        lighthouse_results: latestAuditResult.lighthouseResults
      }

      // Update the audits array to include the latest result at the beginning
      setAudits(prevAudits => {
        // Remove any existing "latest" audit to avoid duplicates
        const filteredAudits = prevAudits.filter(audit => !audit.id.startsWith('latest-'))
        return [latestAudit, ...filteredAudits]
      })
    }
  }, [latestAuditResult])

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

  const toggleAuditExpansion = (auditId: string) => {
    setExpandedAudits(prev => {
      const newSet = new Set(prev)
      if (newSet.has(auditId)) {
        newSet.delete(auditId)
      } else {
        newSet.add(auditId)
        // Set default tab when expanding
        if (!activeDetailTab[auditId]) {
          setActiveDetailTab(prev => ({ ...prev, [auditId]: 'seo' }))
        }
      }
      return newSet
    })
  }

  const setDetailTab = (auditId: string, tab: 'seo') => {
    setActiveDetailTab(prev => ({ ...prev, [auditId]: tab }))
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
        <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Trends</h3>
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
        <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Trends</h3>
            <div className="text-center text-gray-500 py-8">
              Unable to load chart data
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
        <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Trends</h3>
            <div className="text-center text-gray-500 py-8">
              No audit data available for charting
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
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
        <AuditScoreChart 
          auditData={audits} 
          siteName={audits.length > 0 ? audits[0].url : undefined}
        />
      </div>
      
      {/* Enhanced SEO Analysis Section */}
      {audits.length > 0 && audits[0].status === 'success' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Latest SEO Analysis</h3>
            {audits[0].id.startsWith('latest-') && (
              <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Just Updated
              </div>
            )}
          </div>
          <EnhancedSEOResults 
            analysis={audits[0].enhancedSEOAnalysis} 
            auditData={{
              h1_tags: audits[0].h1_tags,
              h2_tags: audits[0].h2_tags,
              h3_tags: audits[0].h3_tags,
              h4_tags: audits[0].h4_tags,
              h5_tags: audits[0].h5_tags,
              h6_tags: audits[0].h6_tags,
              h1_word_count: audits[0].h1_word_count,
              h2_word_count: audits[0].h2_word_count,
              h3_word_count: audits[0].h3_word_count,
              h4_word_count: audits[0].h4_word_count,
              h5_word_count: audits[0].h5_word_count,
              h6_word_count: audits[0].h6_word_count
            }}
          />
        </div>
      )}

      {/* Image and Link Analysis Section with Tabs */}
      {audits.length > 0 && audits[0].status === 'success' && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Image & Link Analysis</h3>
            {audits[0].id.startsWith('latest-') && (
              <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Just Updated
              </div>
            )}
          </div>
          
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

      {/* Enhanced Audit History Section */}
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
          {audits.map((audit) => {
            const isExpanded = expandedAudits.has(audit.id)
            const currentTab = activeDetailTab[audit.id] || 'seo'
            
            return (
              <div key={audit.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                {/* Audit Header */}
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
                      {audit.id.startsWith('latest-') && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Latest
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2 break-all">{audit.url}</p>
                    <p className="text-xs text-gray-500">{formatDate(audit.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAuditExpansion(audit.id)}
                      className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
                    >
                      {isExpanded ? 'Hide Details' : 'Show Details'}
                      <svg 
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteAudit(audit.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      title="Delete audit record"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Score Overview */}
                {audit.status === 'success' ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    <div className={`text-center p-3 rounded-lg ${getScoreBgColor(audit.performance_score)}`}>
                      <div className={`text-lg font-bold ${getScoreColor(audit.performance_score)}`}>
                        {audit.performance_score}
                      </div>
                      <div className="text-xs text-gray-600">Performance</div>
                    </div>
                    <div className={`text-center p-3 rounded-lg ${getScoreBgColor(audit.seo_score)}`}>
                      <div className={`text-lg font-bold ${getScoreColor(audit.seo_score)}`}>
                        {audit.seo_score}
                      </div>
                      <div className="text-xs text-gray-600">SEO</div>
                    </div>
                    <div className={`text-center p-3 rounded-lg ${getScoreBgColor(audit.accessibility_score)}`}>
                      <div className={`text-lg font-bold ${getScoreColor(audit.accessibility_score)}`}>
                        {audit.accessibility_score}
                      </div>
                      <div className="text-xs text-gray-600">Accessibility</div>
                    </div>
                    <div className={`text-center p-3 rounded-lg ${getScoreBgColor(audit.best_practices_score)}`}>
                      <div className={`text-lg font-bold ${getScoreColor(audit.best_practices_score)}`}>
                        {audit.best_practices_score}
                      </div>
                      <div className="text-xs text-gray-600">Best Practices</div>
                    </div>
                    <div className={`text-center p-3 rounded-lg ${getScoreBgColor(audit.mobile_score)}`}>
                      <div className={`text-lg font-bold ${getScoreColor(audit.mobile_score)}`}>
                        {audit.mobile_score}
                      </div>
                      <div className="text-xs text-gray-600">Mobile</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-lg">
                    Error: {audit.error_message || 'Unknown error'}
                  </div>
                )}

                {/* Collapsible Detailed Information */}
                {isExpanded && audit.status === 'success' && (
                  <div className="border-t pt-4">
                    {/* Tab Navigation - Only SEO tab since it's the only one with data */}
                    <div className="border-b border-gray-200 mb-4">
                      <nav className="-mb-px flex space-x-8">
                        <button
                          className="py-2 px-1 border-b-2 font-medium text-sm border-blue-500 text-blue-600"
                        >
                          SEO Analysis
                        </button>
                      </nav>
                    </div>

                    {/* SEO Analysis Content */}
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-800">SEO Analysis</h5>
                      
                      {/* Content Structure and Links */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h6 className="font-medium text-gray-700">Content Structure</h6>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Title Length:</span>
                              <span className={audit.title_word_count > 60 ? 'text-red-600' : 'text-green-600'}>
                                {audit.title_word_count} characters
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Meta Description:</span>
                              <span className={audit.meta_description_word_count > 160 ? 'text-red-600' : 'text-green-600'}>
                                {audit.meta_description_word_count} characters
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>H1 Tags:</span>
                              <span className={audit.h1_tags?.length === 1 ? 'text-green-600' : 'text-yellow-600'}>
                                {audit.h1_tags?.length || 0} found
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h6 className="font-medium text-gray-700">Link Analysis</h6>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Links:</span>
                              <span className="text-blue-600 font-medium">{audit.total_links || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Internal Links:</span>
                              <span className="text-green-600">{audit.internal_link_count || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>External Links:</span>
                              <span className="text-purple-600">{audit.external_link_count || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Broken Links:</span>
                              <span className={audit.broken_links?.length > 0 ? 'text-red-600' : 'text-green-600'}>
                                {audit.broken_links?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Images and Heading Structure */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <h6 className="font-medium text-gray-700">Image Analysis</h6>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Images:</span>
                              <span className="text-blue-600 font-medium">{audit.total_images || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>With Alt Text:</span>
                              <span className="text-green-600">{audit.images_with_alt?.length || 0}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Missing Alt Text:</span>
                              <span className={audit.images_missing_alt > 0 ? 'text-red-600' : 'text-green-600'}>
                                {audit.images_missing_alt || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Alt Text Coverage:</span>
                              <span className={audit.total_images > 0 && (audit.images_missing_alt || 0) === 0 ? 'text-green-600' : 'text-yellow-600'}>
                                {audit.total_images > 0 ? Math.round(((audit.images_with_alt?.length || 0) / audit.total_images) * 100) : 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <h6 className="font-medium text-gray-700">Heading Structure</h6>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>H1:</span>
                              <span>{audit.h1_word_count || 0} words</span>
                            </div>
                            <div className="flex justify-between">
                              <span>H2:</span>
                              <span>{audit.h2_word_count || 0} words</span>
                            </div>
                            <div className="flex justify-between">
                              <span>H3:</span>
                              <span>{audit.h3_word_count || 0} words</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Broken Links Details */}
                      {audit.broken_links && audit.broken_links.length > 0 && (
                        <div className="space-y-3">
                          <h6 className="font-medium text-gray-700 flex items-center">
                            <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            Broken Links ({audit.broken_links.length})
                          </h6>
                          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                            <div className="space-y-2 p-3">
                              {audit.broken_links.map((link, index) => (
                                <div key={index} className="text-sm bg-red-50 p-2 rounded border-l-2 border-red-400">
                                  <div className="font-medium text-red-800">{link.text || 'No text'}</div>
                                  <div className="text-xs text-red-600 break-all">{link.url}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
