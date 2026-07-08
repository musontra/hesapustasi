// Tüm araçların merkezi kaydı (hesaplayıcılar + birim dönüştürücüler).
// Ana sayfa, footer ve gezinme bu listeden beslenir. Dönüştürücü kartları
// tek doğruluk kaynağı olarak src/data/donusturucular.ts'ten türetilir.

import { donusturucular } from './donusturucular';

export type CalculatorStatus = 'aktif' | 'yakinda';
export type CalculatorCategory = 'hesaplayici' | 'donusturucu';
export type CalculatorIcon =
  | 'kira'
  | 'kidem'
  | 'ihbar'
  | 'izin'
  | 'sinav'
  | 'uzunluk'
  | 'agirlik'
  | 'sicaklik';

export interface Calculator {
  /** URL parçası, ör. "kira-artisi" -> /kira-artisi */
  slug: string;
  /** Kartta ve sayfada görünen kısa ad */
  title: string;
  /** Kartta görünen tek cümlelik açıklama */
  description: string;
  /** Basit inline SVG ikon adı (bkz. components/CalcIcon.astro) */
  icon: CalculatorIcon;
  status: CalculatorStatus;
  /** Ana sayfa/footer gruplaması */
  category: CalculatorCategory;
}

const hesaplayicilar: Calculator[] = [
  {
    slug: 'kira-artisi',
    title: 'Kira Artışı Hesaplama',
    description:
      'Güncel TÜFE oranına göre yasal kira artışını ve yeni kira bedelini saniyeler içinde hesaplayın.',
    icon: 'kira',
    status: 'aktif',
    category: 'hesaplayici',
  },
  {
    slug: 'kidem-tazminati-hesaplama',
    title: 'Kıdem Tazminatı Hesaplama',
    description:
      'Çalışma sürenize ve brüt ücretinize göre kıdem tazminatınızı hesaplayın.',
    icon: 'kidem',
    status: 'aktif',
    category: 'hesaplayici',
  },
  {
    slug: 'ihbar-tazminati-hesaplama',
    title: 'İhbar Tazminatı Hesaplama',
    description:
      'Kıdeminize göre ihbar süresi ve ihbar tazminatı tutarını öğrenin.',
    icon: 'ihbar',
    status: 'aktif',
    category: 'hesaplayici',
  },
  {
    slug: 'yillik-izin-hesaplama',
    title: 'Yıllık İzin Hesaplama',
    description:
      'Kıdem yılınıza göre hak ettiğiniz yıllık ücretli izin gün sayısını hesaplayın.',
    icon: 'izin',
    status: 'aktif',
    category: 'hesaplayici',
  },
  {
    slug: 'sinav/kpss-dhbt-puan',
    title: 'KPSS DHBT Puan Hesaplama',
    description:
      'Doğru ve yanlışlarınızı girin; GY, GK ve DHBT netlerinizle tahmini KPSSP puanınızı öğrenin.',
    icon: 'sinav',
    status: 'aktif',
    category: 'hesaplayici',
  },
  {
    slug: 'sinav/kpss-lisans-puan',
    title: 'KPSS Lisans Puan Hesaplama',
    description:
      'Lisans (P3) için Genel Yetenek ve Genel Kültür netlerinizle tahmini KPSS puanınızı hesaplayın.',
    icon: 'sinav',
    status: 'aktif',
    category: 'hesaplayici',
  },
  {
    slug: 'sinav/kpss-onlisans-puan',
    title: 'KPSS Önlisans Puan Hesaplama',
    description:
      'Önlisans (P93) için Genel Yetenek ve Genel Kültür netlerinizle tahmini KPSS puanınızı hesaplayın.',
    icon: 'sinav',
    status: 'aktif',
    category: 'hesaplayici',
  },
  {
    slug: 'sinav/kpss-ortaogretim-puan',
    title: 'KPSS Ortaöğretim Puan Hesaplama',
    description:
      'Ortaöğretim (P94) için Genel Yetenek ve Genel Kültür netlerinizle tahmini KPSS puanınızı hesaplayın.',
    icon: 'sinav',
    status: 'aktif',
    category: 'hesaplayici',
  },
];

// Dönüştürücü kartları, dönüştürücü tanımlarından türetilir (tekrar yok).
const donusturucuKartlari: Calculator[] = donusturucular.map((d) => ({
  slug: d.slug,
  title: d.kartBaslik,
  description: d.kartAciklama,
  icon: d.icon,
  status: 'aktif',
  category: 'donusturucu',
}));

export const calculators: Calculator[] = [...hesaplayicilar, ...donusturucuKartlari];

/** Tek bir hesaplayıcıyı slug ile bul */
export function getCalculator(slug: string): Calculator | undefined {
  return calculators.find((c) => c.slug === slug);
}
