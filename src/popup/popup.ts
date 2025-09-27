// Popup script for E-ink Developer Extension
// Handles popup UI interactions and settings management

console.log('E-ink Developer Extension popup loaded');

interface EinkSettings {
  enabled: boolean;
  deviceProfile: string;
  grayscaleEnabled: boolean;
  frameRateLimit: number;
  scrollFlashEnabled: boolean;
}

class PopupController {
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
        this.settings = result.einkSettings || {
          enabled: false,
          deviceProfile: 'kindle',
          grayscaleEnabled: true,
          frameRateLimit: 5,
          scrollFlashEnabled: true,
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
      statusText.textContent = this.settings.enabled ? 'Active' : 'Inactive';
      statusText.className = this.settings.enabled
        ? 'status-active'
        : 'status-inactive';
    }

    if (deviceSelect) {
      deviceSelect.value = this.settings.deviceProfile;
    }
  }

  private async toggleSimulation(): Promise<void> {
    if (!this.settings) return;

    this.settings.enabled = !this.settings.enabled;
    await this.saveSettings();
    this.updateUI();

    // Notify content script
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, { action: 'toggleSimulation' });
    }
  }

  private async updateDeviceProfile(profile: string): Promise<void> {
    if (!this.settings) return;

    this.settings.deviceProfile = profile;
    await this.saveSettings();
  }

  private async saveSettings(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.set({ einkSettings: this.settings }, () => {
        resolve();
      });
    });
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
