# Skill Marketing — Minda Optima

## A. Skill Minda Optima (dibina khas, guna di claude.ai ATAU Claude Code)

Upload fail dalam `upload_zip/` di **claude.ai → Customize → Skills → + → Upload a skill** (atau tekan *Save skill* pada fail `.skill`). Pastikan **Code execution** ON.

| Skill | Guna bila | Hasil |
| --- | --- | --- |
| `video-editing` | Reels/TikTok, skrip video, edit fail video, potong video panjang jadi banyak reels | Skrip + shot list + brief CapCut, atau fail .mp4 siap edit |
| `carousel-ig` | Post slide / infografik IG & FB | Slide PNG sedia upload + caption |
| `iklan-ads` | Iklan Meta / TikTok, iklan tak convert | 3 sudut iklan + variasi A/B + diagnosis |
| `content-planner` | Nak post apa bulan ni | Kalendar content Excel ikut pillar & pemilik |
| `content-analytics` | Report bulanan, post mana menang | Analisis + 3 tindakan + laporan untuk boss |

Panggil dengan `/nama-skill`, atau cakap biasa.

## B. Skill HyperFrames (HeyGen) — dalam `.claude/skills/`, Claude Code sahaja

Auto-aktif bila repo ini dibuka dalam Claude Code. Lesen Apache-2.0 (salinan: `vendor-licenses/hyperframes-LICENSE`), disalin dari `github.com/heygen-com/hyperframes` commit `7c73b3c` (13 Okt 2026).

Perlu: Node.js 22+, ffmpeg, Chrome/Chromium. Telemetri dimatikan melalui `.claude/settings.json` (`DO_NOT_TRACK=1`).

| Skill | Untuk |
| --- | --- |
| `/hyperframes` | Pintu masuk — tak pasti, mula sini |
| `/motion-graphics` | Tajuk animasi, stat naik, logo sting, lower-third |
| `/faceless-explainer` | Video tips tanpa muka daripada skrip |
| `/talking-head-recut` | Grafik atas video orang bercakap |
| `/embedded-captions` | Caption bergaya (35 gaya) + transkripsi |
| `/music-to-video` | Video / slideshow ikut beat lagu |
| `/product-launch-video` | Video promo daripada URL / brief |
| `/general-video` | Video berbilang babak bebas |
| `/media-use` | Cari/jana muzik, SFX, suara, gambar |
| `/slideshow` | Deck persembahan interaktif |
| lain-lain | `hyperframes-core/-animation/-creative/-audio/-cli/-keyframes/-registry/-studio`, `figma`, `pr-to-video`, `remotion-to-hyperframes` — dipanggil oleh skill di atas |

Kemas kini: `npx hyperframes skills update` (atau salin semula dari repo GitHub).

Nota:
- Suara AI / jana muzik / gambar perlukan API key (`HEYGEN_API_KEY`, `ELEVENLABS_API_KEY`, `GEMINI_API_KEY`) — pilihan, ada kos.
- Sesi cloud Claude Code menyekat `cdn.jsdelivr.net`: `npm pack gsap` dan rujuk `gsap.min.js` secara lokal.
- HyperFrames bina video daripada kod (teks, grafik, animasi, potongan rakaman) — bukan AI penjana footage. Untuk footage realistik guna Higgsfield.

## C. Remotion — TIDAK dipasang

Lesen Remotion: organisasi untung dengan **lebih 3 pekerja wajib beli Company License**. Minda Optima layak bayar, jadi tidak dipasang. Kalau syarikat beli lesen kemudian:
```bash
npx skills add remotion-dev/skills
```
HyperFrames buat hampir semua benda yang sama, percuma.

## D. Plugin directory (pilihan, tanya boss dulu)

**Marketing** & **Brand Voice** (Anthropic, disyorkan dalam pakej boss) · ManyMotions AI Video Editor · Video Cleanup · (video-shotcraft guna Remotion → isu lesen sama).

## Peraturan untuk SEMUA skill

PDPA (muka/nama anak perlukan kebenaran bertulis) · jangan janji hasil bacaan dalam tempoh tertentu · testimoni mesti benar · Minda Optima bukan taska · jangan reka harga/tarikh/angka.
