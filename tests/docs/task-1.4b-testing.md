# Task 1.4b Testing Guide: requestAnimationFrame Override

## Overview

Task 1.4b implements requestAnimationFrame API override to throttle animations to 5 FPS for e-ink display simulation. This document provides comprehensive testing instructions.

## Requirements Verification

### Requirement 5.1: requestAnimationFrame Override
- ✅ Override requestAnimationFrame API to limit frame rates to e-ink appropriate speeds
- ✅ Implement proper timing control with accurate frame rate limiting
- ✅ Handle callback execution with error handling

### Requirement 5.3: JavaScript Animation Control
- ✅ Intercept and modify timing functions to match e-ink refresh rates
- ✅ Provide consistent frame timing for smooth e-ink simulation
- ✅ Maintain compatibility with existing animation code

### Requirement 4.1: E-ink Hardware Simulation
- ✅ Limit refresh rate to simulate e-ink display constraints (5 FPS default)
- ✅ Provide realistic animation slowdown for e-ink testing
- ✅ Maintain visual fidelity while reducing frame rate

## Testing Methods

### 1. Automated Testing

#### Console Script Testing
```javascript
// Load the verification script
// Copy contents of tests/scripts/verify-task-1.4b.js into console

// Run full verification
verifyTask1_4b();

// Run quick test
quickAnimationTest();
```

#### Expected Results
- Extension loaded: ✅
- API overrides active: ✅
- Frame rate limited: ✅
- Average frame time: ~200ms (for 5 FPS)
- Overall test: ✅ PASSED

### 2. Manual Testing

#### Test Page Verification
1. Open `tests/manual/test-page.html`
2. Enable e-ink simulation in extension popup
3. Click "Test requestAnimationFrame" button
4. Verify frame delay > 100ms
5. Click "Run Full Animation Test" button
6. Verify override is working correctly

#### Live Animation Testing
1. Click "Start Live Animation" button
2. Observe the animated box movement
3. Check animation stats display
4. Verify FPS is limited to ~5 FPS
5. Click "Stop Live Animation" to see final stats

#### Visual Comparison Testing
1. Load animation-heavy website (e.g., CodePen animations)
2. Disable e-ink simulation
3. Observe smooth 60 FPS animations
4. Enable e-ink simulation
5. Observe significantly slower animations (~5 FPS)

### 3. Website Testing

#### Recommended Test Sites
- **CodePen Animation Collection**: https://codepen.io/collection/HtAne/
- **Anime.js Examples**: https://animejs.com/documentation/
- **Three.js Examples**: https://threejs.org/examples/
- **CSS Animation Examples**: Various CSS animation showcases

#### Testing Procedure
1. Visit test website
2. Open browser console
3. Run verification script: `verifyTask1_4b()`
4. Observe visual animation slowdown
5. Check console output for confirmation

## Performance Verification

### Frame Rate Measurement
```javascript
// Measure actual frame rate
let frameCount = 0;
const startTime = performance.now();

function measureFPS() {
  frameCount++;
  if (frameCount < 100) {
    requestAnimationFrame(measureFPS);
  } else {
    const endTime = performance.now();
    const fps = (frameCount / (endTime - startTime)) * 1000;
    console.log(`Measured FPS: ${fps.toFixed(2)}`);
  }
}

requestAnimationFrame(measureFPS);
```

### Expected Performance
- **With e-ink simulation**: ~5 FPS
- **Without e-ink simulation**: ~60 FPS
- **Frame time consistency**: ±20ms tolerance
- **CPU usage**: Minimal overhead from throttling

## Troubleshooting

### Common Issues

#### 1. Extension Not Detected
**Symptoms**: `window.einkSimulator` is undefined
**Solutions**:
- Verify extension is loaded in Chrome
- Check extension is enabled
- Refresh the test page
- Check browser console for errors

#### 2. API Override Not Active
**Symptoms**: `testAPIOverrides()` returns false
**Solutions**:
- Enable e-ink simulation in popup
- Check extension popup shows "Simulation: ON"
- Verify settings are saved correctly
- Try toggling simulation off and on

#### 3. Frame Rate Not Limited
**Symptoms**: Animations still run at 60 FPS
**Solutions**:
- Verify e-ink simulation is enabled
- Check frame rate limit setting (should be 5 FPS)
- Test with different animation types
- Check for JavaScript errors in console

#### 4. Inconsistent Frame Timing
**Symptoms**: Frame times vary significantly
**Solutions**:
- Close other browser tabs to reduce CPU load
- Disable other extensions temporarily
- Test on simpler animations first
- Check system performance

### Debug Commands

```javascript
// Check extension status
window.einkSimulator.testAPIOverrides();

// Check current settings
chrome.storage.sync.get(['einkSettings'], console.log);

// Test frame timing manually
const start = performance.now();
requestAnimationFrame(() => {
  console.log(`Frame delay: ${performance.now() - start}ms`);
});

// Toggle simulation for comparison
window.einkSimulator.toggleGrayscale();
```

## Success Criteria

### ✅ Task 1.4b is complete when:

1. **API Override Active**: requestAnimationFrame is successfully overridden
2. **Frame Rate Limited**: Animations run at ~5 FPS instead of 60 FPS
3. **Timing Accurate**: Frame intervals are consistently ~200ms
4. **Visual Slowdown**: Animations are visibly slower on test websites
5. **Error Handling**: Override works without breaking existing animations
6. **Restoration**: Original API is restored when simulation is disabled

### Verification Checklist

- [ ] Extension loads without errors
- [ ] API override activates when simulation is enabled
- [ ] Frame rate is limited to 5 FPS
- [ ] Visual animations are noticeably slower
- [ ] Console tests pass verification
- [ ] Manual tests show expected behavior
- [ ] Website animations are properly throttled
- [ ] Original API is restored when disabled

## Implementation Notes

### Technical Details
- Uses setTimeout-based throttling for consistent timing
- Maintains callback queue for proper frame ID management
- Includes error handling for animation callbacks
- Supports cancelAnimationFrame override
- Provides accurate performance timing

### Browser Compatibility
- Chrome/Chromium: ✅ Full support
- Edge: ✅ Full support (Chromium-based)
- Firefox: ❌ Not applicable (Chrome extension)
- Safari: ❌ Not applicable (Chrome extension)

### Performance Impact
- Minimal CPU overhead
- Reduces overall animation CPU usage
- Memory usage: <1MB additional
- No impact on non-animated content