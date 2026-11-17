---
name: social-studio
description: Make short vertical videos (Instagram/FB reels, YouTube Shorts, TikTok) and carousels for ANY brand or topic; each brand is a profile in brands/ and new ones can be added. Covers hooks, scripts, voiceover (Gemini TTS), ChatGPT image prompts, HTML-animated scenes rendered with Playwright, captions, muxing, scheduling prompts for Meta Business Suite, and reading IG stats. Use whenever the user asks to make, fix, schedule or review a reel/video/carousel/post, copy a reference reel, or check how posts are doing. It learns: after feedback or stats, append to LEARNINGS.md / PERFORMANCE.md / the brand file.
---

# Social Studio

A playbook plus scripts for making reels that get watched, commented on and that send people to the brand's site.
It is meant to grow: every correction from the user and every stats check becomes a dated line in a file here.

## Step 0: which brand? (always first)
- Work out the brand from the request or the current folder; the profiles are the files in `brands/` (`ls brands`).
- If it isn't clear, ask: "Which brand is this for?" and list the profiles plus "a new brand". Never assume one, and never suggest another brand's topics (e.g. festivals, rashis) unless that brand was chosen.
- New brand → copy `brands/_template.md` to `brands/<name>.md`, fill what you know, ask only for what's missing (audience, language, site/CTA, look, hard rules), make a workspace with `scripts/new-workspace.sh`.

## Then read
1. `brands/<brand>.md` – audience, language, voice, look, CTA, hard rules, its winning formats and topics. Brand rules beat everything below.
2. `LEARNINGS.md` – newest first; lines tagged [all] apply to every brand, [<brand>] only to that brand.
3. `references/formats.md` – brand-neutral formats and hook patterns; pick one that fits the brand (its own data in `PERFORMANCE.md` first).
4. `references/pipeline.md` – how to build it. `references/gotchas.md` before you render.

## Suggesting topics
Base them on the chosen brand's audience and its winners (brand file + PERFORMANCE.md), the formats that work for it, and what's timely for that audience (dates, news, seasons). Give 4–6 options with the hook line for each.

## Setup (once per machine)
If `~/.config/reel-studio/workspace` doesn't exist or a script says "No workspace", run `./setup.sh` in this folder (see README for Mac / Windows-WSL). Engine = `engine/`; each brand has a workspace folder (`scripts/new-workspace.sh`). Details: `references/pipeline.md`.

## Workflow
0. **Reference reel given?** Get the video itself (not the caption page) and measure it first: length, seconds per item, cut times, art style, text style. Match those. See LEARNINGS 2026-11-14.
1. **Pick format + hook.** Hook = first 2.5 s, big text, a curiosity gap or tension that the video pays off at the end. Plan one comment ask (easy one-tap reply) and an end card (follow / next part + site CTA).
2. **Script.** Short lines in the brand's spoken language. Each line ~1 caption chunk of ≤7 words. Caption language can differ from the voice (brand file).
3. **Art.** Either HTML/SVG drawn scenes (rankings, lists, app/product screens, text-led) or ChatGPT images from `references/image-prompts.md` (stories, scenes), in the brand's look. User generates ChatGPT images and drops them in ~/Downloads.
4. **Voice.** `scripts/tts_lines.py` (rate-limit safe, model fallback). Verify every line with `scripts/transcribe.sh`.
5. **Timing + captions.** `scripts/story_build.py <config.json>` → voice wav + TIMES + CAPS.
6. **Page.** Start from `templates/` (story) or the brand's generators; test stills before the full render.
7. **Render + mux.** `scripts/reel.sh <NN> <slug>` (voice only by default; `--sfx` only if the brand allows effects).
8. **Check.** Contact sheet of frames, loudness, whisper transcript of the final mp4, length.
9. **Ship.** Caption + pinned comment in `reel-NN.md`; a Business Suite prompt from `references/posting.md`; give the user posting times (≥2 h apart).
10. **Learn.** See below.

## Learning loop (do this, it is the point of the skill)
- User corrects something ("too slow", "no sound effects", "captions too small") → add a dated line to `LEARNINGS.md` tagged [all] or [<brand>] (what, why, how to apply); brand-specific rules also go in the brand file. Fix the template/script too, so it can't recur.
- Stats pulled (`scripts/igstats.mjs`, with the brand's IG_ID/PAGE_ID) → add rows under that brand in `PERFORMANCE.md` and one line on what it means. A format that wins for 2+ brands goes into `references/formats.md`; brand-only winners go in the brand file.
- New tool, workaround or failure → `references/tools.md` or `references/gotchas.md`.
- New brand → `brands/<brand>.md`.
- Keep files short: merge duplicates, delete lessons proven wrong. Then `git pull --rebase`, commit (with the attribution line) and `git push` in this folder (your own private git repo), so other machines get it.

## Defaults for every brand (the brand file can override)
- No sound effects unless the brand wants them; voice only. Keep pace fast (tiny gaps, voice 1.1–1.25x).
- Captions: big (≈74 px Poppins 800, dark stroke, yellow keywords), bottom above IG UI (bottom ≈360 px), in the language the brand's audience reads.
- Transitions: smooth zoom-blur (0.35 s), no hard mid-scene cuts, no slow crossfades.
- Every reel ends with the brand's CTA (site, follow, DM…), plus a follow/next-part line when it's a series.
- No cover files unless asked. Never print or commit secrets. Ask before posting or spending money.
