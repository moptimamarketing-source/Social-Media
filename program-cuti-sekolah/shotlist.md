# Shotlist & Rangka Timeline — Promo Program Cuti Sekolah (Minda Optima)

**Format:** 9:16 · 1080×1920 · 30 fps · **56 saat** (bawah 1 minit) · H.264 CRF 18 · AAC 192 kbps · -14 LUFS

> **Nota penting tentang rakaman:** keenam-enam klip hanya menunjukkan **seorang pengacara** bercakap kepada kamera di taman/padang permainan. **Tiada kanak-kanak, kelas atau aktiviti** dalam rakaman, jadi teks hanya merujuk apa yang nampak (padang permainan, pengacara) dan maklumat program yang tiada dibiarkan sebagai placeholder. Struktur 'montaj aktiviti' dan 'momen heartwarming' dibina daripada shot pengacara paling ceria (mengintai, jalan ke kamera, tanda peace, senyum). Jika ada rakaman kanak-kanak, ganti shot di `edit_config.json`.

## 1. Analisis klip (ffprobe)

| Klip | Saiz paparan | FPS | Tempoh | Orientasi | Audio | Bunyi aktif |
|---|---|---|---|---|---|---|
| C6963 | 1080x1920 (tag putaran -90°) | 50 | 102.2s | menegak | pcm_s16be | 0–102s |
| C6967 | 1080x1920 (tag putaran 90°) | 50 | 13.9s | menegak | pcm_s16be | 0–14s |
| C6970 | 1080x1920 (tag putaran 90°) | 50 | 12.5s | menegak | pcm_s16be | 0–12s |
| C6986 | 1080x1920 (tag putaran 90°) | 50 | 13.9s | menegak | pcm_s16be | 0–14s |
| C7014 | 1080x1920 (tag putaran 90°) | 50 | 6.2s | menegak | pcm_s16be | 0–6s |
| C7016 | 1080x1920 (tag putaran 90°) | 50 | 5.8s | menegak | pcm_s16be | 0–6s |

Semua klip 1920×1080 dengan tag putaran → dipaparkan **menegak 1080×1920 natif**, jadi tiada crop landskap dan tiada bar hitam. Muka dikesan (OpenCV) dalam hampir semua bingkai yang disemak; titik fokus digunakan untuk zoom perlahan & close-up supaya muka tak terpotong (`analysis/focus.json`). Goyangan kamera diukur (jitter ≤ 0.6 px pada 270 px lebar, ambang stabilisasi 0.9 px) → **tiada shot yang perlu `vidstab`**, jadi tiada stabilisasi dikenakan (supaya tidak merosakkan shot yang sudah stabil). Audio aktif sepanjang klip; **tiada puncak sorakan/gelak** yang dikesan (`analysis/audio_report.md`), maka audio asal dimutekan dan diganti muzik.

## 2. Shotlist (segmen terbaik, skor 1–5)

### C6963

| Segmen sumber | Apa berlaku | Skor | Digunakan |
|---|---|---|---|
| 1.5–4.5s | Pengacara angkat jari & buka tangan, mesra | 5 | ✔ shot 01 (0.0s) |
| 24.0–26.5s | Close-up, tangan dibuka | 4 | ✔ shot 06 (13.0s) |
| 47.0–49.5s | Close-up, tangan didepa & senyum | 5 | ✔ shot 09 (20.0s) |
| 59.5–62.0s | Pusing ke sisi (candid), shot lebar | 3 | ✔ shot 13 (28.5s) |
| 83.0–85.5s | Close-up, gerak tangan bersemangat | 4 | ✔ shot 15 (32.5s) |
| 94.4–97.2s | Tangan didepa, senyum hangat, slow-mo 0.7x | 4 | ✔ shot 19 (45.0s) |
| 4.5–8.0s | Pengacara bercakap, gerak tangan ringan | 3 | – |
| 35.0–37.5s | Senyum lebar, tangan bertaut | 3 | – |
| 90.0–93.0s | Gerak tangan, bercakap tenang | 2 | – |
| selebihnya (±80 saat)s | BUANG: pengacara berdiri tenang bercakap; ulang bingkai yang sama | 1 | ✘ |

### C6967

| Segmen sumber | Apa berlaku | Skor | Digunakan |
|---|---|---|---|
| 0.0–3.0s | Berjalan ke kamera, shot lebar | 4 | ✔ shot 05 (10.0s) |
| 3.0–5.0s | Tanda peace sambil menghampiri; potong sebelum lelaki masuk (5.0s) | 5 | ✔ shot 10 (22.5s) |
| 11.0–13.4s | Peace sign besar + senyum, slow-mo 0.7x (50fps cukup) | 5 | ✔ shot 17 (38.0s) |
| freeze 13.3s | Freeze-frame peace sign, kabur + tint biru sebagai latar kad penutup | 5 | ✔ shot 20 (49.0s) |
| 5.0–10.0s | BUANG: lelaki lalu di belakang | 1 | ✘ |

### C6970

| Segmen sumber | Apa berlaku | Skor | Digunakan |
|---|---|---|---|
| 0.0–2.0s | Shot lebar, bercakap; potong sebelum lelaki masuk (4.0s) | 3 | ✔ shot 08 (18.0s) |
| 2.0–3.5s | Tunjuk dua jari | 3 | ✔ shot 12 (27.0s) |
| 8.0–9.5s | Bercakap dengan gerak tangan; lelaki sudah keluar | 3 | ✔ shot 14 (31.0s) |
| 9.5–11.9s | Peace sign close-up, slow-mo 0.7x | 5 | ✔ shot 18 (41.5s) |
| 4.0–7.5s | BUANG: lelaki dengan telefon masuk/keluar bingkai | 1 | ✘ |

### C6986

| Segmen sumber | Apa berlaku | Skor | Digunakan |
|---|---|---|---|
| 3.0–5.0s | Sudut tinggi, lantai getah berwarna-warni | 4 | ✔ shot 04 (8.0s) |
| 5.5–8.0s | Mendongak sambil bercakap | 4 | ✔ shot 07 (15.5s) |
| 8.0–10.5s | Gerak tangan, lantai warna-warni | 3 | ✔ shot 11 (24.5s) |
| 10.5–13.5s | Senyum mendongak ke kamera | 4 | ✔ shot 16 (35.0s) |
| 0.0–3.0s | BUANG: lantai kosong, belum ada orang | 1 | – |
| 0.0–3.0s | BUANG: lantai kosong, pengacara belum masuk | 1 | ✘ |

### C7014

| Segmen sumber | Apa berlaku | Skor | Digunakan |
|---|---|---|---|
| 2.5–5.0s | Muncul di lubang bulat dinding kuning | 5 | ✔ shot 02 (3.0s) |
| 0.0–2.4s | BUANG: lubang kosong | 1 | – |
| 0.0–2.4 & 5.0–6.2s | BUANG: lubang kosong | 1 | ✘ |

### C7016

| Segmen sumber | Apa berlaku | Skor | Digunakan |
|---|---|---|---|
| 0.5–3.0s | Mengintai di sebalik tiang | 4 | ✔ shot 03 (5.5s) |
| 3.5–5.8s | BUANG: pengacara sudah keluar bingkai | 1 | – |
| 3.5–5.8s | BUANG: pengacara sudah keluar bingkai | 1 | ✘ |

## 3. Rangka timeline

| Bahagian | Masa | Shot | Teks |
|---|---|---|---|
| HOOK | 0–3s | 01 | CUTI SEKOLAH DAH NAK MULA! |
| INTRO | 3–10s | 02, 03, 04 | PROGRAM CUTI SEKOLAH · Minda Optima |
| MONTAJ | 10–38s | 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16 | Bar bawah: Jom ceriakan cuti sekolah! · [AKTIVITI UTAMA] · Jumpa team kami! · Ruang terbuka yang seronok · Jom sertai kami! · [UMUR / KUMPULAN SASARAN] · Tak sabar nak jumpa korang! |
| MOMEN CERIA (slow-mo 0.7x) | 38–49s | 17, 18, 19 | Cuti yang seronok, kenangan yang bermakna! |
| CTA | 49–56s | 20 | Tempat TERHAD! · Daftar sekarang! · WhatsApp: [NOMBOR WHATSAPP] · Tarikh: [TARIKH PROGRAM] · [LOGO] |

### Potongan satu-persatu

| Shot | Masa video | Tempoh | Klip | Sumber | Zoom | Kelajuan |
|---|---|---|---|---|---|---|
| 01 | 0.0–3.0s | 3.0s | C6963 | 1.5–4.5s | 114→125% | 1.0x |
| 02 | 3.0–5.5s | 2.5s | C7014 | 2.5–5.0s | 100→108% | 1.0x |
| 03 | 5.5–8.0s | 2.5s | C7016 | 0.5–3.0s | 105→110% | 1.0x |
| 04 | 8.0–10.0s | 2.0s | C6986 | 3.0–5.0s | 100→108% | 1.0x |
| 05 | 10.0–13.0s | 3.0s | C6967 | 0.0–3.0s | 100→106% | 1.0x |
| 06 | 13.0–15.5s | 2.5s | C6963 | 24.0–26.5s | 145→155% | 1.0x |
| 07 | 15.5–18.0s | 2.5s | C6986 | 5.5–8.0s | 125→133% | 1.0x |
| 08 | 18.0–20.0s | 2.0s | C6970 | 0.0–2.0s | 100→106% | 1.0x |
| 09 | 20.0–22.5s | 2.5s | C6963 | 47.0–49.5s | 135→145% | 1.0x |
| 10 | 22.5–24.5s | 2.0s | C6967 | 3.0–5.0s | 100→108% | 1.0x |
| 11 | 24.5–27.0s | 2.5s | C6986 | 8.0–10.5s | 100→108% | 1.0x |
| 12 | 27.0–28.5s | 1.5s | C6970 | 2.0–3.5s | 100→106% | 1.0x |
| 13 | 28.5–31.0s | 2.5s | C6963 | 59.5–62.0s | 100→108% | 1.0x |
| 14 | 31.0–32.5s | 1.5s | C6970 | 8.0–9.5s | 100→106% | 1.0x |
| 15 | 32.5–35.0s | 2.5s | C6963 | 83.0–85.5s | 150→160% | 1.0x |
| 16 | 35.0–38.0s | 3.0s | C6986 | 10.5–13.5s | 135→143% | 1.0x |
| 17 | 38.0–41.5s | 3.5s | C6967 | 11.0–13.4s | 100→106% | 0.7x |
| 18 | 41.5–45.0s | 3.5s | C6970 | 9.5–11.9s | 100→106% | 0.7x |
| 19 | 45.0–49.0s | 4.0s | C6963 | 94.4–97.2s | 130→138% | 0.7x |
| 20 | 49.0–56.0s | 7.0s | C6967 | freeze 13.3s | 100→106% | 1.0x |

Semua potongan jatuh pada beat (120 BPM, 0.5 s/beat). **Transisi** (hanya 3): whip `smoothleft` selepas hook (3.0s), `slideleft` ke momen ceria (38.0s), flash putih sebelum CTA (49.0s). Selebihnya potongan keras.

## 4. Gaya

- **Grade:** terang & hangat (kecerahan +0.03, kontras +5%, ketepuan +13%, sedikit hangat); C6986/C7014 dikurangkan ketepuan supaya seragam dengan klip lain.
- **Pergerakan:** zoom perlahan 100→108% pada shot statik; close-up berpusat pada muka (crop pintar).
- **Tipografi:** Baloo 2 ExtraBold + Poppins; putih/kuning + garis luar gelap + bayang; animasi pop/slide. Aksen kuning `#FFC93C`, biru `#2F6FED`, oren `#FF7A1A`. Zon selamat: 150px atas / 250px bawah / 120px kanan.
- **Audio:** lagu asal 120 BPM (C–G–Am–F), dinormalkan -14 LUFS, fade in 0.5s / out 1.0s.
