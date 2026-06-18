/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte,md,mdx}'],
  theme: {
    extend: {
      colors: {
        // Koyu lacivert zemin — saf siyah değil, derinlikli (mavi-mor)
        ink: {
          950: '#070B16', // en koyu — sayfa zemini
          900: '#0B1020', // ana zemin
          800: '#11182B', // yüzey / kart
          700: '#1A2238', // yükseltilmiş yüzey
          600: '#283150', // ince ayraç / kenarlık
        },
        // Şampanya altını — tek sıcak vurgu rengi
        gold: {
          DEFAULT: '#D9B779',
          300: '#EBD9B4', // açık vurgu / hover
          400: '#E2C896',
          500: '#D9B779', // ana vurgu
          600: '#C2A063', // koyu vurgu / kenarlık
        },
        // Uyarı tonu — "açıklanmadı / geçersiz oran" rozetleri için.
        // Şampanya altınıyla uyumlu, ölçülü kehribar; saf siyah/parlak değil.
        warn: {
          300: '#F2CE7E', // metin (koyu zeminde okunur)
          500: '#E0A92E', // kenarlık / dolgu temeli
        },
        // Metin tonları
        cream: '#F4F1E9', // başlık metni (sıcak beyaz)
        mist: '#C5CBDA', // gövde metni
        muted: '#8B93A7', // ikincil / yardımcı metin
      },
      fontFamily: {
        // global.css'te @fontsource ile yükleniyor
        serif: ['"Fraunces Variable"', 'Georgia', 'serif'],
        sans: ['"Inter Variable"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(0, 0, 0, 0.55)',
        glow: '0 0 0 1px rgba(217, 183, 121, 0.18), 0 18px 50px -20px rgba(217, 183, 121, 0.25)',
      },
      borderRadius: {
        xl2: '1.25rem',
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
