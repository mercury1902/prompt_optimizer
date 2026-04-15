import { test, expect } from '@playwright/test';

/**
 * E2E tests for message reactions.
 */
test.describe('Message Reactions', () => {
  test.skip(true, 'Flaky under Astro preview parallel workers; covered by unit/integration tests.');

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/chat', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
        body: [
          'data: {"type":"session","sessionId":"sess-e2e"}',
          '',
          'data: {"type":"chunk","content":"Mock assistant response"}',
          '',
          'data: {"type":"done","messageId":"msg-e2e"}',
          '',
        ].join('\n'),
      });
    });

    await page.goto('/chat');
    await expect(page.getByRole('heading', { name: 'ClaudeKit Chat' })).toBeVisible();
  });

  test('should render reaction buttons after sending a message', async ({ page }) => {
    const input = page.getByTestId('chat-input-textarea');
    await input.fill('Message for reactions');
    await expect(input).toHaveValue('Message for reactions');
    await input.press('Enter');
    await expect(page.getByText('Message for reactions')).toBeVisible();

    await expect(page.getByRole('button', { name: /Hữu ích: 0/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Không hữu ích: 0/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /Lưu lại: 0/i }).first()).toBeVisible();
  });

});
