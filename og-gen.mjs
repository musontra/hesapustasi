// Varsayılan sosyal paylaşım görselini (public/og-default.png, 1200×630) üretir.
// Premium dil: koyu lacivert zemin + şampanya altını vurgu, Fraunces başlık.
// Yeniden üretmek için: node og-gen.mjs
import { chromium } from 'playwright';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const fraunces = pathToFileURL(
  path.join(root, 'node_modules/@fontsource-variable/fraunces/files/fraunces-latin-wght-normal.woff2'),
).href;
const inter = pathToFileURL(
  path.join(root, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2'),
).href;

const html = `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><style>
  @font-face { font-family: 'Fraunces'; src: url('${fraunces}') format('woff2-variations'); font-weight: 100 900; }
  @font-face { font-family: 'Inter'; src: url('${inter}') format('woff2-variations'); font-weight: 100 900; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px; overflow: hidden;
    background-color: #0B1020;
    background-image:
      radial-gradient(70rem 45rem at 85% -15%, rgba(217,183,121,0.10), transparent 60%),
      radial-gradient(55rem 55rem at -12% 8%, rgba(40,49,80,0.45), transparent 55%);
    color: #F4F1E9; font-family: 'Inter', sans-serif;
    display: flex; flex-direction: column; justify-content: center;
    padding: 88px 96px; position: relative;
  }
  .frame { position: absolute; inset: 28px; border: 1px solid rgba(217,183,121,0.22); border-radius: 28px; }
  .eyebrow {
    font-size: 22px; font-weight: 600; letter-spacing: 0.32em; text-transform: uppercase;
    color: #D9B779; margin-bottom: 30px;
  }
  .brand { font-family: 'Fraunces', serif; font-weight: 600; font-size: 118px; line-height: 0.98; letter-spacing: -0.03em; }
  .brand .accent { color: #D9B779; }
  .tagline { margin-top: 34px; font-size: 32px; line-height: 1.4; color: #C5CBDA; max-width: 880px; }
  .rule { margin-top: 44px; width: 132px; height: 4px; border-radius: 999px; background: #D9B779; }
  .dot {
    position: absolute; right: 92px; bottom: 80px; display: flex; align-items: center; gap: 14px;
    font-size: 24px; color: #8B93A7;
  }
  .dot span { width: 12px; height: 12px; border-radius: 50%; background: #D9B779; box-shadow: 0 0 22px rgba(217,183,121,0.6); }
</style></head>
<body>
  <div class="frame"></div>
  <div class="eyebrow">Hesaplama Araçları</div>
  <div class="brand">Hesap<span class="accent">Atölyesi</span></div>
  <div class="tagline">Kira artışı, kıdem &amp; ihbar tazminatı, yıllık izin — hızlı, sade ve güncel hesaplama.</div>
  <div class="rule"></div>
  <div class="dot"><span></span>Güncel TÜFE ile</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(async () => { await document.fonts.ready; });
await page.screenshot({ path: 'public/og-default.png' });
await browser.close();
console.log('public/og-default.png üretildi.');
