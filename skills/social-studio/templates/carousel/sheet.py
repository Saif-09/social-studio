# python3 sheet.py out.jpg files...  -> 5-column contact sheet at 540x675 per slide
import subprocess, sys
out, fs = sys.argv[1], sys.argv[2:]
args = []
for f in fs: args += ["-i", f]
n = len(fs); cols = min(5, n)
flt = "".join(f"[{i}:v]scale=540:675[v{i}];" for i in range(n))
flt += "".join(f"[v{i}]" for i in range(n)) + f"xstack=inputs={n}:layout=" + "|".join(f"{(i%cols)*540}_{(i//cols)*675}" for i in range(n)) + ":fill=white[o]"
if n == 1: flt = "[0:v]scale=540:675[o]"
subprocess.run(["ffmpeg", "-v", "error", "-y", *args, "-filter_complex", flt, "-map", "[o]", out], check=True)
