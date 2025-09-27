// Test script to verify grayscale conversion functionality
// Run this in the browser console after loading the extension

function testGrayscaleConversion() {
  console.log('=== E-ink Extension Grayscale Test ===');

  // Check if extension is loaded
  if (typeof window.einkSimulator === 'undefined') {
    console.error('❌ Extension not detected - einkSimulator not found');
    return false;
  }

  console.log('✅ Extension detected');

  // Test CSS injection
  const cssTest = window.einkSimulator.testCSSInjection();
  console.log(`CSS Injection: ${cssTest ? '✅ Active' : '❌ Inactive'}`);

  // Test grayscale conversion
  const grayscaleTest = window.einkSimulator.testGrayscaleConversion();
  console.log('Grayscale Test Results:', grayscaleTest);

  // Check computed styles
  const htmlElement = document.documentElement;
  const computedStyle = window.getComputedStyle(htmlElement);
  const filterValue = computedStyle.filter;

  console.log(`Applied Filter: ${filterValue}`);

  // Test different device profiles
  console.log('\n=== Testing Device Profiles ===');
  const deviceProfiles = ['kindle', 'kobo', 'remarkable'];

  deviceProfiles.forEach(profile => {
    console.log(`Testing ${profile} profile...`);
    // This would require access to the extension's settings
    // For now, just log the expected behavior
  });

  // Overall assessment
  const isWorking = cssTest && grayscaleTest.filterApplied;
  console.log(`\n=== Overall Result ===`);
  console.log(`Grayscale Conversion: ${isWorking ? '✅ WORKING' : '❌ NOT WORKING'}`);

  return isWorking;
}

// Auto-run test after a delay
setTimeout(() => {
  testGrayscaleConversion();
}, 2000);

// Make function available globally
window.testGrayscaleConversion = testGrayscaleConversion;

console.log('Grayscale test script loaded. Run testGrayscaleConversion() to test manually.');