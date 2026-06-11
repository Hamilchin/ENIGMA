import { addTextParticle, drawIcon, drawText } from "./bubble";
import { playMusicMoment, playMusicMoment2, playSound, Snd } from "./sounds";
import {
  addLevelDebug,
  addStat,
  addXp,
  getSlotWithItem,
  getStat,
  getWeaponOrPassiveCount,
  getWeaponStat,
  level,
  slots,
} from "./stats";
import {
  ctx,
  dt,
  gameHeight,
  gameWidth,
  isAnyKeyDown,
  keyboardDown,
  keyboardIsDown,
  keyboardUp,
  pointerDown,
  pointerIsDown,
  pointerX,
  pointerY,
  rawDeltaTime,
  rawTime,
  setGameTimeScale,
  sleepGame,
} from "./system";
import {
  CharItem,
  createSlotInstance,
  getCharItemMaxLevel,
  getCharItemPassive,
  StatKey,
  WeaponStatKey,
  type SlotInstance,
} from "./upgrade_types";
import { easeQuadOut, lerp, reach, shuffle } from "./utils";
import { random, round, sin } from "./math";
import { setScreenDimming } from "./screen_dimming";
import { shakeCamera } from "./camera";
import { drawChest } from "./draw";
import { cat1 } from "./entities";
import { startMusic, stopMusic } from "./music";
import {
  generateLevelUpParticles,
  resetLevelUpParticles,
} from "./levelup_particles";
import { TEXT_WEAPON_STAT, TEXT_DESC, TEXT_ICON, TEXT_NAME } from "./strings";
import { CSS_WHITE } from "./colors";

let rolledUpgrades: CharItem[] = [0, 1, 2];
let cardPush: number[] = [0, 0, 0];
let nextLevelUpEvent: number = 0;
let levelUpEvents: number[] = [];
export let levelUpOpen = 0;
let newItem = 0;
export let levelUpActive = 0;
let levelUpPaused = 0;
let levelUpPausedTime = 0;
let newItemSpinTime = 0;

const newWeaponUpgrade = (
  key: WeaponStatKey,
  value: number,
  _v: number[] = []
): number[] => {
  _v[key] = value;
  return _v;
};

const getWeaponUpgradeStats = (type: CharItem, level: number): number[] => {
  const idx = type - 12;
  if (idx >= 0) {
    return weaponUpgrades[idx][level];
  }
  return [];
};

//[projectiles, Damage, BulletSpeed, DamageArea, FireSpeed, BurstSpeed];
const weaponUpgrades: number[][][] = [
  // VoidBeam = 12,
  [
    [1, 5, 10, 10, 50, 2],
    newWeaponUpgrade(WeaponStatKey.Projectile, 1),
    newWeaponUpgrade(WeaponStatKey.FireRate, 25),
    newWeaponUpgrade(WeaponStatKey.Projectile, 1),
    newWeaponUpgrade(WeaponStatKey.Damage, 10),
  ],
  // FireWand = 13,
  [
    [3, 5, 10, 10, 50, 4],
    newWeaponUpgrade(WeaponStatKey.Projectile, 1),
    newWeaponUpgrade(WeaponStatKey.Damage, 5),
    newWeaponUpgrade(WeaponStatKey.Projectile, 1),
    newWeaponUpgrade(WeaponStatKey.FireRate, 20),
  ],
  //Axe = 14,
  [
    [1, 1, 10, 10, 50, 4],
    newWeaponUpgrade(WeaponStatKey.Projectile, 1),
    newWeaponUpgrade(WeaponStatKey.Projectile, 1),
    newWeaponUpgrade(WeaponStatKey.Damage, 5),
    newWeaponUpgrade(WeaponStatKey.FireRate, 20),
  ],
  // Knife = 15,
  [
    [3, 1, 10, 10, 50, 4],
    newWeaponUpgrade(WeaponStatKey.Projectile, 1),
    newWeaponUpgrade(WeaponStatKey.Damage, 5),
    newWeaponUpgrade(WeaponStatKey.Projectile, 1),
    newWeaponUpgrade(WeaponStatKey.FireRate, 30),
  ],
  // Whip = 16,
  [
    [1, 5, 10, 10, 50, 4],
    newWeaponUpgrade(WeaponStatKey.Projectile, 1),
    newWeaponUpgrade(WeaponStatKey.Damage, 5),
    newWeaponUpgrade(WeaponStatKey.DamageRadius, 1),
    newWeaponUpgrade(WeaponStatKey.FireRate, 50),
  ],
  // Cross = 17,
  [
    [1, 1, 10, 10, 50, 4],
    newWeaponUpgrade(WeaponStatKey.Projectile, 1),
    newWeaponUpgrade(WeaponStatKey.Damage, 4),
    newWeaponUpgrade(WeaponStatKey.Projectile, 1),
    newWeaponUpgrade(WeaponStatKey.FireRate, 20),
  ],
  // Garlic = 18,
  [
    [1, 3, 10, 10, 250, 4],
    newWeaponUpgrade(WeaponStatKey.DamageRadius, 2),
    newWeaponUpgrade(WeaponStatKey.FireRate, 50),
    newWeaponUpgrade(WeaponStatKey.Damage, 5),
    newWeaponUpgrade(WeaponStatKey.DamageRadius, 2),
  ],
  // Sawblades = 19,
  [
    [1, 5, 5, 10, 25, 4],
    newWeaponUpgrade(WeaponStatKey.Projectile, 1),
    newWeaponUpgrade(WeaponStatKey.Damage, 5),
    newWeaponUpgrade(WeaponStatKey.Projectile, 1),
    newWeaponUpgrade(WeaponStatKey.FireRate, 30),
  ],
  // Lightning = 20,
  [
    [1, 5, 10, 10, 50, 4],
    newWeaponUpgrade(WeaponStatKey.Projectile, 1),
    newWeaponUpgrade(WeaponStatKey.Damage, 5),
    newWeaponUpgrade(WeaponStatKey.Projectile, 1),
    newWeaponUpgrade(WeaponStatKey.FireRate, 50),
  ],
  // SantaWater = 21,
  [
    [2, 3, 10, 10, 200, 4],
    newWeaponUpgrade(WeaponStatKey.DamageRadius, 5),
    newWeaponUpgrade(WeaponStatKey.Damage, 3),
    newWeaponUpgrade(WeaponStatKey.FireRate, 30),
    newWeaponUpgrade(WeaponStatKey.Damage, 3),
  ],
  // Claws = 22,
  [
    [1, 5, 10, 10, 100, 4],
    newWeaponUpgrade(WeaponStatKey.FireRate, 20),
    newWeaponUpgrade(WeaponStatKey.Damage, 2),
    newWeaponUpgrade(WeaponStatKey.FireRate, 20),
    newWeaponUpgrade(WeaponStatKey.Damage, 2),
  ],
];

const applySlotStats = (
  slot: SlotInstance,
  _upgrade = getWeaponUpgradeStats(slot.type, slot.level)
) => {
  for (let i = 0; i < _upgrade.length; ++i) {
    slot.stats[i] += _upgrade[i] ?? 0;
  }
};

const passiveEffectParams: [number, number][] = [
  // Might = 0,
  [StatKey.Damage, 2],
  // Armor = 1,
  [StatKey.Armor, 1],
  // Candle = 2,
  [StatKey.DamageRadius, 1],
  // Bracer = 3,
  [StatKey.BulletSpeed, 1],
  // EmptyTome = 4,
  [StatKey.FireRate, 8],
  // Duplicator = 5,
  [StatKey.Projectile, 1],
  // Wings = 6,
  [StatKey.MoveSpeed, 5],
  // Clover = 7,
  [StatKey.Luck, 4],
  // Hp = 8,
  [StatKey.Hp, 10],
  // Regen = 9,
  [StatKey.Regen, 1],
  // Magnet = 10,
  [StatKey.MagnetRadius, 10],
  // Education = 11,
  [StatKey.Xp, 1],
];

const getEffectText = (
  type: number,
  level: number,
  upgrade = getWeaponUpgradeStats(type, level)
) => {
  if (upgrade?.length && level > 0) {
    for (let i = 0; i < upgrade.length; ++i) {
      const value = upgrade[i];
      if (value != null) {
        return TEXT_WEAPON_STAT[i];
      }
    }
  }
  return TEXT_DESC[type];
};

const applyItem = (
  slot: SlotInstance,
  _params: [number, number] | undefined = passiveEffectParams[slot.type]
) => _params && addStat(..._params);

const drawStatsChange = (
  type: number,
  level: number,
  passiveEffect = passiveEffectParams[type],
  upgrade = getWeaponUpgradeStats(type, level)
) => {
  let baseValue: any;
  let delta: any;
  if (upgrade?.length && level > 0) {
    for (let i = 0; i < upgrade.length; ++i) {
      const value = upgrade[i];
      if (value != null) {
        baseValue = getWeaponStat(getSlotWithItem(type)!, i);
        delta = value;
        break;
      }
    }
  }
  if (passiveEffect) {
    baseValue = getStat(passiveEffect[0]);
    delta = passiveEffect[1];
  }
  if (delta) {
    drawText(-10, 60, baseValue, "#ccc", 8, 2);
    drawText(-2, 60, "→", CSS_WHITE, 10);
    drawText(6, 60, baseValue + delta, "#3f3", 10, 0);
  }
};

const upgradeCard = (
  x: number,
  y: number,
  index: number,
  upgrade: number,
  scale: number,
  enabled: number,
  hotkey = "Digit" + (index + 1)
) => {
  if (upgrade == null) return;
  const w = 90;
  const h = 150;
  const tx = (gameWidth - w) / 2 + x;
  const ty = (gameHeight - h) / 2 + y;
  const slot = getSlotWithItem(upgrade);
  const over =
    enabled &&
    ((pointerX >= tx &&
      pointerY >= ty &&
      pointerX <= tx + w &&
      pointerY <= ty + h) ||
      keyboardIsDown[hotkey] | 0);

  //   const over =
  // enabled &&
  // ((pointerX >= tx &&
  //   pointerY >= ty &&
  //   pointerX <= tx + w &&
  //   pointerY <= ty + h) ||
  //   keyboardIsDown["Digit" + (index + 1)]);

  ctx.fillStyle = over ? "gray" : "#444";
  ctx.save();
  ctx.translate(
    x,
    y +
      (gameHeight / 2) * (1 - levelUpOpen) ** 3 +
      2 * sin(index - rawTime * 8) -
      (+over - cardPush[index]) * 4
  );
  ctx.rotate(0.03 * (index - 1));
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.fillStyle = getCharItemPassive(upgrade) ? "#446" : "#644";
  ctx.strokeStyle = over ? CSS_WHITE : "#222";
  ctx.roundRect(-w / 2, -h / 2, w, h, 5);
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.stroke();

  const nextLevel = slot ? slot.level + 1 : 0;
  const nextLvl = nextLevel + levelUpActive;
  drawText(
    0,
    -h / 2 + 30,
    nextLevel ? "LVL " + nextLvl : "New!",
    nextLevel ? CSS_WHITE : "#FF0",
    10
  );
  drawText(0, -h / 2 + 15, TEXT_NAME[upgrade], CSS_WHITE, 10);
  drawIcon(0, 0, TEXT_ICON[upgrade], 40 + sin(rawTime * 8));
  drawText(0, 48, getEffectText(upgrade, nextLevel), CSS_WHITE, 8);
  drawStatsChange(upgrade, nextLevel);

  if (enabled) {
    drawText(0, h / 2, "PRESS [" + (index + 1) + "]", "#999", 6);
  }
  if (levelUpActive && levelUpOpen >= 1) {
    if (over && pointerDown) {
      cardPush[index] = 1;
    } else if (!pointerDown) {
      if (over && cardPush[index]) {
        pickCharItem(upgrade);
        pickLevelUp();
      } else {
        cardPush[index] = 0;
      }
    }
    if (keyboardUp[hotkey] && levelUpOpen >= 1) {
      pickCharItem(upgrade);
      pickLevelUp();
    }
  }

  ctx.restore();
};

export const openPauseScreen = () => {
  if (!levelUpActive) {
    setScreenDimming(1);
    setGameTimeScale(0);
    levelUpPausedTime = levelUpPaused = 1;
    stopMusic();
  }
};

const pickLevelUp = () => {
  levelUpActive = 0;
  playSound(Snd.LevelUp1);
  cardPush.fill(0);
  if (levelUpEvents.length && openLevelUp(levelUpEvents.shift()!)) {
    levelUpOpen = 0;
  } else {
    levelUpPaused = 1;
  }
};

const checkUpgradeIsFine = (charItem: CharItem): boolean => {
  const slot = getSlotWithItem(charItem);
  if (slot) {
    return slot.level < getCharItemMaxLevel(charItem);
  }
  if (getCharItemPassive(charItem)) {
    return getWeaponOrPassiveCount(1) < getStat(StatKey.PassiveSlots);
  }
  return getWeaponOrPassiveCount(0) < getStat(StatKey.WeaponSlots);
};

export const openLevelUpDelayed = (newItemType: number) =>
  levelUpEvents.push(newItemType);

export const openLevelUp = (newItemType: number): number | void => {
  if (!levelUpPaused && !levelUpActive) {
    resetLevelUpParticles();
    cardPush.fill(0);
    rolledUpgrades = [];
    for (let x = 0; x < 23; ++x) {
      if (checkUpgradeIsFine(x)) {
        rolledUpgrades.push(x);
      }
    }
    if (rolledUpgrades.length > 0) {
      stopMusic();
      if (level === 1) {
        rolledUpgrades = rolledUpgrades.filter((x) => !getCharItemPassive(x));
      }
      shuffle(rolledUpgrades);
      levelUpActive = 1;
      newItemSpinTime = 0;
      setGameTimeScale(0);
      newItem = newItemType;
      if (newItemType) {
        playMusicMoment2();
        for (let i = 0; i < rolledUpgrades.length; ) {
          const type = rolledUpgrades[i];
          if (!getSlotWithItem(type)) {
            rolledUpgrades.splice(0, 1);
            rolledUpgrades.push(type);
          } else {
            break;
          }
        }
      } else {
        playMusicMoment();
      }
      playSound(Snd.LevelUp2);
      setScreenDimming(1);
      shakeCamera(0);
      return 1;
    } else {
      sleepGame(1);
      playSound(Snd.LevelUp1);
      const item = (random() * passiveEffectParams.length) | 0;
      addTextParticle(cat1.x0, cat1.y0, TEXT_DESC[item] + " +1", "#FF0", 1, 1);
      addStat(passiveEffectParams[item][0], 1);
    }
  }
};

export const levelUpDebug = (newItemType: number) => {
  rolledUpgrades.length = 0;
  for (let x = 0; x < 23; ++x) {
    if (checkUpgradeIsFine(x)) {
      rolledUpgrades.push(x);
    }
  }
  if (!newItemType) {
    addLevelDebug();
  }
  if (level === 1) {
    rolledUpgrades = rolledUpgrades.filter((x) => !getCharItemPassive(x));
  }
  shuffle(rolledUpgrades);
  if (newItemType) {
    for (let i = 0; i < rolledUpgrades.length; ) {
      const type = rolledUpgrades[i];
      if (!getSlotWithItem(type)) {
        rolledUpgrades.splice(0, 1);
        rolledUpgrades.push(type);
      } else {
        break;
      }
    }
  }
  pickCharItem(rolledUpgrades[0]);
};

export const resetLevelUps = () => {
  levelUpEvents = [];
  nextLevelUpEvent = 0;
};

export const levelUpScreen = (): void => {
  if (levelUpEvents.length && !levelUpPaused && !levelUpActive) {
    nextLevelUpEvent += dt;
    if (nextLevelUpEvent > 0.5) {
      nextLevelUpEvent = 0;
      openLevelUp(levelUpEvents.shift()!);
    }
  }

  levelUpOpen = reach(levelUpOpen, levelUpActive, rawDeltaTime * 4);
  levelUpPausedTime = reach(levelUpPausedTime, levelUpPaused, rawDeltaTime * 4);
  newItemSpinTime = reach(newItemSpinTime, 1, rawDeltaTime / 7);
  if (levelUpPaused && isAnyKeyDown()) {
    levelUpPaused = 0;
    setGameTimeScale(1);
    setScreenDimming(0);
    startMusic();
  }
  ctx.save();
  ctx.translate(gameWidth / 2, gameHeight / 2);
  if (levelUpPausedTime > 0) {
    const s = ((1 - levelUpOpen) * levelUpPausedTime) ** 2;
    drawText(0, -70, "GET READY", CSS_WHITE, (20 + 2 * sin(rawTime * 8)) * s);
    drawText(0, 70, "TAP TO CONTINUE", CSS_WHITE, (13 + sin(rawTime * 4)) * s);
  }
  if (levelUpOpen > 0) {
    drawText(
      0,
      -100 - (gameHeight / 2) * (1 - levelUpOpen) ** 3,
      newItem ? "REWARDS!" : "NEW LEVEL!",
      "#ff0",
      20 + 2 * sin(rawTime * 8)
    );
    if (newItem) {
      generateLevelUpParticles(lerp(1, 0, newItemSpinTime ** 5));
      const r = 200 * (1 - (1 - (1 - newItemSpinTime) ** 5));
      const i = round(r);
      const rr = 1 - (1 - newItemSpinTime) ** 2;
      upgradeCard(0, 0, 0, rolledUpgrades[i % rolledUpgrades.length], rr, 0);
      if (newItem - 1) {
        upgradeCard(
          -110,
          0,
          0,
          rolledUpgrades[(i + 1) % rolledUpgrades.length],
          rr,
          0
        );

        upgradeCard(
          110,
          0,
          0,
          rolledUpgrades[(i + 2) % rolledUpgrades.length],
          rr,
          0
        );
      }

      ctx.save();
      ctx.translate(0, 120);
      ctx.scale(5, 5);
      drawChest(rawTime * 4 + easeQuadOut(newItemSpinTime) * 100);
      ctx.restore();

      if (r < 0.2) {
        drawText(0, 100, "TAP TO COLLECT", "#0F0", 13 + sin(rawTime * 4));
        if (isAnyKeyDown()) {
          pickCharItem(rolledUpgrades[i % rolledUpgrades.length]);
          if (newItem - 1) {
            pickCharItem(rolledUpgrades[(i + 1) % rolledUpgrades.length]);
            pickCharItem(rolledUpgrades[(i + 2) % rolledUpgrades.length]);
          }
          pickLevelUp();
        }
      }
    } else {
      generateLevelUpParticles(0);
      upgradeCard(-110, 0, 0, rolledUpgrades[0], 1, 1);
      upgradeCard(0, 0, 1, rolledUpgrades[1], 1, 1);
      upgradeCard(110, 0, 2, rolledUpgrades[2], 1, 1);
      drawText(
        0,
        110 + (gameHeight / 2) * (1 - levelUpOpen) ** 3,
        "CHOOSE AN UPGRADE",
        "#699",
        13 + sin(rawTime * 4)
      );
    }
  }
  ctx.restore();
};

export const pickCharItem = (charItem?: CharItem) => {
  if (charItem != null) {
    let s = getSlotWithItem(charItem);
    if (s) {
      ++s.level;
    } else {
      s = createSlotInstance(charItem);
      slots.push(s);
    }
    applySlotStats(s);
    applyItem(s);
    cat1.deco |= 1 << charItem;
    ++cat1.len;
  }
};

export const addCatXp = (count: number) => {
  if (addXp(count)) {
    openLevelUpDelayed(0);
  }
};
