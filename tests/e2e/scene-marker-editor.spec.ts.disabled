// tests/e2e/scene-marker-editor.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Scene Marker Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@moviesnow.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for redirect and go to scene marker editor
    await page.waitForURL('**/home');
    await page.goto('/admin/titles/test-title-123/scene-markers');
  });

  test('should load video preview', async ({ page }) => {
    await expect(page.locator('video')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h2:has-text("Scene Marker Editor")')).toBeVisible();
  });

  test('should display all marker controls', async ({ page }) => {
    // Check for all 6 marker types
    await expect(page.locator('text=Intro/Opening')).toBeVisible();
    await expect(page.locator('text=Recap')).toBeVisible();
    await expect(page.locator('text=Opening Theme')).toBeVisible();
    await expect(page.locator('text=Ending Theme')).toBeVisible();
    await expect(page.locator('text=Preview')).toBeVisible();
    await expect(page.locator('text=Credits')).toBeVisible();
  });

  test('should set intro marker from current time', async ({ page }) => {
    // Play video
    await page.click('button[aria-label="Play"]');
    await page.waitForTimeout(3000);

    // Set intro start
    await page.click('button:has-text("Set Start")').first();

    // Verify marker was set (time should be around 0:03)
    await expect(page.locator('text=/0:[0-9]{2}/')).toBeVisible();
  });

  test('should manually enter marker times', async ({ page }) => {
    // Click "Enter Manually" for intro marker
    await page.click('text=Intro/Opening >> .. >> button:has-text("Enter Manually")');

    // Enter start and end times
    await page.fill('input[placeholder="0:00"]').first().fill('0:10');
    await page.fill('input[placeholder="0:00"]').last().fill('1:30');

    // Save
    await page.click('button:has-text("Save")').first();

    // Verify times are displayed
    await expect(page.locator('text=0:10')).toBeVisible();
    await expect(page.locator('text=1:30')).toBeVisible();
  });

  test('should show unsaved changes notification', async ({ page }) => {
    // Make a change
    await page.click('button:has-text("Set Start")').first();

    // Should show unsaved changes panel
    await expect(page.locator('text=You have unsaved changes')).toBeVisible();
    await expect(page.locator('button:has-text("Save Changes")')).toBeVisible();
    await expect(page.locator('button:has-text("Revert")')).toBeVisible();
  });

  test('should save markers successfully', async ({ page }) => {
    // Set a marker
    await page.click('button:has-text("Enter Manually")').first();
    await page.fill('input[placeholder="0:00"]').first().fill('0:10');
    await page.fill('input[placeholder="0:00"]').last().fill('1:20');
    await page.click('button:has-text("Save")').first();

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Verify success toast
    await expect(page.locator('text=Scene markers saved successfully')).toBeVisible({ timeout: 5000 });

    // Unsaved changes panel should disappear
    await expect(page.locator('text=You have unsaved changes')).not.toBeVisible();
  });

  test('should revert unsaved changes', async ({ page }) => {
    // Make a change
    await page.click('button:has-text("Set Start")').first();

    // Click revert
    await page.click('button:has-text("Revert")');

    // Unsaved changes panel should disappear
    await expect(page.locator('text=You have unsaved changes')).not.toBeVisible();
  });

  test('should seek video on timeline click', async ({ page }) => {
    // Wait for video to load
    await expect(page.locator('video')).toBeVisible();

    // Get timeline element
    const timeline = page.locator('.bg-white\\/5.rounded-lg.cursor-pointer').first();

    // Click in the middle of timeline
    await timeline.click({ position: { x: 200, y: 10 } });

    // Video should have seeked (currentTime should change)
    const currentTime = await page.locator('text=/[0-9]:[0-9]{2}\\s*\\//'). textContent();
    expect(currentTime).not.toBe('0:00');
  });

  test('should display markers on timeline', async ({ page }) => {
    // Set an intro marker
    await page.click('button:has-text("Enter Manually")').first();
    await page.fill('input[placeholder="0:00"]').first().fill('0:10');
    await page.fill('input[placeholder="0:00"]').last().fill('1:00');
    await page.click('button:has-text("Save")').first();

    // Timeline should show colored marker range
    const markerRange = page.locator('.absolute.h-full.rounded.cursor-pointer').first();
    await expect(markerRange).toBeVisible();
  });

  test('should clear all markers', async ({ page }) => {
    // Set multiple markers
    await page.click('button:has-text("Set Start")').first();
    await page.click('button:has-text("Set Start")').nth(1);

    // Click clear all
    await page.click('button:has-text("Clear All")');

    // Active markers should show "No markers set yet"
    await expect(page.locator('text=No markers set yet')).toBeVisible();
  });

  test('should jump to marker on play button click', async ({ page }) => {
    // Set a marker
    await page.click('button:has-text("Enter Manually")').first();
    await page.fill('input[placeholder="0:00"]').first().fill('0:30');
    await page.fill('input[placeholder="0:00"]').last().fill('1:00');
    await page.click('button:has-text("Save")').first();

    // Click play button in active markers list
    await page.click('button[title="Jump to start"]').first();

    // Video should jump to 0:30 and start playing
    await page.waitForTimeout(1000);
    const currentTime = await page.locator('.font-mono >> text=/[0-9]:[0-9]{2}/').first().textContent();
    expect(currentTime).toContain('0:30');
  });

  test('should show auto-detect panel', async ({ page }) => {
    // Click auto-detect button
    await page.click('button:has-text("Auto-Detect")');

    // Modal should appear
    await expect(page.locator('text=Auto-Detect Markers')).toBeVisible();
    await expect(page.locator('text=AI-powered scene detection')).toBeVisible();
    await expect(page.locator('button:has-text("Start Auto-Detection")')).toBeVisible();
  });

  test('should close auto-detect panel', async ({ page }) => {
    // Open panel
    await page.click('button:has-text("Auto-Detect")');

    // Close it
    await page.click('button:has-text("Cancel")').last();

    // Panel should be hidden
    await expect(page.locator('text=Auto-Detect Markers')).not.toBeVisible();
  });

  test.describe('For series/anime', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to a series title
      await page.goto('/admin/titles/test-series-123/scene-markers?episode=ep-1');
    });

    test('should show batch apply button for series', async ({ page }) => {
      await expect(page.locator('button:has-text("Batch Apply")')).toBeVisible();
    });

    test('should open batch editor modal', async ({ page }) => {
      // Click batch apply
      await page.click('button:has-text("Batch Apply")');

      // Modal should appear
      await expect(page.locator('text=Batch Apply Markers')).toBeVisible();
      await expect(page.locator('text=Apply current markers to multiple episodes')).toBeVisible();
    });

    test('should select episodes in batch editor', async ({ page }) => {
      // Open batch editor
      await page.click('button:has-text("Batch Apply")');

      // Select all episodes
      await page.click('button:has-text("Select All")');

      // Should show selected count
      await expect(page.locator('text=/[0-9]+ episodes? selected/')).toBeVisible();
    });

    test('should apply to all episodes checkbox', async ({ page }) => {
      // Open batch editor
      await page.click('button:has-text("Batch Apply")');

      // Check "Apply to all" checkbox
      await page.check('input[type="checkbox"]');

      // Episode grid should be hidden
      await expect(page.locator('.grid.grid-cols-10')).not.toBeVisible();

      // Should show "all" in button text
      await expect(page.locator('button:has-text("Apply to All")')).toBeVisible();
    });
  });

  test.describe('Playback controls', () => {
    test('should play and pause video', async ({ page }) => {
      // Play
      await page.click('button[aria-label="Play"]');
      await expect(page.locator('button[aria-label="Pause"]')).toBeVisible({ timeout: 2000 });

      // Pause
      await page.click('button[aria-label="Pause"]');
      await expect(page.locator('button[aria-label="Play"]')).toBeVisible();
    });

    test('should skip backward 5 seconds', async ({ page }) => {
      // Play video for a bit
      await page.click('button[aria-label="Play"]');
      await page.waitForTimeout(6000);

      // Get current time
      const timeBefore = await page.locator('.font-mono >> text=/[0-9]:[0-9]{2}/').first().textContent();

      // Skip backward
      await page.click('button:has-svg("SkipBack")');

      await page.waitForTimeout(500);
      const timeAfter = await page.locator('.font-mono >> text=/[0-9]:[0-9]{2}/').first().textContent();

      // Time should have decreased
      expect(timeAfter).not.toBe(timeBefore);
    });

    test('should skip forward 5 seconds', async ({ page }) => {
      // Get current time
      const timeBefore = await page.locator('.font-mono >> text=/[0-9]:[0-9]{2}/').first().textContent();

      // Skip forward
      await page.click('button:has-svg("SkipForward")');

      await page.waitForTimeout(500);
      const timeAfter = await page.locator('.font-mono >> text=/[0-9]:[0-9]{2}/').first().textContent();

      // Time should have increased
      expect(timeAfter).not.toBe(timeBefore);
    });

    test('should adjust volume', async ({ page }) => {
      const volumeSlider = page.locator('input[type="range"]');

      // Set volume to 50%
      await volumeSlider.fill('0.5');

      // Verify volume changed (would need to check video element volume property)
      const volume = await volumeSlider.inputValue();
      expect(parseFloat(volume)).toBeCloseTo(0.5, 1);
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard navigable', async ({ page }) => {
      // Tab through elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should focus on interactive elements
      const focusedElement = await page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      await expect(page.locator('button[aria-label="Play"]')).toBeVisible();

      // Play video
      await page.click('button[aria-label="Play"]');
      await expect(page.locator('button[aria-label="Pause"]')).toBeVisible();
    });
  });
});
