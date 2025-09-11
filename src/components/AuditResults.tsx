"use client"

import { useState } from "react"
import { DynamicRecommendationEngine } from '@/lib/dynamicRecommendations'
import PerformanceCharts from './PerformanceCharts'
import DynamicRecommendations from './DynamicRecommendations'

interface AuditResult {
  title: string
  metaDescription: string
  h1Tags: string[]
  brokenLinks: Array<{url: string, text: string}>
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
  // New dynamic fields
  detailedResults?: DetailedAuditResults
  lighthouseResults?: unknown
}

interface AuditResultsProps {
  result: AuditResult | null
  loading: boolean
  error: string | null
}

const ScoreCard = ({ title, score, color, description, recommendations }: { 
  title: string; 
  score: number; 
  color: string;
  description?: string;
  recommendations?: string[];
}) => {
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

  const getScoreRange = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'text-green-600' }
    if (score >= 80) return { label: 'Good', color: 'text-green-500' }
    if (score >= 70) return { label: 'Fair', color: 'text-yellow-500' }
    if (score >= 50) return { label: 'Needs Improvement', color: 'text-orange-500' }
    return { label: 'Poor', color: 'text-red-600' }
  }

  const scoreRange = getScoreRange(score)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="text-right">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(score)} ${getScoreColor(score)}`}>
            {score}/100
          </div>
          <div className={`text-xs mt-1 ${scoreRange.color}`}>
            {scoreRange.label}
          </div>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div 
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
      {description && (
        <p className="text-sm text-gray-600 mb-3">{description}</p>
      )}
      {recommendations && recommendations.length > 0 && (
        <div className="mt-3">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
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

const BestPracticesInfo = ({ score }: { score: number }) => {
  const getBestPracticesInfo = (score: number) => {
    if (score >= 90) {
      return {
        description: "Your website follows excellent web development best practices. This includes proper security headers, modern web standards, and optimized resource loading.",
        recommendations: [
          "Continue maintaining current security standards",
          "Keep dependencies updated regularly",
          "Monitor for new web standards and implement them"
        ],
        status: "Excellent",
        color: "text-green-600",
        bgColor: "bg-green-50"
      }
    } else if (score >= 70) {
      return {
        description: "Your website follows most web development best practices but has some areas for improvement. Focus on security, performance, and modern web standards.",
        recommendations: [
          "Implement HTTPS and security headers",
          "Use modern JavaScript features and avoid deprecated APIs",
          "Optimize images and use appropriate formats",
          "Ensure proper error handling and user feedback"
        ],
        status: "Good",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50"
      }
    } else {
      return {
        description: "Your website needs significant improvements in web development best practices. This affects security, performance, and user experience.",
        recommendations: [
          "Implement HTTPS and security headers (HSTS, CSP)",
          "Update to modern JavaScript and avoid deprecated features",
          "Optimize images and use WebP format when possible",
          "Add proper error handling and user feedback mechanisms",
          "Use semantic HTML and proper ARIA labels",
          "Implement proper caching strategies"
        ],
        status: "Needs Improvement",
        color: "text-red-600",
        bgColor: "bg-red-50"
      }
    }
  }

  const info = getBestPracticesInfo(score)

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Best Practices Score Analysis</h3>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${info.bgColor} ${info.color}`}>
            {info.status}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">{info.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{score}</div>
            <div className="text-sm text-gray-600">Current Score</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">100</div>
            <div className="text-sm text-gray-600">Target Score</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{100 - score}</div>
            <div className="text-sm text-gray-600">Points to Improve</div>
          </div>
        </div>
      </div>

      {/* What Best Practices Include */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">What Best Practices Include</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-900 mb-3 flex items-center">
              <span className="text-blue-500 mr-2">🔒</span>
              Security Standards
            </h5>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>HTTPS:</strong> Secure data transmission</li>
              <li>• <strong>Security Headers:</strong> HSTS, CSP, X-Frame-Options</li>
              <li>• <strong>Secure Cookies:</strong> HttpOnly, Secure, SameSite</li>
              <li>• <strong>Content Security Policy:</strong> Prevent XSS attacks</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-3 flex items-center">
              <span className="text-green-500 mr-2">⚡</span>
              Performance & Standards
            </h5>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Modern JavaScript:</strong> ES6+, no deprecated APIs</li>
              <li>• <strong>Optimized Resources:</strong> Minified CSS/JS</li>
              <li>• <strong>Image Optimization:</strong> WebP, proper sizing</li>
              <li>• <strong>Caching Strategy:</strong> Browser and CDN caching</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-3 flex items-center">
              <span className="text-purple-500 mr-2">♿</span>
              User Experience
            </h5>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Error Handling:</strong> Graceful error management</li>
              <li>• <strong>User Feedback:</strong> Loading states, notifications</li>
              <li>• <strong>Accessibility:</strong> ARIA labels, semantic HTML</li>
              <li>• <strong>Mobile Responsiveness:</strong> Touch-friendly design</li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-3 flex items-center">
              <span className="text-orange-500 mr-2">🏗️</span>
              Code Quality
            </h5>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• <strong>Clean Code:</strong> Readable, maintainable structure</li>
              <li>• <strong>Standards Compliance:</strong> W3C validation</li>
              <li>• <strong>Dependency Management:</strong> Updated libraries</li>
              <li>• <strong>Documentation:</strong> Clear code comments</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Impact on Business */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Impact on Your Business</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">🔍</div>
            <h5 className="font-medium text-gray-900 mb-2">SEO Rankings</h5>
            <p className="text-sm text-gray-600">Google considers best practices when ranking websites. Poor practices can hurt your search visibility.</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">👥</div>
            <h5 className="font-medium text-gray-900 mb-2">User Trust</h5>
            <p className="text-sm text-gray-600">Security issues and poor performance can damage user trust and increase bounce rates.</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-2">💰</div>
            <h5 className="font-medium text-gray-900 mb-2">Conversion Rates</h5>
            <p className="text-sm text-gray-600">Modern standards and good UX practices directly impact your conversion rates and revenue.</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Priority Recommendations</h4>
        <div className="space-y-3">
          {info.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
              <span className="text-indigo-500 mr-3 mt-1 font-bold">{index + 1}.</span>
              <span className="text-sm text-gray-700">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Wins */}
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Wins (Easy to Implement)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">🔧 Technical</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Add security headers (HSTS, CSP)</li>
              <li>• Enable HTTPS redirect</li>
              <li>• Optimize images (WebP format)</li>
              <li>• Minify CSS and JavaScript</li>
            </ul>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">🎨 Content</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Add proper error pages</li>
              <li>• Implement loading states</li>
              <li>• Use semantic HTML tags</li>
              <li>• Add ARIA labels for accessibility</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

const PerformanceInfo = ({ performanceScore, mobileScore }: { performanceScore: number; mobileScore: number }) => {
  const getPerformanceInfo = (score: number) => {
    if (score >= 90) {
      return {
        description: "Excellent performance! Your website loads quickly and provides a great user experience.",
        recommendations: [
          "Continue monitoring performance metrics",
          "Consider implementing advanced optimizations like service workers"
        ]
      }
    } else if (score >= 70) {
      return {
        description: "Good performance with room for improvement. Focus on optimizing loading times and resource efficiency.",
        recommendations: [
          "Optimize images and use modern formats (WebP, AVIF)",
          "Minify CSS, JavaScript, and HTML",
          "Enable compression (Gzip/Brotli)",
          "Implement browser caching"
        ]
      }
    } else {
      return {
        description: "Performance needs significant improvement. Slow loading times can hurt user experience and SEO rankings.",
        recommendations: [
          "Optimize and compress images",
          "Minify and bundle CSS/JavaScript files",
          "Enable server-side compression",
          "Implement lazy loading for images",
          "Use a Content Delivery Network (CDN)",
          "Optimize server response times"
        ]
      }
    }
  }

  const performanceInfo = getPerformanceInfo(performanceScore)
  const mobileInfo = getPerformanceInfo(mobileScore)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Explained</h3>
        <p className="text-sm text-gray-600 mb-4">{performanceInfo.description}</p>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Key Performance Metrics:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>First Contentful Paint (FCP):</strong> Time to first content display</li>
              <li>• <strong>Largest Contentful Paint (LCP):</strong> Time to largest content load</li>
              <li>• <strong>Cumulative Layout Shift (CLS):</strong> Visual stability during loading</li>
              <li>• <strong>First Input Delay (FID):</strong> Interactivity responsiveness</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Performance Recommendations:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {performanceInfo.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Mobile Performance</h3>
        <p className="text-sm text-gray-600 mb-4">{mobileInfo.description}</p>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Mobile-Specific Optimizations:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• <strong>Responsive Design:</strong> Adapts to different screen sizes</li>
              <li>• <strong>Touch Optimization:</strong> Proper touch targets and gestures</li>
              <li>• <strong>Mobile-First Loading:</strong> Prioritizes mobile user experience</li>
              <li>• <strong>Network Efficiency:</strong> Optimized for slower mobile connections</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Mobile Recommendations:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {mobileInfo.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-indigo-500 mr-2">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

const AccessibilityInfo = ({ score }: { score: number }) => {
  const getAccessibilityInfo = (score: number) => {
    if (score >= 90) {
      return {
        description: "Excellent accessibility! Your website is highly accessible to users with disabilities and follows WCAG guidelines.",
        recommendations: [
          "Continue regular accessibility audits",
          "Test with actual users who have disabilities"
        ]
      }
    } else if (score >= 70) {
      return {
        description: "Good accessibility with some areas for improvement. Focus on keyboard navigation and screen reader compatibility.",
        recommendations: [
          "Add proper ARIA labels and roles",
          "Ensure all interactive elements are keyboard accessible",
          "Improve color contrast ratios",
          "Add alt text to all images"
        ]
      }
    } else {
      return {
        description: "Accessibility needs significant improvement. This affects users with disabilities and may impact SEO rankings.",
        recommendations: [
          "Add proper heading structure (H1, H2, H3)",
          "Include alt text for all images",
          "Ensure proper color contrast (4.5:1 minimum)",
          "Make all interactive elements keyboard accessible",
          "Add ARIA labels and roles where needed",
          "Test with screen readers"
        ]
      }
    }
  }

  const info = getAccessibilityInfo(score)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Accessibility Explained</h3>
      <p className="text-sm text-gray-600 mb-4">{info.description}</p>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">What Accessibility Includes:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Visual:</strong> Color contrast, text size, screen reader compatibility</li>
            <li>• <strong>Motor:</strong> Keyboard navigation, touch targets, timing</li>
            <li>• <strong>Cognitive:</strong> Clear content, consistent navigation, error handling</li>
            <li>• <strong>Auditory:</strong> Captions, transcripts, visual alternatives</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">WCAG Guidelines:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Perceivable:</strong> Information must be presentable in ways users can perceive</li>
            <li>• <strong>Operable:</strong> Interface components must be operable by all users</li>
            <li>• <strong>Understandable:</strong> Information and UI operation must be understandable</li>
            <li>• <strong>Robust:</strong> Content must be robust enough for various assistive technologies</li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Recommendations:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {info.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="text-indigo-500 mr-2">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

const OverallScoreInfo = ({ overallScore }: { overallScore: number }) => {
  const getScoreRange = (score: number) => {
    if (score >= 90) return { 
      label: 'Excellent', 
      color: 'text-green-600', 
      bgColor: 'bg-green-50',
      description: 'Your website performs exceptionally well across all metrics. This is a high-quality, well-optimized site.',
      impact: 'Excellent user experience, strong SEO performance, high conversion potential'
    }
    if (score >= 80) return { 
      label: 'Good', 
      color: 'text-green-500', 
      bgColor: 'bg-green-50',
      description: 'Your website performs well with minor areas for improvement. Most users will have a positive experience.',
      impact: 'Good user experience, solid SEO foundation, good conversion potential'
    }
    if (score >= 70) return { 
      label: 'Fair', 
      color: 'text-yellow-500', 
      bgColor: 'bg-yellow-50',
      description: 'Your website has decent performance but several areas need attention to provide optimal user experience.',
      impact: 'Moderate user experience, some SEO challenges, room for conversion improvement'
    }
    if (score >= 50) return { 
      label: 'Needs Improvement', 
      color: 'text-orange-500', 
      bgColor: 'bg-orange-50',
      description: 'Your website has significant performance issues that are likely affecting user experience and SEO rankings.',
      impact: 'Poor user experience, SEO ranking issues, low conversion potential'
    }
    return { 
      label: 'Poor', 
      color: 'text-red-600', 
      bgColor: 'bg-red-50',
      description: 'Your website has serious performance problems that are severely impacting user experience and search rankings.',
      impact: 'Very poor user experience, significant SEO penalties, very low conversion potential'
    }
  }

  const scoreRange = getScoreRange(overallScore)

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Score Analysis</h3>
      
      <div className={`p-4 rounded-lg mb-4 ${scoreRange.bgColor}`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className={`font-semibold ${scoreRange.color}`}>{scoreRange.label} ({overallScore}/100)</h4>
          <div className="text-2xl font-bold text-gray-900">{overallScore}</div>
        </div>
        <p className="text-sm text-gray-700">{scoreRange.description}</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Score Ranges:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-3"></div>
              <span><strong>90-100:</strong> Excellent - Outstanding performance</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-400 rounded mr-3"></div>
              <span><strong>80-89:</strong> Good - Strong performance with minor issues</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-400 rounded mr-3"></div>
              <span><strong>70-79:</strong> Fair - Decent performance, needs attention</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-400 rounded mr-3"></div>
              <span><strong>50-69:</strong> Needs Improvement - Significant issues</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
              <span><strong>0-49:</strong> Poor - Serious performance problems</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Business Impact:</h4>
          <p className="text-sm text-gray-600">{scoreRange.impact}</p>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Next Steps:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {overallScore < 70 ? (
              <>
                <li>• Focus on the lowest scoring areas first</li>
                <li>• Implement performance optimizations</li>
                <li>• Improve accessibility and user experience</li>
                <li>• Monitor progress with regular audits</li>
              </>
            ) : (
              <>
                <li>• Continue monitoring performance metrics</li>
                <li>• Implement advanced optimizations</li>
                <li>• Stay updated with web standards</li>
                <li>• Regular testing and maintenance</li>
              </>
            )}
          </ul>
        </div>
      </div>
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
  const [activeTab, setActiveTab] = useState<'overview' | 'seo' | 'performance' | 'accessibility' | 'best-practices'>('overview')
  
  // Generate dynamic recommendations if detailed results are available, otherwise use basic recommendations
  const dynamicInsights = result?.detailedResults 
    ? DynamicRecommendationEngine.generateRecommendations(result.detailedResults)
    : result 
      ? DynamicRecommendationEngine.generateBasicRecommendations({
          performanceScore: result.performanceScore,
          accessibilityScore: result.accessibilityScore,
          bestPracticesScore: result.bestPracticesScore,
          seoScore: result.seoScore
        })
      : null

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
    { id: 'performance', name: 'Performance', icon: '⚡' },
    { id: 'accessibility', name: 'Accessibility', icon: '♿' },
    { id: 'best-practices', name: 'Best Practices', icon: '✅' }
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
                onClick={() => setActiveTab(tab.id as 'overview' | 'seo' | 'performance' | 'accessibility' | 'best-practices')}
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
            <div className="space-y-6">
              {/* Overall Score Analysis */}
              <OverallScoreInfo overallScore={Math.round((result.performanceScore + result.seoScore + result.accessibilityScore + result.bestPracticesScore) / 4)} />
              
              {/* Score Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ScoreCard 
                  title="Performance" 
                  score={result.performanceScore} 
                  color="bg-blue-500"
                  description="Measures how fast your website loads and responds to user interactions."
                  recommendations={result.performanceScore < 70 ? [
                    "Optimize images and use modern formats",
                    "Minify CSS and JavaScript files",
                    "Enable compression and caching"
                  ] : undefined}
                />
                <ScoreCard 
                  title="SEO" 
                  score={result.seoScore} 
                  color="bg-green-500"
                  description="Evaluates search engine optimization factors like meta tags and content structure."
                  recommendations={result.seoScore < 70 ? [
                    "Add proper meta descriptions",
                    "Optimize heading structure",
                    "Fix broken links"
                  ] : undefined}
                />
                <ScoreCard 
                  title="Accessibility" 
                  score={result.accessibilityScore} 
                  color="bg-purple-500"
                  description="Assesses how accessible your website is to users with disabilities."
                  recommendations={result.accessibilityScore < 70 ? [
                    "Add alt text to images",
                    "Improve color contrast",
                    "Ensure keyboard navigation"
                  ] : undefined}
                />
                <ScoreCard 
                  title="Best Practices" 
                  score={result.bestPracticesScore} 
                  color="bg-orange-500"
                  description="Checks adherence to modern web development standards and security practices."
                  recommendations={result.bestPracticesScore < 70 ? [
                    "Implement HTTPS and security headers",
                    "Use modern JavaScript features",
                    "Follow web standards"
                  ] : undefined}
                />
              </div>
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
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Score:</span>
                      <span className={`text-sm font-medium ${result.seoScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.seoScore}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`text-sm font-medium ${result.seoScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.seoScore >= 70 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                    {dynamicInsights?.seo && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Content Issues:</span>
                          <span className={`text-sm font-medium ${dynamicInsights.seo.contentIssues.length === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {dynamicInsights.seo.contentIssues.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Technical Issues:</span>
                          <span className={`text-sm font-medium ${dynamicInsights.seo.technicalIssues.length === 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {dynamicInsights.seo.technicalIssues.length}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Dynamic SEO Recommendations */}
              {dynamicInsights?.seo && (
                <DynamicRecommendations 
                  recommendations={dynamicInsights.seo.recommendations}
                  issues={[...dynamicInsights.seo.contentIssues, ...dynamicInsights.seo.technicalIssues]}
                  category="seo"
                />
              )}
              
              {/* Basic Broken Links */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Broken Links</h3>
                {result.brokenLinks && result.brokenLinks.length > 0 ? (
                  <ul className="space-y-2">
                    {result.brokenLinks.map((link, index) => (
                      <li key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        <div className="font-mono text-xs text-red-700 break-all">{link.url}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          <strong>Link Text:</strong> {link.text || <span className="text-gray-400 italic">No text</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">No broken links found</p>
                )}
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
                  description="Measures performance specifically on mobile devices and slower connections."
                  recommendations={result.mobileScore < 70 ? [
                    "Optimize for mobile-first loading",
                    "Reduce image sizes for mobile",
                    "Implement touch-friendly interactions"
                  ] : undefined}
                />
                <ScoreCard 
                  title="Overall Performance" 
                  score={result.performanceScore} 
                  color="bg-blue-500"
                  description="Overall website performance including loading speed and responsiveness."
                  recommendations={result.performanceScore < 70 ? [
                    "Optimize server response times",
                    "Use a Content Delivery Network (CDN)",
                    "Implement lazy loading"
                  ] : undefined}
                />
              </div>
              
              {/* Dynamic Performance Charts */}
              {dynamicInsights?.performance && (
                <PerformanceCharts insights={dynamicInsights.performance} />
              )}
              
              {/* Dynamic Performance Recommendations */}
              {dynamicInsights?.performance && (
                <DynamicRecommendations 
                  recommendations={dynamicInsights.performance.opportunities}
                  issues={dynamicInsights.performance.criticalIssues}
                  category="performance"
                />
              )}
              
              {/* Fallback to static info if no dynamic data */}
              {!dynamicInsights?.performance && (
                <PerformanceInfo performanceScore={result.performanceScore} mobileScore={result.mobileScore} />
              )}
            </div>
          )}

          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScoreCard 
                  title="Accessibility Score" 
                  score={result.accessibilityScore} 
                  color="bg-purple-500"
                  description="Measures how accessible your website is to users with disabilities."
                  recommendations={result.accessibilityScore < 70 ? [
                    "Add proper heading structure",
                    "Include alt text for images",
                    "Ensure keyboard navigation works"
                  ] : undefined}
                />
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Accessibility Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Score:</span>
                      <span className={`text-sm font-medium ${result.accessibilityScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.accessibilityScore}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`text-sm font-medium ${result.accessibilityScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.accessibilityScore >= 70 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                    {dynamicInsights?.accessibility && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">WCAG AA:</span>
                          <span className={`text-sm font-medium ${dynamicInsights.accessibility.compliance.wcagAA ? 'text-green-600' : 'text-red-600'}`}>
                            {dynamicInsights.accessibility.compliance.wcagAA ? 'Compliant' : 'Not Compliant'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Compliance:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {Math.round(dynamicInsights.accessibility.compliance.estimatedCompliance)}%
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Dynamic Accessibility Recommendations */}
              {dynamicInsights?.accessibility && (
                <DynamicRecommendations 
                  recommendations={dynamicInsights.accessibility.recommendations}
                  issues={dynamicInsights.accessibility.criticalIssues}
                  category="accessibility"
                />
              )}
              
              {/* Fallback to static info if no dynamic data */}
              {!dynamicInsights?.accessibility && (
                <AccessibilityInfo score={result.accessibilityScore} />
              )}
            </div>
          )}

          {activeTab === 'best-practices' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ScoreCard 
                  title="Best Practices Score" 
                  score={result.bestPracticesScore} 
                  color="bg-orange-500"
                  description="Evaluates adherence to modern web development standards and security practices."
                  recommendations={result.bestPracticesScore < 70 ? [
                    "Implement HTTPS and security headers",
                    "Use modern JavaScript features",
                    "Follow web standards and best practices"
                  ] : undefined}
                />
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Best Practices Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Current Score:</span>
                      <span className={`text-sm font-medium ${result.bestPracticesScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.bestPracticesScore}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`text-sm font-medium ${result.bestPracticesScore >= 70 ? 'text-green-600' : 'text-red-600'}`}>
                        {result.bestPracticesScore >= 70 ? 'Good' : 'Needs Improvement'}
                      </span>
                    </div>
                    {dynamicInsights?.['best-practices'] && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Security Issues:</span>
                          <span className={`text-sm font-medium ${dynamicInsights['best-practices'].securityIssues.length === 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {dynamicInsights['best-practices'].securityIssues.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Standards Issues:</span>
                          <span className={`text-sm font-medium ${dynamicInsights['best-practices'].modernStandardsIssues.length === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                            {dynamicInsights['best-practices'].modernStandardsIssues.length}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Dynamic Best Practices Recommendations */}
              {dynamicInsights?.['best-practices'] && (
                <DynamicRecommendations 
                  recommendations={dynamicInsights['best-practices'].recommendations}
                  issues={[...dynamicInsights['best-practices'].securityIssues, ...dynamicInsights['best-practices'].modernStandardsIssues]}
                  category="best-practices"
                />
              )}
              
              {/* Fallback to static info if no dynamic data */}
              {!dynamicInsights?.['best-practices'] && (
                <BestPracticesInfo score={result.bestPracticesScore} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
