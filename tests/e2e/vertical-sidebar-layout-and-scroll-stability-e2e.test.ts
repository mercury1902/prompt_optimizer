import { expect, test } from '@playwright/test';

const CORE_ROUTES = ['/', '/guide/', '/guide/prompt-optimizer'];

test.describe('Vertical Sidebar Layout And Scroll Stability', () => {
  test('sidebar keeps sticky top position and remains layered above main content', async ({ page }) => {
    await page.goto('/guide/');
    const sidebar = page.locator('aside');
    const main = page.locator('main');

    await expect(sidebar).toBeVisible();
    await expect(main).toBeVisible();

    const initialBox = await sidebar.boundingBox();
    expect(initialBox).not.toBeNull();

    const sidebarStyles = await sidebar.evaluate((node) => {
      const styles = window.getComputedStyle(node);
      return {
        position: styles.position,
        top: styles.top,
        zIndex: Number(styles.zIndex || 0),
      };
    });

    expect(sidebarStyles.position).toBe('sticky');
    expect(sidebarStyles.top).toBe('0px');
    expect(sidebarStyles.zIndex).toBeGreaterThanOrEqual(20);

    await page.evaluate(() => {
      const mainEl = document.querySelector('main');
      if (mainEl instanceof HTMLElement) {
        mainEl.scrollTo({ top: mainEl.scrollHeight, behavior: 'auto' });
      }
    });

    const scrolledBox = await sidebar.boundingBox();
    expect(scrolledBox).not.toBeNull();
    const yDelta = Math.abs((scrolledBox?.y ?? 0) - (initialBox?.y ?? 0));
    expect(yDelta).toBeLessThanOrEqual(1.5);
  });

  test('sidebar and content keep stable gutter without overlap', async ({ page }) => {
    await page.goto('/guide/commands');
    const sidebar = page.locator('aside');
    const main = page.locator('main');

    await expect(sidebar).toBeVisible();
    await expect(main).toBeVisible();

    const layout = await page.evaluate(() => {
      const sidebarEl = document.querySelector('aside');
      const mainEl = document.querySelector('main');

      if (!(sidebarEl instanceof HTMLElement) || !(mainEl instanceof HTMLElement)) {
        return null;
      }

      const sidebarRect = sidebarEl.getBoundingClientRect();
      const mainRect = mainEl.getBoundingClientRect();

      return {
        sidebarRight: sidebarRect.right,
        mainLeft: mainRect.left,
      };
    });

    expect(layout).not.toBeNull();
    const gutter = (layout?.mainLeft ?? 0) - (layout?.sidebarRight ?? 0);
    expect(gutter).toBeGreaterThanOrEqual(8);
  });

  test('sidebar collapses on mobile viewport and remains expanded on tablet/desktop', async ({ page }) => {
    const assertSidebarWidth = async (width: number, height: number) => {
      await page.setViewportSize({ width, height });
      await page.goto('/guide/');

      const sidebarWidth = await page.evaluate(() => {
        const sidebarEl = document.querySelector('aside');
        if (!(sidebarEl instanceof HTMLElement)) {
          return 0;
        }
        return sidebarEl.getBoundingClientRect().width;
      });

      return sidebarWidth;
    };

    const mobileWidth = await assertSidebarWidth(375, 812);
    expect(mobileWidth).toBeLessThan(90);

    const tabletWidth = await assertSidebarWidth(1024, 768);
    expect(tabletWidth).toBeGreaterThanOrEqual(240);
  });

  test('core routes stay below CLS threshold during load and scroll', async ({ page }) => {
    await page.addInitScript(() => {
      (window as Window & { __ckCls?: number }).__ckCls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as Array<{ value?: number; hadRecentInput?: boolean }>) {
          if (!entry.hadRecentInput) {
            (window as Window & { __ckCls?: number }).__ckCls =
              ((window as Window & { __ckCls?: number }).__ckCls ?? 0) + (entry.value ?? 0);
          }
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });

    for (const route of CORE_ROUTES) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      await page.evaluate(() => {
        const mainEl = document.querySelector('main');
        if (mainEl instanceof HTMLElement) {
          mainEl.scrollTo({ top: mainEl.scrollHeight, behavior: 'auto' });
        } else {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'auto' });
        }
      });

      await page.waitForTimeout(100);

      const cls = await page.evaluate(() => (window as Window & { __ckCls?: number }).__ckCls ?? 0);
      expect(cls, `CLS too high for route ${route}`).toBeLessThan(0.1);
    }
  });
});
