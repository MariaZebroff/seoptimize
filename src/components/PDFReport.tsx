'use client'

import React, { useState, useEffect } from 'react'

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

// Helper function to get score status
const getScoreStatus = (score: number) => {
  if (score >= 80) return 'Good'
  if (score >= 60) return 'Needs Improvement'
  return 'Poor'
}

// Generate HTML report content
const generateHTMLReport = (auditData: AuditData[], siteName?: string, siteUrl?: string): string => {
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

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEO Audit Report - ${siteName || siteUrl || 'Website Analysis'}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { border-bottom: 3px solid #3B82F6; padding-bottom: 20px; margin-bottom: 30px; }
        .title { font-size: 28px; font-weight: bold; color: #1F2937; margin-bottom: 10px; }
        .subtitle { font-size: 18px; color: #6B7280; margin-bottom: 5px; }
        .date { font-size: 14px; color: #9CA3AF; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 20px; font-weight: bold; color: #1F2937; margin-bottom: 15px; padding-bottom: 5px; border-bottom: 1px solid #E5E7EB; }
        .score-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
        .score-card { padding: 15px; background-color: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB; }
        .score-title { font-size: 14px; font-weight: bold; color: #374151; margin-bottom: 5px; }
        .score-value { font-size: 24px; font-weight: bold; color: #1F2937; }
        .score-good { color: #059669; }
        .score-warning { color: #D97706; }
        .score-poor { color: #DC2626; }
        .audit-item { margin-bottom: 20px; padding: 15px; background-color: #F9FAFB; border-radius: 8px; border: 1px solid #E5E7EB; }
        .audit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .audit-title { font-size: 14px; font-weight: bold; color: #1F2937; }
        .audit-date { font-size: 12px; color: #6B7280; }
        .audit-url { font-size: 12px; color: #3B82F6; margin-bottom: 10px; }
        .audit-scores { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 10px; }
        .mini-score { font-size: 12px; padding: 5px 10px; background-color: #E5E7EB; border-radius: 3px; }
        .list { margin-left: 20px; }
        .list-item { font-size: 12px; color: #6B7280; margin-bottom: 3px; }
        .footer { text-align: center; font-size: 12px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">SEO Audit Report</h1>
            <div class="subtitle">${siteName || siteUrl || 'Website Analysis'}</div>
            <div class="date">Generated on ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
        </div>

        <div class="section">
            <h2 class="section-title">Executive Summary</h2>
            <p>This report contains ${successfulAudits.length} successful audit${successfulAudits.length !== 1 ? 's' : ''} 
            ${successfulAudits.length > 0 ? ` from ${new Date(successfulAudits[successfulAudits.length - 1].created_at).toLocaleDateString()} to ${new Date(successfulAudits[0].created_at).toLocaleDateString()}` : ''}.</p>
            ${avgScores ? `
            <p>Overall performance shows an average SEO score of ${avgScores.seo}/100, 
            with mobile optimization at ${avgScores.mobile}/100 and accessibility at ${avgScores.accessibility}/100.</p>
            ` : ''}
        </div>

        ${latestAudit ? `
        <div class="section">
            <h2 class="section-title">Current Performance Scores</h2>
            <div class="score-grid">
                <div class="score-card">
                    <div class="score-title">Mobile Score</div>
                    <div class="score-value ${latestAudit.mobile_score >= 80 ? 'score-good' : latestAudit.mobile_score >= 60 ? 'score-warning' : 'score-poor'}">${latestAudit.mobile_score}/100</div>
                    <div style="font-size: 12px; color: #6B7280;">${getScoreStatus(latestAudit.mobile_score)}</div>
                </div>
                <div class="score-card">
                    <div class="score-title">Performance Score</div>
                    <div class="score-value ${latestAudit.performance_score >= 80 ? 'score-good' : latestAudit.performance_score >= 60 ? 'score-warning' : 'score-poor'}">${latestAudit.performance_score}/100</div>
                    <div style="font-size: 12px; color: #6B7280;">${getScoreStatus(latestAudit.performance_score)}</div>
                </div>
                <div class="score-card">
                    <div class="score-title">Accessibility Score</div>
                    <div class="score-value ${latestAudit.accessibility_score >= 80 ? 'score-good' : latestAudit.accessibility_score >= 60 ? 'score-warning' : 'score-poor'}">${latestAudit.accessibility_score}/100</div>
                    <div style="font-size: 12px; color: #6B7280;">${getScoreStatus(latestAudit.accessibility_score)}</div>
                </div>
                <div class="score-card">
                    <div class="score-title">SEO Score</div>
                    <div class="score-value ${latestAudit.seo_score >= 80 ? 'score-good' : latestAudit.seo_score >= 60 ? 'score-warning' : 'score-poor'}">${latestAudit.seo_score}/100</div>
                    <div style="font-size: 12px; color: #6B7280;">${getScoreStatus(latestAudit.seo_score)}</div>
                </div>
                <div class="score-card">
                    <div class="score-title">Best Practices Score</div>
                    <div class="score-value ${latestAudit.best_practices_score >= 80 ? 'score-good' : latestAudit.best_practices_score >= 60 ? 'score-warning' : 'score-poor'}">${latestAudit.best_practices_score}/100</div>
                    <div style="font-size: 12px; color: #6B7280;">${getScoreStatus(latestAudit.best_practices_score)}</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Enhanced SEO Analysis</h2>
            <div class="audit-item">
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Page Title</h3>
                <p style="margin-bottom: 5px;">${latestAudit.title || 'No title found'}</p>
                <p style="font-size: 12px; color: #6B7280; margin-bottom: 15px;">
                    Word count: ${latestAudit.title_word_count || 0} words
                    ${latestAudit.title_word_count && latestAudit.title_word_count >= 30 && latestAudit.title_word_count <= 60 
                      ? ' (Optimal)' 
                      : ' (Review recommended)'}
                </p>
                
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Meta Description</h3>
                <p style="margin-bottom: 5px;">${latestAudit.meta_description || 'No meta description found'}</p>
                <p style="font-size: 12px; color: #6B7280; margin-bottom: 15px;">
                    Word count: ${latestAudit.meta_description_word_count || 0} words
                    ${latestAudit.meta_description_word_count && latestAudit.meta_description_word_count >= 120 && latestAudit.meta_description_word_count <= 160 
                      ? ' (Optimal)' 
                      : ' (Review recommended)'}
                </p>
                
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Heading Structure</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px;">
                    ${['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((level) => {
                      const tags = latestAudit[`${level}_tags` as keyof AuditData] as string[] || []
                      const wordCount = latestAudit[`${level}_word_count` as keyof AuditData] as number || 0
                      return `
                        <div>
                          <div style="font-size: 14px; font-weight: bold;">${level.toUpperCase()}: ${tags.length}</div>
                          <div style="font-size: 12px; color: #6B7280;">(${wordCount} words)</div>
                        </div>
                      `
                    }).join('')}
                </div>
                
                ${latestAudit.h1_tags && latestAudit.h1_tags.length > 0 ? `
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">H1 Tags</h3>
                <ul class="list">
                    ${latestAudit.h1_tags.map(tag => `<li class="list-item">• ${tag}</li>`).join('')}
                </ul>
                ` : ''}
                
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; margin-top: 15px;">Images Analysis</h3>
                <p style="font-size: 14px; margin-bottom: 5px;">Total Images: ${latestAudit.total_images || 0}</p>
                <p style="font-size: 14px; margin-bottom: 5px;">Images with Alt Text: ${latestAudit.images_with_alt?.length || 0}</p>
                <p style="font-size: 14px; margin-bottom: 10px; color: ${latestAudit.images_missing_alt && latestAudit.images_missing_alt > 0 ? '#DC2626' : '#059669'};">
                    Images Missing Alt Text: ${latestAudit.images_missing_alt || 0}
                </p>
                
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; margin-top: 15px;">Links Analysis</h3>
                <p style="font-size: 14px; margin-bottom: 5px;">Total Links: ${latestAudit.total_links || 0}</p>
                <p style="font-size: 14px; margin-bottom: 5px;">Internal Links: ${latestAudit.internal_link_count || 0}</p>
                <p style="font-size: 14px; margin-bottom: 10px;">External Links: ${latestAudit.external_link_count || 0}</p>
                
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px; margin-top: 15px;">Broken Links</h3>
                ${latestAudit.broken_links && latestAudit.broken_links.length > 0 ? `
                <ul class="list">
                    ${latestAudit.broken_links.map(link => `<li class="list-item" style="color: #DC2626;">• ${link.url} ${link.text ? `(${link.text})` : ''}</li>`).join('')}
                </ul>
                ` : '<p style="color: #059669;">No broken links found</p>'}
            </div>
        </div>
        ` : ''}

        ${successfulAudits.length > 1 ? `
        <div class="section">
            <h2 class="section-title">Audit History</h2>
            ${successfulAudits.slice(0, 5).map((audit, index) => `
            <div class="audit-item">
                <div class="audit-header">
                    <div class="audit-title">Audit #${successfulAudits.length - index}</div>
                    <div class="audit-date">${new Date(audit.created_at).toLocaleDateString()}</div>
                </div>
                <div class="audit-url">${audit.url}</div>
                <div class="audit-scores">
                    <span class="mini-score">Mobile: ${audit.mobile_score}</span>
                    <span class="mini-score">Performance: ${audit.performance_score}</span>
                    <span class="mini-score">Accessibility: ${audit.accessibility_score}</span>
                    <span class="mini-score">SEO: ${audit.seo_score}</span>
                    <span class="mini-score">Best Practices: ${audit.best_practices_score}</span>
                </div>
            </div>
            `).join('')}
        </div>
        ` : ''}

        <div class="footer">
            Generated by SEO Optimize - Professional SEO Audit Tool
        </div>
    </div>
</body>
</html>
  `
}

// HTML Report Download Component
const HTMLReportDownload: React.FC<PDFReportProps> = ({ auditData, siteName, siteUrl }) => {
  const fileName = `seo-audit-${siteName ? siteName.replace(/[^a-zA-Z0-9]/g, '-') : 'report'}-${new Date().toISOString().split('T')[0]}.html`

  const handleDownload = () => {
    const htmlContent = generateHTMLReport(auditData, siteName, siteUrl)
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
    >
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      Download HTML Report
    </button>
  )
}

// Main Report Component
const PDFReport: React.FC<PDFReportProps> = ({ auditData, siteName, siteUrl }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Download Audit Report</h3>
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        Generate a comprehensive HTML report with all audit data, scores, and recommendations. 
        The report can be opened in any web browser and easily shared or printed.
      </div>
      
      <HTMLReportDownload auditData={auditData} siteName={siteName} siteUrl={siteUrl} />
      
      {auditData.length === 0 && (
        <div className="mt-4 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
          No audit data available. Run an audit first to generate a report.
        </div>
      )}
    </div>
  )
}

export default PDFReport
