#!/usr/bin/env python3
"""Record voice lines with Gemini TTS: free key first, billed key only when the free daily cap is hit.

Usage: tts_lines.py <vo_dir> --voices n=Gacrux,g=Leda [--engine DIR] [--models m1,m2,...] [--paid-env FILE] [--force]
<vo_dir> holds l01.plain (text) + l01.spk (speaker key). Writes l01.wav and appends "l01 <model> <free|paid>" to models.log.
Free key: whatever engine/tts.mjs finds (GEMINI_API_KEY, else the key files). Billed key: GEMINI_API_KEY in
--paid-env (default $REEL_GEMINI_ENV, else ~/.config/reel-studio/paid.env if it exists). Keys are never printed.
When a model's free daily cap is hit, the same model is retried on the billed key, so the voice stays on one model;
without a billed key the model is dropped and the next one is tried. Free calls wait 21 s (3/min limit).
Plain text only: fallback models read style directions aloud.
"""
import argparse, glob, os, re, subprocess, time
def _workspace():
    if os.environ.get("REEL_ENGINE"): return os.environ["REEL_ENGINE"]
    f = os.path.expanduser("~/.config/reel-studio/workspace")
    if os.path.exists(f): return open(f).read().strip()
    raise SystemExit("No workspace: run scripts/new-workspace.sh <folder> --default, or set REEL_ENGINE")
ap = argparse.ArgumentParser()
ap.add_argument("vo_dir"); ap.add_argument("--voices", required=True)
ap.add_argument("--engine", default=None)
ap.add_argument("--models", default="gemini-3.8-flash-tts,gemini-2.5-flash-preview-tts,gemini-3.8-flash-lite-tts")
ap.add_argument("--paid-env", default=os.environ.get("REEL_GEMINI_ENV") or os.path.expanduser("~/.config/reel-studio/paid.env"))
ap.add_argument("--force", action="store_true")
a = ap.parse_args()
a.engine = a.engine or _workspace()
voices = dict(x.split("=") for x in a.voices.split(","))
models = a.models.split(",")
paid_key = None
if a.paid_env and os.path.exists(a.paid_env):
    m_ = re.search(r"^GEMINI_API_KEY=[\"']?([^\"'\s]+)", open(a.paid_env).read(), re.M)
    paid_key = m_.group(1) if m_ else None
print("billed fallback:", "on" if paid_key else "off")
paid = set()  # models whose free daily cap was hit this run
os.chdir(a.vo_dir)
def call(f, out, v, m, use_paid):
    env = dict(os.environ, GEMINI_API_KEY=paid_key) if use_paid else os.environ
    return subprocess.run(["node", os.path.join(a.engine, "tts.mjs"), f, out, v, m], capture_output=True, text=True, env=env)
for f in sorted(glob.glob("l*.plain")):
    b = f[:-6]
    if os.path.exists(b + ".wav") and not a.force:
        print(b, "exists"); continue
    v = voices[open(b + ".spk").read().strip()]
    done = False
    for m in list(models):
        use_paid = m in paid
        r = call(f, b + ".wav", v, m, use_paid)
        for _ in range(3):  # 2.5 TTS models sometimes return no audio, or treat a short line as a prompt: just retry
            if r.returncode == 0 or not ("No audio" in r.stderr or "generate text" in r.stderr): break
            print(b, m, "flaky reply, retrying"); time.sleep(3); r = call(f, b + ".wav", v, m, use_paid)
        if r.returncode != 0 and "429" in r.stderr and "per day" not in r.stderr:
            print(m, "per-minute limit, waiting 35 s and retrying once"); time.sleep(35)
            r = call(f, b + ".wav", v, m, use_paid)
        if r.returncode != 0 and "per day" in r.stderr and not use_paid and paid_key:
            print(m, "free daily cap reached, using the billed key for this model"); paid.add(m); use_paid = True
            r = call(f, b + ".wav", v, m, True)
            for _ in range(3):
                if r.returncode == 0 or not ("No audio" in r.stderr or "generate text" in r.stderr): break
                print(b, m, "flaky reply, retrying"); time.sleep(3); r = call(f, b + ".wav", v, m, True)
        if r.returncode == 0:
            k = "paid" if use_paid else "free"
            open("models.log", "a").write(f"{b} {m} {k}\n"); print(b, v, m, k); done = True
            time.sleep(6 if use_paid else 21); break
        err = r.stderr
        if "per day" in err:
            print(m, "daily cap reached, dropping"); models.remove(m)
        else:
            print(b, m, "failed:", err.strip().splitlines()[0][:120] if err.strip() else r.returncode); time.sleep(1 if use_paid else 22)
    if not done: print(b, "NOT RECORDED")
print("Now verify each line: scripts/transcribe.sh l01.wav")
