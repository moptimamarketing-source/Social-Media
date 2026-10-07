# Panduan edit di CapCut — Program Cuti Sekolah (Minda Optima)

Projek: **9:16 (1080×1920), 30 fps, 56 saat**. Semua potongan jatuh pada beat (120 BPM = 0.5 saat/beat).

## Cara paling cepat

1. Import **`output/program_cuti_sekolah_9x16_TANPA_TEKS.mp4`** (video + muzik, tanpa teks) → letak teks sendiri guna jadual 'Teks' di bawah.
2. Atau bina semula dari awal: import semua fail dalam `capcut/clips/` ikut nombor, letak ikut jadual 'Klip', kemudian muzik, kemudian overlay.

## Susunan lapisan (dari bawah ke atas)

| Lapisan | Isi |
|---|---|
| Audio 1 | `music/minda_cuti_ceria.mp3` (mula 0:00). Fade in 0.5 s, fade out 1.0 s |
| Video utama | 19 klip dalam `clips/` + `cta_background.png` (7 s) |
| Overlay | PNG dalam `overlays/` (kanvas penuh, letak pada 0,0, skala 100%) atau taip semula dengan alat Teks |

## Klip (letak ikut turutan, potongan keras kecuali dinyatakan)

| # | Mula | Tempoh | Fail | Kelajuan | Zoom perlahan (keyframe) | Catatan |
|---|---|---|---|---|---|---|
| 01 | 0.00s | 3.00s | `01_hook_C6963_1.5s-4.5s.mp4` | 1.0x | 114%→125% | Pengacara angkat jari & buka tangan, mesra → transisi smoothleft |
| 02 | 3.00s | 2.50s | `02_intro_C7014_2.5s-5.0s.mp4` | 1.0x | 100%→108% | Muncul di lubang bulat dinding kuning |
| 03 | 5.50s | 2.50s | `03_intro_C7016_0.5s-3.0s.mp4` | 1.0x | 105%→110% | Mengintai di sebalik tiang |
| 04 | 8.00s | 2.00s | `04_intro_C6986_3.0s-5.0s.mp4` | 1.0x | 100%→108% | Sudut tinggi, lantai getah berwarna-warni |
| 05 | 10.00s | 3.00s | `05_montaj_C6967_0.0s-3.0s.mp4` | 1.0x | 100%→106% | Berjalan ke kamera, shot lebar |
| 06 | 13.00s | 2.50s | `06_montaj_C6963_24.0s-26.5s.mp4` | 1.0x | 145%→155% | Close-up, tangan dibuka |
| 07 | 15.50s | 2.50s | `07_montaj_C6986_5.5s-8.0s.mp4` | 1.0x | 125%→133% | Mendongak sambil bercakap |
| 08 | 18.00s | 2.00s | `08_montaj_C6970_0.0s-2.0s.mp4` | 1.0x | 100%→106% | Shot lebar, bercakap; potong sebelum lelaki masuk (4.0s) |
| 09 | 20.00s | 2.50s | `09_montaj_C6963_47.0s-49.5s.mp4` | 1.0x | 135%→145% | Close-up, tangan didepa & senyum |
| 10 | 22.50s | 2.00s | `10_montaj_C6967_3.0s-5.0s.mp4` | 1.0x | 100%→108% | Tanda peace sambil menghampiri; potong sebelum lelaki masuk (5.0s) |
| 11 | 24.50s | 2.50s | `11_montaj_C6986_8.0s-10.5s.mp4` | 1.0x | 100%→108% | Gerak tangan, lantai warna-warni |
| 12 | 27.00s | 1.50s | `12_montaj_C6970_2.0s-3.5s.mp4` | 1.0x | 100%→106% | Tunjuk dua jari |
| 13 | 28.50s | 2.50s | `13_montaj_C6963_59.5s-62.0s.mp4` | 1.0x | 100%→108% | Pusing ke sisi (candid), shot lebar |
| 14 | 31.00s | 1.50s | `14_montaj_C6970_8.0s-9.5s.mp4` | 1.0x | 100%→106% | Bercakap dengan gerak tangan; lelaki sudah keluar |
| 15 | 32.50s | 2.50s | `15_montaj_C6963_83.0s-85.5s.mp4` | 1.0x | 150%→160% | Close-up, gerak tangan bersemangat |
| 16 | 35.00s | 3.00s | `16_montaj_C6986_10.5s-13.5s.mp4` | 1.0x | 135%→143% | Senyum mendongak ke kamera → transisi slideleft |
| 17 | 38.00s | 3.50s | `17_emosi_C6967_11.0s-13.4s.mp4` | 0.7x | 100%→106% | Peace sign besar + senyum, slow-mo 0.7x (50fps cukup) |
| 18 | 41.50s | 3.50s | `18_emosi_C6970_9.5s-11.9s.mp4` | 0.7x | 100%→106% | Peace sign close-up, slow-mo 0.7x |
| 19 | 45.00s | 4.00s | `19_emosi_C6963_94.4s-97.2s.mp4` | 0.7x | 130%→138% | Tangan didepa, senyum hangat, slow-mo 0.7x → transisi fadewhite |
| 20 | 49.00s | 7.00s | `cta_background.png` | – | 100%→106% | Latar kad penutup (freeze-frame kabur + tint biru) |

> Klip dalam `clips/` ialah bahagian sumber **tanpa** zoom/transisi dan pada kelajuan asal. Untuk shot slow-mo (17–19) tetapkan Kelajuan 0.7x → tempoh jadi 3.5 s / 3.5 s / 4.0 s. Audio asal pengacara dikekalkan dalam klip; **mutekan** untuk versi muzik sahaja.

## Transisi (3 titik utama sahaja)

| Masa | Jenis | CapCut |
|---|---|---|
| 3.0s | smoothleft 0.3s | Whip / Slide Left |
| 38.0s | slideleft 0.25s | Slide Left |
| 49.0s | fadewhite 0.4s | Flash Putih / Fade White |

## Teks (overlay)

| Masa masuk–keluar | Fail PNG | Teks | Catatan |
|---|---|---|---|
| 0.25–2.85s | `overlays/T01_hook.png` | CUTI SEKOLAH / DAH NAK MULA! | Animasi masuk: Pop / Zoom In; keluar: Fade |
| 3.35–9.85s | `overlays/T02_tajuk.png` | PROGRAM / CUTI SEKOLAH + Minda Optima | Animasi masuk: Pop / Zoom In; keluar: Fade |
| 10.20–12.80s | `overlays/T03.png` | Jom ceriakan cuti sekolah! | Animasi masuk: Pop / Zoom In; keluar: Fade |
| 15.70–17.80s | `overlays/T04_PLACEHOLDER.png` | [AKTIVITI UTAMA] | **ISI/GANTI** (placeholder) |
| 20.20–22.30s | `overlays/T05.png` | Jumpa team kami! | Animasi masuk: Pop / Zoom In; keluar: Fade |
| 24.70–26.80s | `overlays/T06.png` | Ruang terbuka yang seronok | Animasi masuk: Pop / Zoom In; keluar: Fade |
| 28.70–30.80s | `overlays/T07.png` | Jom sertai kami! | Animasi masuk: Pop / Zoom In; keluar: Fade |
| 32.70–34.80s | `overlays/T08_PLACEHOLDER.png` | [UMUR / KUMPULAN SASARAN] | **ISI/GANTI** (placeholder) |
| 35.20–37.80s | `overlays/T09.png` | Tak sabar nak jumpa korang! | Animasi masuk: Pop / Zoom In; keluar: Fade |
| 38.35–48.60s | `overlays/T10_emosi.png` | Cuti yang seronok, / kenangan yang bermakna! | Animasi masuk: Pop / Zoom In; keluar: Fade |
| 49.35–55.80s | `overlays/C1_logo_PLACEHOLDER.png` | [LOGO] | **ISI/GANTI** (placeholder) |
| 49.60–55.80s | `overlays/C2_terhad.png` | Tempat / TERHAD! | Animasi masuk: Pop / Zoom In; keluar: Fade |
| 50.10–55.80s | `overlays/C3_daftar.png` | Daftar sekarang! | Animasi masuk: Pop / Zoom In; keluar: Fade |
| 50.50–55.80s | `overlays/C4_whatsapp_PLACEHOLDER.png` | WhatsApp: [NOMBOR WHATSAPP] | **ISI/GANTI** (placeholder) |
| 50.90–55.80s | `overlays/C5_tarikh_PLACEHOLDER.png` | Tarikh: [TARIKH PROGRAM] | **ISI/GANTI** (placeholder) |

**Tipografi:** Baloo 2 ExtraBold (tajuk) & Poppins SemiBold/ExtraBold (sub), dalam `fonts/` (lesen OFL, bebas guna). Putih/kuning + garis luar biru gelap `#12204A`. Warna aksen: kuning `#FFC93C`, biru `#2F6FED`, oren `#FF7A1A`.
**Zon selamat TikTok:** teks berada 150 px dari atas dan 250 px dari bawah, jauh dari ikon sisi kanan.

## Warna (grade) kira-kira dalam CapCut — Adjust

Eksposur/Kecerahan ≈ +3, Kontras ≈ +5, Ketepuan ≈ +13, Suhu (hangat) ≈ +6. Klip dalam `clips/` sudah digred; **jangan gred dua kali**.

## Muzik

Lagu asal dijana untuk projek ini (tiada hak cipta pihak ketiga) — lihat `music/LESEN.md`. Dinormalkan -14 LUFS. Boleh diganti dengan lagu lain; potongan ikut beat 120 BPM, jadi guna lagu ±120 BPM untuk kekal sekata.

## Eksport

1080×1920, 30 fps, H.264, bitrate tinggi. Fail akhir kami: CRF 18, AAC 192 kbps.

## Placeholder yang perlu diisi

- **Logo** → ganti `logo_placeholder.png` (T: 49.35–55.8 s, atas kad penutup)
- **[NOMBOR WHATSAPP]**, **[TARIKH PROGRAM]** → kad penutup (49.9–55.8 s)
- **[AKTIVITI UTAMA]** (15.7–17.8 s), **[UMUR / KUMPULAN SASARAN]** (32.7–34.8 s) → bar oren di montaj
