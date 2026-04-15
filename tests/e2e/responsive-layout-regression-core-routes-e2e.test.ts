import { expect, test } from '@playwright/test';

const CORE_ROUTES = ['/', '/guide/', '/guide/prompt-optimizer'];
const VIEWPORTS = [
  { width: 375, height: 812, label: 'mobile' },
  { width: 768, height: 1024, label: 'tablet' },
  { width: 1280, height: 720, label: 'desktop' },
];

test.describe('Responsive Layout Regression', () => {
  for (const viewport of VIEWPORTS) {
    test(`no critical horizontal overflow on ${viewport.label}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });

      for (const route of CORE_ROUTES) {
        await page.goto(route);
        await expect(page.locator('main')).toBeVisible();

        const overflow = await page.evaluate(() => {
          const root = document.documentElement;
          return Math.max(0, root.scrollWidth - root.clientWidth);
        });

        expect(
          overflow,
          `Horizontal overflow ${overflow}px exceeds threshold on route ${route} @ ${viewport.width}px`,
        ).toBeLessThanOrEqual(8);
      }
    });
  }
});
