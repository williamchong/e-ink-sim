// Content script for E-ink Developer Extension
// Handles page injection, CSS modifications, and API overrides

import {
  EinkSettings,
  DEFAULT_SETTINGS,
  DEVICE_PROFILES,
} from '../types/settings.js';

class EinkSimulator {
  private settings: EinkSettings | null = null;

  private styleElement: HTMLStyleElement | null = null;

  private originalRequestAnimationFrame: typeof requestAnimationFrame | null =
    null;

  private originalCancelAnimationFrame: typeof cancelAnimationFrame | null =
    null;

  private isAPIOverrideActive = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // Load settings from storage
    await this.loadSettings();

    // Listen for settings changes
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.einkSettings) {
        this.settings = changes.einkSettings.newValue;
        this.applySimulation();
      }
    });

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
      if (request.action === 'updateSimulation') {
        // Update settings with the state from popup (don't toggle)
        if (this.settings) {
          this.settings.enabled = request.enabled;
          this.applySimulation();
        }
        sendResponse({ success: true });
      } else if (request.action === 'settingsChanged') {
        // Handle settings changes from service worker
        this.settings = request.data;
        this.applySimulation();
        sendResponse({ success: true });
      } else if (request.action === 'simulationToggled') {
        // Handle toggle from service worker
        if (this.settings) {
          this.settings.enabled = request.data.enabled;
          this.applySimulation();
        }
        sendResponse({ success: true });
      } else if (request.action === 'initializeSimulation') {
        // Handle initialization from service worker
        this.settings = request.data;
        this.applySimulation();
        sendResponse({ success: true });
      }
    });

    // Apply initial simulation if enabled
    this.applySimulation();
  }

  private async loadSettings(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['einkSettings'], (result) => {
        this.settings = result.einkSettings || DEFAULT_SETTINGS;
        resolve();
      });
    });
  }

  private applySimulation(): void {
    if (!this.settings) return;

    if (this.settings.enabled) {
      this.enableSimulation();
    } else {
      this.disableSimulation();
    }
  }

  private enableSimulation(): void {
    // Apply CSS transformations
    this.injectCSS();

    // Override JavaScript APIs for e-ink simulation
    this.overrideAPIs();
  }

  private disableSimulation(): void {
    // Remove CSS transformations
    this.removeCSS();

    // Restore original APIs
    this.restoreAPIs();
  }

  private injectCSS(): void {
    if (this.styleElement) {
      this.styleElement.remove();
    }

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'eink-developer-extension-styles';

    let css = '';

    // Apply grayscale conversion if enabled
    if (this.settings?.grayscaleEnabled && this.settings?.deviceProfile) {
      // Get device-specific grayscale filter
      const deviceProfile = DEVICE_PROFILES[this.settings.deviceProfile];
      const grayscaleFilter =
        deviceProfile?.grayscaleFilter || 'grayscale(1) contrast(1.2)';

      css += `
        /* Apply grayscale filter to entire page for e-ink simulation */
        html {
          filter: ${grayscaleFilter} !important;
          -webkit-filter: ${grayscaleFilter} !important;
        }

        /* Ensure all content inherits the grayscale transformation */
        body {
          filter: inherit !important;
          -webkit-filter: inherit !important;
        }

        /* Handle specific elements that might override filters */
        img, video, canvas, svg {
          filter: inherit !important;
          -webkit-filter: inherit !important;
        }

        /* Optimize text rendering for e-ink displays */
        * {
          text-rendering: optimizeLegibility !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
        }
      `;
    }

    // Add base e-ink optimizations
    css += `
      /* E-ink optimization styles */
      * {
        /* Disable smooth scrolling for e-ink */
        scroll-behavior: auto !important;

        /* Optimize rendering for e-ink */
        backface-visibility: hidden !important;
        transform: translateZ(0) !important;
      }

      /* Slow down CSS animations for e-ink */
      *, *::before, *::after {
        animation-duration: 2s !important;
        transition-duration: 1s !important;
      }

      /* Remove hover effects that don't work well on e-ink */
      *:hover {
        transition: none !important;
      }

      /* Improve contrast for better e-ink readability */
      body {
        background-color: white !important;
        color: black !important;
      }

      /* Ensure links are visible in grayscale */
      a {
        text-decoration: underline !important;
        font-weight: bold !important;
      }

      /* Optimize button visibility */
      button, input[type="button"], input[type="submit"] {
        border: 2px solid black !important;
        background: white !important;
        color: black !important;
      }
    `;

    this.styleElement.textContent = css;
    document.head.appendChild(this.styleElement);

    console.log(
      `[E-ink Extension] CSS injected - Grayscale: ${this.settings?.grayscaleEnabled}, Device: ${this.settings?.deviceProfile}`
    );
  }

  private removeCSS(): void {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
  }

  /**
   * Override JavaScript APIs to simulate e-ink behavior
   * Creates foundation for frame rate limiting and animation control
   */
  private overrideAPIs(): void {
    if (this.isAPIOverrideActive) return;

    try {
      // Store original requestAnimationFrame
      this.originalRequestAnimationFrame = window.requestAnimationFrame;

      // Enhanced requestAnimationFrame override with proper frame rate limiting
      this.overrideRequestAnimationFrame();

      this.isAPIOverrideActive = true;
      const frameRateLimit = this.settings?.frameRateLimit || 5;
      console.log(
        `[E-ink Extension] API overrides active - Frame rate limited to ${frameRateLimit} FPS`
      );
    } catch (error) {
      console.warn('[E-ink Extension] Failed to override APIs:', error);
    }
  }

  /**
   * Enhanced requestAnimationFrame override with accurate frame rate limiting
   * Implements proper timing control for e-ink display simulation
   */
  private overrideRequestAnimationFrame(): void {
    const frameRateLimit = this.settings?.frameRateLimit || 5;
    const frameInterval = 1000 / frameRateLimit; // Convert FPS to milliseconds

    let lastFrameTime = 0;
    let frameId = 0;
    const pendingCallbacks = new Map<number, FrameRequestCallback>();

    // Store original cancelAnimationFrame
    this.originalCancelAnimationFrame = window.cancelAnimationFrame;

    // Enhanced requestAnimationFrame with proper timing
    window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
      frameId += 1;
      const currentFrameId = frameId;
      pendingCallbacks.set(currentFrameId, callback);

      const now = performance.now();
      const timeSinceLastFrame = now - lastFrameTime;

      if (timeSinceLastFrame >= frameInterval) {
        // Execute immediately if enough time has passed
        lastFrameTime = now;
        setTimeout(() => {
          const cb = pendingCallbacks.get(currentFrameId);
          if (cb) {
            pendingCallbacks.delete(currentFrameId);
            try {
              cb(performance.now());
            } catch (error) {
              console.warn(
                '[E-ink Extension] Animation callback error:',
                error
              );
            }
          }
        }, 0);
      } else {
        // Wait for the remaining time to maintain consistent frame rate
        const remainingTime = frameInterval - timeSinceLastFrame;
        setTimeout(() => {
          const cb = pendingCallbacks.get(currentFrameId);
          if (cb) {
            pendingCallbacks.delete(currentFrameId);
            lastFrameTime = performance.now();
            try {
              cb(performance.now());
            } catch (error) {
              console.warn(
                '[E-ink Extension] Animation callback error:',
                error
              );
            }
          }
        }, remainingTime);
      }

      return currentFrameId;
    };

    // Override cancelAnimationFrame to work with our custom implementation
    window.cancelAnimationFrame = (id: number): void => {
      if (pendingCallbacks.has(id)) {
        pendingCallbacks.delete(id);
      } else if (this.originalCancelAnimationFrame) {
        // Fallback to original implementation for any edge cases
        this.originalCancelAnimationFrame(id);
      }
    };
  }

  /**
   * Restore original JavaScript APIs
   */
  private restoreAPIs(): void {
    if (!this.isAPIOverrideActive) return;

    try {
      // Restore original requestAnimationFrame
      if (this.originalRequestAnimationFrame) {
        window.requestAnimationFrame = this.originalRequestAnimationFrame;
        this.originalRequestAnimationFrame = null;
      }

      // Restore original cancelAnimationFrame
      if (this.originalCancelAnimationFrame) {
        window.cancelAnimationFrame = this.originalCancelAnimationFrame;
        this.originalCancelAnimationFrame = null;
      }

      this.isAPIOverrideActive = false;
      console.log(
        '[E-ink Extension] API overrides disabled - Original APIs restored'
      );
    } catch (error) {
      console.warn('[E-ink Extension] Failed to restore APIs:', error);
    }
  }

  /**
   * Test method to verify CSS injection is working
   * Can be called from browser console for debugging
   */
  public testCSSInjection(): boolean {
    const testElement = document.getElementById(
      'eink-developer-extension-styles'
    );
    return testElement !== null;
  }

  /**
   * Test method to verify API overrides are working
   * Can be called from browser console for debugging
   */
  public testAPIOverrides(): boolean {
    return this.isAPIOverrideActive;
  }

  /**
   * Test method to verify grayscale conversion is working
   * Can be called from browser console for debugging
   */
  public testGrayscaleConversion(): {
    enabled: boolean;
    deviceProfile: string;
    filterApplied: boolean;
    cssInjected: boolean;
  } {
    const styleElement = document.getElementById(
      'eink-developer-extension-styles'
    );
    const htmlElement = document.documentElement;
    const computedStyle = window.getComputedStyle(htmlElement);

    return {
      enabled: this.settings?.enabled || false,
      deviceProfile: this.settings?.deviceProfile || 'none',
      filterApplied: computedStyle.filter !== 'none',
      cssInjected: styleElement !== null,
    };
  }

  /**
   * Toggle grayscale mode for testing
   * Can be called from browser console for debugging
   */
  public toggleGrayscale(): void {
    if (this.settings) {
      this.settings.grayscaleEnabled = !this.settings.grayscaleEnabled;
      this.applySimulation();
      console.log(
        `[E-ink Extension] Grayscale toggled: ${this.settings.grayscaleEnabled}`
      );
    }
  }

  /**
   * Test requestAnimationFrame override functionality
   * Measures frame timing to verify throttling is working
   */
  public testRequestAnimationFrame(): Promise<{
    isOverridden: boolean;
    averageFrameTime: number;
    expectedFrameTime: number;
    frameRateLimit: number;
    testResults: number[];
  }> {
    return new Promise((resolve) => {
      const frameRateLimit = this.settings?.frameRateLimit || 5;
      const expectedFrameTime = 1000 / frameRateLimit;
      const frameTimes: number[] = [];
      let lastTime = performance.now();
      let frameCount = 0;
      const maxFrames = 10;

      const measureFrame = () => {
        const currentTime = performance.now();
        const frameTime = currentTime - lastTime;
        frameTimes.push(frameTime);
        lastTime = currentTime;
        frameCount += 1;

        if (frameCount < maxFrames) {
          requestAnimationFrame(measureFrame);
        } else {
          // Calculate results
          const averageFrameTime =
            frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
          const isOverridden = averageFrameTime > expectedFrameTime * 0.8; // Allow 20% tolerance

          resolve({
            isOverridden,
            averageFrameTime,
            expectedFrameTime,
            frameRateLimit,
            testResults: frameTimes,
          });
        }
      };

      requestAnimationFrame(measureFrame);
    });
  }
}

// Initialize the simulator when DOM is ready
let einkSimulator: EinkSimulator;

function initializeSimulator(): void {
  try {
    einkSimulator = new EinkSimulator();

    // Make simulator available globally for debugging
    (window as any).einkSimulator = einkSimulator;

    console.log('[E-ink Extension] Content script initialized successfully');
  } catch (error) {
    console.error(
      '[E-ink Extension] Failed to initialize content script:',
      error
    );
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSimulator);
} else {
  initializeSimulator();
}
