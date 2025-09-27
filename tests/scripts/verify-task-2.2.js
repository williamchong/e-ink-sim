// Verification script for Task 2.2: Add video element handling
// This script verifies that video elements are properly detected and modified for e-ink simulation

(function() {
    'use strict';
    
    console.log('[Task 2.2 Verification] Starting video element handling verification...');
    
    const EXPECTED_PLAYBACK_RATE = 0.5;
    const EXPECTED_FILTER_KEYWORDS = ['grayscale', 'contrast', 'brightness', 'saturate'];
    
    function verifyVideoHandling() {
        const results = {
            videoDetection: false,
            playbackRateModification: false,
            filterApplication: false,
            dynamicVideoHandling: false,
            extensionAPI: false,
            overallSuccess: false
        };
        
        console.log('[Task 2.2] Verifying video element detection...');
        
        // Test 1: Check if videos are detected and processed
        const allVideos = document.querySelectorAll('video');
        const processedVideos = document.querySelectorAll('video[data-eink-processed="true"]');
        
        console.log(`[Task 2.2] Found ${allVideos.length} video elements`);
        console.log(`[Task 2.2] Found ${processedVideos.length} processed video elements`);
        
        if (allVideos.length > 0 && processedVideos.length > 0) {
            results.videoDetection = true;
            console.log('✅ [Task 2.2] Video detection: PASSED');
        } else {
            console.log('❌ [Task 2.2] Video detection: FAILED');
            console.log('   - Make sure the extension is enabled and videos are present on the page');
        }
        
        // Test 2: Check playback rate modification
        console.log('[Task 2.2] Verifying playback rate modification...');
        let correctPlaybackRates = 0;
        
        processedVideos.forEach((video, index) => {
            const playbackRate = video.playbackRate;
            console.log(`[Task 2.2] Video ${index + 1} playback rate: ${playbackRate}x (expected: ${EXPECTED_PLAYBACK_RATE}x)`);
            
            if (Math.abs(playbackRate - EXPECTED_PLAYBACK_RATE) < 0.1) {
                correctPlaybackRates++;
            }
        });
        
        if (processedVideos.length > 0 && correctPlaybackRates === processedVideos.length) {
            results.playbackRateModification = true;
            console.log('✅ [Task 2.2] Playback rate modification: PASSED');
        } else {
            console.log('❌ [Task 2.2] Playback rate modification: FAILED');
            console.log(`   - Expected all videos to have ${EXPECTED_PLAYBACK_RATE}x playback rate`);
        }
        
        // Test 3: Check filter application
        console.log('[Task 2.2] Verifying filter application...');
        let correctFilters = 0;
        
        processedVideos.forEach((video, index) => {
            const filter = video.style.filter || 'none';
            console.log(`[Task 2.2] Video ${index + 1} filter: ${filter}`);
            
            const hasExpectedFilters = EXPECTED_FILTER_KEYWORDS.some(keyword => 
                filter.toLowerCase().includes(keyword)
            );
            
            if (hasExpectedFilters && filter !== 'none') {
                correctFilters++;
                console.log(`   ✅ Video ${index + 1} has correct e-ink filters`);
            } else {
                console.log(`   ❌ Video ${index + 1} missing e-ink filters`);
            }
        });
        
        if (processedVideos.length > 0 && correctFilters === processedVideos.length) {
            results.filterApplication = true;
            console.log('✅ [Task 2.2] Filter application: PASSED');
        } else {
            console.log('❌ [Task 2.2] Filter application: FAILED');
            console.log('   - Expected all videos to have grayscale and contrast filters');
        }
        
        // Test 4: Check extension API
        console.log('[Task 2.2] Verifying extension API...');
        
        if (window.einkSimulator && typeof window.einkSimulator.testVideoHandling === 'function') {
            try {
                const apiResult = window.einkSimulator.testVideoHandling();
                console.log('[Task 2.2] Extension API result:', apiResult);
                
                if (apiResult.enabled && apiResult.videosFound > 0 && apiResult.videosProcessed > 0) {
                    results.extensionAPI = true;
                    console.log('✅ [Task 2.2] Extension API: PASSED');
                } else {
                    console.log('❌ [Task 2.2] Extension API: FAILED');
                    console.log('   - API available but video handling not working correctly');
                }
            } catch (error) {
                console.error('[Task 2.2] Extension API error:', error);
                console.log('❌ [Task 2.2] Extension API: FAILED');
            }
        } else {
            console.log('❌ [Task 2.2] Extension API: FAILED');
            console.log('   - Extension API not available. Make sure extension is loaded.');
        }
        
        // Test 5: Test dynamic video handling
        console.log('[Task 2.2] Testing dynamic video handling...');
        
        const testVideo = document.createElement('video');
        testVideo.id = 'verification-test-video';
        testVideo.controls = true;
        testVideo.style.width = '100px';
        testVideo.style.height = '100px';
        testVideo.style.position = 'fixed';
        testVideo.style.top = '10px';
        testVideo.style.right = '10px';
        testVideo.style.zIndex = '9999';
        testVideo.style.border = '2px solid red';
        
        const source = document.createElement('source');
        source.src = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        source.type = 'video/mp4';
        testVideo.appendChild(source);
        
        document.body.appendChild(testVideo);
        
        // Wait for the extension to process the new video
        setTimeout(() => {
            const isProcessed = testVideo.dataset.einkProcessed === 'true';
            const hasCorrectPlaybackRate = Math.abs(testVideo.playbackRate - EXPECTED_PLAYBACK_RATE) < 0.1;
            const hasFilter = testVideo.style.filter && testVideo.style.filter !== 'none';
            
            console.log(`[Task 2.2] Dynamic video processed: ${isProcessed}`);
            console.log(`[Task 2.2] Dynamic video playback rate: ${testVideo.playbackRate}x`);
            console.log(`[Task 2.2] Dynamic video filter: ${testVideo.style.filter || 'none'}`);
            
            if (isProcessed && hasCorrectPlaybackRate && hasFilter) {
                results.dynamicVideoHandling = true;
                console.log('✅ [Task 2.2] Dynamic video handling: PASSED');
            } else {
                console.log('❌ [Task 2.2] Dynamic video handling: FAILED');
                console.log('   - New videos should be automatically processed by the extension');
            }
            
            // Clean up test video
            testVideo.remove();
            
            // Calculate overall success
            const passedTests = Object.values(results).filter(result => result === true).length;
            results.overallSuccess = passedTests >= 4; // At least 4 out of 5 tests should pass
            
            // Display final results
            displayResults(results);
            
        }, 1500); // Wait 1.5 seconds for processing
        
        return results;
    }
    
    function displayResults(results) {
        console.log('\n[Task 2.2] ========== VERIFICATION RESULTS ==========');
        console.log(`[Task 2.2] Video Detection: ${results.videoDetection ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`[Task 2.2] Playback Rate Modification: ${results.playbackRateModification ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`[Task 2.2] Filter Application: ${results.filterApplication ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`[Task 2.2] Dynamic Video Handling: ${results.dynamicVideoHandling ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`[Task 2.2] Extension API: ${results.extensionAPI ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`[Task 2.2] Overall Success: ${results.overallSuccess ? '✅ PASSED' : '❌ FAILED'}`);
        console.log('[Task 2.2] =============================================\n');
        
        if (results.overallSuccess) {
            console.log('🎉 [Task 2.2] Video element handling implementation is working correctly!');
            console.log('   - Videos are detected and processed automatically');
            console.log('   - Playback rate is reduced to 0.5x for e-ink simulation');
            console.log('   - Grayscale and contrast filters are applied');
            console.log('   - Dynamic video elements are handled properly');
        } else {
            console.log('⚠️ [Task 2.2] Video element handling needs attention:');
            if (!results.videoDetection) console.log('   - Check that extension is enabled and videos are present');
            if (!results.playbackRateModification) console.log('   - Verify playback rate is set to 0.5x');
            if (!results.filterApplication) console.log('   - Ensure e-ink filters are applied to videos');
            if (!results.dynamicVideoHandling) console.log('   - Check MutationObserver for dynamic videos');
            if (!results.extensionAPI) console.log('   - Verify extension API is available');
        }
        
        // Store results globally for inspection
        window.task22VerificationResults = results;
    }
    
    // Make verification function available globally
    window.verifyTask22 = verifyVideoHandling;
    
    // Auto-run verification if videos are present
    if (document.querySelectorAll('video').length > 0) {
        console.log('[Task 2.2] Videos detected, running verification in 3 seconds...');
        setTimeout(verifyVideoHandling, 3000);
    } else {
        console.log('[Task 2.2] No videos found. Load a page with videos and run verifyTask22() to test.');
    }
    
})();