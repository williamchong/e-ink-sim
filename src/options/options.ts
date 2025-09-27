// Options page script for E-ink Developer Extension
// Handles advanced settings and configuration

import { EinkSettings } from '../types/settings.js';

// Default settings for options page
const DEFAULT_SETTINGS: EinkSettings = {
  enabled: false,
  deviceProfile: 'kindle',
  grayscaleEnabled: true,
  frameRateLimit: 5,
  scrollFlashEnabled: true,
  videoHandlingEnabled: true,
  videoPlaybackRate: 0.5,
};

class OptionsController {
  private settings: EinkSettings | null = null;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    await this.loadSettings();
    this.setupEventListeners();
    this.updateUI();
  }

  private async loadSettings(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['einkSettings'], (result) => {
        this.settings = result.einkSettings || DEFAULT_SETTINGS;
        resolve();
      });
    });
  }

  private setupEventListeners(): void {
    const saveButton = document.getElementById(
      'saveSettings'
    ) as HTMLButtonElement;
    const resetButton = document.getElementById(
      'resetSettings'
    ) as HTMLButtonElement;
    const frameRateInput = document.getElementById(
      'frameRateLimit'
    ) as HTMLInputElement;

    if (saveButton) {
      saveButton.addEventListener('click', () => {
        this.saveSettings();
      });
    }

    if (resetButton) {
      resetButton.addEventListener('click', () => {
        this.resetToDefaults();
      });
    }

    // Update frame rate display dynamically
    if (frameRateInput) {
      frameRateInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const { value } = target;
        const display = document.querySelector('.slider-value');
        if (display) {
          display.textContent = `${value} FPS`;
        }
      });
    }

    // Auto-save on change for better UX
    const inputs = [
      'deviceProfile',
      'grayscaleEnabled',
      'frameRateLimit',
      'scrollFlashEnabled',
    ];

    inputs.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        element.addEventListener('change', () => {
          this.saveSettings();
        });
      }
    });
  }

  private updateUI(): void {
    if (!this.settings) return;

    const deviceSelect = document.getElementById(
      'deviceProfile'
    ) as HTMLSelectElement;
    const grayscaleCheck = document.getElementById(
      'grayscaleEnabled'
    ) as HTMLInputElement;
    const frameRateInput = document.getElementById(
      'frameRateLimit'
    ) as HTMLInputElement;
    const scrollFlashCheck = document.getElementById(
      'scrollFlashEnabled'
    ) as HTMLInputElement;

    if (deviceSelect) deviceSelect.value = this.settings.deviceProfile;
    if (grayscaleCheck) grayscaleCheck.checked = this.settings.grayscaleEnabled;
    if (frameRateInput) {
      frameRateInput.value = this.settings.frameRateLimit.toString();
      // Update the display value
      const display = document.querySelector('.slider-value');
      if (display) {
        display.textContent = `${this.settings.frameRateLimit} FPS`;
      }
    }
    if (scrollFlashCheck)
      scrollFlashCheck.checked = this.settings.scrollFlashEnabled;
  }

  private async saveSettings(): Promise<void> {
    if (!this.settings) return Promise.resolve();

    try {
      // Read values from form
      const deviceSelect = document.getElementById(
        'deviceProfile'
      ) as HTMLSelectElement;
      const grayscaleCheck = document.getElementById(
        'grayscaleEnabled'
      ) as HTMLInputElement;
      const frameRateInput = document.getElementById(
        'frameRateLimit'
      ) as HTMLInputElement;
      const scrollFlashCheck = document.getElementById(
        'scrollFlashEnabled'
      ) as HTMLInputElement;

      // Validate and update settings
      const deviceProfile = deviceSelect?.value as
        | 'kindle'
        | 'kobo'
        | 'remarkable';
      if (['kindle', 'kobo', 'remarkable'].includes(deviceProfile)) {
        this.settings.deviceProfile = deviceProfile;
      }

      this.settings.grayscaleEnabled = grayscaleCheck?.checked ?? true;

      const frameRate = parseInt(frameRateInput?.value || '5', 10);
      this.settings.frameRateLimit = Math.max(1, Math.min(30, frameRate)); // Clamp between 1-30

      this.settings.scrollFlashEnabled = scrollFlashCheck?.checked ?? true;

      return await new Promise((resolve, reject) => {
        chrome.storage.sync.set({ einkSettings: this.settings }, () => {
          if (chrome.runtime.lastError) {
            console.error('Failed to save settings:', chrome.runtime.lastError);
            this.showErrorMessage('Failed to save settings. Please try again.');
            reject(chrome.runtime.lastError);
          } else {
            this.showSaveMessage();
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showErrorMessage('An error occurred while saving settings.');
      throw error;
    }
  }

  private async resetToDefaults(): Promise<void> {
    this.settings = { ...DEFAULT_SETTINGS };

    await this.saveSettings();
    this.updateUI();
  }

  private showSaveMessage(): void {
    const message = document.getElementById('saveMessage');
    if (message) {
      message.textContent = 'Settings saved successfully!';
      message.className = 'save-message';
      message.style.display = 'block';
      setTimeout(() => {
        message.style.display = 'none';
      }, 2000);
    }
  }

  private showErrorMessage(errorText: string): void {
    const message = document.getElementById('saveMessage');
    if (message) {
      message.textContent = errorText;
      message.className = 'save-message error-message';
      message.style.display = 'block';
      setTimeout(() => {
        message.style.display = 'none';
      }, 3000);
    }
  }
}

// Initialize options when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new OptionsController();
});
