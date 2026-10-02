import type { Page } from '@playwright/test';
import { expect, pageRects, test } from './support/fixtures';

const WIDTHS = [320, 375, 414, 768] as const;

const horizontalOverflow = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

test.describe('Mobile and small screens', () => {
  for (const width of WIDTHS) {
    test(`no horizontal scrolling at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);

      // Also with the long content expanded.
      await page.getByRole('switch', { name: 'View as FHIR' }).click();
      for (const id of ['concentrix', 'gli', 'portfolio']) {
        await page.locator(`#stage-${id}`).click();
        expect(await horizontalOverflow(page), `with ${id} open`).toBeLessThanOrEqual(0);
      }
    });
  }

  test('hero test lines wrap between words and stay inside the terminal', async ({ page }) => {
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      const problems = await page.locator('.t-test > span:last-child').evaluateAll((spans) => {
        const terminal = document.querySelector('.terminal__body')!.getBoundingClientRect();
        const found: string[] = [];
        for (const span of spans) {
          const text = span.firstChild as Text;
          let start = 0;
          for (const word of text.data.split(' ')) {
            const range = document.createRange();
            range.setStart(text, start);
            range.setEnd(text, start + word.length);
            const rects = Array.from(range.getClientRects());
            if (rects.length > 1) found.push(`"${word}" is split across lines`);
            if (rects.some((r) => r.right > terminal.right + 0.5)) found.push(`"${word}" sticks out of the terminal`);
            start += word.length + 1;
          }
        }
        return found;
      });
      expect(problems, `at ${width}px`).toEqual([]);
    }
  });

  test('pipeline stacks vertically and still opens on tap', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#experience');
    const [first, second] = await pageRects(page, ['#stage-concentrix', '#stage-gli']);
    expect(second!.y).toBeGreaterThan(first!.y + first!.height - 1);
    expect(second!.x).toBeCloseTo(first!.x, 0);

    await page.locator('#stage-gli').click();
    await expect(page.locator('#stage-gli-log')).toBeVisible();
    // The open log sits directly under its stage.
    const [gli, log] = await pageRects(page, ['#stage-gli', '#stage-gli-log']);
    expect(log!.y).toBeGreaterThan(gli!.y);
    expect(log!.y).toBeLessThan(gli!.y + gli!.height + 40);
  });

  test('text stays readable: body text is at least 16px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    const size = await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize));
    expect(size).toBeGreaterThanOrEqual(16);
  });

  test('touch targets meet WCAG 2.2 target size (2.5.8, 24×24 CSS px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu' }).click();

    const problems = await page.evaluate(() => {
      type Box = { name: string; x: number; y: number; w: number; h: number; inline: boolean };
      const targets: Box[] = [];
      for (const el of document.querySelectorAll<HTMLElement>('a[href], button, input, textarea, [role="switch"]')) {
        const r = el.getBoundingClientRect();
        // Skip what is not visible (e.g. the skip link until it is focused).
        if (r.width <= 1 || r.height <= 1 || getComputedStyle(el).visibility === 'hidden') continue;
        // WCAG exception: links inside a sentence or a line of text.
        const parent = el.parentElement;
        const inline =
          getComputedStyle(el).display === 'inline' &&
          !!parent &&
          (parent.textContent ?? '').trim().length > (el.textContent ?? '').trim().length;
        targets.push({ name: (el.textContent ?? el.getAttribute('aria-label') ?? '').trim().slice(0, 40), x: r.x, y: r.y + scrollY, w: r.width, h: r.height, inline });
      }

      const center = (b: Box) => ({ cx: b.x + b.w / 2, cy: b.y + b.h / 2 });
      const distToRect = (px: number, py: number, b: Box) => {
        const dx = Math.max(b.x - px, 0, px - (b.x + b.w));
        const dy = Math.max(b.y - py, 0, py - (b.y + b.h));
        return Math.hypot(dx, dy);
      };

      const failures: string[] = [];
      for (const t of targets) {
        if (t.inline || (t.w >= 24 && t.h >= 24)) continue;
        // Spacing exception: a 24px circle around the target touches no other target.
        const { cx, cy } = center(t);
        const crowded = targets.some((o) => o !== t && distToRect(cx, cy, o) < 12);
        if (crowded) failures.push(`${t.name} (${Math.round(t.w)}×${Math.round(t.h)})`);
      }
      return failures;
    });

    expect(problems).toEqual([]);
  });
});
