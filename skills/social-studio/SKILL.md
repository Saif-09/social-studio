---
name: social-studio
description: Make short vertical videos (Instagram/FB reels, YouTube Shorts, TikTok) and carousels for ANY brand or topic; each brand is a profile the user can add. Covers hooks, scripts, voiceover (Gemini TTS), image prompts, HTML-animated scenes rendered with Playwright, captions, muxing, posting captions and reading Instagram stats. Use whenever the user asks to make, fix, schedule or review a reel/video/short/carousel/post, copy a reference reel, set up Social Studio, or check how posts are doing. It learns from the user's feedback.
---

# Social Studio

A playbook plus scripts for making reels that get watched, commented on and that send people to the brand's site.
The user may not be technical: do the work yourself, explain in plain words, never ask them to run git or edit files.

**Paths.** `SKILL` = this skill's base directory (shown when the skill loads). `DATA` = `~/social-studio` (the user's own
files, kept across updates): `DATA/brands/<brand>.md`, `DATA/my-learnings.md`, `DATA/performance.md`, finished videos in
`DATA/reels/`. Never write the user's data inside `SKILL` (it is replaced when the plugin updates).

## Step 0: setup (first time, and quick check every time)
1. Run `bash "$SKILL/setup.sh" --quick`. Exit 0 = ready, go to Step 1. Exit 3 = only the Gemini key is missing (see below).
2. Otherwise run `REEL_DEFAULT_WS="$HOME/social-studio/reels" bash "$SKILL/setup.sh"` and read its output:
   - It installs missing tools itself where it can. If it prints a `! ...` command (Homebrew or apt need the user's password),
     tell the user to type exactly that line in Claude Code (the `!` runs it here), then run setup again.
   - "NEED Gemini key": tell the user, in plain steps: open aistudio.google.com/apikey, sign in with Google, "Create API key",
     copy it and paste it here. Save it with `mkdir -p ~/.config/reel-studio && printf %s "<key>" > ~/.config/reel-studio/gemini-key && chmod 600 ~/.config/reel-studio/gemini-key`.
     Never print the key back or put it in any other file.
3. Create `DATA` if missing: `mkdir -p ~/social-studio/brands ~/social-studio/reels`, and empty `my-learnings.md`
   ("# My learnings (newest first)") and `performance.md` ("# Performance") there.

## Step 1: which brand?
- Brand profiles are `DATA/brands/*.md`. Work out the brand from the request; if unclear, ask "Which brand is this for?" and list
  them plus "a new brand". Never assume one, never suggest another brand's topics.
- New brand: copy `SKILL/brands/_template.md` to `DATA/brands/<name>.md`, fill what you know, ask only for what's missing
  (what they sell, audience, language, website/CTA, look, rules), in one short message.

## Then read
1. `DATA/brands/<brand>.md` (brand rules beat everything below).
2. `DATA/my-learnings.md` (the user's own lessons, newest first), then `SKILL/LEARNINGS.md` (built-in lessons).
3. `SKILL/references/formats.md` (formats and hook patterns), using `DATA/performance.md` first if it has data.
4. `SKILL/references/pipeline.md` (how to build) and `SKILL/references/gotchas.md` before you render.

## Suggesting topics
Base them on the brand's audience, what has worked for it (`DATA/performance.md`), the formats that fit, and what's timely
(dates, news, seasons). Give 4–6 options with the hook line for each.

## Workflow
1. **Pick format + hook.** Hook = first 2.5 s, big text, a curiosity gap that the video pays off at the end. Plan one comment
   ask (easy one-tap reply) and an end card (follow / next part + the brand's CTA).
2. **Script.** Short lines in the brand's spoken language; each line ≈ one caption chunk of ≤7 words.
3. **Art.** HTML/SVG drawn scenes (rankings, lists, charts, product screens, text-led), or images the user makes in ChatGPT from
   prompts you write (`references/image-prompts.md`); they save them to Downloads and tell you.
4. **Voice.** `scripts/tts_lines.py` (rate-limit safe, model fallback). Verify every line with `scripts/transcribe.sh`.
   Free Gemini tier ≈ 10 voice requests per model per day: group sentences into few lines.
5. **Timing + captions.** `scripts/story_build.py <config.json>` → voice track + TIMES + CAPS.
6. **Page.** Start from `templates/` or the engine examples, in the workspace (`~/.config/reel-studio/workspace`); test stills.
7. **Render + mux.** `scripts/reel.sh <NN> <slug> --out ~/social-studio/reels` (voice only by default).
8. **Check.** Frames contact sheet, loudness, transcript of the final mp4, length. Then `open` the video for the user.
9. **Ship.** Caption + pinned comment in `~/social-studio/reels/reel-NN.md`; suggest posting times (≥2 h apart).
10. **Learn.** See below.

## Learning loop (the point of the skill)
- User corrects something ("too slow", "no sound effects", "captions too small") → add a dated line at the top of
  `DATA/my-learnings.md` (what, why, how to apply); brand-only rules also go in the brand file. Apply it from now on.
- Stats (`scripts/igstats.mjs` with the user's own Meta token and IG_ID/PAGE_ID) → rows under the brand in `DATA/performance.md`
  and one line on what it means; a brand's winning formats go in its brand file.
- Keep files short: merge duplicates, delete lessons proven wrong.

## Defaults (the brand file can override)
- No sound effects unless the brand wants them; voice only. Keep pace fast (tiny gaps, voice 1.1–1.25x).
- Captions big (≈74 px Poppins 800, dark stroke, yellow keywords), above the Instagram UI (bottom ≈360 px), in the language
  the audience reads.
- Smooth zoom-blur transitions (0.35 s), no hard mid-scene cuts, no slow crossfades.
- Every reel ends with the brand's CTA, plus a follow/next-part line when it's a series.
- Never print secrets. Ask before posting anything or spending money.
