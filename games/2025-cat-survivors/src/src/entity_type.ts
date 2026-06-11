export const enum DropItem {
  Xp = 0,
  Hp = 1,
  Magnet = 2,
  Bomb = 3,
  Chest = 4,
}

export interface EntityBase {
  type: EntityType;
  x: number;
  y: number;
  vy: number;
  vx: number;
  shadowSize: number;
  radius: number;
  collisionLayer: number;
}

export interface Drop extends EntityBase {
  item: DropItem;
  type: EntityType.Drop;
  count: number;
  captured: number;
  anim0: number;
  color: number;
  captureTime: number;
}

export const enum EntityType {
  Player = 0,
  Enemy = 1,
  Drop = 2,
  Projectile = 3,
}

export const enum EnemyType {
  Frog = 0,
  Snowman = 1,
  Mice = 2,
  Fly = 3,
  Snake = 4,
  Box = 5,
}

export interface Entity extends EntityBase {
  hp: number;
  hpMax: number;
  hit: number;
  deadTime: number;
}

export interface Cat extends Entity {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  hitRadius: number;
  wobble: number;
  color: number;
  moveSpeed: number;
  moveDirection: number;
  deco: number;
  len: number;
}

export interface Enemy extends Entity {
  moveTime: number;
  attackTimer: number;
  damage: number;
  dropXp: number;
  maxVelocity: number;
  enemyType: EnemyType;
  deadTimeMax: number;
  distanceToPlayer: number;
  variation: number;
  kickBack: number;
  color: number;
  color2: number;
  stroke: number;
}

export interface ProjectileFollowCat {
  radius: number;
  angle: number;
  rotation: number;
}

export interface Projectile extends EntityBase {
  type: EntityType.Projectile;
  damageRadius: number;
  damage: number;
  damageCount: number;
  damageRepeat: number;
  timeMax: number;
  time: number;
  timer: number;
  period: number;
  visible: number;
  gfx: number;
  followCat?: ProjectileFollowCat;
  kickForce?: number;
}
