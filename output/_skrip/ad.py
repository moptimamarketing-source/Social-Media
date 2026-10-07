"""Performance ad builder: EDL -> 1080x1920@25 render with face-aware punch-ins,
b-roll, hook text, end card, brand music, SFX, -14 LUFS.
Usage: ad.py edl   -> writes edl.json
       ad.py render
"""
import json
import math
import os
import re
import subprocess
import sys

import cv2
import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw, ImageFilter, ImageFont

SRC = "/tmp/claude-0/-home-user-Social-Media/936f43fe-583d-52b9-8ec0-737126c03d4e/scratchpad/src"
MUSIC = "/home/user/work/music"
WORK = "/home/user/work/pcs"
OUT = "/home/user/Social-Media/output"
W, H, FPS, SR = 1080, 1920, 25, 48000
FONT_B = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
FONT_XB = "/usr/share/fonts/opentype/inter/InterDisplay-ExtraBold.otf"
YELLOW, NAVY, WHITE = (255, 210, 40), (20, 28, 80), (255, 255, 255)
GRADE = "eq=contrast=1.06:saturation=1.15:gamma=0.98,colorbalance=rs=0.02:bs=-0.02:rm=0.02:bm=-0.02,unsharp=5:5:0.35"
os.makedirs(WORK, exist_ok=True)
os.makedirs(OUT, exist_ok=True)

# talking sections: (label, file alias, source file, in, out)
SECTIONS = [
    ("HOOK", "hook", "C6986", 3.60, 11.70),
    ("BODY1_line1", "body 1", "C6963", 23.00, 31.15),
    ("BODY1_line2", "body 1", "C6963", 91.10, 96.80),
    ("BODY2", "body 2", "C6970", 0.00, 11.75),
    ("CTA", "cta", "C7014", 2.30, 6.24),
]
END_CARD = 2.2


# ------------------------------------------------------------------ analysis
def level(src, a, b):
    out = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", f"{a:.3f}", "-t", f"{b - a:.3f}", "-i", f"{SRC}/{src}.MP4", "-vn",
         "-af", "highpass=f=200,lowpass=f=3500,asetnsamples=1920,astats=metadata=1:reset=1,"
                "ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-", "-f", "null", "-"],
        capture_output=True, text=True).stdout
    v = np.array([float(x) if x != "-inf" else -99 for x in re.findall(r"RMS_level=(\S+)", out)])
    return v  # 0.04 s per value at 48 kHz


def speech_chunks(src, a, b, label):
    """Split [a,b] into speech chunks; drop silences > 0.25 s (keep short tails)."""
    v = level(src, a, b)
    dt = 1920 / SR
    full = level(src, 0, 9999)
    n, s = np.percentile(full, 10), np.percentile(full, 95)
    on = (v - n) / (s - n) > 0.38
    # fill tiny holes
    for i in range(1, len(on) - 1):
        if not on[i] and on[i - 1] and on[i + 1]:
            on[i] = True
    runs, st = [], None
    for i, o in enumerate(on):
        if o and st is None:
            st = i
        if not o and st is not None:
            runs.append([st, i]); st = None
    if st is not None:
        runs.append([st, len(on)])
    runs = [r for r in runs if (r[1] - r[0]) * dt >= 0.12]
    chunks = []
    for r0, r1 in runs:
        t0, t1 = a + r0 * dt - 0.07, a + r1 * dt + 0.09
        if chunks and t0 - chunks[-1][1] < 0.25:
            chunks[-1][1] = t1
        else:
            chunks.append([t0, t1])
    # HOOK / CTA keep their visual lead-in (walk-in / pop-in reveal)
    if label in ("HOOK", "CTA") and chunks:
        chunks[0][0] = a
    if label == "CTA":
        chunks[-1][1] = b
    chunks = [[max(a, c0), min(b, c1)] for c0, c1 in chunks]
    # drop isolated blips (footsteps / crew noise) shorter than 0.35 s
    chunks = [c for i, c in enumerate(chunks) if c[1] - c[0] >= 0.35 or i in (0, len(chunks) - 1)]
    return [[round(c0, 3), round(c1, 3)] for c0, c1 in chunks if c1 - c0 > 0.15]


CASCADE = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")


def grab(src, t, scale=0.5):
    p = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", f"{SRC}/{src}.MP4", "-frames:v", "1",
                        "-vf", f"scale={int(W * scale)}:{int(H * scale)}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
                       capture_output=True).stdout
    return np.frombuffer(p, np.uint8).reshape(int(H * scale), int(W * scale), 3)


def face_at(src, t):
    img = grab(src, t)
    g = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    fs = CASCADE.detectMultiScale(g, 1.1, 5, minSize=(24, 24))
    if len(fs) == 0:
        return None
    x, y, w, h = max(fs, key=lambda f: f[2] * f[3])
    return [round((x + w / 2) / img.shape[1], 3), round((y + h / 2) / img.shape[0], 3), round(h / img.shape[0], 3)]


def build_edl():
    items, t = [], 0.0
    for label, alias, src, a, b in SECTIONS:
        chunks = speech_chunks(src, a, b, label)
        for k, (c0, c1) in enumerate(chunks):
            f = face_at(src, (c0 + c1) / 2) or face_at(src, c0 + 0.1)
            items.append(dict(section=label, file=alias, src=src, src_in=c0, src_out=c1, t_in=round(t, 3),
                              t_out=round(t + c1 - c0, 3), face=f, cut_index=k))
            t += c1 - c0
    total_talk = t
    # punch-in pattern: alternate scale on every cut, reset at section changes
    scales = [1.0, 1.2, 1.08, 1.24]
    last_sec, j = None, 0
    for it in items:
        if it["section"] != last_sec:
            j = 0 if it["section"] != "BODY1_line2" else 2
            last_sec = it["section"]
        it["scale"] = scales[j % len(scales)]
        j += 1
    # carry faces forward where detection failed
    prev = [0.5, 0.33, 0.08]
    for it in items:
        if it["face"] is None:
            it["face"] = prev
        prev = it["face"]
    # b-roll: empty playground shots from the hook file (no talent), over BODY1 line 1
    b1 = [it for it in items if it["section"] == "BODY1_line1"]
    b1s, b1e = b1[0]["t_in"], b1[-1]["t_out"]
    broll = [
        dict(src="C6986", src_in=0.10, dur=1.6, t_in=round(b1s + 2.6, 3), focus=[0.5, 0.42], zoom=[1.10, 1.02]),
        dict(src="C6986", src_in=1.80, dur=1.4, t_in=round(b1s + 6.0, 3), focus=[0.45, 0.30], zoom=[1.0, 1.08]),
    ]
    broll = [br for br in broll if br["t_in"] + br["dur"] < b1e - 0.2]
    edl = dict(fps=FPS, size=[W, H], talk_duration=round(total_talk, 3), end_card=END_CARD,
               total=round(total_talk + END_CARD, 3), items=items, broll=broll,
               hook_text=["CUTI SEKOLAH,", "ANAK BUAT APA?"],
               notes="Takes: body1 line1 = 2nd take (23.0s), line2 = 3rd/final take (91.1s); "
                     "repeat takes, crew cues and pauses >0.25s removed.")
    json.dump(edl, open(f"{OUT}/edl.json", "w"), indent=1)
    print(f"items {len(items)} talk {total_talk:.2f}s total {edl['total']:.2f}s")
    for it in items:
        print(f"  {it['section']:12s} {it['src']} {it['src_in']:7.2f}-{it['src_out']:7.2f} -> {it['t_in']:6.2f}"
              f"  x{it['scale']}  face {it['face']}")
    return edl


# ------------------------------------------------------------------ render helpers
class Reader:
    def __init__(self, src, a, dur):
        self.p = subprocess.Popen(
            ["ffmpeg", "-v", "error", "-ss", f"{a:.3f}", "-t", f"{dur + 0.2:.3f}", "-i", f"{SRC}/{src}.MP4",
             "-vf", f"scale={W}:{H},fps={FPS},{GRADE}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
            stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        self.last = None

    def next(self):
        b = self.p.stdout.read(W * H * 3)
        if len(b) == W * H * 3:
            self.last = Image.frombuffer("RGB", (W, H), b).copy()
        return self.last

    def close(self):
        self.p.stdout.close(); self.p.kill(); self.p.wait()


def zoom(img, z, fx, fy):
    z = max(1.0, z)
    bw, bh = W / z, H / z
    cx = min(max(fx * W, bw / 2), W - bw / 2)
    cy = min(max(fy * H, bh / 2), H - bh / 2)
    return img.resize((W, H), Image.BICUBIC, box=(cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2))


def focus_for(face, z):
    """Crop centre so the face lands at ~30% height (upper third)."""
    fx, fy, _ = face
    return fx, fy + (0.5 - 0.30) / z


def ease(p):
    return 1 - (1 - p) ** 3


def back(p, s=1.7):
    p -= 1
    return 1 + (s + 1) * p ** 3 + s * p ** 2


def text_block(lines, size, fill=WHITE, hl=None, stroke=10):
    fnt = ImageFont.truetype(FONT_B, size)
    d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    boxes = [d.textbbox((0, 0), ln, font=fnt, stroke_width=stroke) for ln in lines]
    lw = max(b[2] - b[0] for b in boxes)
    lh = [b[3] - b[1] for b in boxes]
    gap = int(size * 0.08)
    pad = 40
    img = Image.new("RGBA", (lw + pad * 2, sum(lh) + gap * (len(lines) - 1) + pad * 2), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    y = pad
    for i, (ln, bx) in enumerate(zip(lines, boxes)):
        x = pad + (lw - (bx[2] - bx[0])) / 2 - bx[0]
        col = hl if (hl and i == len(lines) - 1) else fill
        dr.text((x, y - bx[1]), ln, font=fnt, fill=col, stroke_width=stroke, stroke_fill=(0, 0, 0))
        y += lh[i] + gap
    sh = img.split()[3].filter(ImageFilter.GaussianBlur(14)).point(lambda v: int(v * 0.5))
    s = Image.new("RGBA", img.size, (0, 0, 0, 255)); s.putalpha(sh)
    out = Image.new("RGBA", img.size, (0, 0, 0, 0))
    out.alpha_composite(s, (0, 10))
    out.alpha_composite(img)
    return out


def pill(text, size, bg, fg):
    fnt = ImageFont.truetype(FONT_XB, size)
    d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    l, t, r, b = d.textbbox((0, 0), text, font=fnt)
    img = Image.new("RGBA", (r - l + 70, b - t + 40), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    dr.rounded_rectangle([0, 0, img.width - 1, img.height - 1], img.height // 2, fill=bg)
    dr.text((35 - l, 20 - t), text, font=fnt, fill=fg)
    return img


def place(frame, img, cx, cy, t, t0, t1, kind="pop"):
    if not (t0 <= t < t1):
        return
    p = min(1.0, (t - t0) / 0.3)
    q = min(1.0, (t1 - t) / 0.18)
    sc = (0.6 + 0.4 * back(p)) if kind == "pop" else 1.0
    dy = 0 if kind == "pop" else 40 * (1 - ease(p))
    im = img
    if abs(sc - 1) > 1e-3:
        im = img.resize((max(1, int(img.width * sc)), max(1, int(img.height * sc))), Image.BICUBIC)
    a = min(p * 2.5, 1.0) * q
    if a < 0.999:
        im = im.copy(); im.putalpha(im.split()[3].point(lambda v, o=a: int(v * o)))
    frame.alpha_composite(im, (int(cx - im.width / 2), int(cy - im.height / 2 + dy)))


# ------------------------------------------------------------------ audio
def build_audio(edl):
    total = edl["total"]
    n = int(round(total * FPS)) * SR // FPS
    voice = np.zeros(n)
    fade = int(0.008 * SR)
    for it in edl["items"]:
        d = it["src_out"] - it["src_in"]
        raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{it['src_in']:.3f}", "-t", f"{d:.3f}", "-i",
                              f"{SRC}/{it['src']}.MP4", "-vn", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                             capture_output=True).stdout
        y = np.frombuffer(raw, np.float32).astype(np.float64)
        if len(y) > 2 * fade:
            y[:fade] *= np.linspace(0, 1, fade); y[-fade:] *= np.linspace(1, 0, fade)
        i = int(round(it["t_in"] * FPS)) * SR // FPS
        voice[i:i + len(y)] += y[: n - i]
    sf.write(f"{WORK}/voice_raw.wav", voice, SR, subtype="FLOAT")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{WORK}/voice_raw.wav", "-af",
                    "highpass=f=85,afftdn=nf=-30:nr=8:tn=1,equalizer=f=250:t=q:w=1.0:g=-2,"
                    "equalizer=f=3200:t=q:w=1.2:g=2.5,equalizer=f=9000:t=h:w=1:g=1.5,"
                    "acompressor=threshold=-21dB:ratio=3.5:attack=8:release=120:makeup=2,"
                    "loudnorm=I=-16:TP=-2:LRA=7", "-ar", str(SR), "-ac", "1", f"{WORK}/voice.wav"], check=True)
    v, _ = sf.read(f"{WORK}/voice.wav")
    v = np.pad(v, (0, max(0, n - len(v))))[:n]

    # voice activity envelope (for ducking)
    win = int(0.05 * SR)
    act = np.sqrt(np.convolve(v ** 2, np.ones(win) / win, "same")) > 0.02
    # music: instrumental. Intro sting from the first big hit, CTA bed ending on the song's own ending.
    m, msr = sf.read(f"{MUSIC}/instrumental.wav")
    if msr != SR:
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{MUSIC}/instrumental.wav", "-ar", str(SR),
                        f"{WORK}/inst48.wav"], check=True)
        m, _ = sf.read(f"{WORK}/inst48.wav")
    music = np.zeros((n, 2))
    sting = m[int(1.95 * SR): int(1.95 * SR) + int(3.6 * SR)]
    music[: len(sting)] += sting
    cta_t = [it for it in edl["items"] if it["section"] == "CTA"][0]["t_in"]
    bed_start = cta_t - 1.2
    off = len(m) - (n - int(bed_start * SR))  # align song end with video end
    seg = m[max(0, off):]
    music[int(bed_start * SR): int(bed_start * SR) + len(seg)] += seg[: n - int(bed_start * SR)]
    # gain envelope: -10 dB alone, -20 dB under voice, sting fades out, bed fades in
    g = np.where(act, 10 ** (-20 / 20), 10 ** (-10 / 20))
    k = int(0.25 * SR)
    g = np.convolve(g, np.ones(k) / k, "same")
    t = np.arange(n) / SR
    region = np.zeros(n)
    region[t < 3.6] = np.clip((3.6 - t[t < 3.6]) / 1.0, 0, 1)                  # sting out
    region[t >= bed_start] = np.clip((t[t >= bed_start] - bed_start) / 0.6, 0, 1)  # bed in
    region[t >= total - 0.5] *= np.clip((total - t[t >= total - 0.5]) / 0.5, 0, 1)
    music *= (g * region)[:, None]

    # SFX (generated)
    rng = np.random.default_rng(3)

    def band_noise(dur, lo, hi):
        from scipy.signal import butter, sosfilt
        x = rng.uniform(-1, 1, int(dur * SR))
        return sosfilt(butter(2, [lo, hi], btype="band", fs=SR, output="sos"), x)

    def whoosh(dur=0.42):
        x = band_noise(dur, 400, 5000)
        e = np.sin(np.pi * np.linspace(0, 1, len(x))) ** 2
        return x * e / (np.abs(x).max() + 1e-9)

    def pop():
        tt = np.arange(int(0.08 * SR)) / SR
        f = 900 * np.exp(-tt * 25) + 450
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 40)

    def ding():
        tt = np.arange(int(0.9 * SR)) / SR
        return (np.sin(2 * np.pi * 1318 * tt) + 0.5 * np.sin(2 * np.pi * 1976 * tt)
                + 0.25 * np.sin(2 * np.pi * 2637 * tt)) * np.exp(-tt * 5) * np.minimum(1, tt * 300) / 1.7

    def riser(dur=1.0):
        x = band_noise(dur, 800, 9000)
        tt = np.linspace(0, 1, len(x))
        tone = np.sin(2 * np.pi * np.cumsum(300 + 900 * tt ** 2) / SR)
        return (0.7 * x / (np.abs(x).max() + 1e-9) + 0.3 * tone) * tt ** 2.2

    sfx = np.zeros(n)

    def put(sig, at, gain):
        i = max(0, int(at * SR)); sfx[i:i + len(sig)] += sig[: n - i] * gain

    put(pop(), 0.15, 0.30)                                   # hook text
    for br in edl["broll"]:
        put(whoosh(), br["t_in"] - 0.2, 0.22)                 # b-roll in
    b2 = [it for it in edl["items"] if it["section"] == "BODY2"][0]["t_in"]
    put(whoosh(), b2 - 0.2, 0.22)
    put(riser(1.0), cta_t - 1.0, 0.20)                        # build into CTA
    put(ding(), cta_t + 0.55, 0.22)                           # talent pops into frame
    put(pop(), edl["talk_duration"] + 0.25, 0.30)             # end card
    mix = np.stack([v, v], 1) + music + sfx[:, None]
    sf.write(f"{WORK}/mix_raw.wav", mix, SR, subtype="FLOAT")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", f"{WORK}/mix_raw.wav", "-af",
                    "loudnorm=I=-14:TP=-1.5:LRA=9:print_format=summary", "-ar", str(SR),
                    f"{WORK}/mix.wav"], check=True)
    return f"{WORK}/mix.wav"


# ------------------------------------------------------------------ video
def render(edl, audio, out_path, text=True):
    total = edl["total"]
    nfr = int(round(total * FPS))
    enc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
         "-i", "-", "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-profile:v", "high",
         "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "320k", "-ar", str(SR),
         "-movflags", "+faststart", "-shortest", out_path], stdin=subprocess.PIPE)
    hook = text_block(edl["hook_text"], 112, hl=YELLOW)
    brand = pill("PANTAS BACA", 66, YELLOW, NAVY)
    end_t1 = text_block(["JOM DAFTAR"], 150, hl=None)
    end_t2 = text_block(["SEKARANG!"], 150, fill=YELLOW)
    end_sub = pill("Tekan butang di bawah", 56, WHITE, NAVY)
    talk_end = edl["talk_duration"]
    fi = 0
    last_frame = None
    for it in edl["items"]:
        nf_ = int(round(it["t_out"] * FPS)) - int(round(it["t_in"] * FPS))
        r = Reader(it["src"], it["src_in"], it["src_out"] - it["src_in"])
        z0 = it["scale"]
        for i in range(nf_):
            t = fi / FPS
            src = r.next()
            p = i / max(1, nf_ - 1)
            z = z0 * (1.0 + 0.035 * p)  # slow push-in inside every shot
            fx, fy = focus_for(it["face"], z)
            frame = zoom(src, z, fx, fy)
            for br in edl["broll"]:
                if br["t_in"] <= t < br["t_in"] + br["dur"]:
                    bi = int(round((t - br["t_in"]) * FPS))
                    if bi == 0 or "_r" not in br:
                        if "_r" in br:
                            br["_r"].close()
                        br["_r"] = Reader(br["src"], br["src_in"], br["dur"])
                        br["_last"] = None
                    bf = br["_r"].next()
                    pp = (t - br["t_in"]) / br["dur"]
                    zz = br["zoom"][0] + (br["zoom"][1] - br["zoom"][0]) * pp
                    frame = zoom(bf, zz, *br["focus"])
            frame = frame.convert("RGBA")
            if text:
                place(frame, hook, W / 2, H * 0.67, t, 0.12, 2.3)
            last_frame = frame.convert("RGB")
            enc.stdin.write(last_frame.tobytes())
            fi += 1
        r.close()
    # end card over blurred last frame
    base = last_frame.filter(ImageFilter.GaussianBlur(24))
    base = Image.blend(base, Image.new("RGB", (W, H), NAVY), 0.55)
    while fi < nfr:
        t = fi / FPS
        p = max(0.0, (t - talk_end) / END_CARD)
        frame = zoom(base, 1.0 + 0.04 * p, 0.5, 0.5).convert("RGBA")
        if p < 0.16:
            frame = Image.blend(last_frame.convert("RGBA"), frame, min(1, p / 0.16))
        if text:
            place(frame, brand, W / 2, H * 0.36, t, talk_end + 0.10, total + 1)
            place(frame, end_t1, W / 2, H * 0.45, t, talk_end + 0.22, total + 1)
            place(frame, end_t2, W / 2, H * 0.535, t, talk_end + 0.36, total + 1)
            place(frame, end_sub, W / 2, H * 0.635, t, talk_end + 0.55, total + 1, kind="slide")
        else:
            place(frame, brand, W / 2, H * 0.45, t, talk_end + 0.10, total + 1)
        enc.stdin.write(frame.convert("RGB").tobytes())
        fi += 1
    for br in edl["broll"]:
        if "_r" in br:
            br["_r"].close(); del br["_r"]
    enc.stdin.close(); enc.wait()


if __name__ == "__main__":
    if sys.argv[1] == "edl":
        build_edl()
    else:
        edl = json.load(open(f"{OUT}/edl.json"))
        audio = build_audio(edl)
        render(edl, audio, f"{OUT}/Ad_v1_final.mp4", text=True)
        render(edl, audio, f"{OUT}/Ad_v1_nocaption.mp4", text=False)
        print("done", edl["total"])
