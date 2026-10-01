/**
 * Renders the social preview image and PNG/ICO favicons with Playwright,
 * using the same fonts and colours as the site. Run with `npm run og` and
 * commit the files in public/ (they only change when the design does).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';

const require = createRequire(import.meta.url);
const fontData = (pkg, file) =>
  readFileSync(require.resolve(`${pkg}/files/${file}`)).toString('base64');

const sans = fontData('@fontsource-variable/atkinson-hyperlegible-next', 'atkinson-hyperlegible-next-latin-wght-normal.woff2');
const mono = fontData('@fontsource-variable/atkinson-hyperlegible-mono', 'atkinson-hyperlegible-mono-latin-wght-normal.woff2');
const favicon = readFileSync(new URL('../public/favicon.svg', import.meta.url), 'utf8');

const base = `
  @font-face { font-family: Sans; src: url(data:font/woff2;base64,${sans}) format('woff2'); font-weight: 200 800; }
  @font-face { font-family: Mono; src: url(data:font/woff2;base64,${mono}) format('woff2'); font-weight: 200 800; }
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 100%; height: 100%; }
`;

const check = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#5bd37a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.2 4.2L19 7"/></svg>`;

const tests = [
  'has 6+ years of QA experience',
  'speaks HL7 and FHIR',
  'automates with C#, Java, Playwright, Selenium and Reqnroll',
  'uses AI to test faster, and verifies every result',
];

const og = `<!doctype html><html><head><style>${base}
  body {
    display: grid; align-content: center; gap: 40px; padding: 48px 72px;
    background: #0b1521; color: #e8edf3; font-family: Sans;
    background-image: linear-gradient(#16263a 1px, transparent 1px), linear-gradient(90deg, #16263a 1px, transparent 1px);
    background-size: 36px 36px;
  }
  .top { display: flex; align-items: center; gap: 28px; }
  .mono { display: grid; place-items: center; width: 104px; height: 104px; border: 3px solid #5ed3c6; border-radius: 28px;
    background: #12333a; color: #5ed3c6; font: 700 44px/1 Mono; letter-spacing: -0.04em; }
  h1 { font-size: 68px; line-height: 1; letter-spacing: -0.025em; }
  .headline { margin-top: 14px; color: #a7b4c4; font-size: 30px; font-weight: 600; }
  .headline b { color: #5ed3c6; margin: 0 10px; }
  .term { border: 1px solid #1f3247; border-radius: 16px; background: #0a1420; font: 22px/1.6 Mono; color: #dce4ee; overflow: hidden; }
  .bar { display: flex; gap: 16px; align-items: center; padding: 12px 28px; background: #111f30; border-bottom: 1px solid #1f3247; color: #93a3b8; font-size: 19px; }
  .pass { background: #5bd37a; color: #0a1420; padding: 0 10px; border-radius: 6px; font-weight: 700; }
  .body { padding: 20px 28px; }
  .fn { color: #8ec9ff; } .str { color: #f2c77d; } .dim { color: #93a3b8; }
  .t { display: flex; align-items: center; gap: 14px; padding-left: 28px; }
  .sum { color: #5bd37a; font-weight: 700; margin-top: 6px; }
</style></head><body>
  <div class="top">
    <div class="mono">LT</div>
    <div>
      <h1>Lisna Thomas</h1>
      <p class="headline">QA Engineer<b>·</b>Healthcare focus<b>·</b>AI-assisted test automation</p>
    </div>
  </div>
  <div class="term">
    <div class="bar"><span class="pass">PASS</span> lisna.spec.ts</div>
    <div class="body">
      <div><span class="fn">describe</span><span class="dim">(</span><span class="str">'Lisna Thomas, QA Engineer'</span><span class="dim">)</span></div>
      ${tests.map((t) => `<div class="t">${check}<span>${t}</span></div>`).join('')}
      <div class="sum">${tests.length} passing</div>
    </div>
  </div>
</body></html>`;

const icon = (size) => `<!doctype html><html><head><style>${base}
  body { display: grid; place-items: center; background: transparent; }
  svg { width: ${size}px; height: ${size}px; }
</style></head><body>${favicon}</body></html>`;

/** Wraps a PNG in a single-image .ico container (PNG-in-ICO is valid since Vista). */
const pngToIco = (png, size) => {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count
  header.writeUInt8(size >= 256 ? 0 : size, 6);
  header.writeUInt8(size >= 256 ? 0 : size, 7);
  header.writeUInt8(0, 8); // palette
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // colour planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18); // data offset
  return Buffer.concat([header, png]);
};

const browser = await chromium.launch();
const out = (name) => new URL(`../public/${name}`, import.meta.url);

const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(og);
await page.evaluate(() => document.fonts.ready);
writeFileSync(out('og.png'), await page.screenshot({ type: 'png' }));

// Apple touch icons are shown on an opaque tile, so render on the brand colour.
await page.setViewportSize({ width: 180, height: 180 });
await page.setContent(icon(180).replace('background: transparent', 'background: #0a6b66'));
writeFileSync(out('apple-touch-icon.png'), await page.screenshot({ type: 'png' }));

await page.setViewportSize({ width: 32, height: 32 });
await page.setContent(icon(32));
const png32 = await page.screenshot({ type: 'png', omitBackground: true });
writeFileSync(out('favicon.ico'), pngToIco(png32, 32));

await browser.close();
console.log('Rendered public/og.png, public/apple-touch-icon.png and public/favicon.ico');
