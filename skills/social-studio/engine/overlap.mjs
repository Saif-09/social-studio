// Usage: node overlap.mjs reel.html pairs.json [step=0.1]
// pairs.json: { "items": {"name": "css selector", ...}, "pairs": [["a","b"], ...], "edges": ["a", ...], "pad": 6, "margin": 8 }
// Seeks through the timeline, measures each visible item's on-screen box (padded) and reports every overlapping pair
// and every item that leaves the frame, as time ranges. Exit code 1 when anything is found.
import { launch } from './browser.mjs';
import path from 'path';
import fs from 'fs';
const [src, cfgPath, stepArg] = process.argv.slice(2);
const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const step = +(stepArg || 0.1);
const b = await launch();
const p = await (await b.newContext({ viewport: { width: 1080, height: 1920 } })).newPage();
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto('file://' + path.resolve(src), { waitUntil: 'networkidle' });
await p.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
const dur = await p.evaluate(() => window.DURATION);
if (errs.length) { console.log('PAGE ERROR: ' + errs.join(' | ')); await b.close(); process.exit(2); }
const hits = {}, seen = new Set();
for (let t = 0; t <= dur + 1e-6; t += step) {
  const res = await p.evaluate(({ t, cfg }) => {
    window.seek(t);
    const vis = (el) => { for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; if (n.dataset && n.dataset.o !== undefined && +n.dataset.o < 0.05) return false; } return true; };
    const box = {};
    for (const [k, sel] of Object.entries(cfg.items)) {
      const el = document.querySelector(sel); if (!el || !vis(el)) continue;
      const r = el.getBoundingClientRect(); if (r.width < 1 || r.height < 1) continue;
      const pad = cfg.pad ?? 6; box[k] = [r.left - pad, r.top - pad, r.right + pad, r.bottom + pad];
    }
    const out = [];
    for (const [a, c] of cfg.pairs) { const A = box[a], B = box[c]; if (!A || !B) continue;
      const ox = Math.min(A[2], B[2]) - Math.max(A[0], B[0]), oy = Math.min(A[3], B[3]) - Math.max(A[1], B[1]);
      if (ox > 0 && oy > 0) out.push(`${a} x ${c} (${Math.round(ox)}x${Math.round(oy)}px)`); }
    const m = cfg.margin ?? 8;
    for (const k of cfg.edges || []) { const A = box[k]; if (!A) continue; const pad = cfg.pad ?? 6;
      if (A[0] + pad < m || A[2] - pad > 1080 - m || A[1] + pad < m || A[3] - pad > 1920 - m) out.push(`${k} leaves frame [${A.map((v) => Math.round(v)).join(',')}]`); }
    return { out, seen: Object.keys(box) };
  }, { t, cfg }).then((r) => { r.seen.forEach((k) => seen.add(k)); return r.out; });
  for (const h of res) { const key = h.replace(/\s*\(.*|\s*\[.*/, ''); (hits[key] ||= []).push([+t.toFixed(2), h]); }
}
await b.close();
if (errs.length) { console.log('PAGE ERROR: ' + [...new Set(errs)].join(' | ')); process.exit(2); }
const never = Object.keys(cfg.items).filter((k) => !seen.has(k));
if (never.length) console.log('never visible (check selectors): ' + never.join(', '));
const keys = Object.keys(hits);
if (!keys.length) { console.log('no overlaps'); process.exit(0); }
for (const k of keys) { const ts = hits[k].map((x) => x[0]); console.log(`${k}: ${ts[0]}-${ts[ts.length - 1]}s (${ts.length} samples), e.g. ${hits[k][0][1]}`); }
process.exit(1);
