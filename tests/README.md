# E-ink Simulator Extension Tests

This folder contains all testing resources for the E-ink Simulator Extension.

## Test Structure

```
tests/
├── README.md                    # This file
├── manual/                      # Manual testing resources
│   └── test-page.html          # Local test page with colorful elements
├── scripts/                     # Console testing scripts
│   ├── test-grayscale.js       # Grayscale functionality testing
│   └── verify-task-1.4a.js     # Task 1.4a verification script
└── docs/                        # Testing documentation
    └── test-websites.md         # Website testing instructions
```

### Test Files

#### Manual Testing
- **`manual/test-page.html`** - Local test page with colorful elements to verify grayscale conversion

#### Testing Scripts
- **`scripts/test-grayscale.js`** - Console script for testing grayscale functionality
- **`scripts/verify-task-1.4a.js`** - Verification script for Task 1.4a completion

#### Documentation
- **`docs/test-websites.md`** - Instructions for testing on GitHub, Medium, and Wikipedia

### Test Categories

#### 1. Grayscale Conversion Tests
- Color-to-grayscale transformation
- Device profile differences (Kindle, Kobo, reMarkable)
- CSS filter application
- Image and background conversion

#### 2. Toggle Functionality Tests
- Enable/disable simulation
- Settings persistence
- Cross-tab synchronization
- Popup UI updates

#### 3. Website Compatibility Tests
- GitHub.com functionality
- Medium.com functionality
- Wikipedia.org functionality
- General website compatibility

#### 4. Performance Tests
- Frame rate limiting
- Animation slowdown
- API override verification
- Memory usage monitoring

## How to Run Tests

### 1. Load Extension
```bash
# Build the extension first
npm run build

# Then load dist/ folder in Chrome extensions
```

### 2. Manual Testing
1. Open `tests/manual/test-page.html` in Chrome
2. Enable the extension via popup
3. Verify grayscale conversion works
4. Run console commands from test scripts

### 3. Website Testing
Follow instructions in `tests/docs/test-websites.md` to test on:
- GitHub.com
- Medium.com
- Wikipedia.org

### 4. Console Testing
```javascript
// Load test script in browser console
// Copy contents of scripts/test-grayscale.js or scripts/verify-task-1.4a.js

// Run verification
verifyTask1_4a()

// Test individual features
window.einkSimulator.testGrayscaleConversion()
```

## Test Results

### Task 1.4a: Core Grayscale Conversion ✅
- [x] CSS filters for grayscale transformation using device profiles
- [x] Toggle functionality to enable/disable grayscale mode
- [x] Grayscale conversion tested on sample websites
- [x] Verified working on GitHub, Medium, Wikipedia

## Future Test Plans

### Automated Testing (Phase 2)
- Playwright test suite
- Visual regression testing
- Performance benchmarking
- CI/CD integration

### Advanced Testing (Phase 3)
- Cross-browser compatibility
- CSP restriction handling
- Memory leak detection
- Battery impact analysis