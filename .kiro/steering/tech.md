# Technology Stack

## Core Technologies

- **Chrome Extension**: Manifest V3 architecture
- **TypeScript**: Type-safe development with comprehensive type definitions
- **Vite**: Modern build system with hot reload and optimization
- **Node.js**: Development environment and tooling

## Architecture Components

- **Service Worker**: Background processing and cross-tab state management
- **Content Scripts**: Page-level simulation and CSS injection
- **World Scripts**: Main world JavaScript API overrides (bypasses CSP)
- **Popup Interface**: Extension popup with device profiles and controls
- **Options Page**: Comprehensive settings interface

## Code Quality Tools

- **ESLint**: Airbnb TypeScript configuration with Prettier integration
- **Prettier**: Code formatting (2 spaces, single quotes, semicolons)
- **TypeScript**: Strict mode enabled with ES2020 target

## Build System

### Development Commands

```bash
# Development with watch mode
npm run dev

# Production build
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Code formatting
npm run format
npm run format:check

# Clean build directory
npm run clean
```

### Build Configuration

- **Entry Points**: Separate builds for service worker, content scripts, popup, and options
- **Output**: ES2020 modules with source maps
- **Assets**: Automatic copying of HTML, CSS, icons, and manifest
- **Minification**: Enabled for production builds

## File Structure Patterns

- TypeScript files in `src/` with organized subdirectories
- Shared types in `src/types/`
- Build output to `dist/` directory
- Static assets (HTML, CSS, icons) copied during build
- Test files in `tests/` with manual and automated verification

## Chrome Extension APIs

- **Storage API**: Settings persistence with sync across devices
- **Scripting API**: Dynamic script injection with MAIN world access
- **Tabs API**: Cross-tab communication and state management
- **Runtime API**: Message passing between extension components