'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionId = searchParams.get('session_id')
    
    if (sessionId) {
      // Fetch payment details
      fetch(`/api/stripe/payment-status?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          setPaymentData(data.payment)
          setLoading(false)
        })
        .catch(error => {
          console.error('Error fetching payment status:', error)
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading payment details...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600">
            Thank you for your purchase. Your subscription has been activated.
          </p>
        </div>

        {paymentData && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-900 mb-2">Payment Details</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Amount:</span>
                <span>${(paymentData.amount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="capitalize">{paymentData.status}</span>
              </div>
              {paymentData.customerEmail && (
                <div className="flex justify-between">
                  <span>Email:</span>
                  <span>{paymentData.customerEmail}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors inline-block"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/audit"
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors inline-block"
          >
            Start New Audit
          </Link>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>
            A confirmation email has been sent to your email address.
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment details...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}

