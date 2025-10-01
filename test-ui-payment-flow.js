// Test UI Payment Flow - Run this in your browser console

async function testUIPaymentFlow() {
  try {
    console.log('🧪 Testing UI Payment Flow...');
    
    // Get current user
    const authToken = localStorage.getItem('sb-rarheulwybeiltuvubid-auth-token');
    if (!authToken) {
      console.log('❌ Please log in first');
      return;
    }
    
    const authData = JSON.parse(authToken);
    const user = authData.currentSession?.user;
    
    if (!user) {
      console.log('❌ No user found in auth token');
      return;
    }
    
    console.log('✅ User found:', user.id, user.email);
    
    // Simulate Pro plan purchase from UI
    console.log('📤 Simulating Pro plan purchase from UI...');
    
    // This is what the PaymentForm should send
    const paymentData = {
      userId: user.id,
      planId: 'pro',
      planName: 'Pro Plan',
      amount: 49.99
    };
    
    console.log('PaymentForm should send:', paymentData);
    
    // Test the payment API
    const response = await fetch('/api/payment/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData)
    });
    
    const result = await response.json();
    console.log('Payment API response:', result);
    
    if (result.success) {
      console.log('✅ Payment API worked!');
      console.log('📊 Subscription:', result.subscription);
      
      // Check if plan is now Pro in database
      console.log('🔄 Checking plan in database...');
      const planResponse = await fetch('/api/subscription/plan');
      const planData = await planResponse.json();
      console.log('📊 Current plan from API:', planData.plan);
      
      if (planData.plan?.id === 'pro') {
        console.log('🎉 SUCCESS: Pro plan is active!');
        console.log('🔄 Refresh your page to see the changes!');
      } else {
        console.log('❌ FAILED: Plan is still not Pro:', planData.plan?.id);
      }
    } else {
      console.log('❌ Payment API failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testUIPaymentFlow();


