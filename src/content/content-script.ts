// Content script for E-ink Developer Extension
// Handles page injection, CSS modifications, and API overrides

import { EinkSettings, DEFAULT_SETTINGS } from '../types/settings.js';

class EinkSimulator {
  private settings: EinkSettings | null = null;

  private styleElement: HTMLStyleElement | null = null;

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

    // Override JavaScript APIs (placeholder for future tasks)
    // this.overrideAnimationAPIs();
  }

  private disableSimulation(): void {
    // Remove CSS transformations
    this.removeCSS();
  }

  private injectCSS(): void {
    if (this.styleElement) {
      this.styleElement.remove();
    }

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'eink-developer-extension-styles';

    let css = '';

    if (this.settings?.grayscaleEnabled) {
      css += `
        html {
          filter: grayscale(1) contrast(1.2) !important;
        }
      `;
    }

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
}

// Initialize the simulator when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new EinkSimulator();
  });
} else {
  new EinkSimulator();
}
