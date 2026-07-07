// KPSS DHBT puan doğrulama — TEK SEFERLİK ÇAPA TESTİ.
// src/lib/sinav.ts + src/data/sinav.ts mantığının saf-JS aynası (Node 20 .ts
// import edemediği için). Formül/katsayı değişirse İKİSİ de güncellenmeli.
//
// Çalıştırma:  node scripts/sinav-test.mjs   (Node 20+, harici paket YOK)

// --- src/data/sinav.ts (ayna) ---
const K = {
  r_GY: 0.255071,
  r_GK: 0.217110,
  r_D1: 1.255286,
  r_D2: 1.521659,
  sabitler: { P124: 27.447575, P123: 27.512780, P122: 27.676366 },
};
const TESTLER = {
  GY: { ad: 'Genel Yetenek', soruSayisi: 60 },
  GK: { ad: 'Genel Kültür', soruSayisi: 60 },
  DHBT1: { ad: 'DHBT-1', soruSayisi: 20 },
  DHBT2: { ad: 'DHBT-2', soruSayisi: 20 },
};
const DUZEYLER = { P124: 'Lisans', P123: 'Önlisans', P122: 'Ortaöğretim' };

// --- src/lib/sinav.ts (ayna) ---
const hesaplaNet = (dogru, yanlis) => dogru - yanlis / 4;

function testNet(dogru, yanlis, soruSayisi, ad) {
  if (!Number.isFinite(dogru) || !Number.isFinite(yanlis) || dogru < 0 || yanlis < 0) {
    throw new Error(`${ad}: doğru ve yanlış sayısı negatif olamaz.`);
  }
  if (dogru + yanlis > soruSayisi) {
    throw new Error(`${ad}: doğru + yanlış toplamı ${soruSayisi} soruyu aşamaz.`);
  }
  return Math.max(0, Math.min(soruSayisi, hesaplaNet(dogru, yanlis)));
}

function dhbtPuanHesapla(g) {
  const gy = testNet(g.gyDogru, g.gyYanlis, TESTLER.GY.soruSayisi, TESTLER.GY.ad);
  const gk = testNet(g.gkDogru, g.gkYanlis, TESTLER.GK.soruSayisi, TESTLER.GK.ad);
  const d1 = testNet(g.d1Dogru, g.d1Yanlis, TESTLER.DHBT1.soruSayisi, TESTLER.DHBT1.ad);
  const d2 = testNet(g.d2Dogru, g.d2Yanlis, TESTLER.DHBT2.soruSayisi, TESTLER.DHBT2.ad);
  const C = K.sabitler[g.duzey];
  const ham = C + K.r_GY * gy + K.r_GK * gk + K.r_D1 * d1 + K.r_D2 * d2;
  const puan = Math.round(Math.max(0, Math.min(100, ham)) * 100) / 100;
  return { netler: { GY: gy, GK: gk, D1: d1, D2: d2 }, ham, puan, duzey: g.duzey, duzeyAdi: DUZEYLER[g.duzey] };
}

// Kısa girdi yardımcısı (yalnızca doğru sayıları; yanlış varsayılan 0)
const g = (duzey, gy, gk, d1, d2, gyY = 0, gkY = 0, d1Y = 0, d2Y = 0) => ({
  duzey, gyDogru: gy, gyYanlis: gyY, gkDogru: gk, gkYanlis: gkY,
  d1Dogru: d1, d1Yanlis: d1Y, d2Dogru: d2, d2Yanlis: d2Y,
});

// --- Çapalar ---
const TOL = 0.05;
let tumYesil = true;

function denetle(baslik, girdi, beklenen) {
  let gercek, eslesti;
  try {
    gercek = dhbtPuanHesapla(girdi).puan;
    eslesti = Math.abs(gercek - beklenen) <= TOL;
  } catch (e) {
    gercek = `HATA: ${e.message}`;
    eslesti = false;
  }
  tumYesil = tumYesil && eslesti;
  console.log(`${eslesti ? '✅' : '❌'} ${baslik.padEnd(34)} beklenen ${String(beklenen).padStart(8)} | gerçek ${gercek}`);
}

function denetleHata(baslik, girdi) {
  let eslesti = false;
  let sonuc;
  try {
    sonuc = dhbtPuanHesapla(girdi).puan;
  } catch {
    eslesti = true;
  }
  tumYesil = tumYesil && eslesti;
  console.log(`${eslesti ? '✅' : '❌'} ${baslik.padEnd(34)} ${eslesti ? 'hata fırlattı (beklendiği gibi)' : `HATA BEKLENİYORDU, puan=${sonuc}`}`);
}

denetle('P124 40/35/15/15',          g('P124', 40, 35, 15, 15), 86.903);
denetle('P124 50/45/18/18',          g('P124', 50, 45, 18, 18), 99.956);
denetle('P124 35/30/18/5',           g('P124', 35, 30, 18, 5),  73.089);
denetle('P123 30/25/10/10',          g('P123', 30, 25, 10, 10), 68.372);
denetle('P122 38/32/11/14',          g('P122', 38, 32, 11, 14), 79.441);
denetle('P124 40D8Y/35D4Y/15/15',    g('P124', 40, 35, 15, 15, 8, 4, 0, 0), 86.176);
denetle('Sınır: hepsi 0 (C sabiti)', g('P124', 0, 0, 0, 0), 27.448);
denetleHata('Geçersiz: GY 70>60',    g('P124', 70, 35, 15, 15));

console.log(`\n${tumYesil ? 'TÜM ÇAPALAR EŞLEŞTİ ✅' : 'BAZI ÇAPALAR TUTMADI ❌'}`);
process.exitCode = tumYesil ? 0 : 1;
