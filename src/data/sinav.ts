// KPSS DHBT puan hesaplama katsayıları
// Kaynak: 2024-KPSS DHBT istatistiklerinden kalibre edilmiştir
// Not: Tahmini hesaplamadır; kesin sonuç yalnızca ÖSYM tarafından açıklanır

export const dhbtKatsayilar = {
  r_GY: 0.255071,
  r_GK: 0.217110,
  r_D1: 1.255286,
  r_D2: 1.521659,
  sabitler: {
    P124: 27.447575, // Lisans
    P123: 27.512780, // Önlisans
    P122: 27.676366, // Ortaöğretim
  },
};

export const dhbtTestler = {
  GY:    { ad: 'Genel Yetenek',  soruSayisi: 60 },
  GK:    { ad: 'Genel Kültür',   soruSayisi: 60 },
  DHBT1: { ad: 'DHBT-1',         soruSayisi: 20 },
  DHBT2: { ad: 'DHBT-2',         soruSayisi: 20 },
};

export type DhbtDuzey = 'P124' | 'P123' | 'P122';

export const duzeyler: Record<DhbtDuzey, string> = {
  P124: 'Lisans',
  P123: 'Önlisans',
  P122: 'Ortaöğretim',
};

export const sonGuncelleme = '2024-10-16';
export const kaynak = 'ÖSYM 2024-KPSS DHBT';
