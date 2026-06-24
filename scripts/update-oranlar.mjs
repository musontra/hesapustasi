// Aylık TÜFE → kira oranı güncelleyici (otomasyon).
//
// scripts/evds-test.mjs'te KANITLANAN mantığın aynısını kullanır:
//   uç nokta  : https://evds3.tcmb.gov.tr/igmevdsms-dis/
//   seri      : TP.TUKFIY2025.GENEL (TÜFE genel endeks, 2025=100)
//   anahtar   : "key" HTTP header'ında (asla URL'de/logta değil)
//   formül    : M ayı = ort(M−11..M) / ort(M−23..M−12) − 1  (12 aylık ort. değişim)
//   çapalar   : Haziran 2026 ≈ %32,24 ve Mayıs 2026 ≈ %32,43 (±0,02)
//
// Davranış:
//   - İki çapadan biri bile tutmazsa: hata yaz, exitCode=1, oranlar.ts'e DOKUNMA.
//   - En güncel veri ayı D → yeni yenileme ayı = D+1, oranı = D'nin 12 aylık değişimi.
//   - Yeni yenileme ayı oranlar.ts'te zaten varsa: "değişiklik yok", dosyaya dokunma.
//   - Yoksa: tufeTablosu başına aynı formatta ekle, yaklaşan ayları/tarihleri güncelle.
//   - TEST_PR=true: oranlar.ts'e dokunma; automation/last-check.txt'e ISO tarih yaz
//     (PR hattını gerçek veriye dokunmadan denemek için zararsız değişiklik).
//
// Çalıştırma (yerel): node --env-file=.env scripts/update-oranlar.mjs
// CI'da EVDS_API_KEY ortam değişkeninden gelir.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { appendFileSync } from 'node:fs';

const ENDPOINT = 'https://evds3.tcmb.gov.tr/igmevdsms-dis/';
const SERI = 'TP.TUKFIY2025.GENEL';
const DEGER_ALANI = 'TP_TUKFIY2025_GENEL';
const BASLANGIC = '01-01-2022';
const TOLERANS = 0.02;
const CAPALAR = [
  { yenileme: 'Haziran 2026', veriYil: 2026, veriAy: 5, beklenen: 32.24 },
  { yenileme: 'Mayıs 2026',   veriYil: 2026, veriAy: 4, beklenen: 32.43 },
];

const ORANLAR_YOLU = 'src/data/oranlar.ts';
const PR_BODY_YOLU = 'automation/pr-body.md';
const LAST_CHECK_YOLU = 'automation/last-check.txt';

const AY_ADLARI = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

const ayEtiket = (y, m) => `${AY_ADLARI[m - 1]} ${y}`;
const trYuzde = (n) => `%${n.toFixed(2).replace('.', ',')}`;
const ym = (y, m) => `${y}-${String(m).padStart(2, '0')}`;
const ayEkle = (y, m, d) => {
  const t = y * 12 + (m - 1) + d;
  return { y: Math.floor(t / 12), m: (t % 12) + 1 };
};
const yuvarla = (n, b = 2) => (Number.isFinite(n) ? parseFloat(n.toFixed(b)) : 0);

const TEST_MODU = process.env.TEST_PR === 'true';

class DurError extends Error {}

function ghOutput(key, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

function dur(mesaj) {
  process.exitCode = 1;
  ghOutput('degisti', 'false');
  // process.exit() yok: Windows libuv assertion'ını önlemek için doğal çıkış.
  throw new DurError(mesaj);
}

// ---- EVDS'ten endeks çek ----
async function endeksGetir(apiKey) {
  const bugun = new Date();
  const bitis = `${String(bugun.getUTCDate()).padStart(2, '0')}-${String(
    bugun.getUTCMonth() + 1,
  ).padStart(2, '0')}-${bugun.getUTCFullYear()}`;

  const url = `${ENDPOINT}series=${SERI}&startDate=${BASLANGIC}&endDate=${bitis}&type=json`;
  const res = await fetch(url, { headers: { key: apiKey, Accept: 'application/json' } });

  const ct = res.headers.get('content-type') || '';
  if (!res.ok) {
    const govde = await res.text().catch(() => '');
    dur(`EVDS yanıtı başarısız: HTTP ${res.status}. ${govde.slice(0, 200)}`);
  }
  if (!ct.includes('json')) {
    // Uç nokta/host değiştiyse EVDS API yerine HTML (web uygulaması) döner.
    dur('EVDS JSON yerine JSON-dışı içerik döndürdü (uç nokta değişmiş olabilir).');
  }

  const data = await res.json();
  const items = data?.items;
  if (!Array.isArray(items) || items.length === 0) dur('EVDS yanıtında "items" yok ya da boş.');

  const endeks = {};
  for (const it of items) {
    if (!it?.Tarih || it[DEGER_ALANI] == null || it[DEGER_ALANI] === '') continue;
    const [yS, mS] = String(it.Tarih).split('-');
    const y = parseInt(yS, 10);
    const m = parseInt(mS, 10);
    const v = parseFloat(String(it[DEGER_ALANI]).replace(',', '.'));
    if (Number.isFinite(y) && Number.isFinite(m) && Number.isFinite(v)) endeks[ym(y, m)] = v;
  }
  if (Object.keys(endeks).length === 0) dur(`Geçerli endeks değeri yok (alan "${DEGER_ALANI}" doğru mu?).`);
  return endeks;
}

const ort12 = (endeks, y, m) => {
  let s = 0;
  for (let k = 0; k < 12; k++) {
    const d = ayEkle(y, m, -k);
    const v = endeks[ym(d.y, d.m)];
    if (v == null) return null;
    s += v;
  }
  return s / 12;
};

const degisim12 = (endeks, y, m) => {
  const guncel = ort12(endeks, y, m);
  const p = ayEkle(y, m, -12);
  const onceki = ort12(endeks, p.y, p.m);
  if (guncel == null || onceki == null) return null;
  return (guncel / onceki - 1) * 100;
};

// Çapaları doğrula; tutmazsa dur().
function capalariDogrula(endeks) {
  console.log('Çapa doğrulaması (tolerans ±0,02):');
  let hepsi = true;
  for (const c of CAPALAR) {
    const d = degisim12(endeks, c.veriYil, c.veriAy);
    const fark = d == null ? Infinity : Math.abs(d - c.beklenen);
    const tutti = fark <= TOLERANS;
    if (!tutti) hepsi = false;
    console.log(
      `  ${c.yenileme.padEnd(14)} → hesaplanan ${d == null ? 'VERİ YOK' : trYuzde(d)} | ` +
        `beklenen ${trYuzde(c.beklenen)} → ${tutti ? 'EŞLEŞTİ ✅' : 'EŞLEŞMEDİ ❌'}`,
    );
  }
  if (!hepsi) {
    dur('Çapalar tutmadı — seri/baz değişmiş olabilir. Güvenlik için oranlar.ts güncellenmedi.');
  }
}

// En güncel hesaplanabilir veri ayını bul.
function sonVeriAyi(endeks) {
  const aylar = Object.keys(endeks)
    .map((k) => k.split('-').map(Number))
    .filter(([y, m]) => degisim12(endeks, y, m) != null)
    .sort((a, b) => a[0] * 12 + a[1] - (b[0] * 12 + b[1]));
  if (aylar.length === 0) dur('12 aylık değişim için yeterli (24 aylık) veri yok.');
  const [y, m] = aylar[aylar.length - 1];
  return { y, m, degisim: degisim12(endeks, y, m) };
}

// ---- oranlar.ts düzenleme ----
function mevcutDonemler(metin) {
  return [...metin.matchAll(/donem:\s*'([^']+)'/g)].map((mm) => mm[1]);
}

function oranlariGuncelle(metin, yeniDonem, oranSayi, tarihTR, yaklasan) {
  const eol = metin.includes('\r\n') ? '\r\n' : '\n';
  const satirlar = metin.split(/\r?\n/);

  // 1) tufeTablosu başına yeni dönem ekle (mevcut girdilerle birebir format).
  const tabloIdx = satirlar.findIndex((s) => s.includes('tufeTablosu: TufeDonem[] = ['));
  if (tabloIdx === -1) dur('oranlar.ts içinde tufeTablosu bulunamadı (yapı değişmiş).');
  const yeniSatir = `  { donem: '${yeniDonem}', oran: ${oranSayi.toFixed(2)} },`;
  satirlar.splice(tabloIdx + 1, 0, yeniSatir);

  // 2) yaklasanDonemler'i yeniden yaz (yeni aktif ayın sonraki iki ayı).
  const yakIdx = satirlar.findIndex((s) => s.includes('export const yaklasanDonemler'));
  if (yakIdx === -1) dur('oranlar.ts içinde yaklasanDonemler bulunamadı.');
  const yakListe = yaklasan.map((d) => `'${d}'`).join(', ');
  satirlar[yakIdx] = `export const yaklasanDonemler: string[] = [${yakListe}];`;

  // 3) sonGuncelleme tarihi.
  const sgIdx = satirlar.findIndex((s) => s.includes('export const sonGuncelleme'));
  if (sgIdx !== -1) satirlar[sgIdx] = `export const sonGuncelleme = '${tarihTR}';`;

  // 4) kaynak etiketi (tarih içerir).
  const kIdx = satirlar.findIndex((s) => s.includes('export const kaynak'));
  if (kIdx !== -1) {
    satirlar[kIdx] =
      `export const kaynak = 'TÜFE 12 aylık ortalama — Kaynak: TÜİK, son güncelleme ${tarihTR}';`;
  }

  return satirlar.join(eol);
}

function prBody({ yeniDonem, oranSayi, sonVeri, endeks, test }) {
  const bugun = new Date();
  const tarihTR = `${bugun.getUTCDate()} ${AY_ADLARI[bugun.getUTCMonth()]} ${bugun.getUTCFullYear()}`;
  const son3 = Object.keys(endeks)
    .sort()
    .slice(-3)
    .map((k) => {
      const [y, m] = k.split('-').map(Number);
      return `- ${ayEtiket(y, m)}: ${endeks[k]}`;
    })
    .join('\n');
  const capaSatir = CAPALAR.map((c) => {
    const d = degisim12(endeks, c.veriYil, c.veriAy);
    return `- ${c.yenileme}: hesaplanan ${trYuzde(d)} / beklenen ${trYuzde(c.beklenen)} → ${
      Math.abs(d - c.beklenen) <= TOLERANS ? 'EŞLEŞTİ ✅' : 'EŞLEŞMEDİ ❌'
    }`;
  }).join('\n');

  return `${test ? '> ⚙️ **TEST ÇALIŞMASI** — gerçek oran değiştirilmedi; yalnızca PR hattı deneniyor.\n\n' : ''}## TÜFE / Kira Oranı Güncellemesi

**Yeni yenileme ayı:** ${yeniDonem}
**Hesaplanan oran:** ${trYuzde(oranSayi)} (12 aylık TÜFE ortalamasına göre değişim)
**En güncel veri ayı:** ${ayEtiket(sonVeri.y, sonVeri.m)}

### Kullanılan son endeks değerleri (TP.TUKFIY2025.GENEL, 2025=100)
${son3}

### Çapa doğrulaması
${capaSatir}

### Kaynak
TÜİK / TCMB EVDS — seri \`TP.TUKFIY2025.GENEL\`, ${tarihTR}.

---
⚠️ **Merge etmeden önce bu oranı TÜİK'in resmî açıklamasıyla karşılaştırın.** Otomasyon yalnızca öneri üretir; nihai onay insandadır. PR otomatik merge EDİLMEZ.
`;
}

// ---- Ana akış ----
async function main() {
  const apiKey = process.env.EVDS_API_KEY;
  if (!apiKey || !apiKey.trim()) dur('EVDS_API_KEY tanımlı değil.');

  const endeks = await endeksGetir(apiKey);
  capalariDogrula(endeks);

  const sonVeri = sonVeriAyi(endeks);
  const yen = ayEkle(sonVeri.y, sonVeri.m, 1);
  const yeniDonem = ayEtiket(yen.y, yen.m);
  const oranSayi = yuvarla(sonVeri.degisim, 2);

  console.log(
    `\nEn güncel veri: ${ayEtiket(sonVeri.y, sonVeri.m)} → ` +
      `${yeniDonem} yenileme oranı = ${trYuzde(oranSayi)}`,
  );

  // ---- TEST modu: gerçek veriye dokunma ----
  if (TEST_MODU) {
    await mkdir('automation', { recursive: true });
    await writeFile(LAST_CHECK_YOLU, `${new Date().toISOString()}\n`, 'utf8');
    await writeFile(PR_BODY_YOLU, prBody({ yeniDonem, oranSayi, sonVeri, endeks, test: true }), 'utf8');
    ghOutput('title', `[TEST] TÜFE otomasyon hattı denemesi (${yeniDonem})`);
    ghOutput('degisti', 'true');
    console.log('\nTEST modu: automation/last-check.txt güncellendi (oranlar.ts değişmedi).');
    return;
  }

  // ---- Gerçek mod ----
  const metin = await readFile(ORANLAR_YOLU, 'utf8');
  const donemler = mevcutDonemler(metin);

  if (donemler.includes(yeniDonem)) {
    ghOutput('degisti', 'false');
    console.log(`\nDeğişiklik yok: ${yeniDonem} oranlar.ts'te zaten mevcut. Dosyaya dokunulmadı.`);
    return;
  }

  // Yeni aktif ayın sonraki iki ayı "yaklaşan" olur.
  const y1 = ayEkle(yen.y, yen.m, 1);
  const y2 = ayEkle(yen.y, yen.m, 2);
  const yaklasan = [ayEtiket(y1.y, y1.m), ayEtiket(y2.y, y2.m)];

  const bugun = new Date();
  const tarihTR = `${bugun.getUTCDate()} ${AY_ADLARI[bugun.getUTCMonth()]} ${bugun.getUTCFullYear()}`;

  const yeniMetin = oranlariGuncelle(metin, yeniDonem, oranSayi, tarihTR, yaklasan);
  await writeFile(ORANLAR_YOLU, yeniMetin, 'utf8');

  await mkdir('automation', { recursive: true });
  await writeFile(PR_BODY_YOLU, prBody({ yeniDonem, oranSayi, sonVeri, endeks, test: false }), 'utf8');
  ghOutput('title', `TÜFE güncellemesi: ${yeniDonem} kira oranı ${trYuzde(oranSayi)}`);
  ghOutput('degisti', 'true');
  console.log(`\nDEĞİŞİKLİK: ${yeniDonem} = ${trYuzde(oranSayi)} eklendi. oranlar.ts güncellendi.`);
}

main().catch((e) => {
  if (!(e instanceof DurError)) {
    console.error(`\n❌ Beklenmeyen hata: ${e.message}\n`);
    process.exitCode = 1;
    ghOutput('degisti', 'false');
  } else {
    console.error(`\n❌ ${e.message}\n`);
  }
});
