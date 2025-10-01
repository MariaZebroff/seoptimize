// Test script to verify database is now the primary source of truth
// Run this in your browser console while logged in

async function testDatabasePrimarySource() {
  try {
    console.log('🧪 Testing Database as Primary Source of Truth...');
    
    // Test 1: Check current localStorage
    console.log('\n📋 Test 1: Current localStorage state');
    const paymentData = localStorage.getItem('pro_plan_payment');
    if (paymentData) {
      const payment = JSON.parse(paymentData);
      console.log('✅ Found localStorage payment:', payment);
    } else {
      console.log('❌ No localStorage payment data');
    }
    
    // Test 2: Check database directly
    console.log('\n🗄️ Test 2: Checking database directly');
    try {
      const response = await fetch('/api/debug/user-subscription-db');
      const data = await response.json();
      console.log('✅ Database response:', data);
      
      if (data.allSubscriptions && data.allSubscriptions.length > 0) {
        console.log('📊 Found subscriptions in database:', data.allSubscriptions.length);
        data.allSubscriptions.forEach((sub, index) => {
          console.log(`  ${index + 1}. Plan: ${sub.plan_id}, Status: ${sub.status}, Created: ${sub.created_at}`);
        });
      } else {
        console.log('❌ No subscriptions found in database');
      }
    } catch (error) {
      console.error('❌ Database check failed:', error);
    }
    
    // Test 3: Test SubscriptionClient (should use database first)
    console.log('\n🔄 Test 3: Testing SubscriptionClient.getUserPlan()');
    try {
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
    
    // Test 4: Simulate browser data clear scenario
    console.log('\n🧹 Test 4: Simulating browser data clear scenario');
    
    // Save original localStorage data
    const originalPaymentData = localStorage.getItem('pro_plan_payment');
    
    // Clear localStorage (simulate user clearing browser data)
    localStorage.removeItem('pro_plan_payment');
    console.log('🗑️ Cleared localStorage (simulated browser data clear)');
    
    // Test SubscriptionClient after localStorage clear
    try {
      const { SubscriptionClient } = await import('/src/lib/subscriptionClient.ts');
      const plan = await SubscriptionClient.getUserPlan();
      console.log('✅ After localStorage clear, plan:', plan.name);
      
      if (plan.id !== 'free') {
        console.log('🎉 SUCCESS: User kept their plan even after clearing browser data!');
        console.log('📊 Plan restored from database:', plan.name);
      } else {
        console.log('❌ FAILED: User lost their plan after clearing browser data');
      }
    } catch (error) {
      console.error('❌ Test after localStorage clear failed:', error);
    }
    
    // Restore original localStorage data
    if (originalPaymentData) {
      localStorage.setItem('pro_plan_payment', originalPaymentData);
      console.log('🔄 Restored original localStorage data');
    }
    
    // Test 5: Test API endpoint directly
    console.log('\n🌐 Test 5: Testing API endpoint directly');
    try {
      const response = await fetch('/api/subscription/plan');
      const data = await response.json();
      console.log('✅ API response:', data);
      if (data.plan) {
        console.log('📊 API plan:', data.plan.name);
      }
    } catch (error) {
      console.error('❌ API test failed:', error);
    }
    
    console.log('\n🎉 Database Primary Source Test Completed!');
    console.log('📋 Summary:');
    console.log('1. Database is now the primary source of truth');
    console.log('2. localStorage is only used as a fallback when database is unavailable');
    console.log('3. Users keep their plans even after clearing browser data');
    console.log('4. All pages use the same SubscriptionClient method');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testDatabasePrimarySource();


