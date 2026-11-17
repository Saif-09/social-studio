# Social Studio

Make Instagram reels, YouTube Shorts and carousels for your brand just by chatting with Claude.
You say "make a reel about ___"; Claude writes the hook and script, records the voiceover, animates the scenes, adds big
captions, renders the video and gives you the caption to post. It remembers your feedback, so every reel gets better.

## Install (2 minutes, no coding)

You need **Claude Code** (the Claude app for your computer: claude.com/claude-code). Open it and type these two lines,
one at a time:

```
/plugin marketplace add Saif-09/social-studio
/plugin install social-studio@social-studio
```

Then just say:

```
set up social studio
```

Claude installs what it needs and asks you for one free key (it shows you how to get it, about 1 minute with a Google
account). After that, ask for anything:

- "Make a reel for my bakery about 3 cakes for Diwali"
- "Make a 12→1 ranking reel: which zodiac sign is the most stubborn?"
- "Copy the style of this reel: <instagram link>"
- "Make a 6-slide carousel about tips for first-time home buyers"

Your videos land in the `social-studio` folder in your home folder.

**Windows:** install WSL first (open PowerShell, type `wsl --install`, restart), then run Claude Code inside Ubuntu and follow
the same steps.

**Update later:** type `/plugin` → Marketplaces → social-studio → Update.

## Only use claude.ai (no Claude Code)?
Download `social-studio.zip` from the [latest release](../../releases/latest) and upload it in claude.ai under
Settings → Capabilities → Skills. There it helps with ideas, hooks, scripts, image prompts and captions; making the actual
video needs Claude Code on a computer.

## What it costs
The skill is free. Voiceover uses Google's Gemini free tier (about 10 voice requests per day per voice model, enough for a
reel or two a day). Claude Code needs a Claude plan.

## For developers
The skill lives in `skills/social-studio/` (`SKILL.md`, `engine/` renderer, `scripts/`, `templates/`, `references/`).
Your own brands, lessons and stats are kept in `~/social-studio/`, so updates never overwrite them.

## License
MIT, see `LICENSE`.
