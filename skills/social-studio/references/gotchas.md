# Gotchas (problem → fix)

- **End card cut short** → `-shortest` with a voice track shorter than the video drops the last second(s). Pad the voice (`apad`) before `-shortest` (reel.sh does).
- **Old takes with C2PA static** → voices recorded before the tts.mjs fix (13–14 Nov 2026) end with ~0.17 s of loud static. Single-take voices: trim the last 0.2 s (`atrim=0:<len-0.2>`). Workspaces should link engine/tts.mjs, not keep an old copy.

- **Whoosh/"chh" at every scene change in a voice-only reel** → a WAV reply (any model) decoded as raw PCM: the header is a click, the trailing C2PA chunk is ~0.17 s of -6 dB static. Fixed in engine/tts.mjs (parses RIFF). Old takes: story_build trims lines whose last 0.1 s RMS > -20 dB. Check: last 0.1 s of each lNN.wav should read below -40 dB.
- **"Soft" sound effects come out loud** → sfx.mix normalizes the whole cue track to peak; gains are relative only. Prefer no effects; if needed, lower the effects bus in mux, not the cue gain.
- **Style direction read aloud** ("Say softly...") → fallback models speak it. Use plain text; whisper-check each line.
- **429 RESOURCE_EXHAUSTED** → per-minute: wait 21 s between calls. Per-day: switch model (lite) and keep one model per reel so the voice matches.
- **Page renders blank** → JS error. Run a quick Playwright console check. Seen: `const L` clashes with lib.js `L`; `.tag` class clashes with base.css.
- **Caption covers faces/crown** → captions at the bottom (bottom ≈360 px) with a shade; or a top band layout with the art below.
- **Wide/odd image size** → cover-fit with `Math.max(1080/w, 1920/h)`.
- **Duplicate SVG gradient ids** (MARK used twice) → replaceAll ids per instance.
- **mk_rank KeyError 'colors'** → add `"colors":{}`.
- **Bash safety block on `$(` in heredocs** → write the python/JS to a file first.
- **IG publishing via API fails** → use Business Suite.
- **Business Suite ignores cover files** → don't make covers.
- **Batch posting kills reach** (kanjoos cannibalized by a reel 1 min later) → ≥2 h apart, 4–5 a day max.
- **Comparing our views with competitors' likes** → compare like with like.
- TTS quota is shared by every brand (one Gemini key, 10/day per model). A astro brand day can leave nothing for another brand, and the fallbacks then mix models inside one reel (voice changes between lines). Record a new brand's lines before the day's other reels, or wait for the ~1:30 PM IST reset and re-record all lines on one model.
- Billed key for TTS: engine/tts.mjs takes `GEMINI_API_KEY` from the environment before the key files. A key from a suspended Google Cloud project fails (403 "Consumer ... has been suspended"). Check a key with one call before a long run.
- Render crash = truncated reel: an update() that touches an element another update() removed (innerHTML swap) throws mid-render; before pipefail, reel.sh still muxed a 33 s cut of a 52 s reel. Null-guard any element that can disappear; check the final duration.
- Voice-only mux lands ~-16 LUFS with single-pass loudnorm; reel.sh now runs a second (measured, linear) pass on the final file → about -15.4 LUFS.
- Paid TTS key also rate-limits per minute: tts_lines waits only 1 s after paid calls, so a long batch can 429 on the last line. Rerun tts_lines; it records only missing lines.
- Same-layout cards (list reels): the zoom-blur transition keeps the outgoing card fully visible while the next fades in, so names double up for 0.3 s. Fade the outgoing card too (opacity inn * (1 - out)); list-cards.html does.
- Billed Gemini key is capped too: 100 requests per model per day on gemini-3.8-flash-tts (generate_requests_per_model_per_day). Per-beat recording (one clip per beat, ~90 clips for a 2.5 min reel) burns that in one reel. Plan: record a big reel on one model only, on a fresh day, or on gemini-2.5-flash-preview-tts (separate quota, same Charon voice). Never mix models inside one reel.
- gemini-2.5-flash-preview-tts sometimes answers a short Urdu line with "Model tried to generate text" or an empty reply (finishReason OTHER). tts_lines retries these 3 times.
- gemini-2.5-flash-preview-tts returns an empty reply (finishReason OTHER) on chunks that talk TO the listener ("Stay till number four", "Tell me in the comments", "Save this"), even with a direction line + blank line + text. Fix that worked 4/4 (15 Nov 2026): one line, `Say this in a <accent/style>: "<all lines joined by spaces>"`. Whisper-check that the direction was not spoken. Failed calls still use daily quota.
- Whisper hears an Indian-accented "often" as "off and" (twice, also on a short clip): reword ("usually") instead of re-rolling.
- Cutting a raw take using timestamps measured on the sped-up (atempo) copy clips words: multiply by the tempo first.
- The free-tier 429 "retry in 23h" on gemini-2.5-flash-preview-tts was wrong (15 Nov 2026): the quota was open again ~7 h later. A waiting job should re-try every ~30 min instead of sleeping the full reported time.

- **Blank last seconds** → the end-card slot after the last voice line (TIMES[-2]..TIMES[-1]) has no scene. Last scene must run to DURATION; check the final frame of every render.
