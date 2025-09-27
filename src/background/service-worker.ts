// Service worker for E-ink Developer Extension
// Handles extension lifecycle, settings persistence, and message passing

console.log('E-ink Developer Extension service worker loaded');

// Extension installation handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed:', details.reason);

  // Set default settings on first install
  if (details.reason === 'install') {
    const defaultSettings = {
      enabled: false,
      deviceProfile: 'kindle',
      grayscaleEnabled: true,
      frameRateLimit: 5,
      scrollFlashEnabled: true,
    };

    chrome.storage.sync.set({ einkSettings: defaultSettings });
  }
});

// Message passing between components
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // eslint-disable-next-line no-console
  console.log('Service worker received message:', request);

  // Handle messages from popup and content scripts
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['einkSettings'], (result) => {
      sendResponse(result.einkSettings || {});
    });
    return true; // Keep message channel open for async response
  }

  if (request.action === 'saveSettings') {
    chrome.storage.sync.set({ einkSettings: request.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  return false; // No async response needed for other messages
});

// Update extension icon based on simulation state
function updateIcon(enabled: boolean): void {
  const iconPath = enabled ? 'icons/icon-active-' : 'icons/icon-';
  chrome.action.setIcon({
    path: {
      '16': `${iconPath}16.png`,
      '32': `${iconPath}32.png`,
      '48': `${iconPath}48.png`,
      '128': `${iconPath}128.png`,
    },
  });
}

// Listen for storage changes to update icon
chrome.storage.onChanged.addListener((changes) => {
  if (changes.einkSettings) {
    const settings = changes.einkSettings.newValue;
    updateIcon(settings?.enabled || false);
  }
});