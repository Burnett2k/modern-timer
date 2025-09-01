import { test, expect } from '@playwright/test';

test.describe('Visual regression tests', () => {
  test('timer displays correctly in light mode', async ({ page }) => {
    await page.goto('/');
    
    // Set light mode explicitly
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    
    // Wait for theme to apply
    await page.waitForTimeout(100);
    
    // Take screenshot of the main timer interface
    await expect(page).toHaveScreenshot('timer-light-mode.png');
  });

  test('timer displays correctly in dark mode', async ({ page }) => {
    await page.goto('/');
    
    // Set dark mode explicitly
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    
    // Wait for theme to apply
    await page.waitForTimeout(100);
    
    // Take screenshot of the main timer interface
    await expect(page).toHaveScreenshot('timer-dark-mode.png');
  });

  test('theme toggle controls are visible in both modes', async ({ page }) => {
    await page.goto('/');
    
    // Test light mode controls
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'light');
    });
    await page.waitForTimeout(100);
    await expect(page.locator('.utilities-corner')).toHaveScreenshot('controls-light-mode.png');
    
    // Test dark mode controls
    await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
    });
    await page.waitForTimeout(100);
    await expect(page.locator('.utilities-corner')).toHaveScreenshot('controls-dark-mode.png');
  });
});