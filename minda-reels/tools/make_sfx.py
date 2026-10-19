"""Synthesize the small UI sound effects used in the edit (no external assets).

usage: python3 -I tools/make_sfx.py public/sfx
"""
import os, sys, wave
import numpy as np

SR = 48000
OUT = sys.argv[1] if len(sys.argv) > 1 else "public/sfx"
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def env(n, attack=0.004, release=0.08):
    t = np.arange(n) / SR
    a = np.clip(t / attack, 0, 1)
    r = np.exp(-t / release)
    return a * r


def save(name, x, gain=0.8):
    x = x / (np.max(np.abs(x)) + 1e-9) * gain
    st = np.stack([x, x], axis=1)
    pcm = (st * 32767).astype(np.int16)
    with wave.open(os.path.join(OUT, name + ".wav"), "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def sweep(f0, f1, dur):
    n = int(SR * dur)
    f = np.geomspace(f0, f1, n)
    return np.sin(2 * np.pi * np.cumsum(f) / SR), n


def lowpass(x, k):
    return np.convolve(x, np.ones(k) / k, mode="same")


# pop: short bubbly pitch-up blip
s, n = sweep(380, 900, 0.09)
save("pop", s * env(n, 0.002, 0.03))

# soft pop for subtitles keywords / chips (very quiet in mix)
s, n = sweep(700, 1100, 0.05)
save("tick", s * env(n, 0.001, 0.015), 0.6)

# whoosh: band-limited noise with rising/falling swell
n = int(SR * 0.32)
noise = rng.standard_normal(n)
t = np.linspace(0, 1, n)
swell = np.sin(np.pi * t) ** 2
w = lowpass(noise, 9) - lowpass(noise, 60)
save("whoosh", w * swell)

# swipe: shorter, brighter whoosh for text sliding in
n = int(SR * 0.16)
noise = rng.standard_normal(n)
t = np.linspace(0, 1, n)
w = noise - lowpass(noise, 6)
save("swipe", w * np.sin(np.pi * t) ** 3, 0.6)

# boing: comic spring for the NEGO hook
n = int(SR * 0.45)
t = np.arange(n) / SR
f = 260 + 120 * np.sin(2 * np.pi * 14 * t) * np.exp(-t * 6)
s = np.sin(2 * np.pi * np.cumsum(f) / SR)
save("boing", s * env(n, 0.003, 0.18), 0.7)

# ding: bright two-partial chime for +1 confidence / CTA
n = int(SR * 0.7)
t = np.arange(n) / SR
s = np.sin(2 * np.pi * 1318 * t) + 0.5 * np.sin(2 * np.pi * 1975 * t) + 0.25 * np.sin(2 * np.pi * 2637 * t)
save("ding", s * env(n, 0.002, 0.22), 0.6)

# scribble: pencil-ish scratch for underlines / handwriting
n = int(SR * 0.28)
noise = rng.standard_normal(n)
t = np.arange(n) / SR
grain = 0.6 + 0.4 * np.sign(np.sin(2 * np.pi * 22 * t))
w = noise - lowpass(noise, 4)
save("scribble", w * grain * np.sin(np.pi * t / t[-1]), 0.4)

# tick-tock for the 5 minit timer
n = int(SR * 0.6)
s = np.zeros(n)
for i, start in enumerate([0.0, 0.3]):
    k = int(start * SR)
    m = int(0.03 * SR)
    tt = np.arange(m) / SR
    s[k:k + m] += np.sin(2 * np.pi * (2400 if i == 0 else 1800) * tt) * np.exp(-tt * 180)
save("clock", s, 0.5)

print("sfx written to", OUT)
