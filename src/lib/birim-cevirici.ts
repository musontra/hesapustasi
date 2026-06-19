// Birim dönüştürücüler — SAF dönüşüm fonksiyonları (UI'dan bağımsız, test edilebilir).
// Uzunluk/ağırlık gibi doğrusal dönüşümler tek bir faktörle; sıcaklık afin formülle.
// Gerçek dönüşüm sabitleri kesin (uluslararası tanım) değerlerdir; gösterimde yuvarlanır.

export type CeviriTipi = 'dogrusal' | 'sicaklik';
/** ileri: A → B, geri: B → A */
export type Yon = 'ileri' | 'geri';

/**
 * Sayıyı en çok `basamak` ondalığa yuvarlar ve kayan nokta gürültüsünü temizler.
 * `toFixed` sıfıra göre simetrik yuvarlar; negatif ve pozitif değerler aynı davranır.
 */
export function yuvarla(deger: number, basamak = 4): number {
  if (!Number.isFinite(deger)) return 0;
  return parseFloat(deger.toFixed(basamak));
}

/** Doğrusal dönüşüm: 1 kaynak birim = `faktor` hedef birim. */
export function dogrusalCevir(deger: number, faktor: number): number {
  return yuvarla(deger * faktor);
}

/** Santigrat → Fahrenayt */
export function santigratToFahrenayt(c: number): number {
  return yuvarla((c * 9) / 5 + 32);
}

/** Fahrenayt → Santigrat */
export function fahrenaytToSantigrat(f: number): number {
  return yuvarla(((f - 32) * 5) / 9);
}

/**
 * Genel dönüştürücü.
 * - `tip === 'dogrusal'` ise geçerli (sonlu, 0 olmayan) bir `faktor` ZORUNLUDUR
 *   (1 A = faktor B). Eksik/0 ise hata fırlatır — yapılandırma hatası build/geliştirme
 *   zamanında yakalanır, sessizce yanlış sonuç üretilmez.
 * - `tip === 'sicaklik'` ise faktör yok sayılır; °C ↔ °F formülü uygulanır.
 * - `yon === 'ileri'` => A→B, `'geri'` => B→A.
 * Geçersiz sayısal girişte 0 döner.
 */
export function cevir(tip: CeviriTipi, deger: number, yon: Yon, faktor?: number): number {
  if (!Number.isFinite(deger)) return 0;
  if (tip === 'sicaklik') {
    return yon === 'ileri' ? santigratToFahrenayt(deger) : fahrenaytToSantigrat(deger);
  }
  if (!Number.isFinite(faktor) || faktor === 0) {
    throw new Error(
      `birim-cevirici: 'dogrusal' dönüşüm için geçerli (sonlu, 0 olmayan) bir faktör gerekli; alınan: ${faktor}`,
    );
  }
  const f = faktor as number;
  return yon === 'ileri' ? dogrusalCevir(deger, f) : dogrusalCevir(deger, 1 / f);
}
