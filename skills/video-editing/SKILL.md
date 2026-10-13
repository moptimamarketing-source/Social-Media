---
name: "video-editing"
description: "Rancang, tulis skrip dan EDIT video media sosial Minda Optima — Reels, TikTok, Shorts, iklan Meta/TikTok, testimoni ibu bapa, tips membaca, promo assessment. Edit fail video sebenar dengan ffmpeg: potong, sambung klip, tukar 9:16/4:5/1:1, buang jeda senyap (jump cut), subtitle, teks hook, logo, muzik latar (auto-perlahan bila bercakap), seimbang bunyi, compress WhatsApp, thumbnail. Gunakan bila staf sebut \"edit video\", \"potong video\", \"buat reels\", \"buat tiktok\", \"skrip video\", \"hook\", \"storyboard\", \"shot list\", \"subtitle\", \"caption video\", \"9:16\", \"letak logo\", \"letak muzik\", \"compress video\", \"thumbnail\", \"idea content\", \"brief editor\", \"CapCut\", upload fail .mp4/.mov, atau tanya kenapa video tak perform. NOTA: Minda Optima program membaca kanak-kanak, BUKAN taska. Jangan janji hasil bacaan dalam tempoh tertentu."
---

# Video Editing — Minda Optima

Baca `references/business-context.md` dahulu (siapa kita, prinsip, PDPA).
Untuk spesifikasi platform, struktur hook dan templat skrip, baca `references/format-dan-hook.md`.

Skill ini ada **dua mod**. Kenal pasti dulu mana satu yang staf perlukan — selalunya kedua-duanya.

| Mod | Bila | Output |
| --- | --- | --- |
| **A. Rancang** | Belum ada video, atau nak idea / skrip / brief untuk editor | Skrip, shot list, teks atas skrin, caption, brief CapCut |
| **B. Edit** | Staf beri fail video | Fail video siap edit (.mp4) + nota apa yang diubah |
| **C. Repurpose** | Ada video panjang (live, webinar, wawancara guru/ibu bapa) | 5–10 reels pendek, setiap satu dengan hook + caption |
| **D. Grafik bergerak** | Nak tajuk animasi, kinetic text, video tanpa muka, video ikut beat lagu | Rujuk skill HyperFrames (lihat bawah) |

---

## Kenapa video kita perlu lain daripada video "marketing" biasa

Penonton kita ialah **ibu bapa yang risau anak lambat membaca**, scroll telefon waktu malam lepas anak tidur. Mereka tak berhenti scroll untuk logo, muzik epik atau "Daftar sekarang!". Mereka berhenti bila nampak **masalah anak mereka sendiri** di skrin.

Jadi 3 saat pertama mesti tunjuk atau sebut kerisauan itu — bukan nama syarikat. Logo boleh tunggu; perhatian tak boleh.

Dan sebab kita jual kepercayaan (bisnes keluarga sejak 1995), video yang nampak *jujur* — guru sebenar, kelas sebenar, suara ibu bapa sebenar — selalunya kalahkan video yang terlalu "production". Jangan nasihat staf beli peralatan mahal; telefon + cahaya tingkap + audio jelas sudah cukup.

---

## Peraturan yang tidak boleh dilanggar

- **Muka & nama kanak-kanak (PDPA):** hanya guna kalau ada kebenaran bertulis ibu bapa untuk media sosial. Kalau tak pasti — tanya dulu, dan cadang alternatif (rakam dari belakang, fokus tangan atas buku, blur muka). Jangan letak nama penuh, sekolah atau lokasi rumah anak dalam teks/caption.
- **Jangan janji hasil dalam tempoh tertentu.** Tiada "3 bulan confirm boleh baca", "dijamin lancar". Video before/after mesti sebut sesuatu seperti "setiap anak berbeza" dalam caption.
- **Testimoni mesti benar.** Jangan reka testimoni, jangan tulis skrip untuk "ibu bapa" berlakon seolah-olah pelanggan sebenar. Boleh bantu ibu bapa sebenar susun apa yang mereka nak cakap.
- **Bukan taska.** Jangan guna imej/ayat yang bayangkan jagaan kanak-kanak sepanjang hari.
- **Muzik:** untuk post organik, cadang guna muzik dari library dalam app (TikTok/IG) semasa upload. Kalau bakar muzik dalam fail, mesti muzik bebas royalti yang staf ada hak guna — tanya sumbernya.
- **Jangan reka fakta** (harga, lokasi, tarikh, promo). Tinggalkan `[ISI]`.

---

## Mod A — Rancang

Hasilkan pakej lengkap sekali gus supaya staf boleh terus rakam. Jangan bagi separuh dan tunggu diminta.

1. **Matlamat & platform** — satu ayat: video ni untuk apa (awareness / lead / retention) dan di mana (Reels, TikTok, iklan Meta…). Kalau staf tak sebut, andaikan Reels + TikTok 9:16, 20–45 saat, dan nyatakan andaian.
2. **3 pilihan hook** — guna formula dalam `references/format-dan-hook.md`. Tandakan yang kau syorkan dan kenapa.
3. **Skrip berbabak** dalam jadual:

   | Saat | Visual (apa dirakam) | Suara / dialog | Teks atas skrin |
   | --- | --- | --- | --- |

   Teks atas skrin maksimum ~6 patah perkataan sebabak — orang baca sambil dengar.
4. **Shot list** untuk orang yang merakam: senarai pendek, setiap shot dengan sudut + tempoh + tip (cth "rakam menegak, telefon paras mata anak, 5 saat lebih panjang dari perlu").
5. **Caption post** (BM santai, 2–4 baris, satu CTA) + 3–5 hashtag relevan. Tiada janji tempoh.
6. **Brief untuk editor (CapCut)** — langkah demi langkah ikut masa: potong di mana, teks apa muncul bila, jenis transisi, gaya caption auto, cadangan muzik (mood + BPM, bukan tajuk lagu berhak cipta).

Kalau staf minta "idea content", beri 5–10 idea dalam jadual (tajuk · hook · format · kenapa ia kena dengan ibu bapa), kemudian tawar untuk tulis skrip penuh untuk yang dipilih.

---

## Mod B — Edit fail video

Alat: `scripts/vtool.py` (Python + ffmpeg). Jalankan dengan `python3 scripts/vtool.py <arahan> -h` untuk pilihan penuh.

### Langkah 0 — Pastikan ffmpeg ada
```bash
which ffmpeg || pip install imageio-ffmpeg
```
vtool akan guna ffmpeg sistem, atau ffmpeg dari `imageio-ffmpeg` kalau tiada. Kalau dua-dua gagal (tiada internet / code execution OFF), beritahu staf dan beri brief CapCut (Mod A langkah 6) sebagai ganti — jangan berhenti kosong.

### Langkah 1 — Faham video dulu, sebelum edit
```bash
python3 scripts/vtool.py info input.mp4
python3 scripts/vtool.py frames input.mp4 frames/ --every 2
```
Lihat gambar dalam `frames/` (buka dan tengok betul-betul). Ini cara kau "tonton" video: kenal pasti di mana hook sebenar bermula, bahagian kosong/goyang, muka kanak-kanak (isu PDPA), dan teks yang dah sedia ada. Beritahu staf apa yang kau nampak dalam 2–3 baris sebelum mula edit besar.

### Langkah 2 — Edit ikut urutan ini
Urutan penting — subtitle dan teks mesti dibuat **selepas** saiz bingkai muktamad, kalau tak ia tersasar.

| # | Tugas | Arahan |
| --- | --- | --- |
| 1 | Potong bahagian | `trim in.mp4 out.mp4 --start 0:03 --end 0:41` |
| 2 | Buang jeda senyap (video bercakap) | `jumpcut in.mp4 out.mp4` (ketat: `--min-silence 0.4`) |
| 3 | Sambung beberapa klip | `concat out.mp4 a.mp4 b.mp4 c.mp4 --ratio 9:16` |
| 4 | Tukar nisbah | `reframe in.mp4 out.mp4 --ratio 9:16 --mode blur` |
| 5 | Laju / perlahan | `speed in.mp4 out.mp4 --factor 1.1` |
| 6 | Bunyi + muzik latar | `audio in.mp4 out.mp4 --music lagu.mp3 --music-vol 0.25` |
| 7 | Subtitle | `srt skrip.txt cap.srt --video in.mp4` lalu `subs in.mp4 out.mp4 --srt cap.srt --box` |
| 8 | Teks hook / CTA | `text in.mp4 out.mp4 --text "Anak 6 tahun\nmasih eja?" --pos atas --start 0 --end 3` |
| 9 | Logo | `logo in.mp4 out.mp4 --logo logo.png --pos ka` |
| 10 | Compress (WhatsApp) | `compress in.mp4 out.mp4 --target-mb 15 --max-height 1280` |
| 11 | Thumbnail | `thumb in.mp4 cover.jpg --at 2.5` |
| 12 | Banyak reels dari video panjang | `clips panjang.mp4 reels/ --list clips.txt` (lihat Mod C) |

Nota penggunaan:
- **reframe `--mode`**: `blur` (default) untuk video landskap → 9:16 tanpa potong orang; `crop` bila subjek di tengah dan nak penuh skrin; `pad` untuk jalur hitam.
- **jumpcut** sesuai untuk guru/staf bercakap depan kamera. Jangan guna pada video kelas sebenar — jeda anak berfikir sebelum membaca itu sebahagian cerita.
- **audio**: muzik automatik jadi perlahan bila ada suara (ducking), dan bunyi diseimbangkan ke −14 LUFS (standard TikTok/IG/YouTube). Tanpa `--music` ia cuma seimbangkan bunyi.
- **Subtitle automatik (transkrip suara)**: kalau Node.js ada, guna transkripsi HyperFrames (jalan dalam komputer, percuma):
  `npx hyperframes transcribe in.mp4 --engine whisper --model large-v3 --language ms --to srt -o cap.srt`
  (model `.en` hanya untuk English — BM perlukan `large-v3`; muat turun kali pertama besar). Selepas itu **semak ejaan BM & nama** dalam `cap.srt` sebelum `subs`.
- **srt** (tanpa transkripsi): Kalau staf ada skrip, `srt` agih masa ikut panjang ayat — semak dan laraskan masa dalam fail .srt jika perlu. Kalau tiada skrip, cadang guna *Auto captions* CapCut, export .srt, dan kau betulkan ejaan BM sebelum bakar.
- **text**: guna `\n` untuk baris baru; maksimum 2 baris. Letak dalam zon selamat (lihat rujukan) — `--pos atas` atau `tengah`, elak paling bawah (ditutup butang app).
- Setiap langkah hasilkan fail baru. Namakan jelas (`01_trim.mp4`, `02_916.mp4`…) supaya mudah undur.

### Langkah 3 — Semak hasil sebelum serah
Jalankan `frames` pada fail akhir dan **lihat** sekurang-kurangnya gambar pertama, tengah dan akhir: teks tak terpotong, subtitle tak bertindih dengan teks hook, logo tak tutup muka. Betulkan dulu kalau ada masalah.

### Langkah 4 — Serah
Beri fail akhir + nota ringkas:
1. **Apa yang aku ubah** (senarai pendek, ikut urutan)
2. **Apa yang aku andaikan** & apa staf perlu semak (`[ISI]`, ejaan nama, kebenaran muka anak)
3. **Caption post** sedia salin + masa terbaik post kalau ditanya
4. **Cadangan seterusnya** — satu benda yang akan buat video ni lebih kuat (biasanya hook)

---

## Mod C — Repurpose video panjang jadi banyak reels

Satu video 30–60 minit (live FB, webinar ibu bapa, wawancara guru) = bahan untuk sebulan.

1. **Dapatkan transkrip** (`npx hyperframes transcribe … --to srt`) atau minta staf beri masa-masa menarik.
2. **Pilih 5–10 detik emas** — bahagian 15–45 saat yang boleh berdiri sendiri: satu tip, satu cerita, satu ayat kuat ibu bapa. Utamakan bahagian yang *bermula dengan masalah* (itu hook semula jadi). Elak bahagian yang perlu konteks sebelumnya.
3. **Tulis fail senarai** (`clips.txt`), satu klip sebaris:
   ```
   2:15-2:52 anak-tekan-buku
   11:03-11:40 silap-ibu-bapa-di-rumah
   ```
4. **Potong semua sekali gus**: `python3 scripts/vtool.py clips panjang.mp4 reels/ --list clips.txt --ratio 9:16 --mode crop`
   (bunyi setiap klip diseimbangkan automatik). Guna `--mode blur` kalau ada lebih daripada satu orang dalam bingkai.
5. Untuk setiap klip: teks hook 0–3s (`text`), subtitle (`subs`), dan caption post.
6. **Serah dalam jadual**: fail · hook · caption · cadangan hari post (sebar 2–3 seminggu, jangan lambak sehari).

---

## Mod D — Grafik bergerak & video dari kod (HyperFrames)

Kalau repo ini dibuka dalam Claude Code, skill HyperFrames dipasang sekali. Guna bila:

| Nak buat | Skill |
| --- | --- |
| Tajuk animasi, stat naik, logo sting, lower-third | `/motion-graphics` |
| Video tips tanpa muka (teks + grafik) daripada skrip | `/faceless-explainer` |
| Grafik/tajuk atas video guru bercakap | `/talking-head-recut` |
| Caption bergaya (35 gaya) atas video bercakap | `/embedded-captions` |
| Video/slideshow ikut beat lagu | `/music-to-video` |
| Lain-lain / tak pasti | `/hyperframes` |

Peraturan Minda Optima (PDPA, tiada janji tempoh, testimoni benar) **tetap terpakai** walaupun guna skill HyperFrames. Telemetri dimatikan melalui `.claude/settings.json` (`DO_NOT_TRACK=1`). Kalau animasi GSAP gagal load dari CDN, `npm pack gsap` dan rujuk fail `gsap.min.js` secara lokal.

---

## Bila staf tanya "kenapa video ni tak perform?"

Minta (atau ambil `frames`) video tu, dan kalau ada, statistik: views, purata masa tonton, % tonton 3 saat. Diagnos ikut urutan ini — punca paling biasa dahulu:
1. **Hook** — 3 saat pertama tunjuk masalah ibu bapa, atau logo/intro/salam?
2. **Kejelasan** — tanpa bunyi pun faham? (kebanyakan orang tonton senyap → perlu teks/subtitle)
3. **Tempo** — ada jeda/bahagian mati lebih 2 saat?
4. **Satu mesej** — atau cuba cakap 3 benda?
5. **CTA** — satu tindakan jelas, atau tiada langsung?

Beri 2–3 pembetulan konkrit, dan tawar untuk terus edit semula (Mod B).

---

## Alat tambahan (jika disambung)

Kalau connector **Higgsfield** ada dalam sesi: boleh jana B-roll/visual AI, `upscale_video` untuk video kabur, `reframe` AI, dan `virality_predictor` untuk ramal prestasi sebelum post. Jangan jana muka kanak-kanak "sebenar" dengan AI untuk dipersembahkan sebagai pelajar kita — itu menipu ibu bapa. Ilustrasi/watak jelas AI tidak mengapa.

---

Video yang perform bagus, kongsi skrip + hook dengan team Marketing (Syaikhu, Aina, Asyikin) supaya boleh jadi templat.
