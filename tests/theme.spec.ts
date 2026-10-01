import type { Page } from '@playwright/test';
import { expect, test } from './support/fixtures';

const LIGHT_BG = 'rgb(248, 247, 243)';
const DARK_BG = 'rgb(11, 21, 33)';

const bodyBackground = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test.describe('Theme', () => {
  test('follows a light system setting by default', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
    expect(await bodyBackground(page)).toBe(LIGHT_BG);
    await expect(page.getByRole('button', { name: 'Dark theme' })).toHaveAttribute('aria-pressed', 'false');
  });

  test('follows a dark system setting by default', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    expect(await bodyBackground(page)).toBe(DARK_BG);
    await expect(page.getByRole('button', { name: 'Dark theme' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('the toggle switches theme and the choice survives a reload', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Dark theme' });

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect.poll(() => bodyBackground(page)).toBe(DARK_BG);

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await bodyBackground(page)).toBe(DARK_BG);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect.poll(() => bodyBackground(page)).toBe(LIGHT_BG);
  });

  test('an explicit choice wins over the system setting', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.getByRole('button', { name: 'Dark theme' }).click(); // dark -> light
    await expect.poll(() => bodyBackground(page)).toBe(LIGHT_BG);
    await page.reload();
    expect(await bodyBackground(page)).toBe(LIGHT_BG);
  });

  test('the toggle works from the keyboard', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Dark theme' });
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.press('Space');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });
});
