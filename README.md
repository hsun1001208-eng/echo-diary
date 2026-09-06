# Echo Diary V8

V8 focuses on two fixes:
- stronger iOS/iPad Safari zoom prevention while keeping touch/stylus handwriting;
- cleaner handwriting export: the browser crops the actual ink, puts it on a high-contrast background and enlarges it before sending;
- two-pass vision flow: first transcribe the handwriting, then generate the diary reply strictly from that transcription;
- if a character is unclear, the model must use □ rather than inventing a different sentence.

## Render
Build Command: `npm install`
Start Command: `npm start`
Environment variable: `OPENAI_API_KEY`
