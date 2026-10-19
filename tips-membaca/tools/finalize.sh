#!/usr/bin/env bash
# Final delivery pass: keep the H.264 picture as rendered, brick-wall limit the
# mix so SFX peaks never clip, AAC 192k, faststart for TikTok / Reels upload.
set -euo pipefail
IN="$1"; OUT="$2"
ffmpeg -v error -y -i "$IN" -c:v copy \
  -af "alimiter=limit=0.89:attack=5:release=60:level=disabled" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT"
ffprobe -v error -show_entries format=duration,bit_rate:stream=codec_name,width,height,r_frame_rate -of compact "$OUT"
