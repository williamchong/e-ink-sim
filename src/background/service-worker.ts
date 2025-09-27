// Service worker for E-ink Developer Extension
// Handles extension lifecycle, settings persistence, and message passing

import {
  EinkSettings,
  MessageRequest,
  MessageResponse,
  DEFAULT_SETTINGS,
} from '../types/settings.js';

// Update extension icon based on simulation state
function updateIcon(enabled: boolean): void {
  const iconPath = enabled ? 'icons/icon-active-' : 'icons/icon-';
  chrome.action
    .setIcon({
      path: {
        '16': `${iconPath}16.png`,
        '32': `${iconPath}32.png`,
        '48': `${iconPath}48.png`,
        '128': `${iconPath}128.png`,
      },
    })
    .catch(() => {
      // Fallback to default icons if active icons don't exist
      chrome.action.setIcon({
        path: {
          '16': 'icons/icon-16.png',
          '32': 'icons/icon-32.png',
          '48': 'icons/icon-48.png',
          '128': 'icons/icon-128.png',
        },
      });
    });

  // Update badge text to show simulation status
  chrome.action.setBadgeText({
    text: enabled ? 'ON' : '',
  });

  chrome.action.setBadgeBackgroundColor({
    color: enabled ? '#4CAF50' : '#FF5722',
  });
}

// Settings management functions
async function handleGetSettings(
  sendResponse: (response: MessageResponse) => void
): Promise<void> {
  try {
    const result = await chrome.storage.sync.get(['einkSettings']);
    const settings = result.einkSettings || DEFAULT_SETTINGS;
    sendResponse({ success: true, settings });
  } catch (error) {
    sendResponse({ success: false, error: 'Failed to get settings' });
  }
}

async function handleSaveSettings(
  settings: EinkSettings,
  sendResponse: (response: MessageResponse) => void
): Promise<void> {
  try {
    await chrome.storage.sync.set({ einkSettings: settings });

    // Notify all content scripts about settings change
    try {
      const tabs = await chrome.tabs.query({});
      const notifications = tabs.map(async (tab) => {
        if (tab.id) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              action: 'settingsChanged',
              data: settings,
            });
          } catch {
            // Ignore errors for tabs that don't have content scripts
          }
        }
      });
      await Promise.all(notifications);
    } catch {
      // Silently handle errors in tab notification
    }

    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: 'Failed to save settings' });
  }
}

async function handleToggleSimulation(
  sendResponse: (response: MessageResponse) => void
): Promise<void> {
  try {
    const result = await chrome.storage.sync.get(['einkSettings']);
    const settings = result.einkSettings || DEFAULT_SETTINGS;

    settings.enabled = !settings.enabled;
    await chrome.storage.sync.set({ einkSettings: settings });

    // Notify all content scripts about the toggle
    try {
      const tabs = await chrome.tabs.query({});
      const notifications = tabs.map(async (tab) => {
        if (tab.id) {
          try {
            await chrome.tabs.sendMessage(tab.id, {
              action: 'simulationToggled',
              data: { enabled: settings.enabled },
            });
          } catch {
            // Ignore errors for tabs that don't have content scripts
          }
        }
      });
      await Promise.all(notifications);
    } catch {
      // Silently handle errors in tab notification
    }

    sendResponse({ success: true, settings });
  } catch (error) {
    sendResponse({ success: false, error: 'Failed to toggle simulation' });
  }
}

async function handleGetTabState(
  tabId: number,
  sendResponse: (response: MessageResponse) => void
): Promise<void> {
  try {
    // Get per-tab state (for future A/B testing feature)
    const result = await chrome.storage.local.get([`tabState_${tabId}`]);
    const tabState = result[`tabState_${tabId}`] || null;
    sendResponse({ success: true, data: tabState });
  } catch (error) {
    sendResponse({ success: false, error: 'Failed to get tab state' });
  }
}

async function handleNotifyContentScript(
  tabId: number,
  data: any,
  sendResponse: (response: MessageResponse) => void
): Promise<void> {
  try {
    await chrome.tabs.sendMessage(tabId, { action: 'updateSimulation', data });
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: 'Failed to notify content script' });
  }
}

// Extension installation and update handler
chrome.runtime.onInstalled.addListener(async (details) => {
  try {
    // Set default settings on first install or update
    if (details.reason === 'install') {
      await chrome.storage.sync.set({ einkSettings: DEFAULT_SETTINGS });
    } else if (details.reason === 'update') {
      // Merge existing settings with new defaults to handle new features
      const result = await chrome.storage.sync.get(['einkSettings']);
      const existingSettings = result.einkSettings || {};
      const mergedSettings = { ...DEFAULT_SETTINGS, ...existingSettings };
      await chrome.storage.sync.set({ einkSettings: mergedSettings });
    }

    // Update icon to reflect initial state
    const { einkSettings } = await chrome.storage.sync.get(['einkSettings']);
    updateIcon(einkSettings?.enabled || false);
  } catch {
    // Silently handle installation errors
  }
});

// Enhanced message passing between components
chrome.runtime.onMessage.addListener(
  (request: MessageRequest, _sender, sendResponse) => {
    // Handle different message types
    switch (request.action) {
      case 'getSettings':
        handleGetSettings(sendResponse);
        return true; // Keep message channel open for async response

      case 'saveSettings':
        handleSaveSettings(request.settings!, sendResponse);
        return true;

      case 'toggleSimulation':
        handleToggleSimulation(sendResponse);
        return true;

      case 'getTabState':
        handleGetTabState(request.tabId!, sendResponse);
        return true;

      case 'notifyContentScript':
        handleNotifyContentScript(request.tabId!, request.data, sendResponse);
        return true;

      default:
        sendResponse({ success: false, error: 'Unknown action' });
        return false;
    }
  }
);

// Listen for storage changes to update icon and notify components
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'sync' && changes.einkSettings) {
    const settings = changes.einkSettings.newValue;
    if (settings) {
      updateIcon(settings.enabled);
    }
  }
});

// Handle tab updates to maintain per-tab state
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      // Send current settings to newly loaded content script
      const result = await chrome.storage.sync.get(['einkSettings']);
      const settings = result.einkSettings || DEFAULT_SETTINGS;

      if (settings.enabled) {
        await chrome.tabs.sendMessage(tabId, {
          action: 'initializeSimulation',
          data: settings,
        });
      }
    } catch {
      // Content script might not be ready yet, which is fine
    }
  }
});

// Cleanup when tabs are closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  try {
    await chrome.storage.local.remove([`tabState_${tabId}`]);
  } catch {
    // Silently handle cleanup errors
  }
});
