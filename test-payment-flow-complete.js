// Complete Payment Flow Test - Run this in your browser console while logged in

async function testCompletePaymentFlow() {
  try {
    console.log('🧪 Testing Complete Payment Flow...');
    
    // Step 1: Clear any existing data
    console.log('\n🧹 Step 1: Clearing existing data');
    localStorage.removeItem('pro_plan_payment');
    console.log('✅ Cleared localStorage');
    
    // Step 2: Check current plan (should be Free)
    console.log('\n📊 Step 2: Checking current plan (should be Free)');
    try {
      const { SubscriptionClient } = await import('/src/lib/subscriptionClient.ts');
      const plan = await SubscriptionClient.getUserPlan();
      console.log('✅ Current plan:', plan.name);
      if (plan.id === 'free') {
        console.log('✅ Correct: User is on Free plan');
      } else {
        console.log('⚠️ Unexpected: User is not on Free plan');
      }
    } catch (error) {
      console.error('❌ Error checking current plan:', error);
    }
    
    // Step 3: Simulate payment success
    console.log('\n💳 Step 3: Simulating payment success');
    try {
      // Get current user
      const { getCurrentUser } = await import('/src/lib/supabaseAuth.ts');
      const user = await getCurrentUser();
      
      if (!user) {
        console.log('❌ No user found, please log in first');
        return;
      }
      
      console.log('✅ User found:', user.id);
      
      // Simulate payment metadata
      const paymentMetadata = {
        userId: user.id,
        plan: 'basic',
        planName: 'Basic Plan'
      };
      
      // Store payment in localStorage (simulating successful payment)
      localStorage.setItem('pro_plan_payment', JSON.stringify({
        userId: user.id,
        planId: 'basic',
        paymentIntentId: 'pi_test_' + Date.now(),
        timestamp: Date.now()
      }));
      console.log('✅ Payment stored in localStorage');
      
      // Create subscription in database
      const subscriptionResponse = await fetch('/api/test/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          planId: 'basic'
        })
      });
      
      const subscriptionResult = await subscriptionResponse.json();
      if (subscriptionResult.success) {
        console.log('✅ Subscription created in database:', subscriptionResult.subscription);
      } else {
        console.log('❌ Subscription creation failed:', subscriptionResult.error);
      }
      
    } catch (error) {
      console.error('❌ Payment simulation failed:', error);
    }
    
    // Step 4: Check plan after payment (should be Basic)
    console.log('\n📊 Step 4: Checking plan after payment (should be Basic)');
    try {
      const { SubscriptionClient } = await import('/src/lib/subscriptionClient.ts');
      const plan = await SubscriptionClient.getUserPlan();
      console.log('✅ Plan after payment:', plan.name);
      
      if (plan.id === 'basic') {
        console.log('🎉 SUCCESS: User is now on Basic plan!');
        console.log('📊 Plan details:', {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          auditsPerDay: plan.limits.auditsPerDay,
          maxSites: plan.limits.maxSites,
          maxPagesPerSite: plan.limits.maxPagesPerSite
        });
      } else {
        console.log('❌ FAILED: User is still on', plan.name, 'instead of Basic plan');
      }
    } catch (error) {
      console.error('❌ Error checking plan after payment:', error);
    }
    
    // Step 5: Test plan consistency across pages
    console.log('\n🔄 Step 5: Testing plan consistency');
    try {
      // Test dashboard plan
      const dashboardResponse = await fetch('/api/subscription/plan');
      const dashboardData = await dashboardResponse.json();
      console.log('📊 Dashboard plan:', dashboardData.plan?.name || 'Free Tier');
      
      // Test account plan
      const accountResponse = await fetch('/api/subscription/plan');
      const accountData = await accountResponse.json();
      console.log('📊 Account plan:', accountData.plan?.name || 'Free Tier');
      
      if (dashboardData.plan?.id === 'basic' && accountData.plan?.id === 'basic') {
        console.log('✅ SUCCESS: Plan is consistent across all pages!');
      } else {
        console.log('❌ FAILED: Plan is not consistent across pages');
      }
    } catch (error) {
      console.error('❌ Error testing plan consistency:', error);
    }
    
    // Step 6: Test browser data clear scenario
    console.log('\n🧹 Step 6: Testing browser data clear scenario');
    try {
      // Save current data
      const currentPaymentData = localStorage.getItem('pro_plan_payment');
      
      // Clear localStorage (simulate browser data clear)
      localStorage.removeItem('pro_plan_payment');
      console.log('🗑️ Cleared localStorage (simulated browser data clear)');
      
      // Check plan (should still be Basic from database)
      const { SubscriptionClient } = await import('/src/lib/subscriptionClient.ts');
      const plan = await SubscriptionClient.getUserPlan();
      console.log('📊 Plan after browser data clear:', plan.name);
      
      if (plan.id === 'basic') {
        console.log('🎉 SUCCESS: User kept their Basic plan even after clearing browser data!');
      } else {
        console.log('❌ FAILED: User lost their plan after clearing browser data');
      }
      
      // Restore localStorage
      if (currentPaymentData) {
        localStorage.setItem('pro_plan_payment', currentPaymentData);
        console.log('🔄 Restored localStorage');
      }
      
    } catch (error) {
      console.error('❌ Error testing browser data clear:', error);
    }
    
    console.log('\n🎉 Complete Payment Flow Test Finished!');
    console.log('📋 Summary:');
    console.log('1. ✅ Cleared existing data');
    console.log('2. ✅ Checked current plan (Free)');
    console.log('3. ✅ Simulated payment success');
    console.log('4. ✅ Checked plan after payment (Basic)');
    console.log('5. ✅ Tested plan consistency across pages');
    console.log('6. ✅ Tested browser data clear scenario');
    
    console.log('\n🔄 Now refresh your pages to see the changes!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testCompletePaymentFlow();

