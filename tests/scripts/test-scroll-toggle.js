// Test script to verify scroll behavior toggle between e-ink and normal modes
// This script tests that normal scrolling is properly restored when e-ink mode is disabled

(function() {
    'use strict';

    console.log('🧪 Starting scroll toggle test...');

    // Test 1: Verify normal scrolling works when e-ink mode is disabled
    function testNormalScrolling() {
        console.log('📋 Test 1: Normal scrolling behavior...');
        
        return new Promise((resolve) => {
            const initialScrollY = window.scrollY;
            let scrollEventFired = false;
            let scrollEventPrevented = false;

            // Listen for scroll events
            const scrollListener = () => {
                scrollEventFired = true;
            };

            const wheelListener = (e) => {
                if (e.defaultPrevented) {
                    scrollEventPrevented = true;
                }
            };

            window.addEventListener('scroll', scrollListener);
            document.addEventListener('wheel', wheelListener, { passive: false });

            // Trigger a wheel event
            const wheelEvent = new WheelEvent('wheel', {
                deltaY: 100,
                bubbles: true,
                cancelable: true
            });

            document.dispatchEvent(wheelEvent);

            // Check results after a short delay
            setTimeout(() => {
                window.removeEventListener('scroll', scrollListener);
                document.removeEventListener('wheel', wheelListener);

                const finalScrollY = window.scrollY;
                const scrolled = Math.abs(finalScrollY - initialScrollY) > 10;

                console.log('📊 Normal scroll test results:');
                console.log(`  • Initial scroll: ${initialScrollY}px`);
                console.log(`  • Final scroll: ${finalScrollY}px`);
                console.log(`  • Scroll event fired: ${scrollEventFired}`);
                console.log(`  • Wheel event prevented: ${scrollEventPrevented}`);
                console.log(`  • Page scrolled: ${scrolled}`);

                const normalScrollingWorks = scrolled && !scrollEventPrevented;
                
                if (normalScrollingWorks) {
                    console.log('✅ Normal scrolling is working correctly');
                } else {
                    console.log('❌ Normal scrolling may be blocked');
                }

                resolve(normalScrollingWorks);
            }, 300);
        });
    }

    // Test 2: Verify e-ink scrolling works when enabled
    function testEinkScrolling() {
        console.log('📋 Test 2: E-ink scrolling behavior...');
        
        // First enable e-ink mode
        if (window.einkWorldOverrides) {
            const config = {
                frameRateLimit: 5,
                enabled: true,
                scrollFlashEnabled: true
            };
            
            window.dispatchEvent(
                new CustomEvent('eink-config-update', { detail: config })
            );
        }

        return new Promise((resolve) => {
            // Wait for config to apply
            setTimeout(() => {
                const initialScrollY = window.scrollY;
                let scrollEventPrevented = false;
                let flashOverlayDetected = false;

                // Check for flash overlay
                const overlay = document.getElementById('eink-scroll-flash-overlay');
                if (overlay) {
                    flashOverlayDetected = true;
                }

                const wheelListener = (e) => {
                    if (e.defaultPrevented) {
                        scrollEventPrevented = true;
                    }
                };

                document.addEventListener('wheel', wheelListener, { passive: false });

                // Trigger a wheel event
                const wheelEvent = new WheelEvent('wheel', {
                    deltaY: 100,
                    bubbles: true,
                    cancelable: true
                });

                document.dispatchEvent(wheelEvent);

                // Check results after flash sequence should complete
                setTimeout(() => {
                    document.removeEventListener('wheel', wheelListener);

                    const finalScrollY = window.scrollY;
                    const scrollDistance = Math.abs(finalScrollY - initialScrollY);
                    const viewportHeight = window.innerHeight;
                    const expectedChunk = viewportHeight * 0.4;

                    console.log('📊 E-ink scroll test results:');
                    console.log(`  • Initial scroll: ${initialScrollY}px`);
                    console.log(`  • Final scroll: ${finalScrollY}px`);
                    console.log(`  • Scroll distance: ${scrollDistance}px`);
                    console.log(`  • Expected chunk: ${expectedChunk.toFixed(0)}px`);
                    console.log(`  • Wheel event prevented: ${scrollEventPrevented}`);
                    console.log(`  • Flash overlay detected: ${flashOverlayDetected}`);

                    const einkScrollingWorks = scrollEventPrevented && flashOverlayDetected && scrollDistance >= expectedChunk * 0.5;
                    
                    if (einkScrollingWorks) {
                        console.log('✅ E-ink scrolling is working correctly');
                    } else {
                        console.log('❌ E-ink scrolling may not be working properly');
                    }

                    resolve(einkScrollingWorks);
                }, 1000);
            }, 200);
        });
    }

    // Test 3: Toggle between modes and verify behavior switches
    function testScrollToggle() {
        console.log('📋 Test 3: Scroll mode toggle test...');
        
        if (!window.einkWorldOverrides) {
            console.log('❌ World script not available for toggle testing');
            return Promise.resolve(false);
        }

        return new Promise(async (resolve) => {
            const results = [];

            // Test 1: Start with e-ink mode enabled
            console.log('🔄 Enabling e-ink mode...');
            window.dispatchEvent(
                new CustomEvent('eink-config-update', { 
                    detail: { frameRateLimit: 5, enabled: true, scrollFlashEnabled: true }
                })
            );
            
            await new Promise(r => setTimeout(r, 300));
            const einkResult = await testEinkModeActive();
            results.push({ mode: 'e-ink', working: einkResult });

            // Test 2: Disable e-ink mode
            console.log('🔄 Disabling e-ink mode...');
            window.dispatchEvent(
                new CustomEvent('eink-config-update', { 
                    detail: { frameRateLimit: 5, enabled: false, scrollFlashEnabled: false }
                })
            );
            
            await new Promise(r => setTimeout(r, 300));
            const normalResult = await testNormalModeActive();
            results.push({ mode: 'normal', working: normalResult });

            // Test 3: Re-enable e-ink mode
            console.log('🔄 Re-enabling e-ink mode...');
            window.dispatchEvent(
                new CustomEvent('eink-config-update', { 
                    detail: { frameRateLimit: 5, enabled: true, scrollFlashEnabled: true }
                })
            );
            
            await new Promise(r => setTimeout(r, 300));
            const einkResult2 = await testEinkModeActive();
            results.push({ mode: 'e-ink-2', working: einkResult2 });

            console.log('📊 Toggle test results:');
            results.forEach(result => {
                console.log(`  • ${result.mode}: ${result.working ? '✅ Working' : '❌ Failed'}`);
            });

            const allWorking = results.every(r => r.working);
            
            if (allWorking) {
                console.log('✅ Scroll mode toggling works correctly');
            } else {
                console.log('❌ Scroll mode toggling has issues');
            }

            resolve(allWorking);
        });
    }

    // Helper: Test if e-ink mode is active
    function testEinkModeActive() {
        return new Promise((resolve) => {
            let wheelPrevented = false;
            
            const wheelListener = (e) => {
                if (e.defaultPrevented) {
                    wheelPrevented = true;
                }
            };

            document.addEventListener('wheel', wheelListener, { passive: false });

            const wheelEvent = new WheelEvent('wheel', {
                deltaY: 50,
                bubbles: true,
                cancelable: true
            });

            document.dispatchEvent(wheelEvent);

            setTimeout(() => {
                document.removeEventListener('wheel', wheelListener);
                resolve(wheelPrevented);
            }, 100);
        });
    }

    // Helper: Test if normal mode is active
    function testNormalModeActive() {
        return new Promise((resolve) => {
            let wheelPrevented = false;
            
            const wheelListener = (e) => {
                if (e.defaultPrevented) {
                    wheelPrevented = true;
                }
            };

            document.addEventListener('wheel', wheelListener, { passive: false });

            const wheelEvent = new WheelEvent('wheel', {
                deltaY: 50,
                bubbles: true,
                cancelable: true
            });

            document.dispatchEvent(wheelEvent);

            setTimeout(() => {
                document.removeEventListener('wheel', wheelListener);
                resolve(!wheelPrevented); // Normal mode should NOT prevent wheel events
            }, 100);
        });
    }

    // Main test runner
    async function runScrollToggleTests() {
        console.log('🚀 Running scroll toggle tests...');
        
        const results = {
            normalScrolling: false,
            einkScrolling: false,
            scrollToggle: false
        };

        // Ensure we start in normal mode
        if (window.einkWorldOverrides) {
            window.dispatchEvent(
                new CustomEvent('eink-config-update', { 
                    detail: { frameRateLimit: 5, enabled: false, scrollFlashEnabled: false }
                })
            );
            await new Promise(r => setTimeout(r, 200));
        }

        // Test normal scrolling
        results.normalScrolling = await testNormalScrolling();
        
        // Test e-ink scrolling
        results.einkScrolling = await testEinkScrolling();
        
        // Test toggling between modes
        results.scrollToggle = await testScrollToggle();

        // Summary
        console.log('📊 Scroll Toggle Test Results:');
        console.log('✅ Normal scrolling:', results.normalScrolling);
        console.log('✅ E-ink scrolling:', results.einkScrolling);
        console.log('✅ Mode toggling:', results.scrollToggle);

        const passedTests = Object.values(results).filter(Boolean).length;
        const totalTests = Object.keys(results).length;
        
        console.log(`🎯 Overall: ${passedTests}/${totalTests} tests passed`);

        if (passedTests === totalTests) {
            console.log('🎉 All scroll toggle tests passed!');
            console.log('📝 Normal scrolling is properly restored when e-ink mode is disabled');
        } else {
            console.log('⚠️ Some scroll toggle tests failed');
            console.log('💡 Check that event listeners are being properly added/removed');
        }

        return results;
    }

    // Make test functions available globally
    window.scrollToggleTests = {
        runAll: runScrollToggleTests,
        testNormal: testNormalScrolling,
        testEink: testEinkScrolling,
        testToggle: testScrollToggle
    };

    console.log('🔧 Scroll toggle test functions loaded.');
    console.log('📝 Run scrollToggleTests.runAll() to start testing.');

})();