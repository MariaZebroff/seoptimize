'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface AuditData {
  id: string
  url: string
  title: string
  meta_description: string
  h1_tags: string[]
  broken_links: string[]
  mobile_score: number
  performance_score: number
  accessibility_score: number
  seo_score: number
  best_practices_score: number
  status: string
  error_message?: string
  created_at: string
}

interface AuditMetricsChartProps {
  auditData: AuditData[]
  siteName?: string
}

const AuditMetricsChart: React.FC<AuditMetricsChartProps> = ({ auditData, siteName }) => {
  // Filter successful audits only
  const successfulAudits = auditData.filter(audit => audit.status === 'success')
  
  if (successfulAudits.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Performance Metrics {siteName && `- ${siteName}`}
        </h3>
        <div className="text-center text-gray-500 py-8">
          No successful audit data available for metrics
        </div>
      </div>
    )
  }

  // Calculate average scores
  const avgScores = {
    'Mobile Score': Math.round(successfulAudits.reduce((sum, audit) => sum + audit.mobile_score, 0) / successfulAudits.length),
    'Performance Score': Math.round(successfulAudits.reduce((sum, audit) => sum + audit.performance_score, 0) / successfulAudits.length),
    'Accessibility Score': Math.round(successfulAudits.reduce((sum, audit) => sum + audit.accessibility_score, 0) / successfulAudits.length),
    'SEO Score': Math.round(successfulAudits.reduce((sum, audit) => sum + audit.seo_score, 0) / successfulAudits.length),
    'Best Practices Score': Math.round(successfulAudits.reduce((sum, audit) => sum + audit.best_practices_score, 0) / successfulAudits.length)
  }

  // Prepare data for bar chart
  const barChartData = Object.entries(avgScores).map(([key, value]) => ({
    metric: key.replace(' Score', ''),
    score: value
  }))

  // Prepare data for pie chart (score distribution)
  const scoreDistribution = {
    'Excellent (90-100)': successfulAudits.filter(audit => 
      [audit.mobile_score, audit.performance_score, audit.accessibility_score, audit.seo_score, audit.best_practices_score]
        .every(score => score >= 90)
    ).length,
    'Good (70-89)': successfulAudits.filter(audit => 
      [audit.mobile_score, audit.performance_score, audit.accessibility_score, audit.seo_score, audit.best_practices_score]
        .every(score => score >= 70 && score < 90)
    ).length,
    'Needs Improvement (0-69)': successfulAudits.filter(audit => 
      [audit.mobile_score, audit.performance_score, audit.accessibility_score, audit.seo_score, audit.best_practices_score]
        .some(score => score < 70)
    ).length
  }

  const pieChartData = Object.entries(scoreDistribution).map(([name, value]) => ({
    name,
    value,
    percentage: Math.round((value / successfulAudits.length) * 100)
  }))

  const COLORS = ['#10b981', '#f59e0b', '#ef4444']

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Performance Metrics {siteName && `- ${siteName}`}
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Scores Bar Chart */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-4">Average Scores</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="metric" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  formatter={(value: number) => [value, 'Score']}
                />
                <Bar 
                  dataKey="score" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution Pie Chart */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-4">Score Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                  formatter={(value: number, name: string) => [value, 'Audits']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="text-md font-medium text-gray-800 mb-4">Summary Statistics</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(avgScores).map(([metric, score]) => (
            <div key={metric} className="text-center">
              <div className={`text-2xl font-bold ${
                score >= 90 ? 'text-green-600' : 
                score >= 70 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {score}
              </div>
              <div className="text-sm text-gray-600">{metric.replace(' Score', '')}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AuditMetricsChart
