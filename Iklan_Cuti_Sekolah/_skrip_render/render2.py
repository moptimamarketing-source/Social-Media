"""V2: Hook / Body / CTA ad in the style of the reference (kinetic captions,
split-screen body with rounded talking-head frame, light-leak CTA).
Usage: render2.py SRC_DIR WORK_DIR OUT_DIR"""
import math
import os
import subprocess
import sys

import numpy as np
import soundfile as sf
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

SRC, WORK, OUT = sys.argv[1:4]
W, H, FPS, SR = 1080, 1920, 30, 48000
GRADE = "eq=contrast=1.07:saturation=1.18:gamma=0.98,colorbalance=rs=0.03:bs=-0.03:rm=0.02:bm=-0.02"
TOOLS = os.path.dirname(os.path.abspath(__file__))
KIT = f"{OUT}/CapCut_Kit_V2"
D_CLIP, D_TXT, D_AUD = f"{KIT}/01_Klip_Video", f"{KIT}/02_Teks_PNG", f"{KIT}/03_Audio"
for d in (WORK, D_CLIP, D_TXT, D_AUD):
    os.makedirs(d, exist_ok=True)

NAVY, RED, YELLOW, ORANGE, WHITE = (22, 32, 91), (227, 38, 46), (255, 199, 39), (255, 106, 26), (255, 255, 255)
BG = (243, 241, 236)
INTER = "/usr/share/fonts/opentype/inter/InterDisplay-{}.otf"
SERIF = "/usr/share/fonts/truetype/crosextra/Caladea-BoldItalic.ttf"


def F(path, size, _c={}):
    k = (path, size)
    if k not in _c:
        _c[k] = ImageFont.truetype(path, size)
    return _c[k]


def nf(d):
    return int(round(d * FPS))


def ease_out_cubic(p):
    return 1 - (1 - p) ** 3


def ease_out_back(p, s=1.7):
    p -= 1
    return 1 + (s + 1) * p ** 3 + s * p ** 2


# ---------------------------------------------------------------- video IO
class Reader:
    """Sequential graded frames (30fps, 1080x1920) from a source range."""

    def __init__(self, src, t_in, dur):
        self.p = subprocess.Popen(
            ["ffmpeg", "-v", "error", "-ss", f"{t_in:.3f}", "-t", f"{dur + 0.3:.3f}", "-i", f"{SRC}/{src}.MP4",
             "-vf", f"scale={W}:{H},fps={FPS},{GRADE}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
            stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        self.last = None

    def next(self):
        b = self.p.stdout.read(W * H * 3)
        if len(b) == W * H * 3:
            self.last = Image.frombuffer("RGB", (W, H), b).copy()
        return self.last

    def close(self):
        self.p.stdout.close()
        self.p.kill()
        self.p.wait()


class Broll:
    """Concatenate several source ranges and time-stretch them to fill `dur`."""

    def __init__(self, pieces, dur):
        self.frames = []
        for src, a, b, focus in pieces:
            r = Reader(src, a, b - a)
            for _ in range(nf(b - a)):
                self.frames.append((r.next(), focus))
            r.close()
        self.n = nf(dur)

    def get(self, i):
        j = min(len(self.frames) - 1, int(i * len(self.frames) / self.n))
        return self.frames[j], j / max(1, len(self.frames) - 1)


def encoder(path, audio=None, crf=18):
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
           "-i", "-"]
    if audio:
        cmd += ["-i", audio, "-c:a", "aac", "-b:a", "192k", "-shortest"]
    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", str(crf), "-pix_fmt", "yuv420p", "-movflags",
            "+faststart", path]
    return subprocess.Popen(cmd, stdin=subprocess.PIPE)


def crop_zoom(img, z, focus, out=(W, H)):
    """Crop `img` around focus with zoom z, to the aspect of `out`."""
    ow, oh = out
    asp = ow / oh
    bw = W / z
    bh = bw / asp
    if bh > H:
        bh = H
        bw = bh * asp
    cx = min(max(focus[0] * W, bw / 2), W - bw / 2)
    cy = min(max(focus[1] * H, bh / 2), H - bh / 2)
    return img.resize(out, Image.BICUBIC, box=(cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2))


# ---------------------------------------------------------------- graphics
def shadow_of(size, radius, blur=26, alpha=90, rounded_bottom=True):
    pad = blur * 2
    m = Image.new("L", (size[0] + pad * 2, size[1] + pad * 2), 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle([pad, pad + 14, pad + size[0], pad + size[1] + 14], radius, fill=alpha)
    m = m.filter(ImageFilter.GaussianBlur(blur))
    s = Image.new("RGBA", m.size, (0, 0, 0, 255))
    s.putalpha(m)
    return s, pad


def round_mask(size, radius, bottom=True):
    m = Image.new("L", size, 0)
    d = ImageDraw.Draw(m)
    d.rounded_rectangle([0, 0, size[0] - 1, size[1] - 1 + (0 if bottom else radius * 2)], radius, fill=255)
    return m


TOP_TINT = None


def top_gradient():
    """Dark gradient at the top for caption legibility on bright skies."""
    global TOP_TINT
    if TOP_TINT is None:
        a = np.zeros((H, W), np.uint8)
        y = np.arange(780)
        a[:780] = (150 * (1 - y / 780) ** 1.6)[:, None].astype(np.uint8)
        TOP_TINT = Image.new("RGBA", (W, H), (0, 0, 0, 255))
        TOP_TINT.putalpha(Image.fromarray(a))
    return TOP_TINT


# word styles: (font path, size, fill, box)
STY = {
    "serif": (SERIF, 112, WHITE, None),
    "serif_y": (SERIF, 112, YELLOW, None),
    "sans": (INTER.format("Black"), 104, WHITE, None),
    "sans_y": (INTER.format("Black"), 104, YELLOW, None),
    "box_o": (INTER.format("Black"), 104, WHITE, ORANGE),
    "box_y": (INTER.format("Black"), 104, NAVY, YELLOW),
}
_wcache = {}


def word_img(word, style):
    k = (word, style)
    if k in _wcache:
        return _wcache[k]
    path, size, fill, box = STY[style]
    fnt = F(path, size)
    d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    l, t, r, b = d.textbbox((0, 0), word, font=fnt)
    _, ct, _, cb = d.textbbox((0, 0), "H", font=fnt)
    t, b = min(t, ct), max(b, cb)
    px, py = (22, 10) if box else (0, 0)
    w, h = r - l + px * 2, b - t + py * 2
    pad = 40
    img = Image.new("RGBA", (w + pad * 2, h + pad * 2), (0, 0, 0, 0))
    if box:
        ImageDraw.Draw(img).rounded_rectangle([pad, pad, pad + w, pad + h], 18, fill=box + (255,))
    txt = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(txt).text((pad + px - l, pad + py - t), word, font=fnt, fill=fill + (255,))
    # soft dark glow behind the letters (and box)
    a = Image.alpha_composite(img, txt).split()[3].filter(ImageFilter.GaussianBlur(16)).point(lambda v: v * 0.55)
    sh = Image.new("RGBA", img.size, (0, 0, 0, 255))
    sh.putalpha(a)
    out = Image.alpha_composite(sh, img)
    out = Image.alpha_composite(out, txt)
    _wcache[k] = (out, pad, w, h)
    return _wcache[k]


def layout_phrase(tokens, cy, maxw=960, gap=26, lead=22):
    """Return [(word, style, x, y)] centred lines around cy (top-left of ink box)."""
    lines, cur, cw = [], [], 0
    for wd, st in tokens:
        _, _, w, h = word_img(wd, st)
        if cur and cw + gap + w > maxw:
            lines.append(cur)
            cur, cw = [], 0
        cur.append((wd, st, w, h))
        cw += w + (gap if len(cur) > 1 else 0)
    lines.append(cur)
    heights = [max(h for *_, h in ln) for ln in lines]
    total = sum(heights) + lead * (len(lines) - 1)
    y = cy - total / 2
    out = []
    for ln, lh in zip(lines, heights):
        lw = sum(w for *_, w, _ in ln) + gap * (len(ln) - 1)
        x = (W - lw) / 2
        for wd, st, w, h in ln:
            out.append((wd, st, x, y + (lh - h) / 2))
            x += w + gap
        y += lh + lead
    return out


def draw_kinetic(frame, phrases, t, cy=330):
    for t0, t1, tokens in phrases:
        if not (t0 <= t < t1):
            continue
        for k, (wd, st, x, y) in enumerate(layout_phrase(tokens, cy)):
            ta = t0 + k * 0.11
            if t < ta:
                continue
            p = min(1, (t - ta) / 0.16)
            sc = 1.22 - 0.22 * ease_out_cubic(p)
            img, pad, w, h = word_img(wd, st)
            if abs(sc - 1) > 1e-3:
                im2 = img.resize((int(img.width * sc), int(img.height * sc)), Image.BICUBIC)
            else:
                im2 = img
            if p < 1:
                im2 = im2.copy()
                im2.putalpha(im2.split()[3].point(lambda v, o=p: int(v * min(1, o * 1.6))))
            cx, cyy = x + w / 2, y + h / 2
            frame.alpha_composite(im2, (int(cx - im2.width / 2), int(cyy - im2.height / 2)))
    return frame


def small_caption_dark(text_parts, size=52):
    """Navy text on light background; keyword on a yellow marker."""
    fnt = F(INTER.format("ExtraBold"), size)
    d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    ws = [d.textlength(t, font=fnt) for t, _ in text_parts]
    asc, desc = fnt.getmetrics()
    pad = 16
    img = Image.new("RGBA", (int(sum(ws)) + pad * 2 + 20, asc + desc + pad * 2), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    x = pad
    for (t, hl), w in zip(text_parts, ws):
        if hl:
            dr.rounded_rectangle([x - 8, pad + 4, x + w + 8, pad + asc + desc - 2], 12, fill=YELLOW + (255,))
        x += w
    x = pad
    for (t, hl), w in zip(text_parts, ws):
        dr.text((x, pad), t, font=fnt, fill=NAVY + (255,))
        x += w
    return img


def small_caption(text_parts, size=50):
    """text_parts: [(text, highlighted?)] -> RGBA image (white + yellow keyword) with shadow."""
    fnt = F(INTER.format("Bold"), size)
    d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    ws = [d.textlength(t, font=fnt) for t, _ in text_parts]
    asc, desc = fnt.getmetrics()
    pad = 30
    img = Image.new("RGBA", (int(sum(ws)) + pad * 2, asc + desc + pad * 2), (0, 0, 0, 0))
    txt = Image.new("RGBA", img.size, (0, 0, 0, 0))
    dr = ImageDraw.Draw(txt)
    x = pad
    for (t, hl), w in zip(text_parts, ws):
        dr.text((x, pad), t, font=fnt, fill=(YELLOW if hl else WHITE) + (255,))
        x += w
    a = txt.split()[3].filter(ImageFilter.GaussianBlur(9)).point(lambda v: min(255, int(v * 1.1)))
    sh = Image.new("RGBA", img.size, (0, 0, 0, 255))
    sh.putalpha(a)
    return Image.alpha_composite(Image.alpha_composite(img, sh), txt)


def put_caption(frame, img, t, t0, t1, cy):
    if not (t0 <= t < t1):
        return
    p = min(1, (t - t0) / 0.2)
    q = min(1, (t1 - t) / 0.12)
    im = img.copy()
    im.putalpha(im.split()[3].point(lambda v, o=min(p, q): int(v * o)))
    dy = 18 * (1 - ease_out_cubic(p))
    frame.alpha_composite(im, (int((W - im.width) / 2), int(cy - im.height / 2 + dy)))


def feature_card(items, active, prog, size=(960, 900)):
    """White list card; `active` item gets a yellow highlight bar that slides in."""
    cw, ch = size
    img = Image.new("RGBA", size, (255, 255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((56, 52), "Apa anak-anak dapat?", font=F(INTER.format("Black"), 58), fill=NAVY)
    d.line([(56, 140), (cw - 56, 140)], fill=(230, 230, 230), width=3)
    y0, rh = 175, 138
    for i, (title, sub) in enumerate(items):
        y = y0 + i * rh
        if i == active:
            x1 = 30 + (cw - 60) * ease_out_cubic(min(1, prog / 0.25))
            d.rounded_rectangle([30, y - 8, x1, y + rh - 22], 22, fill=YELLOW)
        # icon circle
        d.ellipse([56, y + 14, 56 + 76, y + 90], fill=NAVY if i != active else WHITE)
        s, cx0, cy0 = 76, 56, y + 14
        pts = [(cx0 + s * 0.27, cy0 + s * 0.52), (cx0 + s * 0.44, cy0 + s * 0.68), (cx0 + s * 0.74, cy0 + s * 0.34)]
        d.line(pts, fill=WHITE if i != active else NAVY, width=8, joint="curve")
        d.text((160, y + 10), title, font=F(INTER.format("ExtraBold"), 48), fill=NAVY)
        d.text((160, y + 66), sub, font=F(INTER.format("Medium"), 32), fill=(90, 96, 120))
    return img


def light_leak(t):
    """Orange/yellow glow overlay; t in [0,1] across the transition."""
    env = math.sin(math.pi * min(1, max(0, t)))
    yy, xx = np.mgrid[0:H // 4, 0:W // 4].astype(np.float32)
    cx, cy = W / 4 * (0.25 + 0.6 * t), H / 4 * (0.55 - 0.2 * t)
    r = np.sqrt((xx - cx) ** 2 + ((yy - cy) * 0.8) ** 2) / (W / 4 * (0.45 + 0.9 * env))
    g = np.clip(1 - r, 0, 1) ** 1.4 * env
    rgb = np.stack([255 * g, (150 + 80 * g) * g, 40 * g * g], -1).astype(np.uint8)
    im = Image.fromarray(rgb).resize((W, H), Image.BICUBIC)
    return im, env


# ---------------------------------------------------------------- plan
CARD = (60, 120, 960, 880)        # x, y, w, h  (top B-roll / list card)
FRAME = (160, 1110, 760, 810)     # bottom talking-head frame
CAP_Y = 1050

HOOK_TXT = [
    (0.15, 1.35, [("Cuti", "serif"), ("sekolah", "serif")]),
    (1.35, 2.60, [("dah", "sans"), ("DEKAT!", "box_o")]),
    (2.60, 4.10, [("Anak", "serif"), ("nak", "serif"), ("buat", "serif"), ("apa?", "serif_y")]),
    (4.10, 5.80, [("JOM", "sans"), ("ISI", "sans_y"), ("CUTI", "sans"), ("ANAK!", "box_y")]),
]
B3_TXT = [
    (0.25, 2.40, [("Main,", "serif")]),
    (2.40, 4.40, [("belajar,", "serif")]),
    (4.40, 6.60, [("dan", "serif"), ("BERKAWAN!", "box_y")]),
    (6.60, 8.50, [("semuanya", "sans"), ("DI", "sans"), ("SINI!", "sans_y")]),
]
B4_TXT = [
    (0.25, 2.90, [("Jangan", "serif"), ("tunggu", "serif"), ("lama!", "serif_y")]),
    (2.90, 5.40, [("Ajak", "serif"), ("kawan", "serif"), ("sekali!", "serif_y")]),
    (5.40, 8.00, [("Lagi", "sans"), ("RAMAI,", "sans"), ("lagi", "serif"), ("SERONOK!", "box_o")]),
]
FEATURES = [("Aktiviti seronok", "Isi masa cuti dengan bermakna"),
            ("Belajar sambil bermain", "Aktiviti santai tapi berfaedah"),
            ("Kawan baru", "Bina keyakinan & kemahiran sosial"),
            ("Ruang bermain luas", "Taman & kawasan aktiviti"),
            ("Diselia oleh staf", "Ibu bapa lebih tenang")]

# name, kind, voice source (src, in, out), extra
SEGS = [
    dict(name="01_HOOK", kind="full", src=("C7016", 0.00, 5.76), txt=HOOK_TXT,
         zooms=[(0, 1.00), (1.35, 1.16), (2.60, 1.00), (4.10, 1.22)], focus=(0.5, 0.33)),
    dict(name="02_BODY_Pengenalan", kind="split", src=("C6963", 23.05, 31.10), crop=(540, 875, 760),
         broll=[("C6986", 0.0, 2.9, (0.5, 0.40)), ("C7014", 0.0, 2.8, (0.5, 0.47)),
                ("C7016", 3.95, 5.75, (0.45, 0.50))],
         caps=[(0.25, 4.0, [("Program ", 0), ("cuti sekolah", 1), (" untuk anak-anak", 0)]),
               (4.0, 8.05, [("Tempat main yang ", 0), ("luas & ceria", 1)])]),
    dict(name="03_BODY_Senarai", kind="split", src=("C6963", 91.15, 96.75), crop=(540, 860, 660),
         list=True, caps=[(0.2, 5.6, [("Apa yang anak-anak ", 0), ("dapat?", 1)])]),
    dict(name="04_BODY_Taman", kind="full", src=("C6986", 3.40, 11.85), txt=B3_TXT,
         zooms=[(0, 1.06), (2.40, 1.18), (4.40, 1.06), (6.60, 1.20)], focus=(0.5, 0.55)),
    dict(name="05_BODY_Ajak_Kawan", kind="full", src=("C6970", 0.00, 7.90), txt=B4_TXT,
         zooms=[(0, 1.00), (2.90, 1.12), (5.40, 1.00)], focus=(0.5, 0.40)),
    dict(name="06_CTA", kind="cta", src=("C6970", 7.90, 11.75),
         caps=[(0.25, 2.0, [("Klik ", 0), ("link di bio", 1), (" untuk daftar", 0)]),
               (2.0, 3.85, [("atau ", 0), ("WhatsApp", 1), (" kami sekarang!", 0)])]),
]


def seg_dur(s):
    return nf(s["src"][2] - s["src"][1]) / FPS


def zoom_at(zooms, t):
    z = zooms[0][1]
    for tz, v in zooms:
        if t >= tz:
            z = v
    return z


def compose_split(fg, t, i, n, s, broll, card_shadow, frame_shadow, frame_mask, card_mask, list_state):
    canvas = Image.new("RGBA", (W, H), BG + (255,))
    intro = min(1, t / 0.32) if s["name"].startswith("02") else 1
    e = ease_out_cubic(intro)
    # top card
    cx, cy, cw, ch = CARD
    if broll is not None:
        (img, foc), p = broll.get(i)
        card = crop_zoom(img, 1.0 + 0.06 * p, foc, out=(cw, ch))
    else:
        card = feature_card(FEATURES, *list_state, size=(cw, ch))
    card = card.convert("RGBA")
    card.putalpha(card_mask)
    sc = 0.92 + 0.08 * e
    if sc != 1:
        card = card.resize((int(cw * sc), int(ch * sc)), Image.BICUBIC)
        csh = card_shadow.resize((int(card_shadow.width * sc), int(card_shadow.height * sc)))
    else:
        csh = card_shadow
    ox, oy = int(cx + (cw - card.width) / 2), int(cy + (ch - card.height) / 2)
    canvas.alpha_composite(csh, (ox - (csh.width - card.width) // 2, oy - (csh.height - card.height) // 2))
    canvas.alpha_composite(card, (ox, oy))
    # bottom talking head
    fx, fy, fw, fh = FRAME
    ccx, ccy, cwid = s["crop"]
    zz = W / cwid * (1 + 0.03 * i / max(1, n - 1))
    head = crop_zoom(fg, zz, (ccx / W, ccy / H), out=(fw, fh)).convert("RGBA")
    head.putalpha(frame_mask)
    dy = int(220 * (1 - e))
    canvas.alpha_composite(frame_shadow, (fx - (frame_shadow.width - fw) // 2, fy + dy - (frame_shadow.height - fh) // 2))
    canvas.alpha_composite(head, (fx, fy + dy))
    return canvas


def render_segment(s, enc_final, enc_clip, t_global, caps_imgs):
    src, a, b = s["src"]
    dur = seg_dur(s)
    n = nf(dur)
    r = Reader(src, a, dur)
    broll = Broll(s["broll"], dur) if s.get("broll") else None
    fw, fh = FRAME[2], FRAME[3]
    frame_mask = round_mask((fw, fh), 70, bottom=False)
    card_mask = round_mask((CARD[2], CARD[3]), 44)
    fsh, _ = shadow_of((fw, fh), 70)
    csh, _ = shadow_of((CARD[2], CARD[3]), 44, alpha=70)
    last_clean = None
    for i in range(n):
        t = i / FPS
        fg = r.next()
        if s["kind"] == "split":
            item = min(len(FEATURES) - 1, int(t / (dur / len(FEATURES))))
            prog = (t - item * dur / len(FEATURES)) / (dur / len(FEATURES))
            clean = compose_split(fg, t, i, n, s, broll, csh, fsh, frame_mask, card_mask, (item, prog))
        elif s["kind"] == "cta":
            p = i / max(1, n - 1)
            clean = crop_zoom(fg, 1.0 + 0.08 * p, (0.5, 0.42)).convert("RGBA")
        else:
            z = zoom_at(s["zooms"], t)
            # ease each punch-in over 3 frames so it reads as a cut with a little snap
            clean = crop_zoom(fg, z, s["focus"]).convert("RGBA")
        # light leak into CTA (last 0.3s of previous segment handled by caller via t_global)
        if s["kind"] == "cta" and t < 0.45:
            leak, env = light_leak(0.5 + t / 0.9)
            clean = Image.alpha_composite(clean, Image.new("RGBA", (W, H), (0, 0, 0, 0)))
            clean = ImageChops.screen(clean.convert("RGB"), leak).convert("RGBA")
        if s["name"].startswith("05") and t > dur - 0.3:
            leak, env = light_leak((t - (dur - 0.3)) / 0.6)
            clean = ImageChops.screen(clean.convert("RGB"), leak).convert("RGBA")
        frame = clean.copy()
        if s["kind"] == "full":
            frame = Image.alpha_composite(frame, top_gradient())
            frame = draw_kinetic(frame, s["txt"], t)
        for (c0, c1, _), img in zip(s.get("caps", []), caps_imgs):
            cy = CAP_Y if s["kind"] == "split" else 1230
            put_caption(frame, img, t, c0, c1, cy)
        enc_final.stdin.write(frame.convert("RGB").tobytes())
        enc_clip.stdin.write(clean.convert("RGB").tobytes())
        last_clean = clean
    r.close()
    return n


VOICE_FX = ("highpass=f=90,afftdn=nf=-28:nr=10,equalizer=f=3000:t=q:w=1.2:g=2,"
            "acompressor=threshold=-20dB:ratio=3:attack=10:release=150,loudnorm=I=-16:TP=-1.5")


def build_audio():
    parts, starts, t = [], [], 0.0
    for s in SEGS:
        src, a, b = s["src"]
        d = seg_dur(s)
        wav = f"{WORK}/v2_{s['name']}.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-t", f"{d:.3f}", "-i", f"{SRC}/{src}.MP4",
                        "-vn", "-ac", "1", "-ar", str(SR), "-af",
                        f"afade=t=in:d=0.02,afade=t=out:st={d - 0.03:.3f}:d=0.03," + VOICE_FX, wav], check=True)
        y, _ = sf.read(wav)
        n = nf(d) * SR // FPS
        parts.append(np.pad(y, (0, max(0, n - len(y))))[:n])
        starts.append(t)
        t += d
    total = t
    voice = np.concatenate(parts)
    sf.write(f"{D_AUD}/suara_penuh.wav", voice, SR, subtype="PCM_16")
    subprocess.run([sys.executable, os.path.join(TOOLS, "music.py"), D_AUD, f"{total:.3f}"], check=True)
    wh, _ = sf.read(f"{D_AUD}/sfx_whoosh.wav")
    po, _ = sf.read(f"{D_AUD}/sfx_pop.wav")
    sfx = np.zeros((len(voice) + SR, 2))

    def put(sig, tt, g):
        i = max(0, int(tt * SR))
        sfx[i:i + len(sig)] += sig[: len(sfx) - i] * g

    for st in starts[1:]:
        put(wh, st - 0.22, 0.5)
    for s, st in zip(SEGS, starts):
        for t0, _, toks in s.get("txt", []):
            put(po, st + t0, 0.25)
        for t0, _, _ in s.get("caps", []):
            put(po, st + t0, 0.18)
    sf.write(f"{WORK}/v2_sfx.wav", sfx[: len(voice)], SR, subtype="PCM_16")
    mix = f"{WORK}/v2_mix.wav"
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-i", f"{D_AUD}/suara_penuh.wav", "-i", f"{D_AUD}/muzik_latar.wav",
        "-i", f"{WORK}/v2_sfx.wav", "-filter_complex",
        "[0:a]aformat=channel_layouts=stereo,asplit=2[v][sc];[1:a]volume=0.30[m];"
        "[m][sc]sidechaincompress=threshold=0.025:ratio=5:attack=25:release=450[md];"
        "[v][md][2:a]amix=inputs=3:normalize=0:duration=first,loudnorm=I=-14:TP=-1.2:LRA=10[out]",
        "-map", "[out]", "-ar", str(SR), mix], check=True)
    return mix, starts, total


def export_pngs():
    k = 0
    for s in SEGS:
        for t0, t1, toks in s.get("txt", []):
            c = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            for wd, st, x, y in layout_phrase(toks, 330):
                img, pad, w, h = word_img(wd, st)
                c.alpha_composite(img, (int(x - pad), int(y - pad)))
            k += 1
            c.save(f"{D_TXT}/{s['name']}_teks{k:02d}.png")
        for t0, t1, parts in s.get("caps", []):
            c = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            img = (small_caption_dark if s["kind"] == "split" else small_caption)(parts)
            cy = CAP_Y if s["kind"] == "split" else 1230
            c.alpha_composite(img, (int((W - img.width) / 2), int(cy - img.height / 2)))
            k += 1
            c.save(f"{D_TXT}/{s['name']}_kapsyen{k:02d}.png")


if __name__ == "__main__":
    mix, starts, total = build_audio()
    export_pngs()
    final = f"{OUT}/Iklan_Cuti_Sekolah_V2_Hook_Body_CTA.mp4"
    enc = encoder(final, audio=mix)
    tg = 0.0
    for s in SEGS:
        mk = small_caption_dark if s["kind"] == "split" else small_caption
        caps = [mk(p) for _, _, p in s.get("caps", [])]
        clipw = encoder(f"{D_CLIP}/{s['name']}.mp4", audio=f"{WORK}/v2_{s['name']}.wav", crf=19)
        n = render_segment(s, enc, clipw, tg, caps)
        clipw.stdin.close()
        clipw.wait()
        tg += n / FPS
        print(s["name"], n)
    enc.stdin.close()
    enc.wait()
    print("total", total)
