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
    { key: 'Mobile Score', color: '#3b82f6', name: 'Mobile' },
    { key: 'Performance Score', color: '#10b981', name: 'Performance' },
    { key: 'Accessibility Score', color: '#f59e0b', name: 'Accessibility' },
    { key: 'SEO Score', color: '#8b5cf6', name: 'SEO' },
    { key: 'Best Practices Score', color: '#ef4444', name: 'Best Practices' }
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
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-800 mb-3">Current Scores & Trends</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {scoreTypes.map(({ key, color, name }) => {
            const stats = getScoreStats(key)
            return (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700">{name}</span>
                  </div>
                  <span className={`text-xs ${getTrendColor(stats.trend)}`}>
                    {getTrendIcon(stats.trend)}
                  </span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(stats.current)}`}>
                  {stats.current}
                </div>
                <div className="text-xs text-gray-500">
                  Avg: {stats.average} | 
                  {stats.change !== 0 && (
                    <span className={stats.change > 0 ? 'text-green-600' : 'text-red-600'}>
                      {stats.change > 0 ? '+' : ''}{stats.change}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              formatter={(value: number, name: string) => [value, name]}
            />
            <Legend />
            {scoreTypes.map(({ key, color }) => (
              <Line 
                key={key}
                type="monotone" 
                dataKey={key} 
                stroke={color} 
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Info */}
      {chartData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Total Audits: {chartData.length}</span>
            <span>
              Latest: {new Date(chartData[chartData.length - 1].fullDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuditScoreChart
