PulseLore Chord Room V1

Browser-only static songwriting tool.

Files:
- index.html
- style.css
- script.js

No backend, API, login, database, Convex, or generated files are required.

Core audio:
- Uses the Web Audio API in the browser.
- parseChord(chordName) detects root and chord quality.
- getChordNotes(chordName) returns all chord tones.
- noteToFrequency(noteName, octave) uses A4 = 440 Hz and supports sharps/flats.
- playChord(chordName, startTime, duration, instrument) plays every chord tone for Piano, Ukulele, Guitar, and Soft Pad.
- Bass intentionally plays root only on beat 1 and beat 3.
- Drums intentionally plays a browser-generated groove.

Default progression:
C - G - Am - F

Cloudflare Pages:
This folder is static-hosting compatible. Publish the site root and open /chord-room/.
