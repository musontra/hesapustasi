/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte,md,mdx}'],
  theme: {
    extend: {
      colors: {
        // Marka kimliği (skill.md — SABİT): krem zemin + lacivert + amber vurgu.
        // Not: ink/cream/mist token adları eski koyu temadan miras alındı;
        // sınıf adları sitede yaygın olduğundan adlar korunup DEĞERLER yeni
        // paletle eşlendi (ink-800 = kart yüzeyi, cream = başlık metni vb.).
        lacivert: {
          DEFAULT: '#1B2A4A', // ana renk — header, footer, sonuç paneli
          koyu: '#14203A', // koyu metin / amber üstünde metin
          acik: '#24365E', // lacivert zeminde hover yüzeyi
        },
        paper: '#F7F4EE', // nötr krem zemin (steril beyaz değil)
        ink: {
          950: '#14203A', // koyu metin
          900: '#FBFAF7', // sakin yüzey (input zemini) — kartla zemin arası
          800: '#FFFFFF', // kart yüzeyi
          700: '#E9ECF2', // yükseltilmiş açık yüzey (bar zemini vb.)
          600: '#C4CBDA', // lacivertten türetilmiş kenarlık tonu
        },
        // Amber vurgu — YALNIZCA sonuç kutusu, birincil CTA ve aktif durum.
        gold: {
          DEFAULT: '#E8A23D',
          300: '#A96410', // koyu amber — açık zeminde METİN için (WCAG AA)
          400: '#F0B45F', // lacivert zeminde açık vurgu
          500: '#E8A23D', // marka amber — dolgu/ikon
          600: '#C9861F', // hover / kenarlık
        },
        // Uyarı tonu — "açıklanmadı / geçersiz oran" rozetleri.
        warn: {
          300: '#8A6200', // metin (krem zeminde okunur)
          500: '#E0A92E', // kenarlık / dolgu temeli
        },
        // Hata metinleri sayfalarda text-red-300 ile yazılmış (koyu tema mirası);
        // açık zeminde okunur koyu kırmızıya eşlenir.
        red: {
          300: '#B3261E',
        },
        // Metin tonları (adlar miras, değerler yeni palet)
        cream: '#1B2A4A', // başlıklar / güçlü metin
        mist: '#14203A', // gövde metni
        muted: '#5A6478', // ikincil / yardımcı metin
      },
      fontFamily: {
        // global.css'te @fontsource ile yükleniyor
        serif: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Gölgeler gri değil, lacivertten türetilir (skill.md).
        soft: '0 8px 28px -14px rgba(27, 42, 74, 0.22)',
        glow: '0 0 0 1px rgba(232, 162, 61, 0.35), 0 16px 40px -20px rgba(27, 42, 74, 0.28)',
      },
      borderRadius: {
        xl2: '1rem', // 16px — 8'lik boşluk sistemiyle uyumlu
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      maxWidth: {
        content: '72rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
