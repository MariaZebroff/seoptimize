'use client'

import React, { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

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
                    Character count: ${latestAudit.title ? latestAudit.title.length : 0} characters
                    ${latestAudit.title && latestAudit.title.length >= 30 && latestAudit.title.length <= 60 
                      ? ' (Optimal)' 
                      : latestAudit.title && latestAudit.title.length < 30
                        ? ' (Too short - add more characters)'
                        : latestAudit.title && latestAudit.title.length > 60
                          ? ' (Too long - remove some characters)'
                          : ' (Review recommended)'}
                </p>
                
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Meta Description</h3>
                <p style="margin-bottom: 5px;">${latestAudit.meta_description || 'No meta description found'}</p>
                <p style="font-size: 12px; color: #6B7280; margin-bottom: 15px;">
                    Character count: ${latestAudit.meta_description ? latestAudit.meta_description.length : 0} characters
                    ${latestAudit.meta_description && latestAudit.meta_description.length >= 120 && latestAudit.meta_description.length <= 160 
                      ? ' (Optimal)' 
                      : latestAudit.meta_description && latestAudit.meta_description.length < 120
                        ? ' (Too short - add more characters)'
                        : latestAudit.meta_description && latestAudit.meta_description.length > 160
                          ? ' (Too long - remove some characters)'
                          : ' (Review recommended)'}
                </p>
                
                <h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Heading Structure</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 15px;">
                    ${['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((level) => {
                      const tags = latestAudit[`${level}_tags` as keyof AuditData] as string[] || []
                      return `
                        <div>
                          <div style="font-size: 14px; font-weight: bold;">${level.toUpperCase()}: ${tags.length}</div>
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
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
    >
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      Download HTML Report
    </button>
  )
}

// PDF Report Download Component
const PDFReportDownload: React.FC<PDFReportProps> = ({ auditData, siteName, siteUrl }) => {
  const [isGenerating, setIsGenerating] = useState(false)
  const fileName = `seo-audit-${siteName ? siteName.replace(/[^a-zA-Z0-9]/g, '-') : 'report'}-${new Date().toISOString().split('T')[0]}.pdf`

  const handleDownload = async () => {
    setIsGenerating(true)
    try {
      // Create a temporary div with the HTML content
      const htmlContent = generateHTMLReport(auditData, siteName, siteUrl)
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = htmlContent
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '0'
      tempDiv.style.width = '800px'
      tempDiv.style.backgroundColor = 'white'
      document.body.appendChild(tempDiv)

      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      // Remove temporary div
      document.body.removeChild(tempDiv)

      // Create PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210
      const pageHeight = 295
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let heightLeft = imgHeight

      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isGenerating ? (
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
      
      <div className="text-sm text-gray-600 mb-6">
        Generate comprehensive reports with all audit data, scores, and recommendations. 
        Choose between HTML (fast, web-friendly) or PDF (print-ready, professional) formats.
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* HTML Report Option */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-lg font-medium text-gray-900">HTML Report</h4>
              <p className="text-sm text-gray-500">Fast & Web-Friendly</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Instant download, opens in any browser, perfect for sharing and viewing online.
          </p>
          <HTMLReportDownload auditData={auditData} siteName={siteName} siteUrl={siteUrl} />
        </div>

        {/* PDF Report Option */}
        <div className="border rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-lg font-medium text-gray-900">PDF Report</h4>
              <p className="text-sm text-gray-500">Professional & Print-Ready</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            High-quality PDF format, perfect for printing, archiving, and professional presentations.
          </p>
          <PDFReportDownload auditData={auditData} siteName={siteName} siteUrl={siteUrl} />
        </div>
      </div>
      
      {auditData.length === 0 && (
        <div className="mt-6 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
          No audit data available. Run an audit first to generate a report.
        </div>
      )}
    </div>
  )
}

export default PDFReport
