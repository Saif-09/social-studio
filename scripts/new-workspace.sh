#!/usr/bin/env bash
# new-workspace.sh <folder> [--default]
# Creates <folder>/_generator for a brand's reels: engine files are linked (so engine fixes reach every brand),
# per-reel files (reelNN.html, vo/, cues.d/, cfg/, art) live in the workspace. Finished mp4s go in <folder>.
# --default also makes it the workspace the scripts use when REEL_ENGINE is not set.
set -e
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"; W="$1"; [ -z "$W" ] && { echo "usage: new-workspace.sh <folder> [--default]"; exit 1; }
mkdir -p "$W/_generator/vo" "$W/_generator/cues.d" "$W/_generator/cfg"; G="$(cd "$W/_generator" && pwd)"
for f in lib.js base.css capbig.css render.mjs stills.mjs browser.mjs tts.mjs mux.sh sfx.py cues.py mk_tier1.py mk_rank.py reel05.html reel20.html; do
  [ -e "$G/$f" ] || ln -s "$SKILL_DIR/engine/$f" "$G/$f"; done
for f in reel05-timing.js reel20-timing.js; do [ -e "$G/vo/$f" ] || cp "$SKILL_DIR/engine/vo/$f" "$G/vo/" 2>/dev/null || true; done
[ -e "$G/story-reel.html" ] || cp "$SKILL_DIR/templates/story-reel.html" "$G/story-reel.html"
if [ "$2" = "--default" ]; then mkdir -p "$HOME/.config/reel-studio"; echo "$G" > "$HOME/.config/reel-studio/workspace"; echo "default workspace: $G"; fi
echo "workspace ready: $G"
