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
      'automates with Playwright, Selenium, Appium and Reqnroll',
      'uses AI agents to test faster, and validates their output',
    ]) {
      await expect(terminal.getByRole('listitem').filter({ hasText: line })).toBeVisible();
    }
    await expect(page.getByTestId('hero-summary')).toHaveText('4 passing');
    await expect(page.getByTestId('hero-status')).toHaveText('PASS');

    for (const part of ['QA Engineer', 'Healthcare focus', 'AI-assisted test automation']) {
      await expect(page.locator('.hero__headline')).toContainText(part);
    }

    await expect(page.getByRole('link', { name: 'View projects' })).toHaveAttribute('href', '#projects');
    const actions = page.locator('.hero__actions');
    await expect(actions.getByRole('link', { name: 'GitHub (opens in a new tab)' })).toHaveAttribute(
      'href',
      'https://github.com/lisnathomas',
    );
    const resume = actions.getByRole('link', { name: 'Download resume (PDF)' });
    await expect(resume).toHaveAttribute('href', '/Lisna_Thomas_Resume.pdf');
    await expect(resume).toHaveAttribute('download', '');
  });

  test('the resume download serves the real PDF', async ({ request }) => {
    const res = await request.get('/Lisna_Thomas_Resume.pdf');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/pdf');
    expect((await res.body()).subarray(0, 5).toString()).toBe('%PDF-');
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
    const expected = [
      ['70%', 'less time writing test cases per story, with manual testing reduced to about 20% of its previous effort', 'AI agent workflow · Altera Digital Health'],
      ['16-month', 'interoperability feature', 'Cross-network patient document search · Altera Digital Health'],
      ['50%', 'less manual testing effort', 'Selenium framework · GLI'],
      ['40%', 'better build and deployment efficiency', 'CI/CD integration · GLI'],
      ['25%', 'more test coverage', 'API automation with Postman · GLI'],
      ['98%', 'on-time releases', 'Agile and Waterfall projects · GLI'],
    ] as const;
    await expect(items).toHaveCount(expected.length);
    for (const [i, [value, label, source]] of expected.entries()) {
      await expect(items.nth(i).locator('.result__value')).toHaveText(value);
      await expect(items.nth(i).locator('.result__label')).toHaveText(label);
      await expect(items.nth(i).locator('.result__context')).toHaveText(source);
    }
    await expect(page.locator('#results')).toContainText('6 passed, 6 total');
    // Concentrix was manual testing only: no automation numbers are attributed to it.
    await expect(page.locator('#results')).not.toContainText('Concentrix');
  });

  test('projects open with Given / When / Then', async ({ page }) => {
    for (const id of ['openmrs', 'school-erp']) {
      const card = page.getByTestId(`project-${id}`);
      await card.scrollIntoViewIfNeeded();
      await expect(card.locator('dt')).toHaveText(['Given', 'When', 'Then']);
      await expect(card.locator('.chip').first()).toBeVisible();
    }
  });

  test('every project link is present and opens in a new tab', async ({ page }) => {
    const expected = {
      openmrs: [
        ['Code', 'https://github.com/lisnathomas/openmrs-ai-test-automation'],
        ['Live test report', 'https://openmrs-ai-test-automation.vercel.app'],
      ],
      'school-erp': [
        ['Richu Thankachan', 'https://github.com/coderaticebear/school_erp'],
        ['Code', 'https://github.com/lisnathomas/school-erp-ai-test-automation'],
        ['Live test report', 'https://school-erp-ai-test-automation-docs.vercel.app/sample-run/report.html'],
      ],
    } as const;

    for (const [id, links] of Object.entries(expected)) {
      const card = page.getByTestId(`project-${id}`);
      await expect(card.getByRole('link')).toHaveCount(links.length);
      for (const [name, href] of links) {
        const link = card.getByRole('link', { name: new RegExp(`^${name}\\b`) });
        await expect(link, `${id}: ${name}`).toHaveAttribute('href', href);
        await expect(link, `${id}: ${name}`).toHaveAttribute('target', '_blank');
      }
      // No demo videos until there are real ones.
      await expect(card).not.toContainText('Demo video');
    }
  });

  test('skills follow the resume, with digital health first', async ({ page }) => {
    const groups = page.locator('#skills h3');
    await expect(groups).toHaveText([
      'Digital health',
      'Test automation',
      'AI in testing',
      'Programming',
      'Bug tracking and specs',
      'CI/CD and tools',
      'API and data',
      'Testing types',
      'Methodologies',
    ]);
    const chips = await page.locator('#skills .chip').allTextContents();
    for (const skill of [
      'Reqnroll (SpecFlow successor)',
      'AI agents',
      'JavaScript',
      'React Native',
      'Bug backlog management',
      'iOS and Android mobile',
      'Edge-case',
      'Release',
    ]) {
      expect(chips, skill).toContain(skill);
    }
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
