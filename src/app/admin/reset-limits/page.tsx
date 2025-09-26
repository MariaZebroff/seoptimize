'use client'

import { useState } from 'react'

export default function ResetLimitsPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [usage, setUsage] = useState<any>(null)
  const [resetAllLoading, setResetAllLoading] = useState(false)
  const [resetAllMessage, setResetAllMessage] = useState('')

  const resetLimits = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/admin/reset-audit-limits', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage('✅ Audit limits reset successfully!')
        await getUsage() // Refresh usage data
      } else {
        setMessage('❌ Failed to reset limits: ' + data.error)
      }
    } catch (error) {
      setMessage('❌ Error: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const getUsage = async () => {
    try {
      const response = await fetch('/api/admin/reset-audit-limits')
      const data = await response.json()
      
      if (data.success) {
        setUsage(data)
      }
    } catch (error) {
      console.error('Error getting usage:', error)
    }
  }

  const resetAllUsersToFree = async () => {
    if (!confirm('⚠️ WARNING: This will reset ALL users to the Free plan. This action cannot be undone. Are you sure you want to continue?')) {
      return
    }

    if (!confirm('This will affect ALL users in the database. Are you absolutely sure?')) {
      return
    }

    setResetAllLoading(true)
    setResetAllMessage('')
    
    try {
      const response = await fetch('/api/admin/reset-all-users-to-free', {
        method: 'POST',
      })
      
      const data = await response.json()
      
      if (data.success) {
        setResetAllMessage(`✅ Successfully reset ${data.affectedUsers} users to Free plan!`)
      } else {
        setResetAllMessage('❌ Failed to reset users: ' + data.error)
      }
    } catch (error) {
      setResetAllMessage('❌ Error: ' + error)
    } finally {
      setResetAllLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Admin: Reset Audit Limits
          </h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Reset Audit Limits
              </h2>
              <p className="text-blue-700 mb-4">
                This will reset the audit usage for anonymous users, allowing them to perform audits again.
              </p>
              
              <button
                onClick={resetLimits}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Resetting...' : 'Reset Audit Limits'}
              </button>
            </div>

            {message && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700">{message}</p>
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Current Usage Status
              </h2>
              
              <button
                onClick={getUsage}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors mb-4"
              >
                Refresh Usage Data
              </button>

              {usage && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900">Current Month:</h3>
                    <p className="text-gray-600">{usage.currentMonth}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">In-Memory Usage:</h3>
                    <pre className="bg-white border rounded p-2 text-sm overflow-auto">
                      {JSON.stringify(usage.inMemoryUsage, null, 2)}
                    </pre>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900">Database Usage:</h3>
                    <pre className="bg-white border rounded p-2 text-sm overflow-auto">
                      {JSON.stringify(usage.databaseUsage, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-red-900 mb-2">
                ⚠️ Reset All Users to Free Plan (Testing Only)
              </h2>
              <p className="text-red-700 mb-4">
                <strong>DANGER:</strong> This will reset ALL users in the database to the Free plan. 
                This is for testing purposes only and should NOT be used in production!
              </p>
              
              <button
                onClick={resetAllUsersToFree}
                disabled={resetAllLoading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {resetAllLoading ? 'Resetting All Users...' : 'Reset All Users to Free Plan'}
              </button>
            </div>

            {resetAllMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-700">{resetAllMessage}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                🔧 Clear localStorage Cache
              </h2>
              <p className="text-blue-700 mb-4">
                If users still see their old plan after reset, they may have cached payment data in localStorage. 
                This button provides instructions to clear it.
              </p>
              
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/admin/clear-localstorage-cache', { method: 'POST' })
                    const data = await response.json()
                    if (data.success) {
                      alert(`Instructions to clear localStorage cache:\n\n1. ${data.instructions.step1}\n2. ${data.instructions.step2}\n3. ${data.instructions.step3}\n4. ${data.instructions.step4}\n5. ${data.instructions.step5}\n\n${data.note}`)
                    } else {
                      alert('Failed to get instructions: ' + data.error)
                    }
                  } catch (error) {
                    alert('Error getting instructions: ' + error)
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Get localStorage Clear Instructions
              </button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-900 mb-2">
                Testing Instructions
              </h2>
              <ol className="list-decimal list-inside text-yellow-700 space-y-1">
                <li>Click "Reset Audit Limits" above</li>
                <li>Go to the audit page and run an audit - it should work</li>
                <li>Try to run a second audit - it should show "Monthly Audit Limit Reached"</li>
                <li>Come back here and reset again to test multiple times</li>
                <li><strong>For plan testing:</strong> Use "Reset All Users to Free Plan" to test plan changes</li>
                <li><strong>If plan doesn't update:</strong> Use "Get localStorage Clear Instructions" above</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

