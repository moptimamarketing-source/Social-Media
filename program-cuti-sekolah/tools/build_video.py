"""Bina video promosi dari edit_config.json  (ffmpeg + Python).
Guna:  python tools/build_video.py [shots] [assemble] [audio] [text] [variants] [capcut]   (tanpa hujah = semua)

Kenapa ffmpeg + Python (bukan Remotion): persekitaran ini ada ffmpeg penuh (vidstab, xfade, loudnorm) dan Python,
tiada pelayar/Chromium render Remotion yang stabil untuk fail 675 MB; ffmpeg terus baca fail sumber tanpa proksi."""
import json, os, re, subprocess, sys, math
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from text_layer import Compositor, W, H, hexrgb

CFG = json.load(open(f"{ROOT}/edit_config.json"))
FOCUS = json.load(open(f"{ROOT}/analysis/focus.json")) if os.path.exists(f"{ROOT}/analysis/focus.json") else {}
WORK = f"{ROOT}/.work"; os.makedirs(f"{WORK}/shots", exist_ok=True)
FPS = CFG["output"]["fps"]; TR = CFG["transitions"]
shots = CFG["shots"]

def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode: raise RuntimeError(" ".join(map(str, cmd))[:300] + "\n" + r.stderr[-1500:])
    return r

# ---------------------------------------------------------------- garis masa (dalam bingkai)
def efr(d): return 2 * round(d * FPS / 2)            # bingkai genap supaya separuh-handle tepat
t_cursor = 0
for i, s in enumerate(shots):
    s["speed"] = s.get("speed", 1.0); s["out_fr"] = round(s["dur"] / s["speed"] * FPS)
    s["tail_fr"] = efr(TR[s["trans_out"]]["dur"]) // 2 if "trans_out" in s else 0
    prev = shots[i - 1] if i else None
    s["head_fr"] = efr(TR[prev["trans_out"]]["dur"]) // 2 if prev and "trans_out" in prev else 0
    s["nf"] = s["head_fr"] + s["out_fr"] + s["tail_fr"]
    s["t0"] = t_cursor / FPS; t_cursor += s["out_fr"]
TOTAL_FR = t_cursor; TOTAL_S = TOTAL_FR / FPS

# ---------------------------------------------------------------- grading
def grade_filter(clip):
    g = dict(CFG["grade"]); g.update(CFG.get("grade_overrides", {}).get(clip, {})); w = g["warm"]
    return (f"eq=brightness={g['brightness']}:contrast={g['contrast']}:saturation={g['saturation']}:gamma={g['gamma']},"
            f"colorbalance=rs={w['rs']}:gs=0:bs={w['bs']}:rm={w['rm']}:gm=0:bm={w['bm']}:rh={w['rh']}:gh=0:bh={w['bh']}")

def focus_of(s):
    f = s.get("focus") or (FOCUS.get(s["id"]) or {}).get("focus") or [0.5, 0.4]
    return f

# ---------------------------------------------------------------- 1. render setiap shot (mezanin)
def cta_bg():
    p = f"{WORK}/cta_bg.png"
    s = [x for x in shots if "freeze_at" in x][0]
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(s["freeze_at"]), "-i", f"{ROOT}/raw/{s['clip']}.MP4", "-frames:v", "1",
         "-vf", f"{grade_filter(s['clip'])},scale={W}:{H}", f"{WORK}/freeze.png"])
    im = Image.open(f"{WORK}/freeze.png").convert("RGB")
    bl = im.filter(ImageFilter.GaussianBlur(26))
    arr = np.asarray(bl).astype(np.float32) * 0.62
    tint = np.array(hexrgb(CFG["palette"]["biru"]), np.float32); arr = arr * 0.68 + tint * 0.32   # tint biru
    out = Image.fromarray(arr.clip(0, 255).astype(np.uint8)).convert("RGBA")
    d = ImageDraw.Draw(out, "RGBA")   # bulatan aksen (kuning/oren/biru) - ceria tapi tidak mengganggu teks
    for (cx, cy, r, c, a) in [(950, 140, 210, "kuning", 70), (90, 1560, 260, "oren", 64), (1010, 1500, 150, "kuning", 56), (70, 360, 120, "oren", 52)]:
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=hexrgb(CFG["palette"][c]) + (a,))
    out.convert("RGB").save(p); return p

def render_shot(s, for_capcut=False):
    nf = s["nf"]; z0, z1 = s["zoom"]; cx, cy = focus_of(s)
    zexp = f"{z0}+({z1}-{z0})*on/{max(1, nf - 1)}"
    zp = (f"zoompan=z='{zexp}':x='max(0,min(iw-iw/zoom,{cx}*iw-iw/zoom/2))':"
          f"y='max(0,min(ih-ih/zoom,{cy}*ih-0.36*ih/zoom))':d=1:s={W}x{H}:fps={FPS}")
    out = f"{WORK}/shots/{s['id']}.mkv"
    enc = ["-c:v", "libx264", "-crf", "10", "-preset", "fast", "-pix_fmt", "yuv420p", "-r", str(FPS), "-an", out]
    if "freeze_at" in s:
        bg = cta_bg()
        vf = f"scale={W*2}:{H*2}:flags=lanczos,{zp},format=yuv420p,setsar=1"
        run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-framerate", str(FPS), "-i", bg, "-vf", vf, "-frames:v", str(nf)] + enc); return out
    ss = s["ss"] - s["head_fr"] / FPS * s["speed"]; src_dur = nf / FPS * s["speed"] + 0.15
    assert ss >= 0, f"shot {s['id']}: handle melepasi permulaan klip"
    vf = (f"setpts=PTS/{s['speed']},fps={FPS},{grade_filter(s['clip'])},scale={W*2}:{H*2}:flags=lanczos,{zp},format=yuv420p,setsar=1")
    run(["ffmpeg", "-v", "error", "-y", "-ss", f"{ss:.4f}", "-t", f"{src_dur:.4f}", "-i", f"{ROOT}/raw/{s['clip']}.MP4", "-vf", vf, "-frames:v", str(nf)] + enc)
    return out

def stage_shots():
    with ThreadPoolExecutor(3) as ex: list(ex.map(render_shot, shots))
    for s in shots:
        n = int(run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=nb_read_frames",
                     "-of", "csv=p=0", f"{WORK}/shots/{s['id']}.mkv"]).stdout.strip())
        assert n == s["nf"], f"shot {s['id']}: {n} bingkai, patut {s['nf']}"
    print(f"shot ok: {len(shots)} shot, jumlah {TOTAL_S:.2f}s")

# ---------------------------------------------------------------- 2. susun (hard cut + 3 transisi)
def stage_assemble():
    groups, cur = [], []
    for s in shots:
        cur.append(s)
        if "trans_out" in s: groups.append(cur); cur = []
    if cur: groups.append(cur)
    ins = []; fg = []; idx = 0; labels = []
    for gi, g in enumerate(groups):
        names = []
        for s in g:
            ins += ["-i", f"{WORK}/shots/{s['id']}.mkv"]
            fg.append(f"[{idx}:v]settb=1/{FPS},setpts=N/{FPS}/TB,fps={FPS},format=yuv420p,setsar=1[s{idx}]"); names.append(f"[s{idx}]"); idx += 1
        fg.append(("".join(names) + f"concat=n={len(g)}:v=1:a=0,settb=1/{FPS},fps={FPS}[g{gi}]") if len(g) > 1 else f"{names[0]}settb=1/{FPS}[g{gi}]")
    curlab, curlen = "g0", sum(s["nf"] for s in groups[0])
    for gi in range(1, len(groups)):
        tr = TR[groups[gi - 1][-1]["trans_out"]]; d = efr(tr["dur"]); off = (curlen - d) / FPS
        fg.append(f"[{curlab}][g{gi}]xfade=transition={tr['type']}:duration={d / FPS:.4f}:offset={off:.4f}[x{gi}]")
        curlab = f"x{gi}"; curlen += sum(s["nf"] for s in groups[gi]) - d
    assert curlen == TOTAL_FR, (curlen, TOTAL_FR)
    run(["ffmpeg", "-v", "error", "-y"] + ins + ["-filter_complex", ";".join(fg), "-map", f"[{curlab}]", "-c:v", "libx264", "-crf", "12",
         "-preset", "veryfast", "-pix_fmt", "yuv420p", "-r", str(FPS), f"{WORK}/base.mkv"])
    print(f"susun ok: {curlen} bingkai = {curlen / FPS:.2f}s")

# ---------------------------------------------------------------- 3. audio (loudnorm 2-pass ke -14 LUFS)
def stage_audio():
    o = CFG["output"]; src = f"{ROOT}/{CFG['music']['file']}"
    af = f"loudnorm=I={o['loudness_lufs']}:TP={o['true_peak_db']}:LRA=11"
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", af + ":print_format=json", "-f", "null", "-"], capture_output=True, text=True)
    m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", r.stderr, re.S).group(0))
    af2 = (af + f":measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}"
           f":offset={m['target_offset']}:linear=true")
    fi, fo = o["fade_in_s"], o["fade_out_s"]
    chain = f"{af2},afade=t=in:d={fi},afade=t=out:st={TOTAL_S - fo}:d={fo},atrim=0:{TOTAL_S},aresample=48000"
    run(["ffmpeg", "-v", "error", "-y", "-i", src, "-af", chain, "-c:a", "pcm_s16le", f"{WORK}/music_norm.wav"])
    print("audio ok (loudnorm 2-pass)")

# ---------------------------------------------------------------- 4. teks + render akhir
def encode_cmd(out, audio=True):
    o = CFG["output"]
    return (["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
             "-i", f"{WORK}/music_norm.wav", "-c:v", "libx264", "-crf", str(o["crf"]), "-preset", o["preset"], "-pix_fmt", "yuv420p",
             "-profile:v", "high", "-c:a", "aac", "-b:a", o["audio_bitrate"], "-movflags", "+faststart", "-shortest", out])

def stage_text(with_text=True):
    o = CFG["output"]; out = f"{ROOT}/{o['file_9x16' if with_text else 'file_9x16_no_text']}"
    os.makedirs(os.path.dirname(out), exist_ok=True)
    comp = Compositor(CFG) if with_text else None
    dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", f"{WORK}/base.mkv", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    enc = subprocess.Popen(encode_cmd(out), stdin=subprocess.PIPE)
    fs = W * H * 3; n = 0
    while True:
        buf = dec.stdout.read(fs)
        if len(buf) < fs: break
        fr = np.frombuffer(buf, np.uint8).reshape(H, W, 3).copy()
        if comp: comp.draw(fr, n / FPS)
        enc.stdin.write(fr.tobytes()); n += 1
    enc.stdin.close(); enc.wait(); dec.wait()
    assert enc.returncode == 0 and n == TOTAL_FR, (n, TOTAL_FR)
    print(f"{'akhir' if with_text else 'tanpa teks'} ok: {out}  ({os.path.getsize(out) / 1e6:.1f} MB)")

# ---------------------------------------------------------------- 5. versi 16:9 (latar kabur, tiada bar hitam)
def stage_variants():
    o = CFG["output"]; src = f"{ROOT}/{o['file_9x16']}"; out = f"{ROOT}/{o['file_16x9']}"
    fg = ("[0:v]split[a][b];[a]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,boxblur=36:6,eq=brightness=-0.10:saturation=1.1[bg];"
          "[b]scale=-2:1080[fg];[bg][fg]overlay=(W-w)/2:0,format=yuv420p")
    run(["ffmpeg", "-v", "error", "-y", "-i", src, "-filter_complex", fg, "-c:v", "libx264", "-crf", str(o["crf"]), "-preset", "slow",
         "-c:a", "copy", "-movflags", "+faststart", out])
    print(f"16:9 ok: {out} ({os.path.getsize(out) / 1e6:.1f} MB)")

if __name__ == "__main__":
    st = sys.argv[1:] or ["shots", "assemble", "audio", "text", "variants", "capcut"]
    if "shots" in st: stage_shots()
    if "assemble" in st: stage_assemble()
    if "audio" in st: stage_audio()
    if "text" in st: stage_text(False); stage_text(True)
    if "variants" in st: stage_variants()
    if "capcut" in st:
        from export_capcut import export; export(CFG, shots, TOTAL_S, grade_filter)
