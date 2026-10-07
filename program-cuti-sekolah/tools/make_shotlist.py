"""Jana shotlist.md daripada edit_config.json + analysis/ (supaya sentiasa selari dengan edit)."""
import json, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
C = json.load(open(f"{ROOT}/edit_config.json")); PR = json.load(open(f"{ROOT}/analysis/probe.json")); FO = json.load(open(f"{ROOT}/analysis/focus.json"))
FPS = C["output"]["fps"]; sh = C["shots"]
t = 0
for s in sh:
    s["speed"] = s.get("speed", 1.0); s["out"] = round(s["dur"] / s["speed"] * FPS) / FPS; s["t0"] = t; t += s["out"]
TOTAL = t
# segmen calon yang TIDAK digunakan (untuk rujukan / ganti nanti)
EXTRA = {
    "C6963": [("4.5–8.0", "Pengacara bercakap, gerak tangan ringan", 3), ("35.0–37.5", "Senyum lebar, tangan bertaut", 3), ("90.0–93.0", "Gerak tangan, bercakap tenang", 2)],
    "C6967": [("0.0–3.0 & 3.0–5.0", "(digunakan)", 4)],
    "C6970": [("2.0–3.5 / 8.0–9.5", "(digunakan)", 3)],
    "C6986": [("0.0–3.0", "BUANG: lantai kosong, belum ada orang", 1)],
    "C7014": [("0.0–2.4", "BUANG: lubang kosong", 1)],
    "C7016": [("3.5–5.8", "BUANG: pengacara sudah keluar bingkai", 1)],
}
L = ["# Shotlist & Rangka Timeline — Promo Program Cuti Sekolah (Minda Optima)\n",
     f"**Format:** 9:16 · 1080×1920 · 30 fps · **{TOTAL:.0f} saat** (bawah 1 minit) · H.264 CRF 18 · AAC 192 kbps · -14 LUFS\n",
     "> **Nota penting tentang rakaman:** keenam-enam klip hanya menunjukkan **seorang pengacara** bercakap kepada kamera di taman/padang permainan. "
     "**Tiada kanak-kanak, kelas atau aktiviti** dalam rakaman, jadi teks hanya merujuk apa yang nampak (padang permainan, pengacara) dan "
     "maklumat program yang tiada dibiarkan sebagai placeholder. Struktur 'montaj aktiviti' dan 'momen heartwarming' dibina daripada shot "
     "pengacara paling ceria (mengintai, jalan ke kamera, tanda peace, senyum). Jika ada rakaman kanak-kanak, ganti shot di `edit_config.json`.\n",
     "## 1. Analisis klip (ffprobe)\n", "| Klip | Saiz paparan | FPS | Tempoh | Orientasi | Audio | Bunyi aktif |", "|---|---|---|---|---|---|---|"]
for c, p in PR.items():
    L.append(f"| {c} | {p['display']} (tag putaran {p['rotation']}°) | {eval(p['fps']):.0f} | {p['duration']:.1f}s | menegak | {p['audio']} | {p['active_audio_ranges_s'][0][0]:.0f}–{p['active_audio_ranges_s'][-1][1]:.0f}s |")
L += ["\nSemua klip 1920×1080 dengan tag putaran → dipaparkan **menegak 1080×1920 natif**, jadi tiada crop landskap dan tiada bar hitam. "
      "Muka dikesan (OpenCV) dalam hampir semua bingkai yang disemak; titik fokus digunakan untuk zoom perlahan & close-up supaya muka tak terpotong "
      "(`analysis/focus.json`). Goyangan kamera diukur (jitter ≤ 0.6 px pada 270 px lebar, ambang stabilisasi 0.9 px) → **tiada shot yang perlu `vidstab`**, "
      "jadi tiada stabilisasi dikenakan (supaya tidak merosakkan shot yang sudah stabil). Audio aktif sepanjang klip; **tiada puncak sorakan/gelak** "
      "yang dikesan (`analysis/audio_report.md`), maka audio asal dimutekan dan diganti muzik.\n",
      "## 2. Shotlist (segmen terbaik, skor 1–5)\n"]
for clip in PR:
    L += [f"### {clip}\n", "| Segmen sumber | Apa berlaku | Skor | Digunakan |", "|---|---|---|---|"]
    for s in sh:
        if s["clip"] == clip and "freeze_at" not in s:
            L.append(f"| {s['ss']:.1f}–{s['ss'] + s['dur']:.1f}s | {s['note']} | {s['score']} | ✔ shot {s['id']} ({s['t0']:.1f}s) |")
        elif s["clip"] == clip:
            L.append(f"| freeze {s['freeze_at']}s | {s['note']} | {s['score']} | ✔ shot {s['id']} ({s['t0']:.1f}s) |")
    for rng, what, sc in EXTRA.get(clip, []):
        if "(digunakan)" not in what: L.append(f"| {rng}s | {what} | {sc} | – |")
    for d in C["dibuang"]:
        if d["clip"] == clip: L.append(f"| {d['range']}s | BUANG: {d['sebab']} | 1 | ✘ |")
    L.append("")
L += ["## 3. Rangka timeline\n", "| Bahagian | Masa | Shot | Teks |", "|---|---|---|---|"]
parts = [("HOOK", 0, 3), ("INTRO", 3, 10), ("MONTAJ", 10, 38), ("MOMEN CERIA (slow-mo 0.7x)", 38, 49), ("CTA", 49, TOTAL)]
tx = {"HOOK": "CUTI SEKOLAH DAH NAK MULA!", "INTRO": "PROGRAM CUTI SEKOLAH · Minda Optima",
      "MONTAJ": "Bar bawah: Jom ceriakan cuti sekolah! · [AKTIVITI UTAMA] · Jumpa team kami! · Ruang terbuka yang seronok · Jom sertai kami! · [UMUR / KUMPULAN SASARAN] · Tak sabar nak jumpa korang!",
      "MOMEN CERIA (slow-mo 0.7x)": "Cuti yang seronok, kenangan yang bermakna!", "CTA": "Tempat TERHAD! · Daftar sekarang! · WhatsApp: [NOMBOR WHATSAPP] · Tarikh: [TARIKH PROGRAM] · [LOGO]"}
for name, a, b in parts:
    ids = [s["id"] for s in sh if a - 1e-6 <= s["t0"] < b - 1e-6]
    L.append(f"| {name} | {a}–{b:.0f}s | {', '.join(ids)} | {tx[name]} |")
L += ["\n### Potongan satu-persatu\n", "| Shot | Masa video | Tempoh | Klip | Sumber | Zoom | Kelajuan |", "|---|---|---|---|---|---|---|"]
for s in sh:
    src = f"{s['ss']:.1f}–{s['ss'] + s['dur']:.1f}s" if "freeze_at" not in s else f"freeze {s['freeze_at']}s"
    L.append(f"| {s['id']} | {s['t0']:.1f}–{s['t0'] + s['out']:.1f}s | {s['out']:.1f}s | {s['clip']} | {src} | {int(s['zoom'][0]*100)}→{int(s['zoom'][1]*100)}% | {s['speed']:.1f}x |")
L += ["\nSemua potongan jatuh pada beat (120 BPM, 0.5 s/beat). **Transisi** (hanya 3): whip `smoothleft` selepas hook (3.0s), `slideleft` ke momen ceria (38.0s), flash putih sebelum CTA (49.0s). Selebihnya potongan keras.\n",
      "## 4. Gaya\n", "- **Grade:** terang & hangat (kecerahan +0.03, kontras +5%, ketepuan +13%, sedikit hangat); C6986/C7014 dikurangkan ketepuan supaya seragam dengan klip lain.",
      "- **Pergerakan:** zoom perlahan 100→108% pada shot statik; close-up berpusat pada muka (crop pintar).",
      "- **Tipografi:** Baloo 2 ExtraBold + Poppins; putih/kuning + garis luar gelap + bayang; animasi pop/slide. Aksen kuning `#FFC93C`, biru `#2F6FED`, oren `#FF7A1A`. Zon selamat: 150px atas / 250px bawah / 120px kanan.",
      "- **Audio:** lagu asal 120 BPM (C–G–Am–F), dinormalkan -14 LUFS, fade in 0.5s / out 1.0s.\n"]
open(f"{ROOT}/shotlist.md", "w", encoding="utf-8").write("\n".join(L))
print("shotlist.md ok")
