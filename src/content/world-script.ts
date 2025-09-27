// World context script for E-ink Developer Extension
// This script runs in the main world context to override requestAnimationFrame
// It's injected by the content script to bypass CSP restrictions

interface EinkWorldConfig {
  frameRateLimit: number;
  enabled: boolean;
}

class EinkWorldOverrides {
  private originalRequestAnimationFrame: typeof requestAnimationFrame | null =
    null;

  private originalCancelAnimationFrame: typeof cancelAnimationFrame | null =
    null;

  private isActive = false;

  private config: EinkWorldConfig = { frameRateLimit: 5, enabled: false };

  constructor() {
    // Listen for configuration updates from content script
    window.addEventListener('eink-config-update', (event: any) => {
      this.config = event.detail;
      this.applyOverrides();
    });

    // Store original functions immediately
    this.originalRequestAnimationFrame = window.requestAnimationFrame;
    this.originalCancelAnimationFrame = window.cancelAnimationFrame;
  }

  private applyOverrides(): void {
    if (this.config.enabled && !this.isActive) {
      this.enableOverrides();
    } else if (!this.config.enabled && this.isActive) {
      this.disableOverrides();
    }
  }

  private enableOverrides(): void {
    if (this.isActive) return;

    const { frameRateLimit } = this.config;
    const frameInterval = 1000 / frameRateLimit;

    let lastFrameTime = 0;
    let frameId = 0;
    const pendingCallbacks = new Map<number, FrameRequestCallback>();

    // Override requestAnimationFrame with frame rate limiting
    window.requestAnimationFrame = (callback: FrameRequestCallback): number => {
      frameId += 1;
      const currentFrameId = frameId;
      pendingCallbacks.set(currentFrameId, callback);

      const now = performance.now();
      const timeSinceLastFrame = now - lastFrameTime;

      if (timeSinceLastFrame >= frameInterval) {
        // Execute immediately if enough time has passed
        lastFrameTime = now;
        setTimeout(() => {
          const cb = pendingCallbacks.get(currentFrameId);
          if (cb) {
            pendingCallbacks.delete(currentFrameId);
            try {
              cb(performance.now());
            } catch (error) {
              console.warn('[E-ink World] Animation callback error:', error);
            }
          }
        }, 0);
      } else {
        // Wait for the remaining time to maintain consistent frame rate
        const remainingTime = frameInterval - timeSinceLastFrame;
        setTimeout(() => {
          const cb = pendingCallbacks.get(currentFrameId);
          if (cb) {
            pendingCallbacks.delete(currentFrameId);
            lastFrameTime = performance.now();
            try {
              cb(performance.now());
            } catch (error) {
              console.warn('[E-ink World] Animation callback error:', error);
            }
          }
        }, remainingTime);
      }

      return currentFrameId;
    };

    // Override cancelAnimationFrame
    window.cancelAnimationFrame = (id: number): void => {
      if (pendingCallbacks.has(id)) {
        pendingCallbacks.delete(id);
      } else if (this.originalCancelAnimationFrame) {
        this.originalCancelAnimationFrame(id);
      }
    };

    this.isActive = true;
    console.log(`[E-ink World] Frame rate limited to ${frameRateLimit} FPS`);
  }

  private disableOverrides(): void {
    if (!this.isActive) return;

    // Restore original functions
    if (this.originalRequestAnimationFrame) {
      window.requestAnimationFrame = this.originalRequestAnimationFrame;
    }
    if (this.originalCancelAnimationFrame) {
      window.cancelAnimationFrame = this.originalCancelAnimationFrame;
    }

    this.isActive = false;
    console.log('[E-ink World] Frame rate limiting disabled');
  }
}

// Initialize the world overrides
const worldOverrides = new EinkWorldOverrides();

// Make world overrides available for detection
(window as any).einkWorldReady = true;
(window as any).einkWorldOverrides = worldOverrides;

// Signal that the world script is ready
window.dispatchEvent(new CustomEvent('eink-world-ready'));

// Also dispatch periodically for a short time in case content script missed it
let readySignalCount = 0;
const readyInterval = setInterval(() => {
  readySignalCount += 1;
  window.dispatchEvent(new CustomEvent('eink-world-ready'));

  if (readySignalCount >= 5) {
    clearInterval(readyInterval);
  }
}, 100);
