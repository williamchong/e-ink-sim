/**
 * Verification script for Task 1.4b: requestAnimationFrame override
 * Tests frame rate limiting functionality for e-ink simulation
 */

async function verifyTask1_4b() {
  console.log('🧪 Starting Task 1.4b verification: requestAnimationFrame override');
  
  const results = {
    extensionLoaded: false,
    apiOverrideActive: false,
    frameRateLimited: false,
    averageFrameTime: 0,
    expectedFrameTime: 0,
    frameRateLimit: 0,
    testPassed: false
  };

  try {
    // Check if extension is loaded
    if (typeof window.einkSimulator === 'undefined') {
      console.error('❌ E-ink extension not detected');
      return results;
    }
    
    results.extensionLoaded = true;
    console.log('✅ Extension loaded successfully');

    // Check if API overrides are active
    results.apiOverrideActive = window.einkSimulator.testAPIOverrides();
    console.log(`${results.apiOverrideActive ? '✅' : '❌'} API overrides active: ${results.apiOverrideActive}`);

    if (!results.apiOverrideActive) {
      console.log('ℹ️  Enable e-ink simulation to test requestAnimationFrame override');
      return results;
    }

    // Test requestAnimationFrame timing
    console.log('🔄 Testing requestAnimationFrame timing...');
    const frameTest = await window.einkSimulator.testRequestAnimationFrame();
    
    results.averageFrameTime = frameTest.averageFrameTime;
    results.expectedFrameTime = frameTest.expectedFrameTime;
    results.frameRateLimit = frameTest.frameRateLimit;
    results.frameRateLimited = frameTest.isOverridden;

    console.log(`📊 Frame rate limit: ${results.frameRateLimit} FPS`);
    console.log(`📊 Expected frame time: ${results.expectedFrameTime.toFixed(2)}ms`);
    console.log(`📊 Average frame time: ${results.averageFrameTime.toFixed(2)}ms`);
    console.log(`📊 Frame times: [${frameTest.testResults.map(t => t.toFixed(1)).join(', ')}]ms`);

    // Verify frame rate is properly limited
    if (results.frameRateLimited) {
      console.log('✅ requestAnimationFrame is properly throttled for e-ink simulation');
      results.testPassed = true;
    } else {
      console.log('❌ requestAnimationFrame is not properly throttled');
      console.log(`   Expected: ~${results.expectedFrameTime.toFixed(2)}ms between frames`);
      console.log(`   Actual: ~${results.averageFrameTime.toFixed(2)}ms between frames`);
    }

    // Additional visual test
    console.log('🎨 Testing visual animation slowdown...');
    testVisualAnimationSlowdown();

  } catch (error) {
    console.error('❌ Error during verification:', error);
    results.testPassed = false;
  }

  // Summary
  console.log('\n📋 Task 1.4b Verification Summary:');
  console.log(`   Extension loaded: ${results.extensionLoaded ? '✅' : '❌'}`);
  console.log(`   API overrides active: ${results.apiOverrideActive ? '✅' : '❌'}`);
  console.log(`   Frame rate limited: ${results.frameRateLimited ? '✅' : '❌'}`);
  console.log(`   Overall test: ${results.testPassed ? '✅ PASSED' : '❌ FAILED'}`);

  return results;
}

/**
 * Test visual animation slowdown by creating a test animation
 */
function testVisualAnimationSlowdown() {
  // Create a test element for animation
  const testElement = document.createElement('div');
  testElement.id = 'eink-animation-test';
  testElement.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    width: 50px;
    height: 50px;
    background: red;
    z-index: 999999;
    border-radius: 50%;
    transition: transform 0.1s ease;
  `;
  document.body.appendChild(testElement);

  let position = 0;
  let frameCount = 0;
  const startTime = performance.now();

  function animateTest() {
    position += 2;
    testElement.style.transform = `translateX(${Math.sin(position * 0.1) * 50}px)`;
    frameCount++;

    if (frameCount < 50) {
      requestAnimationFrame(animateTest);
    } else {
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const actualFPS = (frameCount / totalTime) * 1000;

      console.log(`🎯 Visual animation test completed:`);
      console.log(`   Frames rendered: ${frameCount}`);
      console.log(`   Total time: ${totalTime.toFixed(2)}ms`);
      console.log(`   Actual FPS: ${actualFPS.toFixed(2)}`);

      // Clean up test element
      setTimeout(() => {
        if (testElement.parentNode) {
          testElement.parentNode.removeChild(testElement);
        }
      }, 1000);

      if (actualFPS <= 10) {
        console.log('✅ Visual animation properly slowed down for e-ink');
      } else {
        console.log('⚠️  Visual animation may not be sufficiently slowed down');
      }
    }
  }

  requestAnimationFrame(animateTest);
}

/**
 * Quick test function for manual verification
 */
function quickAnimationTest() {
  console.log('🚀 Quick animation test starting...');
  
  const startTime = performance.now();
  let frameCount = 0;

  function testFrame() {
    frameCount++;
    if (frameCount < 10) {
      requestAnimationFrame(testFrame);
    } else {
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const fps = (frameCount / totalTime) * 1000;
      
      console.log(`⚡ Quick test results:`);
      console.log(`   ${frameCount} frames in ${totalTime.toFixed(2)}ms`);
      console.log(`   Effective FPS: ${fps.toFixed(2)}`);
      
      if (fps <= 10) {
        console.log('✅ Frame rate appears limited (good for e-ink)');
      } else {
        console.log('⚠️  Frame rate appears normal (e-ink mode may be disabled)');
      }
    }
  }

  requestAnimationFrame(testFrame);
}

// Make functions available globally for console testing
window.verifyTask1_4b = verifyTask1_4b;
window.quickAnimationTest = quickAnimationTest;

console.log('📝 Task 1.4b verification script loaded');
console.log('   Run: verifyTask1_4b() - Full verification test');
console.log('   Run: quickAnimationTest() - Quick frame rate test');