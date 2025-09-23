'use client'

import React, { useState, useEffect } from 'react'

interface AuditProgressProps {
  url: string
}

const AuditProgress: React.FC<AuditProgressProps> = ({ url }) => {
  const [progress, setProgress] = useState(0)
  const [currentMessage, setCurrentMessage] = useState('Initializing audit...')
  const [elapsedTime, setElapsedTime] = useState(0)

  const messages = [
    'Initializing audit...',
    'Fetching website content...',
    'Analyzing SEO structure...',
    'Running performance tests...',
    'Checking accessibility...',
    'Scanning for broken links...',
    'Analyzing content quality...',
    'Generating recommendations...',
    'Finalizing report...'
  ]

  useEffect(() => {
    const startTime = Date.now()
    
    // Update elapsed time every second
    const timeInterval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    // Simulate progress with realistic timing (80-90 seconds total)
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          clearInterval(timeInterval)
          return 100
        }
        
        // Much slower progress to match real audit timing (80-90 seconds)
        let increment = 0
        if (prev < 10) increment = 0.1 // Very slow start
        else if (prev < 30) increment = 0.2 // Slow early phase
        else if (prev < 60) increment = 0.3 // Medium phase
        else if (prev < 85) increment = 0.2 // Slower near end
        else increment = 0.1 // Very slow at the end
        
        return Math.min(prev + increment, 100)
      })
    }, 500) // Update every 500ms instead of 200ms

    // Update messages based on progress
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => {
        const progressIndex = Math.floor((progress / 100) * messages.length)
        return messages[Math.min(progressIndex, messages.length - 1)]
      })
    }, 2000) // Update messages every 2 seconds

    return () => {
      clearInterval(progressInterval)
      clearInterval(timeInterval)
      clearInterval(messageInterval)
    }
  }, [])

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="bg-white rounded-lg shadow p-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">
                     Running Page Audit
                   </h3>
          <p className="text-gray-600 mb-2">
            {currentMessage}
          </p>
          <div className="text-sm text-gray-500">
            Analyzing: <span className="font-medium text-indigo-600">{url}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{Math.round(progress)}%</span>
              <span>•</span>
              <span>{formatTime(elapsedTime)}</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Started</span>
            <span>Almost done</span>
          </div>
        </div>

        {/* Status Messages */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-800 font-medium text-sm">What we're checking:</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
              SEO Analysis
            </div>
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
              Performance
            </div>
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
              Accessibility
            </div>
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
              Link Health
            </div>
          </div>
        </div>

        {/* Patience Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-blue-800 font-medium">Thanks for your patience!</span>
          </div>
                   <p className="text-sm text-blue-700">
                     We're performing a comprehensive page analysis. This usually takes 60-90 seconds.
                   </p>
        </div>
      </div>
    </div>
  )
}

export default AuditProgress
