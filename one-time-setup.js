// ONE-TIME SETUP - Run this ONCE to create database tables
// After this, the payment flow will work automatically for all users

async function oneTimeSetup() {
  try {
    console.log('🔧 ONE-TIME DATABASE SETUP...');
    console.log('This will create the required database tables.');
    console.log('After this, the payment flow will work automatically for all users.');
    
    // Create database tables
    const response = await fetch('/api/setup/ensure-tables', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const result = await response.json();
    console.log('Setup result:', result);
    
    if (result.success) {
      console.log('✅ Database tables created successfully!');
      console.log('🎉 Payment flow will now work automatically for all users!');
      console.log('📋 What was created:');
      console.log('- user_subscriptions table');
      console.log('- user_usage table');
      console.log('- RLS policies');
      console.log('- Indexes');
    } else {
      console.log('❌ Setup failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
oneTimeSetup();

