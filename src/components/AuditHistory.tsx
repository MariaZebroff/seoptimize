"use client"

import { useState, useEffect } from "react"
import { getAuditHistory, deleteAudit } from "@/lib/supabaseAuth"

interface AuditRecord {
  id: string
  url: string
  title: string
  meta_description: string
  
  // SEO Data
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
  
  // Performance Metrics
  fcp_score: number
  lcp_score: number
  cls_score: number
  fid_score: number
  load_time: number
  performance_metrics: any
  
  // Accessibility Data
  accessibility_issues: any
  accessibility_recommendations: any
  accessibility_audit: any
  
  // Best Practices Data
  best_practices_issues: any
  best_practices_recommendations: any
  best_practices_audit: any
  
  // Overall Scores
  mobile_score: number
  performance_score: number
  accessibility_score: number
  seo_score: number
  best_practices_score: number
  
  // Audit Status
  status: 'success' | 'error'
  error_message?: string
  created_at: string
}

interface AuditHistoryProps {
  siteId?: string
  limit?: number
}

export default function AuditHistory({ siteId, limit = 20 }: AuditHistoryProps) {
  const [audits, setAudits] = useState<AuditRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedAudit, setExpandedAudit] = useState<string | null>(null)

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
        setAudits(data || [])
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

  const calculateOverallScore = (audit: AuditRecord) => {
    return Math.round((audit.performance_score + audit.seo_score + audit.accessibility_score + audit.best_practices_score) / 4)
  }

  const getOverallScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getOverallScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 70) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  const toggleExpanded = (auditId: string) => {
    setExpandedAudit(expandedAudit === auditId ? null : auditId)
  }

  if (loading) {
    return (
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
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Audit History</h3>
        <div className="text-red-600">{error}</div>
      </div>
    )
  }

  if (audits.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Audit History</h3>
        <div className="text-gray-500 text-center py-8">
          No audit history found. Run your first audit to see results here.
        </div>
      </div>
    )
  }

  return (
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
            {/* Header Section */}
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
              <div className="flex gap-2">
                <button
                  onClick={() => toggleExpanded(audit.id)}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  {expandedAudit === audit.id ? 'Collapse' : 'View Details'}
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

            {/* Overall Score */}
            {audit.status === 'success' && (
              <div className="mb-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getOverallScoreBgColor(calculateOverallScore(audit))}`}>
                  <span className={`${getOverallScoreColor(calculateOverallScore(audit))}`}>
                    Overall Score: {calculateOverallScore(audit)}/100
                  </span>
                </div>
              </div>
            )}

            {/* Individual Scores */}
            {audit.status === 'success' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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
              </div>
            ) : (
              <div className="text-red-600 text-sm mb-4">
                Error: {audit.error_message || 'Unknown error'}
              </div>
            )}

            {/* Expanded Details */}
            {expandedAudit === audit.id && audit.status === 'success' && (
              <div className="mt-4 pt-4 border-t space-y-4">
                {/* SEO Data */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">SEO Data</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Title:</span> {audit.title || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Title Word Count:</span> {audit.title_word_count || 0}
                    </div>
                    <div>
                      <span className="font-medium">Meta Description:</span> {audit.meta_description || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Meta Description Word Count:</span> {audit.meta_description_word_count || 0}
                    </div>
                    <div>
                      <span className="font-medium">H1 Tags:</span> {audit.h1_tags?.join(', ') || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">H1 Word Count:</span> {audit.h1_word_count || 0}
                    </div>
                    <div>
                      <span className="font-medium">Total Images:</span> {audit.total_images || 0}
                    </div>
                    <div>
                      <span className="font-medium">Images Missing Alt:</span> {audit.images_missing_alt || 0}
                    </div>
                    <div>
                      <span className="font-medium">Total Links:</span> {audit.total_links || 0}
                    </div>
                    <div>
                      <span className="font-medium">Internal Links:</span> {audit.internal_link_count || 0}
                    </div>
                    <div>
                      <span className="font-medium">External Links:</span> {audit.external_link_count || 0}
                    </div>
                    <div>
                      <span className="font-medium">Broken Links:</span> {audit.broken_links?.length || 0}
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Performance Metrics</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">FCP Score:</span> {audit.fcp_score ? `${audit.fcp_score}ms` : 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">LCP Score:</span> {audit.lcp_score ? `${audit.lcp_score}ms` : 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">CLS Score:</span> {audit.cls_score || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">FID Score:</span> {audit.fid_score ? `${audit.fid_score}ms` : 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium">Load Time:</span> {audit.load_time ? `${audit.load_time}ms` : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Accessibility Data */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Accessibility Data</h5>
                  <div className="text-sm text-gray-600">
                    {audit.accessibility_issues ? (
                      <div>
                        <span className="font-medium">Issues Found:</span> {Array.isArray(audit.accessibility_issues) ? audit.accessibility_issues.length : 'N/A'}
                      </div>
                    ) : (
                      <div>No detailed accessibility data available</div>
                    )}
                  </div>
                </div>

                {/* Best Practices Data */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Best Practices Data</h5>
                  <div className="text-sm text-gray-600">
                    {audit.best_practices_issues ? (
                      <div>
                        <span className="font-medium">Issues Found:</span> {Array.isArray(audit.best_practices_issues) ? audit.best_practices_issues.length : 'N/A'}
                      </div>
                    ) : (
                      <div>No detailed best practices data available</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
