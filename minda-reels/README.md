# Minda Optima — "Anak Suka Nego?!" re-edit (Remotion)

Re-edit kod untuk reel 37.5 s (1080×1920, 30 fps). Muka, suara dan dialog talent **tidak diubah** — semua
perubahan ialah kamera digital, grafik, subtitle, transition dan SFX di atas footage asal.

**Final:** `exports/AnakSukaNego_final.mp4` — H.264 1080×1920 30 fps, AAC 192k, ~-13 LUFS, faststart.

## Editing plan (timecode = video asal, tiada retime)

| Timecode | Dialog / scene | Editing |
|---|---|---|
| 0.0–0.8 | Ibu: "Adik!" | Hook panel navy: ANAK SUKA → **NEGO?!** elastic bounce + shake → scribble underline → 😩 → tape "Bila nak membaca…". Punch-in 100→107% |
| 0.8–3.4 | Anak masuk peluk bantal. "Ya ibu, jom ikut ibu baca" | Slow push 103→109%, reaction 😑 di sebelah muka anak |
| 3.4–3.9 | (glitch transition lama) | Diganti: freeze-push + whip blur 6 frame + whoosh |
| 3.9–7.2 | "Hmm…" "Yalah, bolehlah" "Tapi kejap je kan ibu?" | Punch reaction anak 118% → two-shot → punch 124%. Bubble "HMM… 🤨", metaphor **BACA 📚 ⇄ MAIN 😆**, label 01 MASALAH |
| 7.2–9.1 | "Iya, sekejap saja" + selak buku | Pseudo b-roll: close-up card atas background blur, sticker "SEKEJAP?! 😭", handwritten "selak… selak…" |
| 9.9–11.8 | "Adik nak baca 2 baris je, boleh?" | Punch ibu 120→125%, sticky note "2 baris je ✌️" (auto sebelah bertentangan muka), label 02 PUJUK |
| 11.9–13.8 | "Amboi… ya ya yalah" | Circle reaction-cam muka anak + comic "TERPAKSA 🙄" |
| 13.8–15.0 | "Lepas tu kita sambung lagi, tahu" | Punch two-shot 110→115% |
| 15.4–18.15 | "Okey baca ni… emm 'ba'" | Split-screen: muka anak (atas) + buku/jari (bawah), ring pada huruf, "BA"! |
| 18.3–19.9 | "Adik dah penatlah ibu" | Punch anak 118% + speech bubble besar (tutup tajuk lama) |
| 20.0–24.4 | "Ya kita rehat sekejap… 5 minit, tahu? Boleh?" "Okey!" | Punch ibu, "lega~ 😌", timer **5 MINIT**, "DEAL! 🤝" (tutup sticker kucing lama) |
| 24.4–24.86 | (flash lama) | Whip ke host section — visual language bertukar (subtitle highlighter kuning, kad navy) |
| 24.86–28.1 | "Kadang ibu ayah perlu pujuk dia sikit je… bila kita dah pujuk" | Digital push 100→104%, b-roll push 110→122%, kad **02 PUJUK SIKIT JE** |
| 28.4–31.3 | "Dia mula rasa selesa… nanti lagi mudah dia nak mula baca" | Host tighter 112→115%, kad **03 BAGI DIA RASA SELESA**, widen + callout "Pantas Baca 📚" |
| 31.4–34.0 | "Itu cara dia nak mula bina confident" | Kad **04 BINA CONFIDENCE** + meter ▰▰▰▰▰ + "+1" ding |
| 34.0–37.5 | "Nak lagi tips parenting ringkas…" | Whip → CTA: headline → ❤️ Like → 💬 Komen → ➕ Follow Minda Optima (satu demi satu, dengan tap ripple) |

## Struktur

```
tools/clean_captions.py   buang caption kuning lama (OpenCV inpaint, hanya stroke teks nipis)
tools/make_sfx.py         jana SFX pop/whoosh/swipe/boing/ding/scribble/clock (tiada asset luar)
tools/finalize.sh         limiter audio + AAC + faststart
src/
  Video.tsx               susun layer: footage → vignette → grafik → progress → subtitle → CTA → audio
  data/timeline.ts        ★ EDIT DI SINI: segments/freeze, whip, camera (zoom), layouts b-roll, grafik, CTA, SFX
  data/captions.ts        ★ subtitle chunk + masa perkataan + *KEYWORD*
  scenes/                 FootageScene (kamera + world-space), HookScene, OverlayScene
  components/             Subtitle, KineticText, SpeechBubble, Sticker, PunchZoom (+Whip), BrollOverlay
                          (inset/split/PiP), CTA, KeywordCard, Meter, Graphics (metaphor/timer/ring/progress), Scribble
  lib/                    camera (keep-face zoom + clamp), anim (spring/easing), safeArea (TikTok safe zone, auto side)
```

### Cara ubah
- **Teks/masa grafik:** `src/data/timeline.ts` → `overlays` (`start`, `end`, `type`, `text`, `position`, `rotate`, `animation`).
  `position` boleh `[x, y]` atau preset (`top-left`, `upper-right`, `auto-upper` = sebelah bertentangan muka speaker).
- **Zoom:** `camera` — `{t, z, at, dur, ease}`. `z: 1.12` = 112%. `ease: 'snap'` (punch on beat) atau `'glide'` (slow push).
- **Subtitle:** `src/data/captions.ts`. `*WORD*` = keyword kuning, `/` = pecah baris, `words` = masa setiap perkataan.
- **B-roll / split / PiP:** `layouts` dan overlay `pip` (crop dari footage asal: `{z, at}`).
- `space: 'world'` = grafik melekat pada footage (ikut zoom) — digunakan untuk menutup tajuk/sticker lama.

### Render
```bash
npm install
npm run prepare-assets   # clean.mp4 (perlu python3 + opencv-python-headless), dialogue.wav, sfx
npm run studio           # preview interaktif
npm run preview          # render separuh resolusi
npm run render           # final → out/AnakSukaNego_final.mp4
```

Nota: transcription automatik tidak dapat digunakan (download model disekat), jadi timing subtitle diambil
frame-by-frame daripada caption perkataan-demi-perkataan dalam edit asal. Timing host section dianggarkan.
