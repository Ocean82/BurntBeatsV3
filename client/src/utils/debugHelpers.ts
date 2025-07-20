// Debug utilities for testing button interactions
export const debugButtonInteractions = () => {
  console.log('🔧 Debug: Testing button interactions');

  // Check DOM readiness
  console.log('📊 DOM Status:', {
    readyState: document.readyState,
    bodyReady: !!document.body,
    headReady: !!document.head,
    favicon: document.querySelector('link[rel*="icon"]')?.getAttribute('href') || 'none'
  });

  // Find all buttons on the page
  const buttons = document.querySelectorAll('button');
  console.log(`📊 Found ${buttons.length} buttons on the page`);

  buttons.forEach((button, index) => {
    const computedStyle = getComputedStyle(button);
    const rect = button.getBoundingClientRect();
    
    console.log(`🔘 Button ${index + 1}:`, {
      text: button.textContent?.trim(),
      disabled: button.disabled,
      pointerEvents: computedStyle.pointerEvents,
      zIndex: computedStyle.zIndex,
      position: computedStyle.position,
      visibility: computedStyle.visibility,
      display: computedStyle.display,
      hasClickListener: button.onclick !== null,
      bounds: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      }
    });

    // Test if button can be clicked
    if (!button.disabled) {
      button.addEventListener('click', () => {
        console.log(`✅ Button ${index + 1} clicked successfully:`, button.textContent?.trim());
      }, { once: true });
    }
  });

  return buttons.length;
};

// Check breakpoints and responsive design
export const debugBreakpoints = () => {
  console.log('📱 Breakpoint Debug:', {
    width: window.innerWidth,
    height: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    breakpoint: window.innerWidth >= 1024 ? 'lg' : window.innerWidth >= 768 ? 'md' : 'sm'
  });
};

// Check event listeners
export const debugEventListeners = () => {
  console.log('👂 Event Listeners Debug:');
  
  // Check for React event listeners (these won't show in getEventListeners)
  const elements = document.querySelectorAll('[onclick], button, [role="button"]');
  console.log(`🎯 Found ${elements.length} potentially interactive elements`);
  
  elements.forEach((el, index) => {
    console.log(`Element ${index + 1}:`, {
      tagName: el.tagName,
      role: el.getAttribute('role'),
      hasOnClick: !!el.getAttribute('onclick'),
      className: el.className
    });
  });
};

export const testLandingPageButtons = () => {
  console.log('🎯 Testing Landing Page Buttons specifically');

  const mainCTA = document.querySelector('button:contains("Start Creating Now")');
  const pricingButtons = document.querySelectorAll('button:contains("Download Now")');
  const licenseButton = document.querySelector('button:contains("Get Full License")');

  console.log('Main CTA Button:', mainCTA);
  console.log('Pricing Buttons:', pricingButtons);
  console.log('License Button:', licenseButton);

  // Add test click handlers
  if (mainCTA && !mainCTA.disabled) {
    console.log('🔥 Main CTA button is ready for interaction');
  }

  return {
    mainCTA: !!mainCTA,
    pricingButtons: pricingButtons.length,
    licenseButton: !!licenseButton
  };
};

// Add to window for browser console access
if (typeof window !== 'undefined') {
  (window as any).debugButtons = debugButtonInteractions;
}