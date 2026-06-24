import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// "Yakında" (noindex) sayfaları sitemap'e dahil etme. Aktifleşince buradan çıkar.
// Kıdem/ihbar yeni uzun slug'lara taşındı; aktifleşince otomatik sitemap'e girer.
// Eski kısa slug'lar public/_redirects ile yeni adreslerine 301'leniyor.
const sitemapHaricleri = ['/yillik-izin'];

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
