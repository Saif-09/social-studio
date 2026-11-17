# Sourced by the shell scripts. Workspace = a folder with reelNN.html pages, vo/, cues.d/ (and engine files linked in).
# Order: $REEL_ENGINE, then ~/.config/reel-studio/workspace (written by setup.sh / new-workspace.sh).
SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")/.." && pwd)"
if [ -z "$REEL_ENGINE" ] && [ -f "$HOME/.config/reel-studio/workspace" ]; then REEL_ENGINE="$(cat "$HOME/.config/reel-studio/workspace")"; fi
if [ -z "$REEL_ENGINE" ]; then echo "No workspace. Run: $SKILL_DIR/scripts/new-workspace.sh <folder>" >&2; exit 1; fi
