# lisnathomas.github.io

Portfolio of **Lisna Thomas**, QA Engineer with a healthcare focus.
Live at **https://lisnathomas.github.io**.

The site is built to show QA work in practice, and it tests itself. Every push runs a Playwright suite in five
browser profiles, axe-core accessibility scans and Lighthouse CI. The site deploys only when all of them pass. The
footer badge links to the exact GitHub Actions run that tested the version you are looking at.

## What's on the page

| Section | Idea |
| --- | --- |
| Hero | A terminal "runs" a spec about Lisna and prints `4 passing` (pure CSS; reduced motion shows the final state), plus a Download resume button |
| About | Bio, tested domains, education, and a **View as FHIR** switch that turns the profile card into a FHIR R4 `Practitioner` resource (degrees become `qualification`s) |
| Experience | Career as a CI pipeline: Concentrix → GLI → Altera Digital Health → Portfolio projects; each stage opens its "log" with the resume's bullets |
| Results | Six real metrics with their sources, styled as a Jest-style test summary |
| Projects | OpenMRS and School ERP test automation, each opening with Given / When / Then and linking to its code and live test report |
| How I use AI in testing | The AI agent workflow built at Altera, and four guardrails |
| Skills | The resume's nine skill groups as chips, digital health first |
| Contact | "Open a ticket": Summary / Details / Expected outcome builds a `mailto:` link (no backend) |

## Tech

- [Astro](https://astro.build) 7 + TypeScript (strictest), static output, under 3 KB of client-side JavaScript (inlined, no framework)
- Plain CSS with design tokens, light and dark themes (follows the system setting, plus a toggle)
- Self-hosted Atkinson Hyperlegible Next + Mono, a typeface family designed for legibility
- `@astrojs/sitemap`, Open Graph image, favicons, JSON-LD
- No analytics, no cookies, no third-party requests (a test enforces this)

## Run it locally

Requires Node 22.12+ (CI uses Node 24).

```bash
npm ci
npm run dev        # http://localhost:4321 with hot reload
npm run build      # type-check (astro check) + static build into dist/
npm run preview    # serve dist/ at http://localhost:4321
```

All content lives in one file: **`src/data/profile.ts`**. Every fact in it comes from the resume,
**`public/Lisna_Thomas_Resume.pdf`** (the file the Download resume button serves), so update both together.
The FHIR resource is built from it in `src/data/fhir.ts`, which is typed against the official R4 definitions,
so the build fails if the structure drifts. External links open in a new tab and say so to screen readers.

## Run the tests

```bash
npx playwright install --with-deps   # first time only
npm run build                        # tests run against the built site
npm test                             # Playwright + axe, all five browser projects
npm run test:report                  # open the HTML report
npm run lhci                         # Lighthouse CI (fails if any category < 95)
```

Useful variations:

```bash
npx playwright test --project=chromium          # one browser
npx playwright test --grep-invert @external     # skip real HTTP checks of external links
npx playwright test tests/fhir.spec.ts --ui     # debug one file
```

| File | Checks |
| --- | --- |
| `sections.spec.ts` | Every section renders with real content; hero lines, results and their sources, skill groups; the resume PDF is served; **every project link is present** and opens in a new tab; **no phone number anywhere**; TODOs are marked and never links |
| `navigation.spec.ts` | Nav links reach their sections (not hidden under the sticky header), skip link, mobile menu, every link has a safe destination, **every external link opens in a new tab** (with `noopener`), footer badge link |
| `theme.spec.ts` | System light/dark, toggle, persistence after reload, explicit choice beats system, keyboard |
| `fhir.spec.ts` | Switch (mouse and keyboard), JSON parses, **structural FHIR R4 Practitioner validation** (`tests/support/fhir.ts`), education as qualifications matches the profile card, and the validator itself is tested |
| `pipeline.spec.ts` | Stage order and layout, titles, locations and dates from the resume, Enter/Space open and close each stage, one log at a time, aria wiring |
| `contact.spec.ts` | The `mailto:` link is built correctly (encoding, CRLF line breaks per RFC 6068, defaults) |
| `mobile.spec.ts` | No horizontal scroll at 320–768 px, hero lines wrap between words, stacked pipeline, readable text, WCAG 2.2 target size (2.5.8) |
| `motion.spec.ts` | Reduced motion shows the final state immediately; with motion the run ends on `PASS` |
| `a11y.spec.ts` | axe-core (WCAG 2.0/2.1/2.2 A + AA + best practices) in both themes, FHIR view, every pipeline log, mobile menu, 404; heading order, visible focus, works without JavaScript |
| `seo.spec.ts` | Meta, canonical, Open Graph (image really is 1200×630), favicons, robots, sitemap, JSON-LD, **no third-party requests or cookies**, 404 page |
| `external-links.spec.ts` | Real HTTP check of every external link (Chromium only), with a tracked list of known-broken links |

Browser projects: Desktop Chrome, Desktop Firefox, Desktop Safari (WebKit), Pixel 7, iPhone 15.
Retries are off on purpose: a flaky test is a defect to fix, not to hide.

## Deploy

**GitHub Pages (main site).** Push to `main`. `.github/workflows/ci.yml` builds, runs Playwright + axe +
Lighthouse, and only then deploys `dist/` to GitHub Pages. Pages must be set to **Settings → Pages → Source:
GitHub Actions** (already done for this repository). Other branches and pull requests are tested but not deployed.

**Vercel (optional mirror).** On https://vercel.com/new, import `lisnathomas/lisnathomas.github.io`. Vercel
detects Astro (build `npm run build`, output `dist`). Canonical and Open Graph URLs keep pointing at
`lisnathomas.github.io`, so search engines treat GitHub Pages as the main address.

**Regenerating the social image and favicons** (only needed after a design change):

```bash
npm run og    # renders public/og.png, public/apple-touch-icon.png, public/favicon.ico with Playwright
```

## Remaining TODOs

No placeholders are left on the site; `npm run todo` confirms it. If a fact is ever missing, use
`todo('label')` in `src/data/profile.ts`: it shows as a dashed `[TODO: label]` badge (never a link) and is listed by
`npm run todo`.

| # | Planned | How to add it (`src/data/profile.ts`) |
| --- | --- | --- |
| 1 | OpenMRS demo video | Add `{ label: 'Demo video', href: '…' }` to the `openmrs` project's `links` (the play icon is already wired up) |
| 2 | School ERP demo video | Add `{ label: 'Demo video', href: '…' }` to the `school-erp` project's `links` |

Every external link gets a real HTTP check in `tests/external-links.spec.ts`. A link that is known to be broken can
be listed in `KNOWN_BROKEN` there with a reason; the test then fails on purpose once it works again, so the list
can't go stale. The list is empty right now.
