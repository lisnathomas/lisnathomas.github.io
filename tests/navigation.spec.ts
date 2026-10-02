import type { Page } from '@playwright/test';
import { SECTIONS, expect, test } from './support/fixtures';

/** On narrow screens the nav lives behind the Menu button. */
async function openNavIfCollapsed(page: Page) {
  const menu = page.getByRole('button', { name: 'Menu' });
  if (await menu.isVisible()) {
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
  }
}

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  for (const { id, heading } of SECTIONS) {
    test(`nav link "${heading}" scrolls to #${id}`, async ({ page }) => {
      await openNavIfCollapsed(page);
      const nav = page.getByRole('navigation', { name: 'Primary' });
      await nav.getByRole('link', { name: heading === 'How I use AI in testing' ? 'AI in testing' : heading }).click();
      await expect(page).toHaveURL(new RegExp(`#${id}$`));
      await expect(page.locator(`#${id}-title`)).toBeInViewport();
      // The sticky header must not cover the heading we jumped to.
      const header = await page.locator('.site-header').boundingBox();
      const title = await page.locator(`#${id}-title`).boundingBox();
      expect(title!.y).toBeGreaterThanOrEqual(header!.y + header!.height - 1);
    });
  }

  test('the skip link is the first stop and jumps to the main content', async ({ page, isMobile, browserName }) => {
    test.skip(isMobile, 'keyboard-only check');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    if (browserName === 'webkit') {
      // Safari/WebKit only tabs to links when "Press Tab to highlight each item" is on.
      await skip.focus();
    } else {
      await page.keyboard.press('Tab');
    }
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('the brand link goes back to the top', async ({ page }) => {
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await page.getByRole('link', { name: 'Lisna Thomas, back to top' }).click();
    await expect(page).toHaveURL(/#top$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
  });

  test('the mobile menu opens, closes with Escape, and closes after choosing a section', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const menu = page.getByRole('button', { name: 'Menu' });
    const list = page.locator('#nav-list');

    await expect(menu).toBeVisible();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(list).toBeHidden();

    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await expect(list).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
    await expect(list).toBeHidden();

    await menu.click();
    await list.getByRole('link', { name: 'Results' }).click();
    await expect(page).toHaveURL(/#results$/);
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
  });

  test('every in-page link points at an element that exists', async ({ page }) => {
    const targets = await page
      .locator('a[href^="#"]')
      .evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute('href')!))]);
    expect(targets.length).toBeGreaterThan(5);
    for (const href of targets) {
      await expect(page.locator(href), `target of ${href}`).toHaveCount(1);
    }
  });

  test('every link has a real, safe destination', async ({ page }) => {
    const links = await page.locator('a').evaluateAll((as) =>
      as.map((a) => ({ text: (a.textContent ?? '').trim(), href: a.getAttribute('href') })),
    );
    expect(links.length).toBeGreaterThan(15);
    for (const { text, href } of links) {
      expect(href, `link "${text}" has an href`).toBeTruthy();
      expect(href, `link "${text}"`).not.toBe('#');
      expect(href, `link "${text}"`).not.toMatch(/^javascript:/i);
      expect(href, `link "${text}" is not a placeholder`).not.toMatch(/todo/i);
      expect(href, `link "${text}" uses https, mailto or an in-page anchor`).toMatch(/^(https:\/\/|mailto:|#|\/)/);
    }
  });

  test('every external link opens in a new tab, safely, and says so', async ({ page }) => {
    const links = await page.locator('a[href^="http"]').evaluateAll((as) =>
      as.map((a) => ({
        href: a.getAttribute('href')!,
        target: a.getAttribute('target'),
        rel: (a.getAttribute('rel') ?? '').split(/\s+/),
        text: a.textContent ?? '',
      })),
    );
    expect(links.length).toBeGreaterThan(5);
    for (const { href, target, rel, text } of links) {
      expect(target, href).toBe('_blank');
      expect(rel, href).toContain('noopener');
      // Screen reader users hear that a new tab will open.
      expect(text, href).toMatch(/opens in a new tab/);
    }

    // In-page links and the resume download stay in the same tab.
    const local = await page.locator('a[href^="#"], a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute('target')));
    expect(local.length).toBeGreaterThan(5);
    expect(local.every((target) => target === null)).toBe(true);
  });

  test('email links all point at the right address', async ({ page }) => {
    const mailtos = await page
      .locator('a[href^="mailto:"]')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href')!));
    expect(mailtos.length).toBeGreaterThan(0);
    for (const href of mailtos) expect(href).toMatch(/^mailto:lisnathomas99@gmail\.com(\?|$)/);
  });

  test('the "tested" badge links to the GitHub Actions run', async ({ page }) => {
    const badge = page.getByRole('link', { name: /This site is tested: Playwright · axe · Lighthouse/ });
    await expect(badge).toBeVisible();
    const href = await badge.getAttribute('href');
    const runId = process.env['GITHUB_RUN_ID'];
    if (runId) {
      expect(href).toBe(`https://github.com/${process.env['GITHUB_REPOSITORY']}/actions/runs/${runId}`);
    } else {
      expect(href).toMatch(/^https:\/\/github\.com\/lisnathomas\/lisnathomas\.github\.io\/actions/);
    }
  });
});
