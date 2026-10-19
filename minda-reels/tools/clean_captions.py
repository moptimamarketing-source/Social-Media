"""Remove the burned-in yellow captions from the source edit so new subtitles
can be laid on top. Inpaints only thin yellow/blue text strokes inside the
caption band, leaving faces and props untouched.

usage: python3 -I tools/clean_captions.py public/source.mp4 public/clean.mp4
"""
import subprocess, sys
import cv2
import numpy as np

SRC, DST = sys.argv[1], sys.argv[2]
W, H, FPS = 1080, 1920, 30

# (start_s, end_s, y0, y1, skit) -- skit captions are bolder, blue-shadowed
BANDS = [
    (0.0, 24.40, 1360, 1800, True),    # skit: captions sit on the table
    (24.40, 34.20, 1490, 1720, False), # host + b-roll captions
    (34.20, 99.0, 1490, 1720, False),  # CTA line under like & komen card
]

def band_for(t):
    for b in BANDS:
        if b[0] <= t < b[1]:
            return b
    return None

def text_mask(roi, skit):
    hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    if skit:
        m = ((h >= 20) & (h <= 40) & (s > 130) & (v > 150))
        m |= ((h >= 100) & (h <= 130) & (s > 150) & (v > 60))
    else:
        # dark desk background: also catch captions while they fade in
        m = ((h >= 20) & (h <= 40) & (s > 60) & (v > 70))
    m = m.astype(np.uint8) * 255
    # drop big solid blobs (cushions, lamp, book covers): keep strokes
    k = 41 if skit else 19
    big = cv2.morphologyEx(m, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
    m = cv2.subtract(m, big)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8))
    # grow to swallow the dark outline + drop shadow
    m = cv2.dilate(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (15, 15)))
    return m

dec = subprocess.Popen(["ffmpeg", "-v", "error", "-i", SRC, "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
                       stdout=subprocess.PIPE)
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24",
                        "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", SRC,
                        "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "12", "-preset", "medium",
                        "-pix_fmt", "yuv420p", "-c:a", "copy", DST], stdin=subprocess.PIPE)
n = 0
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3:
        break
    f = np.frombuffer(buf, np.uint8).reshape(H, W, 3).copy()
    b = band_for(n / FPS)
    if b:
        _, _, y0, y1, skit = b
        roi = f[y0:y1]
        m = text_mask(roi, skit)
        if m.any():
            f[y0:y1] = cv2.inpaint(roi, m, 7, cv2.INPAINT_TELEA)
    enc.stdin.write(f.tobytes())
    n += 1
enc.stdin.close(); enc.wait()
print("frames", n)
