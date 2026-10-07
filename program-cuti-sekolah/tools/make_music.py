"""Jana lagu latar ceria asal (120 BPM, C-G-Am-F) -> music/minda_cuti_ceria.wav + beats.json
Semua bunyi disintesis dari gelombang asas; tiada sampel atau lagu pihak ketiga."""
import json, os, numpy as np, soundfile as sf
from scipy.signal import fftconvolve, butter, lfilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
cfg = json.load(open(f"{ROOT}/edit_config.json"))["music"]
SR, BPM, BARS = 44100, cfg["bpm"], cfg["bars"]
BEAT = 60 / BPM; BAR = 4 * BEAT; TOTAL = BARS * BAR
N = int(SR * (TOTAL + 1.0))
rng = np.random.default_rng(7)

def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def hp(x, fc): b, a = butter(2, fc / (SR / 2), "high"); return lfilter(b, a, x)
def lp(x, fc): b, a = butter(2, fc / (SR / 2), "low"); return lfilter(b, a, x)

def put(buf, start_s, snd, gain=1.0):
    i = int(start_s * SR)
    if i >= len(buf): return
    j = min(len(buf), i + len(snd)); buf[i:j] += gain * snd[: j - i]

def pluck(f, dur, bright=1.0, decay=5.0):
    """Bunyi petik (ukulele/marimba): harmonik dengan susut berbeza."""
    t = np.arange(int(SR * dur)) / SR; y = np.zeros_like(t)
    for h, a in enumerate([1, .55, .35, .22, .14, .09, .06], 1):
        if f * h > 9000: break
        y += a * (bright ** (h - 1)) * np.sin(2 * np.pi * f * h * t) * np.exp(-decay * (1 + .5 * h) * t)
    env = np.minimum(1, t / 0.004)
    return y * env

def bell(f, dur):  # glockenspiel
    t = np.arange(int(SR * dur)) / SR
    y = np.sin(2*np.pi*f*t) + .4*np.sin(2*np.pi*f*2.76*t)*np.exp(-9*t) + .2*np.sin(2*np.pi*f*5.4*t)*np.exp(-14*t)
    return y * np.exp(-3.2 * t) * np.minimum(1, t / 0.003)

def kick():
    t = np.arange(int(SR * .28)) / SR
    f = 52 + 120 * np.exp(-28 * t); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-9 * t) * 1.1

def clap():
    t = np.arange(int(SR * .22)) / SR; n = hp(rng.standard_normal(len(t)), 1200)
    env = np.exp(-22 * t) + .6 * np.exp(-60 * ((t - .012) % .02)) * (t < .04)
    return lp(n * env, 7500) * .8

def hat(open_=False):
    t = np.arange(int(SR * (.16 if open_ else .05))) / SR
    return hp(rng.standard_normal(len(t)), 7000) * np.exp(-(14 if open_ else 70) * t) * .35

def riser(dur):
    t = np.arange(int(SR * dur)) / SR; n = hp(rng.standard_normal(len(t)), 2500)
    return n * (t / dur) ** 2 * .5

def crash():
    t = np.arange(int(SR * 1.6)) / SR
    return hp(rng.standard_normal(len(t)), 3500) * np.exp(-3 * t) * .55

L, R = np.zeros(N), np.zeros(N)           # trek berasingan -> stereo
def pan(sig, p):  # p -1..1
    return sig * np.sqrt((1 - p) / 2), sig * np.sqrt((1 + p) / 2)

def add(buf2, snd, start, gain=1.0, p=0.0):
    l, r = pan(snd, p); put(buf2[0], start, l, gain); put(buf2[1], start, r, gain)

drums, uke, bass, lead, pad, fx = [[np.zeros(N), np.zeros(N)] for _ in range(6)]
CH = [(60, [64, 67, 72]), (55, [62, 67, 71]), (57, [60, 64, 69]), (53, [60, 65, 69])]  # C G Am F (akar bass, nada)
MEL = [  # (beat, midi, panjang_beat)
    [(0, 76, .5), (.5, 79, .5), (1, 81, .5), (1.5, 79, .5), (2, 76, .5), (2.5, 74, .5), (3, 72, 1)],
    [(0, 74, .5), (.5, 79, .5), (1, 83, .5), (1.5, 81, .5), (2, 79, 1), (3, 74, 1)],
    [(0, 72, .5), (.5, 76, .5), (1, 81, .5), (1.5, 79, .5), (2, 76, .5), (2.5, 79, .5), (3, 81, 1)],
    [(0, 81, 1), (1, 79, .5), (1.5, 77, .5), (2, 76, 1), (3, 72, 1)],
]
def sec(bar):  # bahagian susunan (bar 0-based; 1 bar = 2 s)
    if bar < 2: return "hook"
    if bar < 5: return "intro"
    if bar < 19: return "montaj"
    if bar < 24: return "emosi"
    return "cta"

for bar in range(BARS):
    s0 = bar * BAR; part = sec(bar); root, tones = CH[bar % 4]
    full = part in ("montaj", "cta"); soft = part == "emosi"
    # --- dram
    if part in ("hook", "intro", "montaj", "cta"):
        for b in (0, 1, 2, 3):
            if b in (0, 2) or (full and b == 3 and bar % 2): add(drums, kick(), s0 + b * BEAT, .95)
            if b in (1, 3): add(drums, clap(), s0 + b * BEAT, .7)
        for e in range(8):
            add(drums, hat(e % 4 == 3 and full), s0 + e * BEAT / 2, .55 if e % 2 == 0 else .35, .25)
        if part in ("intro", "montaj", "cta") and bar % 4 == 3:  # fill snare
            for k in range(4): add(drums, clap(), s0 + 3 * BEAT + k * BEAT / 4, .3 + .12 * k)
    if soft:
        for e in range(8): add(drums, hat(False), s0 + e * BEAT / 2, .22, .25)
    # --- ukulele (strum 8 not; D . D U . U D U)
    pat = [1, 0, 1, 1, 0, 1, 1, 1] if not soft else [1, 0, 0, 1, 0, 0, 1, 0]
    for e, on in enumerate(pat):
        if not on: continue
        up = e % 2 == 1
        for k, n in enumerate(tones if not up else tones[::-1]):
            add(uke, pluck(midi(n), .55, 1.0, 6.5), s0 + e * BEAT / 2 + k * .012, (.34 if not soft else .24) * (.8 if up else 1), -.35)
    # --- bass
    if part != "hook":
        for b, o in ((0, 0), (1.5, 0), (2, 7), (3, 0)) if not soft else ((0, 0), (2, 0)):
            add(bass, pluck(midi(root - 12 + o), .42 if not soft else .9, .3, 4.5), s0 + b * BEAT, .55, 0)
    # --- melodi (marimba/gloc)
    if part in ("montaj", "cta"):
        for b, n, d in MEL[bar % 4]:
            add(lead, bell(midi(n), 1.1), s0 + b * BEAT, .22, .35)
    if soft:  # arpeggio lembut + pad
        for k, n in enumerate(tones + [tones[1] + 12, tones[2]]):
            add(lead, bell(midi(n + 12), 1.4), s0 + k * BEAT * .8, .13, .3 if k % 2 else -.3)
        t = np.arange(int(SR * BAR)) / SR
        env = np.minimum(1, t / .6) * np.minimum(1, (BAR - t) / .5)
        padn = sum(np.sin(2 * np.pi * midi(n - 12) * t) + .4 * np.sin(2 * np.pi * midi(n - 12) * 2.003 * t) for n in tones)
        add(pad, padn * env, s0, .05, 0)

# riser + hentaman: naik ke detik 49 (CTA) ; crash di 49.0; penutup di bar terakhir
add(fx, riser(2.0), 47.0, .5); add(fx, crash(), 49.0, .8)
for k in range(8): add(drums, clap(), 48.0 + k * BEAT / 2, .18 + .06 * k)
add(fx, crash(), 10.0, .35); add(fx, crash(), 38.0, .35)
for n in (60, 64, 67, 72, 76):                     # kord penutup
    add(uke, pluck(midi(n), 2.2, 1.0, 2.2), (BARS - 1) * BAR, .3, 0)
add(bass, pluck(midi(48), 2.0, .3, 2), (BARS - 1) * BAR, .6)
add(drums, kick(), (BARS - 1) * BAR, 1.0); add(fx, crash(), (BARS - 1) * BAR, .6)

# pembersihan: reverb pada melodi & pad
ir = rng.standard_normal(int(SR * 1.3)) * np.exp(-3.4 * np.arange(int(SR * 1.3)) / SR)
for tr in (lead, pad):
    for ch in (0, 1): tr[ch] += .22 * fftconvolve(tr[ch], ir)[:N] * 0.05 * 10
mix = [np.zeros(N), np.zeros(N)]
for tr, g in ((drums, 1.0), (uke, 1.0), (bass, .9), (lead, 1.0), (pad, 1.0), (fx, 1.0)):
    for ch in (0, 1): mix[ch] += g * tr[ch]
m = np.stack(mix, 1)
m /= max(1e-9, np.abs(m).max()); m = np.tanh(m * 1.1) / np.tanh(1.1) * 0.89   # limiter lembut
end = int(SR * TOTAL); m = m[:end]
fade = np.minimum(1, np.arange(end) / (SR * .5)) * np.minimum(1, (end - np.arange(end)) / (SR * 1.0))
m *= fade[:, None]
os.makedirs(f"{ROOT}/music", exist_ok=True)
sf.write(f"{ROOT}/music/minda_cuti_ceria.wav", m, SR, subtype="PCM_16")
json.dump({"bpm": BPM, "beat_s": BEAT, "bar_s": BAR, "durasi_s": TOTAL,
           "beats": [round(i * BEAT, 3) for i in range(int(TOTAL / BEAT))]},
          open(f"{ROOT}/music/beats.json", "w"))
print("siap", round(TOTAL, 1), "s")
