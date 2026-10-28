// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Canonical origin for og:image, canonical links and the sitemap. Change it if a custom domain is attached.
  site: 'https://guidore.netlify.app',
  integrations: [
    react(),
    // English lives at the root and Spanish under /es/; the sitemap links each page to its pair.
    sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en-US', es: 'es-PE' } } }),
  ],
});
