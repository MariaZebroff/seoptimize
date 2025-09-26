// Debug Subscription Creation - Run this in your browser console

async function debugSubscriptionCreation() {
  try {
    console.log('🔍 Debugging Subscription Creation...');
    
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
    
    // Test subscription creation with Pro plan
    const subscriptionData = {
      userId: user.id,
      planId: 'pro',
      planName: 'Pro Plan',
      amount: 49.99
    };
    
    console.log('📤 Testing subscription creation with data:', subscriptionData);
    
    const response = await fetch('/api/payment/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData)
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await response.json();
    console.log('📥 Response body:', result);
    
    if (result.success) {
      console.log('✅ Subscription creation successful!');
      console.log('📊 Subscription:', result.subscription);
    } else {
      console.log('❌ Subscription creation failed:');
      console.log('Error:', result.error);
      console.log('Details:', result.details);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

// Run the debug
debugSubscriptionCreation();

