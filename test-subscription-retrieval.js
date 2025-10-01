// Test Subscription Retrieval - Run this in your browser console

async function testSubscriptionRetrieval() {
  try {
    console.log('🧪 Testing Subscription Retrieval...');
    
    // Step 1: Get user ID from localStorage
    let userId = null
    try {
      const authToken = localStorage.getItem('sb-rarheulwybeiltuvubid-auth-token')
      if (authToken) {
        const authData = JSON.parse(authToken)
        userId = authData.currentSession?.user?.id
        console.log('✅ User ID found:', userId)
      } else {
        console.log('❌ No auth token found in localStorage')
        return
      }
    } catch (error) {
      console.log('❌ Error parsing auth token:', error)
      return
    }
    
    // Step 2: Test direct database query
    console.log('\n📊 Testing direct database query...');
    try {
      const response = await fetch('/api/debug/user-subscription-db')
      const data = await response.json()
      console.log('Database query result:', data)
      
      if (data.allSubscriptions && data.allSubscriptions.length > 0) {
        console.log('✅ Found subscriptions in database:', data.allSubscriptions.length)
        data.allSubscriptions.forEach((sub, index) => {
          console.log(`  ${index + 1}. Plan: ${sub.plan_id}, Status: ${sub.status}, Created: ${sub.created_at}`)
        })
        
        const basicSubscription = data.allSubscriptions.find(sub => sub.plan_id === 'basic' && sub.status === 'active')
        if (basicSubscription) {
          console.log('✅ Basic plan subscription found in database!')
        } else {
          console.log('❌ No active Basic plan subscription found')
        }
      } else {
        console.log('❌ No subscriptions found in database')
      }
    } catch (error) {
      console.error('❌ Database query failed:', error)
    }
    
    // Step 3: Test subscription plan API with user ID
    console.log('\n🔄 Testing subscription plan API...');
    try {
      const response = await fetch('/api/subscription/plan', {
        headers: {
          'x-user-id': userId
        }
      })
      const data = await response.json()
      console.log('Subscription plan API result:', data)
      
      if (data.plan) {
        console.log('✅ Plan retrieved:', data.plan.name)
        if (data.plan.id === 'basic') {
          console.log('🎉 SUCCESS: Basic plan is active!')
        } else {
          console.log('⚠️ Plan is not Basic:', data.plan.id)
        }
      } else {
        console.log('❌ No plan returned')
      }
    } catch (error) {
      console.error('❌ Subscription plan API failed:', error)
    }
    
    // Step 4: Test SubscriptionClient
    console.log('\n📱 Testing SubscriptionClient...');
    try {
      const { SubscriptionClient } = await import('/src/lib/subscriptionClient')
      const plan = await SubscriptionClient.getUserPlan()
      console.log('SubscriptionClient result:', plan.name)
      
      if (plan.id === 'basic') {
        console.log('🎉 SUCCESS: SubscriptionClient returns Basic plan!')
      } else {
        console.log('⚠️ SubscriptionClient returns:', plan.name)
      }
    } catch (error) {
      console.error('❌ SubscriptionClient failed:', error)
    }
    
    console.log('\n🎉 Subscription Retrieval Test Completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSubscriptionRetrieval();


