// Yıllık ücretli izin için parametreler — 4857 sayılı İş Kanunu m.53-59.
//
// NOT: Gelir vergisi dilimleri ve damga oranı burada TEKRARLANMAZ; hesap
// mantığı bunları src/data/tazminat.ts + src/lib/tazminat.ts üzerinden
// yeniden kullanır (tek doğruluk kaynağı).

/** Kıdem yılına göre yıllık izin bandı (gün) */
export interface IzinBandi {
  /** Kullanıcıya gösterilebilir aralık etiketi */
  etiket: string;
  /** O banda denk gelen yıllık izin gün sayısı */
  gun: number;
}

// Band seçimi src/lib/yillik-izin.ts içindedir. Sıra önemli:
//   [0] 1–5 yıl (5 dahil) · [1] 5'ten fazla – 15'ten az · [2] 15 ve üzeri
export const kidemBandlari: IzinBandi[] = [
  { etiket: '1 – 5 yıl', gun: 14 },
  { etiket: '5 yıldan fazla – 15 yıldan az', gun: 20 },
  { etiket: '15 yıl ve üzeri', gun: 26 },
];

/**
 * Yaş koruması: işçi 18 ve altı VEYA 50 ve üstü ise yıllık izin bir yıl için
 * bu asgari günden az olamaz (band 14 ise 20'ye çıkar; 26 ise 26 kalır).
 */
export const yasKorumasiAsgariGun = 20;

/** Yaş korumasının alt sınırı (bu yaş ve altı korunur) */
export const yasKorumasiAltSinir = 18;
/** Yaş korumasının üst sınırı (bu yaş ve üstü korunur) */
export const yasKorumasiUstSinir = 50;

/** SGK işçi payı oranı (izin ücreti brütüne uygulanır) */
export const sgkIsciPayi = 0.14;
/** İşsizlik sigortası işçi payı oranı */
export const issizlikIsciPayi = 0.01;
/** Toplam işçi kesinti oranı (SGK + işsizlik) — bilgi amaçlı */
export const isciKesintiToplam = 0.15;

/** Verinin son güncellendiği tarih — "Son güncelleme" rozetinde görünür */
export const sonGuncelleme = 'Ocak 2026';

/** Kaynak etiketi (şeffaflık için sayfada gösterilir) */
export const kaynak =
  'Yıllık izin süreleri: 4857 sayılı İş Kanunu m.53-59 · Gelir vergisi tarifesi: 2026 ücret geliri · Kesintiler: SGK %14 + işsizlik %1';
