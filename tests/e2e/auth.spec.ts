import { test, expect } from '@playwright/test';

test.describe('Authentication & Core Navigation', () => {
    test('User can sign in as Guest and access dashboard', async ({ page }) => {
        // Navigate to the app root
        await page.goto('/');
        
        // Wait for landing
        const guestBtn = page.locator('button:has-text("Continue as Guest")');
        await expect(guestBtn).toBeVisible({ timeout: 10000 });
        
        // Click guest button
        await guestBtn.click();
        
        // Should redirect to dashboard
        await page.waitForURL('**/dashboard', { timeout: 15000 });
        
        // Confirm TopBar Greeting loaded
        const greeting = page.locator('h1');
        await expect(greeting).toContainText(/Good|صباح|مساء/);
    });

    test('Sidebar renders accessible sections for guest', async ({ page }) => {
        await page.goto('/');
        await page.locator('button:has-text("Continue as Guest")').click();
        await page.waitForURL('**/dashboard');

        // Check for sidebar navigation menu
        const dashboardMenu = page.locator('div:has-text("Dashboard")').first();
        await expect(dashboardMenu).toBeVisible();

        const settingsMenu = page.locator('div:has-text("Settings")').first();
        await expect(settingsMenu).toBeVisible();
    });
});
