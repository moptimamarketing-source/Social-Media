"""Crop pintar + ukur goyangan: kesan muka (OpenCV Haar) & jitter kamera bagi setiap shot.
Tulis analysis/focus.json  {id: {focus:[cx,cy], faces:n, jitter_px:x}}"""
import json, os, subprocess, numpy as np, cv2
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(f"{ROOT}/edit_config.json"))
casc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
def frames_gray(src, ss, dur, fps, w=270, h=480):
    cmd = ["ffmpeg","-v","error","-ss",str(ss),"-t",str(dur),"-i",src,"-vf",f"fps={fps},scale={w}:{h}","-f","rawvideo","-pix_fmt","gray","-"]
    raw = subprocess.run(cmd, capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, h, w)
out = {}
for s in cfg["shots"]:
    if "freeze_at" in s: continue
    src = f"{ROOT}/raw/{s['clip']}.MP4"
    g = frames_gray(src, s["ss"], s["dur"], 25)
    # muka: 5 bingkai sepanjang shot, resolusi 540x960 supaya Haar stabil
    big = frames_gray(src, s["ss"], s["dur"], 2, 540, 960)
    cs = []
    for f in big:
        r = casc.detectMultiScale(f, 1.1, 5, minSize=(40, 40))
        if len(r):
            x, y, w, h = max(r, key=lambda b: b[2]*b[3]); cs.append(((x+w/2)/540, (y+h/2)/960, w/540))
    focus = [round(float(np.median([c[0] for c in cs])),3), round(float(np.median([c[1] for c in cs])),3)] if cs else None
    # jitter: translasi global antara bingkai berturutan, tolak trend (purata bergerak 7 bingkai)
    sh = []
    win = cv2.createHanningWindow((270, 480), cv2.CV_32F)
    for a, b in zip(g[:-1], g[1:]):
        (dx, dy), _ = cv2.phaseCorrelate(a.astype(np.float32), b.astype(np.float32), win); sh.append((dx, dy))
    sh = np.array(sh) if len(sh) else np.zeros((1, 2))
    pos = np.cumsum(sh, 0); k = 7
    trend = np.stack([np.convolve(pos[:, i], np.ones(k)/k, mode="same") for i in range(2)], 1)
    jit = float(np.sqrt(np.mean((pos - trend)[k:-k] ** 2))) if len(pos) > 2*k else 0.0
    out[s["id"]] = {"clip": s["clip"], "focus": focus, "faces_detected": len(cs), "frames_checked": len(big), "jitter_px": round(jit, 2)}
    print(s["id"], s["clip"], out[s["id"]])
json.dump(out, open(f"{ROOT}/analysis/focus.json", "w"), indent=1)
