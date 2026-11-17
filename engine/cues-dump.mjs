// Usage: node cues-dump.mjs reel.html out.json  -> writes window.CUES (sound cue times defined by the page)
import { launch } from './browser.mjs';
import path from 'path';
import fs from 'fs';
const [src, out] = process.argv.slice(2);
const b = await launch(); const p = await (await b.newContext({ viewport: { width: 1080, height: 1920 } })).newPage();
await p.goto('file://' + path.resolve(src), { waitUntil: 'networkidle' });
await p.waitForFunction(() => window.__ready === true);
const c = await p.evaluate(() => ({ ...window.CUES, duration: window.DURATION }));
fs.writeFileSync(out, JSON.stringify(c, null, 1)); console.log(Object.entries(c).map(([k, v]) => `${k}:${Array.isArray(v) ? v.length : v}`).join(' '));
await b.close();
