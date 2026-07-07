// Yıllık ücretli izin hesaplama — SAF fonksiyonlar (UI'dan bağımsız).
//
// YENİDEN KULLANIM: hizmet süresi ve marjinal gelir vergisi tazminat
// modülünden gelir; gelir vergisi dilimleri/damga oranı kopyalanmaz.

import { hizmetSuresi, marjinalGelirVergisi } from './tazminat';
import { damgaVergisiOrani } from '../data/tazminat';
import {
  kidemBandlari,
  yasKorumasiAsgariGun,
  yasKorumasiAltSinir,
  yasKorumasiUstSinir,
  sgkIsciPayi,
  issizlikIsciPayi,
} from '../data/yillik-izin';

/** 2 ondalığa yuvarlama */
function round2(deger: number): number {
  return Math.round(deger * 100) / 100;
}

/**
 * Tamamlanan kıdem yılına göre yıllık izin bandını (gün) verir.
 *   1–5 yıl → 14 · 5'ten fazla–15'ten az → 20 · 15 ve üzeri → 26
 */
export function bandFor(tamYil: number): number {
  if (tamYil >= 15) return kidemBandlari[2].gun;
  if (tamYil > 5) return kidemBandlari[1].gun;
  return kidemBandlari[0].gun;
}

// ---------------------------------------------------------------------------
// İzin hakkı
// ---------------------------------------------------------------------------

export interface YillikIzinGirdi {
  /** İşe giriş tarihi, ISO 'YYYY-MM-DD' */
  giris: string;
  /** Hesabın yapıldığı referans tarih, ISO 'YYYY-MM-DD' */
  referansTarih: string;
  /** Doğum tarihi (opsiyonel), ISO 'YYYY-MM-DD' — yaş koruması için */
  dogum?: string;
}

export interface YillikIzinSonuc {
  /** En az 1 yıl kıdem şartı sağlandı mı */
  hakKazanildi: boolean;
  /** Kıdem süresi dökümü */
  kidem: { yil: number; ay: number; gun: number };
  /** Referans tarihteki yaş; doğum verilmemişse null */
  yas: number | null;
  /** Yaş koruması (18 ve altı / 50 ve üstü) uygulandı mı */
  yasKorumasiUygulandi: boolean;
  /** Bu yıl için yıllık izin hakkı (gün) */
  yillikHak: number;
  /** Tüm tamamlanan yıllar için biriken toplam izin (gün) */
  birikenToplam: number;
}

/**
 * Yıllık izin hakkını hesaplar.
 * - Toplam kıdem < 1 yıl ise hak doğmaz.
 * - Doğum verilmişse referans tarihteki yaşa göre koruma uygulanır; verilmezse
 *   koruma uygulanmaz (yas = null, yasKorumasiUygulandi = false).
 */
export function yillikIzinHakki(girdi: YillikIzinGirdi): YillikIzinSonuc {
  const sure = hizmetSuresi(girdi.giris, girdi.referansTarih);
  const kidem = { yil: sure.yil, ay: sure.ay, gun: sure.gun };

  // Yaş: doğum→referans takvim farkının tam yılı.
  const yas = girdi.dogum ? hizmetSuresi(girdi.dogum, girdi.referansTarih).yil : null;
  const yasKorumasi =
    yas !== null && (yas >= yasKorumasiUstSinir || yas <= yasKorumasiAltSinir);

  if (sure.toplamYil < 1) {
    return {
      hakKazanildi: false,
      kidem,
      yas,
      yasKorumasiUygulandi: yasKorumasi,
      yillikHak: 0,
      birikenToplam: 0,
    };
  }

  const N = sure.yil; // tamamlanan tam yıl sayısı
  const taban = yasKorumasi ? yasKorumasiAsgariGun : 0;

  const yillikHak = Math.max(bandFor(N), taban);

  let birikenToplam = 0;
  for (let i = 1; i <= N; i++) {
    birikenToplam += Math.max(bandFor(i), taban);
  }

  return {
    hakKazanildi: true,
    kidem,
    yas,
    yasKorumasiUygulandi: yasKorumasi,
    yillikHak,
    birikenToplam,
  };
}

/** Kalan izin bakiyesi = max(0, biriken − kullanılan) */
export function kalanBakiye(birikenToplam: number, kullanilanGun: number): number {
  return Math.max(0, birikenToplam - kullanilanGun);
}

// ---------------------------------------------------------------------------
// İzin ücreti (kullanılmayan izinlerin çıkışta ödenmesi)
// ---------------------------------------------------------------------------

export interface IzinUcretiGirdi {
  /** Aylık çıplak brüt ücret, TL */
  aylikCiplakBrut: number;
  /** Ödenecek (kullanılmayan) izin günü */
  kullanilmayanGun: number;
  /** Yıl içinde önceden oluşmuş kümülatif gelir vergisi matrahı, TL */
  kumulatifMatrah?: number;
}

export interface IzinUcretiSonuc {
  /** Günlük brüt = aylıkÇıplakBrüt / 30, TL */
  gunlukBrut: number;
  /** Brüt izin ücreti = günlükBrüt × kullanılmayanGün, TL */
  brut: number;
  /** SGK işçi payı (brüt × 0,14), TL */
  sgk: number;
  /** İşsizlik işçi payı (brüt × 0,01), TL */
  issizlik: number;
  /** Toplam işçi kesintisi (SGK + işsizlik), TL */
  sgkToplam: number;
  /** Gelir vergisi matrahı = brüt − sgkToplam, TL */
  gvMatrah: number;
  /** Marjinal gelir vergisi (SGK sonrası matrahtan), TL */
  gelirVergisi: number;
  /** Gelir vergisinde uygulanan marjinal dilim oranı */
  uygulananDilim: number;
  /** Damga vergisi (brüt × damga oranı), TL */
  damga: number;
  /** Tahmini net = brüt − sgkToplam − gelirVergisi − damga, TL */
  net: number;
}

/**
 * Kullanılmayan izinlerin çıkışta ödenecek ücretini hesaplar.
 * - Gelir vergisi, SGK kesintisi SONRASI matrahtan alınır.
 * - SGK tavanı modellenmez; net "tahmini"dir.
 */
export function izinUcreti(girdi: IzinUcretiGirdi): IzinUcretiSonuc {
  const gunlukBrut = girdi.aylikCiplakBrut / 30;
  const brutHam = gunlukBrut * girdi.kullanilmayanGun;

  const sgkHam = brutHam * sgkIsciPayi;
  const issizlikHam = brutHam * issizlikIsciPayi;
  const sgkToplamHam = sgkHam + issizlikHam;

  const gvMatrah = brutHam - sgkToplamHam;
  const { vergi, uygulananOran } = marjinalGelirVergisi(
    girdi.kumulatifMatrah ?? 0,
    gvMatrah,
  );
  const damgaHam = brutHam * damgaVergisiOrani;
  const netHam = brutHam - sgkToplamHam - vergi - damgaHam;

  return {
    gunlukBrut: round2(gunlukBrut),
    brut: round2(brutHam),
    sgk: round2(sgkHam),
    issizlik: round2(issizlikHam),
    sgkToplam: round2(sgkToplamHam),
    gvMatrah: round2(gvMatrah),
    gelirVergisi: vergi,
    uygulananDilim: uygulananOran,
    damga: round2(damgaHam),
    net: round2(netHam),
  };
}
