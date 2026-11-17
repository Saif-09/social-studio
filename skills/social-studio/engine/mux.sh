#!/bin/sh
# Usage: ./mux.sh <reel> <timing.json> <video.mp4> <out.mp4> [voice.wav]
# Mixes sound effects (and a voiceover when given, effects ducked under it) onto the silent video.
set -e
R=$1; D=$2; V=$3; O=$4; VO=$5
uv run --quiet --with numpy python cues.py "$R" "$D" "/tmp/gk-sfx-$R.wav"
if [ -n "$VO" ]; then
  ffmpeg -y -loglevel error -i "$V" -i "/tmp/gk-sfx-$R.wav" -i "$VO" -filter_complex "[1]volume=0.45[s];[s][2]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,alimiter=limit=0.84:level=false[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 160k -shortest -movflags +faststart "$O"
else
  ffmpeg -y -loglevel error -i "$V" -i "/tmp/gk-sfx-$R.wav" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k -shortest -movflags +faststart "$O"
fi
echo "$O"
