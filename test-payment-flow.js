// Test script to verify payment flow works correctly
// Run this in your browser console while logged in

async function testPaymentFlow() {
  try {
    console.log('🧪 Testing Payment Flow...');
    
    // 1. Check current localStorage payment data
    const paymentData = localStorage.getItem('pro_plan_payment');
    if (paymentData) {
      const payment = JSON.parse(paymentData);
      console.log('✅ Found payment data:', payment);
      
      // 2. Check if payment is recent (within 24 hours)
      const isRecent = (Date.now() - payment.timestamp) < 24 * 60 * 60 * 1000;
      console.log('⏰ Payment is recent:', isRecent);
      
      // 3. Check if payment is for Basic plan
      const isBasicPlan = payment.planId === 'basic';
      console.log('📋 Is Basic plan:', isBasicPlan);
      
      if (isRecent && isBasicPlan) {
        console.log('✅ Payment flow test PASSED - Basic plan payment found and recent');
        
        // 4. Test plan loading on different pages
        console.log('🔄 Testing plan loading...');
        
        // Test dashboard plan loading
        try {
          const dashboardResponse = await fetch('/api/subscription/plan');
          const dashboardData = await dashboardResponse.json();
          console.log('📊 Dashboard plan:', dashboardData.plan?.name || 'Free Tier');
        } catch (error) {
          console.error('❌ Dashboard plan test failed:', error);
        }
        
        // Test account plan loading
        try {
          const accountResponse = await fetch('/api/subscription/plan');
          const accountData = await accountResponse.json();
          console.log('👤 Account plan:', accountData.plan?.name || 'Free Tier');
        } catch (error) {
          console.error('❌ Account plan test failed:', error);
        }
        
        console.log('🎉 All tests completed! Your Basic plan should now be active.');
        console.log('🔄 Refresh the page to see the changes.');
        
      } else {
        console.log('❌ Payment flow test FAILED - Payment not recent or not Basic plan');
      }
    } else {
      console.log('❌ No payment data found in localStorage');
      console.log('💡 Make sure you have completed a payment recently');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPaymentFlow();


