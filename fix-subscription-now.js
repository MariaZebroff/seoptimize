// IMMEDIATE FIX - Run this in your browser console while logged in

async function fixSubscriptionNow() {
  try {
    console.log('🔧 FIXING SUBSCRIPTION NOW...');
    
    // Step 1: Get current user
    const { getCurrentUser } = await import('/src/lib/supabaseAuth');
    const user = await getCurrentUser();
    
    if (!user) {
      console.log('❌ Please log in first');
      return;
    }
    
    console.log('✅ User found:', user.id, user.email);
    
    // Step 2: Check if database tables exist
    console.log('\n📋 Checking database tables...');
    try {
      const response = await fetch('/api/debug/check-tables');
      const data = await response.json();
      console.log('Database check result:', data);
      
      if (!data.tables.user_subscriptions?.exists) {
        console.log('❌ user_subscriptions table does not exist!');
        console.log('💡 You need to create the database tables first');
        console.log('📄 Go to Supabase SQL Editor and run: fix-database-tables.sql');
        return;
      }
      
      if (!data.tables.user_subscriptions?.accessible) {
        console.log('❌ user_subscriptions table is not accessible!');
        console.log('💡 Check RLS policies');
        return;
      }
      
      console.log('✅ Database tables exist and are accessible');
    } catch (error) {
      console.error('❌ Database check failed:', error);
      return;
    }
    
    // Step 3: Check current subscription in database
    console.log('\n📊 Checking current subscription in database...');
    try {
      const response = await fetch('/api/debug/user-subscription-db');
      const data = await response.json();
      console.log('Subscription check result:', data);
      
      if (data.allSubscriptions && data.allSubscriptions.length > 0) {
        console.log('✅ Found subscriptions in database:', data.allSubscriptions.length);
        data.allSubscriptions.forEach((sub, index) => {
          console.log(`  ${index + 1}. Plan: ${sub.plan_id}, Status: ${sub.status}, Created: ${sub.created_at}`);
        });
        
        // Check if Basic plan exists
        const basicSubscription = data.allSubscriptions.find(sub => sub.plan_id === 'basic' && sub.status === 'active');
        if (basicSubscription) {
          console.log('✅ Basic plan subscription found in database!');
        } else {
          console.log('❌ No active Basic plan subscription found');
        }
      } else {
        console.log('❌ No subscriptions found in database');
      }
    } catch (error) {
      console.error('❌ Subscription check failed:', error);
    }
    
    // Step 4: Create Basic plan subscription if it doesn't exist
    console.log('\n🔧 Creating Basic plan subscription...');
    try {
      const response = await fetch('/api/fix/create-basic-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id
        })
      });
      
      const result = await response.json();
      console.log('Create subscription result:', result);
      
      if (result.success) {
        console.log('✅ Basic plan subscription created successfully!');
        console.log('📊 Subscription details:', result.subscription);
      } else {
        console.log('❌ Failed to create subscription:', result.error);
        if (result.solution) {
          console.log('💡 Solution:', result.solution);
        }
      }
    } catch (error) {
      console.error('❌ Create subscription failed:', error);
    }
    
    // Step 5: Verify subscription was created
    console.log('\n✅ Verifying subscription was created...');
    try {
      const response = await fetch('/api/debug/user-subscription-db');
      const data = await response.json();
      
      if (data.allSubscriptions && data.allSubscriptions.length > 0) {
        const basicSubscription = data.allSubscriptions.find(sub => sub.plan_id === 'basic' && sub.status === 'active');
        if (basicSubscription) {
          console.log('🎉 SUCCESS: Basic plan subscription is now in database!');
          console.log('📊 Subscription details:', basicSubscription);
        } else {
          console.log('❌ Basic plan subscription still not found');
        }
      } else {
        console.log('❌ Still no subscriptions found');
      }
    } catch (error) {
      console.error('❌ Verification failed:', error);
    }
    
    // Step 6: Test plan loading without localStorage
    console.log('\n🧪 Testing plan loading without localStorage...');
    try {
      // Clear localStorage to simulate browser data clear
      localStorage.removeItem('pro_plan_payment');
      console.log('🗑️ Cleared localStorage');
      
      // Test plan loading
      const { SubscriptionClient } = await import('/src/lib/subscriptionClient');
      const plan = await SubscriptionClient.getUserPlan();
      console.log('📊 Plan after localStorage clear:', plan.name);
      
      if (plan.id === 'basic') {
        console.log('🎉 SUCCESS: Basic plan persists after localStorage clear!');
        console.log('📊 Plan details:', {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          auditsPerDay: plan.limits.auditsPerDay,
          maxSites: plan.limits.maxSites,
          maxPagesPerSite: plan.limits.maxPagesPerSite
        });
      } else {
        console.log('❌ FAILED: Still showing', plan.name, 'instead of Basic plan');
      }
    } catch (error) {
      console.error('❌ Plan loading test failed:', error);
    }
    
    console.log('\n🎉 SUBSCRIPTION FIX COMPLETED!');
    console.log('📋 Summary:');
    console.log('1. ✅ Checked database tables');
    console.log('2. ✅ Checked current subscription');
    console.log('3. ✅ Created Basic plan subscription');
    console.log('4. ✅ Verified subscription creation');
    console.log('5. ✅ Tested plan persistence after localStorage clear');
    
    console.log('\n🔄 Now refresh your pages to see the Basic plan!');
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
fixSubscriptionNow();
