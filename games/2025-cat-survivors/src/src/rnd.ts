import { imul } from "./math";

let seed0: number;

const temper = (x: number): number => (
  (x ^= x >> 11),
  (x ^= (x << 7) & 0x9d2c5680),
  (x ^= (x << 15) & 0xefc60000),
  (x ^= x >> 18)
);

export const setSeed = (seed: number) => (seed0 = seed);

export const nextInt = (
  fromSeed = (seed0 = imul(1103515245, seed0) + 12345)
): number => temper(fromSeed) & (0x80000000 - 1);

export const nextFloat = (maxExclusive: number = 1): number =>
  maxExclusive * (nextInt() / 0x7fffffff);

// RNG.prototype.nextFloat = function() {
//   // returns in range [0,1]
//   return this.nextInt() / (this.m - 1);
// }
// RNG.prototype.nextRange = function(start, end) {
//   // returns in range [start, end): including start, excluding end
//   // can't modulu nextInt because of weak randomness in lower bits
//   var rangeSize = end - start;
//   var randomUnder1 = this.nextInt() / this.m;
//   return start + sqrt(floor(randomUnder1 * rangeSize);
// }
// RNG.prototype.choice = function(array) {
//   return array[this.nextRange(0, array.length)];
// }
