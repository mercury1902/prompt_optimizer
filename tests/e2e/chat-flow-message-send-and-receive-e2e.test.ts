import { test, expect } from '@playwright/test';

/**
 * E2E smoke tests for chat flow.
 * Keep assertions stable against UI copy/layout changes.
 */
test.describe('Chat Flow', () => {
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

  test('should display core chat interface', async ({ page }) => {
    const status = page
      .getByText('Trợ lý AI đang hoạt động')
      .or(page.getByText('Đang kết nối...'))
      .or(page.getByText('Lỗi kết nối API'));

    await expect(status.first()).toBeVisible();
    await expect(page.getByTestId('chat-input-textarea')).toBeVisible();
    await expect(page.getByTestId('chat-submit-button')).toBeVisible();
  });

  test('should keep submit disabled for empty input', async ({ page }) => {
    const sendButton = page.getByTestId('chat-submit-button');
    await expect(sendButton).toBeDisabled();
  });

  test('should support multiline input with Shift+Enter', async ({ page }) => {
    const input = page.getByTestId('chat-input-textarea');
    await input.click();
    await input.type('First line');
    await input.press('Shift+Enter');
    await input.type('Second line');

    await expect(input).toHaveValue(/Second line/);
  });

});
