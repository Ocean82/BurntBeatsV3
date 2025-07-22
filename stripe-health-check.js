
const fetch = require('node-fetch');

async function quickStripeHealthCheck() {
  const BASE_URL = 'http://0.0.0.0:5000';
  
  console.log('🏥 Quick Stripe Health Check...');
  
  try {
    // Test basic API status
    const statusResponse = await fetch(`${BASE_URL}/api/status`);
    if (!statusResponse.ok) {
      console.log('❌ Server not responding');
      return false;
    }
    
    // Test Stripe config endpoint
    const configResponse = await fetch(`${BASE_URL}/api/stripe/config`);
    const configData = await configResponse.json();
    
    if (configResponse.ok && configData.publishableKey) {
      console.log('✅ Stripe configuration endpoint working');
      console.log(`✅ Publishable key present: ${configData.publishableKey.substring(0, 12)}...`);
    } else {
      console.log('❌ Stripe configuration failed:', configData);
      return false;
    }
    
    // Test quick payment intent
    const paymentResponse = await fetch(`${BASE_URL}/api/stripe/create-payment-intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 499,
        currency: 'usd',
        userId: 'health-check',
        planType: 'pro'
      })
    });
    
    const paymentData = await paymentResponse.json();
    
    if (paymentResponse.ok && paymentData.clientSecret) {
      console.log('✅ Payment intent creation working');
      console.log('✅ Stripe payment system is fully functional');
      return true;
    } else {
      console.log('❌ Payment intent creation failed:', paymentData);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Stripe health check failed:', error.message);
    return false;
  }
}

quickStripeHealthCheck();
