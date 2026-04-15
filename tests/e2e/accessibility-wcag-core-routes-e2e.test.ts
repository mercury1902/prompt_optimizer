import { expect, test } from '@playwright/test';

const CORE_ROUTES = ['/', '/guide/', '/guide/prompt-optimizer'];

test.describe('WCAG 2.1 Smoke Checks', () => {
  test('core routes expose lang and page heading', async ({ page }) => {
    for (const route of CORE_ROUTES) {
      await page.goto(route);
      await expect(page.locator('h1').first()).toBeVisible();

      const lang = await page.evaluate(() => document.documentElement.lang || '');
      expect(lang, `Missing html[lang] on route: ${route}`).toMatch(/^(vi|en)$/);
    }
  });

  test('icon-only controls have accessible names', async ({ page }) => {
    for (const route of CORE_ROUTES) {
      await page.goto(route);

      const unnamedControls = await page.evaluate(() => {
        const selectors = 'button, a, [role="button"]';
        const controls = Array.from(document.querySelectorAll<HTMLElement>(selectors));

        const isIconOnly = (el: HTMLElement) => {
          const text = (el.textContent || '').trim();
          if (text.length > 0) return false;
          return el.querySelector('svg') !== null;
        };

        return controls
          .filter((el) => isIconOnly(el))
          .filter((el) => {
            const ariaLabel = el.getAttribute('aria-label');
            const ariaLabelledBy = el.getAttribute('aria-labelledby');
            const title = el.getAttribute('title');
            return !ariaLabel && !ariaLabelledBy && !title;
          })
          .map((el) => el.outerHTML.slice(0, 180));
      });

      expect(
        unnamedControls,
        `Found icon-only controls without accessible name on route: ${route}`,
      ).toEqual([]);
    }
  });
});
