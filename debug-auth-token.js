// Debug Auth Token - Run this in your browser console

function debugAuthToken() {
  console.log('🔍 Debugging Auth Token...');
  
  // Get all localStorage keys
  const keys = Object.keys(localStorage);
  console.log('All localStorage keys:', keys);
  
  // Look for Supabase auth tokens
  const supabaseKeys = keys.filter(key => key.includes('supabase') || key.includes('auth'));
  console.log('Supabase/Auth keys:', supabaseKeys);
  
  // Check each potential auth key
  supabaseKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value) {
        const parsed = JSON.parse(value);
        console.log(`\n📋 Key: ${key}`);
        console.log('Value:', parsed);
        
        // Check if it has user data
        if (parsed.currentSession?.user) {
          console.log('✅ Found user in this key:', parsed.currentSession.user.email);
          console.log('User ID:', parsed.currentSession.user.id);
        } else if (parsed.user) {
          console.log('✅ Found user in this key:', parsed.user.email);
          console.log('User ID:', parsed.user.id);
        } else if (parsed.access_token) {
          console.log('✅ Found access token in this key');
        }
      }
    } catch (error) {
      console.log(`\n📋 Key: ${key} (not JSON)`);
    }
  });
  
  // Test the current SubscriptionClient logic
  console.log('\n🧪 Testing SubscriptionClient logic...');
  try {
    const authToken = localStorage.getItem('sb-rarheulwybeiltuvubid-auth-token');
    if (authToken) {
      const authData = JSON.parse(authToken);
      const userId = authData.currentSession?.user?.id;
      console.log('✅ User ID extracted:', userId);
    } else {
      console.log('❌ No auth token found with key: sb-rarheulwybeiltuvubid-auth-token');
    }
  } catch (error) {
    console.log('❌ Error parsing auth token:', error);
  }
}

debugAuthToken();

