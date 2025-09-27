// Options page script for E-ink Developer Extension
// Handles advanced settings and configuration

import { EinkSettings, DEFAULT_SETTINGS } from '../types/settings.js';

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
    if (frameRateInput)
      frameRateInput.value = this.settings.frameRateLimit.toString();
    if (scrollFlashCheck)
      scrollFlashCheck.checked = this.settings.scrollFlashEnabled;
  }

  private async saveSettings(): Promise<void> {
    if (!this.settings) return Promise.resolve();

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

    this.settings.deviceProfile =
      (deviceSelect?.value as 'kindle' | 'kobo' | 'remarkable') || 'kindle';
    this.settings.grayscaleEnabled = grayscaleCheck?.checked || true;
    this.settings.frameRateLimit = parseInt(frameRateInput?.value || '5', 10);
    this.settings.scrollFlashEnabled = scrollFlashCheck?.checked || true;

    return new Promise((resolve) => {
      chrome.storage.sync.set({ einkSettings: this.settings }, () => {
        this.showSaveMessage();
        resolve();
      });
    });
  }

  private async resetToDefaults(): Promise<void> {
    this.settings = { ...DEFAULT_SETTINGS };

    await this.saveSettings();
    this.updateUI();
  }

  private showSaveMessage(): void {
    const message = document.getElementById('saveMessage');
    if (message) {
      message.style.display = 'block';
      setTimeout(() => {
        message.style.display = 'none';
      }, 2000);
    }
  }
}

// Initialize options when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new OptionsController();
});
