'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, Image } from '@react-pdf/renderer'

interface AuditData {
  id: string
  url: string
  title: string
  meta_description: string
  h1_tags: string[]
  h2_tags?: string[]
  h3_tags?: string[]
  h4_tags?: string[]
  h5_tags?: string[]
  h6_tags?: string[]
  title_word_count?: number
  meta_description_word_count?: number
  h1_word_count?: number
  h2_word_count?: number
  h3_word_count?: number
  h4_word_count?: number
  h5_word_count?: number
  h6_word_count?: number
  images_without_alt?: string[]
  images_with_alt?: string[]
  internal_links?: Array<{url: string, text: string}>
  external_links?: Array<{url: string, text: string}>
  total_links?: number
  total_images?: number
  images_missing_alt?: number
  internal_link_count?: number
  external_link_count?: number
  heading_structure?: any
  broken_links: Array<{url: string, text: string}>
  mobile_score: number
  performance_score: number
  accessibility_score: number
  seo_score: number
  best_practices_score: number
  status: string
  error_message?: string
  created_at: string
}

interface PDFReportProps {
  auditData: AuditData[]
  siteName?: string
  siteUrl?: string
}

// Create styles for the PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontSize: 12,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  scoreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  scoreCard: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  scoreTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  scoreGood: {
    color: '#059669',
  },
  scoreWarning: {
    color: '#D97706',
  },
  scorePoor: {
    color: '#DC2626',
  },
  auditItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  auditTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  auditDate: {
    fontSize: 10,
    color: '#6B7280',
  },
  auditUrl: {
    fontSize: 10,
    color: '#3B82F6',
    marginBottom: 10,
  },
  auditScores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  miniScore: {
    fontSize: 10,
    marginRight: 10,
    marginBottom: 5,
    padding: 3,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
  },
  auditDetails: {
    fontSize: 10,
    color: '#6B7280',
  },
  list: {
    marginLeft: 10,
  },
  listItem: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#9CA3AF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
})

// Helper function to get score color
const getScoreColor = (score: number) => {
  if (score >= 80) return styles.scoreGood
  if (score >= 60) return styles.scoreWarning
  return styles.scorePoor
}

// Helper function to get score status
const getScoreStatus = (score: number) => {
  if (score >= 80) return 'Good'
  if (score >= 60) return 'Needs Improvement'
  return 'Poor'
}

// PDF Document Component
const SEOAuditPDF: React.FC<PDFReportProps> = ({ auditData, siteName, siteUrl }) => {
  const latestAudit = auditData.find(audit => audit.status === 'success')
  const successfulAudits = auditData.filter(audit => audit.status === 'success')
  
  // Calculate average scores
  const avgScores = successfulAudits.length > 0 ? {
    mobile: Math.round(successfulAudits.reduce((sum, audit) => sum + audit.mobile_score, 0) / successfulAudits.length),
    performance: Math.round(successfulAudits.reduce((sum, audit) => sum + audit.performance_score, 0) / successfulAudits.length),
    accessibility: Math.round(successfulAudits.reduce((sum, audit) => sum + audit.accessibility_score, 0) / successfulAudits.length),
    seo: Math.round(successfulAudits.reduce((sum, audit) => sum + audit.seo_score, 0) / successfulAudits.length),
    bestPractices: Math.round(successfulAudits.reduce((sum, audit) => sum + audit.best_practices_score, 0) / successfulAudits.length),
  } : null

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SEO Audit Report</Text>
          <Text style={styles.subtitle}>{siteName || siteUrl || 'Website Analysis'}</Text>
          <Text style={styles.date}>
            Generated on {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={{ marginBottom: 10 }}>
            This report contains {successfulAudits.length} successful audit{successfulAudits.length !== 1 ? 's' : ''} 
            {successfulAudits.length > 0 ? ` from ${new Date(successfulAudits[successfulAudits.length - 1].created_at).toLocaleDateString()} to ${new Date(successfulAudits[0].created_at).toLocaleDateString()}` : ''}.
          </Text>
          {avgScores && (
            <Text>
              Overall performance shows an average SEO score of {avgScores.seo}/100, 
              with mobile optimization at {avgScores.mobile}/100 and accessibility at {avgScores.accessibility}/100.
            </Text>
          )}
        </View>

        {/* Current Performance Scores */}
        {latestAudit && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Performance Scores</Text>
            <View style={styles.scoreGrid}>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreTitle}>Mobile Score</Text>
                <Text style={[styles.scoreValue, getScoreColor(latestAudit.mobile_score)]}>
                  {latestAudit.mobile_score}/100
                </Text>
                <Text style={{ fontSize: 10, color: '#6B7280' }}>
                  {getScoreStatus(latestAudit.mobile_score)}
                </Text>
              </View>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreTitle}>Performance Score</Text>
                <Text style={[styles.scoreValue, getScoreColor(latestAudit.performance_score)]}>
                  {latestAudit.performance_score}/100
                </Text>
                <Text style={{ fontSize: 10, color: '#6B7280' }}>
                  {getScoreStatus(latestAudit.performance_score)}
                </Text>
              </View>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreTitle}>Accessibility Score</Text>
                <Text style={[styles.scoreValue, getScoreColor(latestAudit.accessibility_score)]}>
                  {latestAudit.accessibility_score}/100
                </Text>
                <Text style={{ fontSize: 10, color: '#6B7280' }}>
                  {getScoreStatus(latestAudit.accessibility_score)}
                </Text>
              </View>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreTitle}>SEO Score</Text>
                <Text style={[styles.scoreValue, getScoreColor(latestAudit.seo_score)]}>
                  {latestAudit.seo_score}/100
                </Text>
                <Text style={{ fontSize: 10, color: '#6B7280' }}>
                  {getScoreStatus(latestAudit.seo_score)}
                </Text>
              </View>
              <View style={styles.scoreCard}>
                <Text style={styles.scoreTitle}>Best Practices Score</Text>
                <Text style={[styles.scoreValue, getScoreColor(latestAudit.best_practices_score)]}>
                  {latestAudit.best_practices_score}/100
                </Text>
                <Text style={{ fontSize: 10, color: '#6B7280' }}>
                  {getScoreStatus(latestAudit.best_practices_score)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* SEO Analysis */}
        {latestAudit && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enhanced SEO Analysis</Text>
            <View style={styles.auditItem}>
              {/* Page Title */}
              <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Page Title</Text>
              <Text style={{ marginBottom: 5 }}>
                {latestAudit.title || 'No title found'}
              </Text>
              <Text style={{ fontSize: 10, color: '#6B7280', marginBottom: 15 }}>
                Word count: {latestAudit.title_word_count || 0} words
                {latestAudit.title_word_count && latestAudit.title_word_count >= 30 && latestAudit.title_word_count <= 60 
                  ? ' (Optimal)' 
                  : ' (Review recommended)'}
              </Text>
              
              {/* Meta Description */}
              <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Meta Description</Text>
              <Text style={{ marginBottom: 5 }}>
                {latestAudit.meta_description || 'No meta description found'}
              </Text>
              <Text style={{ fontSize: 10, color: '#6B7280', marginBottom: 15 }}>
                Word count: {latestAudit.meta_description_word_count || 0} words
                {latestAudit.meta_description_word_count && latestAudit.meta_description_word_count >= 120 && latestAudit.meta_description_word_count <= 160 
                  ? ' (Optimal)' 
                  : ' (Review recommended)'}
              </Text>
              
              {/* Heading Structure */}
              <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Heading Structure</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 }}>
                {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((level) => {
                  const tags = latestAudit[`${level}_tags` as keyof AuditData] as string[] || []
                  const wordCount = latestAudit[`${level}_word_count` as keyof AuditData] as number || 0
                  return (
                    <View key={level} style={{ marginRight: 15, marginBottom: 5 }}>
                      <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{level.toUpperCase()}: {tags.length}</Text>
                      <Text style={{ fontSize: 10, color: '#6B7280' }}>({wordCount} words)</Text>
                    </View>
                  )
                })}
              </View>
              
              {/* H1 Tags */}
              {latestAudit.h1_tags && latestAudit.h1_tags.length > 0 && (
                <>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>H1 Tags</Text>
                  <View style={styles.list}>
                    {latestAudit.h1_tags.map((tag, index) => (
                      <Text key={index} style={styles.listItem}>• {tag}</Text>
                    ))}
                  </View>
                </>
              )}
              
              {/* Images Analysis */}
              <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10, marginTop: 15 }}>Images Analysis</Text>
              <Text style={{ fontSize: 12, marginBottom: 5 }}>
                Total Images: {latestAudit.total_images || 0}
              </Text>
              <Text style={{ fontSize: 12, marginBottom: 5 }}>
                Images with Alt Text: {latestAudit.images_with_alt?.length || 0}
              </Text>
              <Text style={{ fontSize: 12, marginBottom: 10, color: latestAudit.images_missing_alt && latestAudit.images_missing_alt > 0 ? '#DC2626' : '#059669' }}>
                Images Missing Alt Text: {latestAudit.images_missing_alt || 0}
              </Text>
              
              {/* Links Analysis */}
              <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10, marginTop: 15 }}>Links Analysis</Text>
              <Text style={{ fontSize: 12, marginBottom: 5 }}>
                Total Links: {latestAudit.total_links || 0}
              </Text>
              <Text style={{ fontSize: 12, marginBottom: 5 }}>
                Internal Links: {latestAudit.internal_link_count || 0}
              </Text>
              <Text style={{ fontSize: 12, marginBottom: 10 }}>
                External Links: {latestAudit.external_link_count || 0}
              </Text>
              
              {/* Broken Links */}
              <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10, marginTop: 15 }}>Broken Links</Text>
              {latestAudit.broken_links && latestAudit.broken_links.length > 0 ? (
                <View style={styles.list}>
                  {latestAudit.broken_links.map((link, index) => (
                    <Text key={index} style={[styles.listItem, { color: '#DC2626' }]}>
                      • {link.url} {link.text && `(${link.text})`}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text style={{ color: '#059669' }}>No broken links found</Text>
              )}
            </View>
          </View>
        )}

        {/* Audit History */}
        {successfulAudits.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Audit History</Text>
            {successfulAudits.slice(0, 5).map((audit, index) => (
              <View key={audit.id} style={styles.auditItem}>
                <View style={styles.auditHeader}>
                  <Text style={styles.auditTitle}>
                    Audit #{successfulAudits.length - index}
                  </Text>
                  <Text style={styles.auditDate}>
                    {new Date(audit.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.auditUrl}>{audit.url}</Text>
                <View style={styles.auditScores}>
                  <Text style={styles.miniScore}>Mobile: {audit.mobile_score}</Text>
                  <Text style={styles.miniScore}>Performance: {audit.performance_score}</Text>
                  <Text style={styles.miniScore}>Accessibility: {audit.accessibility_score}</Text>
                  <Text style={styles.miniScore}>SEO: {audit.seo_score}</Text>
                  <Text style={styles.miniScore}>Best Practices: {audit.best_practices_score}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by SEO Optimize - Professional SEO Audit Tool
        </Text>
      </Page>
    </Document>
  )
}

// Main PDF Report Component
const PDFReport: React.FC<PDFReportProps> = ({ auditData, siteName, siteUrl }) => {
  const fileName = `seo-audit-${siteName ? siteName.replace(/[^a-zA-Z0-9]/g, '-') : 'report'}-${new Date().toISOString().split('T')[0]}.pdf`

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Download PDF Report</h3>
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        Generate a comprehensive PDF report with all audit data, scores, and recommendations.
      </div>
      
      <PDFDownloadLink
        document={<SEOAuditPDF auditData={auditData} siteName={siteName} siteUrl={siteUrl} />}
        fileName={fileName}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
      >
        {({ blob, url, loading, error }) => (
          <>
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating PDF...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF Report
              </>
            )}
          </>
        )}
      </PDFDownloadLink>
      
      {auditData.length === 0 && (
        <div className="mt-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
          No audit data available. Run an audit first to generate a report.
        </div>
      )}
    </div>
  )
}

export default PDFReport
