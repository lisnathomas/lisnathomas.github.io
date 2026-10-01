/**
 * Lighthouse CI: fails the build if any category scores below 95.
 * Serves the built site (dist/), runs it three times, and
 * asserts on the median run. Reports are written to .lighthouseci/ and
 * uploaded as a GitHub Actions artifact (nothing is sent to a public server).
 */
module.exports = {
  ci: {
    collect: {
      // LHCI serves dist/ itself; audit the home page only (404.html is noindex by design).
      staticDistDir: './dist',
      url: ['http://localhost/index.html'],
      numberOfRuns: 3,
      settings: {
        // Default is a throttled mid-range phone, the harder of the two profiles.
        chromeFlags: '--no-sandbox',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:seo': ['error', { minScore: 0.95 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouseci',
    },
  },
};
