# Scene Marker Editor - Testing Setup & Execution Guide

## ✅ Implementation Status

### Completed Files

**Types:**
- ✅ `src/types/sceneMarkers.ts` - Complete TypeScript type definitions

**Hooks:**
- ✅ `src/hooks/useSceneMarkers.ts` - Scene markers CRUD with React Query
- ✅ `src/hooks/useVideoPlayer.ts` - Video player state management

**Components (Ready to implement from guide):**
- 📄 `src/components/admin/SceneMarkerEditor.tsx` (Line 438-728 in guide)
- 📄 `src/components/admin/SceneMarkerTimeline.tsx` (Line 733-979 in guide)
- 📄 `src/components/admin/MarkerHandle.tsx` (Line 982-1193 in guide)
- 📄 `src/components/admin/VideoPreview.tsx` (Line 1196-1246 in guide)
- 📄 `src/components/admin/MarkerList.tsx` (Line 1251-1334 in guide)
- 📄 `src/components/admin/BatchMarkerEditor.tsx` (Line 1337-1546 in guide)
- 📄 `src/components/admin/AutoDetectPanel.tsx` (Line 1549-1648 in guide)

**Tests:**
- ✅ `tests/e2e/scene-marker-editor.spec.ts` - 25 E2E tests with Playwright
- ✅ `tests/unit/useSceneMarkers.test.ts` - 9 unit tests with Vitest

---

## 📦 Step 1: Install Testing Dependencies

Run these commands in the `Frontend` directory:

```bash
cd Frontend

# Install Playwright for E2E testing
npm install -D @playwright/test@latest

# Install Vitest and Testing Library for unit tests
npm install -D vitest@latest @vitest/ui@latest
npm install -D @testing-library/react@latest @testing-library/react-hooks@latest
npm install -D @testing-library/user-event@latest
npm install -D @testing-library/jest-dom@latest
npm install -D jsdom@latest

# Install Playwright browsers
npx playwright install
```

---

## ⚙️ Step 2: Configure Testing

### 2.1 Create Vitest Config

Create `vitest.config.ts` in the Frontend directory:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.{js,ts}',
        '**/*.d.ts',
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### 2.2 Create Test Setup File

Create `tests/setup.ts`:

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

### 2.3 Create Playwright Config

Create `playwright.config.ts`:

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 2.4 Update package.json

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug"
  }
}
```

---

## 🎬 Step 3: Copy Component Code from Guide

The component code is in `IMPLEMENTATION_GUIDES/01-ADMIN-FEATURES/09-scene-marker-editor.md`.

For each component file created, copy the complete code from the guide:

1. **SceneMarkerEditor.tsx** (lines 438-728)
2. **SceneMarkerTimeline.tsx** (lines 733-979)
3. **MarkerHandle.tsx** (lines 982-1193)
4. **VideoPreview.tsx** (lines 1196-1246)
5. **MarkerList.tsx** (lines 1251-1334)
6. **BatchMarkerEditor.tsx** (lines 1337-1546)
7. **AutoDetectPanel.tsx** (lines 1549-1648)

---

## 🧪 Step 4: Run Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm test

# Run with UI
npm run test:ui

# Run with coverage report
npm run test:coverage

# Run specific test file
npx vitest tests/unit/useSceneMarkers.test.ts
```

**Expected Results:**
- ✅ 9 unit tests should pass
- ✅ Coverage report shows hook functionality
- ✅ All CRUD operations tested
- ✅ Auto-detect functionality tested

### E2E Tests (Playwright)

```bash
# Start dev server first (in separate terminal)
npm run dev

# Run E2E tests
npm run test:e2e

# Run with UI mode (visual debugging)
npm run test:e2e:ui

# Run specific browser
npx playwright test --project=chromium

# Debug mode
npm run test:e2e:debug
```

**Expected Results:**
- ✅ 25 E2E tests across 4 test suites
- ✅ Video player loads correctly
- ✅ Markers can be set and saved
- ✅ Timeline interaction works
- ✅ Batch operations for series
- ✅ Playback controls functional
- ✅ Accessibility checks pass

---

## 📊 Test Coverage Breakdown

### Unit Tests (`useSceneMarkers.test.ts`)

1. ✅ **Fetch markers on mount** - Loads markers from API
2. ✅ **Fetch episode markers** - Loads episode-specific markers
3. ✅ **Update marker locally** - Updates state with unsaved changes
4. ✅ **Clear specific marker** - Removes individual marker
5. ✅ **Clear all markers** - Resets all markers
6. ✅ **Save new markers** - Creates new marker via POST
7. ✅ **Update existing markers** - Updates via PATCH
8. ✅ **Revert unsaved changes** - Rolls back local changes
9. ✅ **Auto-detect markers** - AI-powered detection

### E2E Tests (`scene-marker-editor.spec.ts`)

**Core Functionality (10 tests):**
- Video preview loading
- Marker controls display
- Set marker from current time
- Manual time entry
- Unsaved changes notification
- Save markers successfully
- Revert unsaved changes
- Seek video on timeline
- Display markers on timeline
- Clear all markers

**Advanced Features (5 tests):**
- Jump to marker playback
- Auto-detect panel display
- Close auto-detect panel
- Batch apply for series
- Episode selection in batch

**Playback Controls (4 tests):**
- Play/pause toggle
- Skip backward
- Skip forward
- Volume adjustment

**Accessibility (2 tests):**
- Keyboard navigation
- ARIA labels

**Series-Specific (4 tests):**
- Batch apply button visibility
- Batch editor modal
- Episode selection
- Apply to all checkbox

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@testing-library/react'"
**Solution:** Run `npm install -D @testing-library/react`

### Issue: "Playwright browser not found"
**Solution:** Run `npx playwright install`

### Issue: "Port 3000 already in use"
**Solution:**
- Stop dev server: `Ctrl+C`
- Kill process: `taskkill /F /IM node.exe` (Windows)
- Or change port in `playwright.config.ts`

### Issue: Tests timeout
**Solution:**
- Increase timeout in test file
- Check if backend is running
- Verify API endpoints are accessible

### Issue: Video won't load in tests
**Solution:**
- Use mock video URL in test setup
- Check network requests in Playwright trace
- Ensure CORS is configured for test environment

---

## 📈 Performance Benchmarks

**Target Metrics:**

| Metric | Target | Current |
|--------|--------|---------|
| Unit test execution | < 2s | TBD |
| E2E test execution | < 60s | TBD |
| Code coverage | > 80% | TBD |
| Visual regression | 0 failures | TBD |

---

## ✨ Next Steps After Testing

1. **Manual Testing**
   - Test with real video files
   - Verify auto-detect accuracy
   - Test batch operations with large series (50+ episodes)
   - Cross-browser compatibility

2. **Performance Testing**
   - Load test with 100+ simultaneous editors
   - Test with 4K video files
   - Measure timeline rendering performance

3. **Integration Testing**
   - Test backend API integration
   - Verify WebSocket connections
   - Test S3/CloudFront video delivery

4. **User Acceptance Testing**
   - Get feedback from content admins
   - Measure time savings vs manual entry
   - Identify UX improvements

---

## 🎯 Success Criteria

**Implementation is ready for production when:**

- [x] All types and hooks implemented
- [ ] All 7 components implemented from guide
- [ ] All 9 unit tests passing
- [ ] All 25 E2E tests passing
- [ ] Code coverage > 80%
- [ ] No TypeScript errors
- [ ] No console errors/warnings
- [ ] Accessibility audit passes
- [ ] Cross-browser testing complete
- [ ] Performance benchmarks met

---

## 📝 Quick Start Commands

```bash
# 1. Install everything
npm install -D @playwright/test vitest @testing-library/react jsdom
npx playwright install

# 2. Run tests
npm test                    # Unit tests
npm run test:e2e           # E2E tests

# 3. View results
npm run test:ui            # Vitest UI
npm run test:e2e:ui        # Playwright UI
```

---

**Created:** December 2024
**Status:** Ready for testing after component implementation
**Priority:** ⭐⭐⭐ HIGH
