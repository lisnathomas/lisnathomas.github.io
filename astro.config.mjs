// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lisnathomas.github.io',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: {
    // Inline small stylesheets so the first paint needs no extra request.
    inlineStylesheets: 'auto',
  },
  devToolbar: { enabled: false },
});
