// Resmî oranların merkezi kaynağı.
//
// AYLIK GÜNCELLEME: TÜİK yeni 12 aylık TÜFE ortalamasını açıkladığında
//   1) "tufeTablosu" başına yeni dönemi ekle (en yeni en üstte),
//   2) gerekiyorsa "yaklasanDonemler" listesini güncelle,
//   3) "sonGuncelleme" tarihini değiştir.
// Sayfalardaki "Son güncelleme" rozeti ve kira oranları buradan beslenir.

export interface TufeDonem {
  /** Kullanıcıya gösterilen dönem adı, ör. "Haziran 2026" */
  donem: string;
  /** O döneme ait 12 aylık TÜFE ortalama artış oranı (yüzde) */
  oran: number;
}

// Konut ve işyeri için aynı oran (kira artış tavanı = 12 aylık TÜFE ortalaması).
// En yeni dönem en üstte → tufeTablosu[0] varsayılan/güncel orandır.
export const tufeTablosu: TufeDonem[] = [
  { donem: 'Temmuz 2026', oran: 32.03 },
  { donem: 'Haziran 2026', oran: 32.24 },
  { donem: 'Mayıs 2026', oran: 32.43 },
  { donem: 'Nisan 2026', oran: 32.82 },
  { donem: 'Mart 2026', oran: 33.39 },
  { donem: 'Şubat 2026', oran: 33.98 },
  { donem: 'Ocak 2026', oran: 34.88 },
  { donem: 'Aralık 2025', oran: 35.91 },
  { donem: 'Kasım 2025', oran: 37.15 },
  { donem: 'Ekim 2025', oran: 38.06 },
  { donem: 'Eylül 2025', oran: 39.48 },
  { donem: 'Ağustos 2025', oran: 41.22 },
  { donem: 'Temmuz 2025', oran: 43.95 },
  { donem: 'Haziran 2025', oran: 46.72 },
  { donem: 'Mayıs 2025', oran: 49.35 },
  { donem: 'Nisan 2025', oran: 51.86 },
  { donem: 'Mart 2025', oran: 54.28 },
  { donem: 'Şubat 2025', oran: 56.35 },
  { donem: 'Ocak 2025', oran: 58.51 },
];

// Henüz oranı açıklanmamış (yaklaşan) dönemler. Açılır listede görünür ama
// seçilince "bu dönem henüz açıklanmadı" durumu gösterilir.
export const yaklasanDonemler: string[] = ['Ağustos 2026', 'Eylül 2026'];

/** Güncel/varsayılan dönem (en yeni açıklanan ay) */
export const guncelDonem: TufeDonem = tufeTablosu[0];

/** Verinin son güncellendiği tarih — "Son güncelleme" rozetinde görünür */
export const sonGuncelleme = '6 Temmuz 2026';

/** Kaynak etiketi (şeffaflık için sayfada gösterilir) */
export const kaynak = 'TÜFE 12 aylık ortalama — Kaynak: TÜİK, son güncelleme 6 Temmuz 2026';

/** Bir döneme ait oranı bulur; tabloda yoksa undefined döner */
export function oranBul(donem: string): number | undefined {
  return tufeTablosu.find((d) => d.donem === donem)?.oran;
}

// Geriye dönük uyumluluk + ortak bileşenlerin kullandığı özet nesne.
export const tufe = {
  tufeYuzde: guncelDonem.oran,
  donem: guncelDonem.donem,
  sonGuncelleme,
  kaynak,
};
