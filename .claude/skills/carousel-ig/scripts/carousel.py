#!/usr/bin/env python3
"""carousel — render slide carousel Instagram/Facebook/LinkedIn daripada fail JSON.

Guna:  python3 carousel.py slides.json outdir/ [--ratio 4:5|1:1|9:16]

Format slides.json:
{
  "brand": {"name": "Minda Optima", "handle": "@mindaoptima",
            "bg": "#FFF8EC", "fg": "#1F2937", "accent": "#E85D04",
            "logo": "logo.png"},          # semua pilihan
  "slides": [
    {"type": "cover", "title": "3 tanda anak perlukan cara membaca lain", "kicker": "Untuk ibu bapa"},
    {"type": "point", "num": 1, "title": "Dia eja, tapi tak dapat sebut", "body": "Ayat penerangan pendek..."},
    {"type": "quote", "body": "Ayat petikan", "by": "Puan A, ibu kepada anak 6 tahun"},
    {"type": "cta", "title": "Nak tahu tahap bacaan anak?", "body": "Assessment di link bio"}
  ]
}
Output: 01.png, 02.png ... (1080 lebar) + preview.png (semua slide sebaris).
"""
import argparse
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

RATIOS = {"4:5": (1080, 1350), "1:1": (1080, 1080), "9:16": (1080, 1920)}
BOLD = ["/usr/share/fonts/opentype/inter/Inter-Bold.otf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/Library/Fonts/Arial Bold.ttf", "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "C:/Windows/Fonts/arialbd.ttf"]
REG = ["/usr/share/fonts/opentype/inter/Inter-Regular.otf",
       "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
       "/Library/Fonts/Arial.ttf", "/System/Library/Fonts/Supplemental/Arial.ttf",
       "C:/Windows/Fonts/arial.ttf"]


def font(cands, size, override=None):
    for f in ([override] if override else []) + cands:
        if f and os.path.exists(f):
            return ImageFont.truetype(f, size)
    return ImageFont.load_default(size)


def wrap(draw, text, fnt, width):
    lines = []
    for para in str(text).split("\n"):
        cur = ""
        for word in para.split():
            test = f"{cur} {word}".strip()
            if draw.textlength(test, font=fnt) <= width:
                cur = test
            else:
                if cur:
                    lines.append(cur)
                cur = word
        lines.append(cur)
    return lines


def fit(draw, text, cands, width, max_h, start, minimum, override=None):
    """Kecilkan font sampai teks muat dalam kotak."""
    size = start
    while size >= minimum:
        f = font(cands, size, override)
        lines = wrap(draw, text, f, width)
        lh = int(size * 1.2)
        if lh * len(lines) <= max_h:
            return f, lines, lh
        size -= 4
    f = font(cands, minimum, override)
    return f, wrap(draw, text, f, width), int(minimum * 1.2)


def block(draw, x, y, lines, fnt, lh, fill):
    for ln in lines:
        draw.text((x, y), ln, font=fnt, fill=fill)
        y += lh
    return y


def render(slide, idx, total, brand, W, H, fonts):
    bg, fg, ac = brand.get("bg", "#FFF8EC"), brand.get("fg", "#1F2937"), brand.get("accent", "#E85D04")
    kind = slide.get("type", "point")
    if kind in ("cover", "cta"):
        bg, fg = ac, brand.get("on_accent", "#FFFFFF")
    img = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(img)
    M = 96
    inner = W - 2 * M
    fb, fr = fonts

    # kepala: handle + nombor slide
    small = font(REG, 30, fr)
    d.text((M, 64), brand.get("handle", brand.get("name", "")), font=small, fill=fg)
    pg = f"{idx}/{total}"
    d.text((W - M - d.textlength(pg, font=small), 64), pg, font=small, fill=fg)

    top, bottom = 200, H - 200
    y = top
    if kind == "cover":
        if slide.get("kicker"):
            k = font(BOLD, 36, fb)
            d.text((M, y), slide["kicker"].upper(), font=k, fill=fg)
            y += 90
        f, lines, lh = fit(d, slide.get("title", ""), BOLD, inner, bottom - y - 120, 112, 56, fb)
        y = block(d, M, y, lines, f, lh, fg)
        hint = font(BOLD, 34, fb)
        d.text((M, H - 150), "Swipe  →", font=hint, fill=fg)
    elif kind == "point":
        if slide.get("num") is not None:
            nf = font(BOLD, 150, fb)
            d.text((M, y - 20), str(slide["num"]), font=nf, fill=ac)
            y += 190
        f, lines, lh = fit(d, slide.get("title", ""), BOLD, inner, 330, 76, 44, fb)
        y = block(d, M, y, lines, f, lh, fg) + 40
        d.rectangle([M, y, M + 120, y + 8], fill=ac)
        y += 60
        if slide.get("body"):
            f2, l2, lh2 = fit(d, slide["body"], REG, inner, bottom - y, 46, 30, fr)
            block(d, M, y, l2, f2, lh2, fg)
    elif kind == "quote":
        qf = font(BOLD, 220, fb)
        d.text((M - 10, y - 80), "“", font=qf, fill=ac)
        y += 140
        f, lines, lh = fit(d, slide.get("body", ""), BOLD, inner, bottom - y - 120, 64, 36, fb)
        y = block(d, M, y, lines, f, lh, fg) + 40
        if slide.get("by"):
            d.text((M, y), "— " + slide["by"], font=font(REG, 34, fr), fill=fg)
    elif kind == "cta":
        y = int(H * 0.30)
        f, lines, lh = fit(d, slide.get("title", ""), BOLD, inner, int(H * 0.3), 92, 52, fb)
        y = block(d, M, y, lines, f, lh, fg) + 50
        if slide.get("body"):
            f2, l2, lh2 = fit(d, slide["body"], REG, inner, bottom - y, 48, 30, fr)
            block(d, M, y, l2, f2, lh2, fg)

    logo = brand.get("logo")
    if logo and os.path.exists(logo):
        lg = Image.open(logo).convert("RGBA")
        lw = int(W * 0.16)
        lg = lg.resize((lw, int(lg.height * lw / lg.width)))
        img.paste(lg, (W - M - lw, H - 90 - lg.height), lg)
    elif brand.get("name"):
        nf = font(BOLD, 30, fb)
        d.text((W - M - d.textlength(brand["name"], font=nf), H - 110), brand["name"], font=nf, fill=fg)
    return img


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("spec"); p.add_argument("outdir")
    p.add_argument("--ratio", choices=RATIOS, default="4:5")
    p.add_argument("--font-bold"); p.add_argument("--font-regular")
    a = p.parse_args()
    with open(a.spec, encoding="utf-8") as fh:
        spec = json.load(fh)
    slides = spec.get("slides") or sys.exit("RALAT: tiada 'slides' dalam JSON")
    if len(slides) > 20:
        sys.exit("RALAT: maksimum 20 slide (had Instagram)")
    W, H = RATIOS[a.ratio]
    os.makedirs(a.outdir, exist_ok=True)
    imgs = []
    for i, s in enumerate(slides, 1):
        im = render(s, i, len(slides), spec.get("brand", {}), W, H, (a.font_bold, a.font_regular))
        path = os.path.join(a.outdir, f"{i:02d}.png")
        im.save(path)
        imgs.append(im)
        print(f"SIAP: {path}")
    th = [im.resize((W // 4, H // 4)) for im in imgs]
    prev = Image.new("RGB", (sum(t.width for t in th) + 10 * (len(th) - 1), th[0].height), "#999999")
    x = 0
    for t in th:
        prev.paste(t, (x, 0)); x += t.width + 10
    prev.save(os.path.join(a.outdir, "preview.png"))
    print(f"SIAP: {os.path.join(a.outdir, 'preview.png')} (semua slide sebaris untuk semakan)")


if __name__ == "__main__":
    main()
