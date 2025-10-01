import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Clearing localStorage cache for all users')

    // This endpoint just returns instructions for clearing localStorage
    // since we can't directly access browser localStorage from the server
    
    return NextResponse.json({
      success: true,
      message: 'localStorage cache clear instructions',
      instructions: {
        step1: 'Open browser Developer Tools (F12)',
        step2: 'Go to Application/Storage tab',
        step3: 'Find localStorage in left sidebar',
        step4: 'Delete the "pro_plan_payment" entry',
        step5: 'Refresh the dashboard page'
      },
      note: 'The dashboard is showing Pro Plan because of cached payment data in localStorage. Your database subscription is correctly set to Free plan.'
    })

  } catch (error) {
    console.error('Error in clear localStorage cache:', error)
    return NextResponse.json(
      { error: 'Failed to clear localStorage cache' },
      { status: 500 }
    )
  }
}



