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
  // Transform data for the chart
  const chartData = auditData
    .filter(audit => audit.status === 'success') // Only show successful audits
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
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="Mobile Score" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="Performance Score" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="Accessibility Score" 
              stroke="#f59e0b" 
              strokeWidth={2}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="SEO Score" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="Best Practices Score" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default AuditScoreChart
