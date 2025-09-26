// Test Pro Plan Purchase - Run this in your browser console

async function testProPlanPurchase() {
  try {
    console.log('🧪 Testing Pro Plan Purchase...');
    
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
    
    // Test Pro plan purchase
    const subscriptionData = {
      userId: user.id,
      planId: 'pro',
      planName: 'Pro Plan',
      amount: 49.99
    };
    
    console.log('📤 Sending Pro plan purchase data:', subscriptionData);
    
    const response = await fetch('/api/payment/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData)
    });
    
    const result = await response.json();
    console.log('📥 Pro plan purchase result:', result);
    
    if (result.success) {
      console.log('✅ Pro plan subscription created/updated successfully!');
      console.log('📊 Subscription details:', result.subscription);
      
      // Test plan loading
      console.log('🔄 Testing plan loading...');
      const planResponse = await fetch('/api/subscription/plan');
      const planData = await planResponse.json();
      console.log('📊 Current plan:', planData.plan?.name);
      
      if (planData.plan?.id === 'pro') {
        console.log('🎉 SUCCESS: Pro plan is now active!');
      } else {
        console.log('❌ FAILED: Plan is not Pro:', planData.plan?.id);
      }
    } else {
      console.log('❌ Pro plan purchase failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testProPlanPurchase();

