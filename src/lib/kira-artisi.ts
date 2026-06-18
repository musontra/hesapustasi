// Kira artışı hesaplama — SAF fonksiyon (UI'dan bağımsız, test edilebilir).
//
// ⚠️ FORMÜL YER TUTUCU:
// Hesaplama formülü kullanıcı tarafından sonra verilecek. Aşağıdaki
// `hesaplaKiraArtisi` fonksiyonu şimdilik basit/geçici bir mantık içerir;
// gerçek formül geldiğinde SADECE bu fonksiyonun gövdesi güncellenecek,
// arayüz (sayfa) değişmeyecek.

export interface KiraArtisiGirdi {
  /** Mevcut (eski) aylık kira bedeli, TL */
  mevcutKira: number;
  /** Uygulanacak artış oranı, yüzde. Örn. 25 => %25 */
  oranYuzde: number;
}

export interface KiraArtisiSonuc {
  /** Girilen mevcut kira */
  mevcutKira: number;
  /** Uygulanan oran (yüzde) */
  oranYuzde: number;
  /** Artış tutarı (yeni - eski), TL */
  artisTutari: number;
  /** Hesaplanan yeni kira, TL */
  yeniKira: number;
}

/**
 * Kira artışını hesaplar.
 *
 * ⚠️ YER TUTUCU MANTIK — gerçek formül gelince değiştirilecek.
 * Şu an: yeniKira = mevcutKira * (1 + oran/100)
 */
export function hesaplaKiraArtisi(girdi: KiraArtisiGirdi): KiraArtisiSonuc {
  const mevcutKira = Number.isFinite(girdi.mevcutKira) ? Math.max(0, girdi.mevcutKira) : 0;
  const oranYuzde = Number.isFinite(girdi.oranYuzde) ? girdi.oranYuzde : 0;

  // --- BURASI FORMÜL GELİNCE GÜNCELLENECEK ---
  const yeniKiraHam = mevcutKira * (1 + oranYuzde / 100);
  // -------------------------------------------

  const yeniKira = Math.round(yeniKiraHam * 100) / 100;
  const artisTutari = Math.round((yeniKira - mevcutKira) * 100) / 100;

  return { mevcutKira, oranYuzde, artisTutari, yeniKira };
}

/** TL biçimlendirme yardımcısı (gösterim için) */
export function formatTL(deger: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 2,
  }).format(deger);
}
