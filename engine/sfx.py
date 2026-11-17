"""Synthesised sound effects, cued to each reel's timeline, mixed to a stereo WAV.

Everything is generated from noise and oscillators, so there is nothing to license.
Usage: python sfx.py <reel-id> <duration> <out.wav>
"""
import math, sys, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(d * SR)) / SR


def env(n, a, d_, curve=4.0):
    """attack seconds a, then exponential-ish decay over the rest."""
    x = np.arange(n) / SR
    e = np.where(x < a, x / max(a, 1e-4), np.exp(-curve * (x - a) / max(d_, 1e-4)))
    return e


def biquad(x, kind, f, q=0.7):
    """RBJ biquad; f may be an array (time-varying cutoff)."""
    f = np.broadcast_to(np.asarray(f, dtype=float), x.shape)
    y = np.zeros_like(x)
    x1 = x2 = y1 = y2 = 0.0
    step = 64  # recompute coefficients every 64 samples
    for i0 in range(0, len(x), step):
        w = 2 * math.pi * min(f[i0], SR * 0.45) / SR
        cw, sw = math.cos(w), math.sin(w)
        al = sw / (2 * q)
        if kind == "lp":
            b0, b1, b2 = (1 - cw) / 2, 1 - cw, (1 - cw) / 2
        elif kind == "hp":
            b0, b1, b2 = (1 + cw) / 2, -(1 + cw), (1 + cw) / 2
        else:  # bandpass, constant peak gain
            b0, b1, b2 = al, 0.0, -al
        a0, a1, a2 = 1 + al, -2 * cw, 1 - al
        b0, b1, b2, a1, a2 = b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0
        for i in range(i0, min(i0 + step, len(x))):
            xi = x[i]
            yi = b0 * xi + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
            x2, x1, y2, y1 = x1, xi, y1, yi
            y[i] = yi
    return y


def norm(x, peak=1.0):
    m = np.max(np.abs(x)) or 1.0
    return x / m * peak


def noise(d):
    return rng.standard_normal(int(d * SR))


# ---------- the sound library ----------
def whoosh(d=0.5, f0=300, f1=3500, q=1.2):
    n = noise(d)
    tt = t_(d)
    p = tt / d
    f = f0 * (f1 / f0) ** np.sin(p * math.pi / 2)
    y = biquad(n, "bp", f, q)
    e = np.sin(np.clip(p, 0, 1) * math.pi) ** 1.6
    return norm(y * e, 0.9)


def riser(d=1.2):
    tt = t_(d)
    p = tt / d
    y = biquad(noise(d), "bp", 200 * (40 ** p), 2.0) * (p ** 2.2)
    tone = np.sin(2 * math.pi * np.cumsum(120 * (8 ** p)) / SR) * 0.25 * p ** 3
    return norm(y + tone, 0.8)


def impact(d=1.1):
    tt = t_(d)
    f = 70 * np.exp(-tt * 5) + 38
    sub = np.sin(2 * math.pi * np.cumsum(f) / SR) * np.exp(-tt * 3.2)
    crack = biquad(noise(d), "lp", 2500, 0.8) * np.exp(-tt * 30)
    return norm(sub * 1.0 + crack * 0.6, 1.0)


def click(f=3200, d=0.03, q=4.0):
    n = noise(d) * env(int(d * SR), 0.0005, d, 6)
    return norm(biquad(n, "bp", f, q), 0.9)


def shutter():
    a = click(4200, 0.035, 3)
    b = click(2400, 0.05, 2.5) * 0.8
    out = np.zeros(int(0.14 * SR))
    out[: len(a)] += a
    o = int(0.065 * SR)
    out[o: o + len(b)] += b
    return norm(out, 0.9)


def pop(f0=900, f1=180, d=0.12):
    tt = t_(d)
    f = f1 + (f0 - f1) * np.exp(-tt * 40)
    y = np.sin(2 * math.pi * np.cumsum(f) / SR) * np.exp(-tt * 28)
    return norm(y, 0.85)


def ping(f=(1318.5, 1975.5), d=0.7, gap=0.11):
    out = np.zeros(int((d + gap) * SR))
    for k, fr in enumerate(f):
        tt = t_(d)
        y = (np.sin(2 * math.pi * fr * tt) + 0.3 * np.sin(2 * math.pi * fr * 2.01 * tt)) * np.exp(-tt * 6) * np.minimum(1, tt / 0.004)
        o = int(k * gap * SR)
        out[o: o + len(y)] += y
    return norm(out, 0.8)


def ding():
    return ping((1567.98, 2093.0), 0.9, 0.09)


def beep(f=880, d=0.12):
    tt = t_(d)
    y = np.sin(2 * math.pi * f * tt) * np.minimum(1, tt / 0.003) * np.clip((d - tt) / 0.02, 0, 1)
    return norm(y, 0.7)


def glitch(d=0.3):
    n = int(d * SR)
    y = np.zeros(n)
    i = 0
    while i < n:
        seg = int(rng.integers(300, 2400))
        kind = rng.integers(0, 3)
        tt = np.arange(min(seg, n - i)) / SR
        if kind == 0:
            s = np.sign(np.sin(2 * math.pi * rng.integers(80, 900) * tt))
        elif kind == 1:
            s = np.round(rng.standard_normal(len(tt)) * 3) / 3
        else:
            s = np.zeros(len(tt))
        y[i: i + len(tt)] = s
        i += seg
    y = biquad(y, "hp", 150, 0.7)
    return norm(y * np.minimum(1, np.arange(n) / 100), 0.75)


def slap():
    d = 0.25
    tt = t_(d)
    thump = np.sin(2 * math.pi * 110 * tt) * np.exp(-tt * 40)
    paper = biquad(noise(d), "bp", 1800, 0.9) * np.exp(-tt * 45)
    return norm(thump * 0.7 + paper, 0.9)


def scribble(d=0.4):
    tt = t_(d)
    n = biquad(noise(d), "bp", 3000 + 1200 * np.sin(2 * math.pi * 9 * tt), 3.0)
    am = 0.5 + 0.5 * np.abs(np.sin(2 * math.pi * 7 * tt))
    return norm(n * am * np.sin(np.clip(tt / d, 0, 1) * math.pi) ** 0.5, 0.6)


def key():
    return click(rng.integers(2600, 4200), 0.025, 5)


def swipe(d=0.22):
    return whoosh(d, 900, 5000, 1.5)


def sparkle(d=0.6):
    out = np.zeros(int(d * SR))
    for k in range(9):
        fr = float(rng.uniform(2600, 5200))
        o = int(rng.uniform(0, d - 0.15) * SR)
        tt = t_(0.15)
        y = np.sin(2 * math.pi * fr * tt) * np.exp(-tt * 30)
        out[o: o + len(y)] += y
    return norm(out + whoosh(d, 2000, 7000, 1.0) * 0.4, 0.6)


def hum(d=1.2):
    tt = t_(d)
    y = (np.sin(2 * math.pi * 110 * tt) + 0.5 * np.sin(2 * math.pi * 165 * tt * (1 + tt / d * 0.3))) * np.sin(np.clip(tt / d, 0, 1) * math.pi)
    return norm(y, 0.4)


LIB = {
    "whoosh": lambda: whoosh(0.5), "whip": lambda: whoosh(0.3, 500, 6000, 1.4), "whooshL": lambda: whoosh(0.9, 200, 2500, 1.0),
    "rev": lambda: whoosh(0.9, 4000, 250, 1.0), "riser": lambda: riser(1.2), "riserL": lambda: riser(2.8), "impact": impact,
    "shutter": shutter, "pop": pop, "popH": lambda: pop(1400, 400, 0.08), "ping": ping, "ding": ding, "beep": beep,
    "beepH": lambda: beep(1760, 0.3), "glitch": glitch, "glitchS": lambda: glitch(0.14), "slap": slap, "scribble": lambda: scribble(0.35),
    "scribbleL": lambda: scribble(0.65), "key": key, "swipe": swipe, "sparkle": sparkle, "tick": lambda: click(5200, 0.012, 6),
    "tap": lambda: click(1800, 0.03, 2), "hum": lambda: hum(1.2),
}
_cache = {}


def snd(name):
    if name not in _cache:
        _cache[name] = LIB[name]()
    return _cache[name]


def cues(reel):
    c = []
    add = lambda t, n, g=1.0, pan=0.0: c.append((t, n, g, pan))
    if reel == "1":
        add(0.45, "tap", .6); add(0.7, "riserL", .35); add(1.66, "shutter", .9); add(2.0, "impact", .9); add(2.0, "whoosh", .6)
        for s in [2.8, 3.8, 4.8, 5.8, 6.8, 7.8]: add(s, "shutter", .8)
        for s in [3.0, 4.0, 5.0, 6.0, 7.0]: add(s - .08, "whip", .55, (-.4 if s % 2 else .4))
        add(8.0, "whoosh", .5)
        for i in range(6): add(8.0 + i * .07, "popH", .35, -.5 + i * .2)
        add(9.6, "impact", .55); add(10.15, "ding", .5); add(11.6, "rev", .3)
    elif reel == "3":
        for s in [0.0, 1.0, 2.0]: add(s, "tick", .8)
        add(0.3, "pop", .5); add(1.6, "tap", .7); add(1.8, "riser", .45); add(2.86, "glitchS", .6); add(3.0, "impact", .9); add(3.0, "glitch", .7)
        add(3.7, "swipe", .5); add(3.75, "whooshL", .35)
        for i, s in enumerate([3.95, 4.13, 4.31]): add(s, "popH", .5, -.3 + i * .3)
        for k in range(6): add(5.0 + k * .5, "glitchS", .55, (-.3 if k % 2 else .3))
        t = 8.05
        for L in [16, 19, 12]:
            for i in range(L): add(t + i / 40, "key", .3, -.2 + .4 * (i % 3) / 2)
            t += L / 40 + .12
        add(9.5, "ding", .45); add(9.8, "glitch", .5)
    elif reel == "4":
        add(1.15, "scribble", .6); add(2.0, "whooshL", .5); add(2.0, "impact", .55)
        for i, s in enumerate([2.3, 2.8, 3.3, 3.8, 4.3]): add(s, "slap", .8, -.4 + i * .2)
        add(5.4, "scribbleL", .55); add(6.0, "scribble", .5); add(7.0, "whoosh", .45); add(7.6, "impact", .5)
        add(8.6, "rev", .4); add(9.2, "slap", .9); add(9.4, "ding", .5); add(11.5, "whoosh", .3)
    elif reel == "5":
        add(0.6, "pop", .4); add(1.4, "riser", .4); add(2.0, "impact", .85)
        for k in range(8):
            s = 2.0 + k * .5; add(s - .05, "whip", .55, (-.4 if k % 2 else .4)); add(s, "sparkle", .3); add(s + .06, "popH", .35)
        add(6.0, "whoosh", .5)
        for i in range(0, 9, 2): add(6.0 + i * .045, "popH", .3, -.4 + i * .1)
        add(8.0, "whooshL", .45); add(8.42, "slap", .7); add(8.6, "ding", .45); add(9.75, "rev", .3)
    elif reel == "6":
        add(0.05, "ping", .55); add(1.0, "riser", .45); add(2.0, "impact", .8)
        t = 2.0
        for k in range(12): add(t, "whip", .5 * (1 - k / 30), (-.5 if k % 2 else .5)); t += .11
        for k, d in enumerate([.14, .18, .24, .32]): add(t, "whip", .45 - k * .07, (-.4 if k % 2 else .4)); t += d
        add(t, "shutter", .8); add(t, "impact", .4); add(4.6, "whoosh", .45)
        for i in range(3): add(4.6 + i * .1, "popH", .3, -.4 + i * .4)
        add(6.6, "shutter", .7); add(7.1, "shutter", .7); add(7.6, "whooshL", .45); add(8.1, "ding", .45); add(9.75, "rev", .3)
    elif reel == "7":
        add(0.15, "riserL", .5); add(3.0, "whoosh", .5); add(3.2, "hum", .35); add(4.6, "rev", .6); add(5.4, "pop", .45)
        add(6.5, "impact", .85); add(6.5, "shutter", .6); add(7.3, "shutter", .6); add(8.0, "whooshL", .45); add(8.4, "ding", .45); add(9.75, "rev", .3)
    elif reel == "8":
        for s in [1.0, 1.33, 1.66]: add(s, "beep", .6)
        add(1.96, "beepH", .7); add(2.0, "impact", .8)
        for i in range(15): add(2.0 + i * .1, "tick", .35, .4)
        for s in [3.0, 4.0, 5.0]: add(s, "swipe", .35, -.4)
        for s in [3.2, 4.5, 5.8]: add(s, "popH", .35, -.4)
        add(3.5, "ding", .6, .4); add(3.5, "shutter", .5, .4)
        for s in [4.0, 4.5, 5.0, 5.5]: add(s, "shutter", .35, .4)
        add(6.0, "whooshL", .55); add(8.0, "whoosh", .45); add(8.1, "popH", .4); add(8.25, "popH", .4); add(8.6, "ding", .45); add(9.75, "rev", .3)
    elif reel == "9":
        add(1.8, "sparkle", .5)
        for i, s in enumerate([2.0, 2.5, 3.0, 3.5]): add(s, "swipe", .45, -.3 + (i % 2) * .6)
        add(2.0, "impact", .5); add(3.95, "tap", .7); add(4.2, "swipe", .5)
        for s in [5.05, 5.5, 5.95]: add(s, "swipe", .35)
        add(6.2, "swipe", .45)
        for i, s in enumerate([6.6, 6.85, 7.1, 7.35]): add(s, "popH", .45, -.3 + i * .2)
        add(8.0, "whooshL", .45); add(8.35, "ding", .5); add(9.75, "rev", .3)
    elif reel == "10":
        add(0.1, "slap", .5); add(2.1, "ping", .6); add(2.9, "ping", .6)
        for i, s in enumerate([4.0, 4.5, 5.0, 5.5]): add(s, "ping", .45 + i * .08)
        add(6.0, "glitchS", .4); add(6.0, "impact", .4); add(6.5, "impact", .9); add(6.5, "whoosh", .5)
        for i in range(9): add(6.5 + i * .18, "popH", .32, -.4 + (i % 3) * .4)
        add(8.0, "ding", .45); add(9.0, "whoosh", .4); add(10.5, "whoosh", .35); add(10.65, "ping", .7); add(11.75, "rev", .3)
    elif reel == "11":
        add(1.45, "tap", .7); add(1.8, "swipe", .5); add(2.15, "pop", .45); add(2.4, "hum", .3); add(3.55, "ding", .55)
        add(3.6, "impact", .75); add(3.7, "whooshL", .4); add(5.2, "whoosh", .45); add(5.3, "whooshL", .4); add(6.7, "whoosh", .4)
        for i, s in enumerate([6.8, 7.05, 7.3]): add(s, "pop", .45, -.2 + i * .2)
        add(8.3, "whoosh", .4); add(8.6, "ding", .5); add(9.75, "rev", .25)
    return c


def mix(reel, dur):
    L = np.zeros(int(dur * SR) + SR)
    R = np.zeros_like(L)
    for t, name, g, pan in cues(reel):
        s = snd(name) * g
        i = int(t * SR)
        j = min(len(L), i + len(s))
        lg, rg = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
        L[i:j] += s[: j - i] * lg * 1.414
        R[i:j] += s[: j - i] * rg * 1.414
    L, R = L[: int(dur * SR)], R[: int(dur * SR)]
    st = np.stack([L, R], 1)
    pk = np.max(np.abs(st)) or 1
    st = np.tanh(st / pk * 1.2) / math.tanh(1.2) * 0.5  # soft limit, peak about -6 dBFS
    return (st * 32767).astype("<i2")


if __name__ == "__main__":
    reel, dur, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
    data = mix(reel, dur)
    with wave.open(out, "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data.tobytes())
    print(out, len(cues(reel)), "cues")
