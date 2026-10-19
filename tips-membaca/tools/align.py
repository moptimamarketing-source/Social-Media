"""Word timings for the voiceover, without a speech model.

The ElevenLabs read has clean pauses, so: detect speech segments with ffmpeg
silencedetect, map each to its script phrase, spread words inside a segment by
syllable count, then snap every word boundary to the nearest dip in the RMS
envelope. Writes src/data/captions.ts.

usage: python3 -I tools/align.py public/voice.mp3 src/data/captions.ts
"""
import json, re, subprocess, sys
import numpy as np

AUDIO, OUT = sys.argv[1], sys.argv[2]

# One entry per speech segment, in order (must match silencedetect output).
SEGMENTS = [
    "Nah!", "Ini tips yang berguna", "untuk ibu ayah di luar sana!", "Ibu ayah nak tahu tak?",
    "Bila anak tak lancar membaca,", "semua benda jadi berat.", "Homework lambat,", "soalan tak faham,",
    "dan", "anak mula rasa…", "\"Saya tak pandai.\"", "Membaca ni penting", "sebab", "dia kunci semua subjek",
    "seperti Bahasa Melayu,", "English,", "Sains,", "Maths,", "semua perlukan anak faham arahan.",
    "Bila anak dah boleh baca,", "dia jadi lebih yakin,", "tak takut salah,", "dan boleh belajar lebih berdikari.",
    "Ibu ayah pun kurang stres.", "Jadi", "kalau anak masih tersekat-sekat,",
    "jangan tunggu sampai dia makin besar dan makin down.", "Kuatkan asas baca dulu,",
    "baru semua pelajaran jadi senang.", "Kalau nak tahu macam mana teknik ni berfungsi untuk anak anda…",
    "Komen,", "like", "dan share!",
]

# Subtitle chunks: "|" = new chunk, "/" = line break, *word* = keyword (yellow).
SCRIPT = """*Nah!* | Ini *tips* yang berguna | untuk *ibu* *ayah* / di luar sana! | Ibu ayah *nak* *tahu* *tak?* |
Bila anak *tak* *lancar* / membaca, | semua benda jadi *berat.* | *Homework* *lambat,* | soalan *tak* *faham,* |
dan anak mula rasa… | "Saya *tak* *pandai."* | *Membaca* ni penting | sebab dia *kunci* / semua subjek |
seperti *Bahasa* *Melayu,* | *English,* *Sains,* *Maths,* | semua perlukan anak / faham *arahan.* |
Bila anak dah / *boleh* *baca,* | dia jadi lebih *yakin,* | *tak* *takut* *salah,* | dan boleh belajar / lebih *berdikari.* |
Ibu ayah pun / kurang *stres.* | Jadi kalau anak masih / *tersekat-sekat,* | *jangan* *tunggu* / sampai dia |
makin besar dan / *makin* *down.* | *Kuatkan* *asas* / baca dulu, | baru semua pelajaran / jadi *senang.* |
Kalau nak tahu / macam mana | *teknik* ni berfungsi / untuk anak anda… | *Komen,* *like* / dan *share!*"""

SR = 16000
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", AUDIO, "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"], capture_output=True).stdout
x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
duration = len(x) / SR
hop = int(0.01 * SR)
rms = np.sqrt(np.convolve(x ** 2, np.ones(hop * 3) / (hop * 3), mode="same"))[::hop]
rms = np.convolve(rms, np.ones(3) / 3, mode="same")

log = subprocess.run(["ffmpeg", "-i", AUDIO, "-af", "silencedetect=n=-40dB:d=0.12", "-f", "null", "-"], capture_output=True, text=True).stderr
starts = [float(v) for v in re.findall(r"silence_start: ([0-9.]+)", log)]
ends = [float(v) for v in re.findall(r"silence_end: ([0-9.]+)", log)]
speech = []
cursor = 0.0
for s, e in zip(starts, ends):
    if s - cursor > 0.05:
        speech.append((cursor, s))
    cursor = e
if duration - cursor > 0.1:
    speech.append((cursor, duration))
assert len(speech) == len(SEGMENTS), f"{len(speech)} speech segments vs {len(SEGMENTS)} script segments: {speech}"


def syllables(w):
    w = re.sub(r"[^a-z]", "", w.lower())
    return max(1, len(re.findall(r"[aeiou]+", w)))


def snap(t, lo, hi):
    i0, i1 = int(max(lo, t - 0.07) * 100), int(min(hi, t + 0.07) * 100)
    if i1 <= i0:
        return t
    return (i0 + int(np.argmin(rms[i0:i1]))) / 100


timed = []  # (word, start, end)
for (s, e), text in zip(speech, SEGMENTS):
    words = text.split()
    weights = np.array([syllables(w) + 0.35 for w in words])
    edges = s + np.concatenate([[0], np.cumsum(weights)]) / weights.sum() * (e - s)
    for i in range(1, len(edges) - 1):
        edges[i] = snap(edges[i], edges[i - 1] + 0.06, edges[i + 1] - 0.06)
    for i, w in enumerate(words):
        timed.append((w, round(float(edges[i]), 3), round(float(edges[i + 1]), 3)))

chunks = []
wi = 0
for raw in SCRIPT.replace("\n", " ").split("|"):
    toks = raw.split()
    words, br = [], False
    for tok in toks:
        if tok == "/":
            br = True
            continue
        key = tok.startswith("*") or tok.endswith("*") or tok.endswith('*"') or tok.endswith("*,")
        clean = tok.replace("*", "")
        src = timed[wi]
        assert src[0] == clean, f"script/segment mismatch at word {wi}: {clean!r} vs {src[0]!r}"
        words.append({"w": clean, "t": src[1], "key": key, "br": br})
        br = False
        wi += 1
    chunks.append({"start": words[0]["t"], "lastEnd": timed[wi - 1][2], "words": words})
assert wi == len(timed)

for i, c in enumerate(chunks):
    nxt = chunks[i + 1]["start"] if i + 1 < len(chunks) else duration + 1.0
    gap = nxt - c["lastEnd"]
    c["end"] = round(nxt - 0.02 if gap < 0.9 else c["lastEnd"] + 0.45, 3)
    c["start"] = round(max(0, c["start"] - 0.06), 3)
    del c["lastEnd"]

segs = [{"start": round(s, 3), "end": round(e, 3), "text": t} for (s, e), t in zip(speech, SEGMENTS)]
with open(OUT, "w") as f:
    f.write("// GENERATED by tools/align.py from public/voice.mp3 — edit SCRIPT there and re-run.\n")
    f.write("export type CaptionWord = {w: string; t: number; key: boolean; br: boolean};\n")
    f.write("export type CaptionChunk = {start: number; end: number; words: CaptionWord[]};\n\n")
    f.write(f"export const AUDIO_DURATION = {duration:.3f};\n\n")
    f.write("/** Speech segments (from silence detection) with their script line. */\n")
    f.write("export const segments = " + json.dumps(segs, ensure_ascii=False, indent=1) + ";\n\n")
    f.write("export const captions: CaptionChunk[] = " + json.dumps(chunks, ensure_ascii=False, indent=1) + ";\n")
for c in chunks:
    print(f"{c['start']:6.2f}-{c['end']:6.2f}  " + " ".join(("*" + w["w"] + "*" if w["key"] else w["w"]) + f"@{w['t']:.2f}" for w in c["words"]))
