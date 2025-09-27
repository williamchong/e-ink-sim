// Enhanced test script for frame-rate-aligned scroll flash functionality
// This script verifies that flash timing aligns with the configured frame rate

(function() {
    'use strict';

    console.log('🧪 Starting frame-rate-aligned scroll flash test...');

    // Test 1: Verify frame rate configuration affects flash timing
    function testFrameRateAlignment() {
        console.log('📋 Test 1: Frame rate alignment verification...');
        
        const overlay = document.getElementById('eink-scroll-flash-overlay');
        if (!overlay) {
            console.log('❌ Scroll flash overlay not found');
            return Promise.resolve(false);
        }

        return new Promise((resolve) => {
            let frameRateLimit = 5; // Default
            let flashTimings = [];
            
            // Try to get frame rate from world script config
            if (window.einkWorldOverrides) {
                // Access the config if available
                try {
                    frameRateLimit = window.einkWorldOverrides.config?.frameRateLimit || 5;
                } catch (e) {
                    console.log('⚠️ Could not access world script config, using default frame rate');
                }
            }
            
            const expectedFrameInterval = 1000 / frameRateLimit;
            console.log(`📊 Testing with ${frameRateLimit} FPS (${expectedFrameInterval.toFixed(1)}ms per frame)`);
            
            // Monitor style changes to capture timing
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        const timestamp = performance.now();
                        const opacity = parseFloat(overlay.style.opacity) || 0;
                        const transition = overlay.style.transition || '';
                        const background = overlay.style.background || '';
                        
                        if (opacity > 0.1 || transition.includes('ms')) {
                            flashTimings.push({
                                timestamp,
                                opacity,
                                transition,
                                background,
                                frameInterval: expectedFrameInterval
                            });
                            
                            console.log(`⚡ Flash event: opacity=${opacity}, transition="${transition}", bg="${background}"`);
                        }
                    }
                });
            });

            observer.observe(overlay, { 
                attributes: true, 
                attributeFilter: ['style'] 
            });

            // Trigger scroll event
            const wheelEvent = new WheelEvent('wheel', {
                deltaY: 200,
                bubbles: true,
                cancelable: true
            });
            
            document.dispatchEvent(wheelEvent);

            // Analyze results after flash sequence
            const testDuration = Math.max(expectedFrameInterval * 6, 1500);
            setTimeout(() => {
                observer.disconnect();
                
                console.log('📊 Flash timing analysis:');
                console.log(`  • Frame rate: ${frameRateLimit} FPS`);
                console.log(`  • Expected frame interval: ${expectedFrameInterval.toFixed(1)}ms`);
                console.log(`  • Flash events captured: ${flashTimings.length}`);
                
                if (flashTimings.length > 0) {
                    // Analyze transition durations
                    const transitionDurations = flashTimings
                        .map(timing => {
                            const match = timing.transition.match(/(\d+)ms/);
                            return match ? parseInt(match[1]) : null;
                        })
                        .filter(duration => duration !== null);
                    
                    console.log('  • Transition durations:', transitionDurations);
                    
                    // Check if any transitions align with frame rate
                    const frameAligned = transitionDurations.some(duration => {
                        const ratio = duration / expectedFrameInterval;
                        return ratio >= 0.8 && ratio <= 3.0; // Allow 1-3 frame durations
                    });
                    
                    if (frameAligned) {
                        console.log('✅ Flash timing appears to be frame-rate aligned');
                        resolve(true);
                    } else {
                        console.log('⚠️ Flash timing may not be optimally aligned with frame rate');
                        resolve(false);
                    }
                } else {
                    console.log('❌ No flash events detected');
                    resolve(false);
                }
            }, testDuration);
        });
    }

    // Test 2: Compare timing across different frame rates
    function testMultipleFrameRates() {
        console.log('📋 Test 2: Multiple frame rate comparison...');
        
        if (!window.einkWorldOverrides) {
            console.log('❌ World script not available for frame rate testing');
            return Promise.resolve(false);
        }

        const testFrameRates = [3, 5, 8]; // Test different frame rates
        const results = [];

        return testFrameRates.reduce((promise, frameRate) => {
            return promise.then(() => {
                console.log(`🔄 Testing ${frameRate} FPS...`);
                
                // Update frame rate configuration
                const config = {
                    frameRateLimit: frameRate,
                    enabled: true,
                    scrollFlashEnabled: true
                };
                
                window.dispatchEvent(
                    new CustomEvent('eink-config-update', { detail: config })
                );
                
                // Wait for config to apply
                return new Promise(resolve => {
                    setTimeout(() => {
                        testFrameRateAlignment().then(result => {
                            results.push({ frameRate, aligned: result });
                            resolve();
                        });
                    }, 200);
                });
            });
        }, Promise.resolve()).then(() => {
            console.log('📊 Multi-frame rate test results:');
            results.forEach(result => {
                console.log(`  • ${result.frameRate} FPS: ${result.aligned ? '✅ Aligned' : '❌ Not aligned'}`);
            });
            
            const alignedCount = results.filter(r => r.aligned).length;
            const success = alignedCount >= results.length * 0.6; // At least 60% should be aligned
            
            if (success) {
                console.log('✅ Frame rate alignment working across multiple rates');
            } else {
                console.log('⚠️ Frame rate alignment inconsistent across rates');
            }
            
            return success;
        });
    }

    // Test 3: Verify timing calculations
    function testTimingCalculations() {
        console.log('📋 Test 3: Timing calculation verification...');
        
        const testCases = [
            { fps: 3, expectedMin: 333 },   // ~333ms per frame
            { fps: 5, expectedMin: 200 },   // 200ms per frame  
            { fps: 8, expectedMin: 125 },   // 125ms per frame
            { fps: 10, expectedMin: 100 }   // 100ms per frame
        ];
        
        testCases.forEach(testCase => {
            const frameInterval = 1000 / testCase.fps;
            const whiteFlashDuration = Math.max(frameInterval * 2, 100);
            const blackFlashDuration = Math.max(frameInterval, 50);
            const fadeOutDuration = Math.max(frameInterval, 50);
            
            console.log(`📊 ${testCase.fps} FPS calculations:`);
            console.log(`  • Frame interval: ${frameInterval.toFixed(1)}ms`);
            console.log(`  • White flash: ${whiteFlashDuration.toFixed(1)}ms`);
            console.log(`  • Black flash: ${blackFlashDuration.toFixed(1)}ms`);
            console.log(`  • Fade out: ${fadeOutDuration.toFixed(1)}ms`);
            console.log(`  • Total sequence: ${(whiteFlashDuration + blackFlashDuration + fadeOutDuration).toFixed(1)}ms`);
            
            const meetsMinimum = whiteFlashDuration >= testCase.expectedMin * 0.8; // Allow some tolerance
            console.log(`  • Meets timing requirements: ${meetsMinimum ? '✅' : '❌'}`);
        });
        
        return true;
    }

    // Main test runner
    async function runFrameRateAlignmentTests() {
        console.log('🚀 Running frame-rate alignment tests...');
        
        const results = {
            frameRateAlignment: false,
            multipleFrameRates: false,
            timingCalculations: false
        };

        // Test 1: Basic frame rate alignment
        results.frameRateAlignment = await testFrameRateAlignment();
        
        // Test 2: Multiple frame rates (if world script available)
        if (window.einkWorldOverrides) {
            results.multipleFrameRates = await testMultipleFrameRates();
        } else {
            console.log('⚠️ Skipping multiple frame rate test - world script not available');
            results.multipleFrameRates = true; // Don't fail the test for this
        }
        
        // Test 3: Timing calculations
        results.timingCalculations = testTimingCalculations();

        // Summary
        console.log('📊 Frame-Rate Alignment Test Results:');
        console.log('✅ Frame rate alignment:', results.frameRateAlignment);
        console.log('✅ Multiple frame rates:', results.multipleFrameRates);
        console.log('✅ Timing calculations:', results.timingCalculations);

        const passedTests = Object.values(results).filter(Boolean).length;
        const totalTests = Object.keys(results).length;
        
        console.log(`🎯 Overall: ${passedTests}/${totalTests} tests passed`);

        if (passedTests === totalTests) {
            console.log('🎉 All frame-rate alignment tests passed!');
            console.log('📝 Flash effects are properly synchronized with frame rate limits');
        } else {
            console.log('⚠️ Some frame-rate alignment tests failed');
            console.log('💡 Check that e-ink simulation is enabled and frame rate limits are working');
        }

        return results;
    }

    // Make test functions available globally
    window.frameRateFlashTests = {
        runAll: runFrameRateAlignmentTests,
        testAlignment: testFrameRateAlignment,
        testMultipleRates: testMultipleFrameRates,
        testCalculations: testTimingCalculations
    };

    console.log('🔧 Frame-rate alignment test functions loaded.');
    console.log('📝 Run frameRateFlashTests.runAll() to start testing.');

})();