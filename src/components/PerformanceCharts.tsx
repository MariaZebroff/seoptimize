"use client"

import { DetailedMetrics, AuditIssue } from '@/lib/puppeteerAuditService'
import { PerformanceInsights } from '@/lib/dynamicRecommendations'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface PerformanceChartsProps {
  insights: PerformanceInsights
}

const COLORS = {
  good: '#10B981',      // green-500
  needsImprovement: '#F59E0B', // amber-500
  poor: '#EF4444',      // red-500
  primary: '#3B82F6',   // blue-500
  secondary: '#8B5CF6'  // violet-500
}

export default function PerformanceCharts({ insights }: PerformanceChartsProps) {
  const { metrics, trends, score } = insights

  // Check if we have actual metrics data or just basic score
  const hasDetailedMetrics = metrics.fcp > 0 || metrics.lcp > 0 || metrics.cls > 0 || metrics.fid > 0

  // Prepare data for Core Web Vitals chart
  const coreWebVitalsData = [
    {
      metric: 'FCP',
      value: metrics.fcp,
      threshold: 1800,
      status: trends.fcp,
      unit: 'ms'
    },
    {
      metric: 'LCP',
      value: metrics.lcp,
      threshold: 2500,
      status: trends.lcp,
      unit: 'ms'
    },
    {
      metric: 'CLS',
      value: metrics.cls,
      threshold: 0.1,
      status: trends.cls,
      unit: ''
    },
    {
      metric: 'FID',
      value: metrics.fid,
      threshold: 100,
      status: trends.fid,
      unit: 'ms'
    }
  ]

  // Prepare data for performance radar chart
  const radarData = [
    {
      subject: 'Speed',
      A: Math.max(0, 100 - (metrics.fcp / 30)), // Normalize to 0-100
      fullMark: 100
    },
    {
      subject: 'Stability',
      A: Math.max(0, 100 - (metrics.cls * 400)), // Normalize CLS
      fullMark: 100
    },
    {
      subject: 'Responsiveness',
      A: Math.max(0, 100 - (metrics.fid / 3)), // Normalize FID
      fullMark: 100
    },
    {
      subject: 'Loading',
      A: Math.max(0, 100 - (metrics.lcp / 40)), // Normalize LCP
      fullMark: 100
    }
  ]

  // Prepare data for performance breakdown
  const performanceBreakdown = [
    { name: 'Good', value: score, color: COLORS.good },
    { name: 'Needs Improvement', value: 100 - score, color: COLORS.needsImprovement }
  ]

  // Custom tooltip for Core Web Vitals
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.metric}</p>
          <p className="text-sm text-gray-600">
            Current: {data.value.toFixed(data.unit === '' ? 3 : 0)}{data.unit}
          </p>
          <p className="text-sm text-gray-600">
            Threshold: {data.threshold}{data.unit}
          </p>
          <p className={`text-sm font-medium ${
            data.status === 'good' ? 'text-green-600' : 
            data.status === 'needs-improvement' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            Status: {data.status.replace('-', ' ').toUpperCase()}
          </p>
        </div>
      )
    }
    return null
  }

  // Get color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return COLORS.good
      case 'needs-improvement': return COLORS.needsImprovement
      case 'poor': return COLORS.poor
      default: return COLORS.primary
    }
  }

  return (
    <div className="space-y-6">
      {/* Performance Score Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Score Breakdown</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {performanceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{score}</div>
                <div className="text-sm text-gray-500">Overall Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Show detailed charts only if we have actual metrics */}
      {hasDetailedMetrics ? (
        <>

      {/* Core Web Vitals Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Core Web Vitals</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={coreWebVitalsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill={COLORS.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {coreWebVitalsData.map((metric) => (
            <div key={metric.metric} className="text-center">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                metric.status === 'good' ? 'bg-green-100 text-green-800' :
                metric.status === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {metric.status === 'good' ? '✅' : metric.status === 'needs-improvement' ? '⚠️' : '❌'}
                {metric.status.replace('-', ' ').toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Radar Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Analysis</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar
                name="Performance"
                dataKey="A"
                stroke={COLORS.primary}
                fill={COLORS.primary}
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Performance Metrics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Impact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  First Contentful Paint
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metrics.fcp.toFixed(0)}ms
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    trends.fcp === 'good' ? 'bg-green-100 text-green-800' :
                    trends.fcp === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {trends.fcp.replace('-', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {trends.fcp === 'good' ? 'Excellent' : trends.fcp === 'needs-improvement' ? 'Good' : 'Needs improvement'}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Largest Contentful Paint
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metrics.lcp.toFixed(0)}ms
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    trends.lcp === 'good' ? 'bg-green-100 text-green-800' :
                    trends.lcp === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {trends.lcp.replace('-', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {trends.lcp === 'good' ? 'Excellent' : trends.lcp === 'needs-improvement' ? 'Good' : 'Needs improvement'}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Cumulative Layout Shift
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metrics.cls.toFixed(3)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    trends.cls === 'good' ? 'bg-green-100 text-green-800' :
                    trends.cls === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {trends.cls.replace('-', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {trends.cls === 'good' ? 'Excellent' : trends.cls === 'needs-improvement' ? 'Good' : 'Needs improvement'}
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  First Input Delay
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {metrics.fid.toFixed(0)}ms
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    trends.fid === 'good' ? 'bg-green-100 text-green-800' :
                    trends.fid === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {trends.fid.replace('-', ' ').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {trends.fid === 'good' ? 'Excellent' : trends.fid === 'needs-improvement' ? 'Good' : 'Needs improvement'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
        </>
      ) : (
        /* Fallback for when detailed metrics are not available */
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Analysis</h3>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Basic Performance Score</h4>
            <p className="text-gray-600 mb-4">
              Your performance score is {score}/100. For detailed Core Web Vitals metrics, 
              the advanced Lighthouse audit needs to complete successfully.
            </p>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              score >= 80 ? 'bg-green-100 text-green-800' :
              score >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {score >= 80 ? 'Good Performance' : score >= 60 ? 'Needs Improvement' : 'Poor Performance'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
