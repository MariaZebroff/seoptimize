// Test script to verify the fallback mechanism works correctly
// Run this in your browser console while logged in

async function testFallbackMechanism() {
  try {
    console.log('🧪 Testing Fallback Mechanism...');
    
    // Test 1: Check current localStorage payment data
    console.log('\n📋 Test 1: Checking localStorage payment data');
    const paymentData = localStorage.getItem('pro_plan_payment');
    if (paymentData) {
      const payment = JSON.parse(paymentData);
      console.log('✅ Found payment data:', payment);
      
      const isRecent = (Date.now() - payment.timestamp) < 24 * 60 * 60 * 1000;
      console.log('⏰ Payment is recent:', isRecent);
      console.log('📋 Plan ID:', payment.planId);
    } else {
      console.log('❌ No payment data in localStorage');
    }
    
    // Test 2: Test SubscriptionClient.getUserPlan() method
    console.log('\n🔄 Test 2: Testing SubscriptionClient.getUserPlan()');
    try {
      // Import the SubscriptionClient
      const { SubscriptionClient } = await import('/src/lib/subscriptionClient.ts');
      const plan = await SubscriptionClient.getUserPlan();
      console.log('✅ SubscriptionClient returned plan:', plan.name);
      console.log('📊 Plan details:', {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        auditsPerDay: plan.limits.auditsPerDay,
        auditsPer3Days: plan.limits.auditsPer3Days,
        maxSites: plan.limits.maxSites,
        maxPagesPerSite: plan.limits.maxPagesPerSite
      });
    } catch (error) {
      console.error('❌ SubscriptionClient test failed:', error);
    }
    
    // Test 3: Test direct API call
    console.log('\n🌐 Test 3: Testing direct API call');
    try {
      const response = await fetch('/api/subscription/plan');
      const data = await response.json();
      console.log('✅ API response:', data);
      if (data.plan) {
        console.log('📊 API plan:', data.plan.name);
      } else {
        console.log('❌ No plan in API response');
      }
    } catch (error) {
      console.error('❌ API test failed:', error);
    }
    
    // Test 4: Test different scenarios
    console.log('\n🎭 Test 4: Testing different scenarios');
    
    // Scenario A: Clear localStorage and test
    console.log('\n📝 Scenario A: Clear localStorage and test');
    const originalPaymentData = localStorage.getItem('pro_plan_payment');
    localStorage.removeItem('pro_plan_payment');
    
    try {
      const { SubscriptionClient } = await import('/src/lib/subscriptionClient.ts');
      const plan = await SubscriptionClient.getUserPlan();
      console.log('✅ After clearing localStorage, plan:', plan.name);
    } catch (error) {
      console.error('❌ Scenario A failed:', error);
    }
    
    // Restore original data
    if (originalPaymentData) {
      localStorage.setItem('pro_plan_payment', originalPaymentData);
      console.log('🔄 Restored original payment data');
    }
    
    // Scenario B: Test with expired payment
    console.log('\n📝 Scenario B: Test with expired payment');
    if (originalPaymentData) {
      const payment = JSON.parse(originalPaymentData);
      const expiredPayment = {
        ...payment,
        timestamp: Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
      };
      localStorage.setItem('pro_plan_payment', JSON.stringify(expiredPayment));
      
      try {
        const { SubscriptionClient } = await import('/src/lib/subscriptionClient.ts');
        const plan = await SubscriptionClient.getUserPlan();
        console.log('✅ With expired payment, plan:', plan.name);
      } catch (error) {
        console.error('❌ Scenario B failed:', error);
      }
      
      // Restore original data
      localStorage.setItem('pro_plan_payment', originalPaymentData);
    }
    
    console.log('\n🎉 Fallback mechanism test completed!');
    console.log('📋 Summary:');
    console.log('1. localStorage is checked first for recent payments');
    console.log('2. If no recent payment, database is checked via API');
    console.log('3. If API fails, free plan is used as fallback');
    console.log('4. All pages now use the same SubscriptionClient method');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFallbackMechanism();

