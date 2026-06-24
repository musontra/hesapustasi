// Kıdem & ihbar tazminatı doğrulama — TEK SEFERLİK ÇAPA TESTİ.
// Amaç: src/lib/tazminat.ts'teki formüllerin (hizmet süresi, tavan, marjinal
// gelir vergisi, damga) bilinen İKİ çapayla doğru sonuç verdiğini kanıtlamak.
//
// Çalıştırma:  node scripts/tazminat-test.mjs
// Gerekli: Node 20+ (yerleşik özellikler). Harici paket YOK.
//
// NOT: Bu script, src/lib/tazminat.ts mantığının saf-JS aynasıdır (Node 20
// .ts import edemediği için). Formül değişirse İKİSİ de güncellenmeli.

// --- src/data/tazminat.ts verileri (ayna) ---
const KIDEM_TAVAN_DONEMLERI = [
  { bas: '2026-01-01', bit: '2026-06-30', tavan: 64948.77 },
  { bas: '2025-07-01', bit: '2025-12-31', tavan: 53919.68 },
  { bas: '2025-01-01', bit: '2025-06-30', tavan: 46655.43 },
];
const DAMGA_ORANI = 0.00759;
const GELIR_VERGISI_DILIMLERI = [
  { ustSinir: 190000, oran: 0.15 },
  { ustSinir: 400000, oran: 0.2 },
  { ustSinir: 1500000, oran: 0.27 },
  { ustSinir: 5300000, oran: 0.35 },
  { ustSinir: Infinity, oran: 0.4 },
];

// --- src/lib/tazminat.ts mantığının aynası ---
const round2 = (d) => Math.round(d * 100) / 100;

function parseTarih(iso) {
  const [y, a, g] = iso.split('-').map(Number);
  return new Date(y, a - 1, g);
}

function hizmetSuresi(giris, cikis) {
  const g = parseTarih(giris);
  const c = parseTarih(cikis);
  let yil = c.getFullYear() - g.getFullYear();
  let ay = c.getMonth() - g.getMonth();
  let gun = c.getDate() - g.getDate();
  if (gun < 0) {
    ay -= 1;
    gun += new Date(c.getFullYear(), c.getMonth(), 0).getDate();
  }
  if (ay < 0) {
    yil -= 1;
    ay += 12;
  }
  return { yil, ay, gun, toplamYil: yil + ay / 12 + gun / 365 };
}

function tavanBul(cikis) {
  return KIDEM_TAVAN_DONEMLERI.find((d) => cikis >= d.bas && cikis <= d.bit)?.tavan;
}

function kidemTazminati({ giydirilmisAylikBrut, giris, cikis }) {
  const sure = hizmetSuresi(giris, cikis);
  if (sure.toplamYil < 1) return { hakKazanildi: false, sure };
  const tavan = tavanBul(cikis);
  if (tavan === undefined) return { hakKazanildi: true, tavanYok: true, sure };
  const matrah = Math.min(giydirilmisAylikBrut, tavan);
  const brutHam = matrah * sure.toplamYil;
  const damgaHam = brutHam * DAMGA_ORANI;
  return {
    hakKazanildi: true,
    sure,
    tavan,
    tavanUygulandi: giydirilmisAylikBrut > tavan,
    matrah: round2(matrah),
    brut: round2(brutHam),
    damga: round2(damgaHam),
    net: round2(brutHam - damgaHam),
  };
}

function marjinalGelirVergisi(kumulatifMatrah, ekTutar) {
  const baslangic = Math.max(0, kumulatifMatrah);
  const bitis = baslangic + Math.max(0, ekTutar);
  let vergi = 0;
  let uygulananOran = GELIR_VERGISI_DILIMLERI[0].oran;
  let altSinir = 0;
  for (const dilim of GELIR_VERGISI_DILIMLERI) {
    const kAlt = Math.max(baslangic, altSinir);
    const kUst = Math.min(bitis, dilim.ustSinir);
    if (kUst > kAlt) {
      vergi += (kUst - kAlt) * dilim.oran;
      uygulananOran = dilim.oran;
    }
    if (bitis <= dilim.ustSinir) break;
    altSinir = dilim.ustSinir;
  }
  return { vergi: round2(vergi), uygulananOran };
}

function ihbarGunuSec(toplamYil) {
  if (toplamYil < 0.5) return 14;
  if (toplamYil <= 1.5) return 28;
  if (toplamYil <= 3) return 42;
  return 56;
}

function ihbarTazminati({ giydirilmisAylikBrut, giris, cikis, kumulatifMatrah = 0 }) {
  const sure = hizmetSuresi(giris, cikis);
  const ihbarGun = ihbarGunuSec(sure.toplamYil);
  const gunlukBrut = giydirilmisAylikBrut / 30;
  const brutHam = gunlukBrut * ihbarGun;
  const { vergi, uygulananOran } = marjinalGelirVergisi(kumulatifMatrah, brutHam);
  const damgaHam = brutHam * DAMGA_ORANI;
  return {
    sure,
    ihbarGun,
    gunlukBrut: round2(gunlukBrut),
    brut: round2(brutHam),
    gelirVergisi: vergi,
    uygulananDilim: uygulananOran,
    damga: round2(damgaHam),
    net: round2(brutHam - vergi - damgaHam),
  };
}

// --- Çapalar ---
const TOLERANS = 0.02;
const yakin = (a, b) => Math.abs(a - b) <= TOLERANS;
const tl = (n) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

let tumYesil = true;

function denetle(baslik, alanlar) {
  const eslesti = alanlar.every(([, beklenen, gercek]) => yakin(beklenen, gercek));
  tumYesil = tumYesil && eslesti;
  console.log(`\n${baslik}: ${eslesti ? 'EŞLEŞTİ ✅' : 'EŞLEŞMEDİ ❌'}`);
  for (const [ad, beklenen, gercek] of alanlar) {
    const ok = yakin(beklenen, gercek) ? '  ' : '→ ';
    console.log(`  ${ok}${ad.padEnd(14)} beklenen ${tl(beklenen).padStart(14)} | gerçek ${tl(gercek).padStart(14)}`);
  }
}

// Çapa 1 — Kıdem
const k = kidemTazminati({ giydirilmisAylikBrut: 50000, giris: '2024-09-01', cikis: '2026-06-01' });
denetle('ÇAPA 1 — Kıdem tazminatı', [
  ['brüt', 87500.0, k.brut],
  ['net', 86835.88, k.net],
]);

// Çapa 2 — İhbar
const i = ihbarTazminati({ giydirilmisAylikBrut: 90000, giris: '2022-06-01', cikis: '2026-06-01', kumulatifMatrah: 0 });
denetle('ÇAPA 2 — İhbar tazminatı', [
  ['brüt', 168000.0, i.brut],
  ['gelirVergisi', 25200.0, i.gelirVergisi],
  ['damga', 1275.12, i.damga],
  ['net', 141524.88, i.net],
]);

console.log(`\n${tumYesil ? 'TÜM ÇAPALAR EŞLEŞTİ ✅' : 'BAZI ÇAPALAR TUTMADI ❌'}`);
process.exitCode = tumYesil ? 0 : 1;
