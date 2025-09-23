'use client'

import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface AuditData {
  id: string
  url: string
  title: string
  meta_description: string
  h1_tags: string[]
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

interface AuditScoreChartProps {
  auditData: AuditData[]
  siteName?: string
}

const AuditScoreChart: React.FC<AuditScoreChartProps> = ({ auditData, siteName }) => {
  // Filter successful audits
  const successfulAudits = auditData.filter(audit => audit.status === 'success')
  
  // Transform data for the chart
  const chartData = successfulAudits
    .map(audit => ({
      date: new Date(audit.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      fullDate: audit.created_at,
      'Mobile Score': audit.mobile_score,
      'Performance Score': audit.performance_score,
      'Accessibility Score': audit.accessibility_score,
      'SEO Score': audit.seo_score,
      'Best Practices Score': audit.best_practices_score
    }))
    .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime())

  // Calculate summary statistics
  const getScoreStats = (scoreType: string) => {
    const scores = chartData.map(d => d[scoreType as keyof typeof d] as number)
    if (scores.length === 0) return { current: 0, average: 0, trend: 0, change: 0 }
    
    const current = scores[scores.length - 1]
    const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    const previous = scores.length > 1 ? scores[scores.length - 2] : current
    const change = current - previous
    const trend = scores.length > 1 ? (scores[scores.length - 1] - scores[0]) / (scores.length - 1) : 0
    
    return { current, average, trend, change }
  }

  const scoreTypes = [
    { key: 'Mobile Score', color: '#3b82f6', name: 'Mobile', icon: '📱', description: 'Mobile usability and responsiveness' },
    { key: 'Performance Score', color: '#10b981', name: 'Performance', icon: '⚡', description: 'Page loading speed and optimization' },
    { key: 'Accessibility Score', color: '#f59e0b', name: 'Accessibility', icon: '♿', description: 'Accessibility for users with disabilities' },
    { key: 'SEO Score', color: '#8b5cf6', name: 'SEO', icon: '🔍', description: 'Search engine optimization' },
    { key: 'Best Practices Score', color: '#ef4444', name: 'Best Practices', icon: '✅', description: 'Web development best practices' }
  ]

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return '↗️'
    if (trend < 0) return '↘️'
    return '→'
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Score Trends {siteName && `- ${siteName}`}
        </h3>
        <div className="text-center text-gray-500 py-8">
          No successful audit data available for charting
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Score Trends {siteName && `- ${siteName}`}
      </h3>
      
      {/* Summary Statistics */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Current Scores & Trends</h4>
          <div className="text-sm text-gray-500">
            {chartData.length > 0 && (
              <span>Last updated: {new Date(chartData[chartData.length - 1].fullDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {scoreTypes.map(({ key, color, name, icon, description }) => {
            const stats = getScoreStats(key)
            const scoreGrade = stats.current >= 90 ? 'Excellent' : stats.current >= 70 ? 'Good' : stats.current >= 50 ? 'Needs Improvement' : 'Poor'
            const gradeColor = stats.current >= 90 ? 'text-green-600' : stats.current >= 70 ? 'text-yellow-600' : stats.current >= 50 ? 'text-orange-600' : 'text-red-600'
            
            return (
              <div key={key} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{icon}</span>
                    <div>
                      <span className="text-sm font-semibold text-gray-900">{name}</span>
                      <div className="text-xs text-gray-500">{description}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-sm font-medium ${getTrendColor(stats.trend)}`}>
                      {getTrendIcon(stats.trend)}
                    </span>
                    <span className={`text-xs ${gradeColor} font-medium`}>
                      {scoreGrade}
                    </span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className={`text-3xl font-bold ${getScoreColor(stats.current)} mb-1`}>
                    {stats.current}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300`}
                      style={{ 
                        width: `${stats.current}%`,
                        backgroundColor: color
                      }}
                    ></div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>Average:</span>
                    <span className="font-medium">{stats.average}</span>
                  </div>
                  {stats.change !== 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Change:</span>
                      <span className={`font-medium ${stats.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.change > 0 ? '↗️ +' : '↘️ '}{stats.change}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Score Trends Over Time</h4>
          <div className="text-sm text-gray-500">
            {chartData.length} audit{chartData.length !== 1 ? 's' : ''} tracked
          </div>
        </div>
        <div className="h-96 bg-gray-50 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: '#6b7280' }}
                angle={-45}
                textAnchor="end"
                height={80}
                stroke="#9ca3af"
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                stroke="#9ca3af"
                tickCount={6}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number, name: string) => [
                  <span key="value" className="font-semibold">{value}</span>, 
                  <span key="name" className="text-gray-600">{name}</span>
                ]}
                labelStyle={{ color: '#374151', fontWeight: '600' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              {scoreTypes.map(({ key, color, name, icon }) => (
                <Line 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stroke={color} 
                  strokeWidth={3}
                  dot={{ fill: color, strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: color, strokeWidth: 2 }}
                  name={`${icon} ${name}`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Info */}
      {chartData.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">
                  {chartData.length} Total Audit{chartData.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                <span className="text-sm font-medium text-gray-700">
                  Latest: {new Date(chartData[chartData.length - 1].fullDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              💡 Tip: Higher scores indicate better performance
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuditScoreChart
