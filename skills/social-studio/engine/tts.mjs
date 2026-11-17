// Voiceover with Gemini TTS. Usage: node tts.mjs <script.txt> <out.wav> [voice] [model]
// Key: $GEMINI_API_KEY, else ~/.config/reel-studio/gemini-key. Never printed.
import fs from 'fs';
import os from 'os';
import { execFileSync } from 'child_process';
const [src, out, voice = 'Kore', model = 'gemini-3.8-flash-tts'] = process.argv.slice(2);
const files = [`${os.homedir()}/.config/reel-studio/gemini-key`];
const key = (process.env.GEMINI_API_KEY || fs.readFileSync(files.find((f) => fs.existsSync(f)) ?? files[0], 'utf8')).trim();
const text = fs.readFileSync(src, 'utf8');
const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
  method: 'POST',
  headers: { 'x-goog-api-key': key, 'content-type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text }] }],
    generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
  }),
});
const body = await res.json();
if (!res.ok) { console.error('ERROR', res.status, body.error?.status, body.error?.message); process.exit(1); }
const part = body.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
if (!part) { console.error('No audio in reply', JSON.stringify(body).slice(0, 400)); process.exit(1); }
const buf = Buffer.from(part.inlineData.data, 'base64');
// Newer models reply with a WAV container (mimeType audio/wav), older ones with bare 24 kHz s16le PCM.
// Decoding a WAV as raw PCM plays its header as a click and its trailing metadata chunk as ~0.17 s of loud static
// (the "chh" heard at every scene change). Let ffmpeg parse the container when there is one.
const isWav = buf.subarray(0, 4).toString('latin1') === 'RIFF';
const tmp = `${out}.${isWav ? 'src.wav' : 'pcm'}`;
fs.writeFileSync(tmp, buf);
if (process.env.TTS_KEEP_RAW) fs.copyFileSync(tmp, process.env.TTS_KEEP_RAW);
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...(isWav ? [] : ['-f', 's16le', '-ar', '24000', '-ac', '1']), '-i', tmp, '-ac', '1', '-ar', '24000', out]);
fs.unlinkSync(tmp);
console.log(out, part.inlineData.mimeType);
