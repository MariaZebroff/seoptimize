// Quick script to fix your Basic plan subscription
// Run this in your browser console while logged in

async function fixBasicPlan() {
  try {
    console.log('Fixing Basic plan subscription...');
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No user found. Please log in first.');
      return;
    }
    
    console.log('User ID:', user.id);
    
    // Create Basic plan subscription
    const response = await fetch('/api/test/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: user.id,
        planId: 'basic'
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Basic plan subscription created successfully!');
      console.log('Subscription:', result.subscription);
      
      // Clear any cached payment data
      localStorage.removeItem('pro_plan_payment');
      
      // Reload the page to see changes
      console.log('Reloading page to see changes...');
      window.location.reload();
    } else {
      console.error('❌ Failed to create subscription:', result.error);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the fix
fixBasicPlan();


