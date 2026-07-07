// Yıllık izin doğrulama — TEK SEFERLİK ÇAPA TESTİ.
// src/lib/yillik-izin.ts (+ tazminat'tan yeniden kullanılan hizmetSuresi /
// marjinalGelirVergisi) mantığının saf-JS aynası. Node 20 .ts import edemediği
// için ayna; formül değişirse İKİSİ de güncellenmeli.
//
// Çalıştırma:  node scripts/yillik-izin-test.mjs   (Node 20+, harici paket YOK)

// --- tazminat'tan yeniden kullanılan değerler/mantık (ayna) ---
const DAMGA_ORANI = 0.00759;
const GELIR_VERGISI_DILIMLERI = [
  { ustSinir: 190000, oran: 0.15 },
  { ustSinir: 400000, oran: 0.2 },
  { ustSinir: 1500000, oran: 0.27 },
  { ustSinir: 5300000, oran: 0.35 },
  { ustSinir: Infinity, oran: 0.4 },
];

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

// --- yillik-izin mantığının aynası ---
const KIDEM_BANDLARI = [14, 20, 26];
const YAS_KORUMA_ASGARI = 20;
const YAS_ALT = 18;
const YAS_UST = 50;
const SGK = 0.14;
const ISSIZLIK = 0.01;

function bandFor(tamYil) {
  if (tamYil >= 15) return KIDEM_BANDLARI[2];
  if (tamYil > 5) return KIDEM_BANDLARI[1];
  return KIDEM_BANDLARI[0];
}

function yillikIzinHakki({ giris, referansTarih, dogum }) {
  const sure = hizmetSuresi(giris, referansTarih);
  const kidem = { yil: sure.yil, ay: sure.ay, gun: sure.gun };
  const yas = dogum ? hizmetSuresi(dogum, referansTarih).yil : null;
  const yasKorumasi = yas !== null && (yas >= YAS_UST || yas <= YAS_ALT);
  if (sure.toplamYil < 1) {
    return { hakKazanildi: false, kidem, yas, yasKorumasiUygulandi: yasKorumasi, yillikHak: 0, birikenToplam: 0 };
  }
  const N = sure.yil;
  const taban = yasKorumasi ? YAS_KORUMA_ASGARI : 0;
  const yillikHak = Math.max(bandFor(N), taban);
  let birikenToplam = 0;
  for (let i = 1; i <= N; i++) birikenToplam += Math.max(bandFor(i), taban);
  return { hakKazanildi: true, kidem, yas, yasKorumasiUygulandi: yasKorumasi, yillikHak, birikenToplam };
}

function izinUcreti({ aylikCiplakBrut, kullanilmayanGun, kumulatifMatrah = 0 }) {
  const gunlukBrut = aylikCiplakBrut / 30;
  const brutHam = gunlukBrut * kullanilmayanGun;
  const sgkHam = brutHam * SGK;
  const issizlikHam = brutHam * ISSIZLIK;
  const sgkToplamHam = sgkHam + issizlikHam;
  const gvMatrah = brutHam - sgkToplamHam;
  const { vergi, uygulananOran } = marjinalGelirVergisi(kumulatifMatrah, gvMatrah);
  const damgaHam = brutHam * DAMGA_ORANI;
  return {
    gunlukBrut: round2(gunlukBrut),
    brut: round2(brutHam),
    sgk: round2(sgkHam),
    issizlik: round2(issizlikHam),
    sgkToplam: round2(sgkToplamHam),
    gelirVergisi: vergi,
    uygulananDilim: uygulananOran,
    damga: round2(damgaHam),
    net: round2(brutHam - sgkToplamHam - vergi - damgaHam),
  };
}

// --- Çapalar ---
const TOL = 0.02;
const yakin = (a, b) => Math.abs(a - b) <= TOL;
let tumYesil = true;

function denetle(baslik, alanlar) {
  const eslesti = alanlar.every(([, b, g]) => (typeof b === 'boolean' ? b === g : yakin(b, g)));
  tumYesil = tumYesil && eslesti;
  console.log(`\n${baslik}: ${eslesti ? 'EŞLEŞTİ ✅' : 'EŞLEŞMEDİ ❌'}`);
  for (const [ad, b, g] of alanlar) {
    const ok = (typeof b === 'boolean' ? b === g : yakin(b, g)) ? '  ' : '→ ';
    console.log(`  ${ok}${ad.padEnd(14)} beklenen ${String(b).padStart(12)} | gerçek ${String(g).padStart(12)}`);
  }
}

// Gün çapaları
let r;
r = yillikIzinHakki({ giris: '2023-06-01', referansTarih: '2026-06-01', dogum: '1990-01-01' });
denetle('ÇAPA 1 — 3 yıl, 36 yaş', [['yillikHak', 14, r.yillikHak], ['biriken', 42, r.birikenToplam]]);

r = yillikIzinHakki({ giris: '2019-06-01', referansTarih: '2026-06-01', dogum: '1990-01-01' });
denetle('ÇAPA 2 — 7 yıl, 36 yaş', [['yillikHak', 20, r.yillikHak], ['biriken', 110, r.birikenToplam]]);

r = yillikIzinHakki({ giris: '2023-06-01', referansTarih: '2026-06-01', dogum: '1974-01-01' });
denetle('ÇAPA 3 — 3 yıl, 52 yaş (koruma)', [['yillikHak', 20, r.yillikHak], ['biriken', 60, r.birikenToplam]]);

r = yillikIzinHakki({ giris: '2010-06-01', referansTarih: '2026-06-01', dogum: '1986-01-01' });
denetle('ÇAPA 4 — 16 yıl, 40 yaş', [['yillikHak', 26, r.yillikHak], ['biriken', 302, r.birikenToplam]]);

r = yillikIzinHakki({ giris: '2025-12-01', referansTarih: '2026-06-01' });
denetle('ÇAPA 5 — <1 yıl', [['hakKazanildi', false, r.hakKazanildi]]);

// Ücret çapası
const u = izinUcreti({ aylikCiplakBrut: 60000, kullanilmayanGun: 14, kumulatifMatrah: 0 });
denetle('ÇAPA 6 — izin ücreti', [
  ['brüt', 28000.0, u.brut],
  ['sgkToplam', 4200.0, u.sgkToplam],
  ['gelirVergisi', 3570.0, u.gelirVergisi],
  ['damga', 212.52, u.damga],
  ['net', 20017.48, u.net],
]);

console.log(`\n${tumYesil ? 'TÜM ÇAPALAR EŞLEŞTİ ✅' : 'BAZI ÇAPALAR TUTMADI ❌'}`);
process.exitCode = tumYesil ? 0 : 1;
