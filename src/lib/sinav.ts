// KPSS DHBT puan hesaplama — SAF fonksiyonlar (UI'dan bağımsız, test edilebilir).
// Katsayılar ve test tanımları src/data/sinav.ts'ten gelir.
//
// Not: Tahmini hesaplamadır; kesin sonuç yalnızca ÖSYM tarafından açıklanır.

import { dhbtKatsayilar, dhbtTestler, duzeyler, type DhbtDuzey } from '../data/sinav';

/** Net = doğru − yanlış/4 (DHBT'de 4 yanlış 1 doğruyu götürür) */
export function hesaplaNet(dogru: number, yanlis: number): number {
  return dogru - yanlis / 4;
}

export interface DhbtGirdi {
  gyDogru: number;
  gyYanlis: number;
  gkDogru: number;
  gkYanlis: number;
  d1Dogru: number;
  d1Yanlis: number;
  d2Dogru: number;
  d2Yanlis: number;
  duzey: DhbtDuzey;
}

export interface DhbtSonuc {
  /** Her testin (0..soruSayisi aralığına kırpılmış) neti */
  netler: { GY: number; GK: number; D1: number; D2: number };
  /** Ham (kırpılmamış) puan */
  ham: number;
  /** 0–100 aralığına kırpılmış, 2 ondalık puan */
  puan: number;
  /** Uygulanan düzey kodu (P124/P123/P122) */
  duzey: DhbtDuzey;
  /** Düzeyin okunur adı (Lisans/Önlisans/Ortaöğretim) */
  duzeyAdi: string;
}

/**
 * Bir testin netini doğrular ve [0, soruSayisi] aralığına kırpar.
 * Doğru/yanlış negatif olamaz; doğru + yanlış soru sayısını aşamaz (hata).
 */
function testNet(dogru: number, yanlis: number, soruSayisi: number, ad: string): number {
  if (!Number.isFinite(dogru) || !Number.isFinite(yanlis) || dogru < 0 || yanlis < 0) {
    throw new Error(`${ad}: doğru ve yanlış sayısı negatif olamaz.`);
  }
  if (dogru + yanlis > soruSayisi) {
    throw new Error(`${ad}: doğru + yanlış toplamı ${soruSayisi} soruyu aşamaz.`);
  }
  const net = hesaplaNet(dogru, yanlis);
  return Math.max(0, Math.min(soruSayisi, net));
}

/**
 * KPSS DHBT puanını hesaplar.
 * puan = C[duzey] + r_GY·GY + r_GK·GK + r_D1·D1 + r_D2·D2 (0–100'e kırpılır)
 */
export function dhbtPuanHesapla(girdi: DhbtGirdi): DhbtSonuc {
  const gy = testNet(girdi.gyDogru, girdi.gyYanlis, dhbtTestler.GY.soruSayisi, dhbtTestler.GY.ad);
  const gk = testNet(girdi.gkDogru, girdi.gkYanlis, dhbtTestler.GK.soruSayisi, dhbtTestler.GK.ad);
  const d1 = testNet(girdi.d1Dogru, girdi.d1Yanlis, dhbtTestler.DHBT1.soruSayisi, dhbtTestler.DHBT1.ad);
  const d2 = testNet(girdi.d2Dogru, girdi.d2Yanlis, dhbtTestler.DHBT2.soruSayisi, dhbtTestler.DHBT2.ad);

  const C = dhbtKatsayilar.sabitler[girdi.duzey];
  const ham =
    C +
    dhbtKatsayilar.r_GY * gy +
    dhbtKatsayilar.r_GK * gk +
    dhbtKatsayilar.r_D1 * d1 +
    dhbtKatsayilar.r_D2 * d2;

  const puan = Math.round(Math.max(0, Math.min(100, ham)) * 100) / 100;

  return {
    netler: { GY: gy, GK: gk, D1: d1, D2: d2 },
    ham,
    puan,
    duzey: girdi.duzey,
    duzeyAdi: duzeyler[girdi.duzey],
  };
}
