// Shared TypeScript interfaces for E-ink Developer Extension

export interface EinkSettings {
  enabled: boolean;
  deviceProfile: 'kindle' | 'kobo' | 'remarkable';
  grayscaleEnabled: boolean;
  frameRateLimit: number;
  scrollFlashEnabled: boolean;
}

export interface MessageRequest {
  action:
    | 'getSettings'
    | 'saveSettings'
    | 'toggleSimulation'
    | 'getTabState'
    | 'notifyContentScript'
    | 'injectWorldScript'
    | string;
  settings?: EinkSettings;
  tabId?: number;
  data?: any;
}

export interface MessageResponse {
  success?: boolean;
  settings?: EinkSettings;
  error?: string;
  data?: any;
}

export interface DeviceProfile {
  id: string;
  name: string;
  maxFPS: number;
  grayscaleFilter: string;
}

// Device profiles for MVP
export const DEVICE_PROFILES: Record<string, DeviceProfile> = {
  kindle: {
    id: 'kindle',
    name: 'Kindle Paperwhite',
    maxFPS: 5,
    grayscaleFilter: 'grayscale(1) contrast(1.2)',
  },
  kobo: {
    id: 'kobo',
    name: 'Kobo Clara HD',
    maxFPS: 4,
    grayscaleFilter: 'grayscale(1) contrast(1.1)',
  },
  remarkable: {
    id: 'remarkable',
    name: 'reMarkable 2',
    maxFPS: 8,
    grayscaleFilter: 'grayscale(1) contrast(1.3)',
  },
};
