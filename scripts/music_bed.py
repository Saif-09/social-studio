#!/usr/bin/env python3
"""Original synthesized music bed: tension intro -> hard drop -> groove -> end hit. No samples, no licensing.

Usage: uv run --with numpy --with scipy python music_bed.py cfg.json out.wav
cfg: {"duration": 35.8, "drop": 7.12, "end_hit": 33.18, "bpm": 124, "key": "A",
      "pings": [0.5, 1.4, 2.3], "riser_from": 4.4, "gap": 0.22, "energy": 1.0}
- Before "drop": low drone, ticking 16th hats, sparse heartbeat kick, notification pings, a noise riser ending in
  `gap` seconds of silence. At "drop": impact (sub boom + clap) then four-on-the-floor groove (Am-F-C-G bass,
  chord stabs pumped by the kick, hats, claps). At "end_hit": a final hit and a ringing chord to the end.
The beat grid is anchored so a downbeat lands exactly on "drop". Output: 48 kHz stereo, peak-normalized.
"""
import json, sys
import numpy as np
from scipy.signal import butter, sosfilt

cfg = json.load(open(sys.argv[1])); out = sys.argv[2]
SR = 48000
D = cfg["duration"]; DROP = cfg["drop"]; END = cfg.get("end_hit", D - 2.5); BPM = cfg.get("bpm", 124)
N = int(D * SR); beat = 60 / BPM
rng = np.random.default_rng(7)
L = np.zeros(N); R = np.zeros(N)

def at(t): return int(round(t * SR))
def add(sig, t, gain=1.0, pan=0.0):
    i = at(t)
    if i >= N or i + len(sig) <= 0: return
    s = sig[: max(0, N - i)] * gain
    if i < 0: s = s[-i:]; i = 0
    L[i:i + len(s)] += s * (1 - max(0, pan)); R[i:i + len(s)] += s * (1 + min(0, pan))
def env(n, a=0.002, d=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)
def lp(x, f): return sosfilt(butter(2, f, "low", fs=SR, output="sos"), x)
def hp(x, f): return sosfilt(butter(2, f, "high", fs=SR, output="sos"), x)
def bp(x, lo, hi): return sosfilt(butter(2, [lo, hi], "band", fs=SR, output="sos"), x)
def saw(f, n, det=0.0):
    t = np.arange(n) / SR
    return sum((2 * (((f * (1 + d)) * t) % 1) - 1) for d in (-det, 0, det)) / 3

NOTE = {"A1": 55.0, "C2": 65.41, "F1": 43.65, "G1": 49.0, "A2": 110.0, "C3": 130.81, "E3": 164.81, "F2": 87.31, "G2": 98.0,
        "A3": 220.0, "C4": 261.63, "E4": 329.63, "F3": 174.61, "G3": 196.0, "B3": 246.94, "D4": 293.66}
CHORDS = [("A1", ["A3", "C4", "E4"]), ("F1", ["F3", "A3", "C4"]), ("C2", ["G3", "C4", "E4"]), ("G1", ["G3", "B3", "D4"])]

def kick(g=1.0):
    n = int(0.42 * SR); t = np.arange(n) / SR
    f = 45 + 95 * np.exp(-t / 0.035)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    s[: int(0.004 * SR)] += rng.standard_normal(int(0.004 * SR)) * 0.5  # click so phones hear it
    return np.tanh(s * 1.6) * g
def clap(g=1.0):
    n = int(0.22 * SR); x = rng.standard_normal(n)
    e = np.zeros(n)
    for k, d in enumerate((0, 0.011, 0.022)): e[int(d * SR):] += np.exp(-np.arange(n - int(d * SR)) / SR / (0.012 if k < 2 else 0.09))
    return bp(x * e, 900, 5200) * 1.4 * g
def hat(g=1.0, d=0.035):
    n = int(0.12 * SR); return hp(rng.standard_normal(n), 7000) * env(n, 0.001, d) * g
def ping(f1=1318.5, f2=1760.0, g=0.35):
    n = int(0.5 * SR); t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f1 * t) * env(n, 0.002, 0.12)
    s2 = np.zeros(n); k = int(0.09 * SR); s2[k:] = np.sin(2 * np.pi * f2 * t[: n - k]) * env(n - k, 0.002, 0.18)
    return (s + s2) * g

# ---------- intro (tension) ----------
# Downbeats are anchored to DROP: beat k time = DROP + k*beat (k negative before the drop).
first = -int(DROP / beat) - 1
intro_end = DROP - cfg.get("gap", 0.22)
n_int = at(intro_end)
t = np.arange(n_int) / SR
drone = (np.sin(2 * np.pi * 55 * t) * 0.5 + np.sin(2 * np.pi * 82.41 * t) * 0.25 + lp(saw(55, n_int, 0.004), 400) * 0.35)
drone *= np.minimum(1, t / 1.0) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.5 * t))
add(drone * 0.55, 0)
for k in range(first, 0):
    tb = DROP + k * beat
    if tb < 0 or tb >= intro_end: continue
    for s in range(4):  # ticking 16ths, louder on the beat
        ts = tb + s * beat / 4
        if ts < intro_end: add(hat(0.28 if s == 0 else 0.14, 0.02), ts, pan=0.3 if s % 2 else -0.3)
    if k % 2 == 0: add(kick(0.55), tb)  # heartbeat every other beat
for p in cfg.get("pings", []): add(ping(), p, pan=0.2)
rf = cfg.get("riser_from", DROP - 2.6)
nr = at(intro_end) - at(rf)
if nr > 0:
    tr = np.arange(nr) / SR; prog = tr / tr[-1]
    noise = rng.standard_normal(nr)
    riser = sosfilt(butter(2, 2500, "high", fs=SR, output="sos"), noise) * prog ** 2 * 0.5
    sweep = np.sin(2 * np.pi * np.cumsum(200 + 1400 * prog ** 2) / SR) * prog ** 3 * 0.25
    add(riser + sweep, rf)

# ---------- drop impact ----------
nb = int(1.6 * SR); tb_ = np.arange(nb) / SR
boom = np.sin(2 * np.pi * np.cumsum(38 + 60 * np.exp(-tb_ / 0.08)) / SR) * np.exp(-tb_ / 0.6)
add(np.tanh(boom * 2) * 0.9, DROP); add(clap(1.0), DROP); add(hat(0.4, 0.4), DROP)

# ---------- groove ----------
bars = int((END - DROP) / (4 * beat)) + 1
pump = np.ones(N)
for b in range(bars * 4):
    tb = DROP + b * beat
    if tb >= END - 0.01: break
    add(kick(0.95), tb)
    i = at(tb); k = min(N - i, int(0.25 * SR))
    if k > 0: pump[i:i + k] = np.minimum(pump[i:i + k], 0.35 + 0.65 * (np.arange(k) / k))
    if b % 4 in (1, 3): add(clap(0.38), tb)
    add(hat(0.16, 0.04), tb + 0.5 * beat, pan=0.25)  # offbeat open-ish hat
    add(hat(0.05, 0.015), tb + 0.25 * beat, pan=-0.25); add(hat(0.05, 0.015), tb + 0.75 * beat, pan=-0.25)
    root, chord = CHORDS[(b // 4) % 4]
    for e8 in range(2):  # 8th-note bass
        n8 = int(beat / 2 * SR); f = NOTE[root] * (2 if e8 else 1)
        add(lp(saw(f, n8, 0.002), 600) * env(n8, 0.003, 0.12) * 0.55, tb + e8 * beat / 2)
    if b % 2 == 0:  # chord stab on beats 1 and 3
        ns = int(beat * 1.2 * SR)
        st = sum(lp(saw(NOTE[n], ns, 0.006), 2200) for n in chord) / 3 * env(ns, 0.004, 0.25) * 0.35
        add(st, tb, pan=-0.15); add(st * 0.8, tb + 0.012, pan=0.15)
# Filter build into the end hit.
nb2 = at(END) - at(END - 4 * beat)
if nb2 > 0:
    pr_ = np.arange(nb2) / nb2
    add(hp(rng.standard_normal(nb2), 3000) * pr_ ** 2 * 0.3, END - 4 * beat)
L[at(DROP):at(END)] *= pump[at(DROP):at(END)] ** 0.5 + (1 - pump[at(DROP):at(END)] ** 0.5) * 0.2
R[at(DROP):at(END)] *= pump[at(DROP):at(END)] ** 0.5 + (1 - pump[at(DROP):at(END)] ** 0.5) * 0.2

# ---------- end hit + ringing chord ----------
add(np.tanh(boom * 2) * 0.8, END); add(clap(0.9), END)
nr2 = N - at(END)
if nr2 > 0:
    ring = sum(lp(saw(NOTE[n], nr2, 0.008), 1800) for n in ["A3", "C4", "E4"]) / 3
    ring += np.sin(2 * np.pi * 55 * np.arange(nr2) / SR) * 0.6
    add(ring * env(nr2, 0.01, 1.4) * 0.45, END)

mix = np.stack([L, R], 1)
mix = sosfilt(butter(2, 10500, "low", fs=SR, output="sos"), mix, axis=0)  # tame fizz: hats and claps were broadband
mix = np.tanh(mix / (np.max(np.abs(mix)) + 1e-9) * 1.1) * 0.89  # light saturation, peak ~-1 dB
fade = int(0.08 * SR); mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
import wave
with wave.open(out, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print(f"music: {D:.2f}s, drop at {DROP:.2f}s, {BPM} bpm -> {out}")
