// node shoot.mjs [ids...]  -> ../<id> - <slug>/NN.jpg, plus a layout check per slide
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import vm from "vm";
const here = path.dirname(new URL(import.meta.url).pathname);
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(here, "posts.js"), "utf8"), ctx);
const POSTS = ctx.window.POSTS;
const want = process.argv.slice(2);
let b; try { b = await chromium.launch({ channel: "chrome" }); } catch { b = await chromium.launch(); }
const pg = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 2 });
const errs = [];
pg.on("pageerror", (e) => errs.push(e.message));
let bad = 0;
for (const p of POSTS) {
  if (want.length && !want.includes(p.id)) continue;
  const dir = path.join(here, "..", `${p.id} - ${p.slug}`);
  fs.mkdirSync(dir, { recursive: true });
  const n = p.slides ? p.slides.length : 1;
  for (let k = 1; k <= n; k++) {
    errs.length = 0;
    await pg.goto(`file://${here}/page.html?v=${p.id}${k}#${p.id}/${k}`);
    await pg.waitForFunction(() => window.__ready === true, null, { timeout: 20000 });
    await pg.waitForTimeout(150);
    const r = await pg.evaluate(() => {
      const out = [], safe = { l: 84, r: 996, t: 70, b: 1280 };
      const kids = [...document.querySelectorAll(".safe > *")].filter((e) => !e.classList.contains("bg"));
      const box = (e) => e.getBoundingClientRect();
      // text overflow inside each child + the safe area
      for (const e of document.querySelectorAll(".safe *")) {
        const q = box(e);
        if (!q.width || e.closest("svg")) continue;
        if (q.left < safe.l - 1 || q.right > safe.r + 1 || q.top < safe.t - 1 || q.bottom > safe.b + 1) out.push(`out of safe: ${e.className || e.tagName} ${Math.round(q.left)},${Math.round(q.top)},${Math.round(q.right)},${Math.round(q.bottom)}`);
      }
      for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
        const a = box(kids[i]), c = box(kids[j]);
        if (!a.height || !c.height) continue;
        if (a.left < c.right && c.left < a.right && a.top < c.bottom - 1 && c.top < a.bottom - 1) out.push(`overlap: ${kids[i].className || kids[i].tagName} x ${kids[j].className || kids[j].tagName}`);
      }
      const art = document.querySelector(".art:not(.qcard) svg");
      if (art) { const q = box(art); if (q.height < 170) out.push(`art too small: ${Math.round(q.height)}px`); }
      const qc = document.querySelector(".qcard"), qi = document.querySelector(".qcard .qin");
      if (qc && box(qi).height > box(qc).height - 40) out.push(`arabic clipped by card: ${Math.round(box(qi).height)} > ${Math.round(box(qc).height - 40)}`);
      for (const e of document.querySelectorAll("h1,h2,.big,.qt,.sub")) if (e.scrollWidth > e.clientWidth + 2) out.push(`text wider than box: ${e.className || e.tagName}`);
      return { out, art: art ? Math.round(box(art).height) : 0 };
    });
    if (errs.length) r.out.push("page error: " + errs.join("; "));
    const f = path.join(dir, `${String(k).padStart(2, "0")}.jpg`);
    await pg.screenshot({ path: f, type: "jpeg", quality: 92 });
    if (r.out.length) bad++;
    console.log(`${p.id}/${k}`.padEnd(8), `art ${String(r.art).padStart(3)}`, r.out.length ? "!! " + r.out.join(" | ") : "ok");
  }
}
await b.close();
console.log(bad ? `${bad} slide(s) with problems` : "all clean");
