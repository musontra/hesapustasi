// Kıdem & ihbar tazminatı hesaplama — SAF fonksiyonlar (UI'dan bağımsız, test
// edilebilir). Veriler src/data/tazminat.ts'ten gelir; bu dosya yalnızca mantık.

import {
  kidemTavanDonemleri,
  damgaVergisiOrani,
  gelirVergisiDilimleri2026,
  ihbarSureleri,
} from '../data/tazminat';

/** 2 ondalığa yuvarlama (gösterim/sonuç tutarları için) */
function round2(deger: number): number {
  return Math.round(deger * 100) / 100;
}

/** Yerel takvim tarihini gün kaymasından bağımsız parse eder */
function parseTarih(iso: string): Date {
  const [yil, ay, gun] = iso.split('-').map(Number);
  return new Date(yil, ay - 1, gun);
}

// ---------------------------------------------------------------------------
// Hizmet süresi
// ---------------------------------------------------------------------------

export interface HizmetSuresi {
  /** Tam yıl farkı */
  yil: number;
  /** Artık ay farkı (0-11) */
  ay: number;
  /** Artık gün farkı */
  gun: number;
  /** Kıdem katsayısı / toplam süre, yıl cinsinden = yil + ay/12 + gun/365 */
  toplamYil: number;
}

/**
 * İki tarih arasındaki takvim farkını {yil, ay, gun} olarak verir ve yıl
 * cinsinden toplam süreyi (kıdem katsayısını) döndürür.
 */
export function hizmetSuresi(giris: string, cikis: string): HizmetSuresi {
  const g = parseTarih(giris);
  const c = parseTarih(cikis);

  let yil = c.getFullYear() - g.getFullYear();
  let ay = c.getMonth() - g.getMonth();
  let gun = c.getDate() - g.getDate();

  if (gun < 0) {
    ay -= 1;
    // Çıkış ayından bir önceki ayın gün sayısını ödünç al.
    const oncekiAyGun = new Date(c.getFullYear(), c.getMonth(), 0).getDate();
    gun += oncekiAyGun;
  }
  if (ay < 0) {
    yil -= 1;
    ay += 12;
  }

  const toplamYil = yil + ay / 12 + gun / 365;
  return { yil, ay, gun, toplamYil };
}

// ---------------------------------------------------------------------------
// Kıdem tazminatı
// ---------------------------------------------------------------------------

export interface KidemGirdi {
  /** Giydirilmiş (tüm yan haklar dahil) aylık brüt ücret, TL */
  giydirilmisAylikBrut: number;
  /** İşe giriş tarihi, ISO 'YYYY-MM-DD' */
  giris: string;
  /** İşten çıkış tarihi, ISO 'YYYY-MM-DD' */
  cikis: string;
}

export interface KidemSonuc {
  /** Kıdem tazminatına hak kazanıldı mı (en az 1 yıl şartı) */
  hakKazanildi: boolean;
  /** Çıkış tarihi tanımlı bir tavan dönemine düşmüyorsa true */
  tavanYok: boolean;
  /** Hesapta kullanılan tavan (TL); tavanYok ise undefined */
  tavan?: number;
  /** Tavan devreye girdi mi (brüt ücret tavanı aştı mı) */
  tavanUygulandi: boolean;
  /** Hizmet süresi dökümü */
  sure: HizmetSuresi;
  /** Tazminat matrahı = min(giydirilmisAylikBrut, tavan), TL */
  matrah: number;
  /** Brüt kıdem tazminatı = matrah × katsayı, TL */
  brut: number;
  /** Damga vergisi, TL */
  damga: number;
  /** Net kıdem tazminatı = brüt − damga, TL */
  net: number;
}

/** Çıkış tarihine ait kıdem tavanını bulur; dönem yoksa undefined */
function tavanBul(cikis: string): number | undefined {
  return kidemTavanDonemleri.find((d) => cikis >= d.bas && cikis <= d.bit)?.tavan;
}

/**
 * Kıdem tazminatını hesaplar.
 * - Toplam hizmet < 1 yıl ise hak kazanılmaz.
 * - Çıkış tarihi tanımlı bir tavan dönemine düşmüyorsa hesap durur (tavanYok).
 */
export function kidemTazminati(girdi: KidemGirdi): KidemSonuc {
  const sure = hizmetSuresi(girdi.giris, girdi.cikis);

  if (sure.toplamYil < 1) {
    return {
      hakKazanildi: false,
      tavanYok: false,
      tavanUygulandi: false,
      sure,
      matrah: 0,
      brut: 0,
      damga: 0,
      net: 0,
    };
  }

  const tavan = tavanBul(girdi.cikis);
  if (tavan === undefined) {
    return {
      hakKazanildi: true,
      tavanYok: true,
      tavanUygulandi: false,
      sure,
      matrah: 0,
      brut: 0,
      damga: 0,
      net: 0,
    };
  }

  const tavanUygulandi = girdi.giydirilmisAylikBrut > tavan;
  const matrah = Math.min(girdi.giydirilmisAylikBrut, tavan);
  const brutHam = matrah * sure.toplamYil;
  const damgaHam = brutHam * damgaVergisiOrani;
  const netHam = brutHam - damgaHam;

  return {
    hakKazanildi: true,
    tavanYok: false,
    tavan,
    tavanUygulandi,
    sure,
    matrah: round2(matrah),
    brut: round2(brutHam),
    damga: round2(damgaHam),
    net: round2(netHam),
  };
}

// ---------------------------------------------------------------------------
// Gelir vergisi (marjinal)
// ---------------------------------------------------------------------------

export interface MarjinalVergiSonuc {
  /** Hesaplanan gelir vergisi tutarı, TL */
  vergi: number;
  /** Ek tutarın tepe kısmına uygulanan marjinal oran (örn. 0.15) */
  uygulananOran: number;
}

/**
 * Ek tutarı mevcut kümülatif matrahın üzerine yığar ve 2026 dilimlerinden
 * marjinal olarak geçirir: her dilime düşen kısım kendi oranından vergilenir.
 */
export function marjinalGelirVergisi(
  kumulatifMatrah: number,
  ekTutar: number,
): MarjinalVergiSonuc {
  const baslangic = Math.max(0, kumulatifMatrah);
  const bitis = baslangic + Math.max(0, ekTutar);

  let vergi = 0;
  let uygulananOran = gelirVergisiDilimleri2026[0].oran;
  let altSinir = 0;

  for (const dilim of gelirVergisiDilimleri2026) {
    // Bu dilimin [altSinir, ustSinir] aralığıyla [baslangic, bitis] kesişimi.
    const kesisimAlt = Math.max(baslangic, altSinir);
    const kesisimUst = Math.min(bitis, dilim.ustSinir);
    if (kesisimUst > kesisimAlt) {
      vergi += (kesisimUst - kesisimAlt) * dilim.oran;
      uygulananOran = dilim.oran; // bitişin düştüğü en üst dilim
    }
    if (bitis <= dilim.ustSinir) break;
    altSinir = dilim.ustSinir;
  }

  return { vergi: round2(vergi), uygulananOran };
}

// ---------------------------------------------------------------------------
// İhbar tazminatı
// ---------------------------------------------------------------------------

export interface IhbarGirdi {
  /** Giydirilmiş aylık brüt ücret, TL */
  giydirilmisAylikBrut: number;
  /** İşe giriş tarihi, ISO 'YYYY-MM-DD' */
  giris: string;
  /** İşten çıkış tarihi, ISO 'YYYY-MM-DD' */
  cikis: string;
  /** Yıl içinde önceden oluşmuş kümülatif gelir vergisi matrahı, TL */
  kumulatifMatrah?: number;
}

export interface IhbarSonuc {
  /** Hizmet süresi dökümü */
  sure: HizmetSuresi;
  /** Uygulanan ihbar süresi, gün (14/28/42/56) */
  ihbarGun: number;
  /** Günlük brüt = giydirilmisAylikBrut / 30, TL */
  gunlukBrut: number;
  /** Brüt ihbar tazminatı = günlükBrüt × ihbarGün, TL */
  brut: number;
  /** Marjinal gelir vergisi, TL */
  gelirVergisi: number;
  /** Gelir vergisinde uygulanan marjinal dilim oranı */
  uygulananDilim: number;
  /** Damga vergisi, TL */
  damga: number;
  /** Net ihbar tazminatı = brüt − gelirVergisi − damga, TL (tahmini) */
  net: number;
}

/** Kıdeme (toplam yıl) göre ihbar gününü seçer — İş Kanunu m.17 */
function ihbarGunuSec(toplamYil: number): number {
  // Bant sınırları yasadaki "...ya kadar" mantığına uyar:
  //   < 0,5 yıl → 14 · [0,5 – 1,5] → 28 · (1,5 – 3] → 42 · > 3 → 56
  if (toplamYil < 0.5) return ihbarSureleri[0].gun;
  if (toplamYil <= 1.5) return ihbarSureleri[1].gun;
  if (toplamYil <= 3) return ihbarSureleri[2].gun;
  return ihbarSureleri[3].gun;
}

/**
 * İhbar tazminatını hesaplar.
 * - İhbar tazminatında TAVAN ve 1 yıl şartı YOKTUR.
 * - Asgari ücret istisnası UYGULANMAZ; net "tahmini" değerdir.
 */
export function ihbarTazminati(girdi: IhbarGirdi): IhbarSonuc {
  const sure = hizmetSuresi(girdi.giris, girdi.cikis);
  const ihbarGun = ihbarGunuSec(sure.toplamYil);

  const gunlukBrut = girdi.giydirilmisAylikBrut / 30;
  const brutHam = gunlukBrut * ihbarGun;

  const { vergi, uygulananOran } = marjinalGelirVergisi(
    girdi.kumulatifMatrah ?? 0,
    brutHam,
  );
  const damgaHam = brutHam * damgaVergisiOrani;
  const netHam = brutHam - vergi - damgaHam;

  return {
    sure,
    ihbarGun,
    gunlukBrut: round2(gunlukBrut),
    brut: round2(brutHam),
    gelirVergisi: vergi,
    uygulananDilim: uygulananOran,
    damga: round2(damgaHam),
    net: round2(netHam),
  };
}
