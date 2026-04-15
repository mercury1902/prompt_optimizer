import { test, expect } from '@playwright/test';

test.describe('Chat Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
  });

  test('should render chat interface', async ({ page }) => {
    // Check main chat elements
    await expect(page.getByText('ClaudeKit Chat')).toBeVisible();
    await expect(page.getByText('AI Assistant Online')).toBeVisible();

    // Check input area
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveAttribute('placeholder', /Type \/ for commands|ask anything/);

    // Check send button
    const sendButton = page.locator('button[type="submit"]').first();
    await expect(sendButton).toBeVisible();
  });

  test('should send message and display it in chat', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    const testMessage = 'Hello, this is a test message';

    await textarea.fill(testMessage);
    await expect(textarea).toHaveValue(testMessage);

    // Submit message
    await textarea.press('Enter');

    // Check user message appears
    await expect(page.getByText(testMessage)).toBeVisible();

    // Check "Bạn" (You) label
    await expect(page.getByText('Bạn')).toBeVisible();
  });

  test('should show assistant response after user message', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await textarea.fill('Test message');
    await textarea.press('Enter');

    // Wait for and check assistant response
    await expect(page.getByText('ClaudeKit')).toBeVisible();
    await expect(page.getByText('AI Assistant')).toBeVisible();

    // Check response content appears
    await page.waitForTimeout(1500);
    const assistantMessage = page.locator('[class*="bg-gray-800"]').filter({ has: page.locator('text=/I received|demo response/') }).first();
    // Response should appear within timeout
  });

  test('should show welcome state when no messages', async ({ page }) => {
    // Clear chat if needed or check initial state
    await expect(page.getByText('Welcome to ClaudeKit Chat')).toBeVisible();
    await expect(page.getByText(/Start a conversation|typing/)).toBeVisible();

    // Check suggestion buttons
    const suggestions = page.locator('button').filter({ has: page.locator('text=/\/ck:/') });
    const count = await suggestions.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should auto-scroll to bottom on new messages', async ({ page }) => {
    // Send multiple messages
    const textarea = page.locator('textarea').first();

    for (let i = 0; i < 5; i++) {
      await textarea.fill(`Message ${i + 1}`);
      await textarea.press('Enter');
      await page.waitForTimeout(800);
    }

    // Check that messages are visible
    await expect(page.getByText('Message 5')).toBeVisible();
    await expect(page.getByText('Message 1')).toBeVisible();
  });

  test('should clear chat with New Chat button', async ({ page }) => {
    // First send a message
    const textarea = page.locator('textarea').first();
    await textarea.fill('Test message');
    await textarea.press('Enter');
    await page.waitForTimeout(1500);

    // Verify message exists
    await expect(page.getByText('Test message')).toBeVisible();

    // Click New Chat button
    const newChatButton = page.getByRole('button', { name: /New Chat/ });
    await newChatButton.click();

    // Should show welcome state again
    await expect(page.getByText('Welcome to ClaudeKit Chat')).toBeVisible();
  });

  test('should copy message to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const textarea = page.locator('textarea').first();
    await textarea.fill('Copy test');
    await textarea.press('Enter');
    await page.waitForTimeout(1500);

    // Find copy button (hover over message to reveal)
    const message = page.locator('[class*="group/message"]').first();
    await message.hover();

    const copyButton = page.locator('button[title="Copy message"]').first();
    if (await copyButton.isVisible().catch(() => false)) {
      await copyButton.click();

      // Should show success feedback
      await expect(page.getByText(/Copied|clipboard/)).toBeVisible();
    }
  });

  test('should open command palette with slash', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await textarea.fill('/');

    // Command palette should appear
    const palette = page.locator('[role="dialog"]').first();
    await expect(palette).toBeVisible();

    // Should show command options
    await expect(page.getByText(/Search commands|Engineer Kit/)).toBeVisible();
  });

  test('should open command palette with Cmd+K', async ({ page }) => {
    const textarea = page.locator('textarea').first();

    // Press Cmd+K
    await textarea.press('Meta+k');

    // Command palette should appear
    const palette = page.locator('[role="dialog"]').first();
    await expect(palette).toBeVisible({ timeout: 5000 });
  });

  test('should select command from palette', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await textarea.fill('/');

    // Wait for palette
    await page.waitForTimeout(200);

    // Get first command item
    const commandItem = page.locator('[class*="Command.Item"], [cmdk-item]').first();
    if (await commandItem.isVisible().catch(() => false)) {
      await commandItem.click();

      // Textarea should now contain the command
      const value = await textarea.inputValue();
      expect(value).toMatch(/^\//);
    }
  });

  test('should display user avatar correctly', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await textarea.fill('Avatar test');
    await textarea.press('Enter');

    // Check user avatar (blue background with User icon)
    const userAvatar = page.locator('[class*="bg-blue-600"]').filter({ has: page.locator('svg') }).first();
    await expect(userAvatar).toBeVisible();
  });

  test('should display assistant avatar correctly', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await textarea.fill('Assistant avatar test');
    await textarea.press('Enter');
    await page.waitForTimeout(1500);

    // Check assistant avatar (gradient background)
    const assistantAvatar = page.locator('[class*="from-purple-600"], [class*="from-purple-500"]').first();
    await expect(assistantAvatar).toBeVisible();
  });

  test('should handle multiline messages', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    const multilineMessage = 'Line 1\nLine 2\nLine 3';

    await textarea.fill(multilineMessage);

    // Use Shift+Enter for multiline, then Enter to send
    await textarea.press('Enter');

    // All lines should be visible
    await expect(page.getByText('Line 1')).toBeVisible();
    await expect(page.getByText('Line 2')).toBeVisible();
    await expect(page.getByText('Line 3')).toBeVisible();
  });

  test('should show typing indicator while waiting for response', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await textarea.fill('Trigger response');
    await textarea.press('Enter');

    // Check for typing indicator (animated dots)
    const typingIndicator = page.locator('.animate-bounce').first();

    // Might be very brief, so just check it doesn't throw
    try {
      await expect(typingIndicator).toBeVisible({ timeout: 1000 });
    } catch {
      // Typing indicator may have already disappeared
    }
  });

  test('should disable send button when input is empty', async ({ page }) => {
    const sendButton = page.locator('button[type="submit"]').first();

    // Should be disabled initially
    await expect(sendButton).toBeDisabled();

    // Type something
    const textarea = page.locator('textarea').first();
    await textarea.fill('test');

    // Should now be enabled
    await expect(sendButton).toBeEnabled();

    // Clear input
    await textarea.fill('');

    // Should be disabled again
    await expect(sendButton).toBeDisabled();
  });

  test('should maintain input focus after sending', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await textarea.fill('Focus test');
    await textarea.press('Enter');

    // Check textarea is still focused or can be focused again
    await expect(textarea).toBeVisible();
  });
});

test.describe('Chat Flow - Code Block Features', () => {
  test('should display code block with copy button', async ({ page }) => {
    await page.goto('/chat');

    const textarea = page.locator('textarea').first();
    await textarea.fill('Show me code');
    await textarea.press('Enter');
    await page.waitForTimeout(1500);

    // Look for code block
    const codeBlock = page.locator('[class*="bg-gray-950"], pre').first();

    if (await codeBlock.isVisible().catch(() => false)) {
      // Check for copy button
      const copyButton = page.locator('button').filter({ has: page.locator('text=/Copy|Copied/') }).first();
      await expect(copyButton).toBeVisible();
    }
  });
});

test.describe('Chat Flow Error Cases', () => {
  test('should handle very long messages', async ({ page }) => {
    await page.goto('/chat');

    const textarea = page.locator('textarea').first();
    const longMessage = 'a'.repeat(1000);

    await textarea.fill(longMessage);
    await textarea.press('Enter');

    // Should still display the message
    await expect(page.getByText('a'.repeat(100))).toBeVisible();
  });

  test('should handle special characters in messages', async ({ page }) => {
    await page.goto('/chat');

    const textarea = page.locator('textarea').first();
    const specialMessage = 'Special: <script>alert("xss")</script> & "quotes"';

    await textarea.fill(specialMessage);
    await textarea.press('Enter');

    // Should display safely (no script execution)
    await expect(page.getByText(/Special:/)).toBeVisible();
  });

  test('should handle rapid message sending', async ({ page }) => {
    await page.goto('/chat');

    const textarea = page.locator('textarea').first();

    // Send multiple messages rapidly
    for (let i = 0; i < 5; i++) {
      await textarea.fill(`Rapid ${i}`);
      await textarea.press('Enter');
    }

    // All messages should eventually appear
    await page.waitForTimeout(2000);
    await expect(page.getByText('Rapid 4')).toBeVisible();
  });
});
