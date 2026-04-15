import { expect, test } from '@playwright/test';

const MOCK_RESPONSE = `✅ **Prompt đã tối ưu:**
Implement authentication with login form validation and clear success criteria.

💡 **Command đề xuất:**
/ck:cook

🎯 **Lý do chọn command:**
Yêu cầu có nhiều phần triển khai nên phù hợp workflow end-to-end.`;

test.describe('Prompt Optimizer Core', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/chat/completions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          choices: [{ message: { content: MOCK_RESPONSE } }],
        }),
      });
    });

    await page.goto('/guide/prompt-optimizer');
    await expect(page.getByRole('heading', { name: 'Prompt Optimizer' })).toBeVisible();
  });

  test('starts with collapsed intro and supports info toggle', async ({ page }) => {
    await expect(page.getByText('Công cụ tối ưu prompt theo ngữ cảnh hội thoại')).toBeHidden();
    await page.getByRole('button', { name: 'Giới thiệu' }).click();
    await expect(page.getByText('Công cụ tối ưu prompt theo ngữ cảnh hội thoại')).toBeVisible();
  });

  test('submits with Ctrl+Enter and renders optimized result', async ({ page }) => {
    const input = page.getByTestId('prompt-optimizer-input');
    await input.fill('tạo trang login có validation');
    await input.press('Control+Enter');

    await expect(page.getByText('Prompt đã tối ưu')).toBeVisible({ timeout: 8000 });
    await expect(page.getByText('/ck:cook')).toBeVisible();
  });

  test('toggles compare mode and shows diff blocks', async ({ page }) => {
    const input = page.getByTestId('prompt-optimizer-input');
    await input.fill('tạo trang login có validation');
    await input.press('Control+Enter');
    await expect(page.getByText('Prompt đã tối ưu')).toBeVisible();

    await page.getByRole('button', { name: 'Compare Mode' }).click();
    await expect(page.getByText('Added')).toBeVisible();
    await expect(page.getByText('Removed')).toBeVisible();
  });
});
