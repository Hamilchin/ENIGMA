import type { Effect } from './card';

/**
 * Util to create a delay.
 * @param ms number of ms to wait
 * @returns Promise, which delays stuff
 */
export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 *
 * @param effects Array of effects, written like this: handleEffectsSequentially([ () => func1(), () => func2() ])
 * @param delayInMs Default is 500 ms, but if you need longer you can overwrite
 */
export async function handleEffectsSequentially(
  effects: Effect | Effect[],
  delayInMs: number = 500
) {
  const effectsList = Array.isArray(effects) ? effects : [effects];
  for (const effect of effectsList) {
    effect();
    await delay(delayInMs);
  }
}

export function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function getRandom(items: any[]) {
  return items[Math.floor(Math.random() * items.length)];
}
