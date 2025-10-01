// Find Auth Token - Run this in your browser console

function findAuthToken() {
  console.log('🔍 Searching for auth token in localStorage...');
  
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
        } else if (parsed.user) {
          console.log('✅ Found user in this key:', parsed.user.email);
        } else if (parsed.access_token) {
          console.log('✅ Found access token in this key');
        }
      }
    } catch (error) {
      console.log(`\n📋 Key: ${key} (not JSON)`);
    }
  });
  
  // Also check for any keys that might contain user data
  keys.forEach(key => {
    try {
      const value = localStorage.getItem(key);
      if (value && value.includes('user') && value.includes('email')) {
        const parsed = JSON.parse(value);
        console.log(`\n📋 Potential user key: ${key}`);
        console.log('Value:', parsed);
      }
    } catch (error) {
      // Ignore non-JSON values
    }
  });
}

findAuthToken();


