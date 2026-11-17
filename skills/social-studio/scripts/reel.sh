#!/usr/bin/env bash
# reel.sh <NN> <slug> [--sfx] [--speed X] [--engine DIR] [--out DIR]   (workspace: $REEL_ENGINE or ~/.config/reel-studio/workspace)
# Renders reel<NN>.html and muxes vo/reel<NN>-voice.wav -> <out>/reel-<NN>-<slug>.mp4.
# Voice only by default (no sound effects). --sfx uses mux.sh with cues.d/<NN>.json. --speed speeds video+voice.
set -eo pipefail
N=$1; SLUG=$2; shift 2
source "$(dirname "$0")/_paths.sh"
SFX=0; SPEED=1; ENG="$REEL_ENGINE"; OUT=""
while [ $# -gt 0 ]; do case $1 in --sfx) SFX=1;; --speed) SPEED=$2; shift;; --engine) ENG=$2; shift;; --out) OUT=$2; shift;; esac; shift; done
[ -z "$OUT" ] && OUT=$ENG/..
TMP=$(mktemp -d); cd $ENG
node render.mjs reel$N.html $TMP/v.mp4 | tail -1
VO=vo/reel$N-voice.wav
if [ $SFX = 1 ]; then ./mux.sh $N vo/reel$N-timing.json $TMP/v.mp4 $TMP/m.mp4 $VO >/dev/null; IN=$TMP/m.mp4
else IN=$TMP/v.mp4; fi
if [ $SFX = 1 ]; then
  ffmpeg -y -loglevel error -i $IN -filter_complex "[0:v]setpts=PTS/$SPEED,fps=30[v];[0:a]atempo=$SPEED[a]" -map "[v]" -map "[a]" -c:v libx264 -crf 22 -maxrate 4M -bufsize 8M -preset slow -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart $OUT/reel-$N-$SLUG.mp4
elif [ ! -f "$VO" ]; then
  echo "no $VO: making a silent video" >&2
  ffmpeg -y -loglevel error -i $IN -f lavfi -i anullsrc=r=48000:cl=stereo -filter_complex "[0:v]setpts=PTS/$SPEED,fps=30[v]" -map "[v]" -map 1:a -shortest -c:v libx264 -crf 22 -maxrate 4M -bufsize 8M -preset slow -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart $OUT/reel-$N-$SLUG.mp4
else
  ffmpeg -y -loglevel error -i $IN -i $VO -filter_complex "[0:v]setpts=PTS/$SPEED,fps=30[v];[1]atempo=$SPEED,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000,apad[a]" -map "[v]" -map "[a]" -shortest -c:v libx264 -crf 22 -maxrate 4M -bufsize 8M -preset slow -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart $OUT/reel-$N-$SLUG.mp4
fi
# Second loudness pass on the finished file (single-pass loudnorm on a voice track with silence lands ~-16 LUFS).
FINAL=$OUT/reel-$N-$SLUG.mp4
if [ $SFX = 1 ] || [ -f "$VO" ]; then   # a silent track measures -inf and loudnorm refuses it
J=$(ffmpeg -hide_banner -i "$FINAL" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | python3 -c "import sys,json;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -loglevel error -i "$FINAL" -map 0:v -map 0:a -c:v copy -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" -c:a aac -b:a 160k -movflags +faststart $TMP/l.mp4 && mv $TMP/l.mp4 "$FINAL"
fi
rm -rf $TMP
ffprobe -v error -show_entries format=duration,size -of csv=p=0 $OUT/reel-$N-$SLUG.mp4
