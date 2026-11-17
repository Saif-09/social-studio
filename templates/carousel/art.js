// Flat editorial illustrations, ink outline, drawn in code. No people, no faces.
// ART[name](P) -> [viewBox, svg]. P = {ink, a: accent, s: soft accent tint, g: gold, p: paper, d: deep}
(function () {
  const f = (x) => (+x).toFixed(1);
  const S = (P, w = 6) => `stroke="${P.ink}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const star = (cx, cy, r, fill) => { let d = ""; for (let i = 0; i < 10; i++) { const a = (i * Math.PI) / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; d += `${i ? "L" : "M"}${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))} `; } return `<path d="${d}Z" fill="${fill}"/>`; };
  const star8 = (cx, cy, r, attrs) => { let d = ""; for (let i = 0; i < 16; i++) { const a = (i * Math.PI) / 8 - Math.PI / 2, rr = i % 2 ? r * 0.74 : r; d += `${i ? "L" : "M"}${f(cx + rr * Math.cos(a))} ${f(cy + rr * Math.sin(a))} `; } return `<path d="${d}Z" ${attrs}/>`; };
  // crescent: a gold disc with a sky-coloured disc over it (no arc maths)
  const moon = (cx, cy, r, P, sky) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${P.g}"/><circle cx="${cx + r * 0.42}" cy="${cy - r * 0.22}" r="${r * 0.86}" fill="${sky}"/>`;
  const sparkle = (x, y, r, c) => `<path d="M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r}Z" fill="${c}"/>`;
  const drop = (x, y, r, fill, P, w = 5) => `<path d="M${x} ${y - r * 1.7} C ${x + r * 0.9} ${y - r * 0.5} ${x + r} ${y - r * 0.2} ${x + r} ${y + r * 0.2} A ${r} ${r} 0 0 1 ${x - r} ${y + r * 0.2} C ${x - r} ${y - r * 0.2} ${x - r * 0.9} ${y - r * 0.5} ${x} ${y - r * 1.7}Z" fill="${fill}" ${S(P, w)}/>`;
  const palm = (P, flip) => `<g ${flip ? 'transform="translate(400 0) scale(-1 1)"' : ""}><path d="M180 340 C 176 280 186 210 214 150" fill="none" stroke="${P.ink}" stroke-width="22" stroke-linecap="round"/><path d="M180 340 C 176 280 186 210 214 150" fill="none" stroke="#B98A4E" stroke-width="13" stroke-linecap="round"/>
    ${[[-150, 70, 40], [-110, 40, 26], [-60, 20, 0], [-20, 50, -24], [20, 90, -40]].map(([dx, dy, c]) => `<path d="M214 150 Q ${214 + dx * 0.5} ${150 - 60 + c * 0.2} ${214 + dx} ${150 + dy - 60} Q ${214 + dx * 0.55} ${150 - 20} 214 150Z" fill="${P.a}" ${S(P, 4)}/>`).join("")}
    ${[[150, 70], [100, 30], [60, 100]].map(([dx, dy]) => `<path d="M214 150 Q ${214 + dx * 0.5} ${90} ${214 + dx} ${150 + dy - 60} Q ${214 + dx * 0.55} ${130} 214 150Z" fill="${P.a}" ${S(P, 4)}/>`).join("")}
    <circle cx="206" cy="162" r="9" fill="#7A3E2A"/><circle cx="222" cy="164" r="8" fill="#7A3E2A"/></g>`;
  const ART = {
    // ---------- covers (wide 600x400)
    "night-window": (P) => ["0 0 600 400", `
      <path d="M170 330 V150 C170 70 230 30 300 30 C370 30 430 70 430 150 V330 Z" fill="${P.d}" ${S(P)}/>
      ${moon(340, 110, 44, P, P.d)}${star(230, 90, 9, P.g)}${star(262, 150, 6, P.g)}${star(380, 200, 7, P.g)}${star(220, 210, 5, P.g)}${sparkle(300, 70, 8, "#F4E7C6")}
      <path d="M300 30 V330 M170 190 H430" ${S(P, 5)} opacity=".35"/>
      <rect x="70" y="270" width="460" height="80" rx="16" fill="${P.p}" ${S(P)}/>
      <path d="M90 270 C 90 236 120 222 180 222 C 230 222 250 240 250 270 Z" fill="#FFFFFF" ${S(P)}/>
      <path d="M240 270 C 300 248 420 244 520 262 L 530 300 L 250 300 Z" fill="${P.a}" ${S(P)}/>
      <path d="M70 350 V380 M530 350 V380" ${S(P)}/>`],
    "scale": (P) => ["0 0 600 400", `
      <path d="M300 40 V340" ${S(P, 8)}/><rect x="230" y="336" width="140" height="26" rx="10" fill="${P.a}" ${S(P)}/>
      <circle cx="300" cy="40" r="14" fill="${P.g}" ${S(P)}/>
      <path d="M120 120 L 480 70" ${S(P, 8)}/>
      <path d="M120 120 L 70 230 M120 120 L 170 230 M480 70 L 430 170 M480 70 L 530 170" ${S(P, 4)}/>
      <path d="M50 230 H190 C 190 270 160 290 120 290 C 80 290 50 270 50 230Z" fill="${P.a}" ${S(P)}/>
      <path d="M410 170 H550 C 550 210 520 230 480 230 C 440 230 410 210 410 170Z" fill="${P.p}" ${S(P)}/>
      ${sparkle(120, 196, 18, P.g)}${sparkle(150, 176, 10, P.g)}${sparkle(92, 180, 8, P.g)}
      <rect x="452" y="140" width="56" height="30" rx="6" fill="${P.s}" ${S(P, 4)}/>`],
    "mushaf": (P) => ["0 0 600 400", `
      <ellipse cx="300" cy="120" rx="220" ry="90" fill="${P.g}" opacity=".18"/>
      <path d="M140 330 L 300 250 L 460 330" fill="none" ${S(P, 8)}/><path d="M170 360 L 300 290 L 430 360" fill="none" ${S(P, 8)}/>
      <path d="M300 250 C 240 220 170 214 100 226 V 90 C 170 76 240 84 300 116 Z" fill="${P.p}" ${S(P)}/>
      <path d="M300 250 C 360 220 430 214 500 226 V 90 C 430 76 360 84 300 116 Z" fill="${P.p}" ${S(P)}/>
      <path d="M118 102 C 180 92 240 98 286 124 V 232 C 240 206 180 200 118 210 Z" fill="none" stroke="${P.a}" stroke-width="4"/>
      <path d="M482 102 C 420 92 360 98 314 124 V 232 C 360 206 420 200 482 210 Z" fill="none" stroke="${P.a}" stroke-width="4"/>
      ${[0, 1, 2, 3, 4].map((k) => `<path d="M140 ${130 + k * 18} C 190 ${122 + k * 18} 230 ${126 + k * 18} 268 ${142 + k * 18}" stroke="${P.ink}" stroke-width="3" opacity=".45" fill="none"/><path d="M460 ${130 + k * 18} C 410 ${122 + k * 18} 370 ${126 + k * 18} 332 ${142 + k * 18}" stroke="${P.ink}" stroke-width="3" opacity=".45" fill="none"/>`).join("")}
      ${star8(300, 60, 22, `fill="${P.g}" ${S(P, 4)}`)}${sparkle(200, 50, 10, P.g)}${sparkle(410, 44, 12, P.g)}`],
    "house-night": (P) => ["0 0 600 400", `
      <rect x="0" y="0" width="600" height="300" rx="30" fill="${P.d}"/>${moon(480, 80, 34, P, P.d)}${star(120, 70, 7, P.g)}${star(200, 40, 5, P.g)}${star(400, 150, 5, P.g)}
      <path d="M150 340 V170 L 300 80 L 450 170 V340 Z" fill="${P.p}" ${S(P)}/>
      <path d="M130 180 L 300 70 L 470 180" fill="none" ${S(P, 10)}/>
      <path d="M262 340 V 260 C 262 238 338 238 338 260 V340" fill="${P.g}" ${S(P)}/>
      <path d="M190 200 h50 v50 h-50 Z M360 200 h50 v50 h-50 Z" fill="${P.g}" ${S(P)}/>
      <path d="M215 200 v50 M190 225 h50 M385 200 v50 M360 225 h50" ${S(P, 4)}/>
      <ellipse cx="300" cy="350" rx="230" ry="16" fill="${P.a}" opacity=".35"/>
      <path d="M300 340 L 250 400 H 350 Z" fill="${P.g}" opacity=".35"/>`],
    "wash": (P) => ["0 0 600 400", `
      <path d="M160 70 H 420 C 440 70 450 80 450 100 V 340 H 190 C 170 340 160 330 160 310 Z" fill="${P.p}" ${S(P)}/>
      ${[0, 1, 2, 3, 4, 5].map((k) => `<path d="M195 ${120 + k * 34} H ${410 - (k % 3) * 40}" stroke="${P.ink}" stroke-width="5" opacity=".35"/>`).join("")}
      <path d="M200 200 C 240 180 300 230 360 196 C 400 176 420 220 400 260 C 360 300 260 290 220 270 C 190 254 180 214 200 200Z" fill="${P.ink}" opacity=".18"/>
      <path d="M470 40 C 470 120 420 160 360 180" fill="none" stroke="${P.a}" stroke-width="22" stroke-linecap="round" opacity=".85"/>
      ${drop(420, 210, 16, P.s, P, 4)}${drop(380, 250, 12, P.s, P, 4)}${drop(330, 230, 10, P.s, P, 4)}${sparkle(250, 140, 14, P.g)}${sparkle(300, 110, 9, P.g)}`],
    "garden": (P) => ["0 0 600 400", `
      <rect x="0" y="0" width="600" height="400" rx="34" fill="${P.s}" opacity=".55"/>
      <circle cx="300" cy="170" r="110" fill="${P.g}" opacity=".35"/>
      <path d="M200 260 V 170 C 200 130 240 110 260 100 C 280 110 320 130 320 170 V260 Z" fill="${P.p}" ${S(P)}/>
      <path d="M330 260 V 190 C 330 160 360 150 380 140 C 400 150 430 160 430 190 V260 Z" fill="${P.p}" ${S(P)}/>
      <path d="M260 100 V 70 M380 140 V 115" ${S(P, 5)}/>${star(260, 62, 8, P.g)}${star(380, 108, 7, P.g)}
      <path d="M244 260 v-50 c 0 -24 32 -24 32 0 v50 M366 260 v-40 c 0 -18 28 -18 28 0 v40" fill="${P.d}" ${S(P, 4)}/>
      <g transform="translate(-60 30) scale(.85)">${palm(P)}</g><g transform="translate(250 50) scale(.8)">${palm(P, 1)}</g>
      <path d="M0 290 C 120 270 240 300 330 286 C 420 272 520 290 600 280 V 400 H 0 Z" fill="${P.a}" ${S(P)}/>
      <path d="M40 330 C 140 316 230 344 330 330 C 420 318 500 336 570 326" fill="none" stroke="${P.p}" stroke-width="7" stroke-linecap="round" opacity=".8"/>
      <path d="M80 366 C 180 354 260 376 360 366 C 440 358 500 370 540 364" fill="none" stroke="${P.p}" stroke-width="5" stroke-linecap="round" opacity=".6"/>`],
    // ---------- items (400x400)
    "wudu": (P) => ["0 0 400 400", `
      <path d="M100 70 H 230 C 260 70 270 90 270 110 V 140" fill="none" ${S(P, 18)}/><path d="M100 70 H 230 C 260 70 270 90 270 110 V 140" fill="none" stroke="${P.g}" stroke-width="7" stroke-linecap="round"/>
      <rect x="140" y="40" width="40" height="22" rx="6" fill="${P.a}" ${S(P)}/>
      ${drop(270, 190, 16, P.s, P)}${drop(258, 250, 12, P.s, P)}${drop(282, 290, 10, P.s, P)}
      <path d="M120 300 H 330 C 330 350 290 370 225 370 C 160 370 120 350 120 300Z" fill="${P.a}" ${S(P)}/>
      <path d="M150 300 C 190 316 270 316 300 300" stroke="${P.p}" stroke-width="5" fill="none"/>`],
    "bed-dust": (P) => ["0 0 400 400", `
      <rect x="40" y="200" width="320" height="90" rx="14" fill="${P.p}" ${S(P)}/>
      <path d="M40 290 V 340 M360 290 V340" ${S(P)}/>
      <path d="M60 200 C 60 170 90 160 130 160 C 170 160 180 176 180 200Z" fill="#FFFFFF" ${S(P)}/>
      <path d="M220 120 C 270 90 320 110 340 150 L 300 200 C 280 170 250 160 220 170 Z" fill="${P.a}" ${S(P)}/>
      <path d="M210 100 C 200 80 214 60 236 66 M350 120 C 370 110 380 130 372 146" ${S(P, 4)} fill="none"/>
      ${sparkle(250, 230, 12, P.g)}${sparkle(300, 250, 8, P.g)}${sparkle(200, 250, 7, P.g)}
      <text x="200" y="385" text-anchor="middle" font-family="Inter" font-weight="800" font-size="34" fill="${P.a}">× 3</text>`],
    "cupped-hands": (P) => ["0 0 400 400", `
      <path d="M200 330 C 150 330 80 300 70 230 C 66 206 84 196 100 210 L 140 250 L 120 150 C 116 130 140 124 148 144 L 176 236 L 172 120 C 172 100 198 100 198 120 L 200 240 Z" fill="${P.s}" ${S(P)}/>
      <path d="M200 330 C 250 330 320 300 330 230 C 334 206 316 196 300 210 L 260 250 L 280 150 C 284 130 260 124 252 144 L 224 236 L 228 120 C 228 100 202 100 202 120 L 200 240 Z" fill="${P.s}" ${S(P)}/>
      ${sparkle(150, 70, 16, P.g)}${sparkle(200, 50, 20, P.g)}${sparkle(250, 70, 16, P.g)}
      <text x="200" y="385" text-anchor="middle" font-family="Inter" font-weight="800" font-size="34" fill="${P.a}">× 3</text>`],
    "shield": (P) => ["0 0 400 400", `
      <path d="M200 40 L 320 80 V 190 C 320 270 270 320 200 360 C 130 320 80 270 80 190 V 80 Z" fill="${P.a}" ${S(P)}/>
      <path d="M200 68 L 296 100 V 190 C 296 254 258 296 200 330 C 142 296 104 254 104 190 V 100 Z" fill="none" stroke="${P.g}" stroke-width="5"/>
      ${star8(200, 180, 62, `fill="${P.p}" ${S(P, 4)}`)}
      <text x="200" y="196" text-anchor="middle" font-family="Amiri" font-weight="700" font-size="38" fill="${P.ink}">الكرسي</text>`],
    "mushaf-small": (P) => ["0 0 400 400", `
      <path d="M200 300 C 150 270 90 262 40 270 V 110 C 90 100 150 108 200 140 Z" fill="${P.p}" ${S(P)}/>
      <path d="M200 300 C 250 270 310 262 360 270 V 110 C 310 100 250 108 200 140 Z" fill="${P.p}" ${S(P)}/>
      ${[0, 1, 2, 3].map((k) => `<path d="M64 ${150 + k * 26} C 110 ${144 + k * 26} 150 ${148 + k * 26} 184 ${164 + k * 26}" stroke="${P.ink}" stroke-width="3" opacity=".4" fill="none"/>`).join("")}
      <path d="M216 214 C 250 200 300 196 340 200 M216 240 C 250 226 300 222 340 226" stroke="${P.a}" stroke-width="9" stroke-linecap="round"/>
      <path d="M200 300 V 340" ${S(P)}/>${sparkle(300, 70, 16, P.g)}${sparkle(340, 110, 9, P.g)}`],
    "moon-sun": (P) => ["0 0 400 400", `
      <rect x="20" y="80" width="170" height="240" rx="24" fill="${P.d}" ${S(P)}/>${moon(100, 170, 40, P, P.d)}${star(150, 250, 7, P.g)}${star(60, 270, 5, P.g)}
      <rect x="210" y="80" width="170" height="240" rx="24" fill="${P.s}" ${S(P)}/>
      <circle cx="295" cy="250" r="44" fill="${P.g}" ${S(P)}/><rect x="212" y="250" width="166" height="68" fill="${P.s}"/><path d="M212 250 H378" ${S(P)}/>
      ${[-60, -30, 0, 30, 60].map((a) => { const r1 = 58, r2 = 80, t = (a - 90) * Math.PI / 180; return `<path d="M${f(295 + r1 * Math.cos(t))} ${f(250 + r1 * Math.sin(t))} L ${f(295 + r2 * Math.cos(t))} ${f(250 + r2 * Math.sin(t))}" ${S(P, 5)}/>`; }).join("")}`],
    "scale-words": (P) => ["0 0 400 400", `
      <path d="M200 50 V 330" ${S(P, 7)}/><rect x="150" y="326" width="100" height="24" rx="8" fill="${P.a}" ${S(P)}/>
      <path d="M70 140 L 330 80" ${S(P, 7)}/><circle cx="200" cy="50" r="12" fill="${P.g}" ${S(P)}/>
      <path d="M70 140 L 30 230 M70 140 L 110 230 M330 80 L 290 170 M330 80 L 370 170" ${S(P, 4)}/>
      <path d="M14 230 H126 C 126 266 100 282 70 282 C 40 282 14 266 14 230Z" fill="${P.a}" ${S(P)}/>
      <path d="M274 170 H386 C 386 200 360 214 330 214 C 300 214 274 200 274 170Z" fill="${P.p}" ${S(P)}/>
      ${sparkle(70, 206, 16, P.g)}${sparkle(96, 190, 9, P.g)}`],
    "waves": (P) => ["0 0 400 400", `
      <path d="M0 210 C 50 180 90 240 140 210 C 190 180 230 240 280 210 C 330 180 370 240 400 210 V400 H0Z" fill="${P.a}" ${S(P)}/>
      <path d="M0 280 C 50 250 90 310 140 280 C 190 250 230 310 280 280 C 330 250 370 310 400 280" fill="none" stroke="${P.p}" stroke-width="6" opacity=".7"/>
      ${[[60, 190, 14], [110, 170, 9], [200, 180, 16], [250, 160, 8], [320, 185, 13], [360, 165, 7], [160, 150, 6], [290, 140, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFFFFF" ${S(P, 3)}/>`).join("")}
      <text x="200" y="100" text-anchor="middle" font-family="Inter" font-weight="900" font-size="64" fill="${P.ink}">× 100</text>`],
    "smile": (P) => ["0 0 400 400", `
      <path d="M60 80 H 340 C 362 80 370 92 370 110 V 260 C 370 280 360 290 340 290 H 170 L 110 340 L 120 290 H 60 C 40 290 30 280 30 260 V 110 C 30 92 40 80 60 80Z" fill="${P.s}" ${S(P)}/>
      <path d="M130 200 C 160 250 240 250 270 200" fill="none" ${S(P, 12)}/>
      <circle cx="150" cy="150" r="13" fill="${P.ink}"/><circle cx="250" cy="150" r="13" fill="${P.ink}"/>${sparkle(340, 70, 18, P.g)}`],
    "sunrise": (P) => ["0 0 400 400", `
      <circle cx="200" cy="250" r="90" fill="${P.g}" ${S(P)}/>
      ${Array.from({ length: 9 }, (_, k) => { const t = Math.PI + (k * Math.PI) / 8; return `<path d="M${f(200 + 115 * Math.cos(t))} ${f(250 + 115 * Math.sin(t))} L ${f(200 + 160 * Math.cos(t))} ${f(250 + 160 * Math.sin(t))}" ${S(P, 7)}/>`; }).join("")}
      <rect x="10" y="250" width="380" height="140" fill="${P.p}"/><path d="M10 250 H 390" ${S(P, 7)}/>
      <path d="M60 300 H 340 M110 340 H 290" stroke="${P.a}" stroke-width="8" stroke-linecap="round"/>`],
    "branch": (P) => ["0 0 400 400", `
      <path d="M150 40 L 30 380 H 370 L 250 40 Z" fill="${P.s}" ${S(P)}/>
      <path d="M200 70 V 110 M200 160 V 210 M200 260 V 320" stroke="${P.p}" stroke-width="10" stroke-linecap="round"/>
      <path d="M280 300 C 320 260 350 240 390 230" fill="none" stroke="${P.a}" stroke-width="12" stroke-linecap="round"/>
      ${[[300, 280, -1], [330, 256, 1], [358, 242, -1], [316, 268, 1]].map(([x, y, d]) => `<path d="M${x} ${y} l ${10 * d} ${-16}" stroke="${P.a}" stroke-width="6" stroke-linecap="round"/>`).join("")}
      <path d="M260 340 C 300 330 330 320 350 300" fill="none" ${S(P, 4)} stroke-dasharray="4 12"/>
      ${sparkle(110, 120, 16, P.g)}${sparkle(80, 170, 9, P.g)}`],
    "well": (P) => ["0 0 400 400", `
      <path d="M40 200 H 220 V 340 C 220 360 200 370 130 370 C 60 370 40 360 40 340 Z" fill="${P.p}" ${S(P)}/>
      ${[0, 1, 2].map((k) => `<path d="M40 ${240 + k * 40} H 220" ${S(P, 4)} opacity=".6"/>`).join("")}
      <ellipse cx="130" cy="200" rx="90" ry="20" fill="${P.d}" ${S(P)}/>
      <path d="M50 200 V 90 M210 200 V 90 M36 90 H 224" ${S(P, 8)}/><path d="M130 90 V 150" ${S(P, 3)}/>
      <path d="M115 150 h30 l -4 30 h -22 Z" fill="${P.a}" ${S(P, 4)}/>
      <g transform="translate(240 230)"><path d="M10 100 V 60 C 10 40 30 30 60 30 H 100 C 112 30 116 20 120 10 L 136 20 C 144 30 142 44 130 50 V 100 M100 100 V 64 M40 100 V 64" fill="${P.s}" ${S(P)}/>
      <path d="M10 60 C -6 54 -10 40 -4 30" fill="none" ${S(P, 5)}/><circle cx="124" cy="26" r="3.5" fill="${P.ink}"/></g>
      ${drop(205, 270, 12, P.s, P, 4)}`],
    "drip": (P) => ["0 0 400 400", `
      <path d="M60 60 H 340" ${S(P, 8)}/><path d="M200 60 V 90" ${S(P, 8)}/>
      ${drop(200, 140, 18, P.s, P)}${drop(200, 220, 12, P.s, P)}
      <path d="M40 300 C 40 270 120 260 200 260 C 280 260 360 270 360 300 V 360 H 40 Z" fill="${P.a}" ${S(P)}/>
      <ellipse cx="200" cy="290" rx="60" ry="14" fill="${P.d}" opacity=".5"/>
      <path d="M150 300 C 170 310 230 310 250 300" stroke="${P.p}" stroke-width="5" fill="none"/>`],
    "hands-raised": (P) => ["0 0 400 400", `
      <circle cx="200" cy="120" r="70" fill="${P.g}" opacity=".3"/>${sparkle(200, 70, 20, P.g)}${sparkle(150, 110, 9, P.g)}${sparkle(254, 104, 11, P.g)}
      <path d="M190 370 L 180 260 C 150 250 110 220 100 170 C 96 150 118 144 126 162 L 140 190 L 132 130 C 130 112 154 110 156 128 L 166 186 L 168 120 C 168 102 192 102 192 120 L 194 200 Z" fill="${P.s}" ${S(P)}/>
      <path d="M210 370 L 220 260 C 250 250 290 220 300 170 C 304 150 282 144 274 162 L 260 190 L 268 130 C 270 112 246 110 244 128 L 234 186 L 232 120 C 232 102 208 102 208 120 L 206 200 Z" fill="${P.s}" ${S(P)}/>`],
    "broom-pot": (P) => ["0 0 400 400", `
      <path d="M90 60 L 150 270" ${S(P, 10)}/><path d="M120 260 L 180 250 L 210 360 L 100 380 Z" fill="${P.g}" ${S(P)}/>
      <path d="M135 300 L 150 372 M160 296 L 176 366" ${S(P, 4)}/>
      <path d="M220 230 H 370 V 320 C 370 350 350 364 295 364 C 240 364 220 350 220 320 Z" fill="${P.a}" ${S(P)}/>
      <path d="M210 230 H 380" ${S(P, 10)}/><path d="M270 214 h50" ${S(P, 10)}/>
      <path d="M260 190 C 250 170 274 160 264 140 M300 190 C 290 170 314 160 304 140 M340 190 C 330 170 354 160 344 140" fill="none" ${S(P, 4)} opacity=".6"/>`],
    "sandal": (P) => ["0 0 400 400", `
      <path d="M120 360 C 70 360 60 300 70 220 C 80 120 110 60 160 60 C 210 60 230 120 230 200 C 230 290 200 360 120 360Z" fill="${P.a}" ${S(P)}/>
      <path d="M90 170 C 120 200 180 200 220 160 M100 240 C 140 230 180 230 214 250" fill="none" stroke="${P.p}" stroke-width="12" stroke-linecap="round"/>
      <path d="M260 90 L 350 330" ${S(P, 6)}/><ellipse cx="262" cy="96" rx="7" ry="13" fill="${P.p}" ${S(P, 4)} transform="rotate(-20 262 96)"/>
      <path d="M262 96 C 300 60 340 80 320 130 C 300 180 240 170 214 160" fill="none" stroke="${P.g}" stroke-width="5"/>`],
    "rose": (P) => ["0 0 400 400", `
      <path d="M200 380 C 200 300 196 240 200 190" fill="none" stroke="#5E7F4A" stroke-width="10" stroke-linecap="round"/>
      <path d="M200 290 C 150 270 120 240 130 210 C 170 214 196 250 200 290Z" fill="#8FAE6E" ${S(P, 4)}/>
      <path d="M200 260 C 250 246 280 214 270 186 C 230 190 206 226 200 260Z" fill="#8FAE6E" ${S(P, 4)}/>
      <path d="M200 200 C 140 200 120 150 130 100 C 150 120 170 110 180 80 C 196 100 204 100 220 80 C 230 110 250 120 270 100 C 280 150 260 200 200 200Z" fill="${P.a}" ${S(P)}/>
      <path d="M200 196 C 186 160 186 130 200 104 C 214 130 214 160 200 196" fill="none" stroke="${P.p}" stroke-width="4" opacity=".7"/>`],
    "plate": (P) => ["0 0 400 400", `
      <ellipse cx="200" cy="250" rx="170" ry="90" fill="${P.p}" ${S(P)}/><ellipse cx="200" cy="244" rx="120" ry="58" fill="none" stroke="${P.a}" stroke-width="5"/>
      <path d="M110 240 C 110 200 180 190 220 200 C 250 208 250 240 220 250 C 180 262 110 270 110 240Z" fill="${P.g}" ${S(P)}/>
      ${[[255, 236], [285, 250], [270, 270], [300, 226]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="18" ry="11" fill="#7A3E2A" ${S(P, 4)}/>`).join("")}
      <path d="M150 140 C 140 120 160 110 150 90 M200 140 C 190 120 210 110 200 90 M250 140 C 240 120 260 110 250 90" fill="none" ${S(P, 4)} opacity=".5"/>`],
    "footprints": (P) => ["0 0 400 400", `
      <path d="M0 330 C 120 300 280 300 400 330 V400 H0Z" fill="${P.s}"/>
      ${[[60, 300, -10], [110, 250, 10], [160, 210, -10], [210, 160, 10], [260, 120, -10]].map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="14" ry="24" fill="${P.a}"/><circle cx="${x}" cy="${y - 34}" r="5" fill="${P.a}"/></g>`).join("")}
      ${[[150, 340, -10], [200, 290, 10], [250, 250, -10], [300, 200, 10], [345, 160, -10]].map(([x, y, r]) => `<g transform="rotate(${r} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="11" ry="19" fill="${P.ink}" opacity=".8"/><circle cx="${x}" cy="${y - 27}" r="4" fill="${P.ink}" opacity=".8"/></g>`).join("")}
      <path d="M300 60 h70 M320 84 h50 M290 108 h60" stroke="${P.g}" stroke-width="8" stroke-linecap="round"/>`],
    "cup": (P) => ["0 0 400 400", `
      <path d="M100 160 H 280 V 290 C 280 340 250 360 190 360 C 130 360 100 340 100 290 Z" fill="${P.a}" ${S(P)}/>
      <path d="M280 190 C 340 190 350 260 280 270" fill="none" ${S(P, 10)}/>
      <ellipse cx="190" cy="160" rx="90" ry="18" fill="${P.p}" ${S(P)}/>
      <path d="M232 152 C 238 146 252 146 258 152" stroke="#C05B5B" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M150 120 C 140 100 160 90 150 70 M190 120 C 180 100 200 90 190 70 M230 120 C 220 100 240 90 230 70" fill="none" ${S(P, 4)} opacity=".5"/>
      ${sparkle(320, 110, 14, P.g)}`],
    "hearts": (P) => ["0 0 400 400", `
      <path d="M170 330 C 60 260 40 200 60 150 C 80 104 140 100 170 150 C 200 100 260 104 280 150 C 300 200 280 260 170 330Z" fill="${P.a}" ${S(P)}/>
      <path d="M300 250 C 250 218 240 190 250 168 C 260 146 288 144 300 168 C 312 144 340 146 350 168 C 360 190 350 218 300 250Z" fill="${P.g}" ${S(P)}/>
      ${sparkle(110, 80, 14, P.g)}${sparkle(330, 110, 10, P.g)}`],
    "drop-big": (P) => ["0 0 400 400", `${drop(200, 230, 100, P.s, P, 7)}
      <path d="M150 250 C 150 290 180 310 210 310" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round"/>
      ${drop(330, 120, 18, P.s, P, 4)}${drop(80, 140, 14, P.s, P, 4)}${sparkle(320, 260, 14, P.g)}`],
    "river": (P) => ["0 0 400 400", `
      <path d="M0 160 C 80 140 160 180 240 160 C 300 146 350 160 400 150 V 300 C 330 310 280 290 220 300 C 140 314 70 290 0 300Z" fill="${P.a}" ${S(P)}/>
      <path d="M30 220 C 90 206 140 236 200 222 C 260 208 320 232 380 220" fill="none" stroke="${P.p}" stroke-width="7" stroke-linecap="round" opacity=".8"/>
      ${[0, 1, 2, 3, 4].map((k) => `<circle cx="${60 + k * 70}" cy="80" r="24" fill="${k < 5 ? P.g : P.p}" ${S(P, 5)}/><text x="${60 + k * 70}" y="91" text-anchor="middle" font-family="Inter" font-weight="900" font-size="30" fill="${P.ink}">${k + 1}</text>`).join("")}
      <path d="M0 300 V 360 H 400 V 300" fill="${P.s}" opacity=".6"/>`],
    "lantern": (P) => ["0 0 400 400", `
      <path d="M200 20 V 60" ${S(P, 5)}/><path d="M170 60 H 230 L 240 90 H 160 Z" fill="${P.a}" ${S(P)}/>
      <path d="M160 90 C 120 140 120 260 160 310 H 240 C 280 260 280 140 240 90 Z" fill="${P.g}" ${S(P)}/>
      <path d="M200 90 V 310 M140 200 H 260" ${S(P, 4)} opacity=".5"/>
      <path d="M160 310 H 240 L 226 340 H 174 Z" fill="${P.a}" ${S(P)}/>
      ${moon(330, 80, 30, P, P.p)}${star(70, 110, 9, P.g)}${star(340, 250, 7, P.g)}`],
    "kaaba": (P) => ["0 0 400 400", `
      <path d="M90 140 L 200 100 L 330 130 V 320 L 200 360 L 90 320 Z" fill="#1A1A1A" ${S(P)}/>
      <path d="M200 100 V 360" stroke="#444" stroke-width="5"/>
      <path d="M90 176 L 200 140 L 330 168 V 196 L 200 168 L 90 204 Z" fill="${P.g}" ${S(P, 4)}/>
      <path d="M240 240 h 36 v 80 h -36 Z" fill="${P.g}" ${S(P, 4)}/>
      <ellipse cx="210" cy="370" rx="190" ry="22" fill="${P.s}" opacity=".7"/>`],
    "eraser": (P) => ["0 0 400 400", `
      <rect x="40" y="60" width="260" height="300" rx="16" fill="${P.p}" ${S(P)}/>
      ${[0, 1, 2, 3, 4, 5, 6].map((k) => `<path d="M70 ${110 + k * 34} H ${270 - (k % 3) * 30}" stroke="${P.ink}" stroke-width="5" opacity=".3"/>`).join("")}
      <path d="M90 210 C 120 190 170 230 210 200 C 240 186 250 230 220 250 C 180 270 110 260 90 240Z" fill="${P.ink}" opacity=".12"/>
      <g transform="rotate(-35 300 200)"><rect x="250" y="160" width="130" height="70" rx="12" fill="${P.a}" ${S(P)}/><rect x="250" y="160" width="46" height="70" rx="12" fill="${P.g}" ${S(P)}/></g>
      ${sparkle(150, 300, 14, P.g)}${sparkle(190, 320, 8, P.g)}`],
    "thorn": (P) => ["0 0 400 400", `
      <path d="M60 330 C 140 300 220 240 340 90" fill="none" stroke="#5E7F4A" stroke-width="12" stroke-linecap="round"/>
      ${[[120, 304, -1], [180, 262, 1], [240, 206, -1], [292, 150, 1]].map(([x, y, d]) => `<path d="M${x} ${y} l ${d * 22} ${-26 + d * -2} l ${d * -4} ${22}" fill="#5E7F4A" ${S(P, 3)}/>`).join("")}
      <circle cx="210" cy="230" r="70" fill="none" stroke="${P.a}" stroke-width="6" stroke-dasharray="10 12"/>
      ${sparkle(300, 290, 16, P.g)}${sparkle(90, 120, 12, P.g)}`],
    "door": (P) => ["0 0 400 400", `
      <path d="M80 370 V 120 C 80 60 140 30 200 30 C 260 30 320 60 320 120 V 370 Z" fill="${P.g}" ${S(P)}/>
      <path d="M80 370 V 120 C 80 80 110 60 140 52 L 170 80 V 360 Z" fill="${P.a}" ${S(P)}/>
      <path d="M200 370 L 120 400 H 320 L 260 370" fill="${P.g}" opacity=".4"/>
      ${sparkle(240, 160, 20, "#FFFFFF")}${sparkle(280, 230, 10, "#FFFFFF")}<circle cx="150" cy="230" r="7" fill="${P.g}" ${S(P, 3)}/>`],
    "curtain": (P) => ["0 0 400 400", `
      <rect x="40" y="40" width="320" height="320" rx="20" fill="${P.g}" opacity=".5" ${S(P)}/>
      ${sparkle(200, 190, 40, "#FFFFFF")}${sparkle(130, 130, 14, "#FFFFFF")}${sparkle(270, 270, 16, "#FFFFFF")}
      <path d="M40 40 H 190 C 170 120 160 260 120 360 H 40 Z" fill="${P.a}" ${S(P)}/>
      <path d="M360 40 H 210 C 230 120 240 260 280 360 H 360 Z" fill="${P.a}" ${S(P)}/>
      <path d="M80 60 C 90 160 80 260 70 350 M330 60 C 320 160 330 260 340 350" fill="none" stroke="${P.p}" stroke-width="4" opacity=".4"/>`],
    "globe10": (P) => ["0 0 400 400", `
      <circle cx="120" cy="230" r="80" fill="${P.s}" ${S(P)}/>
      <path d="M70 190 C 100 180 110 210 140 200 C 160 194 170 210 180 220 M60 250 C 90 240 120 270 150 260" fill="none" stroke="${P.a}" stroke-width="10" stroke-linecap="round"/>
      <text x="318" y="268" text-anchor="middle" font-family="Inter" font-weight="900" font-size="100" fill="${P.a}">×10</text>
      ${sparkle(330, 110, 20, P.g)}${sparkle(260, 90, 10, P.g)}`],
    "whip": (P) => ["0 0 400 400", `
      <circle cx="270" cy="210" r="110" fill="${P.s}" ${S(P)}/>
      <path d="M190 180 C 230 160 250 200 290 190 C 320 182 340 200 360 214 M180 250 C 220 236 260 270 300 258" fill="none" stroke="${P.a}" stroke-width="12" stroke-linecap="round"/>
      <rect x="30" y="300" width="120" height="40" rx="8" fill="${P.g}" ${S(P)}/>
      ${[0, 1, 2, 3, 4].map((k) => `<path d="M${50 + k * 20} 300 v 16" ${S(P, 3)}/>`).join("")}
      ${sparkle(90, 270, 18, P.g)}${sparkle(130, 255, 9, P.g)}`],
    "hourglass": (P) => ["0 0 400 400", `
      <path d="M110 50 H 290 M110 350 H 290" ${S(P, 12)}/>
      <path d="M130 60 C 130 150 190 170 200 200 C 210 170 270 150 270 60 Z" fill="${P.p}" ${S(P)}/>
      <path d="M130 340 C 130 250 190 230 200 200 C 210 230 270 250 270 340 Z" fill="${P.p}" ${S(P)}/>
      <path d="M150 340 C 160 300 190 290 200 290 C 210 290 240 300 250 340Z" fill="${P.g}"/>
      <path d="M80 90 L 320 310" stroke="${P.a}" stroke-width="16" stroke-linecap="round"/>`],
    "market": (P) => ["0 0 400 400", `
      ${[[40, 1], [150, 0], [260, 1]].map(([x, c]) => `<rect x="${x}" y="200" width="100" height="140" fill="${P.p}" ${S(P)}/><path d="M${x - 8} 200 L ${x + 10} 150 H ${x + 90} L ${x + 108} 200 Z" fill="${c ? P.a : P.g}" ${S(P)}/>`).join("")}
      <path d="M20 110 C 90 90 140 120 200 100 C 260 80 310 110 380 92" fill="none" stroke="${P.a}" stroke-width="7" stroke-linecap="round" opacity=".6"/>
      <path d="M50 70 C 120 50 170 80 230 60" fill="none" stroke="${P.a}" stroke-width="5" stroke-linecap="round" opacity=".4"/>
      ${sparkle(330, 50, 14, P.g)}<path d="M10 340 H 390" ${S(P)}/>`],
    "fullmoon": (P) => ["0 0 400 400", `
      <rect x="20" y="20" width="360" height="360" rx="30" fill="${P.d}"/>
      <circle cx="200" cy="180" r="110" fill="${P.g}" opacity=".25"/><circle cx="200" cy="180" r="84" fill="#F6E7B4" ${S(P, 5)}/>
      ${star(80, 80, 8, P.g)}${star(320, 90, 6, P.g)}${star(330, 290, 7, P.g)}${star(70, 260, 5, P.g)}
      <path d="M20 330 C 120 300 280 300 380 330 V 360 C 380 372 372 380 360 380 H 40 C 28 380 20 372 20 360Z" fill="${P.a}"/>`],
    "radiant": (P) => ["0 0 400 400", `
      ${Array.from({ length: 16 }, (_, k) => { const t = (k * Math.PI) / 8; return `<path d="M${f(200 + 90 * Math.cos(t))} ${f(200 + 90 * Math.sin(t))} L ${f(200 + (k % 2 ? 140 : 175) * Math.cos(t))} ${f(200 + (k % 2 ? 140 : 175) * Math.sin(t))}" stroke="${P.g}" stroke-width="10" stroke-linecap="round"/>`; }).join("")}
      ${star8(200, 200, 78, `fill="${P.a}" ${S(P)}`)}<circle cx="200" cy="200" r="34" fill="${P.p}" ${S(P, 5)}/>`],
  };
  window.ART = ART;
  // ---------- dark scenes for single posts (1080x1350, whole background)
  const R = (k) => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const stars = (n, h, seed = 1) => Array.from({ length: n }, (_, k) => `<circle cx="${f(R(k + seed) * 1080)}" cy="${f(R(k + seed + 50) * h)}" r="${f(0.8 + R(k + seed + 9) * 2)}" fill="#F3E6C2" opacity="${f(0.25 + R(k + seed + 3) * 0.6)}"/>`).join("");
  const sky = (id, a, b, c) => `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient></defs><rect width="1080" height="1350" fill="url(#${id})"/>`;
  const ridge = (y, amp, seed, col) => { let d = `M0 1350 L0 ${y}`; for (let x = 0; x <= 1080; x += 20) d += ` L${x} ${f(y + amp * Math.sin(x / 170 + seed) + amp * 0.5 * Math.sin(x / 61 + seed * 2))}`; return `<path d="${d} L1080 1350Z" fill="${col}"/>`; };
  const glow = (cx, cy, r, c, o) => `<radialGradient id="g${cx}${cy}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#g${cx}${cy})"/>`;
  window.SCENE = {
    dunes: () => `${sky("s1", "#0B1424", "#13263A", "#2A3546")}${stars(90, 800)}${glow(800, 300, 260, "#E8B45A", 0.22)}
      <circle cx="800" cy="300" r="70" fill="#E8B45A"/><circle cx="832" cy="284" r="62" fill="#0F1D30"/>
      ${ridge(1060, 26, 1, "#3B3A42")}${ridge(1140, 30, 2.4, "#26252C")}${ridge(1230, 22, 4.1, "#16161B")}`,
    rain: () => `${sky("s2", "#0E1C24", "#14303A", "#0B1A20")}${glow(540, 1150, 420, "#E8B45A", 0.28)}
      ${Array.from({ length: 70 }, (_, k) => `<path d="M${f(R(k) * 1080)} ${f(R(k + 7) * 1350)} l -8 ${f(40 + R(k + 3) * 60)}" stroke="#9FC3C9" stroke-width="2.2" opacity="${f(0.15 + R(k + 2) * 0.35)}" stroke-linecap="round"/>`).join("")}
      ${Array.from({ length: 26 }, (_, k) => `<ellipse cx="${f(R(k + 90) * 1080)}" cy="${f(R(k + 40) * 1350)}" rx="${f(4 + R(k) * 6)}" ry="${f(6 + R(k) * 8)}" fill="#CFE3E6" opacity=".22"/>`).join("")}
      <path d="M0 1240 H1080" stroke="#0A1418" stroke-width="40"/>`,
    lantern: () => `${sky("s3", "#140F0A", "#1F1710", "#0D0A07")}${glow(540, 1110, 460, "#E8B45A", 0.35)}${stars(30, 600, 7)}
      <g transform="translate(540 1070) scale(.6)"><path d="M0 -330 V -250" stroke="#B8893A" stroke-width="5"/><path d="M-40 -250 H40 L52 -214 H-52Z" fill="#8C6A22"/>
      <path d="M-52 -214 C -110 -150 -110 30 -52 90 H52 C 110 30 110 -150 52 -214Z" fill="#E8B45A" opacity=".95"/><path d="M0 -214 V 90 M-90 -60 H90" stroke="#8C6A22" stroke-width="5" opacity=".6"/>
      <path d="M-52 90 H52 L36 128 H-36Z" fill="#8C6A22"/><ellipse cx="0" cy="-40" rx="18" ry="34" fill="#FFF4D6"/></g>
      <rect y="1236" width="1080" height="114" fill="#0A0806"/>`,
    dawn: () => `${sky("s4", "#1C2440", "#7A5A6A", "#E8B48A")}${stars(40, 380, 3)}${glow(540, 1120, 420, "#FFD9A0", 0.55)}
      ${ridge(1080, 60, 0.6, "#4A3E54")}${ridge(1160, 40, 2.2, "#2E2838")}${ridge(1250, 26, 3.7, "#1A1622")}`,
    sea: () => `${sky("s5", "#08121E", "#102A3C", "#1B3A4A")}${stars(80, 700, 11)}
      <circle cx="540" cy="250" r="64" fill="#F3E6C2" opacity=".95"/>${glow(540, 250, 220, "#F3E6C2", 0.18)}
      <rect y="900" width="1080" height="450" fill="#0A1C28"/>${Array.from({ length: 22 }, (_, k) => `<path d="M${f(540 - 40 - R(k) * 140)} ${960 + k * 16} h ${f(80 + R(k + 4) * 280)}" stroke="#F3E6C2" stroke-width="3" opacity="${f(0.5 - k * 0.018)}" stroke-linecap="round"/>`).join("")}`,
    tree: () => `${sky("s6", "#0D1A16", "#173029", "#24433A")}${stars(60, 650, 21)}${glow(540, 1060, 300, "#E8B45A", 0.16)}
      ${ridge(1240, 14, 1.3, "#0F1F1A")}
      <g transform="translate(540 1250) scale(.55)" fill="none" stroke="#0A1411" stroke-linecap="round"><path d="M0 0 C -6 -120 6 -220 0 -320" stroke-width="34"/>
      <path d="M0 -220 C -60 -260 -120 -270 -180 -330 M0 -260 C 70 -300 130 -310 190 -380 M0 -320 C -30 -380 -40 -420 -30 -470 M0 -320 C 40 -370 80 -390 90 -440" stroke-width="16"/></g>
      ${Array.from({ length: 70 }, (_, k) => { const a = R(k) * Math.PI * 2, r = R(k + 30) * 240; return `<circle cx="${f(540 + r * Math.cos(a) * 0.75)}" cy="${f(1035 + r * Math.sin(a) * 0.4)}" r="${f(15 + R(k + 5) * 17)}" fill="${R(k + 2) > 0.8 ? "#3E6B57" : "#2A4C3F"}" opacity=".95"/>`; }).join("")}`,
  };
})();
