// Test and Fix Database - Run this in your browser console while logged in

async function testAndFixDatabase() {
  try {
    console.log('🔧 Testing and Fixing Database...');
    
    // Step 1: Check if tables exist
    console.log('\n📋 Step 1: Checking if tables exist');
    try {
      const response = await fetch('/api/debug/check-tables');
      const data = await response.json();
      console.log('✅ Table check result:', data);
      
      if (!data.tables.user_subscriptions?.exists) {
        console.log('❌ user_subscriptions table does not exist!');
        console.log('💡 You need to run the SQL script in Supabase SQL Editor');
        console.log('📄 Open: fix-database-tables.sql and run it in Supabase');
        return;
      }
      
      if (!data.tables.user_subscriptions?.accessible) {
        console.log('❌ user_subscriptions table is not accessible!');
        console.log('💡 Check RLS policies and permissions');
        return;
      }
      
      console.log('✅ Tables exist and are accessible');
    } catch (error) {
      console.error('❌ Table check failed:', error);
      return;
    }
    
    // Step 2: Check current subscription
    console.log('\n📊 Step 2: Checking current subscription');
    try {
      const response = await fetch('/api/debug/user-subscription-db');
      const data = await response.json();
      console.log('✅ Subscription check result:', data);
      
      if (data.allSubscriptions && data.allSubscriptions.length > 0) {
        console.log('✅ Found subscriptions in database:', data.allSubscriptions.length);
        data.allSubscriptions.forEach((sub, index) => {
          console.log(`  ${index + 1}. Plan: ${sub.plan_id}, Status: ${sub.status}, Created: ${sub.created_at}`);
        });
      } else {
        console.log('❌ No subscriptions found in database');
        console.log('💡 Creating Basic plan subscription...');
        
        // Step 3: Create Basic plan subscription
        console.log('\n🔧 Step 3: Creating Basic plan subscription');
        try {
          const createResponse = await fetch('/api/test/create-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              planId: 'basic'
            })
          });
          
          const createResult = await createResponse.json();
          console.log('✅ Create subscription result:', createResult);
          
          if (createResult.success) {
            console.log('🎉 Basic plan subscription created successfully!');
          } else {
            console.log('❌ Failed to create subscription:', createResult.error);
          }
        } catch (error) {
          console.error('❌ Create subscription failed:', error);
        }
      }
    } catch (error) {
      console.error('❌ Subscription check failed:', error);
    }
    
    // Step 4: Test plan loading
    console.log('\n🔄 Step 4: Testing plan loading');
    try {
      const response = await fetch('/api/subscription/plan');
      const data = await response.json();
      console.log('✅ Plan loading result:', data);
      
      if (data.plan) {
        console.log('📊 Current plan:', data.plan.name);
        if (data.plan.id === 'basic') {
          console.log('🎉 SUCCESS: Basic plan is now active!');
        } else {
          console.log('⚠️ Plan is not Basic:', data.plan.id);
        }
      } else {
        console.log('❌ No plan returned');
      }
    } catch (error) {
      console.error('❌ Plan loading failed:', error);
    }
    
    console.log('\n🎉 Database test and fix completed!');
    console.log('📋 Summary:');
    console.log('1. Checked if tables exist');
    console.log('2. Checked current subscription');
    console.log('3. Created Basic plan subscription if needed');
    console.log('4. Tested plan loading');
    
  } catch (error) {
    console.error('❌ Test and fix failed:', error);
  }
}

// Run the test and fix
testAndFixDatabase();


