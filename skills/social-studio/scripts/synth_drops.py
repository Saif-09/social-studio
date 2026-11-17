"""Water-drop sounds, three styles. usage: drops2.py STYLE out.wav total first step count
A = physical drip (van den Doel bubble model: rising chirp, fast decay), B = soft bloop, C = A + diffuse reverb tail."""
import math, random, struct, sys, wave
style, out, total, c0, step, n = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4]), float(sys.argv[5]), int(sys.argv[6])
SR = 48000; buf = [0.0] * int(total * SR); random.seed(11)
def bubble(f0, rise, decay, length, att=0.0008):
    s, ph = [], 0.0
    for i in range(int(length * SR)):
        t = i / SR; f = f0 * (1 + rise * t); ph += 2 * math.pi * f / SR
        env = (1 - math.exp(-t / att)) * math.exp(-t * decay)
        s.append(math.sin(ph) * env)
    return s
def lowpass(s, a):
    y, p = [], 0.0
    for x in s: p += a * (x - p); y.append(p)
    return y
# Reverb tail for C: exponentially decaying low-passed noise, convolved sparsely.
random.seed(3); tail = lowpass([(random.random() * 2 - 1) * math.exp(-i / SR / 0.09) for i in range(int(0.35 * SR))], 0.18)
def add(s, at, g):
    j0 = int(at * SR)
    for i, v in enumerate(s):
        if 0 <= j0 + i < len(buf): buf[j0 + i] += v * g
for k in range(n):
    at = c0 + k * step + 0.45; v = random.uniform(0.9, 1.1)
    if style == "B":
        d = lowpass(bubble(380 * v, 2.2, 38, 0.22, 0.003), 0.35); add(d, at, 1.0)
    else:
        d = bubble(1150 * v, 7.0, 55, 0.12)                      # the "plink": ~1.1 kHz rising fast, ~50 ms
        d2 = bubble(2300 * v, 6.0, 120, 0.05)                    # a faint upper partial
        dd = [a + 0.25 * (d2[i] if i < len(d2) else 0) for i, a in enumerate(d)]
        add(dd, at, 0.9)
        if style == "C":  # diffuse tail: convolve the plink's energy roughly by adding a scaled tail
            add(tail, at + 0.004, 0.18)
peak = max(abs(x) for x in buf) or 1
with wave.open(out, "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, x / peak * 0.5)) * 32767)) for x in buf))
print(style, "->", out)
