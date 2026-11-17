# Pipeline

## Engine and workspaces
- **Engine** = `engine/` in this skill (lib.js, render.mjs, stills.mjs, browser.mjs, tts.mjs, mux.sh, cues.py, sfx.py, generators). Improve it here so every brand gets the fix.
- **Workspace** = a brand's reel folder, e.g. `~/Desktop/mybrand-reels/_generator`  or `~/Desktop/edu brand-reels/_generator`. Holds reelNN.html, vo/, cues.d/, cfg/, art; finished mp4s go one level up.
- New brand/machine: `scripts/new-workspace.sh <folder> [--default]` links the engine files in. The scripts find the workspace from `$REEL_ENGINE`, else `~/.config/reel-studio/workspace`.
- First run on a machine: `./setup.sh` (checks node/ffmpeg/python/uv, installs Playwright, sets the workspace, checks secrets).
- Secrets (never in git): Gemini key in `$GEMINI_API_KEY` or `~/.config/reel-studio/gemini-key`; Meta token in `$META_TOKEN` or `~/.config/reel-studio/meta-token`.
- Transcribe: `scripts/transcribe.sh file [lang]` (mlx-whisper on Apple Silicon, faster-whisper elsewhere).

| File | What it does |
|---|---|
| `lib.js` | Timeline engine. `scene(a, b, html, update(el,t), z)`, `pr(t,a,b,ease)` progress 0..1, `mix(a,b,p)`, `E.out/E.io/E.back/E.lin/E.in`, `$(el,sel)`, `popIn(el, sels, t, starts, from)`, `slam`, `flash`, `MARK(size)` (astro brand logo svg; ids clash if used twice: replaceAll ids), `backdrop`, `lines`, `caption`. Set `window.DURATION`. |
| `render.mjs` | `node render.mjs reel.html out.mp4 [fps] [from] [to]`: Playwright (Chrome if installed, else bundled Chromium via browser.mjs), seeks each frame, silent mp4, 30 fps. |
| `stills.mjs` | `node stills.mjs reel.html outPrefix t1 t2 ...` → jpgs for checking layout before a full render. |
| `mux.sh` | Adds sound effects (cues.py + sfx.py) and voice, loudnorm -14 LUFS. Note: sfx.mix normalizes any cue list to full loudness, so "quiet" gains are not quiet. |
| `cues.d/<id>.json` | `[[sceneIndex, offset, sound, gain], ...]` effect cues (only for brands/formats that want effects). |
| `tts.mjs` | `node tts.mjs script.txt out.wav <Voice> <model>`: Gemini TTS (key from env/config, never printed). |
| `mk_tier1.py cfg/NN.json` | "5 ishaare" tier-list reel from reel05 (best format). |
| `mk_rank.py cfg/rankNN.json` | 12→1 rashi ranking from reel20 (needs `"colors":{}`). |
| `capbig.css` | Big caption (`.bcap`), hook (`.hook .h1/.h2`), comment ask (`.ask`). |
| `templates/story-reel.html` | Story/festival template (ChatGPT images, zoom-blur transitions, big captions); copied into each workspace as story-reel.html. astro brand reels 63/66 are live examples. |

## Story reel (ChatGPT images + voice), the 14 Nov 2026 recipe
1. Images: an art folder next to the workspace's _generator (set `A` in the page), names c01.. in scene order. 2:3 portrait from ChatGPT (1024×1536). Check a contact sheet (ffmpeg tile) for order and odd sizes (one came 1191×1321; cover-fit handles it).
2. Voice lines: folder `vo/rNN/` in the workspace with `l01.plain` (text) + `l01.spk` (speaker key). Record: `scripts/tts_lines.py <workspace>/vo/rNN --voices n=Gacrux,g=Leda`.
3. Config + build timing (works for drawn reels too: one scene per voice line; per-speaker "tempo", "pitch", "maxpause"): `python3 scripts/story_build.py cfg.json` (see the example at the top of the script). Writes `vo/reelNN-voice.wav`, `vo/reelNN-timing.json`, `vo/reelNN-timing.js` (TIMES = scene starts + end-card start + end; CAPS = [start,end,html,speaker] caption chunks).
4. Page: copy `templates/story-reel.html` to `reelNN.html`, set the SH list (image, pan/zoom), hook text, comment ask, end card.
5. Test: `node stills.mjs reelNN.html /tmp/x 1 5 20 ...`; look at them.
6. Build: `scripts/reel.sh NN slug` (voice only). `--speed 1.15` to speed a finished reel (video + atempo).
7. Verify: `scripts/transcribe.sh` on the final mp4 (long files: whisper may skip a stretch; transcribe that part alone before assuming it's missing).

## Drawn story reel (no images)
Copy `templates/story-drawn.html`: `shot(i, from, to, html, update, cam)` per voice line, kit = `Ridge()` dunes, `traveller()` silhouette, `LAMP`/`flame()`, `town()`, `starfield()`, `glow()`, motes. Sync beats to caption chunks with `cs(line, chunk)`. Stills: pass times as a zsh array (`TS=(1 2 3); node stills.mjs page out $TS`), a quoted string seeks to NaN and renders black.

## List-of-cards reel (25 prophets, any "all N" list)
Copy `templates/list-cards.html` (faith brand reel 04): hook grid of all N symbols, one medallion card per item (Arabic name + honorific, English name + common name, ayah chip), "k of N" progress bar, caption per card, ask over the grid, end card. Symbols live in `SYM` (200x200 line art, p = card progress, t = seconds). Shared SVG gradients go in the always-visible backdrop layer (a gradient defined inside a hidden scene does not render elsewhere).

## Beat reels (a picture change per short line, e.g. the 25-prophets micro-stories)
Record ONE clip per item (natural prosody; per-beat clips sound choppy and short clips get mispronounced), give the line `"beats_ur": [...]` (the voice text of each beat) next to `"chunks"`, run story_build, then `uvx --from mlx-whisper python scripts/align_beats.py cfg.json` to snap each chunk to the word where its beat starts. The page reads beat k of scene s from CAPS (see reel05p.html in the faith brand workspace).

## Drawn reels (rankings, tier lists, app/phone screens)
Use the generators above; app screens must copy the real app UI (brand file has tokens). Hook frame 1 must already show text (no blank first frame).

## Carousels
Generic: templates/carousel/ (data in posts.js, `node shoot.mjs [ids]`, `python3 sheet.py out.jpg files…` for a contact sheet). HTML slides 1080×1350 → screenshot with `~/Desktop/mybrand-posts/_generator` shoot.mjs (waits for image decode). Rashifal: posts/mk_rashifal.py (Royal ivory), data from yourbrand.com/hi/rashifal.
