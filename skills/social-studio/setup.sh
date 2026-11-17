#!/usr/bin/env bash
# One-time setup on a new machine (macOS, Linux, or Windows via WSL). Safe to run again.
#   ./setup.sh                 checks tools (installs what it can), installs the render engine, makes the default workspace
#   ./setup.sh <workspace>     same, with your own workspace folder
#   ./setup.sh --quick         only re-links the workspace to this copy of the engine (after an update); silent when fine
set -e
SK="$(cd "$(dirname "$0")" && pwd)"; OS="$(uname -s)"; ok(){ echo "  ok   $1"; }; miss(){ echo "  MISSING  $1"; MISSING=1; }
CFG="$HOME/.config/reel-studio"; DEFAULT_WS="${REEL_DEFAULT_WS:-$HOME/reels}"
relink() { [ -f "$CFG/workspace" ] || return 0; G="$(cat "$CFG/workspace")"; [ -d "$G" ] || return 0
  for f in "$G"/*; do b="$(basename "$f")"; [ -L "$f" ] && [ -e "$SK/engine/$b" ] && ln -sfn "$SK/engine/$b" "$f"; done; return 0; }
if [ "$1" = "--quick" ]; then
  [ -d "$SK/engine/node_modules/playwright" ] || { echo "first run: use ./setup.sh"; exit 2; }
  [ -f "$CFG/workspace" ] || { echo "no workspace: use ./setup.sh"; exit 2; }
  [ -n "$GEMINI_API_KEY" ] || [ -s "$CFG/gemini-key" ] || { echo "NEED Gemini key (free): aistudio.google.com/apikey, saved to ~/.config/reel-studio/gemini-key"; exit 3; }
  relink; exit 0
fi
echo "Setup ($OS $(uname -m))"
echo "1) Tools"
need=()
command -v node >/dev/null || need+=(node); command -v ffmpeg >/dev/null || need+=(ffmpeg)
command -v python3 >/dev/null || need+=(python3); command -v uv >/dev/null || need+=(uv)
if [ ${#need[@]} -gt 0 ]; then
  if [ "$OS" = Darwin ] && command -v brew >/dev/null; then
    pk=(); for t in "${need[@]}"; do case $t in python3) pk+=(python);; *) pk+=("$t");; esac; done
    echo "  installing with Homebrew: ${pk[*]}"; brew install "${pk[@]}" >/dev/null && ok "installed ${pk[*]}"
  elif [ "$OS" = Darwin ]; then
    echo '  Homebrew is needed first. In Claude Code type:  ! /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    echo "  (it asks for your Mac password), then run setup again."; exit 1
  else
    for t in "${need[@]}"; do [ "$t" = uv ] && { curl -LsSf https://astral.sh/uv/install.sh | sh >/dev/null && ok "installed uv"; }; done
    apt=(); for t in "${need[@]}"; do case $t in node) apt+=(nodejs npm);; ffmpeg) apt+=(ffmpeg);; python3) apt+=(python3);; esac; done
    if [ ${#apt[@]} -gt 0 ]; then echo "  needs: sudo apt install -y ${apt[*]}   (in Claude Code type:  ! sudo apt update && sudo apt install -y ${apt[*]} )"; exit 1; fi
  fi
fi
export PATH="$HOME/.local/bin:$PATH"
for t in node ffmpeg python3 uv; do command -v $t >/dev/null && ok "$t" || miss "$t"; done
[ -n "$MISSING" ] && { echo "Install the missing tools, then run setup again."; exit 1; }
echo "2) Render engine"
(cd "$SK/engine" && npm install --silent --no-audit --no-fund) && ok "playwright installed"
if [ "$OS" = Darwin ] && [ -d "/Applications/Google Chrome.app" ]; then ok "uses Google Chrome"
else (cd "$SK/engine" && npx playwright install chromium >/dev/null) && ok "bundled Chromium (on Linux/WSL, if it fails: sudo npx playwright install-deps chromium)"; fi
echo "3) Workspace"
W="${1:-}"
if [ -n "$W" ]; then "$SK/scripts/new-workspace.sh" "$W" --default
elif [ -f "$CFG/workspace" ]; then relink; ok "workspace $(cat "$CFG/workspace")"
else "$SK/scripts/new-workspace.sh" "$DEFAULT_WS" --default; fi
echo "4) Keys (stored only on this machine)"
mkdir -p "$CFG"; chmod 700 "$CFG"
if [ -n "$GEMINI_API_KEY" ] || [ -s "$CFG/gemini-key" ]; then ok "Gemini key found"
else echo "  NEED Gemini key (free): aistudio.google.com/apikey, saved to ~/.config/reel-studio/gemini-key"; fi
if [ -n "$META_TOKEN" ] || [ -s "$CFG/meta-token" ]; then ok "Meta token found (stats)"
else echo "  optional, for Instagram stats: Meta token in ~/.config/reel-studio/meta-token (see README)"; fi
echo "Done."
