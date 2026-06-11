export const {
  PI,
  cos,
  sin,
  // abs,
  round,
  // min,
  // max,
  tan,
  random,
  atan2,
  hypot,
  exp,
  sign,
  imul,
  // floor,
  // optimizable
  // sqrt,
  // pow,
  E,
} = Math;
export const TAU = PI * 2;
export const min = (a: number, b: number): number => (a < b ? a : b);
export const max = (a: number, b: number): number => (a > b ? a : b);
// export const round = (x: number): number => (x + 0.5) | 0;
export const abs = (x: number): number => (x > 0 ? x : -x);
// export const hypot = (x: number, y: number): number => (x * x + y * y) ** 0.5;
// export const sign = (x: number) => (x > 0 ? 1 : x < 0 ? -1 : 0);
// export const exp = (x: number): number => E ** x;
