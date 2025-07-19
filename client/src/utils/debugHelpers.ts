// Debug utilities for testing button interactions
export const debugButtonInteractions = () => {
  console.log('🔧 Debug: Testing button interactions');

  // Find all buttons on the page
  const buttons = document.querySelectorAll('button');
  console.log(`📊 Found ${buttons.length} buttons on the page`);

  buttons.forEach((button, index) => {
    const computedStyle = getComputedStyle(button);
    console.log(`🔘 Button ${index + 1}:`, {
      text: button.textContent?.trim(),
      disabled: button.disabled,
      pointerEvents: computedStyle.pointerEvents,
      zIndex: computedStyle.zIndex,
      position: computedStyle.position,
      visibility: computedStyle.visibility,
      display: computedStyle.display,
      hasClickListener: button.onclick !== null
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