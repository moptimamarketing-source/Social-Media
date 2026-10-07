"""Lapisan teks: sprite (outline + bayang), animasi pop/slide, dan komposit ke bingkai numpy."""
import math, os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 1080, 1920
MAXW = 840          # lebar maksimum teks (kawasan selamat: kiri 120 / kanan 120 untuk butang TikTok)

def hexrgb(h): h = h.lstrip("#"); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

class Style:
    def __init__(self, cfg):
        self.pal = {k: hexrgb(v) for k, v in cfg["palette"].items()}
        self.f = {k: os.path.join(ROOT, v) for k, v in cfg["fonts"].items()}
    def col(self, name): return self.pal.get(name, hexrgb(name) if name.startswith("#") else (255, 255, 255))

def _font(path, size): return ImageFont.truetype(path, int(size))

def _fit(path, text, size, maxw, stroke_ratio=.09):
    size = int(size)
    while size > 24:
        f = _font(path, size); w = f.getlength(text) + 2 * stroke_ratio * size
        if w <= maxw: return f, size
        size -= 2
    return _font(path, 24), 24

def _shadowed(layer, blur=7, dy=7, alpha=.5):
    """letak bayang lembut di bawah sprite RGBA"""
    pad = blur * 3
    big = Image.new("RGBA", (layer.width + 2 * pad, layer.height + 2 * pad), (0, 0, 0, 0))
    a = layer.getchannel("A"); sh = Image.new("RGBA", layer.size, (0, 0, 0, 0))
    sh.putalpha(a.point(lambda v: int(v * alpha)))
    big.alpha_composite(sh, (pad, pad + dy)); big = big.filter(ImageFilter.GaussianBlur(blur))
    big.alpha_composite(layer, (pad, pad)); return big

def text_stack(st, lines, font="tajuk", maxw=MAXW, gap_ratio=.0):
    """beberapa baris teks berpusat; setiap baris {t,color,size}; teks berwarna + outline gelap"""
    parts = []
    for ln in lines:
        f, sz = _fit(st.f[font], ln["t"], ln["size"], maxw)
        sw = max(3, int(sz * .09)); bb = f.getbbox(ln["t"], stroke_width=sw)
        im = Image.new("RGBA", (bb[2] - bb[0] + 8, int(sz * 1.12) + 2 * sw), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        d.text((4 - bb[0], sw), ln["t"], font=f, fill=st.col(ln["color"]) + (255,), stroke_width=sw,
               stroke_fill=st.col("gelap") + (255,))
        parts.append(im)
    wmax = max(p.width for p in parts); hh = sum(p.height for p in parts) + int(gap_ratio)
    out = Image.new("RGBA", (wmax, hh), (0, 0, 0, 0)); y = 0
    for p in parts: out.alpha_composite(p, ((wmax - p.width) // 2, y)); y += p.height
    return _shadowed(out)

def _dashed_rr(d, box, r, color, width=5, dash=22, gap=14):
    x0, y0, x1, y1 = box
    # garis putus-putus pada 4 sisi (sudut dibulatkan diabaikan - cukup sebagai penanda 'isi sini')
    def seg(a, b, horiz, fixed):
        p = a
        while p < b:
            q = min(p + dash, b)
            d.line([(p, fixed), (q, fixed)] if horiz else [(fixed, p), (fixed, q)], fill=color, width=width); p += dash + gap
    seg(x0 + r, x1 - r, True, y0); seg(x0 + r, x1 - r, True, y1); seg(y0 + r, y1 - r, False, x0); seg(y0 + r, y1 - r, False, x1)

def pill(st, text, fill="biru", color="putih", size=62, placeholder=False, maxw=MAXW, font="sub"):
    f, sz = _fit(st.f["tebal"] if font == "tebal" else st.f[font], text, size, maxw - 110, .0)
    bb = f.getbbox(text); tw, th = bb[2] - bb[0], bb[3] - bb[1]
    padx, pady = 50, 26; w, h = tw + 2 * padx + 18, th + 2 * pady + 10
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, w - 1, h - 1), radius=h // 2, fill=st.col(fill) + (255,))
    d.rounded_rectangle((16, h // 2 - 9, 34, h // 2 + 9), radius=9, fill=st.col("kuning") + (255,))   # aksen kuning
    d.text((padx + 18 - bb[0], pady - bb[1] + 5), text, font=f, fill=st.col(color) + (255,))
    if placeholder: _dashed_rr(d, (5, 5, w - 6, h - 6), h // 2 - 5, (255, 255, 255, 255), 4)
    return _shadowed(im, 6, 6, .38)

def logo_box(st, size=300):
    im = Image.new("RGBA", (size, size), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, size - 1, size - 1), radius=56, fill=(255, 255, 255, 46))
    _dashed_rr(d, (6, 6, size - 7, size - 7), 50, (255, 255, 255, 255), 6, 26, 16)
    f1 = _font(st.f["tajuk"], 84); f2 = _font(st.f["sub"], 30)
    d.text((size / 2, size / 2 - 22), "[LOGO]", font=f1, fill=(255, 255, 255, 255), anchor="mm")
    d.text((size / 2, size / 2 + 56), "letak logo di sini", font=f2, fill=(255, 255, 255, 230), anchor="mm")
    return _shadowed(im, 6, 5, .3)

def build_sprite(st, el):
    k = el["kind"]
    if k == "stack":
        s = text_stack(st, el["lines"])
        if "pill" in el:
            p = el["pill"]; ps = pill(st, p["t"], p.get("fill", "biru"), p.get("color", "putih"), p.get("size", 70), font="tebal")
            out = Image.new("RGBA", (max(s.width, ps.width), s.height + ps.height - 10), (0, 0, 0, 0))
            out.alpha_composite(s, ((out.width - s.width) // 2, 0)); out.alpha_composite(ps, ((out.width - ps.width) // 2, s.height - 10))
            return out
        return s
    if k == "pill":
        return pill(st, el["t_text"], el.get("fill", "biru"), el.get("color", "putih"), el.get("size", 62), el.get("placeholder", False),
                    font="tebal" if el.get("size", 62) >= 70 else "sub")
    if k == "logo": return logo_box(st, el.get("size", 300))
    raise ValueError(k)

def _out_back(x, s=1.9):  # easeOutBack
    x = min(max(x, 0), 1) - 1; return 1 + (s + 1) * x ** 3 + s * x ** 2
def _out_cubic(x): x = min(max(x, 0), 1); return 1 - (1 - x) ** 3

def state(el, t):
    """(skala, alfa, offset_y) pada saat t; None jika tidak kelihatan"""
    t0, t1 = el["t"]
    if t < t0 or t > t1: return None
    anim = el.get("anim", "slide" if el["kind"] == "pill" else "pop")
    a_in = 0.14; a_out = 0.18; tin = t - t0
    alpha = min(1, tin / a_in) * min(1, (t1 - t) / a_out)
    if anim == "pop":
        s = .55 + .45 * _out_back(tin / .34); s *= 1 - .04 * (1 - min(1, (t1 - t) / a_out)); return s, alpha, 0
    return 1.0, alpha, int(46 * (1 - _out_cubic(tin / .32)))

class Compositor:
    def __init__(self, cfg):
        self.st = Style(cfg); self.els = cfg["texts"]; self.sprites = {}; self.cache = {}
        for el in self.els: self.sprites[el["id"]] = build_sprite(self.st, el)
    def _scaled(self, id_, s):
        key = (id_, round(s, 2))
        if key not in self.cache:
            sp = self.sprites[id_]
            self.cache[key] = sp if abs(s - 1) < .005 else sp.resize((max(2, int(sp.width * s)), max(2, int(sp.height * s))), Image.LANCZOS)
        return self.cache[key]
    def draw(self, frame, t):
        """frame: uint8 HxWx3 (diubah di tempat)"""
        for el in self.els:
            r = state(el, t)
            if r is None: continue
            s, a, dy = r; sp = self._scaled(el["id"], s)
            cx, cy = W // 2, el["y"] + dy
            x0, y0 = int(cx - sp.width / 2), int(cy - sp.height / 2)
            xa, ya, xb, yb = max(0, x0), max(0, y0), min(W, x0 + sp.width), min(H, y0 + sp.height)
            if xb <= xa or yb <= ya: continue
            arr = np.asarray(sp)[ya - y0:yb - y0, xa - x0:xb - x0].astype(np.float32)
            al = (arr[..., 3:4] / 255.0) * a
            reg = frame[ya:yb, xa:xb].astype(np.float32)
            frame[ya:yb, xa:xb] = (reg * (1 - al) + arr[..., :3] * al).astype(np.uint8)
        return frame
    def full_canvas(self, el):
        """PNG lutsinar 1080x1920 untuk satu elemen (keadaan stabil) - untuk CapCut"""
        sp = self.sprites[el["id"]]; canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        canvas.alpha_composite(sp, (int(W / 2 - sp.width / 2), int(el["y"] - sp.height / 2))); return canvas
