import { expect, test } from './support/fixtures';

/**
 * Known defects: external links that are expected to fail right now, each
 * with a reason. Treated like test.fail(): if one of these starts working,
 * the test fails too, so the list never goes stale. Remove an entry once the
 * link is fixed.
 */
const KNOWN_BROKEN: Record<string, string> = {
  'https://github.com/lisnathomas/openmrs-ai-test-automation':
    'Repository not public yet (or renamed; a public repo "OpenMrs.AiTests" exists).',
  'https://lisnathomas.github.io/openmrs-ai-test-automation/sample-run/report.html':
    'Sample report is not published on GitHub Pages yet.',
};

/** Sites that block automated requests; their URLs are format-checked only. */
const UNVERIFIABLE_HOSTS = ['www.linkedin.com', 'linkedin.com'];

test.describe('External links @external', () => {
  test.describe.configure({ mode: 'serial' });

  test('every external link resolves', async ({ page, request }, testInfo) => {
    test.setTimeout(120_000);
    await page.goto('/');
    const urls = await page.locator('a[href^="http"]').evaluateAll((as) => [
      ...new Set(as.map((a) => (a as HTMLAnchorElement).href)),
    ]);
    expect(urls.length).toBeGreaterThan(3);

    const broken: string[] = [];
    const unexpectedlyFixed: string[] = [];

    for (const url of urls) {
      const host = new URL(url).hostname;
      if (UNVERIFIABLE_HOSTS.includes(host)) {
        expect(url).toMatch(/^https:\/\/www\.linkedin\.com\/in\/[\w-]+\/?$/);
        testInfo.annotations.push({ type: 'not checked', description: `${url} (site blocks automated requests)` });
        continue;
      }

      let status = 0;
      for (let attempt = 1; attempt <= 3 && (status === 0 || status >= 500 || status === 429); attempt++) {
        try {
          const res = await request.get(url, { maxRedirects: 5, timeout: 20_000, failOnStatusCode: false });
          status = res.status();
        } catch {
          status = 0; // network error: retry
        }
      }

      const ok = status >= 200 && status < 400;
      if (url in KNOWN_BROKEN) {
        if (ok) unexpectedlyFixed.push(url);
        else testInfo.annotations.push({ type: 'known broken link', description: `${url} → ${status}: ${KNOWN_BROKEN[url]}` });
      } else if (!ok) {
        broken.push(`${url} → ${status}`);
      }
    }

    expect(broken, 'broken external links').toEqual([]);
    expect(unexpectedlyFixed, 'links in KNOWN_BROKEN that now work: remove them from the list').toEqual([]);
  });
});
