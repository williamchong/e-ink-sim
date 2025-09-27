// Test script for video handling functionality
// This script can be run in the browser console to test video e-ink simulation

(function() {
    'use strict';
    
    console.log('[Video Test] Starting video handling tests...');
    
    // Test configuration
    const TEST_CONFIG = {
        expectedPlaybackRate: 0.5,
        expectedFilterKeywords: ['grayscale', 'contrast', 'brightness', 'saturate'],
        testVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    };
    
    // Test results
    const testResults = {
        videoDetection: false,
        playbackRateModification: false,
        filterApplication: false,
        dynamicVideoHandling: false,
        extensionAPI: false,
        overallSuccess: false
    };
    
    function runAllTests() {
        console.log('[Video Test] Running comprehensive video handling tests...');
        
        // Test 1: Video Detection
        testVideoDetection();
        
        // Test 2: Playback Rate Modification
        testPlaybackRateModification();
        
        // Test 3: Filter Application
        testFilterApplication();
        
        // Test 4: Dynamic Video Handling
        testDynamicVideoHandling();
        
        // Test 5: Extension API
        testExtensionAPI();
        
        // Calculate overall success
        const passedTests = Object.values(testResults).filter(result => result === true).length - 1; // Exclude overallSuccess
        testResults.overallSuccess = passedTests >= 4; // At least 4 out of 5 tests should pass
        
        // Display results
        displayTestResults();
        
        return testResults;
    }
    
    function testVideoDetection() {
        console.log('[Video Test] Test 1: Video Detection');
        
        const videos = document.querySelectorAll('video');
        const processedVideos = document.querySelectorAll('video[data-eink-processed="true"]');
        
        console.log(`[Video Test] Found ${videos.length} video elements`);
        console.log(`[Video Test] Found ${processedVideos.length} processed video elements`);
        
        testResults.videoDetection = videos.length > 0 && processedVideos.length > 0;
        
        if (testResults.videoDetection) {
            console.log('✅ [Video Test] Video detection: PASSED');
        } else {
            console.log('❌ [Video Test] Video detection: FAILED');
        }
    }
    
    function testPlaybackRateModification() {
        console.log('[Video Test] Test 2: Playback Rate Modification');
        
        const videos = document.querySelectorAll('video[data-eink-processed="true"]');
        let correctPlaybackRates = 0;
        
        videos.forEach((video, index) => {
            const playbackRate = video.playbackRate;
            console.log(`[Video Test] Video ${index + 1} playback rate: ${playbackRate}x`);
            
            if (Math.abs(playbackRate - TEST_CONFIG.expectedPlaybackRate) < 0.1) {
                correctPlaybackRates++;
            }
        });
        
        testResults.playbackRateModification = videos.length > 0 && correctPlaybackRates === videos.length;
        
        if (testResults.playbackRateModification) {
            console.log('✅ [Video Test] Playback rate modification: PASSED');
        } else {
            console.log('❌ [Video Test] Playback rate modification: FAILED');
        }
    }
    
    function testFilterApplication() {
        console.log('[Video Test] Test 3: Filter Application');
        
        const videos = document.querySelectorAll('video[data-eink-processed="true"]');
        let correctFilters = 0;
        
        videos.forEach((video, index) => {
            const filter = video.style.filter || 'none';
            console.log(`[Video Test] Video ${index + 1} filter: ${filter}`);
            
            // Check if filter contains expected e-ink keywords
            const hasExpectedFilters = TEST_CONFIG.expectedFilterKeywords.some(keyword => 
                filter.toLowerCase().includes(keyword)
            );
            
            if (hasExpectedFilters && filter !== 'none') {
                correctFilters++;
            }
        });
        
        testResults.filterApplication = videos.length > 0 && correctFilters === videos.length;
        
        if (testResults.filterApplication) {
            console.log('✅ [Video Test] Filter application: PASSED');
        } else {
            console.log('❌ [Video Test] Filter application: FAILED');
        }
    }
    
    function testDynamicVideoHandling() {
        console.log('[Video Test] Test 4: Dynamic Video Handling');
        
        // Create a test video element
        const testVideo = document.createElement('video');
        testVideo.id = 'dynamic-test-video';
        testVideo.controls = true;
        testVideo.style.width = '200px';
        testVideo.style.height = '150px';
        
        const source = document.createElement('source');
        source.src = TEST_CONFIG.testVideoUrl;
        source.type = 'video/mp4';
        testVideo.appendChild(source);
        
        // Add to page
        document.body.appendChild(testVideo);
        
        // Wait a moment for the extension to process the new video
        setTimeout(() => {
            const isProcessed = testVideo.dataset.einkProcessed === 'true';
            const hasCorrectPlaybackRate = Math.abs(testVideo.playbackRate - TEST_CONFIG.expectedPlaybackRate) < 0.1;
            const hasFilter = testVideo.style.filter && testVideo.style.filter !== 'none';
            
            testResults.dynamicVideoHandling = isProcessed && hasCorrectPlaybackRate && hasFilter;
            
            console.log(`[Video Test] Dynamic video processed: ${isProcessed}`);
            console.log(`[Video Test] Dynamic video playback rate: ${testVideo.playbackRate}x`);
            console.log(`[Video Test] Dynamic video filter: ${testVideo.style.filter || 'none'}`);
            
            if (testResults.dynamicVideoHandling) {
                console.log('✅ [Video Test] Dynamic video handling: PASSED');
            } else {
                console.log('❌ [Video Test] Dynamic video handling: FAILED');
            }
            
            // Clean up
            testVideo.remove();
        }, 1000);
    }
    
    function testExtensionAPI() {
        console.log('[Video Test] Test 5: Extension API');
        
        if (window.einkSimulator && typeof window.einkSimulator.testVideoHandling === 'function') {
            try {
                const apiResult = window.einkSimulator.testVideoHandling();
                console.log('[Video Test] Extension API result:', apiResult);
                
                testResults.extensionAPI = apiResult.enabled && 
                                         apiResult.videosFound > 0 && 
                                         apiResult.videosProcessed > 0 &&
                                         apiResult.observerActive;
                
                if (testResults.extensionAPI) {
                    console.log('✅ [Video Test] Extension API: PASSED');
                } else {
                    console.log('❌ [Video Test] Extension API: FAILED');
                }
            } catch (error) {
                console.error('[Video Test] Extension API error:', error);
                testResults.extensionAPI = false;
                console.log('❌ [Video Test] Extension API: FAILED');
            }
        } else {
            console.log('❌ [Video Test] Extension API not available');
            testResults.extensionAPI = false;
        }
    }
    
    function displayTestResults() {
        console.log('\n[Video Test] ========== TEST RESULTS ==========');
        console.log(`[Video Test] Video Detection: ${testResults.videoDetection ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`[Video Test] Playback Rate Modification: ${testResults.playbackRateModification ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`[Video Test] Filter Application: ${testResults.filterApplication ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`[Video Test] Dynamic Video Handling: ${testResults.dynamicVideoHandling ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`[Video Test] Extension API: ${testResults.extensionAPI ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`[Video Test] Overall Success: ${testResults.overallSuccess ? '✅ PASSED' : '❌ FAILED'}`);
        console.log('[Video Test] =====================================\n');
        
        // Create visual results display
        createResultsDisplay();
    }
    
    function createResultsDisplay() {
        // Remove existing results display
        const existingDisplay = document.getElementById('video-test-results');
        if (existingDisplay) {
            existingDisplay.remove();
        }
        
        // Create new results display
        const resultsDiv = document.createElement('div');
        resultsDiv.id = 'video-test-results';
        resultsDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            background: white;
            border: 2px solid ${testResults.overallSuccess ? '#4CAF50' : '#f44336'};
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: monospace;
            font-size: 12px;
            line-height: 1.4;
        `;
        
        const passedCount = Object.values(testResults).filter(result => result === true).length - 1;
        const totalTests = Object.keys(testResults).length - 1;
        
        resultsDiv.innerHTML = `
            <h3 style="margin: 0 0 10px 0; color: ${testResults.overallSuccess ? '#4CAF50' : '#f44336'};">
                Video Test Results (${passedCount}/${totalTests})
            </h3>
            <div>Video Detection: ${testResults.videoDetection ? '✅' : '❌'}</div>
            <div>Playback Rate: ${testResults.playbackRateModification ? '✅' : '❌'}</div>
            <div>Filter Application: ${testResults.filterApplication ? '✅' : '❌'}</div>
            <div>Dynamic Handling: ${testResults.dynamicVideoHandling ? '✅' : '❌'}</div>
            <div>Extension API: ${testResults.extensionAPI ? '✅' : '❌'}</div>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 10px;">Close</button>
        `;
        
        document.body.appendChild(resultsDiv);
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (resultsDiv.parentElement) {
                resultsDiv.remove();
            }
        }, 30000);
    }
    
    // Make test functions available globally
    window.testVideoHandling = runAllTests;
    window.videoTestResults = testResults;
    
    // Auto-run tests if videos are already present
    if (document.querySelectorAll('video').length > 0) {
        console.log('[Video Test] Videos detected, running tests in 2 seconds...');
        setTimeout(runAllTests, 2000);
    } else {
        console.log('[Video Test] No videos found. Load a page with videos and run testVideoHandling() to test.');
    }
    
})();