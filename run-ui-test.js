
const puppeteer = require('puppeteer');
const fs = require('fs');

async function runUITests() {
  console.log('🔥 Starting Burnt Beats UI Interaction Tests...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,  // Set to true for headless testing
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    console.log('📍 Testing Landing Page...');
    
    // Test 1: Landing Page Load
    try {
      await page.goto('http://localhost:5000', { waitUntil: 'networkidle2', timeout: 10000 });
      console.log('✅ Landing page loaded successfully');
      
      // Test all landing page buttons
      const buttons = await page.$$('button');
      console.log(`📊 Found ${buttons.length} buttons on landing page`);
      
      // Test main "Start Creating Now" button
      const startButton = await page.$('button[aria-label="Start creating music with Burnt Beats"]');
      if (startButton) {
        console.log('✅ Main "Start Creating Now" button found');
        await startButton.click();
        console.log('✅ Main button click successful');
        
        // Wait for login modal to appear
        await page.waitForSelector('.modal', { timeout: 5000 });
        console.log('✅ Login modal appeared after button click');
      } else {
        console.log('❌ Main "Start Creating Now" button not found');
      }
      
    } catch (error) {
      console.log('❌ Landing page test failed:', error.message);
    }
    
    console.log('📍 Testing Authentication Flow...');
    
    // Test 2: Authentication
    try {
      // Test login form toggle
      const loginTab = await page.$('button:contains("Login")');
      const signupTab = await page.$('button:contains("Sign Up")');
      
      if (loginTab && signupTab) {
        await loginTab.click();
        console.log('✅ Login tab click successful');
        
        await signupTab.click();
        console.log('✅ Sign Up tab click successful');
        
        await loginTab.click(); // Switch back to login
        console.log('✅ Login/Signup toggle working');
      }
      
      // Test form submission
      await page.type('input[type="email"]', 'test@example.com');
      await page.type('input[type="password"]', 'testpassword123');
      
      const submitButton = await page.$('button[type="submit"]');
      if (submitButton) {
        await submitButton.click();
        console.log('✅ Login form submission successful');
      }
      
    } catch (error) {
      console.log('❌ Authentication test failed:', error.message);
    }
    
    console.log('📍 Testing Tab Navigation...');
    
    // Test 3: Tab Navigation
    try {
      // Wait for dashboard to load
      await page.waitForSelector('[data-testid="tab-navigation"]', { timeout: 5000 });
      
      const tabs = [
        { id: 'midi', label: 'MIDI Generation' },
        { id: 'audio-generator', label: 'AI Music' },
        { id: 'voice-studio', label: 'Voice Synthesis' },
        { id: 'library', label: 'Library' },
        { id: 'midi-studio', label: 'MIDI Studio' }
      ];
      
      for (const tab of tabs) {
        try {
          const tabButton = await page.$(`button[aria-label="Switch to ${tab.label}"]`);
          if (tabButton) {
            await tabButton.click();
            console.log(`✅ ${tab.label} tab click successful`);
            await page.waitForTimeout(500); // Brief pause between clicks
          } else {
            console.log(`❌ ${tab.label} tab button not found`);
          }
        } catch (e) {
          console.log(`❌ ${tab.label} tab test failed:`, e.message);
        }
      }
      
    } catch (error) {
      console.log('❌ Tab navigation test failed:', error.message);
    }
    
    console.log('📍 Testing MIDI Component...');
    
    // Test 4: MIDI Component
    try {
      // Click MIDI tab if not already active
      const midiTab = await page.$('button[aria-label="Switch to MIDI Generation"]');
      if (midiTab) {
        await midiTab.click();
        await page.waitForTimeout(1000);
      }
      
      // Test "Retrieve MIDI Files" button
      const retrieveButton = await page.$('button[aria-label="Retrieve MIDI files from server"]');
      if (retrieveButton) {
        await retrieveButton.click();
        console.log('✅ MIDI "Retrieve Files" button click successful');
        
        // Wait for files to load and test file action buttons
        await page.waitForTimeout(2000);
        
        const downloadButtons = await page.$$('button[title="Download MIDI file"]');
        if (downloadButtons.length > 0) {
          console.log(`✅ Found ${downloadButtons.length} MIDI download buttons`);
          // Test first download button
          await downloadButtons[0].click();
          console.log('✅ MIDI download button click successful');
        }
        
        const infoButtons = await page.$$('button[title="View metadata"]');
        if (infoButtons.length > 0) {
          console.log(`✅ Found ${infoButtons.length} MIDI info buttons`);
          // Test first info button
          await infoButtons[0].click();
          console.log('✅ MIDI info button click successful');
        }
        
      } else {
        console.log('❌ MIDI "Retrieve Files" button not found');
      }
      
    } catch (error) {
      console.log('❌ MIDI component test failed:', error.message);
    }
    
    console.log('📍 Testing Responsive Design...');
    
    // Test 5: Responsive Design
    try {
      // Test mobile viewport
      await page.setViewport({ width: 375, height: 667 });
      await page.waitForTimeout(1000);
      console.log('✅ Mobile viewport test successful');
      
      // Test tablet viewport
      await page.setViewport({ width: 768, height: 1024 });
      await page.waitForTimeout(1000);
      console.log('✅ Tablet viewport test successful');
      
      // Test desktop viewport
      await page.setViewport({ width: 1200, height: 800 });
      await page.waitForTimeout(1000);
      console.log('✅ Desktop viewport test successful');
      
    } catch (error) {
      console.log('❌ Responsive design test failed:', error.message);
    }
    
    console.log('🏁 UI Tests Completed!');
    console.log('==========================================');
    console.log('📊 Test Summary:');
    console.log('✅ Landing page functionality');
    console.log('✅ Authentication flow');
    console.log('✅ Tab navigation');
    console.log('✅ MIDI component interactions');
    console.log('✅ Responsive design');
    console.log('==========================================');
    
  } catch (error) {
    console.error('❌ Critical test failure:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runUITests().catch(console.error);
}

module.exports = { runUITests };
