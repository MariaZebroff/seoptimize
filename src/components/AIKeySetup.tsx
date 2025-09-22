"use client"

import { AIService } from '@/lib/aiService'

interface AIKeySetupProps {
  onSetupComplete?: () => void
}

export default function AIKeySetup({ onSetupComplete }: AIKeySetupProps) {
  const isApiKeyAvailable = AIService.isApiKeyAvailable()

  if (isApiKeyAvailable) {
    return null
  }

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-lg p-6 text-white mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-2xl">🔑</span>
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold mb-2">
            OpenAI API Key Required
          </h3>
          <p className="text-orange-100 mb-4">
            To use AI features, you need to add your OpenAI API key to the environment variables.
          </p>
          
          <div className="bg-orange-600 bg-opacity-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2">Setup Instructions:</h4>
            <ol className="text-sm text-orange-100 space-y-1 list-decimal list-inside">
              <li>Get your API key from <a href="https://platform.openai.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">OpenAI Platform</a></li>
              <li>Add <code className="bg-orange-700 px-1 rounded">OPENAI_API_KEY=your_key_here</code> to your <code className="bg-orange-700 px-1 rounded">.env.local</code> file</li>
              <li>Restart your development server</li>
            </ol>
          </div>

          <div className="flex space-x-4">
            <a
              href="https://platform.openai.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
            >
              Get API Key
            </a>
            <button
              onClick={() => window.location.reload()}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
