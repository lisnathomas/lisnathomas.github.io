import { SECTIONS, expect, test } from './support/fixtures';

test.describe('Every section renders', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero runs the spec and introduces Lisna', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Lisna Thomas' })).toBeVisible();

    const terminal = page.getByTestId('hero-terminal');
    await expect(terminal).toBeVisible();
    await expect(terminal).toContainText("describe('Lisna Thomas, QA Engineer')");
    for (const line of [
      'has 6+ years of QA experience',
      'speaks HL7 and FHIR',
      'automates with C#, Java, Playwright, Selenium and Reqnroll',
      'uses AI to test faster, and verifies every result',
    ]) {
      await expect(terminal.getByRole('listitem').filter({ hasText: line })).toBeVisible();
    }
    await expect(page.getByTestId('hero-summary')).toHaveText('4 passing');
    await expect(page.getByTestId('hero-status')).toHaveText('PASS');

    for (const part of ['QA Engineer', 'Healthcare focus', 'AI-assisted test automation']) {
      await expect(page.locator('.hero__headline')).toContainText(part);
    }

    await expect(page.getByRole('link', { name: 'View projects' })).toHaveAttribute('href', '#projects');
    await expect(page.getByRole('link', { name: 'GitHub', exact: true }).first()).toHaveAttribute(
      'href',
      'https://github.com/lisnathomas',
    );
    await expect(page.locator('.hero__actions')).toContainText('Download resume');
  });

  for (const { id, heading } of SECTIONS) {
    test(`${id} section has its heading and content`, async ({ page }) => {
      const section = page.locator(`section#${id}`);
      await expect(section).toBeAttached();
      await section.scrollIntoViewIfNeeded();
      await expect(section.getByRole('heading', { level: 2, name: heading })).toBeVisible();
      // Not just a heading: every section has real content under it.
      expect((await section.innerText()).length).toBeGreaterThan(150);
    });
  }

  test('results show the real numbers with plain-language labels', async ({ page }) => {
    const items = page.getByTestId('results-list').getByRole('listitem');
    await expect(items).toHaveCount(7);
    const expected = [
      ['50%', 'less manual testing effort'],
      ['40%', 'better build and deployment efficiency'],
      ['25%', 'more test coverage'],
      ['60%', 'faster regression runs'],
      ['500+', 'test cases automated'],
      ['98%', 'on-time releases'],
      ['16-month', 'FHIR interoperability project'],
    ] as const;
    for (const [i, [value, label]] of expected.entries()) {
      await expect(items.nth(i)).toContainText(value);
      await expect(items.nth(i)).toContainText(label);
    }
    await expect(page.locator('#results')).toContainText('7 passed');
  });

  test('projects open with Given / When / Then', async ({ page }) => {
    for (const id of ['openmrs', 'school-erp']) {
      const card = page.getByTestId(`project-${id}`);
      await card.scrollIntoViewIfNeeded();
      await expect(card.locator('dt')).toHaveText(['Given', 'When', 'Then']);
      await expect(card.locator('.chip').first()).toBeVisible();
    }
  });

  test('skills are grouped with healthcare first', async ({ page }) => {
    const groups = page.locator('#skills h3');
    await expect(groups.first()).toHaveText('Healthcare IT');
    await expect(groups).toHaveCount(7);
    // No skill bars or percentages for skills.
    await expect(page.locator('#skills')).not.toContainText('%');
    await expect(page.locator('#skills [role="progressbar"], #skills progress, #skills meter')).toHaveCount(0);
  });

  test('no phone number appears anywhere on the page', async ({ page }) => {
    // No links that dial, text or message a number.
    await expect(page.locator('a[href^="tel:"], a[href^="sms:"], a[href*="wa.me/"], a[href*="whatsapp"]')).toHaveCount(0);

    // Everything a person or a crawler can read: visible text (including the
    // FHIR JSON), meta tags and structured data.
    const readable = await page.evaluate(() =>
      [
        document.body.textContent ?? '',
        ...Array.from(document.querySelectorAll('meta[content]'), (m) => m.getAttribute('content') ?? ''),
        ...Array.from(document.querySelectorAll('script[type="application/ld+json"]'), (s) => s.textContent ?? ''),
      ].join('\n'),
    );
    // URLs legitimately carry long IDs (an Actions run ID, a LinkedIn profile
    // ID), so they are removed before looking for phone-like numbers.
    const withoutUrls = readable.replace(/\b(?:https?|mailto):[^\s"'<>]+/g, ' ');
    // Any run of 10+ digits (allowing spaces, dots, dashes, brackets) looks like a phone number.
    const candidates = withoutUrls.match(/\+?\(?\d[\d\s().-]{8,}\d/g) ?? [];
    const phoneLike = candidates.filter((c) => c.replace(/\D/g, '').length >= 10);
    expect(phoneLike, 'phone-like numbers on the page').toEqual([]);

    // The FHIR resource has no phone contact point either.
    expect(readable).not.toMatch(/"system":\s*"(phone|sms|fax)"/);
  });

  test('the phone check really catches a phone number (the test is tested)', async ({ page }) => {
    await page.evaluate(() => document.body.insertAdjacentHTML('beforeend', '<p>Call 604 555 0199 any time</p>'));
    const text = await page.evaluate(() => document.body.textContent ?? '');
    const phoneLike = (text.match(/\+?\(?\d[\d\s().-]{8,}\d/g) ?? []).filter((c) => c.replace(/\D/g, '').length >= 10);
    expect(phoneLike.map((c) => c.trim())).toContain('604 555 0199');
  });

  test('every [TODO] placeholder is clearly marked and never a link', async ({ page }, testInfo) => {
    const todos = page.locator('[data-todo]');
    const labels = await todos.evaluateAll((els) =>
      els.map((el) => ({ label: el.getAttribute('data-todo'), text: el.textContent, inLink: !!el.closest('a') })),
    );
    for (const t of labels) {
      expect(t.text).toBe(`[TODO: ${t.label}]`);
      expect(t.inLink, `${t.label} must not be inside a link`).toBe(false);
    }
    testInfo.annotations.push({
      type: 'todo',
      description: `${labels.length} placeholders remain: ${labels.map((t) => t.label).join(', ')}`,
    });
  });
});
