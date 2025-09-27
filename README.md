# E-ink Developer Extension

A Chrome extension designed specifically for web developers to test and optimize their web applications for e-ink devices. Provides accurate e-ink display simulation, debugging tools, and performance analysis without requiring physical e-ink hardware.

## Overview

The E-ink Developer Extension helps web developers create e-ink-friendly web experiences by simulating the unique characteristics of e-ink displays directly in the browser. Whether you're building reading applications, documentation sites, or any web content intended for e-ink devices, this extension provides the tools you need to test and optimize your work.

## Key Features

### 🎯 Accurate E-ink Simulation

- **Realistic Visual Transformations**: Converts web pages to grayscale with device-specific contrast adjustments
- **Frame Rate Limiting**: Simulates e-ink refresh constraints (1-15 Hz) for authentic performance testing
- **Scroll Flash Effects**: Mimics the characteristic white/black flash during e-ink screen refreshes
- **Device Profiles**: Pre-configured settings for popular e-ink devices (Kindle, Kobo, reMarkable)

### 🛠️ Developer-Focused Tools

- **Performance Metrics**: Real-time FPS monitoring and e-ink compatibility analysis
- **Element Inspection**: Analyze how individual elements perform on e-ink displays
- **Optimization Suggestions**: Get actionable recommendations for improving e-ink compatibility
- **Cross-tab Testing**: Independent simulation settings per tab for A/B testing

### ⚡ Seamless Workflow Integration

- **One-Click Toggle**: Instantly switch between normal and e-ink simulation modes
- **Keyboard Shortcuts**: Quick access to simulation controls during development
- **Settings Persistence**: Maintains your preferred configurations across browser sessions
- **Export/Import**: Share simulation settings with team members

## Installation

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store
2. Search for "E-ink Developer Extension"
3. Click "Add to Chrome"

### Development Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/williamchong/e-ink-sim.git
   cd e-ink-sim
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the extension:

   ```bash
   npm run build
   ```

4. Load in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

## Quick Start

1. **Enable Simulation**: Click the extension icon and toggle "E-ink Simulation"
2. **Choose Device**: Select a device profile (Kindle, Kobo, or reMarkable)
3. **Test Your Site**: Navigate to your web application and observe the e-ink simulation
4. **Analyze Performance**: Check the performance metrics in the extension popup
5. **Optimize**: Use the debugging tools to identify and fix e-ink compatibility issues

## Device Profiles

### Kindle Paperwhite

- **Refresh Rate**: 5 FPS
- **Display**: High contrast grayscale
- **Best For**: Reading applications, text-heavy content

### Kobo Clara HD

- **Refresh Rate**: 4 FPS
- **Display**: Balanced contrast grayscale
- **Best For**: Mixed content with text and images

### reMarkable 2

- **Refresh Rate**: 8 FPS
- **Display**: Paper-like grayscale with enhanced contrast
- **Best For**: Note-taking applications, interactive content

## Technical Implementation

### Architecture

- **Manifest V3**: Modern Chrome extension architecture
- **TypeScript**: Type-safe development with better IDE support
- **React**: Component-based UI for popup and options pages
- **Content Scripts**: Page-level simulation and API overrides

### E-ink Simulation Techniques

- **CSS Filters**: Grayscale conversion with device-specific contrast
- **requestAnimationFrame Override**: JavaScript animation throttling
- **Scroll Event Handling**: Custom scroll behavior with flash effects
- **Visual Overlays**: Simulated e-ink refresh sequences

### Browser API Overrides

- **Animation Timing**: Throttles JavaScript animations to e-ink appropriate speeds
- **CSS Animations**: Slows down transitions and animations via injected CSS
- **Video Playback**: Reduces video frame rates and applies grayscale filters
- **Scroll Physics**: Modifies scroll behavior to match e-ink refresh limitations

## Development Phases

### Phase 1: Hackathon MVP ✅

- Basic e-ink simulation with grayscale conversion
- Frame rate limiting for JavaScript animations
- Simple popup UI with device profiles
- Core extension infrastructure

### Phase 2: Production Ready (In Progress)

- Advanced visual effects (scroll flash, dithering)
- Comprehensive options interface
- Cross-tab state management
- Enhanced debugging tools

### Phase 3: Advanced Features (Planned)

- DevTools panel integration
- Visual regression testing
- CI/CD integration for automated testing
- Community device profiles

## Contributing

We welcome contributions from the developer community! This extension is built to help developers create better e-ink experiences.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Install dependencies: `npm install`
4. Start development: `npm run dev`
5. Make your changes and test thoroughly
6. Submit a pull request

### Code Standards

- **TypeScript**: All code must be type-safe
- **ESLint**: Follow the configured linting rules
- **Prettier**: Code formatting is enforced
- **Testing**: Include tests for new features

### Areas for Contribution

- Additional device profiles
- Enhanced visual effects
- Performance optimizations
- Documentation improvements
- Bug fixes and stability improvements

## Browser Compatibility

- **Chrome**: Full support (Manifest V3)
- **Edge**: Full support (Chromium-based)
- **Firefox**: Planned (requires Manifest V2 compatibility layer)
- **Safari**: Under consideration

## Limitations

### Current Limitations

- **Cross-origin Content**: Limited control over iframe content from different domains
- **Native Scrolling**: Cannot override touch scrolling physics on mobile devices
- **Video Frame Rate**: Cannot directly control video decoding frame rates
- **Hardware Refresh**: Cannot control actual monitor refresh rates

### Workarounds

- **CSP Restrictions**: Graceful fallbacks for Content Security Policy protected sites
- **API Failures**: Fallback to CSS-only simulation when JavaScript overrides fail
- **Performance**: Optimized for development use, not production deployment

## Performance Considerations

### Resource Usage

- **Memory**: Minimal impact (~5MB additional memory usage)
- **CPU**: Low overhead during simulation (~2-5% CPU usage)
- **Battery**: Negligible impact on laptop battery life

### Optimization Tips

- Disable simulation when not actively testing
- Use device profiles appropriate for your target hardware
- Test on representative content and user flows

## Privacy and Security

- **No Data Collection**: Extension does not collect or transmit user data
- **Local Storage Only**: All settings stored locally using Chrome's storage API
- **No External Requests**: Extension operates entirely offline
- **Open Source**: Full source code available for security review

## Support and Feedback

### Getting Help

- **Documentation**: Check the [Wiki](https://github.com/williamchong/e-ink-sim/wiki) for detailed guides
- **Issues**: Report bugs on [GitHub Issues](https://github.com/williamchong/e-ink-sim/issues)
- **Discussions**: Join the community in [GitHub Discussions](https://github.com/williamchong/e-ink-sim/discussions)

### Feature Requests

We're actively developing new features based on community feedback. Submit feature requests through GitHub Issues with the "enhancement" label.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- E-ink device manufacturers for hardware specifications
- Web developer community for feedback and testing
- Open source contributors who make this project possible

---

**Built with ❤️ for the web developer community**

_Making e-ink web development accessible to everyone, one simulation at a time._
