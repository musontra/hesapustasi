# SKILL — Profesyonel Hesap/Araç Sitesi Tasarımı

## Rol
Türkçe bir hesaplama/araç merkezi sitesi (hesapatölyesi) tasarlıyorsun. Amaç:
"yapay zekayla yapılmış" izlenimi veren jenerik bir sonuç değil; insan
tasarımcının elinden çıkmış, güven veren, hızlı ve markaya özel bir site.
Bu bir eğlence sitesi değil — kullanıcı bir hesap yapmaya gelir, sonucu net
ve hızlı almak ister. Tasarım bu işlevi süslemeli, önüne geçmemeli.

## Yasak liste (AI slop belirtileri — hiçbiri sonuçta olmayacak)
- Mor→mavi linear-gradient arka plan. En klişe imza, kullanma.
- Emoji ikon (🚀 ✨ 💡 🧮). Gerçek SVG ikon seti kullan (Lucide veya Heroicons).
- Anlamsız glassmorphism / blur kart yığını.
- Stok görsel / 3D render / anlamsız illüstrasyon.
- "Hero başlık + alt başlık + iki buton" şablonunu birebir kopyalama.
- Her araç kartı aynı boyut, aynı boşluk — düz ızgara. Hiyerarşi olacak.
- Uydurma istatistik ("10 milyon kullanıcı", "%99 memnuniyet"). Gerçek yaz veya hiç yazma.

## Marka kimliği (SABİT — değiştirme, aynen uygula)
Renk paleti:
- Ana renk (lacivert/ink): `#1B2A4A` — başlıklar, header, footer, ana yapısal öğeler.
- Koyu metin: `#14203A` — gövde metni.
- Nötr zemin (krem): `#F7F4EE` — sayfa arka planı (steril beyaz DEĞİL).
- Kart yüzeyi: `#FFFFFF` — zeminden hafif ayrışsın.
- Yumuşak metin/etiket: `#5A6478` — ikincil bilgiler.
- Vurgu (amber): `#E8A23D` — SADECE sonuç kutusu, birincil CTA ve aktif durum.
  Her yere serpme; az kullanılınca güçlü olur.
- Kenarlık/gölge: gri değil, lacivertten türet (örn. `rgba(27,42,74,0.10)`).

Font çifti (Google Fonts):
- Başlık: **Fraunces** (karakterli serif, Türkçe glif desteği var).
- Gövde + rakamlar: **Inter** (okunaklı, `font-feature-settings: "tnum" 1;`
  ile tabular rakamlar — hesap sonuçları hizalı görünsün).

- 8px tabanlı boşluk sistemi: 8/16/24/32/48/64/96. Keyfi px kullanma.

## Layout & Hiyerarşi
- Ana sayfa araç odaklı: en çok kullanılan hesaplayıcıları öne çıkar,
  arama/kategori net olsun. Kullanıcı 1 saniyede aradığı aracı bulmalı.
- Başlık hiyerarşisi gerçek olsun: h1 belirgin büyük, h2/h3 kademeli küçülsün.
- Grid'i kırık simetriyle kur — her kart eşit genişlikte, ortalanmış olmasın.
  Öne çıkan araçlar daha büyük, ikincil olanlar küçük.
- Hesaplayıcı sayfasında: girdi alanları solda/üstte net, SONUÇ en görünür
  ve en vurgulu eleman. Sonuç kutusu vurgu renginden güç alsın.

## İçerik kuralları
- Gerçek Türkçe metin yaz, Lorem ipsum yok.
- Başlıkları jenerik tutma ("En İyi Hesap Aracı" değil, aracın ne yaptığını
  net söyleyen başlık: "2026 Kıdem Tazminatı Hesaplama" gibi).
- Her bölümün tek bir mesajı olsun.

## Mikro-detaylar (profesyonelliği burada belli eder)
- Buton, kart ve input için hover/focus durumu tanımla, statik bırakma.
- Gölge ve kenarlığı marka renginden türet, varsayılan gri bırakma.
- İkonları tek stil ailesinden seç (hepsi outline ya da hepsi solid).
- Input alanları erişilebilir ve dokunmatik dostu (yeterli tıklama alanı).

## Teknik kurallar
- Mobil öncelikli, tüm kırılım noktalarında test et. (Trafiğin çoğu mobil.)
- Kontrast oranı WCAG AA. Rakam sonuçları küçük ve soluk olmasın.
- Sayfa hızlı açılsın: gereksiz kütüphane/ağır animasyon ekleme.
  Mevcut PageSpeed skorunu (99/100) düşürme.
- Reklam alanları düzeni bozmasın: içerikten net ayrılsın, layout shift (CLS)
  yaratmasın, sonuç kutusunun önüne geçmesin.

## Bitiş şartı (bunu yapmadan "bitti" deme)
Ekran görüntüsüyle göster ve tek tek kanıtla:
- Seçilen marka renklerini ve font çiftini nerede kullandığını,
- 8px boşluk sisteminin nerede uygulandığını,
- Yasak listesindeki hiçbir öğenin (mor gradyan, emoji ikon, blur kart) olmadığını.
Kanıt olmadan tamamlanmış sayma.
