// Content script for E-ink Developer Extension
// Handles page injection, CSS modifications, and API overrides

import { EinkSettings, DEVICE_PROFILES } from '../types/settings.js';

// Default settings for content script
const DEFAULT_SETTINGS: EinkSettings = {
  enabled: false,
  deviceProfile: 'kindle',
  grayscaleEnabled: true,
  frameRateLimit: 5,
  scrollFlashEnabled: true,
};

class EinkSimulator {
  private settings: EinkSettings | null = null;

  private styleElement: HTMLStyleElement | null = null;

  private isWorldScriptInjected = false;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    // Request world script injection from service worker
    await this.requestWorldScriptInjection();

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

    // Update world script configuration
    this.updateWorldScriptConfig();
  }

  private disableSimulation(): void {
    // Remove CSS transformations
    this.removeCSS();

    // Update world script configuration
    this.updateWorldScriptConfig();
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
   * Request world script injection from service worker (bypasses CSP)
   */
  private async requestWorldScriptInjection(): Promise<void> {
    if (this.isWorldScriptInjected) return;

    try {
      // Send message to service worker to inject world script
      // Service worker will determine the tab ID from the sender
      const response = await chrome.runtime.sendMessage({
        action: 'injectWorldScript',
      });

      if (response?.success) {
        // Wait for world script to be ready with polling fallback
        await this.waitForWorldScript();
        this.isWorldScriptInjected = true;
        console.log(
          '[E-ink Extension] World script injected via service worker'
        );
      } else {
        throw new Error('Service worker failed to inject world script');
      }
    } catch (error) {
      console.warn(
        '[E-ink Extension] Failed to request world script injection:',
        error
      );
      // Skip fallback since it will be blocked by CSP anyway
      console.log(
        '[E-ink Extension] Continuing without world script - API overrides disabled'
      );
    }
  }

  /**
   * Wait for world script to be ready with both event listening and polling
   */
  private async waitForWorldScript(): Promise<void> {
    return new Promise<void>((resolve) => {
      let resolved = false;

      const resolveOnce = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      // Method 1: Listen for ready event
      const handleReady = () => {
        window.removeEventListener('eink-world-ready', handleReady);
        resolveOnce();
      };
      window.addEventListener('eink-world-ready', handleReady);

      // Method 2: Poll for world script availability
      let pollCount = 0;
      const pollInterval = setInterval(() => {
        pollCount += 1;

        // Check if world script is available
        if ((window as any).einkWorldReady) {
          clearInterval(pollInterval);
          window.removeEventListener('eink-world-ready', handleReady);
          resolveOnce();
          return;
        }

        // Give up after 50 attempts (5 seconds)
        if (pollCount >= 50) {
          clearInterval(pollInterval);
          window.removeEventListener('eink-world-ready', handleReady);
          console.warn(
            '[E-ink Extension] World script ready timeout after polling'
          );
          resolveOnce();
        }
      }, 100);
    });
  }

  /**
   * Update world script configuration
   */
  private updateWorldScriptConfig(): void {
    if (!this.isWorldScriptInjected || !this.settings) return;

    const config = {
      frameRateLimit: this.settings.frameRateLimit,
      enabled: this.settings.enabled,
    };

    // Send configuration to world script
    window.dispatchEvent(
      new CustomEvent('eink-config-update', { detail: config })
    );
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
    return (this.isWorldScriptInjected && this.settings?.enabled) || false;
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
