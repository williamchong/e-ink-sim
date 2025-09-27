# E-ink Extension Grayscale Test Instructions

## Task 1.4a Verification: Core Grayscale Conversion

### Test Requirements
- ✅ Apply CSS filters for grayscale transformation using device profiles
- ✅ Create toggle functionality to enable/disable grayscale mode
- ✅ Test grayscale conversion on sample websites
- ✅ **Done when**: Grayscale filter works on GitHub, Medium, Wikipedia

### Manual Testing Steps

#### 1. Load Extension
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist` folder
4. Verify the extension icon appears in the toolbar

#### 2. Test Local Test Page
1. Open `test-page.html` in Chrome
2. Click the extension icon to open popup
3. Click "Enable Simulation"
4. Verify:
   - Colored boxes become grayscale
   - Page background becomes grayscale
   - Status shows "Active (Kindle)" or similar
   - Console shows extension messages

#### 3. Test Target Websites

##### GitHub (github.com)
1. Navigate to https://github.com
2. Enable e-ink simulation via extension popup
3. **Expected Results:**
   - Green/red/blue UI elements become grayscale
   - Code syntax highlighting becomes grayscale
   - Avatar images become grayscale
   - Overall page maintains readability

##### Medium (medium.com)
1. Navigate to https://medium.com
2. Enable e-ink simulation via extension popup
3. **Expected Results:**
   - Article images become grayscale
   - Colored buttons and links become grayscale
   - Text remains highly readable
   - Layout stays intact

##### Wikipedia (wikipedia.org)
1. Navigate to https://en.wikipedia.org
2. Enable e-ink simulation via extension popup
3. **Expected Results:**
   - Images and graphics become grayscale
   - Blue links become underlined and bold
   - Infobox colors become grayscale
   - Text readability is maintained

#### 4. Test Device Profiles
For each target website:
1. Test "Kindle Paperwhite" profile (default)
2. Switch to "Kobo Clara HD" profile
3. Switch to "reMarkable 2" profile
4. Verify different contrast levels are applied

#### 5. Test Toggle Functionality
1. Enable simulation on any website
2. Disable simulation via popup
3. Verify page returns to original colors
4. Re-enable simulation
5. Verify grayscale is reapplied

### Console Testing Commands

Open browser console on any test page and run:

```javascript
// Check if extension is loaded
window.einkSimulator !== undefined

// Test grayscale conversion status
window.einkSimulator.testGrayscaleConversion()

// Toggle grayscale for testing
window.einkSimulator.toggleGrayscale()

// Check CSS injection
window.einkSimulator.testCSSInjection()
```

### Success Criteria

✅ **Task Complete When:**
1. Extension loads without errors
2. Popup toggle works correctly
3. Grayscale conversion applies to all page elements
4. GitHub, Medium, and Wikipedia all display in grayscale when enabled
5. Different device profiles show different contrast levels
6. Toggle functionality works reliably
7. Console debugging methods work
8. No JavaScript errors in console

### Troubleshooting

If grayscale doesn't work:
1. Check browser console for errors
2. Verify extension is enabled in chrome://extensions/
3. Try refreshing the page after enabling simulation
4. Check if CSP (Content Security Policy) is blocking the extension

### Device Profile Differences

- **Kindle Paperwhite**: `grayscale(1) contrast(1.2)` - Standard e-ink
- **Kobo Clara HD**: `grayscale(1) contrast(1.1)` - Slightly softer
- **reMarkable 2**: `grayscale(1) contrast(1.3)` - Higher contrast for writing