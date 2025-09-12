"use client"

import { DynamicRecommendation } from '@/lib/dynamicRecommendations'
import { AuditIssue } from '@/lib/puppeteerAuditService'

interface DynamicRecommendationsProps {
  recommendations: DynamicRecommendation[]
  issues?: AuditIssue[]
  category: 'performance' | 'accessibility' | 'best-practices' | 'seo'
}

export default function DynamicRecommendations({ 
  recommendations, 
  issues = [], 
  category 
}: DynamicRecommendationsProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return '⚡'
      case 'accessibility': return '♿'
      case 'best-practices': return '✅'
      case 'seo': return '🔍'
      default: return '📊'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'easy': return 'bg-green-50 text-green-700'
      case 'medium': return 'bg-yellow-50 text-yellow-700'
      case 'hard': return 'bg-red-50 text-red-700'
      default: return 'bg-gray-50 text-gray-700'
    }
  }

  const getImpactIcon = (impact: string) => {
    if (impact.includes('significantly') || impact.includes('significantly')) return '🚀'
    if (impact.includes('improve') || impact.includes('boost')) return '📈'
    if (impact.includes('affects') || impact.includes('impact')) return '⚠️'
    return '💡'
  }

  if (recommendations.length === 0 && issues.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="text-green-600 text-4xl mb-2">🎉</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Excellent Work!</h3>
          <p className="text-gray-600">
            No critical issues found in {category}. Your website is performing well in this area.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <span className="text-2xl mr-3">{getCategoryIcon(category)}</span>
          <h3 className="text-lg font-medium text-gray-900 capitalize">
            {category.replace('-', ' ')} Recommendations
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          Based on your audit results, here are specific recommendations to improve your {category} score.
        </p>
      </div>

      {/* High Priority Issues */}
      {issues.filter(issue => issue.impact === 'high').length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-red-600 mb-4 flex items-center">
            <span className="text-xl mr-2">🚨</span>
            Critical Issues (High Priority)
          </h4>
          <div className="space-y-4">
            {issues.filter(issue => issue.impact === 'high').map((issue, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-4 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{issue.title}</h5>
                    <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {issue.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                {issue.recommendation && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md">
                    <p className="text-sm text-gray-700">
                      <strong>Recommendation:</strong> {issue.recommendation}
                    </p>
                  </div>
                )}
                {issue.documentation && (
                  <div className="mt-2">
                    <a 
                      href={issue.documentation} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      Learn more →
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          {recommendations.map((recommendation, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    {getImpactIcon(recommendation.impact)} {recommendation.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(recommendation.priority)}`}>
                      {recommendation.priority.toUpperCase()} PRIORITY
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEffortColor(recommendation.effort)}`}>
                      {recommendation.effort.toUpperCase()} EFFORT
                    </span>
                    {recommendation.estimatedSavings && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        SAVES {recommendation.estimatedSavings}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Impact:</h5>
                <p className="text-sm text-gray-600">{recommendation.impact}</p>
              </div>

              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">Steps to Fix:</h5>
                <ol className="list-decimal list-inside space-y-1">
                  {recommendation.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="text-sm text-gray-600">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {recommendation.resources && recommendation.resources.length > 0 && (
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Resources:</h5>
                  <div className="space-y-1">
                    {recommendation.resources.map((resource, resourceIndex) => (
                      <a
                        key={resourceIndex}
                        href={resource}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        {resource}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Medium and Low Priority Issues */}
      {issues.filter(issue => issue.impact !== 'high').length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Other Issues</h4>
          <div className="space-y-3">
            {issues.filter(issue => issue.impact !== 'high').map((issue, index) => (
              <div key={index} className="flex items-start justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">{issue.title}</h5>
                  <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                </div>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  issue.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                }`}>
                  {issue.impact.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


