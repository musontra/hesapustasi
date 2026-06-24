// Kıdem & ihbar tazminatı için resmî oran/parametrelerin merkezi kaynağı.
//
// GÜNCELLEME NOTLARI:
//   - Kıdem tazminatı TAVANI her 6 ayda bir (Ocak/Temmuz) değişir. Yeni dönem
//     açıklandığında "kidemTavanDonemleri" başına yeni aralığı ekle (en yeni
//     en üstte) ve "sonGuncelleme" tarihini güncelle.
//   - Gelir vergisi dilimleri her yıl yeniden belirlenir; yıl değişince
//     "gelirVergisiDilimleri2026" güncellenmeli.
//   - Çıkış tarihi tablodaki hiçbir döneme düşmüyorsa hesap "tavan henüz
//     açıklanmadı" diyerek durur (yanlış/eski tavanla hesap yapılmaz).

/** Kıdem tazminatı tavanının geçerli olduğu bir dönem (tarih aralığı) */
export interface KidemTavanDonem {
  /** Dönem başlangıcı (dahil), ISO 'YYYY-MM-DD' */
  bas: string;
  /** Dönem bitişi (dahil), ISO 'YYYY-MM-DD' */
  bit: string;
  /** O döneme ait kıdem tazminatı brüt tavanı (TL) */
  tavan: number;
}

// En yeni dönem en üstte. Çıkış tarihi hangi aralığa düşerse o dönemin tavanı
// kullanılır. 2026-07-01 ve sonrası HENÜZ AÇIKLANMADI — bilinçli olarak yok.
export const kidemTavanDonemleri: KidemTavanDonem[] = [
  { bas: '2026-01-01', bit: '2026-06-30', tavan: 64948.77 },
  { bas: '2025-07-01', bit: '2025-12-31', tavan: 53919.68 },
  { bas: '2025-01-01', bit: '2025-06-30', tavan: 46655.43 },
];

/** Damga vergisi oranı (kıdem ve ihbar brütüne uygulanır) */
export const damgaVergisiOrani = 0.00759;

/** Gelir vergisi dilimi: kümülatif matrah üst sınırı + o dilimin oranı */
export interface GelirVergisiDilim {
  /** Bu dilimin kümülatif matrah üst sınırı (TL); son dilimde Infinity */
  ustSinir: number;
  /** Bu dilime düşen kısma uygulanan oran (örn. 0.15 => %15) */
  oran: number;
}

// 2026 ücret geliri gelir vergisi tarifesi (kümülatif). Marjinal uygulanır:
// matrahın her dilime düşen kısmı kendi oranından vergilendirilir.
export const gelirVergisiDilimleri2026: GelirVergisiDilim[] = [
  { ustSinir: 190000, oran: 0.15 },
  { ustSinir: 400000, oran: 0.2 },
  { ustSinir: 1500000, oran: 0.27 },
  { ustSinir: 5300000, oran: 0.35 },
  { ustSinir: Infinity, oran: 0.4 },
];

/** İhbar süresi bandı (kıdeme göre seçilir) */
export interface IhbarSuresi {
  /** Kullanıcıya gösterilebilir aralık etiketi */
  etiket: string;
  /** Bu banda denk gelen ihbar süresi (gün) */
  gun: number;
}

// İş Kanunu m.17 ihbar süreleri. Band seçimi src/lib/tazminat.ts içindedir;
// bant sınırları yasadaki "...ya kadar" (üst sınır dahil) mantığına uyar.
export const ihbarSureleri: IhbarSuresi[] = [
  { etiket: '6 aydan az', gun: 14 },
  { etiket: '6 ay – 1,5 yıl', gun: 28 },
  { etiket: '1,5 – 3 yıl', gun: 42 },
  { etiket: '3 yıldan fazla', gun: 56 },
];

/** Verinin son güncellendiği tarih — "Son güncelleme" rozetinde görünür */
export const sonGuncelleme = 'Ocak 2026';

/** Kaynak etiketi (şeffaflık için sayfada gösterilir) */
export const kaynak =
  'Kıdem tavanı: T.C. Hazine ve Maliye Bakanlığı (6 aylık) · Gelir vergisi tarifesi: 2026 ücret geliri · İhbar süreleri: 4857 sayılı İş Kanunu m.17';
