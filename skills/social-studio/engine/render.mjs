// Usage: node render.mjs reel.html out.mp4 [fps] [from] [to]
// Renders silent video; mux.sh adds the sound effects (and later the voiceover).
import { launch } from './browser.mjs';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
// Frame size: <meta name="reel-size" content="1920x1080"> in the page, else 1080x1920 (vertical).
const reelSize = (file) => { const m = /name="reel-size" content="(\d+)x(\d+)"/.exec(fs.readFileSync(file, 'utf8')); return m ? { width: +m[1], height: +m[2] } : { width: 1080, height: 1920 }; };
const [src, out, fpsArg, fromArg, toArg] = process.argv.slice(2);
const fps = +(fpsArg || 30);
const b = await launch();
const p = await (await b.newContext({ viewport: reelSize(src), deviceScaleFactor: 1 })).newPage();
await p.goto('file://' + path.resolve(src), { waitUntil: 'networkidle' });
await p.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
const dur = await p.evaluate(() => window.DURATION);
const from = +(fromArg || 0), to = +(toArg || dur);
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-b:v', '10M', '-maxrate', '14M', '-bufsize', '20M', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-r', String(fps),
  '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const n = Math.round((to - from) * fps);
const t0 = Date.now();
for (let i = 0; i < n; i++) {
  await p.evaluate((t) => window.seek(t), from + i / fps);
  const buf = await p.screenshot({ type: 'jpeg', quality: 95 });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await b.close();
console.log(`${n} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s -> ${out}`);
