// Usage: node stills.mjs reel.html outPrefix t1 t2 ...  -> outPrefix-<t>.jpg
import { launch } from './browser.mjs';
import path from 'path';
import fs from 'fs';
// Frame size: <meta name="reel-size" content="1920x1080"> in the page, else 1080x1920 (vertical).
const reelSize = (file) => { const m = /name="reel-size" content="(\d+)x(\d+)"/.exec(fs.readFileSync(file, 'utf8')); return m ? { width: +m[1], height: +m[2] } : { width: 1080, height: 1920 }; };
const [src, prefix, ...ts] = process.argv.slice(2);
const b = await launch();
const p = await (await b.newContext({ viewport: reelSize(src) })).newPage();
await p.goto('file://' + path.resolve(src), { waitUntil: 'networkidle' });
await p.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
for (const t of ts) {
  await p.evaluate((x) => window.seek(x), +t);
  await p.screenshot({ path: `${prefix}-${t}.jpg`, type: 'jpeg', quality: 90 });
}
await b.close();
