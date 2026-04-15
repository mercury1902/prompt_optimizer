import { expect, test } from '@playwright/test';

test.describe('Keyboard Navigation Smoke', () => {
  test('home route keeps sidebar links keyboard-focusable', async ({ page }) => {
    await page.goto('/');

    const firstSidebarLink = page.locator('aside a[href]').first();
    await firstSidebarLink.focus();
    await expect(firstSidebarLink).toBeFocused();
  });

  test('prompt optimizer input and action controls are keyboard-focusable', async ({ page }) => {
    await page.goto('/guide/prompt-optimizer');

    const input = page.getByTestId('prompt-optimizer-input');
    const submit = page.getByRole('button', { name: 'Gửi prompt' });
    const newSession = page.getByTestId('prompt-optimizer-reset');

    await input.focus();
    await expect(input).toBeFocused();

    await input.fill('test');
    await submit.focus();
    await expect(submit).toBeFocused();

    await newSession.focus();
    await expect(newSession).toBeFocused();
  });
});
