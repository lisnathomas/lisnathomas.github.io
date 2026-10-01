import { expect, test } from './support/fixtures';

const SITE = 'https://lisnathomas.github.io';

test.describe('SEO, metadata and privacy @once', () => {
  test('has a title, description, canonical URL and language', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Lisna Thomas/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description!.length).toBeGreaterThanOrEqual(50);
    expect(description!.length).toBeLessThanOrEqual(170);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${SITE}/`);
    await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /width=device-width/);
  });

  test('has an Open Graph preview with a 1200×630 image', async ({ page, request }) => {
    await page.goto('/');
    const og = async (property: string) =>
      page.locator(`meta[property="${property}"]`).getAttribute('content');
    expect(await og('og:title')).toContain('Lisna Thomas');
    expect(await og('og:description')).toBeTruthy();
    expect(await og('og:url')).toBe(`${SITE}/`);
    expect(await og('og:image')).toBe(`${SITE}/og.png`);
    expect(await og('og:image:alt')).toBeTruthy();
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');

    const image = await request.get('/og.png');
    expect(image.status()).toBe(200);
    expect(image.headers()['content-type']).toContain('image/png');
    const png = await image.body();
    // PNG IHDR: width and height are big-endian uint32s at bytes 16 and 20.
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
  });

  test('favicons are linked and served', async ({ page, request }) => {
    await page.goto('/');
    for (const href of await page.locator('link[rel="icon"], link[rel="apple-touch-icon"]').evaluateAll((ls) =>
      ls.map((l) => l.getAttribute('href')!),
    )) {
      const res = await request.get(href);
      expect(res.status(), href).toBe(200);
      expect((await res.body()).length, href).toBeGreaterThan(100);
    }
  });

  test('robots.txt and the sitemap are valid', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);

    const index = await request.get('/sitemap-index.xml');
    expect(index.status()).toBe(200);
    const indexXml = await index.text();
    expect(indexXml).toContain('<sitemapindex');
    const sitemapUrl = indexXml.match(/<loc>(.*?)<\/loc>/)![1]!;
    const sitemap = await (await request.get(new URL(sitemapUrl).pathname)).text();
    expect(sitemap).toContain(`<loc>${SITE}/</loc>`);
    expect(sitemap).not.toContain('404');
  });

  test('structured data describes Lisna as a Person', async ({ page }) => {
    await page.goto('/');
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
    expect(ld['@type']).toBe('Person');
    expect(ld.name).toBe('Lisna Thomas');
    expect(ld.telephone).toBeUndefined();
  });

  test('no tracking: every request stays on this site', async ({ page, baseURL }) => {
    const origins = new Set<string>();
    page.on('request', (req) => origins.add(new URL(req.url()).origin));
    await page.goto('/');
    await page.mouse.wheel(0, 20_000);
    await page.waitForLoadState('networkidle');
    expect([...origins]).toEqual([new URL(baseURL!).origin]);

    const cookies = await page.context().cookies();
    expect(cookies).toEqual([]);
  });

  test('the only thing stored in the browser is the theme choice', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Dark theme' }).click();
    const keys = await page.evaluate(() => Object.keys(localStorage));
    expect(keys).toEqual(['theme']);
  });
});

test.describe('404 page @once', () => {
  test.use({ allowConsoleErrors: [/404/] });

  test('unknown URLs get a helpful 404 page that links home', async ({ page }) => {
    const response = await page.goto('/no-such-page');
    expect(response!.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await page.getByRole('link', { name: 'Back to the homepage' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Lisna Thomas' })).toBeVisible();
  });
});
