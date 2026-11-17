// Deterministic animation kit (from the Flatlay reels): every frame is a pure function of t.
const ART = window.ART_DIR || "art/";   // art folder, relative to the workspace (set window.ART_DIR before lib.js to change)
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const E = {
  lin: (x) => x,
  out: (x) => 1 - Math.pow(1 - x, 3),
  io: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  expo: (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  back: (x) => { const c1 = 1.6, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
};
const pr = (t, a, b, e = E.out) => e(clamp((t - a) / (b - a)));
const mix = (a, b, p) => a + (b - a) * p;

const stage = document.getElementById("stage");
const scenes = [];
function scene(from, to, build, update, z = 1) {
  const el = document.createElement("div");
  el.className = "layer";
  el.style.zIndex = z;
  el.innerHTML = build();
  stage.appendChild(el);
  scenes.push({ from, to, el, update });
}
window.seek = (t) => {
  for (const s of scenes) {
    const on = t >= s.from && t < s.to;
    s.el.style.display = on ? "block" : "none";
    if (on) s.update(s.el, t - s.from, t);
  }
};
const $ = (el, sel) => el.querySelector(sel);
const $$ = (el, sel) => [...el.querySelectorAll(sel)];
// **word** -> marigold block, *word* -> marigold text
const tx = (s) => s.replace(/\*\*(.+?)\*\*/g, '<mark class="hl">$1</mark>').replace(/\*(.+?)\*/g, "<mark>$1</mark>");
const L = (s) => s.split("\n").map((l) => `<div class="ln"><span>${tx(l)}</span></div>`).join("");
function lines(el, t, start, gap = 0.09, dur = 0.4) {
  $$(el, ".ln > span").forEach((s, i) => {
    const p = pr(t, start + i * gap, start + i * gap + dur, E.expo);
    s.style.transform = `translateY(${mix(112, 0, p)}%)`;
  });
}
// Caption block that rises in line by line and fades at the end.
function caption(from, to, text, o = {}) {
  const align = o.center ? "center" : "left";
  const left = o.center ? 80 : 84;
  scene(from, to, () => `<div class="d" style="position:absolute;left:${left}px;top:${o.top ?? 300}px;width:${o.w ?? 920}px;text-align:${align};font-size:${o.size ?? 110}px;text-shadow:0 6px 40px rgba(0,0,0,.5)">${L(text)}</div>`,
    (el, t) => { lines(el, t, o.delay ?? 0.02); el.style.opacity = o.keep ? 1 : 1 - pr(t, to - from - 0.12, to - from); }, o.z ?? 40);
}
const flash = (at, dur = 0.2, op = 0.8, color = "#FFF8E8") => scene(at, at + dur, () => `<div style="position:absolute;inset:0;background:${color}"></div>`, (el, t) => (el.style.opacity = op * (1 - pr(t, 0, dur))), 45);
// Pop elements in with overshoot at the given times.
const popIn = (el, sel, t, at, from = 0.6) => $$(el, sel).forEach((n, i) => {
  const a = at[i] ?? at[at.length - 1]; const p = pr(t, a, a + 0.35, E.back);
  n.style.opacity = pr(t, a, a + 0.08); n.style.scale = mix(from, 1, p);
});
// A stamp that slams down: big and faint to full size.
const slam = (n, t, at) => { const p = pr(t, at, at + 0.22, E.out); n.style.opacity = pr(t, at, at + 0.05); n.style.scale = mix(2.4, 1, p); };

// North Indian kundli chart. planets: {house: [[label, hot]]}
const HOUSE_XY = { 1: [150, 82], 2: [75, 34], 3: [32, 75], 4: [82, 150], 5: [32, 225], 6: [75, 266], 7: [150, 218], 8: [225, 266], 9: [268, 225], 10: [218, 150], 11: [268, 75], 12: [225, 34] };
function chart(size, planets, label) {
  let g = "";
  for (const [h, list] of Object.entries(planets)) {
    const [x, y] = HOUSE_XY[h];
    list.forEach(([p, hot], i) => {
      const yy = y + (i - (list.length - 1) / 2) * 22;
      g += hot
        ? `<circle class="mars" cx="${x}" cy="${yy}" r="17" fill="#E5484D"/><text x="${x}" y="${yy + 6}" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="16" fill="#FFF8E8">${p}</text>`
        : `<text x="${x}" y="${yy + 6}" text-anchor="middle" font-family="Poppins" font-weight="600" font-size="15" fill="#C9C3D3" opacity=".7">${p}</text>`;
    });
  }
  return `<div class="chart" style="position:relative;width:${size}px;height:${size + 90}px">
    <svg viewBox="-6 -6 312 312" width="${size}" height="${size}">
      <rect x="0" y="0" width="300" height="300" rx="10" fill="#221D2B" stroke="#FFC72C" stroke-width="3"/>
      <path d="M0 0 L300 300 M300 0 L0 300 M150 0 L300 150 L150 300 L0 150 Z" fill="none" stroke="#FFC72C" stroke-opacity=".55" stroke-width="2.4"/>
      ${g}
    </svg>
    <div style="text-align:center;margin-top:20px"><span class="tag">${label}</span></div>
  </div>`;
}

// Starfield and glow behind everything, plus grain and vignette on top.
function backdrop(dur) {
  let stars = "";
  let seed = 11;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 110; i++) stars += `<circle cx="${rnd() * 1080}" cy="${rnd() * 2200}" r="${0.8 + rnd() * 2.2}" fill="#FFF8E8" opacity="${0.15 + rnd() * 0.5}"/>`;
  scene(0, dur, () => `<div class="glow" style="position:absolute;left:-300px;top:300px;width:1680px;height:1680px;background:radial-gradient(circle,rgba(232,146,12,.22),rgba(232,146,12,0) 60%)"></div><svg class="sky" width="1080" height="2200" style="position:absolute;left:0;top:0">${stars}</svg>`,
    (el, t) => { $(el, ".sky").style.transform = `translateY(${-t * 9}px)`; $(el, ".glow").style.transform = `translate(${Math.sin(t * 0.4) * 60}px,${Math.cos(t * 0.3) * 80}px)`; }, 0);
  const fx = document.createElement("div");
  fx.style.cssText = "position:absolute;inset:0;pointer-events:none;z-index:60";
  fx.innerHTML = `<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 45%,rgba(0,0,0,0) 55%,rgba(0,0,0,.45) 100%)"></div><canvas width="270" height="480" style="position:absolute;inset:0;width:1080px;height:1920px;opacity:.05;mix-blend-mode:overlay"></canvas>`;
  stage.appendChild(fx);
  const ctx = fx.querySelector("canvas").getContext("2d"), gi = ctx.createImageData(270, 480);
  const inner = window.seek;
  window.seek = (t) => {
    inner(t);
    let s = Math.floor(t * 30) * 9301 + 49297;
    const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < gi.data.length; i += 4) { const v = r() * 255; gi.data[i] = gi.data[i + 1] = gi.data[i + 2] = v; gi.data[i + 3] = 255; }
    ctx.putImageData(gi, 0, 0);
  };
}

const MARK = (size) => `<svg viewBox="0 0 100 100" width="${size}" height="${size}"><defs><linearGradient id="mt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD24D"/><stop offset="1" stop-color="#E8920C"/></linearGradient><radialGradient id="mg" cx=".4" cy=".38" r=".7"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#FFF8E8"/></radialGradient></defs><rect width="100" height="100" rx="22" fill="url(#mt)"/><g transform="rotate(-24 50 50)"><path d="M18 50 A32 13 0 0 1 82 50" fill="none" stroke="rgba(80,45,0,.28)" stroke-width="3.6"/><circle cx="50" cy="50" r="15.5" fill="url(#mg)"/><path d="M18 50 A32 13 0 0 0 82 50" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/></g><circle cx="76.5" cy="33" r="6.6" fill="#6B2A12"/></svg>`;

window.addEventListener("load", async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map((i) => (i.complete ? 0 : new Promise((r) => (i.onload = i.onerror = r)))));
  window.seek(0);
  window.__ready = true;
});
