import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// "Yakında" (noindex) sayfaları sitemap'e dahil etme. Aktifleşince buradan çıkar.
const sitemapHaricleri = ['/kidem-tazminati', '/ihbar-tazminati', '/yillik-izin'];

// https://astro.build/config
export default defineConfig({
  // Sitemap/canonical için kullanılır
  site: 'https://hesapustasi.net',
  integrations: [
    tailwind({
      // Temel reset'i kendi global.css'imizde yönetiyoruz
      applyBaseStyles: false,
    }),
    sitemap({
      filter: (page) =>
        !sitemapHaricleri.some((slug) => page.replace(/\/$/, '').endsWith(slug)),
    }),
  ],
});
