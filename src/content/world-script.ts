// World context script for E-ink Simulator Extension
// This script runs in the main world context to override requestAnimationFrame
// It's injected by the content script to bypass CSP restrictions

interface EinkWorldConfig {
  frameRateLimit: number;
  enabled: boolean;
  scrollFlashEnabled: boolean;
  videoHandlingEnabled: boolean;
  videoPlaybackRate: number;
}

class EinkWorldOverrides {
  private originalRequestAnimationFrame: typeof requestAnimationFrame | null =
    null;

  private originalCancelAnimationFrame: typeof cancelAnimationFrame | null =
    null;

  private isActive = false;

  private config: EinkWorldConfig = {
    frameRateLimit: 5,
    enabled: false,
    scrollFlashEnabled: true,
    videoHandlingEnabled: true,
    videoPlaybackRate: 0.5,
  };

  private scrollFlashOverlay: HTMLElement | null = null;

  private isFlashing = false;

  private scrollListenerAttached = false;

  private wheelHandler: ((e: WheelEvent) => void) | null = null;

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

    // Handle scroll flash separately since it can be toggled independently
    if (
      this.config.enabled &&
      this.config.scrollFlashEnabled &&
      !this.scrollListenerAttached
    ) {
      this.enableScrollFlash();
    } else if (
      (!this.config.enabled || !this.config.scrollFlashEnabled) &&
      this.scrollListenerAttached
    ) {
      this.disableScrollFlash();
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

  private createScrollFlashOverlay(): void {
    if (this.scrollFlashOverlay) return;

    this.scrollFlashOverlay = document.createElement('div');
    this.scrollFlashOverlay.id = 'eink-scroll-flash-overlay';

    // Calculate frame-rate-based transition duration
    const frameInterval = 1000 / this.config.frameRateLimit;
    const transitionDuration = Math.max(frameInterval, 50);

    this.scrollFlashOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: lightgray;
      opacity: 0;
      pointer-events: none;
      z-index: 999999;
      transition: opacity ${transitionDuration}ms ease-out;
    `;
    document.body.appendChild(this.scrollFlashOverlay);
  }

  private enableScrollFlash(): void {
    if (this.scrollListenerAttached) return;

    this.createScrollFlashOverlay();

    let scrollTimeout: number;

    // Store the handler so we can remove it later
    this.wheelHandler = (e: WheelEvent) => {
      // Prevent default scrolling - we'll handle it manually
      e.preventDefault();

      if (!this.isFlashing && this.scrollFlashOverlay) {
        // Calculate e-ink style scroll chunk (larger jumps, not smooth scrolling)
        const scrollDirection = Math.sign(e.deltaY);
        const viewportHeight = window.innerHeight;

        // E-ink devices typically scroll in chunks of 1/3 to 1/2 viewport height
        // This makes scrolling feel more like page turns
        const scrollChunkSize = Math.floor(viewportHeight * 0.4); // 40% of viewport
        const scrollAmount = scrollDirection * scrollChunkSize;

        const currentScrollY = window.scrollY;
        const targetScrollY = currentScrollY + scrollAmount;
        const maxScrollY = Math.max(
          0,
          document.documentElement.scrollHeight - window.innerHeight
        );
        const finalScrollY = Math.max(0, Math.min(targetScrollY, maxScrollY));

        // Only scroll if there's actually somewhere to go
        if (finalScrollY !== currentScrollY) {
          this.simulateEinkScrollFlash(finalScrollY);
        }
      }

      // Debounce multiple scroll events to prevent excessive flashing
      clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        this.isFlashing = false;
      }, 100);
    };

    // Add wheel event listener with passive: false to allow preventDefault
    document.addEventListener('wheel', this.wheelHandler, { passive: false });

    this.scrollListenerAttached = true;
    console.log('[E-ink World] Scroll flash effect enabled');
  }

  private disableScrollFlash(): void {
    if (!this.scrollListenerAttached) return;

    // Remove the wheel event listener to restore normal scrolling
    if (this.wheelHandler) {
      document.removeEventListener('wheel', this.wheelHandler, {
        passive: false,
      } as any);
      this.wheelHandler = null;
      console.log(
        '[E-ink World] Wheel event listener removed - normal scrolling restored'
      );
    }

    // Remove scroll flash overlay
    if (this.scrollFlashOverlay) {
      this.scrollFlashOverlay.remove();
      this.scrollFlashOverlay = null;
    }

    this.scrollListenerAttached = false;
    console.log('[E-ink World] Scroll flash effect disabled');
  }

  private simulateEinkScrollFlash(targetScrollY: number): void {
    if (this.isFlashing || !this.scrollFlashOverlay) return;

    this.isFlashing = true;

    // Calculate frame-rate-based timing
    const frameInterval = 1000 / this.config.frameRateLimit; // ms per frame
    const whiteFlashDuration = Math.max(frameInterval * 2, 100); // At least 2 frames for white flash
    const blackFlashDuration = Math.max(frameInterval, 50); // At least 1 frame for black flash
    const fadeOutDuration = Math.max(frameInterval, 50); // At least 1 frame for fade out

    // Store current scroll position for freeze effect
    const currentScrollY = window.scrollY;

    console.log(
      `[E-ink World] E-ink scroll: ${currentScrollY} → ${targetScrollY} (Δ${targetScrollY - currentScrollY})`
    );

    // E-ink refresh sequence: freeze -> white flash -> jump to target -> black flash -> normal

    // 1. Freeze current content and show white flash (simulates e-ink clearing)
    this.scrollFlashOverlay.style.background = 'lightgray';
    this.scrollFlashOverlay.style.opacity = '0.8';
    this.scrollFlashOverlay.style.transition = `opacity ${whiteFlashDuration}ms ease-out`;

    setTimeout(() => {
      if (!this.scrollFlashOverlay) return;

      // 2. During white flash, jump to target scroll position (instant like e-ink)
      window.scrollTo({
        top: targetScrollY,
        behavior: 'instant',
      });

      // 3. Brief black flash (simulates e-ink settling after refresh)
      this.scrollFlashOverlay.style.background = 'darkgray';
      this.scrollFlashOverlay.style.opacity = '0.3';
      this.scrollFlashOverlay.style.transition = `opacity ${blackFlashDuration}ms ease-out`;

      setTimeout(() => {
        if (!this.scrollFlashOverlay) return;

        // 4. Return to normal - reveal new content
        this.scrollFlashOverlay.style.opacity = '0';
        this.scrollFlashOverlay.style.background = 'lightgray';
        this.scrollFlashOverlay.style.transition = `opacity ${fadeOutDuration}ms ease-out`;

        setTimeout(() => {
          this.isFlashing = false;
        }, fadeOutDuration);
      }, blackFlashDuration);
    }, whiteFlashDuration);

    console.log(
      `[E-ink World] Flash timing: white=${whiteFlashDuration}ms, black=${blackFlashDuration}ms, fade=${fadeOutDuration}ms (${this.config.frameRateLimit} FPS)`
    );
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
