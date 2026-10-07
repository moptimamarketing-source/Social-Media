# Video promosi "Program Cuti Sekolah" — Minda Optima

| Fail | Guna |
|---|---|
| `output/program_cuti_sekolah_9x16.mp4` | **Video siap** untuk TikTok/Reels (1080×1920, 56 s, -14 LUFS) |
| `output/program_cuti_sekolah_9x16_TANPA_TEKS.mp4` | Video + muzik tanpa teks (asas untuk edit di CapCut) |
| `output/program_cuti_sekolah_16x9.mp4` | Bonus 1920×1080 untuk Facebook/YouTube (latar kabur) |
| `capcut/` | Klip bersih, overlay teks PNG, muzik MP3, `teks.srt`, fon, `PANDUAN_CAPCUT.md` |
| `shotlist.md` | Analisis klip, shotlist & rangka timeline |
| `edit_config.json` | Semua timestamp, zoom, transisi, warna & teks — ubah di sini |
| `analysis/` | ffprobe, laporan audio, titik fokus muka, lembaran bingkai |
| `music/` | Lagu asal 120 BPM (+ `LESEN.md`) |
| `tools/` | Skrip pembinaan |

## Placeholder yang perlu diisi
`[LOGO]`, `[NOMBOR WHATSAPP]`, `[TARIKH PROGRAM]`, `[AKTIVITI UTAMA]`, `[UMUR / KUMPULAN SASARAN]` (lihat `edit_config.json`, bahagian `texts`).

## Bina semula
Letak 6 klip asal dalam `raw/` (tidak disimpan dalam git; muat turun dari folder Google Drive), kemudian:
```
pip install numpy pillow scipy opencv-python-headless<5 librosa soundfile fonttools
python tools/analyze_clips.py && python tools/detect_focus.py && python tools/make_music.py
python tools/build_video.py        # shots, susun, audio, teks, 16:9, pakej CapCut
python tools/make_shotlist.py
```
Memerlukan `ffmpeg` (dengan vidstab, xfade, loudnorm).
