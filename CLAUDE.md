# CLAUDE.md

Bu dosya, bu projede çalışırken uyulması gereken kuralları ve mimari kararları içerir.
Yeni bir hesaplayıcı veya özellik eklerken önce bu belgeyi oku.

## Proje Özeti

Premium bir **hesaplama araçları merkezi**. Tek bir hesaplayıcı değil; zamanla
büyüyecek, her biri kendi sayfasında yaşayan bir araç koleksiyonu. Türkiye'ye
yönelik finans/hukuk hesaplayıcıları (kira artışı, kıdem tazminatı, ihbar
tazminatı, yıllık izin vb.).

## Teknoloji

- **Astro** — statik, hızlı, içerik odaklı site.
- **Tailwind CSS** — tasarım sistemi token'ları üzerinden.
- **Vanilla TypeScript/JavaScript** — hesaplama mantığı ve etkileşim için
  (ağır framework yok; her sayfa minimum JS yükler).
- Hedef: çok hızlı, mobil öncelikli, az JS.

## Mimari İlkeler

1. **Her hesaplayıcı kendi sayfasında.** Rotalar `src/pages/` altında ayrı
   dosyalar: `/kira-artisi`, `/kidem-tazminati-hesaplama`,
   `/ihbar-tazminati-hesaplama`, `/yillik-izin-hesaplama` ...
2. **Ana sayfa** (`/`) tüm hesaplayıcıları premium kartlar halinde listeler.
   Yeni araç eklenince ana sayfaya otomatik/kolayca düşmeli (tek bir
   `calculators` veri kaynağından beslenir).
3. **Tasarım sistemi tek yerden gelir.** Renkler, yazı tipleri, boşluklar ve
   ortak bileşenler merkezi. Yeni hesaplayıcı eklemek = yeni bir sayfa + ortak
   layout/bileşenleri kullanmak. Görsel kararlar sayfa içinde tekrar edilmez.
4. **Hesaplama mantığı sunumdan ayrı.** Her hesaplayıcının saf (pure) hesap
   fonksiyonu `src/lib/` içinde, UI'dan bağımsız ve test edilebilir olur.
5. **İçerik verisi koddan ayrı.** Hesaplayıcı meta verileri (başlık, açıklama,
   ikon, slug, durum) merkezi bir veri dosyasında tutulur.

## Şu Anki Kapsam (önemli)

- **Sadece "Kira Artışı" hesaplayıcısı tam çalışır olacak.**
- Diğer sayfalar (kıdem, ihbar, yıllık izin) için **temiz iskelet/yer tutucu**
  bırakılır — **hesap mantıkları henüz yazılmaz** ("yakında" durumu).
- Kira hesaplama **formülü kullanıcı tarafından sonra verilecek**; şimdilik
  hesap fonksiyonunda net bir yer tutucu (placeholder) bırakılır.

## Tasarım Dili — Marka Kimliği (kaynak: kökteki `skill.md`, SABİT)

- **Zemin:** nötr **krem** `#F7F4EE` (steril beyaz değil). Kartlar `#FFFFFF`.
- **Ana renk:** **lacivert/ink** `#1B2A4A` — başlıklar, header, footer, sonuç
  paneli. Koyu metin `#14203A`, ikincil metin `#5A6478`.
- **Vurgu:** **amber** `#E8A23D` — SADECE sonuç kutusu, birincil CTA ve aktif
  durum. Açık zeminde amber METİN için AA uyumlu koyu ton (`gold-300`) kullanılır.
- **Kenarlık/gölge:** gri değil, lacivertten türetilir (örn. `rgba(27,42,74,0.10)`).
- **Tipografi:**
  - Başlıklar: **Fraunces** (karakterli serif; değişken font).
  - Gövde + rakamlar: **Inter**, `font-feature-settings: "tnum" 1` (tabular).
- **Boşluk:** 8px tabanlı sistem — 8/16/24/32/48/64/96. Keyfi px kullanma.
- **Düzen:** araç odaklı; grid kırık simetrili (öne çıkan kart büyük). Bol
  boşluk, gerçek başlık hiyerarşisi.
- **Animasyon:** ölçülü. Sonuç sayısı count-up ile gelir. Ağır kütüphane/3B yok.
- **Yasak:** mor→mavi gradyan, emoji ikon, glassmorphism/blur kart, stok
  görsel/3B render, uydurma istatistik. (Ayrıntı: `skill.md`.)
- **Erişilebilirlik & hız:** mobil öncelikli, WCAG AA kontrast,
  `prefers-reduced-motion` saygılı, PageSpeed düşürülmez.

## Kira Artışı Sayfası — Gerekli Bölümler

- Kira girişi (input) ve sonuç gösterimi.
- Sonucun **nasıl hesaplandığının açıklaması**.
- **Eski kira / yeni kira** görsel karşılaştırması.
- Sonucu **kopyalama** düğmesi.
- Altta kısa bir **Sık Sorulan Sorular (SSS)** bölümü.

## SEO (önemli — sitenin trafiği buna bağlı)

- **Her sayfanın kendine ait özgün `title` ve meta açıklaması** olur. Bu en
  güvenilir SEO kazanımıdır; ortak layout bunları sayfa başına parametre alır.
- **Anlamlı başlık hiyerarşisi:** her sayfada **tek bir H1**, düzenli H2'ler ve
  gerçekten faydalı metin içeriği.
- Sayfalar hızlı açılır (zaten hedefimiz; az JS, statik üretim).
- **SSS bölümü için `FAQPage` yapılandırılmış verisi (JSON-LD)** eklenir. Her
  zaman zengin sonuç vermez ama iyi pratiktir, zararı yoktur.

## Güncel Oran Yönetimi

- Hesaplamada kullanılan **resmî oran (TÜFE) tek bir merkezi veri dosyasında**
  (`src/data/oranlar.ts` vb.), kolay güncellenebilir biçimde tutulur.
- Sayfada görünür bir **"Son güncelleme: AY YIL"** bilgisi olur — hem kullanıcı
  güveni verir hem aylık güncellemeyi kolaylaştırır. Bu tarih de merkezi veriden
  gelir.

## Yasal Uyarı

- **Her hesaplayıcı sayfasında** kısa bir not bulunur:
  > "Bu araç yalnızca bilgilendirme amaçlıdır, yasal veya mali tavsiye niteliği
  > taşımaz."
- Ortak bir bileşen olarak tutulur, sayfaya gömülmez.

## Yeni Hesaplayıcı Eklerken Akış

1. `src/lib/<arac>.ts` içine saf hesap fonksiyonunu ekle.
2. `src/pages/<slug>.astro` sayfasını ortak layout + bileşenlerle oluştur.
3. Merkezi `calculators` veri kaynağına kaydı ekle (ana sayfada görünsün).
4. Sayfaya özgün `title` + meta açıklama ver, tek H1 + düzenli H2 kur.
5. Kullanılan resmî oran(lar)ı `src/data/oranlar.ts`'e ekle, "Son güncelleme"
   tarihini oradan göster.
6. SSS varsa `FAQPage` JSON-LD ekle; yasal uyarı bileşenini sayfaya koy.
7. Yeni renk/font/boşluk türetme — varsa tasarım token'ı olarak merkeze ekle,
   sayfaya gömme.

## Yapılmayacaklar

- Tasarım kararlarını sayfa sayfa kopyalamak.
- Hesap mantığını UI bileşeninin içine gömmek.
- Kapsam dışı hesaplayıcılara (kıdem/ihbar/izin) formül yazmak — onaylanmadan.
- Saf siyah zemin, parlak/cıvıl renkler, abartılı animasyon.
