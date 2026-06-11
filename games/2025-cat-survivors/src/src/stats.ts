import { min } from "./math";
import {
  getCharItemPassive,
  StatKey,
  type CharItem,
  type SlotInstance,
  type WeaponStatKey,
} from "./upgrade_types";

export let level: number;
export let xp: number;
export let frags: number;
export let playTime: number;

export const XP_MOD = 5;
export const baseStats: number[] = [
  // ExtraProjectiles
  0,
  // damage
  5,
  // BulletSpeed
  0,
  // Area
  0,
  // attack speed mod
  0,
  // burst speed
  0,
  // hp
  100,

  // regen
  0,
  // move speed
  60,
  // magnet radius
  30,
  // xp
  XP_MOD,
  // luck
  1,

  // Armor
  0,

  // WeaponSlots
  6,
  // PassiveSlots
  6,
];

export let stats: number[];
export let slots: SlotInstance[];

export const resetStats = () => {
  slots = [];
  stats = baseStats.concat();
  level = 0;
  xp = 0;
  frags = 0;
  playTime = 0;
};

export const getStat = (stat: StatKey): number => stats[stat];
export const addStat = (stat: StatKey, add: number) => (stats[stat] += add);

export const getWeaponOrPassiveCount = (passive: number) =>
  slots.filter((s) => passive == getCharItemPassive(s.type)).length;

// export const getNextLevelXp = () => (5 * (level + 1) ** 0.9) | 0;
export const getNextLevelXp = () => (5 * XP_MOD * (1 + level ** 0.9)) | 0;

export const addPlayTime = (v: number, dur: number) => {
  playTime = min(dur, playTime + v);
  return playTime >= dur;
};

export const addXp = (count: number) => {
  xp += count;
  const nextLevelXp = getNextLevelXp();
  if (xp >= nextLevelXp) {
    xp -= nextLevelXp;
    ++level;
    return true;
  }
  return false;
};

export const addFrag = () => ++frags;

export const addLevelDebug = () => {
  ++level;
};

export const getSlotWithItem = (charItem: CharItem): SlotInstance | undefined =>
  slots.find((s) => s.type === charItem);

export const getWeaponStat = (slot: SlotInstance, key: StatKey): number =>
  slot.stats[key] + stats[key];
