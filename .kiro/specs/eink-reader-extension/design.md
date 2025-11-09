# Design Document

## Overview

The E-ink Simulator Extension is a Chrome extension built specifically for web developers to test and optimize their applications for e-ink devices. The extension provides accurate hardware simulation, comprehensive debugging tools, and performance analysis without requiring physical e-ink hardware.

## Development Phases

### Phase 1: Hackathon MVP (2 Days) 🏆
**Goal**: Working demo with core e-ink simulation
**Priority**: Must-have features for hackathon presentation

**Day 1 Features:**
- Basic Chrome extension setup (Manifest V3, TypeScript)
- Content script injection
- Simple popup UI with on/off toggle
- Basic grayscale conversion (CSS filters)
- Frame rate limiting (requestAnimationFrame override)

**Day 2 Features:**
- Scroll behavior modification with flash effect
- Simple options page with device presets
- Basic performance metrics display
- Polish UI and prepare demo

**Hackathon Demo Value:**
- ✅ Visually impressive e-ink simulation
- ✅ Clear developer use case demonstration
- ✅ Working prototype on real websites
- ✅ Extensible architecture for future development

### Phase 2: Production Ready (2-4 Weeks)
**Goal**: Robust extension ready for Chrome Web Store

**Core Features:**
- Comprehensive options UI with all toggles
- Multiple device profiles (Kindle, Kobo, reMarkable)
- Advanced visual effects (dithering, ghosting)
- Performance monitoring and reporting
- Cross-tab state management
- Error handling and fallbacks

### Phase 3: Advanced Features (2-3 Months)
**Goal**: Professional developer tool with advanced capabilities

**Advanced Features:**
- DevTools panel integration
- Visual regression testing integration
- GitHub Actions integration for automated e-ink compatibility testing
- Advanced debugging tools
- Element-level compatibility analysis
- Export/import configurations

### Phase 4: Enterprise Features (6+ Months)
**Goal**: Enterprise-grade tool for large development teams

**Enterprise Features:**
- Team collaboration features
- Advanced analytics and reporting
- Integration with design systems
- Custom device profile creation
- Performance benchmarking suite
- Multi-browser support

## Hackathon Implementation Priority

### Critical Path (Must Complete for Demo):
1. **Extension Infrastructure** (4 hours)
   - Manifest V3 setup
   - TypeScript configuration
   - Basic content script injection

2. **Core Visual Simulation** (6 hours)
   - Grayscale conversion via CSS filters
   - Frame rate limiting via requestAnimationFrame
   - Basic scroll behavior modification

3. **UI Components** (4 hours)
   - Simple popup with toggle
   - Basic options page
   - Device preset selection

4. **Demo Polish** (2 hours)
   - Visual refinements
   - Demo preparation
   - Bug fixes

### Nice-to-Have (If Time Permits):
- Flash refresh effects during scrolling
- Performance metrics display
- Multiple device profiles
- Advanced CSS animation overrides

## MVP Architecture (Hackathon Focus)

### Core Components for Phase 1:

1. **Service Worker (Background Script)**
   - Settings persistence using chrome.storage
   - Message routing between UI and content scripts
   - Extension icon badge updates

2. **Content Script**
   - CSS injection for grayscale conversion
   - requestAnimationFrame override for frame limiting
   - Basic scroll event handling

3. **Simple UI Components**
   - Popup with on/off toggle and basic controls
   - Options page with device presets
   - No React needed for MVP - vanilla JS/HTML

## MVP Data Models (Hackathon Focus)

### Essential Types for Phase 1:

```typescript
// Simple settings for MVP
interface MVPSettings {
  enabled: boolean;
  deviceProfile: 'kindle' | 'kobo' | 'remarkable';
  grayscaleEnabled: boolean;
  frameRateLimit: number; // 1-30 FPS
  scrollFlashEnabled: boolean;
}

// Basic device profiles
interface DeviceProfile {
  id: string;
  name: string;
  maxFPS: number;
  grayscaleFilter: string; // CSS filter value
}

// Simple performance tracking
interface BasicMetrics {
  currentFPS: number;
  simulationActive: boolean;
  pageUrl: string;
}
```

### MVP Device Profiles (Hackathon Focus)

```typescript
// Simple device profiles for MVP
const MVP_DEVICE_PROFILES = {
  kindle: {
    name: 'Kindle Paperwhite',
    maxFPS: 5,
    grayscaleFilter: 'grayscale(1) contrast(1.2)'
  },
  kobo: {
    name: 'Kobo Clara HD',
    maxFPS: 4,
    grayscaleFilter: 'grayscale(1) contrast(1.1)'
  },
  remarkable: {
    name: 'reMarkable 2',
    maxFPS: 8,
    grayscaleFilter: 'grayscale(1) contrast(1.3)'
  }
};

// MVP default settings
const MVP_DEFAULT_SETTINGS: MVPSettings = {
  enabled: false,
  deviceProfile: 'kindle',
  grayscaleEnabled: true,
  frameRateLimit: 5,
  scrollFlashEnabled: true
};


## Technical Limitations and Constraints

### Chrome Extension API Limitations

#### Content Security Policy (CSP) Restrictions
- **Impact**: Some websites with strict CSP may block content script injection or inline style modifications
- **Mitigation**: Use declarative CSS injection via chrome.scripting API, fallback to user stylesheet injection
- **Affected Requirements**: Visual transformations on CSP-protected sites

#### Manifest V3 Service Worker Constraints
- **Impact**: Service workers are event-driven and may terminate, losing in-memory state
- **Mitigation**: Persist all critical state to chrome.storage, implement state restoration on wake-up
- **Affected Requirements**: Cross-tab state synchronization, performance monitoring continuity

#### API Override Capabilities and Limitations

**requestAnimationFrame Override - POSSIBLE with limitations**
```typescript
// Can override in same-origin contexts
const originalRAF = window.requestAnimationFrame;
window.requestAnimationFrame = function(callback) {
  // Throttle to e-ink appropriate frame rate (5Hz = 200ms intervals)
  return setTimeout(callback, 200);
};
```
- ✅ **Works**: Same-origin pages, content scripts can override
- ❌ **Fails**: Cross-origin iframes, some secure contexts, worker threads
- **Limitation**: Only affects JavaScript-driven animations, not CSS animations

**CSS Animation Override - POSSIBLE**
```typescript
// Inject CSS to slow down all animations
const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after {
    animation-duration: 2s !important;
    animation-delay: 0s !important;
    transition-duration: 1s !important;
  }
`;
document.head.appendChild(style);
```
- ✅ **Works**: All CSS animations and transitions
- ❌ **Limitation**: Cannot completely disable, only slow down
- **Issue**: May break animations that depend on specific timing

**Scroll Speed Override with E-ink Flash Effect - POSSIBLE**
```typescript
class EinkScrollSimulator {
  private isFlashing = false;
  private flashOverlay: HTMLElement;

  constructor() {
    // Create flash overlay for e-ink refresh simulation
    this.flashOverlay = document.createElement('div');
    this.flashOverlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: white;
      opacity: 0;
      pointer-events: none;
      z-index: 999999;
      transition: opacity 50ms ease-out;
    `;
    document.body.appendChild(this.flashOverlay);
  }

  // Override scroll with e-ink flash effect
  overrideScrolling() {
    let scrollTimeout: number;

    document.addEventListener('wheel', (e) => {
      e.preventDefault();

      if (!this.isFlashing) {
        this.simulateEinkRefresh(() => {
          // Perform actual scroll during flash
          window.scrollBy({
            top: e.deltaY * 0.2, // Slow scroll speed
            behavior: 'auto'
          });
        });
      }

      // Debounce multiple scroll events
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.isFlashing = false;
      }, 100);

    }, { passive: false });
  }

  // Simulate e-ink screen refresh flash
  private simulateEinkRefresh(callback: () => void) {
    if (this.isFlashing) return;
    this.isFlashing = true;

    // E-ink refresh sequence: white flash -> content update -> brief black -> normal

    // 1. White flash (like e-ink clearing)
    this.flashOverlay.style.opacity = '0.8';

    setTimeout(() => {
      // 2. Execute scroll during flash
      callback();

      // 3. Brief black flash (like e-ink settling)
      this.flashOverlay.style.background = 'black';
      this.flashOverlay.style.opacity = '0.3';

      setTimeout(() => {
        // 4. Return to normal
        this.flashOverlay.style.opacity = '0';
        this.flashOverlay.style.background = 'white';

        setTimeout(() => {
          this.isFlashing = false;
        }, 50);
      }, 30);
    }, 80);
  }
}

// Note: Ghosting effect requires html2canvas library - consider for post-MVP
```
- ✅ **Works**: Realistic e-ink refresh flash effect during scrolling
- ✅ **Enhanced**: Ghosting effect showing previous content briefly
- ✅ **Authentic**: Mimics actual e-ink display refresh behavior
- ❌ **Limitation**: Still limited to wheel events, not native touch scrolling

**Video Frame Rate - NOT DIRECTLY POSSIBLE**
```typescript
// Cannot directly control video playback frame rate
// Workaround: CSS filters and reduced opacity
video.style.filter = 'contrast(200%) brightness(80%)';
video.playbackRate = 0.5; // Slow down playback instead
```
- ❌ **Cannot**: Modify actual video frame rate
- ✅ **Can**: Slow playback, apply visual filters, pause/resume periodically
- **Limitation**: Video decoding happens at browser level, not controllable

**setTimeout/setInterval Override - POSSIBLE**
```typescript
const originalSetTimeout = window.setTimeout;
window.setTimeout = function(callback, delay) {
  // Increase all timeouts to simulate slower refresh
  return originalSetTimeout(callback, Math.max(delay, 200));
};
```
- ✅ **Works**: JavaScript timing functions
- ❌ **Limitation**: Cannot affect browser's internal timing, CSS animations unaffected

**Display Refresh Rate - NOT POSSIBLE**
- ❌ **Cannot**: Control actual monitor refresh rate
- ❌ **Cannot**: Override browser's rendering pipeline
- ✅ **Can**: Throttle JavaScript execution and visual updates

### Web API Constraints

#### Comprehensive Override Analysis

**What We CAN Control:**
1. **JavaScript Animation Timing**: requestAnimationFrame, setTimeout, setInterval
2. **CSS Animation Speed**: animation-duration, transition-duration via injected CSS
3. **Scroll Behavior**: wheel events, programmatic scrolling (with limitations)
4. **Visual Appearance**: All CSS properties, filters, transforms
5. **Element Visibility**: Show/hide elements, modify opacity
6. **User Interactions**: Event handling, form behavior

**What We CANNOT Control:**
1. **Hardware Refresh Rate**: Monitor's actual refresh rate
2. **Browser Rendering Pipeline**: Internal browser rendering optimizations
3. **Video Decoding**: Native video frame rate processing
4. **Cross-Origin Content**: Iframes from different domains
5. **Native Scrolling Physics**: Touch scrolling momentum, keyboard scrolling
6. **System-Level Animations**: OS-level window animations, cursor animations

**Realistic E-ink Simulation Approach:**
```typescript
class EinkSimulationEngine {
  private frameRateLimit = 5; // 5 FPS for e-ink
  private lastFrameTime = 0;

  // Throttle all visual updates
  private throttleUpdates() {
    const now = performance.now();
    if (now - this.lastFrameTime < (1000 / this.frameRateLimit)) {
      return false; // Skip this frame
    }
    this.lastFrameTime = now;
    return true;
  }

  // Override requestAnimationFrame with throttling
  overrideAnimationFrame() {
    const original = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) => {
      return original(() => {
        if (this.throttleUpdates()) {
          callback(performance.now());
        }
      });
    };
  }

  // Apply comprehensive CSS overrides
  applyCSSOverrides() {
    const css = `
      * {
        /* Slow down all animations */
        animation-duration: 2s !important;
        transition-duration: 1s !important;

        /* Remove smooth scrolling */
        scroll-behavior: auto !important;

        /* Optimize for e-ink */
        backface-visibility: hidden !important;
        transform: translateZ(0) !important;
      }

      /* Disable problematic effects */
      *:hover {
        transition: none !important;
      }
    `;

    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }
}
```

**MVP Effectiveness Assessment:**
- **CSS Grayscale**: 95% effective (works on all websites)
- **Frame Rate Limiting**: 80% effective (JavaScript animations only)
- **Scroll Flash Effect**: 70% effective (mouse wheel scrolling only)
- **Overall MVP Simulation**: Good enough for hackathon demo and developer testing

### MVP Limitations Summary

**For Hackathon MVP:**
- Focus on same-origin pages (most development scenarios)
- Use CSS filters for grayscale conversion (works everywhere)
- Basic error handling with try/catch blocks
- Simple fallbacks: if API override fails, continue with CSS-only approach

## Open Source Strategy

### GitHub Repository Structure:
```
eink-developer-extension/
├── .github/
│   └── workflows/
│       ├── ci.yml          # GitHub Actions for testing
│       ├── release.yml     # Automated releases
│       └── pr-check.yml    # PR validation
├── src/
├── tests/
├── docs/
├── examples/
└── README.md
```

### GitHub Actions Workflows:
- **CI Pipeline**: Automated testing on every PR
- **Release Pipeline**: Automated Chrome Web Store publishing
- **Visual Regression**: Automated screenshot comparisons
- **Performance Testing**: Automated performance benchmarks

### Community Features (Phase 3+):
- Community-contributed device profiles
- Crowdsourced e-ink compatibility database
- Plugin system for custom e-ink effects
- Developer community feedback integration

## MVP Testing (Hackathon Focus)

### Manual Testing Only for Phase 1:
- Test on 3-5 popular websites (GitHub, Medium, Wikipedia)
- Verify grayscale conversion works
- Confirm frame rate limiting is noticeable
- Check settings persistence across browser restarts

### Post-Hackathon Testing (Phase 2+):
- Automated testing with Playwright
- Visual regression testing
- Performance benchmarking
- GitHub Actions CI/CD for automated testing on PRs
- Open source contribution testing workflows