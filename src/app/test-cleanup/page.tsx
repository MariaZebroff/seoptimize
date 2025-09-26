"use client"

import { useState } from 'react'

interface CleanupStats {
  total_audits: number
  audits_last_30_days: number
  total_audit_history: number
  audit_history_last_30_days: number
  total_page_audit_usage: number
  page_audit_usage_last_30_days: number
  total_user_usage: number
  oldest_audit_date: string
  newest_audit_date: string
}

interface CleanupResult {
  deleted_audits: number
  deleted_audit_history: number
  deleted_page_audit_usage: number
  deleted_user_usage: number
  cutoff_date?: string
}

export default function TestCleanupPage() {
  const [stats, setStats] = useState<CleanupStats | null>(null)
  const [cleanupResult, setCleanupResult] = useState<CleanupResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [daysToKeep, setDaysToKeep] = useState(30)

  const getStats = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/cleanup-audit-data-simple')
      if (!response.ok) {
        throw new Error('Failed to get stats')
      }
      
      const data = await response.json()
      if (data.success) {
        setStats(data.result)
      } else {
        throw new Error(data.error || 'Failed to get stats')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const runCleanup = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/cleanup-audit-data-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'cleanup' })
      })
      
      if (!response.ok) {
        throw new Error('Failed to run cleanup')
      }
      
      const data = await response.json()
      if (data.success) {
        setCleanupResult(data.result)
        // Refresh stats after cleanup
        await getStats()
      } else {
        throw new Error(data.error || 'Failed to run cleanup')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const runManualCleanup = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/admin/cleanup-audit-data-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'cleanup_manual',
          daysToKeep: daysToKeep
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to run manual cleanup')
      }
      
      const data = await response.json()
      if (data.success) {
        setCleanupResult(data.result)
        // Refresh stats after cleanup
        await getStats()
      } else {
        throw new Error(data.error || 'Failed to run manual cleanup')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🧹 30-Day Audit Data Cleanup System
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This system automatically cleans up audit data older than 30 days to keep your database optimized.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">What gets cleaned up:</h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• <strong>audits</strong> - Audit results older than 30 days</li>
                <li>• <strong>audit_history</strong> - Audit history older than 30 days</li>
                <li>• <strong>page_audit_usage</strong> - Page audit usage older than 30 days</li>
                <li>• <strong>user_usage</strong> - Monthly usage data older than 3 months</li>
              </ul>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-2">What is preserved:</h3>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• <strong>sites</strong> - User sites (kept permanently)</li>
                <li>• <strong>pages</strong> - User pages (kept permanently)</li>
                <li>• <strong>user_subscriptions</strong> - Subscription data (kept permanently)</li>
                <li>• <strong>Recent audit data</strong> - Last 30 days</li>
              </ul>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-red-600 text-xl mr-2">⚠️</span>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={getStats}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : '📊 Get Statistics'}
            </button>
            
            <button
              onClick={runCleanup}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cleaning...' : '🧹 Run 30-Day Cleanup'}
            </button>
            
            <div className="flex gap-2">
              <input
                type="number"
                value={daysToKeep}
                onChange={(e) => setDaysToKeep(parseInt(e.target.value) || 30)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Days to keep"
                min="1"
                max="365"
              />
              <button
                onClick={runManualCleanup}
                disabled={loading}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Cleaning...' : '🧹 Manual'}
              </button>
            </div>
          </div>

          {stats && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Current Database Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Audits:</span>
                    <span className="font-semibold">{stats.total_audits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Audits (Last 30 days):</span>
                    <span className="font-semibold text-green-600">{stats.audits_last_30_days}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Audit History:</span>
                    <span className="font-semibold">{stats.total_audit_history}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Audit History (Last 30 days):</span>
                    <span className="font-semibold text-green-600">{stats.audit_history_last_30_days}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Page Audit Usage:</span>
                    <span className="font-semibold">{stats.total_page_audit_usage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Page Usage (Last 30 days):</span>
                    <span className="font-semibold text-green-600">{stats.page_audit_usage_last_30_days}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">User Usage Records:</span>
                    <span className="font-semibold">{stats.total_user_usage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date Range:</span>
                    <span className="font-semibold text-sm">
                      {stats.oldest_audit_date ? new Date(stats.oldest_audit_date).toLocaleDateString() : 'N/A'} - {stats.newest_audit_date ? new Date(stats.newest_audit_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {cleanupResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-4">✅ Cleanup Results</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-green-700">Audits Deleted:</span>
                    <span className="font-semibold text-green-800">{cleanupResult.deleted_audits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Audit History Deleted:</span>
                    <span className="font-semibold text-green-800">{cleanupResult.deleted_audit_history}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-green-700">Page Usage Deleted:</span>
                    <span className="font-semibold text-green-800">{cleanupResult.deleted_page_audit_usage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">User Usage Deleted:</span>
                    <span className="font-semibold text-green-800">{cleanupResult.deleted_user_usage}</span>
                  </div>
                </div>
                {cleanupResult.cutoff_date && (
                  <div className="col-span-2 pt-2 border-t border-green-200">
                    <div className="flex justify-between">
                      <span className="text-green-700">Cutoff Date:</span>
                      <span className="font-semibold text-green-800">
                        {new Date(cleanupResult.cutoff_date).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notes:</h3>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• This cleanup is <strong>irreversible</strong> - deleted data cannot be recovered</li>
              <li>• Always test with manual cleanup first using a small number of days</li>
              <li>• The system preserves user sites, pages, and subscription data</li>
              <li>• Only audit results and usage data older than the specified period are deleted</li>
              <li>• Run this regularly to keep your database optimized</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
