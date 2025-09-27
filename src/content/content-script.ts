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
      if (request.action === 'toggleSimulation') {
        this.toggleSimulation();
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

    if (this.settings?.grayscaleEnabled && this.settings?.deviceProfile) {
      // Get device-specific grayscale filter
      const deviceProfile = DEVICE_PROFILES[this.settings.deviceProfile];
      const grayscaleFilter =
        deviceProfile?.grayscaleFilter || 'grayscale(1) contrast(1.2)';

      css += `
        html {
          filter: ${grayscaleFilter} !important;
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
    `;

    this.styleElement.textContent = css;
    document.head.appendChild(this.styleElement);
  }

  private removeCSS(): void {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }
  }

  private toggleSimulation(): void {
    if (!this.settings) return;

    this.settings.enabled = !this.settings.enabled;
    chrome.storage.sync.set({ einkSettings: this.settings });
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

      // Override requestAnimationFrame for frame rate limiting
      const frameRateLimit = this.settings?.frameRateLimit || 5;
      const frameInterval = 1000 / frameRateLimit; // Convert FPS to milliseconds

      window.requestAnimationFrame = (
        callback: FrameRequestCallback
      ): number => 
        // Use setTimeout to throttle frame rate to e-ink appropriate speed
         window.setTimeout(() => {
          callback(performance.now());
        }, frameInterval)
      ;

      this.isAPIOverrideActive = true;
      console.log(
        `[E-ink Extension] API overrides active - Frame rate limited to ${frameRateLimit} FPS`
      );
    } catch (error) {
      console.warn('[E-ink Extension] Failed to override APIs:', error);
    }
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
