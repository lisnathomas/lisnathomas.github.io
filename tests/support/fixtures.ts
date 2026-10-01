import { test as base, expect } from '@playwright/test';

/**
 * Every test fails if the page logs a console error or throws, unless the
 * test opts in to a specific, expected message.
 */
export const test = base.extend<{ allowConsoleErrors: RegExp[]; consoleGuard: void }>({
  allowConsoleErrors: [[], { option: true }],
  consoleGuard: [
    async ({ page, allowConsoleErrors }, use) => {
      const errors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !allowConsoleErrors.some((re) => re.test(msg.text()))) {
          errors.push(msg.text());
        }
      });
      page.on('pageerror', (error) => errors.push(`Uncaught: ${error.message}`));
      await use();
      expect(errors, 'console errors on the page').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** Section ids and their h2 text, in page order. */
export const SECTIONS = [
  { id: 'about', heading: 'About' },
  { id: 'experience', heading: 'Experience' },
  { id: 'results', heading: 'Results' },
  { id: 'projects', heading: 'Projects' },
  { id: 'ai', heading: 'How I use AI in testing' },
  { id: 'skills', heading: 'Skills' },
  { id: 'contact', heading: 'Contact' },
] as const;

export const EMAIL = 'lisnathomas99@gmail.com';

/**
 * Bounding boxes of several elements measured in the same frame, in page
 * coordinates. Measuring one by one is flaky while smooth scrolling is running.
 */
export async function pageRects(page: import('@playwright/test').Page, selectors: readonly string[]) {
  return page.evaluate((sels) => {
    return sels.map((sel) => {
      const r = document.querySelector(sel)!.getBoundingClientRect();
      return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height };
    });
  }, selectors);
}
