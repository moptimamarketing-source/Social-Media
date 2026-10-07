"""Eksport pakej CapCut: klip bersih, overlay teks PNG, muzik, SRT, fon, panduan susunan lapisan."""
import json, os, shutil, subprocess
from concurrent.futures import ThreadPoolExecutor
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAP = f"{ROOT}/capcut"; WORK = f"{ROOT}/.work"

def _srt_time(t):
    ms = round(t * 1000); h, ms = divmod(ms, 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"

def _clip_name(s):
    end = s["ss"] + s["dur"]
    return f"{s['id']}_{s['role']}_{s['clip']}_{s['ss']:.1f}s-{end:.1f}s.mp4"

def export(CFG, shots, TOTAL_S, grade_filter):
    from text_layer import Compositor
    for d in ("clips", "overlays", "music"): os.makedirs(f"{CAP}/{d}", exist_ok=True)
    FPS = CFG["output"]["fps"]
    # 1) klip bersih: dipotong (tepat), digred seragam, 1080x1920 30fps, audio asal dikekalkan (AAC)
    def cut(s):
        if "freeze_at" in s: return
        out = f"{CAP}/clips/{_clip_name(s)}"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", str(s["ss"]), "-t", str(s["dur"]), "-i", f"{ROOT}/raw/{s['clip']}.MP4",
                        "-map", "0:v:0", "-map", "0:a:0", "-vf", f"fps={FPS},{grade_filter(s['clip'])},format=yuv420p",
                        "-c:v", "libx264", "-crf", "19", "-preset", "medium", "-c:a", "aac", "-b:a", "160k", "-ar", "48000",
                        "-movflags", "+faststart", out], check=True)
    with ThreadPoolExecutor(3) as ex: list(ex.map(cut, shots))
    # 2) overlay teks (kanvas penuh 1080x1920 lutsinar, kedudukan sudah betul) + latar kad penutup + logo placeholder
    comp = Compositor(CFG)
    for el in CFG["texts"]:
        comp.full_canvas(el).save(f"{CAP}/overlays/{el['id']}.png")
    shutil.copy(f"{WORK}/cta_bg.png", f"{CAP}/cta_background.png")
    logo = comp.sprites["C1_logo_PLACEHOLDER"]; logo.save(f"{CAP}/logo_placeholder.png")
    # 3) muzik (lagu asal, dinormalkan -14 LUFS) + SRT teks
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{WORK}/music_norm.wav", "-c:a", "libmp3lame", "-b:a", "256k",
                    f"{CAP}/music/minda_cuti_ceria.mp3"], check=True)
    srt = []
    for i, el in enumerate(sorted(CFG["texts"], key=lambda e: e["t"][0]), 1):
        txt = " ".join(l["t"] for l in el["lines"]) if el["kind"] == "stack" else (el.get("t_text") or "[LOGO]")
        if el["kind"] == "stack" and "pill" in el: txt += " – " + el["pill"]["t"]
        srt.append(f"{i}\n{_srt_time(el['t'][0])} --> {_srt_time(el['t'][1])}\n{txt}\n")
    open(f"{CAP}/teks.srt", "w", encoding="utf-8").write("\n".join(srt))
    shutil.copy(f"{ROOT}/edit_config.json", f"{CAP}/edit_config.json")
    # 4) panduan CapCut
    g = CFG["grade"]; tr = CFG["transitions"]
    L = ["# Panduan edit di CapCut — Program Cuti Sekolah (Minda Optima)\n",
         f"Projek: **9:16 (1080×1920), {FPS} fps, {TOTAL_S:.0f} saat**. Semua potongan jatuh pada beat (120 BPM = 0.5 saat/beat).\n",
         "## Cara paling cepat\n",
         "1. Import **`output/program_cuti_sekolah_9x16_TANPA_TEKS.mp4`** (video + muzik, tanpa teks) → letak teks sendiri guna jadual 'Teks' di bawah.",
         "2. Atau bina semula dari awal: import semua fail dalam `capcut/clips/` ikut nombor, letak ikut jadual 'Klip', kemudian muzik, kemudian overlay.\n",
         "## Susunan lapisan (dari bawah ke atas)\n",
         "| Lapisan | Isi |", "|---|---|",
         "| Audio 1 | `music/minda_cuti_ceria.mp3` (mula 0:00). Fade in 0.5 s, fade out 1.0 s |",
         "| Video utama | 19 klip dalam `clips/` + `cta_background.png` (7 s) |",
         "| Overlay | PNG dalam `overlays/` (kanvas penuh, letak pada 0,0, skala 100%) atau taip semula dengan alat Teks |\n",
         "## Klip (letak ikut turutan, potongan keras kecuali dinyatakan)\n",
         "| # | Mula | Tempoh | Fail | Kelajuan | Zoom perlahan (keyframe) | Catatan |", "|---|---|---|---|---|---|---|"]
    for s in shots:
        if "freeze_at" in s:
            L.append(f"| {s['id']} | {s['t0']:.2f}s | {s['out_fr'] / FPS:.2f}s | `cta_background.png` | – | 100%→{int(s['zoom'][1]*100)}% | Latar kad penutup (freeze-frame kabur + tint biru) |"); continue
        sp = f"{s['speed']:.1f}x" if s["speed"] != 1 else "1.0x"
        tr_note = f" → transisi {tr[s['trans_out']]['type']}" if "trans_out" in s else ""
        L.append(f"| {s['id']} | {s['t0']:.2f}s | {s['out_fr'] / FPS:.2f}s | `{_clip_name(s)}` | {sp} | {int(s['zoom'][0]*100)}%→{int(s['zoom'][1]*100)}% | {s['note']}{tr_note} |")
    L += ["\n> Klip dalam `clips/` ialah bahagian sumber **tanpa** zoom/transisi dan pada kelajuan asal. Untuk shot slow-mo (17–19) tetapkan Kelajuan 0.7x → tempoh jadi 3.5 s / 3.5 s / 4.0 s. Audio asal pengacara dikekalkan dalam klip; **mutekan** untuk versi muzik sahaja.\n",
          "## Transisi (3 titik utama sahaja)\n", "| Masa | Jenis | CapCut |", "|---|---|---|"]
    cap = {"smoothleft": "Whip / Slide Left", "slideleft": "Slide Left", "fadewhite": "Flash Putih / Fade White", "zoomin": "Zoom In"}
    for s in shots:
        if "trans_out" in s:
            t = tr[s["trans_out"]]; nxt = [x for x in shots if x["t0"] > s["t0"]][0]
            L.append(f"| {nxt['t0']:.1f}s | {t['type']} {t['dur']}s | {cap.get(t['type'], t['type'])} |")
    L += ["\n## Teks (overlay)\n", "| Masa masuk–keluar | Fail PNG | Teks | Catatan |", "|---|---|---|---|"]
    for el in CFG["texts"]:
        txt = " / ".join(l["t"] for l in el["lines"]) if el["kind"] == "stack" else el.get("t_text", "[LOGO]")
        if "pill" in el: txt += " + " + el["pill"]["t"]
        L.append(f"| {el['t'][0]:.2f}–{el['t'][1]:.2f}s | `overlays/{el['id']}.png` | {txt} | {'**ISI/GANTI** (placeholder)' if el.get('placeholder') else 'Animasi masuk: Pop / Zoom In; keluar: Fade'} |")
    L += ["\n**Tipografi:** Baloo 2 ExtraBold (tajuk) & Poppins SemiBold/ExtraBold (sub), dalam `fonts/` (lesen OFL, bebas guna). Putih/kuning + garis luar biru gelap `#12204A`. Warna aksen: kuning `#FFC93C`, biru `#2F6FED`, oren `#FF7A1A`.",
          "**Zon selamat TikTok:** teks berada 150 px dari atas dan 250 px dari bawah, jauh dari ikon sisi kanan.\n",
          "## Warna (grade) kira-kira dalam CapCut — Adjust\n",
          f"Eksposur/Kecerahan ≈ +{round(g['brightness']*100)}, Kontras ≈ +{round((g['contrast']-1)*100)}, Ketepuan ≈ +{round((g['saturation']-1)*100)}, Suhu (hangat) ≈ +6. Klip dalam `clips/` sudah digred; **jangan gred dua kali**.\n",
          "## Muzik\n", "Lagu asal dijana untuk projek ini (tiada hak cipta pihak ketiga) — lihat `music/LESEN.md`. Dinormalkan -14 LUFS. Boleh diganti dengan lagu lain; potongan ikut beat 120 BPM, jadi guna lagu ±120 BPM untuk kekal sekata.\n",
          "## Eksport\n", "1080×1920, 30 fps, H.264, bitrate tinggi. Fail akhir kami: CRF 18, AAC 192 kbps.\n",
          "## Placeholder yang perlu diisi\n", "- **Logo** → ganti `logo_placeholder.png` (T: 49.35–55.8 s, atas kad penutup)",
          "- **[NOMBOR WHATSAPP]**, **[TARIKH PROGRAM]** → kad penutup (49.9–55.8 s)",
          "- **[AKTIVITI UTAMA]** (15.7–17.8 s), **[UMUR / KUMPULAN SASARAN]** (32.7–34.8 s) → bar oren di montaj\n"]
    open(f"{CAP}/PANDUAN_CAPCUT.md", "w", encoding="utf-8").write("\n".join(L))
    open(f"{ROOT}/music/LESEN.md", "w", encoding="utf-8").write(
        "# Lesen muzik\n\n`minda_cuti_ceria.wav` / `.mp3` dijana sepenuhnya oleh `tools/make_music.py` dari gelombang sintesis asas "
        "(petik, loceng, dram sintetik). **Tiada sampel, loop atau lagu pihak ketiga.** Boleh digunakan secara komersial tanpa royalti "
        "dan tanpa atribusi (dianggap CC0 untuk projek Minda Optima).\n\nKualiti: lagu ringkas berbunyi 'sintetik'. Jika mahu lagu profesional, "
        "ganti dengan trek bebas royalti ±120 BPM (contoh: YouTube Audio Library / Pixabay Music) dan nyatakan sumbernya.\n")
    shutil.copy(f"{ROOT}/music/LESEN.md", f"{CAP}/music/LESEN.md")
    print("capcut ok:", len(os.listdir(f"{CAP}/clips")), "klip,", len(os.listdir(f"{CAP}/overlays")), "overlay")
