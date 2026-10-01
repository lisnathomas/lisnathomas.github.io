import { expect, test } from './support/fixtures';

const opacity = (el: Element) => getComputedStyle(el).opacity;

test.describe('Reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('the hero shows its final state immediately, with no animation', async ({ page }) => {
    await page.goto('/');
    const summary = page.getByTestId('hero-summary');
    // Checked straight after load: no waiting for anything to "finish".
    expect(await summary.evaluate(opacity)).toBe('1');
    expect(await page.locator('.t-test').last().evaluate(opacity)).toBe('1');
    expect(await page.getByTestId('hero-status').evaluate(opacity)).toBe('1');
    await expect(page.locator('.terminal__runs')).toBeHidden();

    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
    expect(running).toBe(0);
  });

  test('smooth scrolling is turned off', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
  });
});

test.describe('With motion allowed', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('the hero plays the test run and ends on 4 passing / PASS', async ({ page }) => {
    await page.goto('/');
    const summary = page.getByTestId('hero-summary');
    const animated = await summary.evaluate((el) => el.getAnimations().length);
    expect(animated).toBeGreaterThan(0);

    // Every line ends fully visible.
    await expect.poll(() => summary.evaluate(opacity), { timeout: 6_000 }).toBe('1');
    for (const line of await page.locator('.t-reveal').all()) {
      await expect.poll(() => line.evaluate(opacity)).toBe('1');
    }
    await expect.poll(() => page.getByTestId('hero-status').evaluate(opacity)).toBe('1');
    await expect.poll(() => page.locator('.terminal__runs').evaluate(opacity)).toBe('0');
  });
});
