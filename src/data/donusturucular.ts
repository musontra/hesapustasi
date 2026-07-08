// Birim dönüştürücülerin merkezi tanımları (içerik koddan ayrı).
// Tek bir dinamik sayfa (src/pages/[cevirici].astro) bu listeden 7 ayrı
// statik sayfa üretir. Yeni dönüştürücü = buraya bir kayıt eklemek.

import type { CeviriTipi } from '../lib/birim-cevirici';

export interface Birim {
  /** Tam ad, ör. "santimetre" */
  ad: string;
  /** Kısaltma / sembol, ör. "cm", "°C" */
  kisa: string;
}

export interface DonusturucuSss {
  soru: string;
  cevap: string;
}

export interface Donusturucu {
  /** URL parçası, ör. "cm-inc-cevirme" -> /cm-inc-cevirme */
  slug: string;
  tip: CeviriTipi;
  /** Doğrusal dönüşüm için: 1 birimA = faktor birimB. Sıcaklıkta kullanılmaz. */
  faktor?: number;
  birimA: Birim;
  birimB: Birim;
  /** Ana sayfa kartı + tema ikonu */
  icon: 'uzunluk' | 'agirlik' | 'sicaklik';

  // --- SEO + içerik ---
  /** <title> — aranan kelimelerle */
  title: string;
  /** meta açıklama */
  description: string;
  /** Sayfa H1 */
  h1: string;
  /** H1 altındaki kısa tanıtım */
  ozet: string;
  /** Ana sayfa kart başlığı (kısa) */
  kartBaslik: string;
  /** Ana sayfa kart açıklaması */
  kartAciklama: string;
  /** "Sık kullanılan değerler" tablosu için A birimi cinsinden değerler */
  sikDegerler: number[];
  sss: DonusturucuSss[];
}

export const donusturucular: Donusturucu[] = [
  {
    slug: 'cm-inc-cevirme',
    tip: 'dogrusal',
    faktor: 1 / 2.54, // 1 inç = 2.54 cm (kesin tanım)
    birimA: { ad: 'santimetre', kisa: 'cm' },
    birimB: { ad: 'inç', kisa: 'inç' },
    icon: 'uzunluk',
    title: 'Cm İnç Çevirme — Santimetre İnç Online Dönüştürücü',
    description:
      'Santimetreyi inçe, inçi santimetreye anında çevirin. Çift yönlü, ücretsiz cm–inç dönüştürücü; sık kullanılan değerler tablosu ve formülüyle.',
    h1: 'Santimetre – İnç Çevirme',
    ozet:
      'Bir değeri girin; santimetre ve inç karşılığını anında, çift yönlü görün. 1 inç = 2,54 cm temel alınır.',
    kartBaslik: 'Cm – İnç Çevirme',
    kartAciklama: 'Santimetre ve inç arasında anında, çift yönlü dönüşüm.',
    sikDegerler: [1, 5, 10, 15, 20, 25, 30, 50, 100, 180],
    sss: [
      {
        soru: '1 cm kaç inçtir?',
        cevap: '1 santimetre yaklaşık 0,3937 inçe eşittir. Tersten, 1 inç tam olarak 2,54 santimetredir.',
      },
      {
        soru: 'Cm’yi inçe nasıl çeviririm?',
        cevap: 'Santimetre değerini 2,54’e bölün; sonuç inç cinsindendir. İnçten santimetreye çevirmek için inç değerini 2,54 ile çarpın.',
      },
      {
        soru: 'Sonuçlar neden birkaç ondalıkla gösteriliyor?',
        cevap: 'Dönüşüm okunabilir olması için en çok dört ondalığa yuvarlanır. Bu, gündelik kullanım için yeterli hassasiyettir.',
      },
    ],
  },
  {
    slug: 'metre-fit-cevirme',
    tip: 'dogrusal',
    faktor: 1 / 0.3048, // 1 fit = 0.3048 m (kesin tanım)
    birimA: { ad: 'metre', kisa: 'm' },
    birimB: { ad: 'fit', kisa: 'ft' },
    icon: 'uzunluk',
    title: 'Metre Fit Çevirme — Metre Feet (ft) Online Dönüştürücü',
    description:
      'Metreyi fite (feet), fiti metreye anında çevirin. Çift yönlü, ücretsiz metre–fit dönüştürücü; sık kullanılan değerler ve formülüyle.',
    h1: 'Metre – Fit Çevirme',
    ozet:
      'Bir değeri girin; metre ve fit (feet) karşılığını anında, çift yönlü görün. 1 fit = 0,3048 m temel alınır.',
    kartBaslik: 'Metre – Fit Çevirme',
    kartAciklama: 'Metre ve fit (feet) arasında anında, çift yönlü dönüşüm.',
    sikDegerler: [1, 2, 3, 5, 10, 20, 50, 100],
    sss: [
      {
        soru: '1 metre kaç fittir?',
        cevap: '1 metre yaklaşık 3,2808 fite eşittir. Tersten, 1 fit tam olarak 0,3048 metredir.',
      },
      {
        soru: 'Metreyi fite nasıl çeviririm?',
        cevap: 'Metre değerini 0,3048’e bölün (ya da 3,2808 ile çarpın); sonuç fit cinsindendir.',
      },
      {
        soru: 'Fit (ft) ile feet aynı şey mi?',
        cevap: 'Evet. “Fit” İngilizcedeki “foot” biriminin Türkçe okunuşudur; çoğulu “feet”tir ve sembolü ft’tir.',
      },
    ],
  },
  {
    slug: 'km-mil-cevirme',
    tip: 'dogrusal',
    faktor: 1 / 1.609344, // 1 mil (kara mili) = 1.609344 km (kesin tanım)
    birimA: { ad: 'kilometre', kisa: 'km' },
    birimB: { ad: 'mil', kisa: 'mil' },
    icon: 'uzunluk',
    title: 'Km Mil Çevirme — Kilometre Mil Online Dönüştürücü Aracı',
    description:
      'Kilometreyi mile, mili kilometreye anında çevirin. Çift yönlü, ücretsiz km–mil dönüştürücü (kara mili); sık kullanılan değerler ve formülüyle.',
    h1: 'Kilometre – Mil Çevirme',
    ozet:
      'Bir değeri girin; kilometre ve mil karşılığını anında, çift yönlü görün. 1 mil (kara mili) = 1,609344 km temel alınır.',
    kartBaslik: 'Km – Mil Çevirme',
    kartAciklama: 'Kilometre ve mil arasında anında, çift yönlü dönüşüm.',
    sikDegerler: [1, 5, 10, 20, 42.195, 50, 100],
    sss: [
      {
        soru: '1 km kaç mildir?',
        cevap: '1 kilometre yaklaşık 0,6214 mile eşittir. Tersten, 1 mil 1,609344 kilometredir.',
      },
      {
        soru: 'Buradaki “mil” hangi mil?',
        cevap: 'Uluslararası kara mili (statute mile, 1.609,344 m) kullanılır. Denizcilikteki deniz mili (1.852 m) farklıdır.',
      },
      {
        soru: 'Km’yi mile nasıl çeviririm?',
        cevap: 'Kilometre değerini 1,609344’e bölün; sonuç mil cinsindendir.',
      },
    ],
  },
  {
    slug: 'yarda-metre-cevirme',
    tip: 'dogrusal',
    faktor: 0.9144, // 1 yarda = 0.9144 m (kesin tanım)
    birimA: { ad: 'yarda', kisa: 'yd' },
    birimB: { ad: 'metre', kisa: 'm' },
    icon: 'uzunluk',
    title: 'Yarda Metre Çevirme — Yarda (yd) Online Dönüştürücü',
    description:
      'Yardayı metreye, metreyi yardaya anında çevirin. Çift yönlü, ücretsiz yarda–metre dönüştürücü; sık kullanılan değerler tablosu ve formülüyle.',
    h1: 'Yarda – Metre Çevirme',
    ozet:
      'Bir değeri girin; yarda ve metre karşılığını anında, çift yönlü görün. 1 yarda = 0,9144 m temel alınır.',
    kartBaslik: 'Yarda – Metre Çevirme',
    kartAciklama: 'Yarda (yd) ve metre arasında anında, çift yönlü dönüşüm.',
    sikDegerler: [1, 2, 5, 10, 20, 50, 100, 200],
    sss: [
      {
        soru: '1 yarda kaç metredir?',
        cevap: '1 yarda tam olarak 0,9144 metredir. Tersten, 1 metre yaklaşık 1,0936 yardaya eşittir.',
      },
      {
        soru: 'Yardayı metreye nasıl çeviririm?',
        cevap: 'Yarda değerini 0,9144 ile çarpın; sonuç metre cinsindendir. Metreden yardaya çevirmek için metre değerini 0,9144’e bölün.',
      },
      {
        soru: 'Yarda nerede kullanılır?',
        cevap: 'Yarda; ABD ve İngiltere’de günlük ölçülerde, Amerikan futbolu ve golf gibi sporlarda yaygın kullanılır. 1 yarda 3 fite ya da 36 inçe eşittir.',
      },
    ],
  },
  {
    slug: 'kg-pound-cevirme',
    tip: 'dogrusal',
    faktor: 1 / 0.45359237, // 1 pound (lb) = 0.45359237 kg (kesin tanım)
    birimA: { ad: 'kilogram', kisa: 'kg' },
    birimB: { ad: 'pound', kisa: 'lb' },
    icon: 'agirlik',
    title: 'Kg Pound Çevirme — Kilogram Pound (lbs) Online Dönüştürücü',
    description:
      'Kilogramı pounda (lb/lbs), poundu kilograma anında çevirin. Çift yönlü, ücretsiz kg–pound dönüştürücü; sık kullanılan değerler ve formülüyle.',
    h1: 'Kilogram – Pound Çevirme',
    ozet:
      'Bir değeri girin; kilogram ve pound (lb) karşılığını anında, çift yönlü görün. 1 pound = 0,45359237 kg temel alınır.',
    kartBaslik: 'Kg – Pound Çevirme',
    kartAciklama: 'Kilogram ve pound (lbs) arasında anında, çift yönlü dönüşüm.',
    sikDegerler: [1, 5, 10, 20, 50, 70, 75, 80, 90, 100],
    sss: [
      {
        soru: '1 kg kaç pounddur?',
        cevap: '1 kilogram yaklaşık 2,2046 pounda eşittir. Tersten, 1 pound 0,45359237 kilogramdır.',
      },
      {
        soru: 'Pound, lb ve lbs aynı mı?',
        cevap: 'Evet. Pound biriminin sembolü “lb”, çoğul gösterimi ise “lbs”tir; hepsi aynı birimi ifade eder.',
      },
      {
        soru: 'Kg’yi pounda nasıl çeviririm?',
        cevap: 'Kilogram değerini 0,45359237’ye bölün (ya da 2,2046 ile çarpın); sonuç pound cinsindendir.',
      },
    ],
  },
  {
    slug: 'gram-ons-cevirme',
    tip: 'dogrusal',
    faktor: 1 / 28.349523125, // 1 ons (avoirdupois ounce) = 28.349523125 g (kesin tanım)
    birimA: { ad: 'gram', kisa: 'g' },
    birimB: { ad: 'ons', kisa: 'oz' },
    icon: 'agirlik',
    title: 'Gram Ons Çevirme — Gram Ounce (oz) Online Dönüştürücü',
    description:
      'Gramı onsa (ounce), onsu grama anında çevirin. Çift yönlü, ücretsiz gram–ons dönüştürücü; sık kullanılan değerler ve formülüyle.',
    h1: 'Gram – Ons Çevirme',
    ozet:
      'Bir değeri girin; gram ve ons (ounce) karşılığını anında, çift yönlü görün. 1 ons = 28,349523125 g temel alınır.',
    kartBaslik: 'Gram – Ons Çevirme',
    kartAciklama: 'Gram ve ons (ounce) arasında anında, çift yönlü dönüşüm.',
    sikDegerler: [1, 5, 10, 25, 50, 100, 250, 500, 1000],
    sss: [
      {
        soru: '1 gram kaç onstur?',
        cevap: '1 gram yaklaşık 0,0353 onsa eşittir. Tersten, 1 ons 28,349523125 gramdır.',
      },
      {
        soru: 'Buradaki “ons” hangi ons?',
        cevap: 'Yaygın kullanılan avoirdupois onsu (yaklaşık 28,35 g) esas alınır. Değerli madenlerde kullanılan troy onsu (≈31,10 g) farklıdır.',
      },
      {
        soru: 'Gramı onsa nasıl çeviririm?',
        cevap: 'Gram değerini 28,349523125’e bölün; sonuç ons cinsindendir.',
      },
    ],
  },
  {
    slug: 'santigrat-fahrenayt-cevirme',
    tip: 'sicaklik',
    birimA: { ad: 'santigrat', kisa: '°C' },
    birimB: { ad: 'fahrenayt', kisa: '°F' },
    icon: 'sicaklik',
    title: 'Santigrat Fahrenayt Çevirme — °C °F Online Dönüştürücü',
    description:
      'Santigratı (°C) fahrenayta (°F), fahrenaytı santigrata anında çevirin. Çift yönlü, ücretsiz sıcaklık dönüştürücü; sık kullanılan değerler ve formülüyle.',
    h1: 'Santigrat – Fahrenayt Çevirme',
    ozet:
      'Bir sıcaklık girin; santigrat (°C) ve fahrenayt (°F) karşılığını anında, çift yönlü görün.',
    kartBaslik: 'Santigrat – Fahrenayt',
    kartAciklama: 'Santigrat (°C) ve fahrenayt (°F) arasında anında, çift yönlü dönüşüm.',
    sikDegerler: [-40, -18, 0, 10, 20, 25, 30, 36.6, 37, 40, 100],
    sss: [
      {
        soru: 'Santigratı fahrenayta nasıl çeviririm?',
        cevap: 'Formül: °F = (°C × 9/5) + 32. Örneğin 20 °C = (20 × 9/5) + 32 = 68 °F olur.',
      },
      {
        soru: 'Fahrenaytı santigrata nasıl çeviririm?',
        cevap: 'Formül: °C = (°F − 32) × 5/9. Örneğin 98,6 °F = (98,6 − 32) × 5/9 = 37 °C olur.',
      },
      {
        soru: 'İki ölçek hangi sıcaklıkta eşitlenir?',
        cevap: '−40 derecede iki ölçek eşittir: −40 °C = −40 °F.',
      },
    ],
  },
];

/** Tek bir dönüştürücüyü slug ile bul */
export function getDonusturucu(slug: string): Donusturucu | undefined {
  return donusturucular.find((d) => d.slug === slug);
}
