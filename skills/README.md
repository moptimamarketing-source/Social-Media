# Skill Video — Minda Optima Marketing

## 1. `video-editing` (skill kita sendiri) — dah siap

| Fail | Guna untuk |
| --- | --- |
| `upload_zip/video-editing.zip` | Upload di **claude.ai → Customize → Skills → + → Upload a skill** |
| `upload_zip/video-editing.skill` | Sama, tapi boleh tekan **Save skill** terus dalam chat |
| `../.claude/skills/video-editing/` | Auto-aktif bila buka repo ni dalam **Claude Code** |

Panggil: taip `/video-editing` atau cakap biasa ("tolong edit video ni jadi reels").

## 2. Skill video dari internet — keputusan selepas semakan (Okt 2026)

| Skill | Keputusan | Sebab |
| --- | --- | --- |
| **HyperFrames** (HeyGen) — `github.com/heygen-com/hyperframes` | ✅ **Disyorkan** | Lesen Apache-2.0 (percuma, komersial OK). Ada aliran kerja yang kena dengan kerja kita: `talking-head-recut` (grafik atas video bercakap), `embedded-captions` (35 gaya caption + transkripsi lokal), `music-to-video` (video ikut beat lagu), `faceless-explainer` (video tips tanpa muka), `motion-graphics` (tajuk/logo bergerak). Diuji render 9:16 dalam sesi ni — berjaya. |
| **Remotion** — `github.com/remotion-dev/skills` | ❌ **Jangan guna tanpa beli lesen** | Lesen Remotion: syarikat untung dengan **lebih 3 pekerja wajib beli Company License**. Minda Optima jauh lebih besar. HyperFrames buat benda yang sama, percuma. |
| Plugin directory (ManyMotions, Video Cleanup, video-shotcraft) | ⚠️ Pilihan | Dibuat komuniti, bukan Anthropic. Tanya boss dulu. `video-shotcraft` guna Remotion → isu lesen sama. |

### Cara pasang HyperFrames di PC sendiri (Claude Code)

Perlu: **Node.js 22+**, **ffmpeg**, Google Chrome/Chromium.

```bash
# matikan telemetri (data guna dihantar ke HeyGen secara default)
npx hyperframes telemetry disable

# pasang skill (pilih Claude Code bila ditanya)
npx skills add heygen-com/hyperframes
```

Lepas tu dalam Claude Code: taip `/hyperframes` atau "buat video 9:16 untuk hook ni…".

### Perkara yang perlu tahu

- **Telemetri:** skill HyperFrames suruh Claude hantar "feedback report" ke HeyGen lepas setiap render. Jalankan `telemetry disable` di atas, atau set `DO_NOT_TRACK=1`.
- **API key:** fungsi suara AI / jana gambar / muzik minta `HEYGEN_API_KEY`, `ELEVENLABS_API_KEY` atau `GEMINI_API_KEY`. Tak wajib — tanpa key, guna rakaman & muzik sendiri.
- **Sesi cloud Claude Code:** rangkaian sekat `cdn.jsdelivr.net`, jadi animasi GSAP gagal load. Penyelesaian: `npm pack gsap` dan rujuk `gsap.min.js` secara lokal dalam `index.html`.
- **Bukan AI video generator:** HyperFrames bina video daripada kod (teks, grafik, animasi, potongan rakaman). Untuk footage realistik guna Higgsfield (dah connect).
- **PDPA & prinsip** dalam `video-editing` tetap terpakai — muka anak perlu kebenaran, jangan janji tempoh hasil bacaan.
