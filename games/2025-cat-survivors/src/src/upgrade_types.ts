export const enum StatKey {
  // weapons
  Projectile = 0,
  Damage = 1,
  BulletSpeed = 2,
  DamageRadius = 3,
  FireRate = 4,
  BurstSpeed = 5,
  // char
  Hp = 6,
  Regen = 7,
  MoveSpeed = 8,
  MagnetRadius = 9,
  Xp = 10,
  Luck = 11,
  Armor = 12,
  WeaponSlots = 13,
  PassiveSlots = 14,
}

export const enum WeaponStatKey {
  Projectile = 0,
  Damage = 1,
  BulletSpeed = 2,
  DamageRadius = 3,
  FireRate = 4,
  BurstSpeed = 5,
}

export const enum CharItem {
  // passives
  Might = 0,
  Armor = 1,
  Candle = 2,
  Bracer = 3,
  EmptyTome = 4,
  Duplicator = 5,
  Wings = 6,
  Clover = 7,
  Hp = 8,
  Regen = 9,
  Magnet = 10,
  Education = 11,

  // weapons
  MilkGun = 12,
  Flames = 13,
  Axe = 14,
  Knife = 15,
  TailKick = 16,
  Boomerang = 17,
  Furricane = 18,
  Sawblades = 19,
  Lightning = 20,
  SantaWater = 21,
  Claws = 22,

  // Super
  BloodyTear = 23,
  HolyWand = 24,
  ThousandEdge = 25,
  DeathSpiral = 26,
  HeavenSword = 27,
  Hellfire = 28,
  ThunderLoop = 29,
}
/* авто-таргет ближайшего врага */
/* мощный снаряд в случайного врага */
/* бросает топор по дуге, пробивает врагов */
/* метает ножи прямо вперёд */
/* удар в сторону, потом в обе */
/* летит вперёд и возвращается как бумеранг */
/* аура вокруг игрока */
/* книги вращаются вокруг игрока */
/* случайные удары молний */
/* бросает фляги, лужи урона */

// const passives: Passive[] = [
//   {
//     id: "might",
//     name: " Might",
//     maxLevel: 5,
//     level: 0,
//     bonus: { damage: 0.1 },
//   },
//   {
//     id: "armor",
//     name: " Armor",
//     maxLevel: 5,
//     level: 0,
//     bonus: {
//       /* защита */
//     },
//   },
//   {
//     id: "candle",
//     name: " Candle",
//     maxLevel: 5,
//     level: 0,
//     bonus: { area: 0.1 },
//   },
//   {
//     id: "bracer",
//     name: " Bracer",
//     maxLevel: 5,
//     level: 0,
//     bonus: { speed: 0.1 },
//   },
//   {
//     id: "emptyTome",
//     name: " Empty Tome",
//     maxLevel: 5,
//     level: 0,
//     bonus: { cooldownReduction: 0.08 },
//   },
//   {
//     id: "duplicator",
//     name: " Duplicator",
//     maxLevel: 2,
//     level: 0,
//     bonus: { extraProjectiles: 1 },
//   },
//   {
//     id: "wings",
//     name: " Wings",
//     maxLevel: 5,
//     level: 0,
//     bonus: {
//       /* скорость игрока */
//     },
//   },
//   {
//     id: "clover",
//     name: " Clover",
//     maxLevel: 5,
//     level: 0,
//     bonus: {
//       /* удача */
//     },
//   },
//   {
//     id: "hollowHeart",
//     name: " Hollow Heart",
//     maxLevel: 5,
//     level: 0,
//     bonus: {
//       /* max HP */
//     },
//   },
//   {
//     id: "pummarola",
//     name: " Pummarola",
//     maxLevel: 5,
//     level: 0,
//     bonus: {
//       /* реген HP */
//     },
//   },
// ];

const evolutions: Evolution[] = [
  {
    base: CharItem.TailKick,
    passive: CharItem.Hp,
    result: CharItem.BloodyTear,
  },
  {
    base: CharItem.MilkGun,
    passive: CharItem.EmptyTome,
    result: CharItem.HolyWand,
  },
  {
    base: CharItem.Knife,
    passive: CharItem.Bracer,
    result: CharItem.ThousandEdge,
  },
  {
    base: CharItem.Axe,
    passive: CharItem.Candle,
    result: CharItem.DeathSpiral,
  },
  {
    base: CharItem.Boomerang,
    passive: CharItem.Clover,
    result: CharItem.HeavenSword,
  },
  //   { base: Weapon.Bible, passive: Passive.SpellBinder, result: "🔮 Unholy Vespers" }, // если добавишь Spellbinder
  {
    base: CharItem.Flames,
    passive: CharItem.Might,
    result: CharItem.Hellfire,
  },
  {
    base: CharItem.Lightning,
    passive: CharItem.Duplicator,
    result: CharItem.ThunderLoop,
  },
  //   { base: Weapon.Garlic, passive: Passive.Pummarola, result: "🕯 Soul Eater" },
  //   { base: Weapon.SantaWater, passive: Passive.Attractorb, result: "🌊 La Borra" }, // если добавишь Attractorb
];

export interface SlotInstance {
  type: CharItem;
  level: number;
  stats: WeaponStatKey[];
  attackTimer: number;
  burstTimer: number;
  burstClip: number;
  animation: number;
}

export const createSlotInstance = (id: CharItem): SlotInstance => ({
  type: id,
  level: 0,
  stats: [0, 0, 0, 0, 0, 0],
  attackTimer: 0,
  burstTimer: 0,
  burstClip: 0,
  animation: 0,
});

export interface Evolution {
  base: CharItem;
  passive: CharItem;
  result: CharItem;
}

export const getCharItemPassive = (x: CharItem): number => +(x < 12);
export const getCharItemMaxLevel = (x: CharItem): number =>
  x === CharItem.Duplicator ? 1 : 4;
