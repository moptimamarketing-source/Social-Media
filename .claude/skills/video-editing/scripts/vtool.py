#!/usr/bin/env python3
"""vtool — alat edit video ringkas atas ffmpeg, untuk content media sosial.

Guna:  python3 vtool.py <arahan> [pilihan]
Senarai arahan:  python3 vtool.py -h
Bantuan arahan:  python3 vtool.py <arahan> -h

Semua output dienkod H.264 + AAC, yuv420p, +faststart — sedia upload ke
TikTok / Instagram / Facebook / YouTube / WhatsApp.
"""
import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

RATIOS = {"9:16": (1080, 1920), "4:5": (1080, 1350), "1:1": (1080, 1080), "16:9": (1920, 1080)}
VENC = ["-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p"]
AENC = ["-c:a", "aac", "-b:a", "160k", "-ar", "48000"]
TAIL = ["-movflags", "+faststart"]
FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/opentype/inter/Inter-Bold.otf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/freefont/FreeSansBold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "C:/Windows/Fonts/arialbd.ttf",
]


# ---------------------------------------------------------------- asas

def die(msg):
    print(f"RALAT: {msg}", file=sys.stderr)
    sys.exit(1)


def find_bin(name):
    path = shutil.which(name)
    if path:
        return path
    if name == "ffmpeg":
        try:
            import imageio_ffmpeg  # pip install imageio-ffmpeg (ffmpeg statik)
            return imageio_ffmpeg.get_ffmpeg_exe()
        except ImportError:
            pass
    return None


FFMPEG = find_bin("ffmpeg")
FFPROBE = find_bin("ffprobe")


def need_ffmpeg():
    if not FFMPEG:
        die("ffmpeg tak dijumpai. Pasang dulu: `pip install imageio-ffmpeg` "
            "(atau apt install ffmpeg / brew install ffmpeg / winget install ffmpeg).")


def run(args, quiet=True):
    cmd = [FFMPEG, "-hide_banner", "-y"] + (["-loglevel", "error"] if quiet else []) + args
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        die("ffmpeg gagal:\n" + (res.stderr or "")[-2000:])
    return res


def probe(path):
    """Maklumat asas fail. Guna ffprobe kalau ada, kalau tak parse output ffmpeg -i."""
    if not os.path.exists(path):
        die(f"Fail tak wujud: {path}")
    if FFPROBE:
        res = subprocess.run([FFPROBE, "-v", "error", "-print_format", "json",
                              "-show_format", "-show_streams", path],
                             capture_output=True, text=True)
        data = json.loads(res.stdout or "{}")
        v = next((s for s in data.get("streams", []) if s.get("codec_type") == "video"), None)
        a = next((s for s in data.get("streams", []) if s.get("codec_type") == "audio"), None)
        fps = None
        if v and v.get("avg_frame_rate", "0/0") != "0/0":
            n, d = v["avg_frame_rate"].split("/")
            fps = round(float(n) / float(d), 2) if float(d) else None
        rot = 0
        if v:
            for sd in v.get("side_data_list", []) or []:
                if "rotation" in sd:
                    rot = int(sd["rotation"])
            rot = int((v.get("tags") or {}).get("rotate", rot))
        w, h = (v["width"], v["height"]) if v else (None, None)
        if rot in (90, -90, 270, -270) and w:
            w, h = h, w
        return {"duration": float(data.get("format", {}).get("duration", 0) or 0),
                "width": w, "height": h, "fps": fps,
                "has_video": v is not None, "has_audio": a is not None,
                "size_mb": round(os.path.getsize(path) / 1e6, 2)}
    # sandaran tanpa ffprobe
    res = subprocess.run([FFMPEG, "-hide_banner", "-i", path], capture_output=True, text=True)
    err = res.stderr
    dur = re.search(r"Duration: (\d+):(\d+):([\d.]+)", err)
    vm = re.search(r"Video: .*?, (\d{2,5})x(\d{2,5})", err)
    fm = re.search(r"([\d.]+) fps", err)
    return {"duration": (int(dur[1]) * 3600 + int(dur[2]) * 60 + float(dur[3])) if dur else 0,
            "width": int(vm[1]) if vm else None, "height": int(vm[2]) if vm else None,
            "fps": float(fm[1]) if fm else None,
            "has_video": "Video:" in err, "has_audio": "Audio:" in err,
            "size_mb": round(os.path.getsize(path) / 1e6, 2)}


def tsec(t):
    """'90', '1:30', '00:01:30.5' -> saat."""
    if t is None:
        return None
    parts = [float(p) for p in str(t).split(":")]
    sec = 0.0
    for p in parts:
        sec = sec * 60 + p
    return sec


def srt_time(sec):
    ms = int(round(sec * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def font_path(user_font=None):
    if user_font:
        return user_font
    for f in FONT_CANDIDATES:
        if os.path.exists(f):
            return f
    die("Font tak dijumpai. Beri --font /path/ke/font.ttf")


def esc_filter_path(p):
    """Escape path untuk dimasukkan dalam filtergraph ffmpeg."""
    p = os.path.abspath(p).replace("\\", "/")
    return p.replace(":", r"\:").replace("'", r"\'").replace(",", r"\,")


def esc_text(t):
    return (t.replace("\\", "\\\\").replace(":", r"\:").replace("'", "\u2019")
             .replace("%", r"\%").replace(",", r"\,"))


def done(out):
    info = probe(out)
    print(f"SIAP: {out}  ({info['width']}x{info['height']}, {info['duration']:.1f}s, {info['size_mb']} MB)")


def frame_filter(w, h, mode):
    """Penapis untuk muatkan video ke bingkai w x h. Output label [v]."""
    if mode == "crop":
        return (f"[0:v]scale={w}:{h}:force_original_aspect_ratio=increase,"
                f"crop={w}:{h},setsar=1[v]")
    if mode == "pad":
        return (f"[0:v]scale={w}:{h}:force_original_aspect_ratio=decrease,"
                f"pad={w}:{h}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1[v]")
    # blur: latar belakang kabur + video asal di tengah (gaya Reels/TikTok)
    return (f"[0:v]split=2[bg][fg];"
            f"[bg]scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},"
            f"boxblur=luma_radius=40:luma_power=2,eq=brightness=-0.08[bgb];"
            f"[fg]scale={w}:{h}:force_original_aspect_ratio=decrease[fgs];"
            f"[bgb][fgs]overlay=(W-w)/2:(H-h)/2,setsar=1[v]")


# ---------------------------------------------------------------- arahan

def cmd_info(a):
    for f in a.inputs:
        print(json.dumps({"file": f, **probe(f)}, ensure_ascii=False))


def cmd_trim(a):
    need_ffmpeg()
    start = tsec(a.start) or 0
    args = ["-ss", str(start), "-i", a.input]
    if a.end is not None:
        args += ["-t", str(tsec(a.end) - start)]
    run(args + VENC + AENC + TAIL + [a.output])
    done(a.output)


def cmd_reframe(a):
    need_ffmpeg()
    w, h = RATIOS[a.ratio]
    info = probe(a.input)
    args = ["-i", a.input, "-filter_complex", frame_filter(w, h, a.mode), "-map", "[v]"]
    if info["has_audio"]:
        args += ["-map", "0:a:0"] + AENC
    run(args + ["-r", str(a.fps)] + VENC + TAIL + [a.output])
    done(a.output)


def cmd_concat(a):
    need_ffmpeg()
    w, h = RATIOS[a.ratio]
    args, chains, labels = [], [], ""
    for i, f in enumerate(a.inputs):
        info = probe(f)
        args += ["-i", f]
        fit = frame_filter(w, h, a.mode).replace("[0:v]", f"[{i}:v]")
        fit = re.sub(r"\[(bg|fg|bgb|fgs|v)\]", lambda m: f"[{m.group(1)}{i}]", fit)
        chains.append(fit + f";[v{i}]fps={a.fps},format=yuv420p[vv{i}]")
        if info["has_audio"]:
            chains.append(f"[{i}:a]aformat=sample_rates=48000:channel_layouts=stereo,"
                          f"aresample=async=1[a{i}]")
        else:
            chains.append(f"anullsrc=r=48000:cl=stereo,atrim=0:{info['duration']:.3f}[a{i}]")
        labels += f"[vv{i}][a{i}]"
    n = len(a.inputs)
    graph = ";".join(chains) + f";{labels}concat=n={n}:v=1:a=1[v][a]"
    run(args + ["-filter_complex", graph, "-map", "[v]", "-map", "[a]"] + VENC + AENC + TAIL + [a.output])
    done(a.output)


def cmd_srt(a):
    """Bina fail SRT daripada skrip teks — masa diagih ikut panjang ayat."""
    lines = []
    with open(a.script, encoding="utf-8") as fh:
        for raw in fh:
            raw = raw.strip()
            if raw:
                lines.append(raw)
    if not lines:
        die("Fail skrip kosong.")
    # pecah ayat panjang supaya senang baca atas telefon
    chunks = []
    for line in lines:
        words = line.split()
        cur = []
        for wd in words:
            cur.append(wd)
            if len(" ".join(cur)) >= a.max_chars:
                chunks.append(" ".join(cur))
                cur = []
        if cur:
            chunks.append(" ".join(cur))
    start = tsec(a.start) or 0.0
    end = tsec(a.end) if a.end else probe(a.video)["duration"] if a.video else None
    if end is None:
        die("Beri --video atau --end supaya tahu jumlah masa.")
    total = sum(len(c) for c in chunks)
    t = start
    with open(a.output, "w", encoding="utf-8") as out:
        for i, c in enumerate(chunks, 1):
            d = (end - start) * len(c) / total
            out.write(f"{i}\n{srt_time(t)} --> {srt_time(t + d - 0.05)}\n{c}\n\n")
            t += d
    print(f"SIAP: {a.output}  ({len(chunks)} baris caption, {start:.1f}s–{end:.1f}s)")


def cmd_subs(a):
    need_ffmpeg()
    info = probe(a.input)
    # margin bawah dalam unit PlayResY ASS (288); ~0.17 tinggi skrin = atas zon butang TikTok/Reels
    margin = a.margin if a.margin is not None else int(288 * (0.17 if info["height"] > info["width"] else 0.08))
    style = (f"FontName={a.font_name},FontSize={a.size},Bold=1,"
             f"PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BackColour=&H80000000,"
             f"BorderStyle={'3' if a.box else '1'},Outline={'1' if a.box else '2'},Shadow=0,"
             f"Alignment=2,MarginV={margin}")
    vf = f"subtitles='{esc_filter_path(a.srt)}':force_style='{style}'"
    args = ["-i", a.input, "-vf", vf] + VENC
    args += (["-c:a", "copy"] if info["has_audio"] else [])
    run(args + TAIL + [a.output])
    done(a.output)


def cmd_text(a):
    need_ffmpeg()
    info = probe(a.input)
    font = esc_filter_path(font_path(a.font))
    ypos = {"atas": "h*0.12", "tengah": "(h-text_h)/2", "bawah": "h*0.70"}[a.pos]
    size = a.size or int(info["width"] * 0.065)
    enable = ""
    if a.start is not None or a.end is not None:
        s = tsec(a.start) or 0
        e = tsec(a.end) if a.end is not None else info["duration"]
        enable = f":enable='between(t,{s},{e})'"
    draws = []
    lines = a.text.split("\\n")
    for i, line in enumerate(lines):
        y = f"{ypos}+{i}*{int(size * 1.25)}"
        draws.append(f"drawtext=fontfile='{font}':text='{esc_text(line)}':fontsize={size}:"
                     f"fontcolor={a.color}:x=(w-text_w)/2:y={y}:"
                     f"box=1:boxcolor={a.box_color}:boxborderw={int(size * 0.35)}{enable}")
    args = ["-i", a.input, "-vf", ",".join(draws)] + VENC
    args += (["-c:a", "copy"] if info["has_audio"] else [])
    run(args + TAIL + [a.output])
    done(a.output)


def cmd_logo(a):
    need_ffmpeg()
    info = probe(a.input)
    m = int(info["width"] * 0.04)
    pos = {"ka": f"W-w-{m}:{m}", "ki": f"{m}:{m}",
           "bka": f"W-w-{m}:H-h-{int(info['height'] * 0.2)}", "bki": f"{m}:H-h-{int(info['height'] * 0.2)}"}[a.pos]
    lw = int(info["width"] * a.scale)
    graph = (f"[1:v]scale={lw}:-1,format=rgba,colorchannelmixer=aa={a.opacity}[lg];"
             f"[0:v][lg]overlay={pos}[v]")
    args = ["-i", a.input, "-i", a.logo, "-filter_complex", graph, "-map", "[v]"]
    if info["has_audio"]:
        args += ["-map", "0:a:0", "-c:a", "copy"]
    run(args + VENC + TAIL + [a.output])
    done(a.output)


def cmd_audio(a):
    need_ffmpeg()
    info = probe(a.input)
    lufs = f"loudnorm=I={a.lufs}:TP=-1.5:LRA=11"
    if not a.music:
        if not info["has_audio"]:
            die("Video ni tiada audio. Guna --music untuk tambah muzik.")
        run(["-i", a.input, "-map", "0:v:0", "-map", "0:a:0", "-c:v", "copy", "-af", lufs] + AENC + TAIL + [a.output])
        return done(a.output)
    dur = info["duration"]
    fade = min(2.0, dur / 4)
    music = (f"[1:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={a.music_vol},"
             f"atrim=0:{dur:.3f},afade=t=in:d=0.5,afade=t=out:st={dur - fade:.3f}:d={fade:.3f}")
    if info["has_audio"]:
        # muzik "duck" (perlahan sendiri) bila ada suara
        graph = (f"[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[voice][sc];"
                 f"{music}[mus];"
                 f"[mus][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[duck];"
                 f"[voice][duck]amix=inputs=2:duration=first:normalize=0,{lufs}[a]")
    else:
        graph = f"{music},{lufs}[a]"
    run(["-i", a.input, "-stream_loop", "-1", "-i", a.music, "-filter_complex", graph,
         "-map", "0:v:0", "-map", "[a]", "-c:v", "copy", "-shortest"] + AENC + TAIL + [a.output])
    done(a.output)


def cmd_jumpcut(a):
    """Buang bahagian senyap (jeda, 'emm') — sesuai untuk video bercakap depan kamera."""
    need_ffmpeg()
    info = probe(a.input)
    if not info["has_audio"]:
        die("Video tiada audio — tak boleh kesan senyap.")
    res = subprocess.run([FFMPEG, "-hide_banner", "-i", a.input, "-af",
                          f"silencedetect=noise={a.noise}dB:d={a.min_silence}", "-f", "null", "-"],
                         capture_output=True, text=True)
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", res.stderr)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", res.stderr)]
    dur = info["duration"]
    if len(ends) < len(starts):
        ends.append(dur)
    keep, cur = [], 0.0
    for s, e in zip(starts, ends):
        s2, e2 = s + a.pad, e - a.pad
        if s2 > cur:
            keep.append((cur, s2))
        cur = max(cur, e2)
    if cur < dur:
        keep.append((cur, dur))
    keep = [(s, e) for s, e in keep if e - s > 0.15]
    if not keep:
        die("Semua bahagian dikesan senyap. Cuba --noise -40.")
    removed = dur - sum(e - s for s, e in keep)
    expr = "+".join(f"between(t,{s:.3f},{e:.3f})" for s, e in keep)
    graph = (f"[0:v]select='{expr}',setpts=N/FRAME_RATE/TB[v];"
             f"[0:a]aselect='{expr}',asetpts=N/SR/TB[a]")
    script = tempfile.NamedTemporaryFile("w", suffix=".txt", delete=False)
    script.write(graph)
    script.close()
    try:
        run(["-i", a.input, "-filter_complex_script", script.name, "-map", "[v]", "-map", "[a]"]
            + VENC + AENC + TAIL + [a.output])
    finally:
        os.unlink(script.name)
    print(f"Buang {removed:.1f}s senyap daripada {dur:.1f}s ({len(keep)} potongan dikekalkan).")
    done(a.output)


def cmd_speed(a):
    need_ffmpeg()
    info = probe(a.input)
    f = a.factor
    args = ["-i", a.input, "-filter:v", f"setpts=PTS/{f}"]
    if info["has_audio"]:
        chain, rem = [], f
        while rem > 2.0:
            chain.append("atempo=2.0"); rem /= 2.0
        while rem < 0.5:
            chain.append("atempo=0.5"); rem /= 0.5
        chain.append(f"atempo={rem}")
        args += ["-filter:a", ",".join(chain)] + AENC
    run(args + VENC + TAIL + [a.output])
    done(a.output)


def cmd_compress(a):
    need_ffmpeg()
    info = probe(a.input)
    if a.target_mb:
        kbps_total = a.target_mb * 8000 / max(info["duration"], 1)
        vk = max(int(kbps_total - 128), 300)
        venc = ["-c:v", "libx264", "-preset", "medium", "-b:v", f"{vk}k",
                "-maxrate", f"{int(vk * 1.2)}k", "-bufsize", f"{vk * 2}k", "-pix_fmt", "yuv420p"]
    else:
        venc = ["-c:v", "libx264", "-preset", "medium", "-crf", str(a.crf), "-pix_fmt", "yuv420p"]
    scale = []
    if a.max_height and info["height"] and info["height"] > a.max_height:
        scale = ["-vf", f"scale=-2:{a.max_height}"]
    aenc = ["-c:a", "aac", "-b:a", "128k"] if info["has_audio"] else []
    run(["-i", a.input] + scale + venc + aenc + TAIL + [a.output])
    done(a.output)


def cmd_frames(a):
    """Ambil gambar setiap N saat — untuk Claude 'tengok' video & pilih thumbnail."""
    need_ffmpeg()
    os.makedirs(a.outdir, exist_ok=True)
    run(["-i", a.input, "-vf", f"fps=1/{a.every},scale=480:-2",
         os.path.join(a.outdir, "frame_%03d.jpg")])
    files = sorted(os.listdir(a.outdir))
    print(f"SIAP: {len(files)} gambar dalam {a.outdir} (setiap {a.every}s; frame_001 = 0s)")


def cmd_thumb(a):
    need_ffmpeg()
    run(["-ss", str(tsec(a.at)), "-i", a.input, "-frames:v", "1", "-q:v", "2", a.output])
    print(f"SIAP: {a.output}")


def cmd_clips(a):
    """Potong satu video panjang jadi banyak klip pendek (repurpose) sekali gus.
    Fail senarai: satu klip sebaris -> `MULA-TAMAT nama_klip`, cth `1:05-1:40 tip-suku-kata`."""
    need_ffmpeg()
    w, h = RATIOS[a.ratio]
    info = probe(a.input)
    os.makedirs(a.outdir, exist_ok=True)
    made = 0
    with open(a.list, encoding="utf-8") as fh:
        for n, raw in enumerate(fh, 1):
            raw = raw.split("#")[0].strip()
            if not raw:
                continue
            m = re.match(r"^([\d:.]+)\s*-\s*([\d:.]+)\s*(.*)$", raw)
            if not m:
                die(f"Baris {n} tak faham: '{raw}'. Format: 1:05-1:40 nama")
            s, e = tsec(m[1]), tsec(m[2])
            if e <= s:
                die(f"Baris {n}: masa tamat mesti selepas masa mula.")
            name = re.sub(r"[^\w-]+", "-", m[3].strip()).strip("-") or f"klip{n:02d}"
            out = os.path.join(a.outdir, f"{made + 1:02d}_{name}.mp4")
            args = ["-ss", str(s), "-t", str(e - s), "-i", a.input,
                    "-filter_complex", frame_filter(w, h, a.mode), "-map", "[v]"]
            if info["has_audio"]:
                args += ["-map", "0:a:0", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11"] + AENC
            run(args + ["-r", "30"] + VENC + TAIL + [out])
            made += 1
            done(out)
    print(f"Jumlah: {made} klip dalam {a.outdir}")


# ---------------------------------------------------------------- CLI

def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = p.add_subparsers(dest="cmd", required=True)

    s = sp.add_parser("info", help="maklumat video (saiz, tempoh, fps, ada audio?)")
    s.add_argument("inputs", nargs="+"); s.set_defaults(fn=cmd_info)

    s = sp.add_parser("trim", help="potong satu bahagian")
    s.add_argument("input"); s.add_argument("output")
    s.add_argument("--start", default="0", help="cth 3 / 0:03 / 00:00:03.5")
    s.add_argument("--end", help="masa tamat (kosong = sampai habis)"); s.set_defaults(fn=cmd_trim)

    s = sp.add_parser("reframe", help="tukar nisbah (9:16, 4:5, 1:1, 16:9)")
    s.add_argument("input"); s.add_argument("output")
    s.add_argument("--ratio", choices=RATIOS, default="9:16")
    s.add_argument("--mode", choices=["blur", "crop", "pad"], default="blur",
                   help="blur=latar kabur (default), crop=potong tepi, pad=jalur hitam")
    s.add_argument("--fps", type=int, default=30); s.set_defaults(fn=cmd_reframe)

    s = sp.add_parser("concat", help="sambung beberapa klip jadi satu")
    s.add_argument("output"); s.add_argument("inputs", nargs="+")
    s.add_argument("--ratio", choices=RATIOS, default="9:16")
    s.add_argument("--mode", choices=["blur", "crop", "pad"], default="crop")
    s.add_argument("--fps", type=int, default=30); s.set_defaults(fn=cmd_concat)

    s = sp.add_parser("srt", help="bina subtitle .srt daripada skrip teks")
    s.add_argument("script", help="fail .txt, satu ayat sebaris"); s.add_argument("output")
    s.add_argument("--video", help="ambil tempoh daripada video ni")
    s.add_argument("--start", default="0"); s.add_argument("--end")
    s.add_argument("--max-chars", type=int, default=32, help="panjang maksimum satu baris caption")
    s.set_defaults(fn=cmd_srt)

    s = sp.add_parser("subs", help="bakar subtitle .srt ke dalam video")
    s.add_argument("input"); s.add_argument("output"); s.add_argument("--srt", required=True)
    s.add_argument("--size", type=int, default=11, help="saiz font (unit ASS; 9–14 sesuai untuk 9:16)")
    s.add_argument("--font-name", default="DejaVu Sans")
    s.add_argument("--margin", type=int, help="jarak dari bawah (unit ASS)")
    s.add_argument("--box", action="store_true", help="kotak gelap belakang teks")
    s.set_defaults(fn=cmd_subs)

    s = sp.add_parser("text", help="letak teks atas video (hook / tajuk / CTA)")
    s.add_argument("input"); s.add_argument("output"); s.add_argument("--text", required=True,
                   help="guna \\n untuk baris baru")
    s.add_argument("--pos", choices=["atas", "tengah", "bawah"], default="atas")
    s.add_argument("--start"); s.add_argument("--end")
    s.add_argument("--size", type=int); s.add_argument("--font")
    s.add_argument("--color", default="white"); s.add_argument("--box-color", default="black@0.55")
    s.set_defaults(fn=cmd_text)

    s = sp.add_parser("logo", help="letak logo / watermark (PNG)")
    s.add_argument("input"); s.add_argument("output"); s.add_argument("--logo", required=True)
    s.add_argument("--pos", choices=["ka", "ki", "bka", "bki"], default="ka",
                   help="ka=atas kanan, ki=atas kiri, bka/bki=bawah kanan/kiri")
    s.add_argument("--scale", type=float, default=0.18, help="lebar logo ÷ lebar video")
    s.add_argument("--opacity", type=float, default=0.9); s.set_defaults(fn=cmd_logo)

    s = sp.add_parser("audio", help="seimbangkan bunyi (-14 LUFS) & tambah muzik latar")
    s.add_argument("input"); s.add_argument("output")
    s.add_argument("--music", help="fail muzik (mp3/m4a/wav)")
    s.add_argument("--music-vol", type=float, default=0.25)
    s.add_argument("--lufs", type=float, default=-14); s.set_defaults(fn=cmd_audio)

    s = sp.add_parser("jumpcut", help="buang jeda senyap (video bercakap)")
    s.add_argument("input"); s.add_argument("output")
    s.add_argument("--noise", type=float, default=-35, help="dB; lebih negatif = lebih ketat")
    s.add_argument("--min-silence", type=float, default=0.6, help="jeda minimum (saat) untuk dibuang")
    s.add_argument("--pad", type=float, default=0.12, help="ruang nafas kekal (saat)")
    s.set_defaults(fn=cmd_jumpcut)

    s = sp.add_parser("clips", help="potong video panjang jadi banyak reels (ikut senarai)")
    s.add_argument("input"); s.add_argument("outdir")
    s.add_argument("--list", required=True, help="fail .txt: `1:05-1:40 nama` satu sebaris")
    s.add_argument("--ratio", choices=RATIOS, default="9:16")
    s.add_argument("--mode", choices=["blur", "crop", "pad"], default="crop")
    s.set_defaults(fn=cmd_clips)

    s = sp.add_parser("speed", help="laju / perlahan (0.5–4)")
    s.add_argument("input"); s.add_argument("output")
    s.add_argument("--factor", type=float, required=True); s.set_defaults(fn=cmd_speed)

    s = sp.add_parser("compress", help="kecilkan saiz fail (WhatsApp / emel)")
    s.add_argument("input"); s.add_argument("output")
    s.add_argument("--target-mb", type=float, help="cth 15 untuk WhatsApp")
    s.add_argument("--crf", type=int, default=26)
    s.add_argument("--max-height", type=int, help="cth 1280 untuk 720p menegak")
    s.set_defaults(fn=cmd_compress)

    s = sp.add_parser("frames", help="ambil gambar setiap N saat (untuk semak video)")
    s.add_argument("input"); s.add_argument("outdir")
    s.add_argument("--every", type=float, default=2); s.set_defaults(fn=cmd_frames)

    s = sp.add_parser("thumb", help="ambil satu gambar sebagai thumbnail")
    s.add_argument("input"); s.add_argument("output"); s.add_argument("--at", default="1")
    s.set_defaults(fn=cmd_thumb)

    a = p.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
