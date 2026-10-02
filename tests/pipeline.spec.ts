import { expect, pageRects, test } from './support/fixtures';

const STAGES = ['concentrix', 'gli', 'altera', 'portfolio'] as const;

test.describe('Career pipeline', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#experience');
  });

  test('stages run left to right: Concentrix → GLI → Altera → Portfolio projects', async ({ page }) => {
    const names = page.locator('[data-stage] .stage__name');
    await expect(names).toHaveText(['Concentrix', 'GLI', 'Altera Digital Health', 'Portfolio projects']);
    // Every stage passed.
    await expect(page.locator('[data-stage] .check')).toHaveCount(4);

    const boxes = await pageRects(page, STAGES.map((id) => `#stage-${id}`));
    const viewport = page.viewportSize()!;
    for (let i = 1; i < boxes.length; i++) {
      if (viewport.width >= 960) expect(boxes[i]!.x).toBeGreaterThan(boxes[i - 1]!.x); // side by side
      else expect(boxes[i]!.y).toBeGreaterThan(boxes[i - 1]!.y); // stacked on mobile
    }
  });

  test('each job shows the title, company, location and dates from the resume', async ({ page }) => {
    const jobs = [
      { id: 'concentrix', title: 'QA Analyst, Concentrix', location: 'Chilliwack, BC', dates: 'August 2020 – October 2022', bullets: 6 },
      { id: 'gli', title: 'Test Engineer, Gaming Laboratories International (GLI)', location: 'Burnaby, BC', dates: 'October 2022 – March 2025', bullets: 7 },
      { id: 'altera', title: 'QA Engineer, Altera Digital Health', location: 'Remote, Canada', dates: 'March 2025 – October 2026', bullets: 8 },
    ];
    for (const job of jobs) {
      const stage = page.locator(`#stage-${job.id}`);
      const log = page.locator(`#stage-${job.id}-log`);
      await expect(stage.locator('.stage__dates')).toHaveText(job.dates);
      if ((await stage.getAttribute('aria-expanded')) !== 'true') await stage.click();
      await expect(log.getByRole('heading')).toHaveText(job.title);
      await expect(log.locator('.log__meta')).toContainText(job.location);
      await expect(log.locator('.log__lines li')).toHaveCount(job.bullets);
    }
    // The run summary covers August 2020 – October 2026.
    await expect(page.locator('.run')).toContainText('4 stages');
    await expect(page.locator('.run')).toContainText('6+ years');
  });

  test('the most recent job is open by default', async ({ page }) => {
    await expect(page.locator('#stage-altera')).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#stage-altera-log')).toBeVisible();
    await expect(page.locator('#stage-altera-log')).toContainText('16-month feature');
  });

  test('stages open and close with Enter and Space, one at a time', async ({ page }) => {
    for (const id of STAGES) {
      const button = page.locator(`#stage-${id}`);
      const log = page.locator(`#stage-${id}-log`);
      await button.focus();
      await expect(button).toBeFocused();

      if ((await button.getAttribute('aria-expanded')) === 'true') {
        await page.keyboard.press('Enter'); // close the default-open stage first
        await expect(button).toHaveAttribute('aria-expanded', 'false');
      }

      await page.keyboard.press('Enter');
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      await expect(log).toBeVisible();
      // Only one log is open at a time.
      await expect(page.locator('[data-stage][aria-expanded="true"]')).toHaveCount(1);
      await expect(page.locator('[data-stage-log]:visible')).toHaveCount(1);

      await page.keyboard.press('Enter');
      await expect(button).toHaveAttribute('aria-expanded', 'false');
      await expect(log).toBeHidden();

      await page.keyboard.press('Space');
      await expect(button).toHaveAttribute('aria-expanded', 'true');
      await expect(log).toBeVisible();
    }
  });

  test('Tab moves from stage to stage', async ({ page, browserName, isMobile }) => {
    test.skip(isMobile, 'keyboard-only check');
    // Desktop Safari only tabs to buttons when "Press Tab to highlight each item" is on.
    test.skip(browserName === 'webkit', 'WebKit skips buttons in the tab order by default');
    await page.locator('#stage-concentrix').focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('#stage-gli')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('#stage-altera')).toBeFocused();
  });

  test('buttons are wired to their logs with aria-controls', async ({ page }) => {
    for (const id of STAGES) {
      const button = page.locator(`#stage-${id}`);
      await expect(button).toHaveAttribute('aria-controls', `stage-${id}-log`);
      await expect(page.locator(`#stage-${id}-log`)).toHaveAttribute('role', 'region');
    }
  });
});
