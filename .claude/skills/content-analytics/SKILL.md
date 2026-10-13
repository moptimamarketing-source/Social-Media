---
name: "content-analytics"
description: "Analisis prestasi content media sosial Minda Optima daripada data export (Meta Business Suite, TikTok Studio, YouTube Studio — CSV/Excel atau screenshot) — post mana menang, kenapa, format/pillar/hook mana yang patut digandakan, dan laporan bulanan untuk boss. Gunakan bila staf sebut \"analisis post\", \"insights\", \"report bulanan\", \"laporan marketing\", \"engagement rendah\", \"reach jatuh\", \"post mana paling bagus\", \"views\", \"followers\", \"KPI social media\", \"export Meta\", \"TikTok analytics\", atau upload CSV/xlsx/screenshot statistik. NOTA: Minda Optima program membaca kanak-kanak, BUKAN taska."
---

# Content Analytics — Minda Optima

Baca `references/business-context.md` dahulu — terutamanya **Peraturan data** (sel kosong ≠ sifar, jangan reka nombor).

## Soalan sebenar di sebalik setiap laporan

Boss tak perlukan 30 metrik. Dia perlukan jawapan kepada: **"Apa yang kita patut buat lebih, dan apa yang patut berhenti?"** Setiap analisis mesti berakhir dengan 3 tindakan konkrit.

Dan ingat matlamat sebenar bisnes ialah **ibu bapa daftar** — bukan likes. Metrik yang paling dekat dengan wang: saves & shares (kepercayaan), klik link/WhatsApp (niat), lead (dari Sales). Views tinggi tanpa mesej masuk = hiburan, bukan pemasaran.

## Aliran kerja

1. **Muat data** — CSV/Excel export: baca dengan pandas (`pd.read_csv` / `pd.read_excel`), cetak nama lajur dan 5 baris pertama dulu. Lajur export Meta/TikTok berubah dari semasa ke semasa — padankan ikut makna, dan beritahu staf lajur mana yang kau guna. Screenshot: baca nombor dari gambar, senaraikan semula dalam jadual untuk staf sahkan sebelum analisis.
2. **Bersihkan** — sel kosong kekal kosong ("Belum isi"), jangan isi sifar. Buang baris jumlah/tajuk. Pastikan tarikh betul.
3. **Kira metrik yang adil** — bandingkan nisbah, bukan nombor mentah (post lama sentiasa ada lebih views):
   - Engagement rate = (likes + comments + shares + saves) ÷ reach
   - Save rate & share rate = saves ÷ reach, shares ÷ reach  ← paling penting untuk content ilmu
   - Video: purata masa tonton ÷ panjang video; % yang tonton 3 saat (kekuatan hook)
4. **Kumpul ikut dimensi** — format (Reels/carousel/gambar), pillar (ilmu/bukti/tabir/jualan), hari/jam, jenis hook. Kalau data tak ada lajur pillar/hook, tag sendiri berdasarkan caption dan tunjuk tag itu kepada staf.
5. **Cari corak** — top 5 dan bottom 5 post: apa yang sama antara mereka? Hook? Format? Topik? Muka guru?
6. **Tindakan** — 3 cadangan: gandakan X, ubah Y, berhenti Z. Setiap satu dengan bukti dari data.

## Format laporan bulanan

1. **Satu perenggan ringkasan** — keputusan utama dalam bahasa boss (tiada jargon).
2. **4–6 angka utama** dengan perbandingan bulan lepas (↑/↓ %) — reach, followers bersih, engagement rate, saves, klik/mesej WhatsApp, lead (jika Sales beri).
3. **Top 3 post** dan kenapa ia menang.
4. **Apa yang tak jalan** — secara jujur, tanpa menyalahkan individu (prinsip *jaga maruah staf*: bincang content, bukan orang).
5. **3 tindakan bulan depan.**

Untuk carta, guna skill `dataviz`; untuk fail Excel guna skill `xlsx`; untuk dokumen boleh kongsi guna skill `docs`.

## Jangan

- Reka penanda aras industri ("purata ER pendidikan ialah 4.2%") — kalau tiada sumber, bandingkan dengan data Minda Optima sendiri.
- Buat kesimpulan daripada 1–2 post. Sebut bila sampel terlalu kecil.
- Kaitkan lead dengan post tertentu tanpa data penjejakan — nyatakan ia andaian.
