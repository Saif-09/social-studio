# Social Studio

A Claude Code skill that makes short vertical videos (Instagram/FB reels, YouTube Shorts, TikTok) and carousels for any brand:
hooks, scripts, voiceover (Gemini TTS), image prompts, HTML-animated scenes rendered with Playwright, big captions, muxing,
posting captions, and reading Instagram stats. It learns: corrections go into `LEARNINGS.md`, stats into `PERFORMANCE.md`.

## Install (Mac)
```bash
git clone https://github.com/Saif-09/social-studio ~/.claude/skills/social-studio      # or unzip it there
cd ~/.claude/skills/social-studio && ./setup.sh ~/Desktop/mybrand-reels
```
`setup.sh` checks the tools (Node, Python 3, uv, ffmpeg, Chrome), installs the engine and makes your first workspace.
Then open Claude Code anywhere and say "make a reel for <brand> about <topic>", or type `/social-studio`.
First time, it asks for your brand (site, audience, language, look, rules) and writes `brands/<name>.md` from `_template.md`.

## Windows
Use WSL (Ubuntu): `wsl --install` in PowerShell, open Ubuntu, then:
```bash
sudo apt update && sudo apt install -y nodejs npm ffmpeg python3 git
curl -LsSf https://astral.sh/uv/install.sh | sh
npm i -g @anthropic-ai/claude-code
git clone https://github.com/Saif-09/social-studio ~/.claude/skills/social-studio && cd ~/.claude/skills/social-studio && ./setup.sh
```

## claude.ai
Zip the folder and upload it under Settings → Capabilities → Skills. There it works as the playbook (formats, hooks, prompts,
captions); rendering needs Claude Code on a computer.

## Your keys (stay on your machine, never in git)
- Gemini key (voice, free tier is enough to start): get one at aistudio.google.com/apikey and save it to
  `~/.config/reel-studio/gemini-key` (or set `GEMINI_API_KEY`). Free tier: about 10 voice requests per day per model.
- Meta token (Instagram stats, optional): `~/.config/reel-studio/meta-token` (or `META_TOKEN`), plus `IG_ID` and `PAGE_ID`
  env for your account. Graph API Explorer → Generate Access Token (instagram_basic, instagram_manage_insights,
  pages_show_list, pages_read_engagement) → Access Token Debugger → Extend.

## What's inside
| Path | What |
|---|---|
| `SKILL.md` | Workflow Claude follows |
| `LEARNINGS.md` | Lessons that apply to every brand; yours get added here |
| `brands/_template.md` | Copy per brand |
| `references/` | Pipeline, winning formats, tools, gotchas, image prompts, posting |
| `engine/`, `scripts/`, `templates/` | Renderer, voice, timing, captions, mux, page templates |

`engine/reel05.html` (tier list) and `engine/reel20.html` (12→1 ranking) are example generators; they expect your own art in
the workspace `art/` folder (`art/rashi/<name>.webp` for the ranking faces).

## License
MIT, see `LICENSE`.
