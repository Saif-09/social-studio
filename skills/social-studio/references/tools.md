# Tools and alternatives

| Need | Main | Alternative / fallback | Limits, cost |
|---|---|---|---|
| Voiceover | Gemini TTS `gemini-3.8-flash-tts` | `gemini-2.5-flash-preview-tts`, then `gemini-3.8-flash-lite-tts` | Free tier: 3 req/min, 10/day per model; resets ~1:30 PM IST. tts_lines.py uses the free key first and retries the same model on the billed key in ~/.config/reel-studio/paid.env only after the free daily cap (~$0.015 per 1-min reel on 3.8-flash-tts). Replies are WAV with a C2PA chunk: tts.mjs parses the container (see gotchas). |
| Voices | Aoede (energetic female, astro brand default) | Gacrux (grandmother narrator), Leda (young; pitch up asetrate 1.15 for a child), Fenrir (male), Sulafat (sweet), Puck | Samples: ~/Desktop/mybrand-reels/voice-samples/. Style prefixes get read aloud on fallback models: plain script is safest. |
| Images (stories, festivals) | ChatGPT image gen (user runs it, one chat for consistent characters) | Figma MCP generate_image (lower quality), HTML/SVG drawing | Free for us; 2:3 portrait. |
| Animation | HTML + lib.js, Playwright render | Three.js (works headless, but user rejected the 3D look) | Local, free. |
| Audio/video | ffmpeg | | |
| Transcript check | mlx-whisper `whisper-large-v3-turbo` (`uvx --from mlx-whisper mlx_whisper ...`) | | whisper-small hallucinates; long files may skip a stretch. |
| Reference reels | `uvx yt-dlp` (video + info json) | Graph API Business Discovery for business accounts | yt-dlp only gets videos, not carousel images. |
| Stats | `scripts/igstats.mjs` (Graph API, token in ~/.config/reel-studio/meta-token) | Ask the Meta browser chat for Business Suite insights | Explorer tokens last ~1–2 h; they also die on password change. User regenerates and runs `! pbpaste > ~/.config/reel-studio/meta-token`. Long-lived: Access Token Debugger → "Extend Access Token" (60 days); a Page token taken from it via /me/accounts never expires (astro brand's is in Vercel project astroapp as META_IG_TOKEN, and in ~/.config/reel-studio/meta-page-token). |
| Posting | Meta Business Suite via the user's browser agent (prompt from posting.md) | Graph API: FB reels publish fine; IG content publishing fails (ProcessingFailedError / 2207076) | Business Suite can't add IG music: post a NO-VOICE version from the IG app if trending audio is wanted. |
| Carousels | HTML 1080×1350 + shoot.mjs | | |
