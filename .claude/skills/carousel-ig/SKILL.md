---
name: "carousel-ig"
description: "Tulis DAN hasilkan carousel Instagram/Facebook/LinkedIn untuk Minda Optima — slide PNG sedia upload (4:5, 1:1, 9:16) beserta caption. Untuk tips membaca, mitos vs fakta, tanda-tanda anak lambat membaca, testimoni, FAQ ibu bapa, promo assessment. Gunakan bila staf sebut \"carousel\", \"slide IG\", \"post slide\", \"infografik\", \"post swipe\", \"buat design post\", \"tips dalam slide\", \"post feed\", \"poster tips\", atau minta tukar artikel/video/skrip jadi post bergambar. NOTA: Minda Optima program membaca kanak-kanak, BUKAN taska. Jangan janji hasil bacaan dalam tempoh tertentu."
---

# Carousel IG — Minda Optima

Baca `references/business-context.md` dahulu.

Carousel ialah format yang paling banyak di-*save* dan di-*share* oleh ibu bapa — mereka simpan untuk baca semula atau hantar ke grup WhatsApp keluarga. Jadi setiap carousel mesti **berguna walaupun tak pernah dengar nama Minda Optima**. Jualan datang dari kepercayaan, kepercayaan datang dari ilmu yang betul-betul membantu.

## Aliran kerja

1. **Faham matlamat** — save/share (tips), lead (assessment), atau kepercayaan (testimoni/di sebalik tabir). Kalau tak disebut, andaikan tips dan nyatakan.
2. **Tulis kandungan dulu** dan tunjuk kepada staf dalam jadual (slide · tajuk · isi). Struktur default 5–8 slide:
   - Slide 1 **cover**: hook — masalah ibu bapa, bukan nama syarikat. Maksimum ~10 patah perkataan.
   - Slide 2–N **point**: satu idea satu slide. Tajuk ≤ 10 patah perkataan, isi ≤ 35 patah perkataan.
   - Pilihan **quote**: petikan ibu bapa/guru *sebenar* sahaja.
   - Slide akhir **cta**: satu tindakan sahaja (save / follow / assessment di link bio).
3. **Render** dengan skrip — tulis `slides.json` (format di bahagian atas `scripts/carousel.py`) lalu:
   ```bash
   python3 scripts/carousel.py slides.json carousel/ --ratio 4:5
   ```
   Output: `01.png`, `02.png`… dan `preview.png`.
4. **Semak** — buka `preview.png` dan lihat sendiri: teks terpotong? terlalu padat? Kalau ya, pendekkan teks (jangan kecilkan font lagi).
5. **Serah**: fail PNG + caption post sedia salin + 3–5 hashtag + nota apa yang perlu disemak.

## Warna & jenama

Warna default dalam skrip (oren + krim) ialah **placeholder**. Tanya staf warna rasmi jenama (kod hex) dan fail logo PNG, dan masukkan dalam `"brand"` dalam JSON. Ingat pilihan mereka untuk carousel seterusnya dalam perbualan yang sama. Kalau team Marketing (Aina) dah ada template Canva, cadang guna skill ini untuk **tulis teks**, dan Aina letak dalam template.

## Prinsip kandungan

- **Spesifik mengalahkan umum.** "Dia boleh eja B-A BA tapi tak boleh sebut 'baju'" lebih kuat daripada "anak susah membaca".
- **Tiada janji tempoh**, tiada "dijamin", tiada perbandingan dengan anak lain.
- **Testimoni mesti benar** — guna "Puan A" kecuali ibu bapa beri kebenaran nama.
- **Bukan taska** — elak imej/ayat jagaan kanak-kanak.
- Tip mesti selaras dengan kaedah kita (tanpa eja, tanpa hafal, fokus artikulasi). Kalau tak pasti sesuatu tip betul dari segi pedagogi Pantas Baca/TVR, tandakan untuk disemak trainer (Siti Azlina / Siti Aida).

## Idea siri yang terbukti untuk ibu bapa

Tanda-tanda (X tanda anak…) · Mitos vs Fakta · Silap biasa di rumah · Aktiviti 5 minit sebelum tidur · Soalan yang ibu bapa selalu tanya · Sebelum/selepas *kemahiran* (bukan tempoh) · Kenal guru kami.
