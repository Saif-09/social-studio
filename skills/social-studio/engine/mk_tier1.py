"""Builds reelNN.html from reel05.html (the Shani tier list that did best) with a new topic config."""
import sys, json
S = 'fill="none" stroke="#FFF8E8" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"'
def C(k): return '${COL[%d]}' % k
ICONS = {
 'phone': lambda k: f'<rect x="32" y="12" width="36" height="66" rx="7" {S}/><path d="M44 70 H56" {S}/><path d="M60 24 A12 12 0 1 0 72 40 A9 9 0 1 1 60 24 Z" fill="{C(k)}" transform="translate(-14 4)"/><path d="M20 88 H80" {S} opacity=".5"/>',
 'coins': lambda k: f'<ellipse cx="40" cy="66" rx="20" ry="8" fill="{C(k)}"/><ellipse cx="40" cy="56" rx="20" ry="8" fill="{C(k)}" opacity=".8"/><ellipse cx="40" cy="46" rx="20" ry="8" fill="{C(k)}" opacity=".6"/><path d="M76 20 V52 M66 30 L76 20 L86 30 M76 60 V88 M66 78 L76 88 L86 78" {S}/>',
 'storm': lambda k: f'<path d="M26 56 A16 16 0 0 1 30 26 A20 20 0 0 1 68 22 A16 16 0 0 1 76 56 Z" fill="#3A3F58" stroke="#FFF8E8" stroke-width="4"/><path d="M52 58 L42 74 H54 L46 90" fill="none" stroke="{C(k)}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
 'plane': lambda k: f'<path d="M14 54 L86 28 L70 50 L86 72 Z" fill="{C(k)}" opacity=".85"/><path d="M14 54 L86 28 L70 50 L86 72 Z M70 50 L40 52" {S}/><path d="M12 80 C30 74 46 78 60 72" {S} opacity=".5" stroke-dasharray="4 6"/>',
 'star': lambda k: f'<path d="M50 10 L60 38 L90 40 L66 58 L74 88 L50 70 L26 88 L34 58 L10 40 L40 38 Z" fill="{C(k)}"/><path d="M50 10 L60 38 L90 40 L66 58 L74 88 L50 70 L26 88 L34 58 L10 40 L40 38 Z" {S} stroke-width="3"/>',
 'bulb': lambda k: f'<path d="M50 14 A24 24 0 0 1 64 58 V68 H36 V58 A24 24 0 0 1 50 14 Z" fill="{C(k)}" opacity=".9"/><path d="M50 14 A24 24 0 0 1 64 58 V68 H36 V58 A24 24 0 0 1 50 14 Z M38 78 H62 M42 86 H58" {S}/><path d="M14 30 L22 34 M86 30 L78 34 M50 2 V6" {S}/>',
 'diya': lambda k: f'<ellipse cx="50" cy="52" rx="34" ry="26" fill="{C(k)}" opacity=".25"/><path d="M18 70 q32 22 64 0 l-6 -8 h-52 z" fill="#B5531B"/><path d="M50 60 c-10 -12 -8 -26 0 -42 c8 16 10 30 0 42 z" fill="{C(k)}"/><path d="M50 56 c-4 -6 -3 -12 0 -20 c3 8 4 14 0 20 z" fill="#FFF8E8"/>',
 'house': lambda k: f'<path d="M16 48 L50 18 L84 48 M24 42 V84 H76 V42" {S}/><path d="M50 74 C40 66 34 60 36 54 C38 48 46 48 50 54 C54 48 62 48 64 54 C66 60 60 66 50 74 Z" fill="{C(k)}"/>',
 'coinback': lambda k: f'<circle cx="50" cy="52" r="20" fill="{C(k)}"/><text x="50" y="61" text-anchor="middle" font-family="Poppins" font-weight="800" font-size="24" fill="#14122A">₹</text><path d="M18 40 A34 34 0 0 1 80 30 M80 30 L82 16 M80 30 L66 28" {S}/><path d="M82 64 A34 34 0 0 1 20 74" {S} opacity=".5"/>',
 'lotus': lambda k: f'<path d="M50 78 C40 60 40 40 50 22 C60 40 60 60 50 78 Z" fill="{C(k)}"/><path d="M50 78 C34 70 22 56 20 40 C34 44 46 58 50 78 Z M50 78 C66 70 78 56 80 40 C66 44 54 58 50 78 Z" fill="{C(k)}" opacity=".75"/><path d="M14 84 H86" {S}/>',
 'hourglass': lambda k: f'<path d="M30 14 H70 M30 86 H70" {S}/><path d="M34 14 C34 38 50 42 50 50 C50 58 34 62 34 86 M66 14 C66 38 50 42 50 50 C50 58 66 62 66 86" {S}/><path d="M40 80 Q50 66 60 80 Z" fill="{C(k)}"/><path d="M41 28 H59 L50 44 Z" fill="{C(k)}" opacity=".8"/>',
 'sleep': lambda k: f'<path d="M58 18 A26 26 0 1 0 82 52 A20 20 0 1 1 58 18 Z" fill="{C(k)}"/><text x="18" y="40" font-family="Poppins" font-weight="800" font-size="20" fill="#FFF8E8">z</text><text x="28" y="26" font-family="Poppins" font-weight="800" font-size="14" fill="#FFF8E8" opacity=".7">z</text><path d="M14 84 H86" {S} opacity=".5"/>',
 'alone': lambda k: f'<circle cx="74" cy="22" r="9" fill="{C(k)}"/><circle cx="44" cy="40" r="10" fill="#FFF8E8"/><path d="M28 84 C28 62 34 54 44 54 C54 54 60 62 60 84 Z" fill="#FFF8E8"/><path d="M10 86 H90" {S} opacity=".5"/>',
 'peak': lambda k: f'<path d="M8 86 L38 34 L52 56 L64 40 L92 86 Z" fill="#3A3F58" stroke="#FFF8E8" stroke-width="4" stroke-linejoin="round"/><path d="M38 34 V12 M38 12 L56 18 L38 24" fill="{C(k)}" stroke="#FFF8E8" stroke-width="3" stroke-linejoin="round"/>',
 'sunwater': lambda k: f'<path d="M22 56 A28 28 0 0 1 78 56 Z" fill="{C(k)}"/>' + ''.join(f'<path d="M{50 + 36 * __import__("math").cos(a)} {56 - 36 * __import__("math").sin(a)} L{50 + 46 * __import__("math").cos(a)} {56 - 46 * __import__("math").sin(a)}" {S}/>' for a in [0.35, 0.95, 1.57, 2.2, 2.8]) + f'<path d="M10 64 H90 M22 74 H78 M34 84 H66" {S}/>',
 'soop': lambda k: f'<path d="M14 40 C30 30 70 30 86 40 L76 78 C60 86 40 86 24 78 Z" fill="#B5862F" stroke="#FFF8E8" stroke-width="4" stroke-linejoin="round"/><path d="M24 50 H76 M28 62 H72" stroke="#8A5E1A" stroke-width="3"/><circle cx="38" cy="36" r="9" fill="{C(k)}"/><circle cx="56" cy="32" r="8" fill="#E5484D"/><circle cx="70" cy="38" r="7" fill="#FFD166"/><path d="M84 30 L92 10" stroke="#3E8E41" stroke-width="6" stroke-linecap="round"/>',
 'ray': lambda k: f'<circle cx="30" cy="34" r="16" fill="{C(k)}"/><path d="M42 44 L86 86" stroke="{C(k)}" stroke-width="7" stroke-linecap="round"/><path d="M48 40 L88 70 M38 50 L70 90" {S} opacity=".5"/>',
 'sunset': lambda k: f'<path d="M26 60 A24 24 0 0 1 74 60 Z" fill="{C(k)}"/><path d="M10 60 H90 M20 70 H80 M32 80 H68" {S}/><path d="M50 14 V30 M42 22 L50 30 L58 22" {S}/>',
 'tulsi': lambda k: f'<path d="M30 70 H70 L64 90 H36 Z" fill="#B5531B" stroke="#FFF8E8" stroke-width="3"/><path d="M50 70 V30" stroke="#3E8E41" stroke-width="5"/>' + ''.join(f'<ellipse cx="{50 + d * 12}" cy="{y}" rx="10" ry="5" fill="{C(k)}" transform="rotate({d * -30} {50 + d * 12} {y})"/>' for d, y in [(-1, 58), (1, 52), (-1, 44), (1, 38), (-1, 30)]) + f'<ellipse cx="50" cy="22" rx="5" ry="9" fill="{C(k)}"/>',
 'rings': lambda k: f'<circle cx="38" cy="58" r="20" fill="none" stroke="{C(k)}" stroke-width="7"/><circle cx="62" cy="58" r="20" fill="none" stroke="#FFF8E8" stroke-width="7"/><path d="M38 38 L32 28 H44 Z" fill="#9AD0FF"/>',
 'briefcase': lambda k: f'<rect x="16" y="34" width="68" height="46" rx="8" fill="{C(k)}" stroke="#FFF8E8" stroke-width="4"/><path d="M38 34 V24 H62 V34 M16 52 H84" {S}/>',
 'scale': lambda k: f'<path d="M50 16 V82 M30 82 H70 M20 30 H80" {S}/><path d="M20 30 L10 54 H30 Z M80 30 L70 54 H90 Z" fill="{C(k)}" stroke="#FFF8E8" stroke-width="3" stroke-linejoin="round"/>',
 'fire': lambda k: f'<path d="M50 88 C26 88 18 68 26 50 C30 60 36 62 38 58 C34 42 42 24 56 12 C56 30 70 36 74 52 C80 70 70 88 50 88 Z" fill="{C(k)}"/><path d="M50 88 C40 88 36 78 40 68 C44 74 48 72 48 66 C50 58 56 54 58 50 C62 62 64 70 62 78 C60 84 56 88 50 88 Z" fill="#FFF8E8" opacity=".85"/>',
 'bandage': lambda k: f'<g transform="rotate(-40 50 50)"><rect x="10" y="36" width="80" height="28" rx="14" fill="{C(k)}" stroke="#FFF8E8" stroke-width="4"/><rect x="38" y="36" width="24" height="28" fill="#FFF8E8" opacity=".85"/><circle cx="45" cy="45" r="2.2" fill="{C(k)}"/><circle cx="55" cy="45" r="2.2" fill="{C(k)}"/><circle cx="45" cy="55" r="2.2" fill="{C(k)}"/><circle cx="55" cy="55" r="2.2" fill="{C(k)}"/></g>',
 'siblings': lambda k: f'<circle cx="32" cy="34" r="12" fill="#FFF8E8"/><path d="M14 84 C14 62 22 52 32 52 C42 52 50 62 50 84 Z" fill="#FFF8E8"/><circle cx="70" cy="40" r="10" fill="{C(k)}"/><path d="M54 84 C54 66 60 58 70 58 C80 58 86 66 86 84 Z" fill="{C(k)}"/><path d="M47 22 L53 34 M53 22 L47 34" stroke="{C(k)}" stroke-width="5" stroke-linecap="round"/>',
 'land': lambda k: f'<path d="M8 80 L30 58 H92 L70 80 Z" fill="{C(k)}" opacity=".85" stroke="#FFF8E8" stroke-width="4" stroke-linejoin="round"/><path d="M58 58 V18 M58 18 L80 26 L58 34" {S}/><path d="M24 70 H76" stroke="#FFF8E8" stroke-width="3" stroke-dasharray="5 6" opacity=".7"/>',
}
cfg = json.load(open(sys.argv[1]))
s = open('reel05.html').read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (s.count(a), a[:70]); s = s.replace(a, b)
i = s.index('// Reel 05:'); j = s.index('const T =')
s = s[:i] + cfg['comment'] + '\n' + s[j:]
rep('vo/reel05-timing.js', f"vo/reel{cfg['n']}-timing.js")
rep('const T = window.TIMES || [0, 5.3, 10.4, 17.8, 25.9, 34.9, 44.6, 55.1, 61.1, 69];', 'const T = window.TIMES;')
rep("// Shani's own colours: indigo glow instead of the usual marigold.", '// The graha\'s own colour as the glow.')
rep('rgba(88,96,230,.36),rgba(88,96,230,0) 55%', f"{cfg['glow']},rgba(0,0,0,0) 55%")
rep('#stage{background:#0C0E1F}', f"#stage{{background:{cfg['bg']}}}")
s = s.replace('#191A33', cfg['row']).replace('#23244A', cfg['rowLive'])
i = s.index('const COL = '); j = s.index('\n', i)
s = s[:i] + 'const COL = ' + json.dumps({int(k): v for k, v in cfg['col'].items()}).replace('"', '"') + ';' + s[j:]
i = s.index('const ROW = {'); j = s.index('};', i) + 2
s = s[:i] + 'const ROW = {\n' + ''.join(f'  {k}: {json.dumps(cfg["rows"][str(k)][:2])},\n' for k in [5, 4, 3, 2, 1]) + '};' + s[j:]
i = s.index('const AT = {'); j = s.index('};', i) + 2
s = s[:i] + 'const AT = { ' + ', '.join(f'{k}: {json.dumps(cfg["rows"][str(k)][3])}' for k in [5, 4, 3, 2, 1]) + ' };' + s[j:]
i = s.index('const ICON = {'); j = s.index('};', i) + 2
s = s[:i] + 'const ICON = {\n' + ''.join(f'  {k}: `{ICONS[cfg["rows"][str(k)][2]](k)}`,\n' for k in [5, 4, 3, 2, 1]) + '};' + s[j:]
rep('Aakhri wala sabse khaas', cfg['tease'])
HERO = cfg['hero'] if '.' in cfg['hero'] else cfg['hero'] + '.png'
rep('<img class="sh" src="${ART}shani.png" style="position:absolute;left:310px;top:140px;height:550px">', f'<img class="sh" src="${{ART}}{HERO}" style="position:absolute;left:0;right:0;margin:0 auto;top:140px;height:550px;max-width:620px;object-fit:contain">' + cfg.get('extra', ''))
rep('Shani Dev ke <mark class="hl">5 ishaare</mark>', cfg['title'])
rep('<div class="ln"><span>Aapke saath</span></div><div class="ln"><span><mark>kitne</mark> ho rahe hain?</span></div>', cfg['ask'])
if 'chips' in cfg:
    rep('display:flex;justify-content:center;gap:26px;margin-top:56px', 'display:flex;flex-wrap:wrap;justify-content:center;gap:22px;margin:56px 50px 0')
    rep('${[0, 1, 2, 3, 4, 5].map((k) => `<div class="chip">${k}</div>`).join("")}', '${' + json.dumps(cfg['chips']) + '.map((k) => `<div class="chip" style="width:auto;padding:0 34px;border-radius:999px;font-size:44px">${k}</div>`).join("")}')
rep('popIn(ask, ".chip", abs - T[7], [2.2, 2.3, 2.4, 2.5, 2.6, 2.7]);', f'popIn(ask, ".chip", abs - T[7], {json.dumps(cfg["chipsAt"])});')
if 'extraUpd' in cfg:
    rep('    lines($(el, ".title"), t, 0.15);', '    lines($(el, ".title"), t, 0.15);\n' + cfg['extraUpd'])
rep('<img class="e1" src="${ART}shani.png" style="position:absolute;left:330px;top:170px;height:490px">', f'<img class="e1" src="${{ART}}{HERO}" style="position:absolute;left:0;right:0;margin:0 auto;top:170px;height:490px;max-width:620px;object-fit:contain">')
rep('<div style="position:absolute;inset:0;background:#0C0E1F;opacity:.9"></div>', f'<div style="position:absolute;inset:0;background:{cfg["bg"]};opacity:.9"></div>')
rep('Shani aapki kundli<br>mein <mark>kahan</mark> hain?', cfg['end'])
if 'endTag' in cfg: rep('Free mein dekho: yourbrand.com', cfg['endTag'])
open(f"reel{cfg['n']}.html", 'w').write(s)
print('wrote', f"reel{cfg['n']}.html")
