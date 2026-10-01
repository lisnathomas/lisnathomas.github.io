import { EMAIL, expect, test } from './support/fixtures';

/** Splits a mailto: URL into address and decoded fields (RFC 6068). */
function parseMailto(href: string) {
  expect(href.startsWith('mailto:')).toBe(true);
  const [address, query = ''] = href.slice('mailto:'.length).split('?');
  const fields: Record<string, string> = {};
  for (const pair of query.split('&').filter(Boolean)) {
    const [key, value = ''] = pair.split('=');
    // encodeURIComponent never emits "+", so a literal "+" would be a bug.
    expect(value).not.toContain('+');
    fields[key!] = decodeURIComponent(value);
  }
  return { address, fields };
}

test.describe('Open a ticket', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#contact');
  });

  test('has the Summary / Details / Expected outcome template', async ({ page }) => {
    await expect(page.getByLabel('Summary')).toBeVisible();
    await expect(page.getByLabel('Details')).toBeVisible();
    await expect(page.getByLabel('Expected outcome')).toBeVisible();
  });

  test('builds the mailto link from the fields as you type', async ({ page }) => {
    await page.getByLabel('Summary').fill('QA role & next steps?');
    await page.getByLabel('Details').fill('Line one\nLine two: ü, #1, 100% sure');
    await page.getByLabel('Expected outcome').fill('A reply = great');

    const href = await page.getByRole('link', { name: 'Open ticket in your email app' }).getAttribute('href');
    const { address, fields } = parseMailto(href!);

    expect(address).toBe(EMAIL);
    expect(Object.keys(fields).sort()).toEqual(['body', 'subject']);
    expect(fields['subject']).toBe('[Ticket] QA role & next steps?');
    expect(fields['body']).toBe(
      [
        'Summary',
        'QA role & next steps?',
        '',
        'Details',
        'Line one',
        'Line two: ü, #1, 100% sure',
        '',
        'Expected outcome',
        'A reply = great',
      ].join('\r\n'),
    );
  });

  test('works with empty fields and uses a sensible subject', async ({ page }) => {
    const href = await page.getByRole('link', { name: 'Open ticket in your email app' }).getAttribute('href');
    const { address, fields } = parseMailto(href!);
    expect(address).toBe(EMAIL);
    expect(fields['subject']).toBe('Ticket from your portfolio');
    expect(fields['body']).toContain('Expected outcome');
  });

  test('a multi-line summary becomes a single-line subject', async ({ page }) => {
    await page.getByLabel('Summary').fill('  Hello   there  ');
    const href = await page.getByRole('link', { name: 'Open ticket in your email app' }).getAttribute('href');
    expect(parseMailto(href!).fields['subject']).toBe('[Ticket] Hello there');
  });

  test('pressing Enter in Summary opens the email instead of reloading the page', async ({ page }) => {
    await page.getByLabel('Summary').fill('Hello');
    // Intercept the mailto click so no mail client is launched during the test.
    await page.evaluate(() => {
      const link = document.querySelector<HTMLAnchorElement>('[data-ticket-link]')!;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.dataset['openedMailto'] = link.href;
      });
    });
    await page.getByLabel('Summary').press('Enter');
    await expect(page.locator('body')).toHaveAttribute('data-opened-mailto', /^mailto:lisnathomas99@gmail\.com\?subject=%5BTicket%5D%20Hello&/);
    await expect(page).toHaveURL(/#contact$/); // no reload, no query string
  });
});
