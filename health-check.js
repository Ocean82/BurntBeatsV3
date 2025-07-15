
#!/usr/bin/env node

/**
 * Health check utility for Burnt Beats
 * Tests server availability and basic functionality
 */

const http = require('http');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

function checkHealth() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200 && response.status === 'ok') {
            resolve(response);
          } else {
            reject(new Error(`Health check failed: ${res.statusCode} - ${data}`));
          }
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Health check timeout'));
    });

    req.end();
  });
}

async function main() {
  console.log('🏥 Burnt Beats - Health Check');
  console.log('============================');
  console.log(`Checking server at ${HOST}:${PORT}/api/health`);
  
  try {
    const result = await checkHealth();
    console.log('✅ Health check PASSED');
    console.log('📊 Server response:', result);
    process.exit(0);
  } catch (error) {
    console.log('❌ Health check FAILED');
    console.log('💥 Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkHealth };
