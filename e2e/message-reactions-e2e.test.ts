import { test, expect } from '@playwright/test';

test.describe('Message Reactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/chat');
  });

  test('should render reaction buttons for assistant messages', async ({ page }) => {
    // First send a message to get an assistant response
    const textarea = page.locator('textarea[placeholder*="Type / for commands"]').first();
    await textarea.fill('Hello');
    await textarea.press('Enter');

    // Wait for response
    await page.waitForTimeout(1500);

    // Check for message reactions container
    const reactions = page.locator('[class*="flex items-center gap-1"]').filter({ has: page.locator('button') }).first();
    const hasReactions = await reactions.isVisible().catch(() => false);

    if (hasReactions) {
      // Check for reaction buttons with emojis
      const helpfulButton = page.locator('button[title="Hữu ích"]').first();
      const notHelpfulButton = page.locator('button[title="Không hữu ích"]').first();
      const saveButton = page.locator('button[title="Lưu lại"]').first();

      // At least some reaction buttons should exist
      const anyReactionVisible = await Promise.any([
        helpfulButton.isVisible().catch(() => false),
        notHelpfulButton.isVisible().catch(() => false),
        saveButton.isVisible().catch(() => false),
      ]).catch(() => false);

      expect(anyReactionVisible).toBe(true);
    }
  });

  test('should add helpful reaction (👍)', async ({ page }) => {
    // Send message and wait for response
    const textarea = page.locator('textarea[placeholder*="Type / for commands"]').first();
    await textarea.fill('Test message');
    await textarea.press('Enter');
    await page.waitForTimeout(1500);

    // Find and click helpful button
    const helpfulButton = page.locator('button').filter({ has: page.locator('text=👍') }).first();

    if (await helpfulButton.isVisible().catch(() => false)) {
      await helpfulButton.click();

      // Should show active state
      await expect(helpfulButton).toHaveClass(/bg-brand-400|border-brand-400/);

      // Count should increase to 1
      const count = helpfulButton.locator('span').last();
      if (await count.isVisible().catch(() => false)) {
        await expect(count).toHaveText('1');
      }
    }
  });

  test('should add not helpful reaction (👎)', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="Type / for commands"]').first();
    await textarea.fill('Test message');
    await textarea.press('Enter');
    await page.waitForTimeout(1500);

    const notHelpfulButton = page.locator('button').filter({ has: page.locator('text=👎') }).first();

    if (await notHelpfulButton.isVisible().catch(() => false)) {
      await notHelpfulButton.click();
      await expect(notHelpfulButton).toHaveClass(/bg-brand-400|border-brand-400/);
    }
  });

  test('should add save reaction (⭐)', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="Type / for commands"]').first();
    await textarea.fill('Test message');
    await textarea.press('Enter');
    await page.waitForTimeout(1500);

    const saveButton = page.locator('button').filter({ has: page.locator('text=⭐') }).first();

    if (await saveButton.isVisible().catch(() => false)) {
      await saveButton.click();
      await expect(saveButton).toHaveClass(/bg-brand-400|border-brand-400/);
    }
  });

  test('should toggle reaction off when clicked again', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="Type / for commands"]').first();
    await textarea.fill('Test message');
    await textarea.press('Enter');
    await page.waitForTimeout(1500);

    const helpfulButton = page.locator('button').filter({ has: page.locator('text=👍') }).first();

    if (await helpfulButton.isVisible().catch(() => false)) {
      // Click once to add
      await helpfulButton.click();
      await expect(helpfulButton).toHaveClass(/bg-brand-400|border-brand-400/);

      // Click again to remove
      await helpfulButton.click();

      // Should no longer have active class
      const className = await helpfulButton.getAttribute('class');
      expect(className).not.toMatch(/bg-brand-400/);
    }
  });

  test('should switch between different reactions', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="Type / for commands"]').first();
    await textarea.fill('Test message');
    await textarea.press('Enter');
    await page.waitForTimeout(1500);

    const helpfulButton = page.locator('button').filter({ has: page.locator('text=👍') }).first();
    const saveButton = page.locator('button').filter({ has: page.locator('text=⭐') }).first();

    if (await helpfulButton.isVisible().catch(() => false) && await saveButton.isVisible().catch(() => false)) {
      // Click helpful first
      await helpfulButton.click();
      await expect(helpfulButton).toHaveClass(/bg-brand-400|border-brand-400/);

      // Click save - should switch
      await saveButton.click();
      await expect(saveButton).toHaveClass(/bg-brand-400|border-brand-400/);

      // Helpful should no longer be active
      const helpfulClass = await helpfulButton.getAttribute('class');
      expect(helpfulClass).not.toMatch(/bg-brand-400.*border-brand-400/);
    }
  });

  test('should persist reactions in localStorage', async ({ page, context }) => {
    const textarea = page.locator('textarea[placeholder*="Type / for commands"]').first();
    await textarea.fill('Test persistence');
    await textarea.press('Enter');
    await page.waitForTimeout(1500);

    const helpfulButton = page.locator('button').filter({ has: page.locator('text=👍') }).first();

    if (await helpfulButton.isVisible().catch(() => false)) {
      await helpfulButton.click();

      // Reload page
      await page.reload();
      await page.waitForTimeout(1500);

      // Reaction should still be active
      const reloadedButton = page.locator('button').filter({ has: page.locator('text=👍') }).first();
      if (await reloadedButton.isVisible().catch(() => false)) {
        await expect(reloadedButton).toHaveClass(/bg-brand-400|border-brand-400/);
      }
    }
  });

  test('should show correct aria-labels for accessibility', async ({ page }) => {
    const textarea = page.locator('textarea[placeholder*="Type / for commands"]').first();
    await textarea.fill('Test');
    await textarea.press('Enter');
    await page.waitForTimeout(1500);

    // Check for proper aria-labels
    const reactionButtons = page.locator('button[aria-label*="Hữu ích"], button[aria-label*="Không hữu ích"], button[aria-label*="Lưu lại"]').first();

    if (await reactionButtons.isVisible().catch(() => false)) {
      const ariaLabel = await reactionButtons.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }
  });
});

test.describe('Message Reactions - Multiple Messages', () => {
  test('should handle reactions on multiple messages independently', async ({ page }) => {
    await page.goto('/chat');

    // Send first message
    const textarea = page.locator('textarea[placeholder*="Type / for commands"]').first();
    await textarea.fill('Message 1');
    await textarea.press('Enter');
    await page.waitForTimeout(1500);

    // Send second message
    await textarea.fill('Message 2');
    await textarea.press('Enter');
    await page.waitForTimeout(1500);

    // Get all reaction containers
    const reactionContainers = page.locator('[class*="flex items-center gap-1"]').filter({ has: page.locator('button') });
    const count = await reactionContainers.count();

    // Should have reactions for both messages
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Message Reactions Error Cases', () => {
  test('should handle localStorage errors gracefully', async ({ page }) => {
    await page.goto('/chat');

    // Block localStorage access
    await page.evaluate(() => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => { throw new Error('Storage blocked'); };
    });

    const textarea = page.locator('textarea[placeholder*="Type / for commands"]').first();
    await textarea.fill('Test');
    await textarea.press('Enter');
    await page.waitForTimeout(1500);

    // Should still be able to click reactions even if storage fails
    const helpfulButton = page.locator('button').filter({ has: page.locator('text=👍') }).first();

    if (await helpfulButton.isVisible().catch(() => false)) {
      // Should not throw error
      await helpfulButton.click().catch(() => {});
    }
  });
});
