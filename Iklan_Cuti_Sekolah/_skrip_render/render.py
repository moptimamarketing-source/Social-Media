"""Render the school-holiday ad + CapCut kit.
Usage: render.py SRC_DIR WORK_DIR OUT_DIR"""
import os
import subprocess
import sys
import math
import numpy as np
import soundfile as sf
from PIL import Image, ImageFilter

sys.path.insert(0, os.path.dirname(__file__))
import layers as LY  # noqa: E402

SRC, WORK, OUT = sys.argv[1:4]
W, H, FPS = 1080, 1920, 30
SR = 48000
GRADE = "eq=contrast=1.07:saturation=1.18:gamma=0.98,colorbalance=rs=0.03:bs=-0.03:rm=0.02:bm=-0.02"

KIT = f"{OUT}/CapCut_Kit"
D_CLIP, D_TXT, D_AUD, D_ALT = (f"{KIT}/{d}" for d in
                               ("01_Klip_Video", "02_Teks_PNG", "03_Audio", "04_Take_Alternatif"))
for d in (WORK, D_CLIP, D_TXT, D_AUD, D_ALT):
    os.makedirs(d, exist_ok=True)

# name, source, in, out, zoom start, zoom end, focus (x, y as fraction)
SEGS = [
    ("01_Hook_Intai_Tiang", "C7016", 0.00, 5.76, 1.00, 1.06, (0.5, 0.35)),
    ("02_Ayat1_Pengenalan", "C6963", 23.05, 31.10, 1.00, 1.08, (0.5, 0.38)),
    ("03_Ayat2_CloseUp", "C6963", 91.15, 96.75, 1.30, 1.36, (0.5, 0.36)),
    ("04_Taman_Permainan", "C6986", 3.40, 11.85, 1.06, 1.00, (0.5, 0.55)),
    ("05_Babak_Jalan_PeaceSign", "C6970", 0.00, 11.75, 1.00, 1.05, (0.5, 0.40)),
]
END_DUR = 3.5

ALTS = [
    ("Ayat1_TakeA_C6963", "C6963", 1.30, 8.05),
    ("Ayat2_TakeC_C6963_dgn_sambungan", "C6963", 44.85, 58.15),
    ("Ayat2_TakeG_C6963", "C6963", 81.25, 85.85),
    ("Babak_Jalan_TakeLain_C6967", "C6967", 0.00, 13.00),
    ("Hook_Intai_Lubang_C7014", "C7014", 2.70, 6.30),
]


def nframes(d):
    return int(round(d * FPS))


def ease_out_cubic(p):
    return 1 - (1 - p) ** 3


def ease_out_back(p, s=1.9):
    p -= 1
    return 1 + (s + 1) * p ** 3 + s * p ** 2


def decoder(src, t_in, dur, vf_extra=""):
    vf = f"scale={W}:{H},fps={FPS},{GRADE}" + (f",{vf_extra}" if vf_extra else "")
    cmd = ["ffmpeg", "-v", "error", "-ss", f"{t_in:.3f}", "-t", f"{dur:.3f}", "-i", src,
           "-vf", vf, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"]
    return subprocess.Popen(cmd, stdout=subprocess.PIPE)


def encoder(path, audio=None, crf=19):
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
           "-r", str(FPS), "-i", "-"]
    if audio:
        cmd += ["-i", audio, "-c:a", "aac", "-b:a", "192k", "-shortest"]
    cmd += ["-c:v", "libx264", "-preset", "medium", "-crf", str(crf), "-pix_fmt", "yuv420p",
            "-movflags", "+faststart", path]
    return subprocess.Popen(cmd, stdin=subprocess.PIPE)


def zoom_frame(img, z, focus):
    bw, bh = W / z, H / z
    cx = min(max(focus[0] * W, bw / 2), W - bw / 2)
    cy = min(max(focus[1] * H, bh / 2), H - bh / 2)
    return img.resize((W, H), Image.BICUBIC, box=(cx - bw / 2, cy - bh / 2, cx + bw / 2, cy + bh / 2))


def extract_audio(src, t_in, dur, path):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t_in:.3f}", "-t", f"{dur:.3f}", "-i", src,
                    "-vn", "-ac", "1", "-ar", str(SR),
                    "-af", f"afade=t=in:d=0.02,afade=t=out:st={dur - 0.03:.3f}:d=0.03", path], check=True)


VOICE_FX = ("highpass=f=90,afftdn=nf=-28:nr=10,equalizer=f=3000:t=q:w=1.2:g=2,"
            "acompressor=threshold=-20dB:ratio=3:attack=10:release=150")


def render_clips():
    """Graded + slow-zoom clips, each with cleaned audio (CapCut kit)."""
    for name, src, a, b, z0, z1, foc in SEGS:
        dur = b - a
        n = nframes(dur)
        wav = f"{WORK}/{name}.wav"
        extract_audio(f"{SRC}/{src}.MP4", a, dur, wav)
        clean = f"{WORK}/{name}_clean.wav"
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", wav, "-af", VOICE_FX + ",loudnorm=I=-16:TP=-1.5",
                        "-ar", str(SR), clean], check=True)
        dec = decoder(f"{SRC}/{src}.MP4", a, dur + 0.2)
        enc = encoder(f"{D_CLIP}/{name}.mp4", audio=clean)
        last = None
        for i in range(n):
            buf = dec.stdout.read(W * H * 3)
            if len(buf) < W * H * 3:
                buf = last  # pad with the last frame if the source runs short
            last = buf
            p = i / max(1, n - 1)
            z = z0 + (z1 - z0) * (p * p * (3 - 2 * p))
            im = zoom_frame(Image.frombuffer("RGB", (W, H), buf), z, foc)
            enc.stdin.write(im.tobytes())
        dec.stdout.close()
        dec.wait()
        enc.stdin.close()
        enc.wait()
        Image.frombuffer("RGB", (W, H), last).save(f"{WORK}/{name}_last.png") if last else None
        im.save(f"{WORK}/{name}_lastz.png")
        print("clip", name, n, "frames")


def endcard_bg(i, n, base):
    p = i / max(1, n - 1)
    return zoom_frame(base, 1.0 + 0.05 * p, (0.5, 0.45))


def make_endcard_base():
    im = Image.open(f"{WORK}/{SEGS[-1][0]}_lastz.png").convert("RGB")
    im = im.filter(ImageFilter.GaussianBlur(28))
    im = Image.blend(im, Image.new("RGB", im.size, LY.NAVY), 0.64)
    return im


def render_alts():
    for name, src, a, b in ALTS:
        dur = b - a
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{a:.3f}", "-t", f"{dur:.3f}",
                        "-i", f"{SRC}/{src}.MP4", "-vf", f"scale={W}:{H},fps={FPS},{GRADE}",
                        "-af", VOICE_FX + ",loudnorm=I=-16:TP=-1.5", "-ar", str(SR),
                        "-c:v", "libx264", "-crf", "21", "-preset", "medium", "-pix_fmt", "yuv420p",
                        "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart",
                        f"{D_ALT}/{name}.mp4"], check=True)
        print("alt", name)


# ---------------- timeline ----------------
def timeline():
    starts, t = [], 0.0
    for s in SEGS:
        starts.append(t)
        t += nframes(s[3] - s[2]) / FPS
    return starts, t, t + END_DUR


def layer_plan(starts, end_start, total):
    s = starts
    return [
        # name, in, out, anim
        ("hook_pill", 0.15, s[1] - 0.25, "slide"),
        ("hook_t1", 0.35, s[1] - 0.25, "pop"),
        ("hook_t2", 0.60, s[1] - 0.25, "pop"),
        ("tag", s[1] + 0.15, end_start - 0.1, "slideL"),
        ("chip1", s[1] + 0.6, s[2] - 0.2, "slideL"),
        ("chip2", s[2] + 0.3, s[3] - 0.2, "slideL"),
        ("chip3", s[3] + 0.4, s[4] - 0.2, "slideL"),
        ("cta_pill", s[4] + 9.7, end_start - 0.05, "pop"),
        ("end_small", end_start + 0.15, total + 1, "slide"),
        ("end_t1", end_start + 0.30, total + 1, "pop"),
        ("end_t2", end_start + 0.50, total + 1, "pop"),
        ("end_sub", end_start + 0.75, total + 1, "slide"),
        ("end_arrow", end_start + 0.95, total + 1, "bob"),
    ]


def anim_state(kind, t, t_in, t_out):
    """Return (opacity, scale, dx, dy) or None if not visible."""
    if t < t_in or t > t_out:
        return None
    ain, aout = 0.38, 0.22
    pin = min(1.0, (t - t_in) / ain)
    pout = min(1.0, max(0.0, (t_out - t) / aout))
    op = min(1.0, (t - t_in) / 0.16) * pout
    sc, dx, dy = 1.0, 0.0, 0.0
    if kind in ("pop", "bob"):
        sc = 0.55 + 0.45 * ease_out_back(pin)
        sc *= 0.92 + 0.08 * pout
        if kind == "bob" and pin >= 1:
            dy = 10 * math.sin((t - t_in - ain) * 2 * math.pi * 1.2)
    elif kind == "slide":
        dy = -50 * (1 - ease_out_cubic(pin))
    elif kind == "slideL":
        dx = -90 * (1 - ease_out_cubic(pin)) - 40 * (1 - pout)
    return op, sc, dx, dy


def composite(frame, L, plan, t):
    frame = frame.convert("RGBA")
    for name, a, b, kind in plan:
        st = anim_state(kind, t, a, b)
        if not st:
            continue
        op, sc, dx, dy = st
        img, (x, y) = L[name]
        if abs(sc - 1) > 1e-3:
            nw, nh = max(1, int(img.width * sc)), max(1, int(img.height * sc))
            im2 = img.resize((nw, nh), Image.BICUBIC)
            x, y = x + (img.width - nw) / 2, y + (img.height - nh) / 2
        else:
            im2 = img
        if op < 0.999:
            a_ch = im2.split()[3].point(lambda v, o=op: int(v * o))
            im2 = im2.copy()
            im2.putalpha(a_ch)
        layer = Image.new("RGBA", frame.size, (0, 0, 0, 0))
        layer.paste(im2, (int(round(x + dx)), int(round(y + dy))), im2)
        frame = Image.alpha_composite(frame, layer)
    return frame.convert("RGB")


def render_final(audio_path, out_path, with_text=True):
    starts, end_start, total = timeline()
    L = LY.build()
    plan = layer_plan(starts, end_start, total) if with_text else []
    enc = encoder(out_path, audio=audio_path, crf=18)
    fi = 0
    for k, s in enumerate(SEGS):
        dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", f"{D_CLIP}/{s[0]}.mp4", "-f", "rawvideo",
                                "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
        n = nframes(s[3] - s[2])
        last = None
        for i in range(n):
            buf = dec.stdout.read(W * H * 3)
            if len(buf) < W * H * 3:
                buf = last
            last = buf
            im = Image.frombuffer("RGB", (W, H), buf)
            if k > 0 and i < 7:  # punch-in on each cut
                p = i / 7
                im = zoom_frame(im, 1 + 0.08 * (1 - ease_out_cubic(p)), (0.5, 0.45))
            enc.stdin.write(composite(im, L, plan, fi / FPS).tobytes())
            fi += 1
        dec.stdout.close()
        dec.wait()
    base = make_endcard_base()
    n = nframes(END_DUR)
    for i in range(n):
        im = endcard_bg(i, n, base)
        if i < 6:  # quick fade from the last shot into the card
            prev = Image.open(f"{WORK}/{SEGS[-1][0]}_lastz.png").convert("RGB")
            im = Image.blend(prev, im, (i + 1) / 6)
        enc.stdin.write(composite(im, L, plan, fi / FPS).tobytes())
        fi += 1
    enc.stdin.close()
    enc.wait()
    return fi


def render_endcard_bg_clip():
    base = make_endcard_base()
    n = nframes(END_DUR)
    enc = encoder(f"{D_CLIP}/06_EndCard_Background.mp4")
    for i in range(n):
        enc.stdin.write(endcard_bg(i, n, base).tobytes())
    enc.stdin.close()
    enc.wait()


def build_audio():
    starts, end_start, total = timeline()
    # voice: concat cleaned clips + silence for the end card
    parts = []
    for s in SEGS:
        y, _ = sf.read(f"{WORK}/{s[0]}_clean.wav")
        n = nframes(s[3] - s[2]) * SR // FPS
        y = np.pad(y, (0, max(0, n - len(y))))[:n]
        parts.append(y)
    parts.append(np.zeros(int(END_DUR * SR)))
    voice = np.concatenate(parts)
    sf.write(f"{D_AUD}/suara_penuh.wav", voice, SR, subtype="PCM_16")
    subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), "music.py"), D_AUD, f"{total:.3f}"],
                   check=True)
    wh, _ = sf.read(f"{D_AUD}/sfx_whoosh.wav")
    po, _ = sf.read(f"{D_AUD}/sfx_pop.wav")
    sfx = np.zeros((len(voice) + SR, 2))

    def put(sig, t, g):
        i = int(t * SR)
        sfx[i:i + len(sig)] += sig[: len(sfx) - i] * g

    for t in starts[1:] + [end_start]:
        put(wh, t - 0.22, 0.55)
    plan = layer_plan(starts, end_start, total)
    for name, a, _, kind in plan:
        if kind in ("pop", "bob") or name.startswith("chip") or name == "hook_pill":
            put(po, a, 0.35)
    sfx = sfx[: len(voice)]
    sf.write(f"{WORK}/sfx_track.wav", sfx, SR, subtype="PCM_16")
    mix = f"{WORK}/mix.wav"
    subprocess.run([
        "ffmpeg", "-v", "error", "-y", "-i", f"{D_AUD}/suara_penuh.wav", "-i", f"{D_AUD}/muzik_latar.wav",
        "-i", f"{WORK}/sfx_track.wav", "-filter_complex",
        "[0:a]aformat=channel_layouts=stereo,asplit=2[v][sc];"
        "[1:a]volume=0.30[m];"
        "[m][sc]sidechaincompress=threshold=0.025:ratio=5:attack=25:release=450:makeup=1[md];"
        "[v][md][2:a]amix=inputs=3:normalize=0:duration=first,loudnorm=I=-14:TP=-1.2:LRA=10[out]",
        "-map", "[out]", "-ar", str(SR), mix], check=True)
    return mix, total


def export_text_pngs():
    L = LY.build()
    names = {"hook_pill": "01a_hook_pill", "hook_t1": "01b_hook_PROGRAM", "hook_t2": "01c_hook_CUTI_SEKOLAH",
             "tag": "00_tag_sudut_atas", "chip1": "02_chip_aktiviti_bermakna", "chip2": "03_chip_seronok_belajar",
             "chip3": "04_chip_main_explore", "cta_pill": "05_JOM_DAFTAR", "end_small": "06a_end_pill",
             "end_t1": "06b_end_DAFTAR", "end_t2": "06c_end_SEKARANG", "end_sub": "06d_end_whatsapp",
             "end_arrow": "06e_end_anak_panah"}
    for k, (img, pos) in L.items():
        c = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        c.alpha_composite(img, (max(int(pos[0]), 0), max(int(pos[1]), 0)))
        c.save(f"{D_TXT}/{names[k]}.png")


if __name__ == "__main__":
    stage = sys.argv[4] if len(sys.argv) > 4 else "all"
    if stage in ("all", "clips"):
        render_clips()
        render_endcard_bg_clip()
    if stage in ("all", "alts"):
        render_alts()
    if stage in ("all", "final"):
        export_text_pngs()
        mix, total = build_audio()
        n = render_final(mix, f"{OUT}/Iklan_Program_Cuti_Sekolah_FINAL.mp4")
        render_final(mix, f"{OUT}/Iklan_Program_Cuti_Sekolah_TANPA_TEKS.mp4", with_text=False)
        print("final frames", n, "total", total)
