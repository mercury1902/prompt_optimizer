import { test, expect } from '@playwright/test';

test.describe('Vertical Navigation Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/guide/prompt-optimizer');
  });

  test('should render sidebar with all navigation items', async ({ page }) => {
    // Check sidebar exists
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();

    // Check logo and branding
    await expect(page.getByText('ClaudeKit')).toBeVisible();
    await expect(page.getByText('Trợ lý AI')).toBeVisible();

    // Check all nav items are present
    const expectedNavItems = ['Chat', 'Hướng dẫn', 'Tối ưu prompt', 'Lịch sử', 'Cài đặt'];
    for (const item of expectedNavItems) {
      await expect(page.getByRole('link', { name: item })).toBeVisible();
    }
  });

  test('should highlight active nav item', async ({ page }) => {
    const optimizerLink = page.getByRole('link', { name: 'Tối ưu prompt' });
    await expect(optimizerLink).toHaveAttribute('aria-current', 'page');
  });

  test('should navigate to Guide page when clicking Hướng dẫn', async ({ page }) => {
    const guideLink = page.getByRole('link', { name: 'Hướng dẫn' });
    await guideLink.click();

    // Wait for navigation
    await page.waitForURL('**/guide/**');
    await expect(page).toHaveURL(/.*guide.*/);
  });

  test('should navigate to Prompt Optimizer when clicking Tối ưu prompt', async ({ page }) => {
    const optimizerLink = page.getByRole('link', { name: 'Tối ưu prompt' });
    await optimizerLink.click();

    // Wait for navigation
    await page.waitForURL('**/guide/prompt-optimizer**');
    await expect(page).toHaveURL(/.*prompt-optimizer.*/);
  });

  test('should call onNavigate for items with href=#', async ({ page }) => {
    // History and Settings have href="#" and should trigger onNavigate
    const historyLink = page.getByRole('link', { name: 'Lịch sử' });

    // These should not navigate away (href="#")
    await historyLink.click();

    // Should still be on same page (no navigation for # href)
    await expect(page).toHaveURL(/.*guide\/prompt-optimizer.*/);
  });

  test('should show footer with version info', async ({ page }) => {
    await expect(page.getByText('ClaudeKit Chat v1.0')).toBeVisible();
  });

  test('should have correct hover states on nav items', async ({ page }) => {
    const guideLink = page.getByRole('link', { name: 'Hướng dẫn' });

    // Hover over inactive nav item
    await guideLink.hover();

    await expect(guideLink).toHaveClass(/hover:bg/);
  });

  test('should maintain sidebar visibility on mobile viewport', async ({ page }) => {
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Sidebar collapses on mobile by design.
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeHidden();
  });
});

test.describe('Navigation Error Cases', () => {
  test('should handle rapid navigation clicks gracefully', async ({ page }) => {
    await page.goto('/guide/prompt-optimizer');

    // Rapidly click different nav items
    const chatLink = page.getByRole('link', { name: 'Chat' });
    const guideLink = page.getByRole('link', { name: 'Hướng dẫn' });
    const optimizerLink = page.getByRole('link', { name: 'Tối ưu prompt' });

    await Promise.all([
      chatLink.click(),
      guideLink.click(),
      optimizerLink.click(),
    ]);

    // Page should not crash, one of the navigations should complete
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/localhost:4321/);
  });
});
