import { getScaleNote } from "./music";
import { audioContext, zzfx } from "./zzfx";

// old XP = [
//   0.1,
//   ,
//   207,
//   ,
//   0.08,
//   0.19,
//   3,
//   1.7,
//   1,
//   ,
//   ,
//   ,
//   0.09,
//   0.4,
//   ,
//   0.1,
//   0.07,
//   0.61,
//   0.02,
//   0.01,
//   -2045,
// ],
const sounds = [
  // levelup
  [
    0.4,
    ,
    237,
    0.02,
    0.28,
    0.35,
    ,
    2.5,
    ,
    5,
    196,
    0.14,
    ,
    ,
    ,
    ,
    0.17,
    0.59,
    0.11,
    ,
    -536,
  ],
  // level up 2
  [0.1, , , 0.07, 0.23, 0.29, , 3.8, -5, , , , , 0.3, , , , 0.8, 0.25],
  // collect
  [1 / 8, , 1675, , 0.06, 0.24, 1, 1.82, , , 837, 0.06],
  // [, , 224, 0.02, 0.02, 0.08, 1, 1.7, -13.9, , , , , , 6.7],
  [
    ,
    ,
    101,
    0.01,
    0.01,
    0.15,
    1,
    2.9,
    -5,
    7,
    ,
    ,
    ,
    1.2,
    17,
    ,
    0.13,
    0.52,
    0.04,
    ,
    -2025,
  ],
  [, , 914, 0.01, 0.02, 0.03, , 3.9, -52, , , , , , 24, , 0.08, 0.53, 0.01],
  [
    0.1,
    ,
    415,
    0.02,
    0.02,
    0.08,
    4,
    2.6,
    -1,
    16,
    ,
    ,
    ,
    1.5,
    ,
    0.1,
    ,
    0.88,
    0.09,
  ],
  // cat Ouch
  [1 / 2, 1, 56, , 0.16, 0.46, 2, , 14, -49, , , , , , , , 0.81, , 0.17, -527],
  // lightning
  [1 / 8, , 304, 0.1, 0.3, , 5, 0.1, -46, , , , , , -165],
  // shoot wind
  [, , 150, 0.05, , 0.05, , 1.3, , , , , , 3],

  // note
  [
    1 / 2,
    0,
    440,
    ,
    0.94,
    0.34,
    ,
    0.7,
    ,
    ,
    ,
    ,
    0.11,
    0.2,
    ,
    ,
    ,
    0.34,
    0.19,
    0.23,
  ],
  [1 / 4, 0, 440, 0.1, 0.3, , 2, 1.9, , , , , , , , , , 0.3, 0.03, , -786],
];

export const enum Snd {
  LevelUp1 = 0,
  LevelUp2 = 1,
  Collect = 2,
  Hit = 3,
  Kick = 4,
  Noise = 5,
  CatOuch = 6,
  Lightning = 7,
  ShootWind = 8,
  Note = 9,
  Note2 = 10,
}

let r: number[] = [];

export const playSound = (id: number, note = 0, timeOffset = 0, set = 1) => {
  if (!r[id]) {
    const src = zzfx(...sounds[id]);
    src.detune.value = note * 100;
    src.start(audioContext.currentTime + timeOffset);
    r[id] = set;
  }
};

export const resetSounds = () => (r = []);

export const playMusicMoment = () => {
  let t = 0;
  for (let i = 0; i < 6; ++i) {
    playSound(Snd.Note2, getScaleNote([0, 1, 2, 1, 2, 3, 4, 5][i]), t, 0);
    t += 0.15;
  }
};

export const playMusicMoment2 = () => {
  let t = 0;
  let dur = 0.1;
  for (let i = 0; i < 24; ++i) {
    if ([1, 0, 1, 0][i % 4]) playSound(Snd.Kick, 12, t, 0);
    if ([0, 1, 0, 1][i % 4]) playSound(Snd.ShootWind, 12 - i / 2, t, 0);
    playSound(Snd.Noise, 12 - (i & 3), t, 0);
    // if (!(i & 1)) {
    // const j = i / 2;
    playSound(Snd.Note, getScaleNote((i % 3) + ((i / 3) | 0)), t, 0);
    // }
    t += dur;
    dur *= 1.055;
  }
  playSound(Snd.Note, getScaleNote(7), t, 0);
  t += dur;
  for (let i = 0; i < 8; ++i) {
    playSound(Snd.Note2, getScaleNote([0, 1, 2, 1, 2, 3, 4, 5][i]), t, 0);
    t += 0.15;
  }
};
