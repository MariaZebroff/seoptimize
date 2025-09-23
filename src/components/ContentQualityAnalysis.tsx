'use client'

import React from 'react'
import { ContentQualityMetrics } from '@/lib/contentQualityAnalyzer'

interface ContentQualityAnalysisProps {
  analysis: ContentQualityMetrics
}

export default function ContentQualityAnalysis({ analysis }: ContentQualityAnalysisProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-100'
      case 'B': return 'text-blue-600 bg-blue-100'
      case 'C': return 'text-yellow-600 bg-yellow-100'
      case 'D': return 'text-orange-600 bg-orange-100'
      case 'F': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Content Quality Analysis</h2>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Overall Score</div>
            <div className={`text-3xl font-bold ${getScoreColor(analysis.overallScore)}`}>
              {analysis.overallScore}/100
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-2xl font-bold ${getGradeColor(analysis.grade)}`}>
            {analysis.grade}
          </div>
        </div>
      </div>

      {/* Content Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Word Count</div>
          <div className="text-2xl font-bold text-gray-800">{analysis.wordCount.toLocaleString()}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Sentences</div>
          <div className="text-2xl font-bold text-gray-800">{analysis.sentenceCount}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Paragraphs</div>
          <div className="text-2xl font-bold text-gray-800">{analysis.paragraphCount}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Avg Words/Sentence</div>
          <div className="text-2xl font-bold text-gray-800">{analysis.averageWordsPerSentence}</div>
        </div>
      </div>

      {/* Readability Scores */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Readability Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Flesch Reading Ease</div>
            <div className="text-2xl font-bold text-blue-800">{analysis.fleschReadingEase}</div>
            <div className="text-xs text-blue-600 mt-1">
              {analysis.fleschReadingEase >= 90 ? 'Very Easy' :
               analysis.fleschReadingEase >= 80 ? 'Easy' :
               analysis.fleschReadingEase >= 70 ? 'Fairly Easy' :
               analysis.fleschReadingEase >= 60 ? 'Standard' :
               analysis.fleschReadingEase >= 50 ? 'Fairly Difficult' :
               analysis.fleschReadingEase >= 30 ? 'Difficult' : 'Very Difficult'}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Grade Level</div>
            <div className="text-2xl font-bold text-green-800">{analysis.fleschKincaidGrade}</div>
            <div className="text-xs text-green-600 mt-1">Flesch-Kincaid</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Gunning Fog Index</div>
            <div className="text-2xl font-bold text-purple-800">{analysis.gunningFogIndex}</div>
            <div className="text-xs text-purple-600 mt-1">Years of Education</div>
          </div>
        </div>
      </div>

      {/* Content Structure */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Content Structure</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Heading Hierarchy</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">H1 Headings:</span>
                <span className="font-medium">{analysis.headingHierarchy.h1Count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">H2 Headings:</span>
                <span className="font-medium">{analysis.headingHierarchy.h2Count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">H3 Headings:</span>
                <span className="font-medium">{analysis.headingHierarchy.h3Count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Proper Hierarchy:</span>
                <span className={`font-medium ${analysis.headingHierarchy.hasProperHierarchy ? 'text-green-600' : 'text-red-600'}`}>
                  {analysis.headingHierarchy.hasProperHierarchy ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">Content Quality</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Vocabulary Diversity:</span>
                <span className="font-medium">{analysis.vocabularyDiversity}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Passive Voice:</span>
                <span className="font-medium">{analysis.passiveVoicePercentage}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Avg Word Length:</span>
                <span className="font-medium">{analysis.averageWordLength} chars</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Text/HTML Ratio:</span>
                <span className="font-medium">{analysis.contentDensity.textToHtmlRatio}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Keywords */}
      {Object.keys(analysis.keywordDensity).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Keywords</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(analysis.keywordDensity).slice(0, 6).map(([keyword, density]) => (
              <div key={keyword} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{keyword}</span>
                  <span className="text-sm text-gray-600">{density.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(density * 10, 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommendations</h3>
        <div className="space-y-4">
          {analysis.recommendations.map((recommendation, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-gray-800">{recommendation.title}</h4>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(recommendation.priority)}`}>
                    {recommendation.priority.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEffortColor(recommendation.effort)}`}>
                    {recommendation.effort.toUpperCase()}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-2">{recommendation.description}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span><strong>Impact:</strong> {recommendation.impact}</span>
                <span><strong>Effort:</strong> {recommendation.effort}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}



