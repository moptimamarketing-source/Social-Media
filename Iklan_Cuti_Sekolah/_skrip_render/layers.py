"""Text/graphic layers for the school-holiday ad. Each layer is an RGBA image
plus a canvas position; animation is applied at composite time."""
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1080, 1920
FD = "/usr/share/fonts/opentype/inter/"
NAVY = (22, 32, 91)
RED = (227, 38, 46)
YELLOW = (255, 199, 39)
WHITE = (255, 255, 255)


def font(weight, size):
    return ImageFont.truetype(f"{FD}InterDisplay-{weight}.otf", size)


def shadowed(img, radius=14, offset=(0, 8), alpha=110):
    """Return img with a soft drop shadow, padded so nothing clips."""
    pad = radius * 3
    out = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
    sh = Image.new("RGBA", out.size, (0, 0, 0, 0))
    a = img.split()[3].point(lambda v: v * alpha // 255)
    blk = Image.new("RGBA", img.size, (0, 0, 0, 255))
    blk.putalpha(a)
    sh.paste(blk, (pad + offset[0], pad + offset[1]), blk)
    sh = sh.filter(ImageFilter.GaussianBlur(radius))
    out.alpha_composite(sh)
    out.alpha_composite(img, (pad, pad))
    return out, pad


def text_box(text, fnt, fg, bg, padx=34, pady=18, radius=22, tracking=0):
    d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    l, t, r, b = d.textbbox((0, 0), text, font=fnt)
    tw = r - l + tracking * (len(text) - 1)
    # size the box to the cap height + descenders so ink is centred and never clipped
    _, ct, _, cb = d.textbbox((0, 0), "H", font=fnt)
    top = min(t, ct)
    bot = max(b, cb)
    th = bot - top
    img = Image.new("RGBA", (tw + padx * 2, th + pady * 2), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    if bg:
        dr.rounded_rectangle([0, 0, img.width - 1, img.height - 1], radius, fill=bg)
    x, y = padx - l, pady - top
    if tracking:
        for ch in text:
            dr.text((x, y), ch, font=fnt, fill=fg)
            x += dr.textlength(ch, font=fnt) + tracking
    else:
        dr.text((x, y), text, font=fnt, fill=fg)
    return img


def chip(text, accent=RED, bg=NAVY, fg=WHITE, size=46):
    """Navy pill with a coloured dot/check on the left."""
    fnt = font("ExtraBold", size)
    body = text_box(text, fnt, fg, None, padx=0, pady=0)
    h = body.height + 40
    ic = h - 22
    w = 22 + ic + 20 + body.width + 38
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    dr.rounded_rectangle([0, 0, w - 1, h - 1], h // 2, fill=bg)
    cx0, cy0 = 11, 11
    dr.ellipse([cx0, cy0, cx0 + ic, cy0 + ic], fill=accent)
    # check mark
    s = ic
    pts = [(cx0 + s * 0.27, cy0 + s * 0.52), (cx0 + s * 0.44, cy0 + s * 0.68), (cx0 + s * 0.74, cy0 + s * 0.34)]
    dr.line(pts, fill=WHITE, width=max(4, s // 9), joint="curve")
    img.alpha_composite(body, (22 + ic + 20, 20))
    return img


def build():
    """Return dict name -> (RGBA image, (x, y) top-left on canvas incl. shadow pad)."""
    L = {}

    def place(name, img, cx=None, x=None, y=0, shadow=True):
        if shadow:
            img, pad = shadowed(img)
        else:
            pad = 0
        if cx is not None:
            x = int(cx - img.width / 2)
        else:
            x = x - pad
        L[name] = (img, (x, y - pad))

    # --- Hook block (lower-middle, clear of the face) ---
    hy = 1130
    place("hook_pill", text_box("CUTI SEKOLAH DAH DEKAT!", font("ExtraBold", 44), NAVY, YELLOW,
                                padx=30, pady=14, radius=40, tracking=1), cx=W / 2, y=hy)
    place("hook_t1", text_box("PROGRAM", font("Black", 132), WHITE, NAVY, padx=40, pady=14, radius=26),
          cx=W / 2, y=hy + 100)
    place("hook_t2", text_box("CUTI SEKOLAH", font("Black", 112), WHITE, RED, padx=36, pady=14, radius=26),
          cx=W / 2, y=hy + 270)

    # --- Persistent corner tag ---
    place("tag", text_box("PROGRAM CUTI SEKOLAH", font("ExtraBold", 34), WHITE, RED,
                          padx=24, pady=12, radius=30, tracking=1), x=60, y=170, shadow=True)

    # --- Topic chips (top area, under the tag) ---
    cy = 262
    place("chip1", chip("Isi cuti anak dengan aktiviti bermakna", size=41), x=60, y=cy)
    place("chip2", chip("Seronok  •  Belajar  •  Berkawan", accent=YELLOW, size=44), x=60, y=cy)
    place("chip3", chip("Main & explore sepuas hati!", size=44), x=60, y=cy)

    # --- CTA on the peace-sign beat ---
    place("cta_pill", text_box("JOM DAFTAR!", font("Black", 96), NAVY, YELLOW, padx=42, pady=16, radius=30),
          cx=W / 2, y=1180)

    # --- End card ---
    place("end_small", text_box("PROGRAM CUTI SEKOLAH", font("ExtraBold", 40), NAVY, YELLOW,
                                padx=28, pady=12, radius=36, tracking=1), cx=W / 2, y=640)
    place("end_t1", text_box("DAFTAR", font("Black", 170), WHITE, None, padx=10, pady=0), cx=W / 2, y=740)
    place("end_t2", text_box("SEKARANG!", font("Black", 150), WHITE, RED, padx=40, pady=12, radius=30),
          cx=W / 2, y=930)
    place("end_sub", text_box("WhatsApp kami untuk maklumat lanjut", font("SemiBold", 44), WHITE, None,
                              padx=0, pady=0), cx=W / 2, y=1170)
    place("end_arrow", arrow(), cx=W / 2, y=1260)
    return L


def arrow():
    img = Image.new("RGBA", (120, 120), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.ellipse([0, 0, 119, 119], fill=YELLOW)
    d.line([(60, 30), (60, 86)], fill=NAVY, width=12)
    d.line([(36, 64), (60, 88), (84, 64)], fill=NAVY, width=12, joint="curve")
    return img


if __name__ == "__main__":
    import sys
    L = build()
    out = sys.argv[1]
    for k, (img, pos) in L.items():
        c = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        c.alpha_composite(img, (max(pos[0], 0), max(pos[1], 0)))
        c.save(f"{out}/{k}.png")
    print(list(L))
