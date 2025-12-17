// Debug utility for Supabase connection issues
export const debugSupabaseConnection = () => {
  console.log('🔍 Debugging Supabase Connection...');
  
  // Check environment variables
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  console.log('Environment Variables:');
  console.log('- VITE_SUPABASE_URL:', supabaseUrl ? '✅ Present' : '❌ Missing');
  console.log('- VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Present' : '❌ Missing');
  
  if (supabaseUrl) {
    console.log('- URL Value:', supabaseUrl);
  }
  
  if (supabaseKey) {
    console.log('- Key Value (first 20 chars):', supabaseKey.substring(0, 20) + '...');
  }
  
  // Check all environment variables available
  console.log('All available import.meta.env variables:');
  console.log(import.meta.env);
  
  // Test basic connection
  if (supabaseUrl && supabaseKey) {
    console.log('🧪 Testing Supabase connection...');
    
    // Import here to avoid circular dependency
    import('./supabase.js').then(({ supabase }) => {
      // Test a simple query
      supabase
        .from('products')
        .select('count', { count: 'exact', head: true })
        .then(({ data, error, count }) => {
          if (error) {
            console.error('❌ Supabase connection failed:', error);
          } else {
            console.log('✅ Supabase connection successful!');
            console.log('Products count:', count);
          }
        })
        .catch((err) => {
          console.error('❌ Supabase test query failed:', err);
        });
    });
  } else {
    console.error('❌ Cannot test connection - missing environment variables');
  }
};

// Auto-run debug in development
if (import.meta.env.DEV) {
  debugSupabaseConnection();
}