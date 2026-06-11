import { max, min, random } from "./math";

export const reach = (t0: number, t1: number, v: number): number =>
  // t0 <= t1 ? min(t0 + v, t1) : max(t0 - v, t1);
  {
    if (t0 < t1) {
      return min(t0 + v, t1);
    } else if (t0 > t1) {
      return max(t0 - v, t1);
    }
    return t0;
  };

export const lerp = (a: number, b: number, t: number): number =>
  a * (1 - t) + b * t;

export const shuffle = <T>(array: T[]): void => {
  for (let i = 0; i < array.length; ++i) {
    const idx = (random() * array.length) | 0;
    // swap
    const temp = array[idx];
    array[idx] = array[i];
    array[i] = temp;
  }
};

export const pickRandom = <T>(array: T[]): T =>
  array[(random() * array.length) | 0];

export const easeQuadOut = (t: number) => t * (2 - t);

export const lerp_rgb = (a: number, b: number, t: number) =>
  (lerp((a >> 16) & 0xff, (b >> 16) & 0xff, t) << 16) |
  (lerp((a >> 8) & 0xff, (b >> 8) & 0xff, t) << 8) |
  lerp(a & 0xff, b & 0xff, t);

export const css_rgba = (color: number, alpha: number = 1) =>
  "rgba(" +
  ((color >> 16) & 0xff) +
  "," +
  ((color >> 8) & 0xff) +
  "," +
  (color & 0xff) +
  "," +
  alpha +
  ")";

// export const formatMMSS = (seconds: number) =>
//   // [seconds / 60, seconds % 60].map((x) => (x < 10 ? "0" : "") + (x | 0))
//   [seconds / 60, seconds % 60].map((x) => ((x / 10) | 0) + "" + (x | 0))
//     .join`:`;

export const formatMMSS = (
  seconds: number,
  mm = (seconds / 60) | 0,
  ss = seconds % 60 | 0
) => "" + ((mm / 10) | 0) + (mm % 10) + ":" + ((ss / 10) | 0) + (ss % 10);
// {
//   const m = "" + ((seconds / 60) | 0);
//   const s = "" + (seconds % 60 | 0);
//   return m.padStart(2, "0") + ":" + s.padStart(2, "0");
// }

export const clamp = (x: number): number => min(1, max(0, x));

export const makeArray = (n: number, v: number) => Array(n).fill(v);

export const chance = (n = 0.5) => random() < n;

export const smoothstep = (
  edge0: number,
  edge1: number,
  x: number,
  // Scale, and clamp x to 0..1 range
  _t = clamp((x - edge0) / (edge1 - edge0))
) => _t * _t * (3 - 2 * _t);
