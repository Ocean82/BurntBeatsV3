
const fetch = require('node-fetch');

async function testStripeIntegration() {
  console.log('🔍 Testing Stripe Integration...');
  
  try {
    // Test Stripe configuration endpoint
    const stripeConfigResponse = await fetch('http://0.0.0.0:5000/api/stripe/config');
    const stripeConfig = await stripeConfigResponse.json();
    
    console.log('✅ Stripe Config Response:', stripeConfig);
    
    if (stripeConfig.publishableKey && stripeConfig.publishableKey.startsWith('pk_')) {
      console.log('✅ Stripe publishable key is properly configured');
    } else {
      console.log('❌ Stripe publishable key is missing or invalid');
    }
    
    // Test payment intent creation
    const paymentTestResponse = await fetch('http://0.0.0.0:5000/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 299,
        currency: 'usd',
        userId: 'test-user',
        planType: 'test'
      })
    });
    
    const paymentTestResult = await paymentTestResponse.json();
    console.log('✅ Payment Intent Test:', paymentTestResult);
    
    if (paymentTestResult.clientSecret) {
      console.log('✅ Stripe payment processing is working correctly');
      return true;
    } else {
      console.log('❌ Stripe payment processing failed:', paymentTestResult.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Stripe integration test failed:', error.message);
    return false;
  }
}

async function testGoogleCloudStorage() {
  console.log('🔍 Testing Google Cloud Storage...');
  
  try {
    // Test Google Cloud configuration
    const gcsConfigResponse = await fetch('http://0.0.0.0:5000/api/test/google-cloud-config');
    
    if (gcsConfigResponse.ok) {
      const gcsConfig = await gcsConfigResponse.json();
      console.log('✅ Google Cloud Config:', gcsConfig);
      
      if (gcsConfig.configured) {
        console.log('✅ Google Cloud Storage is properly configured');
        
        // Test file upload
        const uploadTestResponse = await fetch('http://0.0.0.0:5000/api/test/google-cloud-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: 'integration-test.txt',
            content: 'test-content-' + Date.now()
          })
        });
        
        const uploadResult = await uploadTestResponse.json();
        console.log('📁 Upload Test Result:', uploadResult);
        
        if (uploadResult.success) {
          console.log('✅ Google Cloud Storage upload/download working correctly');
          return true;
        } else {
          console.log('❌ Google Cloud Storage upload failed:', uploadResult.error);
          return false;
        }
      } else {
        console.log('❌ Google Cloud Storage not configured:', gcsConfig.error);
        return false;
      }
    } else {
      console.log('❌ Google Cloud Storage configuration endpoint not available');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Google Cloud Storage test failed:', error.message);
    return false;
  }
}

async function testComprehensiveIntegrations() {
  console.log('🧪 Running Comprehensive Integration Tests...');
  console.log('='.repeat(50));
  
  const results = {
    stripe: false,
    googleCloud: false,
    overall: false
  };
  
  // Test Stripe
  results.stripe = await testStripeIntegration();
  console.log('\n' + '='.repeat(50));
  
  // Test Google Cloud Storage
  results.googleCloud = await testGoogleCloudStorage();
  console.log('\n' + '='.repeat(50));
  
  // Overall results
  results.overall = results.stripe && results.googleCloud;
  
  console.log('📊 INTEGRATION TEST SUMMARY:');
  console.log('='.repeat(50));
  console.log(`🔷 Stripe Payment Processing: ${results.stripe ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🔷 Google Cloud Storage: ${results.googleCloud ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🔷 Overall Integration Status: ${results.overall ? '✅ ALL SYSTEMS GO' : '⚠️ NEEDS ATTENTION'}`);
  console.log('='.repeat(50));
  
  if (!results.googleCloud) {
    console.log('\n🔧 GOOGLE CLOUD TROUBLESHOOTING:');
    console.log('1. Check if GOOGLE_CLOUD_PROJECT_ID is set in Secrets');
    console.log('2. Check if GOOGLE_CLOUD_PRIVATE_KEY is set in Secrets');
    console.log('3. Check if GOOGLE_CLOUD_CLIENT_EMAIL is set in Secrets');
    console.log('4. Check if GOOGLE_CLOUD_BUCKET is set in Secrets');
    console.log('5. Verify service account has Storage Admin permissions');
  }
  
  return results;
}

// Run tests
testComprehensiveIntegrations()
  .then(results => {
    process.exit(results.overall ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
