import AxeBuilder from '@axe-core/playwright';
import type { Page, TestInfo } from '@playwright/test';
import { expect, test } from './support/fixtures';

/** WCAG 2.0, 2.1 and 2.2 at levels A and AA, plus axe best practices. */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

async function expectNoViolations(page: Page, testInfo: TestInfo, label: string) {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  await testInfo.attach(`axe-${label}.json`, {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });
  const summary = results.violations.map(
    (v) => `[${v.impact}] ${v.id}: ${v.help}\n    ${v.nodes.map((n) => n.target.join(' ')).join('\n    ')}`,
  );
  expect(summary, `axe violations (${label})`).toEqual([]);
}

test.describe('Accessibility (axe-core)', () => {
  // Scan the settled page: mid-animation opacity would skew contrast results.
  test.use({ reducedMotion: 'reduce' });

  for (const scheme of ['light', 'dark'] as const) {
    test(`home page has no violations in ${scheme} mode`, async ({ page }, testInfo) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto('/');
      await expectNoViolations(page, testInfo, `home-${scheme}`);
    });

    test(`FHIR view has no violations in ${scheme} mode`, async ({ page }, testInfo) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto('/#about');
      await page.getByRole('switch', { name: 'View as FHIR' }).click();
      await expectNoViolations(page, testInfo, `fhir-${scheme}`);
    });
  }

  test('every pipeline stage log has no violations', async ({ page }, testInfo) => {
    await page.goto('/#experience');
    for (const id of ['concentrix', 'gli', 'portfolio']) {
      await page.locator(`#stage-${id}`).click();
      await expectNoViolations(page, testInfo, `stage-${id}`);
    }
  });

  test('the open mobile menu has no violations', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();
    await expectNoViolations(page, testInfo, 'mobile-menu');
  });

  test('the theme chosen with the toggle has no violations', async ({ page }, testInfo) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await page.getByRole('button', { name: 'Dark theme' }).click();
    await expectNoViolations(page, testInfo, 'toggled-dark');
  });

  test.describe('404 page', () => {
    test.use({ allowConsoleErrors: [/404/] });

    test('has no violations', async ({ page }, testInfo) => {
      await page.goto('/this-page-does-not-exist');
      await expectNoViolations(page, testInfo, '404');
    });
  });
});

test.describe('Accessibility (beyond axe)', () => {
  test('one h1, and headings never skip a level', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    const levels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((hs) => hs.map((h) => Number(h.tagName[1])));
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]! - levels[i - 1]!, `heading ${i} jumps from h${levels[i - 1]} to h${levels[i]}`).toBeLessThanOrEqual(1);
    }
  });

  test('every interactive element shows a visible focus indicator', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard-only check');
    await page.goto('/');
    const focusables = page.locator('a[href]:visible, button:visible, input:visible, textarea:visible');
    const count = await focusables.count();
    expect(count).toBeGreaterThan(20);
    for (let i = 0; i < count; i++) {
      const el = focusables.nth(i);
      await el.focus();
      const outline = await el.evaluate((node) => {
        const s = getComputedStyle(node);
        return { style: s.outlineStyle, width: parseFloat(s.outlineWidth) };
      });
      expect(outline.style, `focus outline on element ${i}`).not.toBe('none');
      expect(outline.width).toBeGreaterThanOrEqual(2);
    }
  });

  test('decorative icons are hidden from assistive tech', async ({ page }) => {
    await page.goto('/');
    const exposed = await page.locator('svg:not([aria-hidden="true"])').count();
    expect(exposed).toBe(0);
  });

  test('the page works without JavaScript: all content is still there', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.getByTestId('hero-summary')).toBeVisible();
    // Both profile views and every pipeline log are shown when nothing can toggle them.
    await expect(page.getByTestId('profile-card')).toBeVisible();
    await expect(page.getByTestId('profile-fhir')).toBeVisible();
    for (const id of ['concentrix', 'gli', 'altera', 'portfolio']) {
      await expect(page.locator(`#stage-${id}-log`)).toBeVisible();
    }
    await expect(page.getByRole('link', { name: 'Open ticket in your email app' })).toHaveAttribute('href', /^mailto:/);
    await context.close();
  });
});
