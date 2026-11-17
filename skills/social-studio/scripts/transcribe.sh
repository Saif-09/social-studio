#!/usr/bin/env bash
# transcribe.sh <audio-or-video> [lang]  -> prints the transcript (checks a voiceover says what it should).
# Apple Silicon: mlx-whisper large-v3-turbo. Elsewhere (Intel Mac, Linux, WSL): whisper-ctranslate2 (faster-whisper).
set -e; F="$1"; LANG_="${2:-hi}"; O="$(mktemp -d)"
if [ "$(uname -s)" = Darwin ] && [ "$(uname -m)" = arm64 ]; then
  uvx --from mlx-whisper mlx_whisper --model mlx-community/whisper-large-v3-turbo --language "$LANG_" --output-format txt -o "$O" "$F" >/dev/null 2>&1
else
  uvx whisper-ctranslate2 --model large-v3-turbo --language "$LANG_" --output_format txt --output_dir "$O" "$F" >/dev/null 2>&1
fi
cat "$O"/*.txt; rm -rf "$O"
echo; echo "(long files can skip a stretch: transcribe that part alone before assuming it is missing)" >&2
