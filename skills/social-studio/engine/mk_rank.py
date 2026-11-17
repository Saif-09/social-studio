"""Builds a quick-fire rashi ranking reel (reelNN.html) from reel20.html (the gussa ranking) with a new theme."""
import sys, json
cfg = json.load(open(sys.argv[1]))
s = open('reel20.html').read()
def rep(a, b, cnt=1):
    global s
    assert s.count(a) == cnt, (s.count(a), a[:70]); s = s.replace(a, b)
i = s.index('// Reel 20:'); j = s.index('const T = window.TIMES;')
s = s[:i] + cfg['comment'] + '\n' + s[j:]
rep('vo/reel20-timing.js', f"vo/reel{cfg['n']}-timing.js")
i = s.index('const LIST = ['); j = s.index('];', i) + 2
s = s[:i] + 'const LIST = [\n' + ''.join(f'  {json.dumps(x, ensure_ascii=False)},\n' for x in cfg['list']) + '];' + s[j:]
rep('<div class="ln"><span>Sabse zyada</span></div><div class="ln"><span><mark class="hl" style="background:#FF3C2E;color:#fff">GUSSA</mark></span></div><div class="ln"><span>kis rashi ko?</span></div>', cfg['hook'])
rep('Sabse zyada <span style="color:#FF5A3C">gussa</span>: 12 se 1', cfg['header'])
rep('GUSSA METER', cfg['meter'])
rep('<div class="ln"><span>Aapki rashi</span></div><div class="ln"><span>kaun se <mark>number</mark> par?</span></div>', cfg['ask'])
rep('Sahi ya galat? Comment karo', cfg['pill'])
# The big emoji in the hook, and the crown + flash for number 1.
rep('  <div class="q d" style="position:absolute;left:60px;right:60px;top:200px;', f'  <div class="emo" style="position:absolute;left:0;right:0;top:1000px;text-align:center;font-size:150px;line-height:1">{cfg["emoji"]}</div>\n  <div class="q d" style="position:absolute;left:60px;right:60px;top:200px;')
rep('''    lines($(el, ".q"), t, 0.05);''', '''    lines($(el, ".q"), t, 0.05); const em = $(el, ".emo"); em.style.scale = mix(0.3, 1, pr(t, 0.3, 0.8, E.back)) * (1 + 0.06 * Math.sin(t * 6)); em.style.opacity = pr(t, 0.3, 0.45);''')
rep('''<div class="meter"><div class="fill"></div></div>''', '''<div class="meter"><div class="fill"></div></div><div class="crown" style="position:absolute;left:60px;top:470px;transform-origin:0 50%"><span style="display:inline-block;font:900 44px/1 Poppins;letter-spacing:.12em;color:#16131C;background:linear-gradient(90deg,#FFE08A,#FFC72C);padding:16px 30px 12px;border-radius:999px;box-shadow:0 0 50px rgba(255,199,44,.7)">👑 NUMBER 1</span></div>''')
rep('''    if (on === 11) $(el, ".i11 .av").style.translate''', '''    const cr = $(el, ".crown"); cr.style.opacity = on === 11 ? pr(abs, T[12] + 0.15, T[12] + 0.35) : 0; cr.style.scale = on === 11 ? mix(1.6, 1, pr(abs, T[12] + 0.15, T[12] + 0.5, E.back)) : 1;
    if (on === 11) $(el, ".i11 .av").style.translate''')
s = s.replace('// Line 13: your rashi?', 'flash(T[12], 0.3, 0.55, "' + cfg['flash'] + '");\n// Line 13: your rashi?')
rep('.rank{font:900 190px/1 Poppins;', '.rank{font:900 170px/1 Poppins;')
rep('<div class="ring" style="position:absolute;left:540px;top:1060px">', '<div class="ring" style="position:absolute;left:540px;top:1200px">')
rep('top:1000px;text-align:center;font-size:150px;line-height:1">', 'top:1125px;text-align:center;font-size:150px;line-height:1">')
rep('<div class="q d" style="position:absolute;left:60px;right:60px;top:200px;text-align:center;font-size:104px">', '<div class="q d" style="position:absolute;left:50px;right:50px;top:170px;text-align:center;font-size:88px">')
# theme colours
for a, b in cfg['colors'].items():
    s = s.replace(a, b)
if 'cta' in cfg:
    s = s.replace('<script src="lib.js"></script>', '<script src="lib.js"></script>\n<script src="cta.js"></script>', 1)
    s = s.replace('</script></body></html>', 'ctaCard(T[T.length - 2], T[T.length - 1], ' + json.dumps(cfg['cta'], ensure_ascii=False) + ');\n</script></body></html>', 1)
open(f"reel{cfg['n']}.html", 'w').write(s)
print('wrote', f"reel{cfg['n']}.html")
