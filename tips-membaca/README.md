# Minda Optima — Tips Membaca (motion graphic, Remotion)

Video 59.7 s, 1080×1920, 30 fps, dibina sepenuhnya dengan kod (Remotion + React + TypeScript) atas voiceover ElevenLabs asal.
Suara **tidak diubah** (loudness akhir -18 LUFS sama seperti fail asal). Hanya SFX halus ditambah di bawah suara.

**Final:** `exports/TipsMembaca_final.mp4` (H.264 + AAC 192k, faststart)

## Cara timing ditentukan
`tools/align.py` mengesan 33 segmen pertuturan (silencedetect), memadankan setiap segmen dengan baris skrip,
membahagi perkataan ikut suku kata dan *snap* setiap sempadan perkataan ke lembah tenaga audio. Output:
`src/data/captions.ts`. Semua scene, teks 3D, SFX dan subtitle mengambil masa daripada perkataan sebenar melalui
`w('perkataan')` dalam `src/data/timeline.ts` — jika audio ditukar, jalankan `npm run align` dan semuanya ikut.

## Storyboard (masa = audio)
| Masa | Dialog | Visual |
|---|---|---|
| 0.0–6.4 | Nah! … Ibu ayah nak tahu tak? | Burst "NAH!" slam → **TIPS** elastic → "UNTUK IBU AYAH!" flip, buku 3D + pensel + ? terapung, ibu & ayah muncul, "?" 3D gergasi, zoom-through |
| 6.3–10.8 | Bila anak tak lancar membaca, semua benda jadi berat | Bilik belajar 2.5D (parallax), anak keliru, huruf b/d/p/q berpusing, kertas latihan terbang, **TAK LANCAR MEMBACA?** shake, timbunan buku + pemberat "BERAT" jatuh |
| 10.7–18.3 | Homework lambat, soalan tak faham, dan anak mula rasa… "Saya tak pandai." | Split-screen 3 kad 3D (homework + jam + siput / soalan ? / anak sedih) → kad ketiga membesar jadi scene emosi lembut + awan fikiran **"SAYA TAK PANDAI…"** |
| 18.2–30.4 | Membaca ni penting … semua perlukan anak faham arahan | Buku 3D terbuka bercahaya, kunci emas, **MEMBACA = KUNCI SEMUA SUBJEK**, 4 buku subjek keluar dengan animasi berbeza, kamera orbit, beam + ✓ + FAHAM ARAHAN |
| 30.3–38.3 | Bila anak dah boleh baca … lebih berdikari | Kelabu → berwarna (magic sweep), anak membaca senyum, meter YAKIN naik, **LEBIH YAKIN! / TAK TAKUT SALAH! / LEBIH BERDIKARI!** bergilir, ✗→✓, bintang |
| 38.2–40.9 | Ibu ayah pun kurang stres | Suasana warm, simbol stres pop hilang, hati terapung, **PARENTS PUN LEGA!** |
| 40.7–47.7 | Jadi kalau anak masih tersekat-sekat, jangan tunggu … makin down | Jam 3D, buku dengan suku kata tersekat, **JANGAN TUNGGU LAGI!** impact + shockwave, kalendar umur 7→10, anak makin sedih, anak panah turun |
| 47.6–52.2 | Kuatkan asas baca dulu, baru semua pelajaran jadi senang | Blok **ASAS MEMBACA** jatuh, 4 blok subjek tersusun atas asas, progress bar, ibu ayah sokong, anak membaca di puncak + SENANG! |
| 52.1–59.7 | Kalau nak tahu … Komen, like dan share! | Elemen 3D terapung (depth of field), **NAK TAHU TEKNIK MEMBACA?**, butang 3D KOMEN/LIKE/SHARE ikut suara, wordmark MINDA OPTIMA |

## Struktur
```
tools/align.py        voiceover → word timings (captions.ts)
tools/make_sfx.py     SFX disintesis (pop, whoosh, thud, impact, sparkle, ding…)
src/data/timeline.ts  ★ masa scene & cue (dari audio), senarai SFX
src/data/captions.ts  subtitle (dijana)
src/scenes/S1…S9      satu fail setiap scene
src/components/       Text3D (extruded 3D type), Camera (Stage/Layer parallax), Book3D/OpenBook/Block3D (CSS 3D),
                      Character (ibu, ayah, anak — 2.5D), Room, Background, Icons, Meters, Subtitle, SceneWrap, Motion
```

## Render
```bash
npm install
npm run align     # jika audio ditukar
npm run studio    # preview interaktif
npm run render    # → out/TipsMembaca_final.mp4
```
Nota: tiada fail logo Minda Optima dalam projek, jadi penutup menggunakan wordmark teks "MINDA OPTIMA".
