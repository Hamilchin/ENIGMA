import { audioContext } from "./zzfx";
import { random } from "./math";
import { makeArray, smoothstep } from "./utils";

export let musicGain = audioContext.createGain();
// Chord filter
let chordOut: BiquadFilterNode = audioContext.createBiquadFilter();
let bassOut = audioContext.createGain();

export const initMusic = () => {
  musicGain.gain.value = 0;
  bassOut.gain.value = 0.7;
  chordOut.type = "lowpass";
  chordOut.frequency.value = 500;

  musicGain.connect(audioContext.destination);
  chordOut.connect(musicGain);
  bassOut.connect(musicGain);
};

/* =========================
   STATE
   ========================= */
let isPlaying: number = 0;
let tempo = 90; // BPM
const subdivisionsPerBeat = 4; // 16th notes
const subdivisionsPerBar = 4 * subdivisionsPerBeat; // 16 per bar
let nextNoteTime = 0;
let barIndex = 0;
let subdivisionIndex = 0;
let schedulerHandle: number | null;
const lookahead = 0.3; // schedule 0.3s ahead

/* =========================
   SCALES / CHORDS
   ========================= */
// const aMinor = ;
// export const gammas = [
//   [0, 2, 4, 5, 7, 9, 10],
//   [0, 2, 3, 5, 7, 8, 10],
// ];
const aMajor = [0, 2, 4, 5, 7, 9, 10];

const noteFreq = (semitonesFromA4: number) => 440 * 2 ** (semitonesFromA4 / 12);

export const getScaleNote = (scaleIdx: number, octave = 0) =>
  aMajor[scaleIdx % aMajor.length] + 12 * ((scaleIdx / aMajor.length) | 0);

const triadSemis = (rootScaleIdx: number) => {
  return [
    getScaleNote(rootScaleIdx),
    getScaleNote(rootScaleIdx + 2),
    getScaleNote(rootScaleIdx + 6),
    getScaleNote(rootScaleIdx + 4),
  ];
};

// Chord progression per bar
let progression = [0, 3, 4, 2]; // A minor cycle
let currentChordRoot = 0;
/* =========================
   DRUMS
   ========================= */
const makeNoise = (dur: number) => {
  const buf = audioContext.createBuffer(
    1,
    audioContext.sampleRate * dur,
    audioContext.sampleRate
  );
  const ch = buf.getChannelData(0);
  for (let i = 0; i < ch.length; i++) ch[i] = random() * 2 - 1;
  const src = audioContext.createBufferSource();
  src.buffer = buf;
  return src;
};

const playKickAt = (t: number) => {
  const osc = audioContext.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(135, t);
  osc.frequency.exponentialRampToValueAtTime(0.001, t + 0.2);
  const g = audioContext.createGain();
  g.gain.setValueAtTime(0.8, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  osc.connect(g);
  g.connect(musicGain);
  osc.start(t);
  osc.stop(t + 0.3);
};

const playSnareAt = (t: number) => {
  const src = makeNoise(0.2);
  const fil = audioContext.createBiquadFilter();
  fil.type = "highpass";
  fil.frequency.value = 2000;
  const g = audioContext.createGain();
  g.gain.setValueAtTime(0.7, t);
  g.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
  src.connect(fil);
  fil.connect(g);
  g.connect(musicGain);
  src.start(t);
  src.stop(t + 0.2);
};

const playHatAt = (t: number) => {
  const src = makeNoise(0.12);
  const fil = audioContext.createBiquadFilter();
  fil.type = "highpass";
  fil.frequency.value = 7000;
  const g = audioContext.createGain();
  g.gain.setValueAtTime(0.12, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
  src.connect(fil);
  fil.connect(g);
  g.connect(musicGain);
  src.start(t);
  src.stop(t + 0.08);
};

/* =========================
   CHORDS
   ========================= */
const playChordAt = (t: number, chordSemis: number[], durBeats = 4) => {
  const dur = (durBeats * 60) / tempo;
  const ddd = 16;
  // bass plays root
  for (let i = 0; i < ddd; i++) {
    if (
      i === 0 ||
      (random() > 0.2 &&
        (kickPattern[drumPattern][i] || snarePattern[drumPattern][i]))
    ) {
      playBassAt(
        t,
        dur / ddd,
        chordSemis[i > 0 || random() < i / ddd ? 0 : (1 + random() * 2) | 0]
      );
    }

    if (i > 7 && i <= 10) {
      t += dur / ddd;
      continue;
    }
    // continue;
    const s = chordSemis[i % chordSemis.length];
    const osc = audioContext.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(noteFreq(s), t);
    const g = audioContext.createGain();
    g.gain.setValueAtTime(0.6, t);
    // g.gain.linearRampToValueAtTime(0.9, t + dur / 16);
    g.gain.exponentialRampToValueAtTime(0.01, t + dur / 8);
    osc.connect(g);
    g.connect(chordOut);
    osc.start(t);
    osc.stop(t + dur / 16);

    t += dur / ddd;
  }
};

/* =========================
   PATTERNS
   ========================= */
// Simple 16th-note drum patterns
let drumPattern = 0;

const kickPattern = [
  [1, , , , 1, , , , 1, , , 1, , 1, ,],
  [1, , , 1, , , 1, , 1, , , 1, , , 1, 1],
];
const snarePattern = [
  [, , 1, , , , 1, , , , 1, , , , 1, 1],
  [, , 1, , , , 1, , , , 1, , , , 1],
];
const hihatPattern = [makeArray(16, 1), makeArray(16, 1)]; // constant 16th hi-hats

const generateProgression = () => {
  const chordTransitions: { [key: number]: number[] } = [
    [3, 4, 2], // i → iv, v, III
    [0, 3], // ii° → i, iv
    [3, 0, 5], // III → iv, i, VI
    [0, 4, 5], // iv → i, v, VI
    [0, 2, 5], // v → i, III, VI
    [3, 4, 0], // VI → iv, v, i
    [0, 2, 3], // VII → i, III, iv
  ];
  progression = [];
  let cc = currentChordRoot;
  for (let i = 0; i < 4; ++i) {
    const nextOptions = chordTransitions[cc];
    cc = nextOptions[(random() * nextOptions.length) | 0];
    progression.push(cc);
  }
  return progression;
};
/* =========================
   SCHEDULER
   ========================= */
const scheduleAhead = () => {
  const now = audioContext.currentTime;
  while (nextNoteTime < now + lookahead) {
    const subIdx = subdivisionIndex % subdivisionsPerBar;
    // bar start
    if (subIdx === 0) {
      if (barIndex % 4 === 0) {
        if (barIndex) {
          if (random() > 0.7) {
            currentChordRoot = progression[(barIndex - 1) % progression.length];
            generateProgression();
          }
        }
        drumPattern = random() > 0.5 ? 0 : 1;
      }
      currentChordRoot = progression[barIndex % progression.length];
      playChordAt(nextNoteTime, triadSemis(currentChordRoot), 4);
      ++barIndex;
    }

    // drum hits
    if (kickPattern[drumPattern][subIdx]) playKickAt(nextNoteTime);
    if (snarePattern[drumPattern][subIdx]) playSnareAt(nextNoteTime);
    if (hihatPattern[drumPattern][subIdx]) playHatAt(nextNoteTime);

    // advance
    nextNoteTime += 60 / tempo / subdivisionsPerBeat;
    ++subdivisionIndex;
  }
};

/* =========================
   BASS
   ========================= */
const playBassAt = (t: number, dur: number, rootSemis: number) => {
  const osc = audioContext.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(noteFreq((rootSemis % 12) - 36), t); // two octaves down
  const g = audioContext.createGain();
  g.gain.setValueAtTime(1, t);
  g.gain.exponentialRampToValueAtTime(1 / 2, t + dur);
  osc.connect(g);
  g.connect(bassOut);
  osc.start(t);
  osc.stop(t + dur);
};

/* =========================
   PUBLIC API
   ========================= */
export const startMusic = () => {
  if (!isPlaying) {
    isPlaying = 1;
    barIndex = 0;
    subdivisionIndex = 0;
    nextNoteTime = audioContext.currentTime + 0.05;
    schedulerHandle = window.setInterval(scheduleAhead, 25);
    musicGain.gain.value = 0.05;
  }
};

export const setMusicProgress = (x: number) => {
  const y = x % (2 * 60);
  const chordsVol = smoothstep(30, 90, y) - smoothstep(2 * 60 - 5, 2 * 60, y);
  const bassVol =
    (smoothstep(0, 30, y) - smoothstep(2 * 60 - 5, 2 * 60, y)) / 2;
  chordOut.frequency.value = chordsVol * 500;
  bassOut.gain.value = bassVol;
};

export const stopMusic = () => {
  if (isPlaying) {
    isPlaying = 0;
    musicGain.gain.value = 0;
    if (schedulerHandle) clearInterval(schedulerHandle);
  }
};
