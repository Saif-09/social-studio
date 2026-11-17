#!/usr/bin/env bash
# One-time setup on a new machine (macOS, Linux, or Windows via WSL). Safe to run again.
#   ./setup.sh                 checks tools, installs the render engine, makes ~/reels the default workspace
#   ./setup.sh <workspace>     same, with your own workspace folder
set -e
SK="$(cd "$(dirname "$0")" && pwd)"; OS="$(uname -s)"; ok(){ echo "  ok   $1"; }; miss(){ echo "  MISSING  $1"; MISSING=1; }
echo "Social Studio setup ($OS $(uname -m))"
echo "1) Tools"
command -v node >/dev/null && ok "node $(node -v)" || miss "node 18+ (mac: brew install node | linux/WSL: sudo apt install nodejs npm, or nvm)"
command -v ffmpeg >/dev/null && ok "ffmpeg" || miss "ffmpeg (mac: brew install ffmpeg | linux/WSL: sudo apt install ffmpeg)"
command -v python3 >/dev/null && ok "python3" || miss "python3"
command -v uv >/dev/null && ok "uv" || miss "uv (curl -LsSf https://astral.sh/uv/install.sh | sh)"
[ -n "$MISSING" ] && { echo "Install the missing tools, then run ./setup.sh again."; exit 1; }
echo "2) Render engine"
(cd "$SK/engine" && npm install --silent --no-audit --no-fund) && ok "playwright installed"
if [ "$OS" = Darwin ] && [ -d "/Applications/Google Chrome.app" ]; then ok "uses Google Chrome"
else (cd "$SK/engine" && npx playwright install chromium) && ok "bundled Chromium (on Linux/WSL, if it fails: sudo npx playwright install-deps chromium)"; fi
echo "3) Workspace"
W="${1:-}"; CUR="$HOME/.config/reel-studio/workspace"
if [ -n "$W" ]; then "$SK/scripts/new-workspace.sh" "$W" --default
elif [ -f "$CUR" ]; then ok "workspace $(cat "$CUR")"
else "$SK/scripts/new-workspace.sh" "$HOME/reels" --default; fi
echo "4) Secrets (stored only on this machine, never in git)"
mkdir -p "$HOME/.config/reel-studio"; chmod 700 "$HOME/.config/reel-studio"
if [ -n "$GEMINI_API_KEY" ] || [ -s "$HOME/.config/reel-studio/gemini-key" ]; then ok "Gemini key found"
else echo "  add Gemini key: paste it into ~/.config/reel-studio/gemini-key (aistudio.google.com/apikey)"; fi
if [ -n "$META_TOKEN" ] || [ -s "$HOME/.config/reel-studio/meta-token" ]; then ok "Meta token found (stats)"
else echo "  optional, for stats: Meta token into ~/.config/reel-studio/meta-token (see README)"; fi
echo "5) Claude Code"
case "$SK" in "$HOME/.claude/skills/"*) ok "skill is in ~/.claude/skills, every Claude Code session can use it";;
  *) echo "  move or clone this folder to ~/.claude/skills/social-studio so Claude Code finds it";; esac
echo "Done. Test: $SK/scripts/transcribe.sh <any.wav>   |   ask Claude: make a reel for <brand> about <topic>"
