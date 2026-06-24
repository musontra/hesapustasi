# automation/

Aylık TÜFE → kira oranı otomasyonunun ürettiği dosyalar.

- **`last-check.txt`** — `scripts/update-oranlar.mjs` TEST modunda (`TEST_PR=true`)
  buraya ISO zaman damgası yazar. Amaç: gerçek oranı (`src/data/oranlar.ts`)
  değiştirmeden PR hattını uçtan uca denemek için zararsız bir değişiklik üretmek.
- **`pr-body.md`** — her çalışmada üretilen PR açıklaması (Türkçe). `.gitignore`'da
  olduğu için commit edilmez; GitHub Actions yalnızca PR gövdesi olarak okur
  (`body-path`). Böylece "oran değişmedi" durumunda gereksiz diff/PR oluşmaz.

Çalıştırma: `.github/workflows/tufe-guncelle.yml` (cron + manuel tetikleme).
Doğrulama mantığı `scripts/evds-test.mjs` ile kanıtlanmıştır.
