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
  internal_links: string[]
  external_links: string[]
  total_links: number
  total_images: number
  images_missing_alt: number
  internal_link_count: number
  external_link_count: number
  heading_structure: any
  broken_links: string[]
  mobile_score: number
  performance_score: number
  accessibility_score: number
  seo_score: number
  best_practices_score: number
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
          <EnhancedSEOResults auditData={audits[0]} />
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
