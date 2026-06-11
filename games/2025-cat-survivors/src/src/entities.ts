import type { Cat, Drop, Enemy, EntityBase, Projectile } from "./entity_type";
import type { Particle, TextParticle } from "./particle_types";

export let groundParticles: Particle[];
export let overlayParticles: Particle[];
export let weatherParticles: Particle[];
export let textParticles: TextParticle[];
export let drops: Drop[];
export let enemies: Enemy[];
export let projectiles: Projectile[];
export let cat1: Cat;
export let cat2: Cat;

export const initEntityArrays = () => {
  groundParticles = [];
  overlayParticles = [];
  weatherParticles = [];
  textParticles = [];
  drops = [];
  enemies = [];
  projectiles = [];

  cat1 = {
    type: 0,
    hp: 100,
    hpMax: 100,
    x: -5,
    y: 0,
    x0: 0,
    y0: 0,
    x1: -10,
    y1: 0,
    x2: -10 - 10,
    y2: 0,
    x3: -10 - 10 - 20,
    y3: 0,
    hit: 0,
    shadowSize: 1.2,
    radius: 10,
    hitRadius: 10,
    wobble: 0,
    vx: 0,
    vy: 0,
    deadTime: 0,
    color: 0,
    moveSpeed: 0,
    moveDirection: 0,
    len: 0,
    deco: 0,
    collisionLayer: 0,
  };
  cat2 = { ...cat1, color: 0xffeeff, x: 20, y: 20, x1: 10 };
};

// temp arrays
export let nearestEnemies: Enemy[];
export let objectsToDraw: EntityBase[];

export const initTempArrays = () => {
  nearestEnemies = [];
  objectsToDraw = [cat1];
  // objectsToDraw = [cat, cat2];
};
