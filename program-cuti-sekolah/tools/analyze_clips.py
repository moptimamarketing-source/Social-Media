"""Langkah 1: ffprobe + analisis audio setiap klip -> analysis/probe.json & analysis/audio_report.md"""
import json, subprocess, re, sys, numpy as np, soundfile as sf, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLIPS = ["C6963", "C6967", "C6970", "C6986", "C7014", "C7016"]
def sh(cmd): return subprocess.run(cmd, capture_output=True, text=True).stdout + ""
probe, lines = {}, ["# Laporan audio\n", "Ambang senyap -35 dB, minimum 0.4 s. 'Bunyi aktif' = bahagian ada suara/bunyi.\n"]
for c in CLIPS:
    f = f"{ROOT}/raw/{c}.MP4"
    j = json.loads(sh(["ffprobe","-v","error","-print_format","json","-show_streams","-show_format",f]))
    v = next(s for s in j["streams"] if s["codec_type"]=="video")
    rot = 0
    for sd in v.get("side_data_list", []):
        if "rotation" in sd: rot = int(sd["rotation"])
    w,h = v["width"], v["height"]
    disp = (h,w) if abs(rot)==90 else (w,h)
    a = [s for s in j["streams"] if s["codec_type"]=="audio"]
    probe[c] = dict(coded=f"{w}x{h}", rotation=rot, display=f"{disp[0]}x{disp[1]}", fps=v["r_frame_rate"],
                    duration=float(j["format"]["duration"]), codec=v["codec_name"], pix_fmt=v["pix_fmt"],
                    bitrate_mbps=round(int(j["format"]["bit_rate"])/1e6,1),
                    audio=(a[0]["codec_name"] if a else None))
    wav = f"{ROOT}/.work/{c}_a.wav"
    subprocess.run(["ffmpeg","-v","error","-y","-i",f,"-vn","-ac","1","-ar","16000","-c:a","pcm_s16le",wav])
    x, sr = sf.read(wav); win = sr//2
    n = len(x)//win
    rms = [20*np.log10(max(np.sqrt(np.mean(x[i*win:(i+1)*win]**2)),1e-6)) for i in range(n)]
    sd = sh(["ffmpeg","-hide_banner","-i",wav,"-af","silencedetect=n=-35dB:d=0.4","-f","null","-"]) + subprocess.run(["ffmpeg","-hide_banner","-i",wav,"-af","silencedetect=n=-35dB:d=0.4","-f","null","-"],capture_output=True,text=True).stderr
    sil = re.findall(r"silence_(start|end): ([\d.]+)", sd)
    loud = np.array(rms); active = loud > -35
    segs, s = [], None
    for i, on in enumerate(active):
        if on and s is None: s = i
        if (not on or i==len(active)-1) and s is not None:
            segs.append((s*0.5, (i if not on else i+1)*0.5)); s = None
    probe[c]["active_audio_ranges_s"] = segs
    probe[c]["peak_rms_db"] = round(float(loud.max()),1)
    lines.append(f"\n## {c}  ({probe[c]['duration']:.1f}s, rms puncak {loud.max():.1f} dB, purata {loud.mean():.1f} dB)\n")
    lines.append("Bunyi aktif: " + (", ".join(f"{a:.1f}–{b:.1f}s" for a,b in segs) or "tiada") + "\n")
    lines.append("Nota: audio aktif sepanjang klip (kemungkinan suara + bunyi persekitaran; tidak dapat dibezakan secara automatik). Tiada puncak mendadak yang menunjukkan sorakan/gelak.\n" if (loud.max()-loud.mean())<12 else "Nota: ada puncak kuat — semak untuk gelak/sorakan.\n")
json.dump(probe, open(f"{ROOT}/analysis/probe.json","w"), indent=1)
open(f"{ROOT}/analysis/audio_report.md","w").write("".join(lines))
print(json.dumps(probe, indent=1)[:3500]); print("".join(lines))
