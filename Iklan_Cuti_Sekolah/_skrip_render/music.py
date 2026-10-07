"""Procedural, royalty-free upbeat background track + SFX (whoosh, pop).
Usage: music.py OUT_DIR TOTAL_SECONDS"""
import sys
import numpy as np
from scipy.signal import lfilter, butter, sosfilt
import soundfile as sf

SR = 48000
BPM = 104
BEAT = 60 / BPM
rng = np.random.default_rng(7)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def pluck(freq, dur, amp=0.3, bright=0.55):
    """Karplus-Strong plucked string."""
    n = int(dur * SR)
    N = int(SR / freq)
    exc = rng.uniform(-1, 1, N)
    exc = lfilter([bright, 1 - bright], [1], exc)  # soften attack
    x = np.zeros(n)
    x[:N] = exc
    a = np.zeros(N + 2)
    a[0] = 1
    a[N] = -0.4985
    a[N + 1] = -0.4985
    y = lfilter([1], a, x)
    env = np.exp(-np.arange(n) / SR * 2.2)
    return amp * y * env


def bell(freq, dur, amp=0.15):
    t = np.arange(int(dur * SR)) / SR
    s = (np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 2.76 * t) * np.exp(-t * 6)
         + 0.2 * np.sin(2 * np.pi * freq * 5.4 * t) * np.exp(-t * 12))
    return amp * s * np.exp(-t * 3.2) * np.minimum(1, t * 400)


def bass(freq, dur, amp=0.22):
    t = np.arange(int(dur * SR)) / SR
    s = np.sin(2 * np.pi * freq * t) + 0.25 * np.sin(4 * np.pi * freq * t)
    env = np.minimum(1, t * 120) * np.exp(-t * 2.5)
    return amp * s * env


def kick(amp=0.34):
    t = np.arange(int(0.35 * SR)) / SR
    f = 50 + 90 * np.exp(-t * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return amp * np.sin(ph) * np.exp(-t * 9)


def band(sig, lo, hi):
    sos = butter(2, [lo, hi], btype="band", fs=SR, output="sos")
    return sosfilt(sos, sig)


def clap(amp=0.22):
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    nz = band(rng.uniform(-1, 1, n), 900, 5000)
    env = np.exp(-t * 22) + 0.6 * np.exp(-((t - 0.012) * 300) ** 2) + 0.5 * np.exp(-((t - 0.024) * 300) ** 2)
    return amp * nz * env


def shaker(amp=0.05):
    n = int(0.08 * SR)
    t = np.arange(n) / SR
    nz = band(rng.uniform(-1, 1, n), 6000, 14000)
    return amp * nz * np.sin(np.pi * t / t[-1]) ** 2


def add(buf, sig, t, pan=0.0):
    i = int(t * SR)
    if i >= buf.shape[1]:
        return
    sig = sig[: buf.shape[1] - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[0, i:i + len(sig)] += sig * l * 1.41
    buf[1, i:i + len(sig)] += sig * r * 1.41


def track(total):
    buf = np.zeros((2, int((total + 3) * SR)))
    # I - V - vi - IV in C (C, G, Am, F); chord tones as MIDI
    chords = [(48, [60, 64, 67, 72]), (43, [59, 62, 67, 71]), (45, [57, 60, 64, 69]), (41, [57, 60, 65, 69])]
    arp = [0, 2, 1, 3, 2, 1, 3, 2]
    melody = [[76, None, 74, 72, None, 74, 76, None], [74, None, 71, None, 74, None, 79, None],
              [72, None, 76, None, 74, 72, None, 69], [72, None, 69, None, 72, 74, None, None]]
    bar = BEAT * 4
    nbars = int(np.ceil(total / bar))
    for b in range(nbars):
        t0 = b * bar
        root, tones = chords[b % 4]
        full = b >= 1  # bar 0 = intro (pluck only)
        for i in range(8):
            t = t0 + i * BEAT / 2
            if t > total - 0.2:
                break
            add(buf, pluck(midi(tones[arp[i]]), 1.4, amp=0.24), t, pan=-0.3 if i % 2 else 0.3)
            if full:
                add(buf, shaker(), t + BEAT / 4, pan=0.4)
                add(buf, shaker(0.035), t, pan=0.4)
            if b >= 2 and b % 8 not in (7,) and melody[b % 4][i]:
                add(buf, bell(midi(melody[b % 4][i]), 0.9), t, pan=0.15)
        if full:
            for k in range(4):
                t = t0 + k * BEAT
                if t > total - 0.2:
                    break
                if k in (0, 2):
                    add(buf, kick(), t)
                else:
                    add(buf, clap(), t, pan=-0.05)
            add(buf, bass(midi(root), BEAT * 1.4), t0)
            add(buf, bass(midi(root), BEAT * 0.9), t0 + BEAT * 1.5)
            add(buf, bass(midi(root + 7 if root < 45 else root - 5), BEAT * 1.4), t0 + BEAT * 2)
    # final ring-out chord on the end card
    tf = total - 3.4
    for n in [60, 64, 67, 72, 76]:
        add(buf, pluck(midi(n), 3.4, amp=0.13), tf + (n - 60) * 0.012)
    add(buf, bell(midi(84), 2.5, amp=0.1), tf)
    add(buf, bass(midi(36), 3.0, amp=0.35), tf)
    buf = buf[:, : int(total * SR)]
    fade = int(0.6 * SR)
    buf[:, -fade:] *= np.linspace(1, 0, fade) ** 2
    # gentle glue: soft clip + normalise
    buf = np.tanh(buf * 1.2)
    buf /= np.abs(buf).max() / 0.85
    return buf.T


def whoosh(dur=0.45):
    n = int(dur * SR)
    t = np.arange(n) / SR
    nz = rng.uniform(-1, 1, n)
    out = np.zeros(n)
    # sweep a band-pass up by processing chunks
    ch = 512
    for i in range(0, n, ch):
        p = i / n
        lo = 300 + 2600 * p
        seg = band(nz[max(0, i - 2048):i + ch], lo, lo * 2.2)[-min(ch, n - i):]
        out[i:i + len(seg)] = seg
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 1.6
    s = out * env
    s /= np.abs(s).max()
    return np.stack([s * np.linspace(1, 0.4, n), s * np.linspace(0.4, 1, n)], 1) * 0.5


def pop():
    t = np.arange(int(0.09 * SR)) / SR
    f = 1100 * np.exp(-t * 12) + 500
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 45)
    return np.stack([s, s], 1) * 0.5


if __name__ == "__main__":
    out, total = sys.argv[1], float(sys.argv[2])
    sf.write(f"{out}/muzik_latar.wav", track(total), SR, subtype="PCM_16")
    sf.write(f"{out}/sfx_whoosh.wav", whoosh(), SR, subtype="PCM_16")
    sf.write(f"{out}/sfx_pop.wav", pop(), SR, subtype="PCM_16")
    print("ok")
