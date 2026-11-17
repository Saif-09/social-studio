#!/usr/bin/env python3
"""Snap caption chunks to the spoken words, for lines recorded as one clip but shown as several beats.

Usage (Apple Silicon): uvx --from mlx-whisper python scripts/align_beats.py <cfg.json>
Run after story_build.py. For every line with "beats_ur" (the voice text of each beat, in order, one per chunk),
it transcribes the processed clip <vo_dir>/<id>t.wav with word timestamps (whisper large-v3-turbo) and moves each
chunk's start to the word where that beat begins: it fuzzy-matches each beat's first two words in order, and falls
back to the proportional word index (after the previous beat's words) when whisper misspells them. Rewrites CAPS in <engine>/vo/reel<NN>-timing.js; TIMES is unchanged.
"""
import difflib, json, os, re, sys
import mlx_whisper

def workspace(cfg):
    if cfg.get("engine"): return os.path.expanduser(cfg["engine"])
    if os.environ.get("REEL_ENGINE"): return os.environ["REEL_ENGINE"]
    return open(os.path.expanduser("~/.config/reel-studio/workspace")).read().strip()

cfg = json.load(open(sys.argv[1])); eng = workspace(cfg); vo = os.path.join(eng, cfg["vo_dir"]); R = cfg["reel"]
tj = os.path.join(eng, f"vo/reel{R}-timing.js"); src = open(tj).read()
TIMES = json.loads(re.search(r"window\.TIMES = (.*?);\n", src).group(1))
CAPS = json.loads(re.search(r"window\.CAPS = (.*?);\n", src, re.S).group(1))
lang = cfg.get("align_lang", "ur")
def norm(s):
    s = re.sub(r"[\u064B-\u065F\u0670\u06D6-\u06ED]", "", s)  # drop harakat
    for a, b in (("ي", "ی"), ("ى", "ی"), ("ك", "ک"), ("ة", "ہ"), ("ه", "ہ"), ("ھ", ""), ("أ", "ا"), ("إ", "ا"), ("آ", "ا"), ("ؤ", "و")): s = s.replace(a, b)
    return re.sub(r"[^\w ]", "", s).strip()
words_of = lambda s: [w for w in re.sub(r"[۔،:؟!,.\"'“”]", " ", s).split() if w]
i = 0
for L in cfg["lines"]:
    n = len(L["chunks"]); beats = L.get("beats_ur")
    if beats and n > 1 and len(beats) == n:
        line0, line1 = CAPS[i][0], CAPS[i + n - 1][1]
        r = mlx_whisper.transcribe(os.path.join(vo, L["id"] + "t.wav"), path_or_hf_repo="mlx-community/whisper-large-v3-turbo", language=lang, word_timestamps=True)
        W = [w for s in r["segments"] for w in s.get("words", [])]
        counts = [len(words_of(b)) for b in beats]; total = sum(counts)
        if W and total:
            # Find each beat's opening words in the transcript (fuzzy, in order); fall back to the proportional index.
            ww = [norm(w["word"]) for w in W]; starts = [0.0]; ptr = 0
            for k in range(1, n):
                guess = min(len(W) - 1, round(sum(counts[:k]) * len(W) / total))
                hw = words_of(beats[k])[:2]; head = norm(" ".join(hw))
                best, bi = 0.0, None
                for j in range(ptr, len(W)):
                    sc = difflib.SequenceMatcher(None, head, " ".join(ww[j:j + len(hw)])).ratio() - 0.02 * abs(j - guess)
                    if sc > best: best, bi = sc, j
                idx = bi if best >= 0.55 else min(len(W) - 1, max(ptr, guess))
                ptr = min(len(W) - 1, idx + max(1, counts[k] - 1))  # next beat starts after this one (allow one merged word)
                starts.append(max(starts[-1] + 0.15, float(W[idx]["start"])))
            for k in range(n):
                a = round(line0 + starts[k], 2); b = round(line0 + starts[k + 1], 2) if k + 1 < n else line1
                CAPS[i + k][0], CAPS[i + k][1] = a, max(b, a + 0.2)
            print(L["id"], "beats at", [round(x, 2) for x in starts])
        else:
            print(L["id"], "no words from whisper; kept length-based split")
    i += n
open(tj, "w").write(f"window.TIMES = {json.dumps(TIMES)};\nwindow.CAPS = {json.dumps(CAPS, ensure_ascii=False)};\n")
print("wrote", tj)
