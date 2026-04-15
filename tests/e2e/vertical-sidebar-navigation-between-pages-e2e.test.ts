import { test, expect } from '@playwright/test';

test.describe('Vertical Navigation Sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/guide/prompt-optimizer');
    await expect(page.locator('aside')).toBeVisible();
  });

  test('should display sidebar links', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Chat' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Hướng dẫn' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Tối ưu prompt' })).toBeVisible();
  });

  test('should navigate to guide page', async ({ page }) => {
    await page.getByRole('link', { name: 'Hướng dẫn' }).click();
    await page.waitForURL('**/guide/**');
    await expect(page.getByRole('heading', { name: /Chọn đúng command cho/i })).toBeVisible();
  });

  test('should navigate to prompt optimizer page', async ({ page }) => {
    await page.getByRole('link', { name: 'Tối ưu prompt' }).click();
    await page.waitForURL('**/guide/prompt-optimizer**');
    await expect(page.getByRole('heading', { name: 'Prompt Optimizer' })).toBeVisible();
  });

  test('should navigate back to chat page', async ({ page }) => {
    await page.getByRole('link', { name: 'Hướng dẫn' }).click();
    await page.waitForURL('**/guide/**');
    await page.getByRole('link', { name: 'Chat' }).click();
    await page.waitForURL('**/chat');
    await expect(page.getByRole('heading', { name: 'ClaudeKit Chat' })).toBeVisible();
  });
});
