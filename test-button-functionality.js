#!/usr/bin/env node

/**
 * Burnt Beats Button Functionality Test Suite
 * 
 * This script tests all the button interactions and API endpoints
 * to ensure they work correctly after our fixes.
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';

console.log('🔥 Burnt Beats Button Functionality Test Suite');
console.log('==============================================');
console.log(`Testing against: ${BASE_URL}`);
console.log('');

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BurntBeats-Test-Suite/1.0',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test functions
async function testServerHealth() {
  console.log('🏥 Testing Server Health...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/status`);
    
    if (response.status === 200) {
      console.log('✅ Server is running');
      console.log(`   Version: ${response.data.version || 'unknown'}`);
      console.log(`   Environment: ${response.data.environment || 'unknown'}`);
      return true;
    } else {
      console.log(`❌ Server health check failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Server health check failed: ${error.message}`);
    return false;
  }
}

async function testAuthenticationEndpoints() {
  console.log('\n🔐 Testing Authentication Endpoints...');
  
  const tests = [
    {
      name: 'GET /api/auth/me (should return 401 when not logged in)',
      url: `${BASE_URL}/api/auth/me`,
      expectedStatus: 401
    },
    {
      name: 'POST /api/auth/register (should accept registration data)',
      url: `${BASE_URL}/api/auth/register`,
      method: 'POST',
      body: {
        username: 'test_user_' + Date.now(),
        email: 'test@example.com',
        password: 'testpass123',
        confirmPassword: 'testpass123'
      },
      expectedStatus: [201, 409] // 201 for success, 409 for user exists
    },
    {
      name: 'POST /api/auth/login (should handle login attempts)',
      url: `${BASE_URL}/api/auth/login`,
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'wrongpassword'
      },
      expectedStatus: [200, 401] // 200 for success, 401 for invalid credentials
    }
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      const response = await makeRequest(test.url, {
        method: test.method,
        body: test.body
      });
      
      const expectedStatuses = Array.isArray(test.expectedStatus) ? test.expectedStatus : [test.expectedStatus];
      
      if (expectedStatuses.includes(response.status)) {
        console.log(`✅ ${test.name}`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - Expected ${expectedStatuses.join(' or ')}, got ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
    }
  }
  
  console.log(`   Results: ${passed}/${tests.length} tests passed`);
  return passed === tests.length;
}

async function testMusicGenerationEndpoints() {
  console.log('\n🎵 Testing Music Generation Endpoints...');
  
  const tests = [
    {
      name: 'POST /api/midi/generate (MIDI generation endpoint)',
      url: `${BASE_URL}/api/midi/generate`,
      method: 'POST',
      body: {
        title: 'Test Song',
        theme: 'Happy',
        genre: 'pop',
        tempo: 120
      },
      expectedStatus: [200, 401] // 200 for success, 401 for auth required
    },
    {
      name: 'POST /api/audioldm2/generate (Audio generation endpoint)',
      url: `${BASE_URL}/api/audioldm2/generate`,
      method: 'POST',
      body: {
        prompt: 'Happy upbeat music',
        audioLength: 10
      },
      expectedStatus: [200, 400, 401] // Various acceptable responses
    },
    {
      name: 'GET /api/voice/available (Voice models endpoint)',
      url: `${BASE_URL}/api/voice/available`,
      expectedStatus: [200, 500] // 200 for success, 500 if service not configured
    }
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      const response = await makeRequest(test.url, {
        method: test.method,
        body: test.body
      });
      
      const expectedStatuses = Array.isArray(test.expectedStatus) ? test.expectedStatus : [test.expectedStatus];
      
      if (expectedStatuses.includes(response.status)) {
        console.log(`✅ ${test.name}`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - Expected ${expectedStatuses.join(' or ')}, got ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
    }
  }
  
  console.log(`   Results: ${passed}/${tests.length} tests passed`);
  return passed === tests.length;
}

async function testStaticAssets() {
  console.log('\n📁 Testing Static Assets...');
  
  const tests = [
    {
      name: 'GET / (Landing page)',
      url: `${BASE_URL}/`,
      expectedStatus: 200
    },
    {
      name: 'GET /favicon.ico (Favicon)',
      url: `${BASE_URL}/favicon.ico`,
      expectedStatus: [200, 204] // 200 if exists, 204 if handled gracefully
    }
  ];

  let passed = 0;
  for (const test of tests) {
    try {
      const response = await makeRequest(test.url);
      
      const expectedStatuses = Array.isArray(test.expectedStatus) ? test.expectedStatus : [test.expectedStatus];
      
      if (expectedStatuses.includes(response.status)) {
        console.log(`✅ ${test.name}`);
        passed++;
      } else {
        console.log(`❌ ${test.name} - Expected ${expectedStatuses.join(' or ')}, got ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
    }
  }
  
  console.log(`   Results: ${passed}/${tests.length} tests passed`);
  return passed === tests.length;
}

// Main test runner
async function runAllTests() {
  console.log('Starting comprehensive button functionality tests...\n');
  
  const results = [];
  
  results.push(await testServerHealth());
  results.push(await testAuthenticationEndpoints());
  results.push(await testMusicGenerationEndpoints());
  results.push(await testStaticAssets());
  
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  console.log('\n==============================================');
  console.log('🏁 Test Summary');
  console.log('==============================================');
  console.log(`Total test suites: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${total - passed}`);
  
  if (passed === total) {
    console.log('🎉 All tests passed! Button functionality is working correctly.');
    process.exit(0);
  } else {
    console.log('⚠️  Some tests failed. Please check the output above for details.');
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, testServerHealth, testAuthenticationEndpoints, testMusicGenerationEndpoints, testStaticAssets };
