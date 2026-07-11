const NOTE_INDEX = {
  C: 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  F: 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
};

const SHARP_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLAT_NOTES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const ROOTS = ["C", "C#", "Db", "D", "D#", "Eb", "E", "F", "F#", "Gb", "G", "G#", "Ab", "A", "A#", "Bb", "B"];

const CHORD_FORMULAS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  "7": [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  m7: [0, 3, 7, 10],
  sus4: [0, 5, 7],
  add9: [0, 4, 7, 14],
};

const QUALITY_SUFFIX = {
  major: "",
  minor: "m",
  "7": "7",
  maj7: "maj7",
  m7: "m7",
  sus4: "sus4",
  add9: "add9",
};

const PRESETS = {
  Pop: [
    ["C", "G", "Am", "F"],
    ["C", "Am", "F", "G"],
    ["C", "F", "G", "C"],
  ],
  Rock: [
    ["C", "Am", "F", "G"],
    ["Am", "F", "C", "G"],
    ["G", "D", "Em", "C"],
  ],
  "Lo-fi / Bedroom Pop": [
    ["Cmaj7", "Am7", "Dm7", "G7"],
    ["Fmaj7", "Em7", "Am7", "G"],
    ["Am7", "Dm7", "G7", "Cmaj7"],
  ],
  Jazz: [
    ["Dm7", "G7", "Cmaj7", "Cmaj7"],
    ["Cmaj7", "Am7", "Dm7", "G7"],
  ],
  "Dark Emotional": [
    ["Am", "F", "C", "G"],
    ["Dm", "Bb", "F", "C"],
    ["Em", "C", "G", "D"],
  ],
  "Ukulele Friendly": [
    ["C", "G", "Am", "F"],
    ["F", "C", "G", "Am"],
    ["Am", "F", "C", "G"],
    ["C", "Am", "F", "G"],
  ],
};

const STORAGE_KEY = "pulselore-chord-room-v1";

let audioContext;
let isPlaying = false;
let activeNodes = [];
let playbackTimer = null;
let currentSectionIndex = 0;
let currentChordIndex = 0;
let editingTarget = null;

let state = {
  bpm: 100,
  key: "C",
  style: "Pop",
  instrument: "Piano",
  loop: true,
  sections: [
    {
      name: "Verse",
      chords: [
        { name: "C", beats: 4 },
        { name: "G", beats: 4 },
        { name: "Am", beats: 4 },
        { name: "F", beats: 4 },
      ],
    },
  ],
};

const dom = {
  playToggle: document.querySelector("#playToggle"),
  bpmInput: document.querySelector("#bpmInput"),
  keySelect: document.querySelector("#keySelect"),
  styleSelect: document.querySelector("#styleSelect"),
  instrumentSelect: document.querySelector("#instrumentSelect"),
  loopToggle: document.querySelector("#loopToggle"),
  saveBtn: document.querySelector("#saveBtn"),
  exportTextBtn: document.querySelector("#exportTextBtn"),
  exportJsonBtn: document.querySelector("#exportJsonBtn"),
  addSectionBtn: document.querySelector("#addSectionBtn"),
  generateBtn: document.querySelector("#generateBtn"),
  sections: document.querySelector("#sections"),
  currentChordName: document.querySelector("#currentChordName"),
  currentChordNotes: document.querySelector("#currentChordNotes"),
  instrumentVisual: document.querySelector("#instrumentVisual"),
  suggestedChords: document.querySelector("#suggestedChords"),
  statusText: document.querySelector("#statusText"),
  chordModal: document.querySelector("#chordModal"),
  chordForm: document.querySelector("#chordForm"),
  modalRoot: document.querySelector("#modalRoot"),
  modalQuality: document.querySelector("#modalQuality"),
  modalBeats: document.querySelector("#modalBeats"),
  deleteChordBtn: document.querySelector("#deleteChordBtn"),
  saveChordBtn: document.querySelector("#saveChordBtn"),
};

function parseChord(chordName) {
  const cleanName = String(chordName || "").trim();
  const match = cleanName.match(/^(C#|Db|D#|Eb|F#|Gb|G#|Ab|A#|Bb|[A-G])(maj7|sus4|add9|m7|min7|min|minor|maj|major|m|7)?$/);

  if (!match) {
    return { root: "C", quality: "major" };
  }

  const root = match[1];
  const suffix = match[2] || "";
  const normalized = suffix.toLowerCase();

  let quality = "major";
  if (normalized === "m" || normalized === "min" || normalized === "minor") quality = "minor";
  if (normalized === "7") quality = "7";
  if (normalized === "maj7") quality = "maj7";
  if (normalized === "m7" || normalized === "min7") quality = "m7";
  if (normalized === "sus4") quality = "sus4";
  if (normalized === "add9") quality = "add9";

  return { root, quality };
}

function getChordNotes(chordName) {
  const { root, quality } = parseChord(chordName);
  const rootIndex = NOTE_INDEX[root];
  const noteNames = root.includes("b") ? FLAT_NOTES : SHARP_NOTES;
  return CHORD_FORMULAS[quality].map((interval) => noteNames[(rootIndex + interval) % 12]);
}

function noteToFrequency(noteName, octave = 4) {
  const note = String(noteName || "").trim();
  if (!(note in NOTE_INDEX)) {
    throw new Error(`Unsupported note: ${noteName}`);
  }

  const midiNumber = (Number(octave) + 1) * 12 + NOTE_INDEX[note];
  return 440 * Math.pow(2, (midiNumber - 69) / 12);
}

function getBeatDuration() {
  return 60 / clampNumber(state.bpm, 45, 220);
}

function playChord(chordName, startTime, duration, instrument = state.instrument) {
  const notes = getChordNotes(chordName);
  const parsed = parseChord(chordName);
  const intervals = CHORD_FORMULAS[parsed.quality];

  if (instrument === "Drums") {
    playDrumGroove(startTime, duration);
    return;
  }

  if (instrument === "Bass") {
    const root = notes[0];
    const baseOctave = 2;
    const beat = getBeatDuration();
    playNote(root, baseOctave, startTime, Math.min(beat * 0.86, duration * 0.48), instrument, 0.64);
    if (duration > beat * 2.2) {
      playNote(root, baseOctave, startTime + beat * 2, Math.min(beat * 0.86, duration * 0.34), instrument, 0.55);
    }
    return;
  }

  const baseOctave = getBaseOctave(parsed.root, instrument);
  const voicedNotes = notes.map((note, index) => ({
    note,
    octave: baseOctave + Math.floor((NOTE_INDEX[parsed.root] + intervals[index]) / 12),
  }));

  if (instrument === "Ukulele") {
    playUkulelePattern(voicedNotes, startTime, duration);
    return;
  }

  if (instrument === "Guitar") {
    const lowerVoicing = voicedNotes.map((tone) => ({ ...tone, octave: Math.max(2, tone.octave - 1) }));
    strumNotes(lowerVoicing, startTime, duration * 0.88, instrument, 0.028, 0.46);
    if (duration > getBeatDuration() * 2.2) {
      strumNotes([...lowerVoicing].reverse(), startTime + getBeatDuration() * 2, duration * 0.45, instrument, 0.024, 0.28);
    }
    return;
  }

  const noteDuration = instrument === "Soft Pad" ? duration : duration * 0.94;
  voicedNotes.forEach((tone) => {
    playNote(tone.note, tone.octave, startTime, noteDuration, instrument, instrument === "Soft Pad" ? 0.32 : 0.42);
  });
}

function playNote(noteName, octave, startTime, duration, instrument = "Piano", velocity = 0.42) {
  const context = getAudioContext();
  const frequency = noteToFrequency(noteName, octave);
  const output = context.createGain();
  const oscillator = context.createOscillator();
  const now = Math.max(startTime, context.currentTime);
  const safeDuration = Math.max(0.06, duration);
  const endTime = now + safeDuration;
  const envelope = getEnvelope(instrument, safeDuration, velocity);

  oscillator.type = getWaveform(instrument);
  oscillator.frequency.setValueAtTime(frequency, now);

  if (instrument === "Soft Pad") {
    oscillator.detune.setValueAtTime(-5, now);
    const second = context.createOscillator();
    second.type = "sine";
    second.frequency.setValueAtTime(frequency, now);
    second.detune.setValueAtTime(7, now);
    second.connect(output);
    second.start(now);
    second.stop(endTime + envelope.release + 0.05);
    activeNodes.push(second);
  }

  output.gain.setValueAtTime(0.0001, now);
  output.gain.exponentialRampToValueAtTime(envelope.peak, now + envelope.attack);
  output.gain.setTargetAtTime(envelope.sustain, now + envelope.attack, envelope.decay);
  output.gain.setTargetAtTime(0.0001, Math.max(now + envelope.attack, endTime - envelope.release), envelope.release);

  oscillator.connect(output);
  output.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(endTime + envelope.release + 0.05);

  activeNodes.push(oscillator, output);
  oscillator.addEventListener("ended", () => {
    activeNodes = activeNodes.filter((node) => node !== oscillator && node !== output);
  });
}

function playUkulelePattern(voicedNotes, startTime, duration) {
  const beat = getBeatDuration();
  const beats = Math.max(1, Math.round(duration / beat));
  const pattern = ["down", "up", "down", "up"];

  for (let beatIndex = 0; beatIndex < beats; beatIndex += 1) {
    const direction = pattern[beatIndex % pattern.length];
    const notes = direction === "up" ? [...voicedNotes].reverse() : voicedNotes;
    const accent = beatIndex === 0 || beatIndex === 2 ? 0.34 : 0.22;
    strumNotes(notes, startTime + beatIndex * beat, Math.min(beat * 0.72, duration), "Ukulele", 0.026, accent);
  }
}

function strumNotes(voicedNotes, startTime, duration, instrument, delay, velocity) {
  voicedNotes.forEach((tone, index) => {
    playNote(tone.note, tone.octave, startTime + index * delay, duration, instrument, velocity);
  });
}

function playDrumGroove(startTime, duration) {
  const beat = getBeatDuration();
  const beats = Math.max(1, Math.round(duration / beat));

  for (let beatIndex = 0; beatIndex < beats; beatIndex += 1) {
    const beatTime = startTime + beatIndex * beat;
    if (beatIndex % 2 === 0) playDrumHit("kick", beatTime, 0.72);
    if (beatIndex % 2 === 1) playDrumHit("snare", beatTime, 0.48);
    playDrumHit("hat", beatTime, 0.2);
    playDrumHit("hat", beatTime + beat / 2, 0.16);
  }
}

function playDrumHit(type, startTime, velocity) {
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = Math.max(startTime, context.currentTime);

  oscillator.type = type === "hat" ? "square" : "sine";
  oscillator.frequency.setValueAtTime(type === "kick" ? 92 : type === "snare" ? 220 : 6800, now);
  if (type === "kick") oscillator.frequency.exponentialRampToValueAtTime(42, now + 0.12);

  gain.gain.setValueAtTime(Math.max(0.0001, velocity), now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + (type === "hat" ? 0.045 : 0.16));
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + (type === "hat" ? 0.05 : 0.18));
  activeNodes.push(oscillator, gain);
}

function getEnvelope(instrument, duration, velocity) {
  if (instrument === "Soft Pad") {
    return { attack: 0.22, decay: 0.32, sustain: velocity * 0.78, release: Math.min(1.2, duration * 0.28), peak: velocity };
  }
  if (instrument === "Guitar" || instrument === "Ukulele") {
    return { attack: 0.006, decay: 0.12, sustain: velocity * 0.46, release: Math.min(0.5, duration * 0.35), peak: velocity };
  }
  if (instrument === "Bass") {
    return { attack: 0.01, decay: 0.08, sustain: velocity * 0.62, release: 0.18, peak: velocity };
  }
  return { attack: 0.012, decay: 0.18, sustain: velocity * 0.54, release: Math.min(0.65, duration * 0.3), peak: velocity };
}

function getWaveform(instrument) {
  if (instrument === "Soft Pad") return "sine";
  if (instrument === "Bass") return "triangle";
  if (instrument === "Guitar" || instrument === "Ukulele") return "triangle";
  return "sine";
}

function getBaseOctave(root, instrument) {
  if (instrument === "Ukulele") return 4;
  if (instrument === "Guitar") return 3;
  if (instrument === "Soft Pad") return 3;
  return NOTE_INDEX[root] >= 7 ? 3 : 4;
}

function getAudioContext() {
  if (!audioContext) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
  }
  return audioContext;
}

function startPlayback() {
  const context = getAudioContext();
  if (context.state === "suspended") context.resume();
  isPlaying = true;
  dom.playToggle.textContent = "Pause";
  currentSectionIndex = 0;
  currentChordIndex = 0;
  playCurrentChord();
}

function pausePlayback() {
  isPlaying = false;
  dom.playToggle.textContent = "Play";
  clearTimeout(playbackTimer);
  playbackTimer = null;
  activeNodes.forEach((node) => {
    try {
      if (node.stop) node.stop();
      if (node.disconnect) node.disconnect();
    } catch (error) {
      // Already stopped nodes can safely be ignored.
    }
  });
  activeNodes = [];
  clearHighlights();
  setStatus("Paused.");
}

function playCurrentChord() {
  if (!isPlaying) return;

  const section = state.sections[currentSectionIndex];
  const chord = section?.chords[currentChordIndex];
  if (!section || !chord) {
    if (state.loop) {
      currentSectionIndex = 0;
      currentChordIndex = 0;
      playCurrentChord();
    } else {
      pausePlayback();
    }
    return;
  }

  const duration = chord.beats * getBeatDuration();
  const startTime = getAudioContext().currentTime + 0.035;

  playChord(chord.name, startTime, duration, state.instrument);
  highlightChord(currentSectionIndex, currentChordIndex);
  renderSidePanel(chord.name);
  setStatus(`Playing ${chord.name} for ${chord.beats} beats as ${state.instrument}.`);

  playbackTimer = window.setTimeout(() => {
    advancePlaybackIndex();
    playCurrentChord();
  }, duration * 1000);
}

function advancePlaybackIndex() {
  const section = state.sections[currentSectionIndex];
  currentChordIndex += 1;

  if (currentChordIndex >= section.chords.length) {
    currentChordIndex = 0;
    currentSectionIndex += 1;
  }

  if (currentSectionIndex >= state.sections.length) {
    currentSectionIndex = state.loop ? 0 : state.sections.length;
  }
}

function render() {
  dom.bpmInput.value = state.bpm;
  dom.keySelect.value = state.key;
  dom.styleSelect.value = state.style;
  dom.instrumentSelect.value = state.instrument;
  dom.loopToggle.checked = state.loop;

  dom.sections.innerHTML = "";

  state.sections.forEach((section, sectionIndex) => {
    const card = document.createElement("article");
    card.className = "section-card";
    card.innerHTML = `
      <div class="section-head">
        <div>
          <h1>${escapeHtml(section.name)}</h1>
          <span class="section-meta">${section.chords.length} chords</span>
        </div>
      </div>
      <div class="chord-grid"></div>
      <div class="section-actions">
        <button type="button" data-add-chord="${sectionIndex}">Add chord</button>
      </div>
    `;

    const grid = card.querySelector(".chord-grid");
    section.chords.forEach((chord, chordIndex) => {
      const button = document.createElement("button");
      button.className = "chord-box";
      button.type = "button";
      button.dataset.sectionIndex = sectionIndex;
      button.dataset.chordIndex = chordIndex;
      button.innerHTML = `
        <span class="chord-name">${escapeHtml(chord.name)}</span>
        <span class="chord-notes">${getChordNotes(chord.name).join(" + ")}</span>
        <span class="chord-beats">${chord.beats} beats</span>
      `;
      button.addEventListener("click", () => openChordModal(sectionIndex, chordIndex));
      grid.appendChild(button);
    });

    card.querySelector("[data-add-chord]").addEventListener("click", () => {
      section.chords.push({ name: getSuggestedNext(section.chords.at(-1)?.name || "C")[0], beats: 4 });
      render();
      setStatus("Chord added.");
    });

    dom.sections.appendChild(card);
  });

  const firstChord = state.sections[0]?.chords[0]?.name || "C";
  renderSidePanel(firstChord);
}

function renderSidePanel(chordName) {
  const notes = getChordNotes(chordName);
  dom.currentChordName.textContent = chordName;
  dom.currentChordNotes.textContent = notes.join(" + ");
  dom.instrumentVisual.innerHTML = getInstrumentVisual(chordName, state.instrument);
  renderSuggestions(chordName);
}

function getInstrumentVisual(chordName, instrument) {
  const notes = getChordNotes(chordName);

  if (instrument === "Ukulele") {
    return renderFretDiagram("Ukulele GCEA", ["G", "C", "E", "A"], getUkuleleFrets(chordName));
  }

  if (instrument === "Guitar") {
    return renderFretDiagram("Guitar EADGBE", ["E", "A", "D", "G", "B", "E"], getGuitarFrets(chordName));
  }

  if (instrument === "Bass") {
    return `
      <div class="pattern-wrap">
        <div class="diagram-title"><span>Bass root pattern</span><span>${notes[0]}</span></div>
        <p>Root on beat 1 and beat 3.</p>
        <div class="pattern-steps">
          <span class="strong">${notes[0]}</span><span></span><span></span><span></span>
          <span class="strong">${notes[0]}</span><span></span><span></span><span></span>
        </div>
      </div>
    `;
  }

  if (instrument === "Drums") {
    return `
      <div class="pattern-wrap">
        <div class="diagram-title"><span>Drum groove</span><span>4 beat</span></div>
        <p>Kick 1 and 3, snare 2 and 4, hi-hat eighth notes.</p>
        <div class="pattern-steps">
          <span class="strong">Kick</span><span>Hat</span><span>Snare</span><span>Hat</span>
          <span class="strong">Kick</span><span>Hat</span><span>Snare</span><span>Hat</span>
        </div>
      </div>
    `;
  }

  if (instrument === "Soft Pad") {
    return `
      <div class="pattern-wrap">
        <div class="diagram-title"><span>Soft Pad voicing</span><span>Sustain</span></div>
        <p>${notes.join(" + ")} held for the full chord duration.</p>
        <div class="pattern-steps">${notes.map((note) => `<span class="strong">${note}</span>`).join("")}</div>
      </div>
    `;
  }

  return renderKeyboard(notes);
}

function renderFretDiagram(title, strings, frets) {
  return `
    <div class="diagram-wrap">
      <div class="diagram-title"><span>${title}</span><span>Chord shape</span></div>
      <div class="fretboard" style="--strings:${strings.length}">
        ${strings.map((stringName, index) => {
          const fret = frets[index] ?? 0;
          const top = fret === 0 ? 8 : 28 + (Math.min(fret, 4) - 0.5) * 30;
          return `<div class="string"><span style="top:${top}px">${fret}</span></div>`;
        }).join("")}
      </div>
      <div class="string-name-row" style="--strings:${strings.length}">
        ${strings.map((stringName) => `<span>${stringName}</span>`).join("")}
      </div>
    </div>
  `;
}

function renderKeyboard(activeNotes) {
  const keyboardNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B", "C", "D"];
  return `
    <div class="keyboard-wrap">
      <div class="diagram-title"><span>Piano voicing</span><span>${activeNotes.join(" ")}</span></div>
      <div class="keyboard">
        ${keyboardNotes.map((note) => `<span class="key ${note.includes("#") ? "sharp" : ""} ${activeNotes.includes(note) ? "on" : ""}">${note}</span>`).join("")}
      </div>
    </div>
  `;
}

function getUkuleleFrets(chordName) {
  const shapes = {
    C: [0, 0, 0, 3],
    G: [0, 2, 3, 2],
    Am: [2, 0, 0, 0],
    F: [2, 0, 1, 0],
    Dm: [2, 2, 1, 0],
    Bb: [3, 2, 1, 1],
    Cmaj7: [0, 0, 0, 2],
    Am7: [0, 0, 0, 0],
    Dm7: [2, 2, 1, 3],
    G7: [0, 2, 1, 2],
  };
  return shapes[chordName] || [0, 0, 0, 0];
}

function getGuitarFrets(chordName) {
  const shapes = {
    C: [0, 3, 2, 0, 1, 0],
    G: [3, 2, 0, 0, 0, 3],
    Am: [0, 0, 2, 2, 1, 0],
    F: [1, 3, 3, 2, 1, 1],
    Dm: [0, 0, 0, 2, 3, 1],
    Bb: [1, 1, 3, 3, 3, 1],
    Cmaj7: [0, 3, 2, 0, 0, 0],
    Am7: [0, 0, 2, 0, 1, 0],
    Dm7: [0, 0, 0, 2, 1, 1],
    G7: [3, 2, 0, 0, 0, 1],
  };
  return shapes[chordName] || [0, 0, 2, 2, 0, 0];
}

function renderSuggestions(chordName) {
  const suggestions = getSuggestedNext(chordName);
  dom.suggestedChords.innerHTML = "";
  suggestions.forEach((suggestion) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = suggestion;
    button.addEventListener("click", () => {
      state.sections[0].chords.push({ name: suggestion, beats: 4 });
      render();
      setStatus(`${suggestion} added to Verse.`);
    });
    dom.suggestedChords.appendChild(button);
  });
}

function getSuggestedNext(chordName) {
  const root = parseChord(chordName).root;
  const suggestionsByRoot = {
    C: ["G", "Am", "F", "Dm7"],
    G: ["Am", "C", "D", "Em"],
    A: ["F", "C", "G", "Dm"],
    F: ["C", "G", "Dm", "Bb"],
    D: ["G", "A", "Bm", "F#m"],
    E: ["A", "B", "C#m", "F#m"],
    B: ["E", "F#", "G#m", "C#m"],
  };
  return suggestionsByRoot[root.replace("#", "").replace("b", "")] || ["C", "G", "Am", "F"];
}

function openChordModal(sectionIndex, chordIndex) {
  editingTarget = { sectionIndex, chordIndex };
  const chord = state.sections[sectionIndex].chords[chordIndex];
  const parsed = parseChord(chord.name);
  dom.modalRoot.value = parsed.root;
  dom.modalQuality.value = parsed.quality;
  dom.modalBeats.value = String(chord.beats);
  dom.chordModal.showModal();
}

function saveChordFromModal() {
  if (!editingTarget) return;
  const chord = state.sections[editingTarget.sectionIndex].chords[editingTarget.chordIndex];
  chord.name = `${dom.modalRoot.value}${QUALITY_SUFFIX[dom.modalQuality.value]}`;
  chord.beats = Number(dom.modalBeats.value);
  dom.chordModal.close();
  render();
  setStatus(`${chord.name} saved.`);
}

function deleteChordFromModal() {
  if (!editingTarget) return;
  const section = state.sections[editingTarget.sectionIndex];
  if (section.chords.length <= 1) {
    setStatus("Keep at least one chord in the section.");
    return;
  }
  section.chords.splice(editingTarget.chordIndex, 1);
  dom.chordModal.close();
  render();
  setStatus("Chord deleted.");
}

function generateProgression() {
  const presets = PRESETS[state.style] || PRESETS.Pop;
  const preset = presets[Math.floor(Math.random() * presets.length)];
  const transposed = preset.map((chord) => transposeChord(chord, state.key));
  state.sections = [{ name: "Verse", chords: transposed.map((name) => ({ name, beats: 4 })) }];
  currentSectionIndex = 0;
  currentChordIndex = 0;
  render();
  setStatus(`${state.style} progression generated in ${state.key}.`);
}

function transposeChord(chordName, targetKey) {
  const parsed = parseChord(chordName);
  const shift = NOTE_INDEX[targetKey] - NOTE_INDEX.C;
  const noteNames = targetKey.includes("b") ? FLAT_NOTES : SHARP_NOTES;
  const nextRoot = noteNames[(NOTE_INDEX[parsed.root] + shift + 120) % 12];
  return `${nextRoot}${QUALITY_SUFFIX[parsed.quality]}`;
}

function saveProgression() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  setStatus("Progression saved in this browser.");
}

function loadProgression() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved?.sections?.length) {
      state = { ...state, ...saved };
    }
  } catch (error) {
    setStatus("Saved progression could not be loaded.");
  }
}

function exportProgression(format) {
  const fileName = `pulselore-chord-room-${Date.now()}.${format === "json" ? "json" : "txt"}`;
  const text = format === "json" ? JSON.stringify(state, null, 2) : getProgressionText();
  const blob = new Blob([text], { type: format === "json" ? "application/json" : "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
  setStatus(`Exported ${format.toUpperCase()}.`);
}

function getProgressionText() {
  const lines = [
    "PulseLore Chord Room V1",
    `BPM: ${state.bpm}`,
    `Key: ${state.key}`,
    `Style: ${state.style}`,
    `Instrument: ${state.instrument}`,
    "",
  ];

  state.sections.forEach((section) => {
    lines.push(`[${section.name}]`);
    lines.push(section.chords.map((chord) => `${chord.name} (${chord.beats} beats)`).join(" - "));
    lines.push("");
  });

  return lines.join("\n");
}

function addSection() {
  const nextNumber = state.sections.length + 1;
  state.sections.push({
    name: nextNumber === 2 ? "Chorus" : `Section ${nextNumber}`,
    chords: [
      { name: "F", beats: 4 },
      { name: "G", beats: 4 },
      { name: "C", beats: 4 },
      { name: "Am", beats: 4 },
    ],
  });
  render();
  setStatus("Section added.");
}

function highlightChord(sectionIndex, chordIndex) {
  clearHighlights();
  const selector = `[data-section-index="${sectionIndex}"][data-chord-index="${chordIndex}"]`;
  document.querySelector(selector)?.classList.add("is-active");
}

function clearHighlights() {
  document.querySelectorAll(".chord-box.is-active").forEach((box) => box.classList.remove("is-active"));
}

function setStatus(message) {
  dom.statusText.textContent = message;
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, Number(value) || min));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setupModalOptions() {
  dom.modalRoot.innerHTML = ROOTS.map((root) => `<option>${root}</option>`).join("");
}

function bindEvents() {
  dom.playToggle.addEventListener("click", () => {
    if (isPlaying) pausePlayback();
    else startPlayback();
  });

  dom.bpmInput.addEventListener("change", () => {
    state.bpm = clampNumber(dom.bpmInput.value, 45, 220);
    dom.bpmInput.value = state.bpm;
    setStatus(`BPM set to ${state.bpm}.`);
  });

  dom.keySelect.addEventListener("change", () => {
    state.key = dom.keySelect.value;
    setStatus(`Key set to ${state.key}. Generate chords to apply it.`);
  });

  dom.styleSelect.addEventListener("change", () => {
    state.style = dom.styleSelect.value;
    setStatus(`${state.style} selected.`);
  });

  dom.instrumentSelect.addEventListener("change", () => {
    state.instrument = dom.instrumentSelect.value;
    renderSidePanel(state.sections[currentSectionIndex]?.chords[currentChordIndex]?.name || state.sections[0].chords[0].name);
    setStatus(`${state.instrument} selected.`);
  });

  dom.loopToggle.addEventListener("change", () => {
    state.loop = dom.loopToggle.checked;
    setStatus(state.loop ? "Loop enabled." : "Loop disabled.");
  });

  dom.saveBtn.addEventListener("click", saveProgression);
  dom.exportTextBtn.addEventListener("click", () => exportProgression("txt"));
  dom.exportJsonBtn.addEventListener("click", () => exportProgression("json"));
  dom.addSectionBtn.addEventListener("click", addSection);
  dom.generateBtn.addEventListener("click", generateProgression);
  dom.saveChordBtn.addEventListener("click", saveChordFromModal);
  dom.deleteChordBtn.addEventListener("click", deleteChordFromModal);
}

setupModalOptions();
loadProgression();
bindEvents();
render();

window.PulseLoreChordRoom = {
  parseChord,
  getChordNotes,
  noteToFrequency,
  playChord,
};
