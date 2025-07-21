
const fetch = require('node-fetch');

const BASE_URL = 'http://0.0.0.0:5000';

async function testStripeConfiguration() {
  console.log('🔍 Testing Stripe Configuration...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/stripe/config`);
    const config = await response.json();
    
    if (response.ok) {
      console.log('✅ Stripe Config Response:', config);
      
      if (config.publishableKey && config.publishableKey.startsWith('pk_')) {
        console.log('✅ Stripe publishable key is properly configured');
        return true;
      } else {
        console.log('❌ Stripe publishable key is missing or invalid');
        return false;
      }
    } else {
      console.log('❌ Stripe config endpoint failed:', config);
      return false;
    }
  } catch (error) {
    console.error('❌ Stripe configuration test failed:', error.message);
    return false;
  }
}

async function testPaymentIntentCreation() {
  console.log('\n💳 Testing Payment Intent Creation...');
  
  const testPaymentData = {
    amount: 499, // $4.99 in cents
    currency: 'usd',
    userId: 'test-user-' + Date.now(),
    planType: 'pro'
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/stripe/create-payment-intent`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testPaymentData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Payment Intent Created Successfully:', {
        clientSecret: result.clientSecret ? 'Present' : 'Missing',
        amount: result.amount,
        currency: result.currency,
        status: result.status
      });
      
      if (result.clientSecret && result.clientSecret.startsWith('pi_')) {
        console.log('✅ Payment Intent client secret is valid');
        return true;
      } else {
        console.log('❌ Payment Intent client secret is invalid or missing');
        return false;
      }
    } else {
      console.log('❌ Payment Intent creation failed:', result);
      return false;
    }
  } catch (error) {
    console.error('❌ Payment Intent creation test failed:', error.message);
    return false;
  }
}

async function testPricingPlans() {
  console.log('\n📋 Testing Pricing Plans Endpoint...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/stripe/plans`);
    const plans = await response.json();
    
    if (response.ok) {
      console.log('✅ Pricing Plans Retrieved:', plans);
      
      if (plans.plans && Array.isArray(plans.plans) && plans.plans.length > 0) {
        console.log('✅ Pricing plans are properly configured');
        
        // Validate each plan structure
        let allPlansValid = true;
        plans.plans.forEach((plan, index) => {
          if (!plan.id || !plan.name || !plan.price || !plan.features) {
            console.log(`❌ Plan ${index} is missing required fields:`, plan);
            allPlansValid = false;
          }
        });
        
        return allPlansValid;
      } else {
        console.log('❌ No pricing plans found or invalid structure');
        return false;
      }
    } else {
      console.log('❌ Pricing plans endpoint failed:', plans);
      return false;
    }
  } catch (error) {
    console.error('❌ Pricing plans test failed:', error.message);
    return false;
  }
}

async function testMultiplePlanTypes() {
  console.log('\n🎯 Testing Multiple Plan Payment Intents...');
  
  const planTests = [
    { planType: 'basic', amount: 299, expectedName: 'Basic Plan' },
    { planType: 'pro', amount: 499, expectedName: 'Pro Plan' },
    { planType: 'premium', amount: 999, expectedName: 'Premium Plan' }
  ];
  
  let allPassed = true;
  
  for (const planTest of planTests) {
    try {
      const response = await fetch(`${BASE_URL}/api/stripe/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: planTest.amount,
          currency: 'usd',
          userId: `test-${planTest.planType}-${Date.now()}`,
          planType: planTest.planType
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.clientSecret) {
        console.log(`✅ ${planTest.planType} plan payment intent created successfully`);
      } else {
        console.log(`❌ ${planTest.planType} plan payment intent failed:`, result);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ ${planTest.planType} plan test failed:`, error.message);
      allPassed = false;
    }
  }
  
  return allPassed;
}

async function testStripeWebhookEndpoint() {
  console.log('\n🔗 Testing Stripe Webhook Endpoint...');
  
  try {
    // Just test if the endpoint exists and responds (we can't test actual webhook functionality without Stripe sending real events)
    const response = await fetch(`${BASE_URL}/webhook/stripe`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'stripe-signature': 'test-signature'
      },
      body: JSON.stringify({ test: 'webhook' })
    });
    
    // We expect this to fail signature verification, but endpoint should exist
    if (response.status === 400) {
      console.log('✅ Webhook endpoint exists and is handling requests (signature verification expected to fail in test)');
      return true;
    } else {
      console.log('❌ Webhook endpoint not responding as expected, status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Webhook endpoint test failed:', error.message);
    return false;
  }
}

async function runComprehensiveStripeTests() {
  console.log('🧪 Running Comprehensive Stripe Payment Tests...');
  console.log('='.repeat(60));
  
  const results = {
    configuration: false,
    paymentIntent: false,
    pricingPlans: false,
    multiplePlans: false,
    webhookEndpoint: false,
    overall: false
  };
  
  // Test Stripe Configuration
  results.configuration = await testStripeConfiguration();
  console.log('='.repeat(60));
  
  // Test Payment Intent Creation
  results.paymentIntent = await testPaymentIntentCreation();
  console.log('='.repeat(60));
  
  // Test Pricing Plans
  results.pricingPlans = await testPricingPlans();
  console.log('='.repeat(60));
  
  // Test Multiple Plan Types
  results.multiplePlans = await testMultiplePlanTypes();
  console.log('='.repeat(60));
  
  // Test Webhook Endpoint
  results.webhookEndpoint = await testStripeWebhookEndpoint();
  console.log('='.repeat(60));
  
  // Overall Results
  results.overall = Object.values(results).slice(0, -1).every(result => result === true);
  
  console.log('📊 STRIPE PAYMENT TEST SUMMARY:');
  console.log('='.repeat(60));
  console.log(`🔧 Configuration: ${results.configuration ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`💳 Payment Intent: ${results.paymentIntent ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`📋 Pricing Plans: ${results.pricingPlans ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🎯 Multiple Plans: ${results.multiplePlans ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🔗 Webhook Endpoint: ${results.webhookEndpoint ? '✅ WORKING' : '❌ FAILED'}`);
  console.log(`🏆 Overall Status: ${results.overall ? '✅ ALL SYSTEMS GO' : '⚠️ NEEDS ATTENTION'}`);
  console.log('='.repeat(60));
  
  if (!results.overall) {
    console.log('\n🔧 TROUBLESHOOTING RECOMMENDATIONS:');
    
    if (!results.configuration) {
      console.log('1. Check STRIPE_PUBLISHABLE_KEY in Secrets');
      console.log('2. Verify key format starts with pk_live_ or pk_test_');
    }
    
    if (!results.paymentIntent) {
      console.log('3. Check STRIPE_SECRET_KEY in Secrets');
      console.log('4. Verify secret key format starts with sk_live_ or sk_test_');
      console.log('5. Ensure API version compatibility');
    }
    
    if (!results.webhookEndpoint) {
      console.log('6. Check STRIPE_WEBHOOK_SECRET in Secrets');
      console.log('7. Verify webhook endpoint URL in Stripe dashboard');
    }
    
    console.log('8. Ensure server is running on port 5000');
    console.log('9. Check server logs for detailed error messages');
  }
  
  return results;
}

// Run the tests
if (require.main === module) {
  runComprehensiveStripeTests().catch(console.error);
}

module.exports = { runComprehensiveStripeTests };
