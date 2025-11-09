// Popup script for E-ink Simulator Extension
// Handles popup UI interactions and settings management

import { EinkSettings } from '../types/settings.js';

console.log('E-ink Simulator Extension popup loaded');

class PopupController {
  private settings: EinkSettings | null = null;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadSettings();
    this.setupEventListeners();
    this.updateUI();

    // Ensure content script is in sync with popup state
    this.syncWithContentScript();
  }

  private async loadSettings(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['einkSettings'], (result) => {
        this.settings = result.einkSettings || {
          enabled: false,
          deviceProfile: 'kindle',
          grayscaleEnabled: true,
          frameRateLimit: 5,
          scrollFlashEnabled: true,
          videoHandlingEnabled: true,
          videoPlaybackRate: 0.5,
        };
        resolve();
      });
    });
  }

  private setupEventListeners(): void {
    const toggleButton = document.getElementById(
      'toggleSimulation'
    ) as HTMLButtonElement;
    const deviceSelect = document.getElementById(
      'deviceProfile'
    ) as HTMLSelectElement;

    if (toggleButton) {
      toggleButton.addEventListener('click', () => {
        this.toggleSimulation();
      });
    }

    if (deviceSelect) {
      deviceSelect.addEventListener('change', (e) => {
        const target = e.target as HTMLSelectElement;
        this.updateDeviceProfile(target.value);
      });
    }
  }

  private updateUI(): void {
    if (!this.settings) return;

    const toggleButton = document.getElementById(
      'toggleSimulation'
    ) as HTMLButtonElement;
    const statusText = document.getElementById('status') as HTMLSpanElement;
    const deviceSelect = document.getElementById(
      'deviceProfile'
    ) as HTMLSelectElement;

    if (toggleButton) {
      toggleButton.textContent = this.settings.enabled
        ? 'Disable Simulation'
        : 'Enable Simulation';
      toggleButton.className = this.settings.enabled
        ? 'button button-danger'
        : 'button button-primary';
    }

    if (statusText) {
      const statusMessage = this.settings.enabled
        ? `Active (${this.settings.deviceProfile.charAt(0).toUpperCase() + this.settings.deviceProfile.slice(1)})`
        : 'Inactive';
      statusText.textContent = statusMessage;
      statusText.className = this.settings.enabled
        ? 'status-active'
        : 'status-inactive';
    }

    if (deviceSelect) {
      deviceSelect.value = this.settings.deviceProfile;
    }

    // Apply grayscale to popup itself when active (for visual feedback)
    if (this.settings.enabled && this.settings.grayscaleEnabled) {
      document.body.style.filter = 'grayscale(1)';
    } else {
      document.body.style.filter = 'none';
    }
  }

  private async toggleSimulation(): Promise<void> {
    if (!this.settings) return;

    this.settings.enabled = !this.settings.enabled;
    await this.saveSettings();
    this.updateUI();

    // Notify content script of the new state (don't let it toggle again)
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'updateSimulation',
        enabled: this.settings.enabled,
      });
    }
  }

  private async updateDeviceProfile(profile: string): Promise<void> {
    if (!this.settings) return;

    // Validate the profile is one of the expected values
    if (
      profile === 'kindle' ||
      profile === 'kobo' ||
      profile === 'remarkable'
    ) {
      this.settings.deviceProfile = profile;
      await this.saveSettings();
    }
  }

  private async saveSettings(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ einkSettings: this.settings }, () => {
        resolve();
      });
    });
  }

  private async syncWithContentScript(): Promise<void> {
    if (!this.settings) return;

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateSimulation',
          enabled: this.settings.enabled,
        });
      }
    } catch (error) {
      // Content script might not be loaded yet, that's okay
      console.log('Could not sync with content script:', error);
    }
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
