
// Debug utilities for testing button interactions
export const debugButtonInteractions = () => {
  console.log('🔍 Starting button interaction debug...');
  
  // Test all buttons on the page
  const buttons = document.querySelectorAll('button');
  console.log(`Found ${buttons.length} buttons`);
  
  buttons.forEach((button, index) => {
    const rect = button.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    const isClickable = window.getComputedStyle(button).pointerEvents !== 'none';
    
    console.log(`Button ${index}:`, {
      text: button.textContent?.trim(),
      visible: isVisible,
      clickable: isClickable,
      disabled: button.disabled,
      zIndex: window.getComputedStyle(button).zIndex,
      position: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
    });
  });
  
  // Test for overlapping elements
  const testElement = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
  console.log('Element at center of screen:', testElement);
  
  return { buttonCount: buttons.length, centerElement: testElement };
};

// Add to window for browser console access
if (typeof window !== 'undefined') {
  (window as any).debugButtons = debugButtonInteractions;
}
