import { test, expect } from '@playwright/test';

const MOCK_OPTIMIZED_RESULT = `
✅ **Prompt đã tối ưu:**
Implement a login page with email/password validation, loading states, and accessible form labels.

💡 **Command đề xuất:**
/ck:cook

🎯 **Lý do chọn command:**
Đây là tác vụ triển khai end-to-end gồm UI + validation + integration.
`;

test.describe('Prompt Optimizer Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/chat/completions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          choices: [{ message: { content: MOCK_OPTIMIZED_RESULT } }],
        }),
      });
    });

    await page.goto('/guide/prompt-optimizer', { waitUntil: 'networkidle' });
    await page.waitForSelector('[data-testid="prompt-optimizer-input"]', { state: 'visible', timeout: 15000 });
  });

  test('should display optimizer interface', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Prompt Optimizer' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Compare Mode' })).toBeVisible();
    await expect(page.getByTestId('prompt-optimizer-input')).toBeVisible();
  });

  test('should show welcome message', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Prompt Optimizer' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New Session' }).first()).toBeVisible();
  });

  test('should disable submit when input is empty', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: 'Gửi prompt' });
    await expect(submitButton).toBeDisabled();
  });
});
