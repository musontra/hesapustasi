// Tüm hesaplayıcıların merkezi kaydı.
// Ana sayfa ve gezinme bu listeden beslenir. Yeni araç eklemek için
// buraya bir kayıt ekle + ilgili src/pages/<slug>.astro sayfasını oluştur.

export type CalculatorStatus = 'aktif' | 'yakinda';

export interface Calculator {
  /** URL parçası, ör. "kira-artisi" -> /kira-artisi */
  slug: string;
  /** Kartta ve sayfada görünen kısa ad */
  title: string;
  /** Kartta görünen tek cümlelik açıklama */
  description: string;
  /** Basit inline SVG ikon adı (bkz. components/CalcIcon.astro) */
  icon: 'kira' | 'kidem' | 'ihbar' | 'izin';
  status: CalculatorStatus;
}

export const calculators: Calculator[] = [
  {
    slug: 'kira-artisi',
    title: 'Kira Artışı Hesaplama',
    description:
      'Güncel TÜFE oranına göre yasal kira artışını ve yeni kira bedelini saniyeler içinde hesaplayın.',
    icon: 'kira',
    status: 'aktif',
  },
  {
    slug: 'kidem-tazminati',
    title: 'Kıdem Tazminatı Hesaplama',
    description:
      'Çalışma sürenize ve brüt ücretinize göre kıdem tazminatınızı hesaplayın.',
    icon: 'kidem',
    status: 'yakinda',
  },
  {
    slug: 'ihbar-tazminati',
    title: 'İhbar Tazminatı Hesaplama',
    description:
      'Kıdeminize göre ihbar süresi ve ihbar tazminatı tutarını öğrenin.',
    icon: 'ihbar',
    status: 'yakinda',
  },
  {
    slug: 'yillik-izin',
    title: 'Yıllık İzin Hesaplama',
    description:
      'Kıdem yılınıza göre hak ettiğiniz yıllık ücretli izin gün sayısını hesaplayın.',
    icon: 'izin',
    status: 'yakinda',
  },
];

/** Tek bir hesaplayıcıyı slug ile bul */
export function getCalculator(slug: string): Calculator | undefined {
  return calculators.find((c) => c.slug === slug);
}
