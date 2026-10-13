---
name: "content-planner"
description: "Rancang kalendar content media sosial Minda Optima — mingguan atau bulanan, ikut tiang content (pillar), platform (IG, FB, TikTok, YouTube Shorts, WhatsApp Status), siapa buat apa, dan tarikh penting (cuti sekolah, Ramadan, intake, hari ibu bapa). Hasilkan fail Excel kalendar sedia guna. Gunakan bila staf sebut \"content plan\", \"kalendar content\", \"content calendar\", \"jadual post\", \"plan bulan depan\", \"idea content sebulan\", \"pillar content\", \"nak post apa\", \"posting schedule\", \"batch content\", \"kempen bulan\", atau tak tahu nak post apa minggu ni. NOTA: Minda Optima program membaca kanak-kanak, BUKAN taska."
---

# Content Planner — Minda Optima

Baca `references/business-context.md` dahulu.

## Kenapa perlu pelan

Team Marketing kecil (Syaikhu, Aina, Asyikin) tapi perlu suap beberapa platform. Tanpa pelan, yang berlaku ialah: post ikut mood, promo terlalu banyak, dan minggu sibuk tiada post langsung. Pelan yang baik **realistik untuk kapasiti team** — 3 post bagus seminggu yang betul-betul keluar mengalahkan 7 post yang tertangguh.

Sebelum merancang, tanya (atau andaikan dan nyatakan): tempoh (minggu/bulan), platform aktif, berapa post seminggu yang team mampu, kempen/promo yang sedang berjalan, dan tarikh penting bulan itu.

## Tiang content (pillar) — campuran default

| Pillar | % | Tujuan | Contoh |
| --- | --- | --- | --- |
| **Ilmu untuk ibu bapa** | 40% | Save/share, bina autoriti | Tips membaca 5 minit, tanda-tanda, mitos vs fakta |
| **Bukti & cerita** | 25% | Kepercayaan | Testimoni sebenar, momen kelas (dengan kebenaran), progress kemahiran |
| **Di sebalik tabir** | 15% | Manusiakan jenama | Guru, latihan guru, sejarah keluarga sejak 1995, centre |
| **Jualan / tawaran** | 20% | Lead | Assessment, intake, kelas online, lokasi baru |

Laraskan ikut matlamat bulan — contohnya bulan intake boleh naikkan jualan ke 30%, tapi jangan melebihi ~1 daripada 3 post. Feed yang semuanya promo akan di-unfollow.

## Tarikh yang patut diambil kira (sahkan tarikh tepat setiap tahun)

Cuti sekolah & awal penggal (ibu bapa fikir tentang kesediaan sekolah) · Ramadan & Syawal (masa lapang berbeza, nada lebih lembut) · Hari Ibu / Hari Bapa · Hari Kanak-kanak · Hari Guru (16 Mei) · Bulan Membaca / Hari Buku Sedunia (23 April) · tarikh intake / buka centre baru `[ISI]`. Jangan reka tarikh — kalau tak pasti, tandakan `[SAHKAN]`.

## Output

1. **Ringkasan** (5 baris): matlamat bulan, campuran pillar, bilangan post per platform, satu tema/kempen utama.
2. **Jadual kalendar** dalam chat (Tarikh · Hari · Platform · Pillar · Format · Tajuk/Hook · Pemilik · Status).
3. **Fail Excel** — jana dengan skrip:
   ```bash
   python3 scripts/make_calendar.py plan.json kalendar.xlsx
   ```
   `plan.json` = `{"title": "...", "posts": [{"date": "2026-11-03", "platform": "IG Reels", "pillar": "Ilmu", "format": "Reels", "hook": "...", "owner": "Aina", "skill": "video-editing", "notes": "..."}]}`
   Fail mengandungi tab Kalendar (berwarna ikut pillar, dropdown Status) dan tab Ringkasan (kiraan per pillar & platform).
4. **Untuk setiap post**, nyatakan skill yang akan bantu hasilkannya: `video-editing` (Reels/TikTok), `carousel-ig` (carousel), `iklan-ads` (post yang akan di-boost).

## Prinsip

- **Pemilik mesti orang sebenar** dengan kapasiti sebenar (Ujian Orang). Jangan bagi Aina 20 video seminggu.
- **Batch**: cadang hari rakam (cth satu sesi rakam guru = 4 video) — lebih realistik daripada rakam setiap hari.
- **Satu idea, banyak format**: satu tip boleh jadi Reels + carousel + Status WhatsApp. Tunjukkan rantaian ini dalam pelan.
- Tiada janji tempoh, testimoni mesti benar, muka anak perlukan kebenaran — terpakai pada setiap idea dalam pelan.
