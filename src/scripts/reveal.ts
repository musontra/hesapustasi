// Scroll-reveal — [data-reveal] öğeleri görünüme girince yumuşakça belirir.
// Görsel durum global.css'te (.motion-ready [data-reveal] / .is-revealed);
// bu modül yalnızca gözlemi yönetir. Yeniden kullanılabilir + idempotent:
// her astro:page-load'da yeni DOM için güvenle çağrılabilir.
//
// data-reveal             → animasyona dahil et
// data-reveal-delay="120" → stagger (ms) için geçiş gecikmesi
//
// prefers-reduced-motion: reduce → animasyon yok, öğeler direkt görünür.

const GORUNDU = 'is-revealed';

export function initReveal(): void {
  const elemanlar = Array.from(
    document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-revealed)'),
  );
  if (elemanlar.length === 0) return;

  const azHareket = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hareket kapalıysa veya IO yoksa: hepsini anında görünür yap.
  if (azHareket || !('IntersectionObserver' in window)) {
    elemanlar.forEach((el) => el.classList.add(GORUNDU));
    return;
  }

  const gozlemci = new IntersectionObserver(
    (girisler, obs) => {
      for (const giris of girisler) {
        if (!giris.isIntersecting) continue;
        const el = giris.target as HTMLElement;
        const gecikme = el.dataset.revealDelay;
        if (gecikme) el.style.transitionDelay = `${parseInt(gecikme, 10)}ms`;
        el.classList.add(GORUNDU);
        obs.unobserve(el);
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
  );

  elemanlar.forEach((el) => gozlemci.observe(el));
}
