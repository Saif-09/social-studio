#!/usr/bin/env python3
"""Assemble a story reel's voice track, scene timing and caption chunks from recorded lines.

Usage: story_build.py cfg.json
cfg example:
{
  "reel": "66"  (optional "engine": workspace path; default = configured workspace), "vo_dir": "vo/r66",
  "speakers": {"n": {"tempo": 1.22, "maxpause": 0.18}, "g": {"pitch": 1.15, "tempo": 1.12}},
  "lead": 0.2, "gap_scene": 0.16, "gap_line": 0.06, "end_gap": 0.3, "end_card": 3.4,
  "lines": [
    {"id": "l02", "scene": 0, "chunks": ["Raja ne rote hue haath jode", "Hey Maa, mera beta mujhe <b>lauta do</b> 🙏"]},
    {"id": "l03", "scene": 1, "chunks": ["..."]}
  ]
}
Writes <engine>/vo/reel<reel>-voice.wav, -timing.json (TIMES) and -timing.js (TIMES + CAPS).
TIMES = scene starts..., end-card start, end. CAPS = [start, end, html, speaker] per caption chunk (time split by text length).
speaker "maxpause": shortens pauses inside a line to that many seconds (slow voices like Charon pause 0.5-0.9 s between phrases).
Old takes decoded before the tts.mjs WAV fix end in ~0.17 s of loud static (a C2PA chunk played as audio): any line whose
last 0.1 s is loud gets 0.002 s cut from the start and 0.17 s from the end. speaker "eq": "clear" = cut mud, lift presence.
Tempo and EQ run at 48 kHz (fewer atempo artifacts); the voice track is written at 48 kHz.
"""
import json, os, subprocess, sys
def _workspace():
    import os
    if os.environ.get("REEL_ENGINE"): return os.environ["REEL_ENGINE"]
    f = os.path.expanduser("~/.config/reel-studio/workspace")
    if os.path.exists(f): return open(f).read().strip()
    raise SystemExit("No workspace: run scripts/new-workspace.sh <folder> --default, or set REEL_ENGINE")
cfg = json.load(open(sys.argv[1]))
eng = os.path.expanduser(cfg.get("engine") or _workspace()); vo = os.path.join(eng, cfg["vo_dir"]); R = cfg["reel"]
def run(*a): subprocess.run(a, check=True)
def dur(f): return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]))
models = {}
if os.path.exists(os.path.join(vo, "models.log")):
    for ln in open(os.path.join(vo, "models.log")):
        p = ln.split();  models[p[0]] = p[1] if len(p) > 1 else ""
def burst(f):
    """True when the last 0.1 s is loud static (RMS above -20 dB), the pre-fix C2PA tail."""
    o = subprocess.run(["ffmpeg", "-hide_banner", "-sseof", "-0.1", "-i", f, "-af", "astats", "-f", "null", "-"], capture_output=True, text=True).stderr
    v = [l.split()[-1] for l in o.splitlines() if "RMS level dB" in l]
    return bool(v) and v[-1] not in ("-inf", "inf") and float(v[-1]) > -20
SIL = "silenceremove=start_periods=1:start_threshold=-45dB"
segs = []
for L in cfg["lines"]:
    b = L["id"]; src = os.path.join(vo, b + ".wav"); spk = open(os.path.join(vo, b + ".spk")).read().strip()
    sp = cfg["speakers"].get(spk, {})
    f = []
    if burst(src): f += [f"atrim=0.002:{dur(src) - 0.17:.3f}", "asetpts=PTS-STARTPTS"]
    f += [SIL, "areverse", SIL, "afade=t=in:d=0.04", "areverse"]
    if sp.get("maxpause"): f += [f"silenceremove=stop_periods=-1:stop_duration={sp['maxpause']}:stop_threshold=-40dB:stop_silence={sp['maxpause']}"]
    if sp.get("pitch"): f += [f"asetrate={int(24000 * sp['pitch'])}", "aresample=24000"]
    f += ["aresample=48000"]
    if sp.get("tempo"): f += [f"atempo={sp['tempo']}"]
    if sp.get("eq") == "clear": f += ["highpass=f=75", "equalizer=f=280:t=q:w=1.1:g=-3", "equalizer=f=3800:t=q:w=1.4:g=3", "equalizer=f=8000:t=q:w=1:g=1.5", "deesser=i=0.6:m=0.6:f=0.5:s=o"]
    out = os.path.join(vo, b + "t.wav")
    run("ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", ",".join(f), "-ar", "48000", "-ac", "1", out)
    segs.append((L, spk, out, dur(out)))
t = cfg.get("lead", 0.2); T = []; C = []; parts = []
for k, (L, spk, out, d) in enumerate(segs):
    s = L["scene"]
    while len(T) <= s: T.append(0 if s == 0 else round(t - 0.3, 2))
    parts.append((t, out))
    ch = L["chunks"]; n = [len(x.replace("<b>", "").replace("</b>", "")) + 4 for x in ch]; c = t
    for x, m in zip(ch, n):
        e = c + d * m / sum(n); C.append([round(c, 2), round(e, 2), x, spk]); c = e
    t += d + L.get("pause", 0)  # "pause": extra silence after this line (e.g. after naming the source, before the story resumes)
    if k < len(segs) - 1: t += cfg.get("gap_scene", 0.16) if segs[k + 1][0]["scene"] != s else cfg.get("gap_line", 0.06)
end = round(t + cfg.get("end_gap", 0.3), 2); total = round(end + cfg.get("end_card", 3.4), 2); T += [end, total]
ins, fl = [], []
for j, (st, out) in enumerate(parts):
    ins += ["-i", out]; fl.append(f"[{j}]adelay={int(st * 1000)}:all=1[a{j}]")
fl.append("".join(f"[a{j}]" for j in range(len(parts))) + f"amix=inputs={len(parts)}:normalize=0,apad=whole_dur={total}[o]")
run("ffmpeg", "-y", "-loglevel", "error", *ins, "-filter_complex", ";".join(fl), "-map", "[o]", "-ar", "48000", os.path.join(eng, f"vo/reel{R}-voice.wav"))
json.dump(T, open(os.path.join(eng, f"vo/reel{R}-timing.json"), "w"))
open(os.path.join(eng, f"vo/reel{R}-timing.js"), "w").write(f"window.TIMES = {json.dumps(T)};\nwindow.CAPS = {json.dumps(C, ensure_ascii=False)};\n")
print("TIMES", T, "duration", total)
