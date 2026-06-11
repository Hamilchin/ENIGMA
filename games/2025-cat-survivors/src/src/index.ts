import {
  addTextParticle,
  drawIcon,
  drawText,
  drawTextParticles,
} from "./bubble";
import {
  beginCamera,
  shakeCamera,
  testVisible,
  visibleX0,
  visibleX1,
  visibleY0,
  visibleY1,
} from "./camera";
import {
  bwColor,
  calcBaseColor,
  color_debug_red,
  ColorId,
  COLORS,
  CSS_BLACK,
  CSS_WHITE,
} from "./colors";
import { DEBUG_RADIUS, TEST_LAST_MINUTE, WORLD_SCALE_Y } from "./const";
import { fillCircle, fillWorldCircle } from "./draw";
import { addDropItem, drawDrop } from "./drops";
import {
  EnemyType,
  EntityType,
  type Cat,
  type Enemy,
  type Entity,
  DropItem,
  type Projectile,
  type EntityBase,
} from "./entity_type";
import { drawGround } from "./ground";
import { updateAndDrawParticles } from "./particles";
import { playSound, resetSounds, Snd } from "./sounds";
import {
  addFrag,
  addPlayTime,
  frags,
  getNextLevelXp,
  getSlotWithItem,
  getStat,
  getWeaponStat,
  level,
  playTime,
  resetStats,
  slots,
  xp,
  XP_MOD,
} from "./stats";
import {
  beginFrame,
  ctx,
  dt,
  endFrame,
  gameHeight,
  gameWidth,
  initSystem,
  isAnyKeyDown,
  keyboardDown,
  keyboardIsDown,
  pointerIsDown,
  rawDeltaTime,
  rawTime,
  sleepGame,
  time,
} from "./system";
import {
  addCatXp,
  levelUpActive,
  levelUpDebug,
  levelUpOpen,
  levelUpScreen,
  openLevelUp,
  openLevelUpDelayed,
  openPauseScreen,
  pickCharItem,
  resetLevelUps,
} from "./upgrade";
import { CharItem, getCharItemPassive, StatKey } from "./upgrade_types";
import {
  abs,
  atan2,
  cos,
  exp,
  hypot,
  max,
  min,
  PI,
  random,
  sign,
  sin,
  TAU,
} from "./math";
import {
  chance,
  clamp,
  css_rgba,
  easeQuadOut,
  formatMMSS,
  lerp,
  lerp_rgb,
  pickRandom,
  reach,
} from "./utils";
import { drawVPad, updateVPad, vpadDirX, vpadDirY } from "./vpad";
import {
  cat1 as cat1,
  cat2,
  drops,
  enemies,
  groundParticles,
  initEntityArrays,
  initTempArrays,
  nearestEnemies,
  objectsToDraw,
  overlayParticles,
  projectiles,
  weatherParticles,
} from "./entities";
import { ParticleType } from "./particle_types";
import { initMusic, setMusicProgress, startMusic, stopMusic } from "./music";
import { drawScreenDimming, setScreenDimming } from "./screen_dimming";
import { doLevelUpParticles } from "./levelup_particles";
import { updateWeatherColors, updateWeatherParticles } from "./weather";
import { TEXT_ICON } from "./strings";
import { initZZFX } from "./zzfx";
import { drawDebugStats } from "./debug";

const doPause = () =>
  !mainMenuActive && !winActive && cat1.hp && openPauseScreen();

const initMain = () => {
  initZZFX();
  initSystem();
  initMusic();
  resetLevel();
  onblur = doPause;
  requestAnimationFrame(update);
};

let mainMenuActive = 1;
let mainMenuTime = 0;
let mainMenuIntroTime = 0;
let winTime = 0;
let winActive = 0;
let winTargetReached: number;
let winTargetX: number;
let winTargetY: number;
let winParticles = 0;

const describeBaseEnemy = (
  enemyType: EnemyType,
  hpMax: number,
  attrs: Partial<Enemy>
) => ({
  enemyType,
  hpMax,
  damage: 5,
  radius: 5,
  ...attrs,
});

const describeBossBig = (base: Partial<Enemy>): Enemy =>
  ({
    ...base,
    hpMax: base.hpMax! * 10,
    radius: base.radius! * 2,
    damage: base.damage! * 5,
    dropXp: -1,
  } as Enemy);

const addEnemyObject = (
  x: number,
  y: number,
  attrs: Partial<Enemy>,
  _hp = (attrs.hpMax! * (1 + level / 5)) | 0
) =>
  enemies.push({
    type: EntityType.Enemy,
    x,
    y,
    moveTime: 10 * random(),
    shadowSize: 1,
    hit: 0,
    attackTimer: 0,
    vx: 0,
    vy: 0,
    dropXp: (1 + playTime / 200) | 0,
    deadTime: 0,
    deadTimeMax: 0.5,
    distanceToPlayer: 100,
    color: 0x777777,
    variation: (random() * 3) | 0,
    kickBack: 0,
    stroke: 0,
    collisionLayer: 0,
    ...attrs,
    hpMax: _hp,
    hp: _hp,
    maxVelocity:
      (attrs.enemyType! === EnemyType.Frog ||
      attrs.enemyType! === EnemyType.Snowman
        ? 2
        : 1) *
      attrs.maxVelocity! *
      (1 + level / 100),
  } as Enemy);

const spawnEnemyOutside = (
  enemy: Partial<Enemy>,
  dist = 1,
  a = random() * TAU,
  d = dist *
    (hypot(visibleX1 - visibleX0, visibleY1 - visibleY0) / 2 + enemy.radius!)
) =>
  addEnemyObject(
    cat1.x0 + d * cos(a) + random(),
    cat1.y0 + (d * sin(a)) / WORLD_SCALE_Y + random(),
    enemy as Enemy
  );

const resetLevel = () => {
  winActive = 0;
  winTime = 0;
  mainMenuActive = 1;
  mainMenuIntroTime = 0;
  mainMenuTime = 0;
  initEntityArrays();
  resetStats();
  resetLevelUps();
  activeGenerators = [];
  levelEvents = [];
};

const startLevel = () => {
  startMusic();
  mainMenuActive = 0;
  // spawnEnemy(cat.x + 100, cat.y + 100, 1);
  for (let i = 0; i < 20; ++i) {
    const a = random() * TAU;
    const d = 50 + 100 * random();
    addDropItem(cat1.x0 + d * cos(a), cat1.y0 + d * sin(a), DropItem.Xp, 1);
  }
  pickCharItem(CharItem.MilkGun);

  {
    const frog = describeBaseEnemy(EnemyType.Frog, 5, {
      maxVelocity: 15,
      deadTimeMax: 3,
      color: 0x0c663f,
    });
    const frog2 = describeBaseEnemy(EnemyType.Frog, 30, {
      maxVelocity: 20,
      deadTimeMax: 3,
      color: 0x446633,
      radius: 8,
    });
    const snowman = describeBaseEnemy(EnemyType.Snowman, 20, {
      maxVelocity: 20,
      deadTimeMax: 3,
      color: COLORS[ColorId.White],
    });
    const snowmanYellow = describeBaseEnemy(EnemyType.Snowman, 30, {
      maxVelocity: 40,
      deadTimeMax: 3,
      radius: 3,
      damage: 10,
      color: 0xffffcc,
      color2: 0xff0000,
      stroke: 1,
    });
    const miceSmall = describeBaseEnemy(EnemyType.Mice, 5, {
      maxVelocity: 30,
      deadTimeMax: 3,
      radius: 3,
      color: 0xffeedd,
    });
    const mice = describeBaseEnemy(EnemyType.Mice, 10, {
      maxVelocity: 20,
      deadTimeMax: 3,
      radius: 5,
      color: 0x666655,
    });
    const fly = describeBaseEnemy(EnemyType.Fly, 5, {
      maxVelocity: 25,
      color: 0xcc99cc,
      color2: 0,
      collisionLayer: 1,
    });
    const fly_slow = describeBaseEnemy(EnemyType.Fly, 5, {
      maxVelocity: 15,
      color: 0xaaaa99,
      color2: 0x330000,
      radius: 7,
      collisionLayer: 1,
    });
    const flyBlack = describeBaseEnemy(EnemyType.Fly, 10, {
      maxVelocity: 25,
      radius: 4,
      color: 0x333333,
      color2: 0x999988,
      collisionLayer: 1,
    });
    const snakeYellow = describeBaseEnemy(EnemyType.Snake, 20, {
      maxVelocity: 30,
      radius: 7,
      color: 0,
      color2: 0xffff00,
    });
    const snake = describeBaseEnemy(EnemyType.Snake, 5, {
      maxVelocity: 40,
      radius: 5,
      color: 0,
      color2: 0,
    });
    const box = describeBaseEnemy(EnemyType.Box, 5, {
      maxVelocity: 0,
      damage: 0,
      deadTimeMax: 0.01,
      color: 0xccaa66,
    });

    const boss_frog = describeBossBig(frog);
    const boss_fly = describeBossBig(fly);
    const boss_snowman = describeBossBig(snowman);
    const boss_snake = describeBossBig({ ...snakeYellow, color: 0xff0000 });
    const frog_naked = { ...frog, variation: 0 };

    // первая коробка x2
    spawnEnemyOutside(box, 0, random() * TAU, 100);
    spawnEnemyOutside(box, 0, random() * TAU, 100);

    levelEvents = [
      // все коробки в игре каждые 20 секунд
      {
        time: 0,
        spawnTime: 60 * 10,
        spawnCount: (60 * 10) / 20,
        enemies: [box],
      },
      // 0
      {
        time: 0,
        spawnTime: 60,
        spawnCount: 60,
        enemies: [fly_slow],
      },
      // 1 - босс
      {
        time: 60,
        enemies: [boss_fly],
      },
      {
        time: 60,
        spawnTime: 60,
        enemies: [flyBlack, fly_slow, frog_naked],
        spawnCount: 60,
      },
      // 2 - толпы слабых
      {
        time: 2 * 60,
        enemies: [flyBlack, fly, fly_slow, fly_slow, fly_slow],
        spawnTime: 60,
        spawnCount: 120,
      },
      // 3 - босс маленькая муха
      {
        time: 3 * 60,
        enemies: [describeBossBig(flyBlack)],
      },
      // 3 - толпы жаб
      {
        time: 3 * 60,
        spawnTime: 60,
        spawnCount: 120,
        enemies: [frog],
      },
      // 4 - босс ЖАБА
      {
        time: 4 * 60,
        enemies: [boss_frog],
      },
      // 4 - змей
      {
        time: 4 * 60,
        spawnTime: 60,
        spawnCount: 120,
        enemies: [snake, snake, snake, snakeYellow],
      },

      // 5 - босс ЗМЕЯ
      {
        time: 5 * 60,
        enemies: [boss_snake],
      },
      // 5 - змеи и толстые жабы, маленькие мухи
      {
        time: 5 * 60,
        spawnTime: 60,
        spawnCount: 120,
        enemies: [flyBlack, flyBlack, snakeYellow, frog2],
      },
      // 6 - зима
      {
        time: 6 * 60,
        spawnTime: 60,
        spawnCount: 120,
        enemies: [snowman],
      },
      {
        time: 6 * 60 + 30,
        spawnTime: 30,
        spawnCount: 30,
        enemies: [snowmanYellow],
      },
      {
        time: 6 * 60 + 30,
        enemies: [boss_snowman],
      },
      // 7 - лето
      // TODO:
      {
        time: 7 * 60,
        spawnTime: 60,
        spawnCount: 200,
        enemies: [mice, miceSmall],
      },
      {
        time: 7 * 60 + 30,
        enemies: [describeBossBig(mice)],
      },
      // 8 - ночь
      // TODO:
      {
        time: 8 * 60,
        spawnTime: 60,
        spawnCount: 250,
        enemies: [snakeYellow, frog2],
      },
      {
        time: 8 * 60 + 30,
        enemies: [describeBossBig(snowmanYellow)],
      },
      // 9 - конец (всех навалить)
      {
        time: 9 * 60,
        spawnTime: 60,
        spawnCount: 300,
        enemies: [
          frog,
          frog2,
          snowman,
          snowmanYellow,
          snakeYellow,
          snake,
          fly,
          flyBlack,
          mice,
          miceSmall,
        ],
      },
      {
        time: 9 * 60,
        spawnTime: 60,
        spawnCount: 3,
        enemies: [boss_fly, boss_frog, boss_snake, boss_snowman],
      },
      // 00:00 -> 01:00
      // {
      //   time: 1,
      //   spawnTime: 1,
      //   spawnCount: 10,
      //   enemies: [fly],
      // },
      // {
      //   time: 10,
      //   spawnTime: 40,
      //   spawnCount: 30,
      //   enemies: [miceSmall, fly],
      // },
      // {
      //   time: 30,
      //   spawnTime: 30,
      //   spawnCount: 30,
      //   enemies: [frog, fly],
      // },
      // {
      //   time: 60,
      //   spawnTime: 0,
      //   spawnCount: 1,
      //   enemies: [boss_frog],
      // },
      // {
      //   time: 60,
      //   spawnTime: 1,
      //   spawnCount: 30,
      //   enemies: [frog],
      // },

      // rest of the game until win
      // {
      //   time: 60 + 30,
      //   spawnTime: 60 * 10 - 30 - 60,
      //   spawnCount: 600,
      //   enemies: [
      //     frog,
      //     frog2,
      //     snowman,
      //     snowmanYellow,
      //     snakeYellow,
      //     snake,
      //     fly,
      //     flyBlack,
      //     mice,
      //     miceSmall,
      //   ],
      // },
      // {
      //   time: 60 * 2,
      //   spawnTime: 8 * 60,
      //   spawnCount: 8,
      //   enemies: [boss_fly, boss_frog, boss_snake, boss_snowman],
      // },
    ];
  }
  if (TEST_LAST_MINUTE) {
    for (let i = 0; i < 55; ++i) {
      levelUpDebug(+(i % 4 === 0));
    }
    const startTime = 9 * 60;
    addPlayTime(startTime, 60 * 10);
    levelEvents = levelEvents.filter((ev) => ev.time < playTime);
  }
};

let activeGenerators: Generator[];
let levelEvents: LevelEvent[];

interface LevelEvent {
  time: number;
  enemies: Partial<Enemy>[];
  spawnCount?: number;
  spawnTime?: number;
  dist?: number;
}

interface Generator {
  t: number;
  period: number;
  timeAcc: number;
  enemies: Partial<Enemy>[];
}

const startGenerator = (
  enemies: Partial<Enemy>[],
  duration: number,
  count: number = 1
) =>
  activeGenerators.push({
    t: duration,
    period: duration / count,
    timeAcc: 0,
    enemies,
  });

const updateLevelProgress = () => {
  for (const ev of levelEvents) {
    if (playTime >= ev.time) {
      if (ev.spawnTime) {
        startGenerator(ev.enemies, ev.spawnTime, ev.spawnCount);
      } else {
        for (let i = 0, a = random() * TAU; i < (ev.spawnCount || 1); ++i) {
          spawnEnemyOutside(pickRandom(ev.enemies), ev.dist, a);
        }
      }
    }
  }

  activeGenerators = activeGenerators.filter((gen) => gen.t > 0);
  levelEvents = levelEvents.filter((ev) => playTime < ev.time);
  for (const gen of activeGenerators) {
    gen.t -= dt;
    let n = ((gen.timeAcc += dt) / gen.period) | 0;
    gen.timeAcc -= gen.period * n;
    while (n-- > 0) {
      spawnEnemyOutside(pickRandom(gen.enemies));
    }
  }

  if (playTime >= 60 * 10) {
    win();
  }
};

const updateHitCounter = (entity: Entity) => {
  if (entity.hit > 0) {
    entity.hit = max(0, entity.hit - rawDeltaTime * 4);
  }
};

const addCatHitParticles = (n: number) => {
  for (let i = 0; i < n; ++i) {
    const d = random() * 200;
    const a = random() * TAU;
    groundParticles.push({
      type: ParticleType.RoundSpark,
      x: cat1.radius * cos(a) + cat1.x,
      y: (cat1.radius * sin(a) + cat1.y) * WORLD_SCALE_Y,
      vx: d * cos(a),
      vy: d * sin(a) * WORLD_SCALE_Y,
      r: 0,
      va: 1,
      t: 0,
      maxTime: 0.05 + 0.5 * random(),
      color: CSS_BLACK,
      scale: 0.1 + 0.3 * random(),
      sy: 1,
      damp: 9,
    });
  }
};

const updateCatWinPath = (cat: Cat, offsetX: number) => {
  cat.moveDirection = atan2(winTargetY - cat.y0, winTargetX + offsetX - cat.x0);
  cat.moveSpeed =
    hypot(winTargetY - cat.y0, winTargetX + offsetX - cat.x0) > 1 ? 1 : 0;
  cat.vx = 20 * cos(cat.moveDirection) * cat.moveSpeed;
  cat.vy = 20 * sin(cat.moveDirection) * cat.moveSpeed;
};

const updatePlayerCat = (cat: Cat) => {
  if (cat.hp > 0) {
    // update hp
    const dhp = getStat(StatKey.Hp) - cat.hpMax;
    if (dhp > 0) {
      cat.hpMax += dhp;
      cat.hp += dhp;
    }
    cat.hp = min(cat.hpMax, cat.hp + dt * getStat(StatKey.Regen));

    if (!winActive) {
      if (mainMenuActive) {
        cat.moveDirection = (sin(time * PI) * PI) / 6 + PI / 4;
        cat.moveSpeed = 1;
      } else {
        const kdx =
          (keyboardIsDown["ArrowRight"] | keyboardIsDown["KeyD"]) -
          (keyboardIsDown["ArrowLeft"] | keyboardIsDown["KeyA"]);
        const kdy =
          (keyboardIsDown["ArrowDown"] | keyboardIsDown["KeyS"]) -
          (keyboardIsDown["ArrowUp"] | keyboardIsDown["KeyW"]);
        const isKeyboard = kdx || kdy;
        const jdx = isKeyboard ? kdx : vpadDirX;
        const jdy = isKeyboard ? kdy : vpadDirY;

        cat.moveDirection = atan2(jdy, jdx);
        cat.moveSpeed =
          pointerIsDown || isKeyboard ? min(1, hypot(jdy, jdx)) : 0;
      }
      const moveVelocity = getStat(StatKey.MoveSpeed) * cat.moveSpeed;
      cat.vx = moveVelocity * cos(cat.moveDirection);
      cat.vy = moveVelocity * sin(cat.moveDirection);
    }
  } else {
    const c = (cat.deadTime ** 2 * 8) | 0;
    cat.deadTime += dt;
    if (c != ((cat.deadTime ** 2 * 8) | 0) && c < 8) {
      cat.hit = 1;
      cat.moveDirection = random() * PI;
      cat.x1 += (random() - 0.5) * 50;
      cat.y1 += (random() - 0.5) * 50;
      playSound(Snd.Hit);
      playSound(Snd.Kick);
      playSound(Snd.Noise);
      shakeCamera(1);
      sleepGame(0.1);
      addCatHitParticles(30);
      if (c === 7) {
        const a = random() * TAU;
        cat.vx = 200 * cos(a);
        cat.vy = 200 * sin(a);
      }
    }
    cat.vx *= exp(-4 * dt);
    cat.vy *= exp(-4 * dt);
  }
};

const updateCat = (cat: Cat) => {
  updateHitCounter(cat);
  cat.wobble = reach(cat.wobble, 0, rawDeltaTime * 4);
  cat.x0 += cat.vx * dt;
  cat.y0 += cat.vy * dt;

  {
    let dx = cat.x0 - cat.x1;
    let dy = cat.y0 - cat.y1;
    const len = hypot(dx, dy);
    if (len > 0) {
      dx *= 1 / len;
      dy *= 1 / len;

      cat.x1 = cat.x0 - (8 + cat.len / 4) * dx;
      cat.y1 = cat.y0 - (8 + cat.len / 4) * dy;
    }
  }

  {
    let dx = cat.x0 - cat.x2;
    let dy = cat.y0 - cat.y2;

    const len = hypot(dx, dy);
    if (len > 0) {
      dx *= 1 / len;
      dy *= 1 / len;

      cat.x2 = cat.x1 - (10 + cat.len / 8) * dx;
      cat.y2 = cat.y1 - (10 + cat.len / 8) * dy;
    }
  }
  {
    let dx = cat.x2 - cat.x3;
    let dy = cat.y2 - cat.y3;

    const len = hypot(dx, dy);
    if (len > 0) {
      dx *= 1 / len;
      dy *= 1 / len;

      cat.x3 = cat.x2 - 10 * dx;
      cat.y3 = cat.y2 - 10 * dy;
    }
  }

  cat.x = (cat.x1 + cat.x0) / 2;
  cat.y = (cat.y1 + cat.y0) / 2;
};

const updateDropsForCat = (cat: Cat) => {
  for (let i = 0; i < drops.length; ++i) {
    const drop = drops[i];
    const dx = cat.x - drop.x;
    const dy = cat.y - drop.y;
    const l = hypot(dx, dy);
    drop.captureTime = reach(drop.captureTime, drop.captured, dt * 4);
    if (drop.captured) {
      if (cat.hp > 0) {
        if (l < cat.radius) {
          drops.splice(i--, 1);

          if (!winActive) {
            if (drop.item === DropItem.Xp) {
              addCatXp(drop.count * getStat(StatKey.Xp));
            } else if (drop.item === DropItem.Hp) {
              const dhp = 5 * level * drop.count;
              cat.hp = min(cat.hpMax, cat.hp + dhp);
              addTextParticle(cat.x, cat.y, "+" + dhp + "hp", "#9F3");
            } else if (drop.item === DropItem.Magnet) {
              for (const drop of drops) {
                drop.captured = 1;
              }
            } else if (drop.item === DropItem.Bomb) {
              for (const enemy of enemies) {
                if (
                  enemy.hp > 0 &&
                  testVisible(enemy.x, enemy.y * WORLD_SCALE_Y, 0)
                ) {
                  hitEnemy(enemy, enemy.hp);
                }
              }
              shakeCamera(4);
            } else if (drop.item === DropItem.Chest) {
              openLevelUpDelayed(1 + +chance(0.3));
            }
          }
          playSound(Snd.Collect);
          cat.wobble = 1;
          for (let i = 0; i < 10; ++i) {
            const a = random() * TAU;
            const d = random() ** 0.5 * 100;
            overlayParticles.push({
              type: ParticleType.Smoke,
              x: drop.x,
              y: drop.y * WORLD_SCALE_Y - 6,
              vx: cat.vx + d * cos(a),
              vy: cat.vy + d * sin(a) * WORLD_SCALE_Y,
              r: random() * TAU,
              damp: 6,
              t: 0,
              va: 0,
              maxTime: 0.1 + random() * 0.2,
              color: calcBaseColor(drop.color, 0.3),
              sy: 1,
              scale: 1,
            });
          }
        } else {
          if (drop.captureTime >= 1) {
            drop.vx = drop.vx * exp(-9 * dt) + 5000 * dt * (dx / l);
            drop.vy = drop.vy * exp(-9 * dt) + 5000 * dt * (dy / l);
            const maxLimit = l / (hypot(drop.vx, drop.vy) * dt);
            if (maxLimit < 1) {
              drop.vx *= maxLimit;
              drop.vy *= maxLimit;
            }
            drop.x += drop.vx * dt;
            drop.y += drop.vy * dt;
          }
        }
      } else {
        drop.captured = 0;
      }
    } else {
      drop.captured = 0;
      if (cat.hp > 0 && l < getStat(StatKey.MagnetRadius)) {
        drop.captured = 1;
      } else {
        drop.vx = drop.vx * exp(-dt * 4);
        drop.vy = drop.vy * exp(-dt * 4);
        drop.x += drop.vx * dt;
        drop.y += drop.vy * dt;
      }
    }
    if (testVisible(drop.x, drop.y * WORLD_SCALE_Y, drop.radius * 4)) {
      objectsToDraw.push(drop);
    }
  }
};

const checkBodyCollision = (a: Entity, b: Entity) => {
  if (a.collisionLayer === b.collisionLayer) {
    const nx = a.x - b.x;
    const ny = a.y - b.y;
    const l = hypot(nx, ny);
    const D = a.radius + b.radius;
    if (l < D) {
      if (l > 0) {
        const pen = (D / l - 1) / 2;
        a.x += (nx * pen) / a.radius;
        a.y += (ny * pen) / a.radius;
        b.x -= (nx * pen) / b.radius;
        b.y -= (ny * pen) / b.radius;
      } else {
        a.x += random();
        a.y += random();
        b.x -= random();
        b.y -= random();
      }
    }
  }
  // const sqrDist = nx * nx + ny * ny;
  // const D = a.radius + b.radius;
  // if (sqrDist > 0 && sqrDist < D * D) {
  //   const pen = (D / sqrt(sqrDist) - 1) / 2;
  //   const scale = 1 * pen;
  //   a.x += nx * scale;
  //   a.y += ny * scale;
  //   b.x -= nx * scale;
  //   b.y -= ny * scale;
  // }
};

const checkCatsCollision = (a: Cat, b: Cat) => {
  const nx = a.x - b.x;
  const ny = a.y - b.y;
  // const sqrDist = nx * nx + ny * ny;
  // const D = a.radius + b.radius;
  // if (sqrDist > 0 && sqrDist < D * D) {
  //   const pen = (D / sqrt(sqrDist) - 1) / 2;
  //   const scale = 1 * pen;
  //   a.x += nx * scale;
  //   a.y += ny * scale;
  //   b.x -= nx * scale;
  //   b.y -= ny * scale;
  // }
  const l = hypot(nx, ny);
  const D = a.radius + b.radius;
  if (l > 0 && l < D) {
    const pen = (D / l - 1) / 2;
    a.x0 += nx * pen;
    // a.x = a.x * (1 + pen) - b.x * pen;
    a.y0 += ny * pen;
    b.x0 -= nx * pen;
    // b.x = b.x * (1 + pen) - a.x * pen;
    b.y0 -= ny * pen;
  }
};

const drawCat = (cat: Cat) => {
  const color = css_rgba(
    lerp_rgb(cat.color, COLORS[ColorId.White], easeQuadOut(cat.hit))
  );
  const deadState = clamp(1.5 * (cat.deadTime - 1));
  const z = -40 * abs(sin(deadState * TAU)) * (1 - deadState) + deadState * 5;
  const move = -cos(cat.moveDirection);
  const moveVelocity = (getStat(StatKey.MoveSpeed) * cat.moveSpeed) / 30;
  const moveX = cos(cat.moveDirection) * moveVelocity;
  const moveY = sin(cat.moveDirection) * moveVelocity;
  const tailX = cat.x1 - cat.x0;
  const tailY = (cat.y1 - cat.y0) * WORLD_SCALE_Y;
  ctx.save();
  ctx.translate(cat.x0, cat.y0 * WORLD_SCALE_Y + z);
  ctx.scale(
    1 + 0.2 * cos(time * 32) * cat.wobble,
    1 + 0.2 * sin(time * 32) * cat.wobble
  );

  // draw head
  ctx.lineCap = "butt";
  ctx.lineJoin = "round";
  ctx.lineWidth = 10;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  ctx.beginPath();
  ctx.moveTo(move * 2, -15);
  ctx.quadraticCurveTo(0, -10, 0, -5);
  ctx.quadraticCurveTo(0 + tailX * 0.5, -5 + tailY * 0.5, tailX, -5 + tailY);
  ctx.stroke();

  fillCircle(tailX, tailY - 5, 5, color);

  {
    ctx.lineCap = "round";
    const tx = cat.x2 - cat.x1;
    const ty = (cat.y2 - cat.y1) * WORLD_SCALE_Y;
    const tx2 = cat.x3 - cat.x2;
    const ty2 = (cat.y3 - cat.y2) * WORLD_SCALE_Y;
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.moveTo(tailX, tailY - 7);
    ctx.quadraticCurveTo(
      tailX + tx,
      tailY + ty,
      tailX + tx + tx2,
      tailY + ty + ty2
    );
    // ctx.lineTo(tailX + cat2X - tailEndX, tailY + 8 + cat2Y - tailEndY);
    ctx.stroke();
  }

  {
    ctx.beginPath();

    const df = PI / 2;
    const handsUp = deadState * 2;
    const handsUpX = deadState * 4;
    const mx = (1 - deadState) * (-0.5 * moveX * cat.moveSpeed);
    const my = (1 - deadState) * 3 * cat.moveSpeed;
    const mt = time * 8 * moveVelocity;
    let c1 = -handsUpX + mx * cos(mt);
    let c2 = my * sin(mt);
    ctx.moveTo(-3, -5 + deadState * 3);
    ctx.lineTo(-3 + c1, 1 - max(0, c2) - handsUp);

    c1 = handsUpX + mx * cos(mt + 2 * df);
    c2 = my * sin(mt + 2 * df);
    ctx.moveTo(3, -5 + deadState * 3);
    ctx.lineTo(3 + c1, 1 - max(0, c2) - handsUp);

    c1 = -handsUpX + mx * cos(mt + df);
    c2 = my * sin(mt + df);
    ctx.moveTo(tailX - 3, tailY - 5 + deadState * 3);
    ctx.lineTo(tailX - 3 + c1, tailY + 1 - max(0, c2) - handsUp);

    c1 = handsUpX + mx * cos(mt + 3 * df);
    c2 = my * sin(mt + 3 * df);
    ctx.moveTo(tailX + 3, tailY - 5 + deadState * 3);
    ctx.lineTo(tailX + 3 + c1, tailY + 1 - max(0, c2) - handsUp);

    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(0, -15);
  ctx.rotate(move / 3);
  ctx.translate(move * 2, 0);
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.lineTo(-4, -5);
  ctx.lineTo(-1, 0);
  ctx.lineTo(1, 0);
  ctx.lineTo(4, -5);
  ctx.lineTo(5, 0);
  ctx.fill();

  if (moveY >= 0) {
    const off = move * 2;
    if (cat.deadTime < 1 && !cat.hit) {
      if (cat.deco & ((1 << CharItem.Education) | (1 << CharItem.Magnet))) {
        const cc = bwColor(0.5 + 0.3 * sin(move * TAU * 2 + time));
        fillCircle(3 - off, 5, 2, cc);
        fillCircle(-3 - off, 5, 2, cc);
        ctx.fillRect(-3 - off, 3, 6, 1);
      } else {
        fillCircle(3 - off, 5, 2, CSS_WHITE);
        fillCircle(-3 - off, 5, 2, CSS_WHITE);
        fillCircle(3 - off, 5, 0.5, CSS_BLACK);
        fillCircle(-3 - off, 5, 0.5, CSS_BLACK);
      }
    } else {
      ctx.beginPath();
      ctx.lineWidth = 1;
      ctx.strokeStyle = CSS_WHITE;
      ctx.moveTo(-2.5 - off - 1, 5 - 1);
      ctx.lineTo(-2.5 - off + 1, 5 + 1);
      ctx.moveTo(-2.5 - off + 1, 5 - 1);
      ctx.lineTo(-2.5 - off - 1, 5 + 1);
      ctx.moveTo(2.5 - off - 1, 5 - 1);
      ctx.lineTo(2.5 - off + 1, 5 + 1);
      ctx.moveTo(2.5 - off + 1, 5 - 1);
      ctx.lineTo(2.5 - off - 1, 5 + 1);
      ctx.stroke();
    }

    // mouth
    if (cat.deco & (1 << CharItem.Regen)) {
      ctx.beginPath();
      ctx.lineWidth = 0.4;
      ctx.lineCap = "round";
      ctx.strokeStyle = "pink";
      ctx.moveTo(-1.5 - off, 11 - 2);
      ctx.quadraticCurveTo(-1 - off, 12 - 2, 0 - off, 10 - 3);
      ctx.quadraticCurveTo(1 - off, 12 - 2, 1.5 - off, 11 - 2);
      ctx.stroke();
    }

    // nose
    fillCircle(-off, 12 - 5, 0.5, "pink");
    ctx.fillStyle = color;
  } else {
    fillCircle(3 - move * 2, 5, 2, color);
    fillCircle(-3 - move * 2, 5, 2, color);
  }

  ctx.restore();

  ctx.restore();
};

// let _prev = 0;
let update = (_T: number) => {
  requestAnimationFrame(update);
  // if (_T - _prev < 1000 / 60) return;
  // _prev = _T;
  beginFrame(_T / 1000);

  resetSounds();

  initTempArrays();

  if (winActive) {
    updateCatWinPath(cat1, 10);
    updateCatWinPath(cat2, -10);
  }
  updatePlayerCat(cat1);
  updateCat(cat1);
  const hasCat2 = winActive;
  if (hasCat2) {
    objectsToDraw.push(cat2);
    updateCat(cat2);
    checkCatsCollision(cat2, cat1);
  }

  updateWeatherColors();

  // begin draw
  ctx.fillStyle = calcBaseColor(COLORS[ColorId.Ground]);
  ctx.fillRect(0, 0, gameWidth, gameHeight);

  // calc camera before update enemies ()
  let scale = lerp(
    lerp(2, 4, mainMenuTime ** 2),
    4,
    clamp((cat1.deadTime * (1 + cat1.hit / 4)) ** 2)
  );
  if (winActive) {
    const t = clamp(winTime / 2) ** 0.5;
    beginCamera(
      lerp(cat1.x0, winTargetX, t),
      lerp(cat1.y0, winTargetY, t) * WORLD_SCALE_Y,
      scale
    );
  } else {
    beginCamera(cat1.x0, cat1.y0 * WORLD_SCALE_Y, scale);
  }

  updateDropsForCat(cat1);
  updateEnemies();
  updateProjectiles();

  if (winActive) {
    updateWinState();
  } else if (!mainMenuActive && cat1.hp > 0) {
    if (__LOCAL_DEV_SERVER__) {
      handleCheats();
    }
    if (addPlayTime(dt, 60 * 10)) {
      win();
    }
    setMusicProgress(playTime);
    updateWeapons();
    updateLevelProgress();
  }

  mainMenuTime = reach(mainMenuTime, mainMenuActive, dt * 4);
  mainMenuIntroTime += dt * 2;
  if (mainMenuActive && isAnyKeyDown() && mainMenuIntroTime > 2) {
    startLevel();
  }

  updateVPad();

  drawGround();

  if (mainMenuIntroTime < 2) {
    const t = clamp(mainMenuIntroTime - 1);
    ctx.fillStyle = "rgba(0,0,0," + (1 - t ** 3) + ")";
    ctx.fillRect(
      visibleX0,
      visibleY0,
      visibleX1 - visibleX0,
      visibleY1 - visibleY0
    );
  } else if (cat1.deadTime > 0) {
    const t = lerp(clamp(cat1.deadTime / 2), 1, cat1.hit);
    ctx.fillStyle = "rgba(0,0,0," + 0.8 * t ** 2 + ")";
    ctx.fillRect(
      visibleX0 - 10,
      visibleY0 - 10,
      visibleX1 - visibleX0 + 20,
      visibleY1 - visibleY0 + 20
    );
  }

  objectsToDraw.sort(
    (a, b) => a.collisionLayer - b.collisionLayer || a.y - b.y
  );

  if (DEBUG_RADIUS) {
    for (const obj of projectiles) {
      ctx.globalAlpha = 1 - obj.time / obj.timeMax;
      ctx.beginPath();
      ctx.ellipse(
        obj.x,
        obj.y * WORLD_SCALE_Y,
        obj.radius,
        obj.radius * WORLD_SCALE_Y,
        0,
        0,
        TAU
      );
      ctx.strokeStyle = color_debug_red;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  // ctx.globalAlpha = 0.2;

  drawShadows();

  {
    const slot = getSlotWithItem(CharItem.Furricane);
    if (slot) {
      const radius =
        sin(time * 16) / 2 +
        (20 * getWeaponStat(slot, StatKey.DamageRadius)) / 10;
      ctx.strokeStyle = "#c96";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(
        cat1.x,
        cat1.y * WORLD_SCALE_Y,
        radius,
        radius * WORLD_SCALE_Y,
        0,
        0,
        TAU
      );
      ctx.stroke();
    }
  }
  // ctx.globalAlpha = 1;
  updateAndDrawParticles(groundParticles);
  const drawers = [drawCat, drawEnemy, drawDrop, drawProjectile];
  for (const obj of objectsToDraw) {
    drawers[obj.type](obj as any);
  }

  if (!mainMenuActive && cat1.hp > 0 && !winActive) {
    drawHealthBar();
  }

  // ctx.save();
  // ctx.translate(cat.x, cat.y * WORLD_SCALE_Y);
  // drawChest();
  // ctx.restore();
  updateAndDrawParticles(overlayParticles);

  if (!mainMenuActive) {
    drawTextParticles();
  }

  ctx.restore();

  beginCamera(1.1 * cat1.x0, 1.1 * cat1.y0 * WORLD_SCALE_Y, scale);
  updateWeatherParticles();
  updateAndDrawParticles(weatherParticles);
  ctx.restore();

  drawVPad(1 - mainMenuTime ** 2);
  drawScreenDimming();
  if (levelUpOpen > 0) {
    doLevelUpParticles();
  }
  drawXpBar();
  levelUpScreen();
  if (keyboardDown["Escape"]) {
    doPause();
  }

  if (mainMenuTime > 0) {
    if (mainMenuIntroTime < 1) {
      ctx.fillStyle = "rgba(0,0,0," + (1 - mainMenuTime ** 3) + ")";
      ctx.fillRect(0, 0, gameWidth, gameHeight);
    }
    const t = clamp(mainMenuIntroTime - 1);
    const st = (t * mainMenuTime) ** 2;
    ctx.save();
    ctx.translate(gameWidth / 2, (st * gameHeight) / 2 - 120);
    // ctx.rotate(sin(time * 9) * 0.1);
    drawText(0, 0, "Cat Survivors", CSS_WHITE, 24 + 2 * sin(time * 8));
    ctx.restore();
    if (sin(time * 8) >= 0) {
      drawText(
        gameWidth / 2,
        gameHeight / 2 + 100 + ((1 - st) * gameHeight) / 2,
        "TAP TO START",
        CSS_WHITE,
        15
      );
    }
  }

  ctx.save();
  ctx.translate(gameWidth / 2, gameHeight / 2);
  if (!mainMenuActive) {
    if (cat1.deadTime > 0) {
      drawEndScreen(clamp(cat1.deadTime - 1), "GAME OVER", "#e50");
    } else if (winActive) {
      winTime += rawDeltaTime;
      drawEndScreen(clamp(winTime - 5), "YOU WIN", "#ff3");
    }
  }
  ctx.restore();

  endFrame();
};

const drawStats = (scale: number, x = 0, y = 40, t = time) =>
  [
    "TIME: " + formatMMSS(playTime),
    "KILLS: " + frags,
    "LEVEL: " + (level + 1),
  ].map((text) =>
    drawText(x, (y += 20), text, "#ddd", scale * (10 + Math.sin((t += 1) * 8)))
  );

const drawEndScreen = (
  t: number,
  msg: string,
  msgColor: string,
  st = t ** 2,
  hst = (gameHeight * (1 - st)) / 2
) => {
  if (t > 0) {
    drawText(0, -80 - hst, msg, msgColor, 26 + 2 * sin(time * 8));
    ctx.fillStyle = "#888";
    ctx.fillStyle = css_rgba(COLORS[ColorId.White], 0.2);
    ctx.fillRect(-80, 130 + hst - 20, 160, 30);
    drawText(0, 130 + hst, "TAP TO CONTINUE", CSS_WHITE, 16 + sin(time * 4));
    drawStats(st);
    if (t >= 1 && isAnyKeyDown()) {
      resetLevel();
    }
  }
};

const drawProjectile = (proj: Projectile) => {
  const startScale =
    (min(1, proj.time * 8) * min(1, (proj.timeMax - proj.time) * 8)) ** 2;
  ctx.save();
  if (proj.gfx === CharItem.Boomerang) {
    ctx.translate(proj.x, proj.y * WORLD_SCALE_Y - 8);
    ctx.scale(
      startScale * (1 + sin(proj.time * 13) / 8),
      (startScale * (1 + cos(proj.time * 19) / 8)) / 2
    );
    ctx.rotate(proj.time * 8);
    ctx.beginPath();
    ctx.moveTo(-proj.radius, 0);
    ctx.lineTo(proj.radius, 0);
    ctx.moveTo(0, -proj.radius);
    ctx.lineTo(0, proj.radius);
    ctx.strokeStyle = "#CFF";
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (proj.gfx === CharItem.Axe) {
    ctx.translate(proj.x, proj.y * WORLD_SCALE_Y - 6);
    ctx.scale(
      1.5 * Math.sign(proj.vx) * startScale * (1 + sin(proj.time * 13) / 8),
      1.5 * startScale * (1 + cos(proj.time * 19) / 8)
    );
    ctx.rotate(proj.time * 8);
    ctx.beginPath();
    ctx.moveTo(-proj.radius, -1);
    ctx.lineTo(proj.radius / 2, 0);
    ctx.lineTo(proj.radius / 2, 2);
    ctx.quadraticCurveTo(proj.radius / 4, 3, 0, 2);
    // ctx.lineTo(0, 2);
    ctx.lineTo(0, 0);
    ctx.closePath();
    // ctx.arc(proj.radius / 2, 0, proj.radius / 2, PI, TAU, true);
    // ctx.roundRect(0, 0, proj.radius / 2, 2, 0.5);
    ctx.fillStyle = "#C66";
    ctx.strokeStyle = "#621";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fill();
  } else if (proj.gfx === CharItem.Flames) {
    const sc = proj.radius / 6;
    {
      const a = random() * TAU;
      const d = startScale * random() ** 0.5 * (proj.radius / 2);
      const x = proj.x + d * cos(a);
      const y = proj.y * WORLD_SCALE_Y + d * sin(a);

      groundParticles.push({
        type: ParticleType.Smoke,
        x,
        y: y - proj.radius * 2,
        vx: random() * 10 * (x - proj.x),
        vy: random() * 10 * (y - proj.y * WORLD_SCALE_Y),
        r: random() * TAU,
        damp: 6,
        t: 0,
        va: 0,
        maxTime: 0.1 + random() * 0.3,
        color: "#F30",

        scale: sc,
        sy: 1,
      });
    }
    {
      const a = random() * TAU;
      const d = random() ** 0.5 * (proj.radius / 2);
      const x = proj.x + d * cos(a);
      const y = proj.y * WORLD_SCALE_Y + d * sin(a);

      overlayParticles.push({
        type: ParticleType.Smoke,
        x,
        y: y - proj.radius * 2,
        vx: proj.vx + random() * 10 * (x - proj.x),
        vy: proj.vy + random() * 10 * (y - proj.y * WORLD_SCALE_Y),
        r: random() * TAU,
        damp: 9,
        t: 0,
        va: 0,
        maxTime: 0.1 + random() * 0.2,
        color: "#F90",
        scale: sc,
        sy: 1,
      });
    }
    // ctx.save();
    // ctx.translate(proj.x, proj.y * WORLD_SCALE_Y - proj.radius * 2);
    // ctx.scale(
    // 1 + sin(proj.time * 13) / 8,
    // 1 + cos(proj.time * 19) / 8
    // );
    // ctx.beginPath();
    // ctx.arc(0, 0, proj.radius, 0, TAU);
    // ctx.strokeStyle = "#ff9";
    // ctx.fillStyle = "#f90";
    // ctx.fill();
    // ctx.stroke();
    // ctx.restore();
  } else if (proj.gfx === CharItem.Lightning) {
    ctx.translate(proj.x, proj.y * WORLD_SCALE_Y);
    ctx.scale(
      startScale * (1 + sin(proj.time * 13) / 8),
      startScale * (1 + cos(proj.time * 19) / 8)
    );

    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.strokeStyle = "#EFF";
    const d = random() * proj.damageRadius;
    const a = random() * TAU;
    let lx = d * cos(a);
    let ly = d * sin(a) * WORLD_SCALE_Y;
    ctx.moveTo(lx, ly);
    for (let i = 1; i >= 0; i -= 0.05) {
      lx += 20 * (random() - 0.5);
      ly -= 4 + 10 * random();
      ctx.lineTo(lx * i ** 8 + 2 * (random() - 0.5), ly);
    }
    ctx.stroke();
  } else if (proj.gfx === CharItem.MilkGun) {
    ctx.translate(proj.x, proj.y * WORLD_SCALE_Y - proj.radius * 2);
    ctx.scale(
      startScale * (1 + sin(proj.time * 13) / 8),
      startScale * (1 + cos(proj.time * 19) / 8)
    );
    ctx.beginPath();
    ctx.arc(0, 0, proj.radius, 0, TAU);
    ctx.strokeStyle = "#CFF";
    ctx.fillStyle = "#CEF";
    ctx.fill();
    ctx.stroke();
  } else if (proj.gfx === CharItem.Knife) {
    ctx.translate(proj.x, proj.y * WORLD_SCALE_Y - proj.radius * 2);
    ctx.scale(
      startScale * (1 + sin(proj.time * 13) / 8),
      startScale * (1 + cos(proj.time * 19) / 8)
    );
    ctx.rotate(atan2(proj.vy * WORLD_SCALE_Y, proj.vx));
    ctx.beginPath();
    ctx.moveTo(-proj.radius, 0);
    ctx.lineTo(proj.radius, 0);
    ctx.strokeStyle = "#CFF";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-proj.radius / 2, -1);
    ctx.lineTo(-proj.radius / 2, 1);
    // ctx.moveTo(-proj.radius, 0);
    // ctx.lineTo(-proj.radius / 2, 0);
    ctx.strokeStyle = "#6CC";
    ctx.stroke();
  } else if (proj.gfx === CharItem.Sawblades) {
    ctx.translate(proj.x, proj.y * WORLD_SCALE_Y - proj.radius * 2);
    ctx.scale(startScale, startScale);
    ctx.rotate(-proj.time * 8);
    ctx.fillStyle = "#ccc";
    const r = proj.radius * 0.8;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.rotate(PI / 8);
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.rotate(PI / 8);
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.rotate(PI / 8);
    ctx.fillRect(-r, -r, r * 2, r * 2);
    fillCircle(0, 0, r, "#88a");
  }
  ctx.restore();
};

const drawDeadEnemy = (enemy: Enemy) => {
  const scale = enemy.radius;
  const rt = enemy.deadTime / enemy.deadTimeMax;
  ctx.translate(
    enemy.x,
    (enemy.y - enemy.radius / 2 - 20 * sin(min(1, enemy.deadTime * 2) * PI)) *
      WORLD_SCALE_Y
  );
  ctx.rotate((1 - (1 - rt) ** 3) * enemy.moveTime);
  ctx.scale(scale, scale * (1 - 0.2 * min(1, enemy.deadTime * 2)));
  fillCircle(0, 0, 1, calcBaseColor(enemy.color, enemy.hit, 0.5 * (1 - rt)));
};

const drawEnemy = (enemy: Enemy) => {
  if (enemy.deadTime >= enemy.deadTimeMax) return;

  const rt = enemy.deadTime / enemy.deadTimeMax;
  ctx.save();

  ctx.globalAlpha = 1 - rt ** 4;

  if (
    enemy.enemyType === EnemyType.Frog ||
    enemy.enemyType === EnemyType.Snowman
  ) {
    const scale = enemy.radius;
    if (enemy.hp) {
      const iat = enemy.attackTimer ** 3;
      const attackPunch = sin(iat * PI) / 2;
      const attackDx = attackPunch * (cat1.x - enemy.x);
      const attackDy = attackPunch * (cat1.y - enemy.y);
      const moveF = max(0, sin(enemy.moveTime));
      ctx.translate(
        enemy.x + attackDx,
        (enemy.y + attackDy) * WORLD_SCALE_Y -
          enemy.radius / 2 -
          moveF * enemy.radius
      );
      ctx.scale(scale * sign(cat1.x - enemy.x), scale * (0.9 + 0.2 * moveF));
      const color = lerp_rgb(
        enemy.color,
        enemy.color2,
        enemy.stroke * (0.5 + sin(time * 32) / 2)
      );
      ctx.fillStyle = calcBaseColor(color, enemy.hit, 0.9);
      ctx.strokeStyle = calcBaseColor(color, enemy.hit, 0.3);

      ctx.lineWidth = 0.1;
      if (enemy.enemyType === EnemyType.Snowman) {
        ctx.lineWidth = 0.2;
        ctx.beginPath();
        ctx.arc(0, -moveF / 3, 1, 0, TAU);
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -0.8 - moveF / 2, 0.8, 0, TAU);
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-0.9, 0.2 - moveF / 3);
        ctx.lineTo(-1.5, -0.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(1, -moveF / 3);
        ctx.lineTo(1.5, -0.5);
        ctx.stroke();
        ctx.translate(0, -0.6 - moveF / 3);
      } else {
        ctx.beginPath();
        ctx.arc(-0.5, 0.7 + moveF / 2, 0.3, 0, TAU);
        ctx.stroke();
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0.7, 0.7 + moveF / 3, 0.3, 0, TAU);
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = calcBaseColor(enemy.color, enemy.hit);
        ctx.beginPath();
        ctx.arc(0, 0, 1, 0, TAU);
        ctx.stroke();
        ctx.fill();

        ctx.lineWidth = 0.2;
        ctx.strokeStyle = "#432";
        ctx.beginPath();
        ctx.arc(0.1, 0.5, 0.3, PI, 0);
        ctx.stroke();
      }

      if (enemy.variation === 1) {
        ctx.fillStyle = "#936";
        ctx.beginPath();
        ctx.ellipse(0, -0.5, 1, 0.2, 0, 0, TAU);
        ctx.fill();
      }

      if (enemy.variation === 2) {
        ctx.save();
        ctx.rotate(-0.3 - 0.1 * cos(enemy.moveTime));
        ctx.fillStyle = CSS_BLACK;
        ctx.beginPath();
        ctx.ellipse(0, -1, 1, 0.4, 0, 0, TAU);
        ctx.fillRect(-0.4, -2, 0.8, 1);
        ctx.fill();
        ctx.fillStyle = CSS_WHITE;
        ctx.fillRect(-0.3, -1.9, 0.1, 0.7);
        ctx.restore();
        ctx.fillStyle = CSS_WHITE;
        ctx.fillRect(0, -0.6, 0.7, 0.1);
      }
      fillCircle(0, -0.5, 0.3, CSS_WHITE);
      fillCircle(0.7, -0.7, 0.3, CSS_WHITE);
      fillCircle(0, -0.5, 0.2, CSS_BLACK);
      fillCircle(0.7, -0.7, 0.2, CSS_BLACK);
    } else {
      drawDeadEnemy(enemy);
    }
  } else if (enemy.enemyType === EnemyType.Mice) {
    const scale = enemy.radius;
    if (enemy.hp) {
      ctx.translate(enemy.x, enemy.y * WORLD_SCALE_Y + 7 * rt * rt);
      ctx.rotate((1 - (1 - rt) ** 3) * enemy.moveTime);
      ctx.scale(
        scale * sign(cat1.x - enemy.x),
        scale * (0.9 + 0.1 * sin(enemy.moveTime * 2))
      );
      ctx.save();
      ctx.rotate(atan2(cat1.y - enemy.y, cat1.x - enemy.x) / 8);
      ctx.fillStyle = calcBaseColor(enemy.color, enemy.hit);
      ctx.beginPath();
      ctx.arc(0, 0, 1, PI, 0);
      ctx.ellipse(0, 0, 1, 0.2, 0, 0, PI);
      ctx.arc(0.5, -1, 0.4, 0, TAU);
      ctx.closePath();
      ctx.arc(0.1, -1, 0.5, 0, TAU);
      // ctx.moveTo(-1, -1);
      // ctx.lineTo(0.2, 0);
      // ctx.lineTo(-1, 0.2);
      ctx.closePath();

      ctx.moveTo(0, 0);
      ctx.lineTo(-2, 0);
      ctx.lineTo(0, -0.5);
      ctx.closePath();

      ctx.strokeStyle = calcBaseColor(enemy.color, enemy.hit, 0.3);
      ctx.lineWidth = 0.2;
      ctx.stroke();

      ctx.fill();

      fillCircle(1, 0, 0.1, "pink");
      fillCircle(0.6, -0.4, 0.1, CSS_BLACK);

      ctx.restore();
    } else {
      drawDeadEnemy(enemy);
    }
  } else if (enemy.enemyType === EnemyType.Box) {
    ctx.translate(enemy.x - 1, enemy.y * WORLD_SCALE_Y + 1);
    // ctx.beginPath();
    //ctx.rotate(PI / 4);
    const s = 8;
    const sz = s / 2;
    const of = sz / 2;
    ctx.scale(1, 1 + sin(enemy.moveTime + time * 8) / 20);
    ctx.fillStyle = calcBaseColor(enemy.color, enemy.hit, 0.7);
    ctx.beginPath();
    ctx.moveTo(-sz, -s);
    ctx.lineTo(-sz + of, -s - of);
    ctx.lineTo(sz + of, -s - of);
    ctx.lineTo(sz + of, 0 - of);
    ctx.lineTo(sz, 0);
    ctx.fill();
    ctx.fillStyle = calcBaseColor(enemy.color, enemy.hit);
    ctx.fillRect(-sz, -s, s, s);
    ctx.fillStyle = calcBaseColor(enemy.color, 0.5);
    ctx.fillRect(-4, -3, 6, 1);
  } else if (enemy.enemyType === EnemyType.Fly) {
    ctx.translate(enemy.x, enemy.y * WORLD_SCALE_Y - 10 + 7 * rt * rt);
    ctx.rotate((1 - (1 - rt) ** 3) * enemy.moveTime);
    const c2 = easeQuadOut(enemy.hit);
    const ts = lerp(sin(enemy.moveTime * 4), -1, rt);
    const scale = enemy.radius / 3.5;
    ctx.scale(scale, scale);
    ctx.save();
    ctx.rotate(ts);
    ctx.fillStyle = calcBaseColor(enemy.color, enemy.hit);
    ctx.beginPath();
    ctx.ellipse(-2, 0, 2, 1, 0, 0, TAU);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.rotate(-ts);
    ctx.fillStyle = calcBaseColor(enemy.color, enemy.hit);
    ctx.beginPath();
    ctx.ellipse(2, 0, 2, 1, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    fillCircle(0, 0.5, 2, calcBaseColor(enemy.color, enemy.hit, 0.3));
    const eyeColor = css_rgba(enemy.color2);
    fillCircle(-1, 1 + ts / 2, 0.75, eyeColor);
    fillCircle(1, 1 + ts / 2, 0.75, eyeColor);
  } else if (enemy.enemyType === EnemyType.Snake) {
    ctx.translate(enemy.x, enemy.y * WORLD_SCALE_Y - 10 * sin(rt * PI));
    const scale = enemy.radius / 3.5;
    const off = sin(-2 * enemy.moveTime);
    ctx.scale(scale * sign(cat1.x - enemy.x), scale);
    ctx.save();

    fillCircle(5, -(6 - 6 * rt) + off / 2, 0.75, CSS_BLACK);
    fillCircle(5, -(6 - 6 * rt) + off / 2, 0.25, CSS_WHITE);

    ctx.beginPath();
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.lineWidth = 1;

    const head = 5 - rt * 5;
    ctx.moveTo(6, -head + off);
    // ctx.quadraticCurveTo(4, -5, 4, sin(-2 * enemy.moveTime));
    ctx.quadraticCurveTo(4, -head - 1, 4, -(head / 2 - 1) - off / 2);
    ctx.quadraticCurveTo(
      4,
      -(head / 2 - 1) - off / 2,
      4,
      -(head / 2 - 1) - off
    );
    for (let i = 0; i < 7; ++i) {
      const t = i / 7;
      const t2 = (i + 0.5) / 7;
      const x1 = 4 - t * (10 + sin(enemy.moveTime));
      const y1 = sin(-2 * enemy.moveTime + 2 * TAU * t) * (1 - t);
      const x2 = 4 - t2 * (10 + sin(enemy.moveTime));
      const y2 = sin(-2 * enemy.moveTime + 2 * TAU * t2) * (1 - t2);
      // ctx.lineTo(x1, y1);
      // ctx.lineTo(x2, y2);
      ctx.quadraticCurveTo(x1, y1, x2, y2);
    }
    ctx.strokeStyle = calcBaseColor(enemy.color, enemy.hit);
    ctx.stroke();
    ctx.lineWidth = 0.25;
    ctx.strokeStyle = calcBaseColor(enemy.color2, enemy.hit);
    ctx.stroke();

    fillCircle(5 + 1, -(6 - 6 * rt) + off, 0.75, CSS_BLACK);
    fillCircle(5 + 1, -(6 - 6 * rt) + off, 0.25, CSS_WHITE);

    ctx.restore();
  }
  ctx.restore();
};

const drawHealthBar = () => {
  const w = 16;
  const w2 = (w * cat1.hp) / cat1.hpMax;
  const h = 2;
  ctx.save();
  ctx.translate(cat1.x - w / 2, cat1.y * WORLD_SCALE_Y + 12);
  ctx.lineCap = "round";
  ctx.lineWidth = h + 1;
  ctx.strokeStyle = "#222";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = h;
  ctx.strokeStyle = "#210";
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.stroke();

  if (w2 > 0) {
    ctx.beginPath();
    ctx.lineWidth = h;
    ctx.strokeStyle = "#C42";
    ctx.moveTo(0, 0);
    ctx.lineTo(w2, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = h / 3;
    ctx.strokeStyle = "#F88";
    ctx.moveTo(0, -h / 3);
    ctx.lineTo(w2, -h / 3);
    ctx.stroke();
  }

  ctx.restore();
};

const drawXpBar = () => {
  if (mainMenuActive) return;
  const w = gameWidth - 16;
  const w2 = levelUpActive ? w : w * (xp / getNextLevelXp());
  const h = 10;
  ctx.save();
  ctx.translate(8, 8 - 20 * mainMenuTime ** 2);
  ctx.beginPath();
  ctx.lineCap = "round";
  ctx.lineWidth = h + 2;
  ctx.strokeStyle = "#111";
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.lineWidth = h;
  ctx.strokeStyle = "#042";
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.stroke();

  if (w2 > 0) {
    const levelUpColor = lerp_rgb(
      0x22cc44,
      lerp_rgb(0xff00ff, 0x0000ff, 0.5 + 0.5 * sin(rawTime * 16)),
      levelUpOpen
    );
    ctx.beginPath();
    ctx.lineWidth = h;
    ctx.strokeStyle = css_rgba(levelUpColor);
    ctx.moveTo(0, 0);
    ctx.lineTo(w2, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = h / 3;
    ctx.strokeStyle = css_rgba(COLORS[ColorId.White], 0.3);
    ctx.moveTo(0, -h / 3);
    ctx.lineTo(w2, -h / 3);
    ctx.stroke();
  }

  drawText(w / 2, 3, "LVL " + (level + 1), CSS_WHITE, 8, 1);
  drawText(w, 16, "☠️" + frags, CSS_WHITE, 8, 2);
  if (level) {
    drawText(w / 2, 16, formatMMSS(playTime), CSS_WHITE, 10);
  } else {
    drawText(
      w / 2,
      gameHeight / 2 - 120,
      "Use WASD or Touch to Move",
      CSS_WHITE,
      16 + sin(time * 2 + 2)
    );
    drawText(
      w / 2,
      gameHeight / 2 - 80,
      "eat green bubbles to level up",
      CSS_WHITE,
      16 + sin(time * 2)
    );
    drawText(
      w / 2,
      gameHeight / 2 - 60,
      xp / XP_MOD + " of " + getNextLevelXp() / XP_MOD,
      CSS_WHITE,
      12 + sin(time)
    );
  }
  drawSlotArray(8, 20, 0);
  drawSlotArray(8, 40, 1);
  if (__LOCAL_DEV_SERVER__) {
    drawDebugStats();
  }
  ctx.restore();
};

const drawSlotArray = (
  x: number,
  y: number,
  passive: number,
  i = 0,
  sz = 16
) => {
  for (let slot of slots) {
    if (getCharItemPassive(slot.type) == passive) {
      ctx.save();
      ctx.translate(x + (sz + 4) * i, y);
      ctx.rotate(-0.1 * sin(i + rawTime * 5));
      ctx.fillStyle = CSS_WHITE;
      ctx.globalAlpha = 0.3 + slot.attackTimer / 2;
      ctx.fillRect(-sz / 2, -sz / 2, sz, sz);
      ctx.globalAlpha = 1;
      drawIcon(0, 0, TEXT_ICON[slot.type], 15);
      drawText(8, -4, slot.level + 1, CSS_WHITE, 8);
      ctx.restore();
      ++i;
    }
  }
};

const hitCat = (damage: number, cat: Cat = cat1) => {
  damage = max(0, damage - getStat(StatKey.Armor));
  if (damage > 0) {
    if (chance(getStat(StatKey.Luck) / 100)) {
      if (chance()) {
        addTextParticle(cat.x, cat.y, "DODGE", "#ccF");
      } else {
        addTextParticle(cat.x, cat.y, "MISS", "#ccc");
      }
    } else {
      cat.hp = max(0, cat.hp - damage);
      cat.hit = 1;
      shakeCamera(1);
      addCatHitParticles(30);
      addTextParticle(cat.x0, cat.y0, -damage, "#F33");
      // playSound_hit();
      playSound(Snd.CatOuch);
      sleepGame(0.1);
      if (!cat.hp) {
        stopMusic();
        playSound(Snd.Noise);
        sleepGame(1);
      }
    }
  }
};

const splatHitParticles = (obj: EntityBase, color: string, n: number) => {
  for (let i = 0; i < n; ++i) {
    const d = random() ** 0.5 * 100;
    const a = random() * TAU;
    overlayParticles.push({
      type: ParticleType.RoundSpark,
      x: obj.x,
      y: obj.y * WORLD_SCALE_Y - obj.radius,
      vx: d * cos(a),
      vy: d * sin(a) * WORLD_SCALE_Y,
      r: 0,
      va: 1,
      t: 0,
      maxTime: 0.05 + 0.3 * random(),
      color: color,
      damp: 1,
      scale: 1,
      sy: 1,
    });
  }
};
const hitEnemy = (enemy: Enemy, damage: number, kickForce = 1) => {
  enemy.hp = max(0, enemy.hp - damage);
  enemy.hit = 1;
  playSound(Snd.Kick);
  playSound(Snd.Hit);

  const df = (damage - 10) / 20;
  addTextParticle(
    enemy.x,
    enemy.y,
    damage | 0,
    calcBaseColor(
      lerp_rgb(0xffff00, 0xff0000, 0.5 + 0.5 * sin((df * Math.PI) / 2)),
      clamp(1 - df)
    ),
    0.5 + df / 4
  );
  splatHitParticles(
    enemy,
    enemy.enemyType === EnemyType.Box ? "#ccc" : "#930",
    10
  );

  if (chance() || !enemy.hp) {
    if (enemy.kickBack <= 0) {
      enemy.moveTime = 0;
    }
    enemy.kickBack = 1;
    enemy.vx = enemy.x - cat1.x;
    enemy.vy = enemy.y - cat1.y;
    const l = hypot(enemy.vx, enemy.vy);
    if (l > 0) {
      const kbv = (kickForce * (random() * 500)) / enemy.radius / l;
      enemy.vx *= kbv;
      enemy.vy *= kbv;
    }
  }

  if (!enemy.hp) {
    if (enemy.enemyType === EnemyType.Box) {
      if (chance(0.3)) {
        if (chance()) {
          addDropItem(enemy.x, enemy.y, DropItem.Magnet, 1);
        } else {
          addDropItem(enemy.x, enemy.y, DropItem.Bomb, 1);
        }
      } else if (chance(0.8) && cat1.hp < cat1.hpMax) {
        addDropItem(enemy.x, enemy.y, DropItem.Hp, enemy.dropXp);
      } else {
        addDropItem(enemy.x, enemy.y, DropItem.Xp, enemy.dropXp);
      }

      for (let i = 0; i < 10; ++i) {
        const d = random() ** 0.5 * 100;
        const a = random() * TAU;
        overlayParticles.push({
          type: ParticleType.Smoke,
          x: enemy.x,
          y: enemy.y * WORLD_SCALE_Y - enemy.radius * 0.25,
          vx: d * cos(a),
          vy: d * sin(a) * WORLD_SCALE_Y,
          r: random() * TAU,
          t: 0,
          maxTime: 0.05 + 0.3 * random(),
          color: "#fe9",
          damp: 1,
          va: 0,
          scale: 1,
          sy: 1,
        });
      }
    } else {
      if (enemy.dropXp < 0) {
        addDropItem(enemy.x, enemy.y, DropItem.Chest, 1);
      } else if (random() < 0.9) {
        addDropItem(enemy.x, enemy.y, DropItem.Xp, enemy.dropXp);
      }
      addFrag();
    }

    enemy.moveTime = sign(enemy.vx) * PI * (4 + 8 * random());

    for (let i = 0; i < 30; ++i) {
      const a = random() * TAU;
      const d = random() * 100;
      overlayParticles.push({
        type: ParticleType.Smoke,
        x: enemy.x,
        y: enemy.y * WORLD_SCALE_Y - 6,
        vx: d * cos(a),
        vy: d * sin(a) * WORLD_SCALE_Y - 20,
        r: random() * TAU,
        damp: 4,
        t: 0,
        va: 0,
        maxTime: 0.3 + random() * 0.4,
        color: calcBaseColor(enemy.color, 0, 1),
        scale: random() * 0.5 + 0.2,
        sy: 1,
      });
    }
    playSound(Snd.Noise);
  }
};

const updateWeapons = () => {
  nearestEnemies.sort((a, b) => b.distanceToPlayer - a.distanceToPlayer);

  for (let i = 0; i < slots.length; ++i) {
    const slot = slots[i];
    if (slot) {
      const wpn = slot.type;
      if (!getCharItemPassive(wpn)) {
        const fireSpeed = getWeaponStat(slot, StatKey.FireRate) / 100;
        const damage =
          (getWeaponStat(slot, StatKey.Damage) * (1 + level * 0.02)) | 0;
        const modDamageArea = getWeaponStat(slot, StatKey.DamageRadius) / 10;
        const bulletSpeed = getWeaponStat(slot, StatKey.BulletSpeed) / 10;
        const projectilesCount = getWeaponStat(slot, StatKey.Projectile);
        slot.attackTimer -= dt * fireSpeed;
        if (slot.attackTimer < 0) {
          slot.burstClip = projectilesCount;
          slot.attackTimer = 1;
        }
        slot.animation += dt;
        slot.burstTimer -= dt * getWeaponStat(slot, StatKey.BurstSpeed);
        if (wpn === CharItem.Claws) {
          const enemy =
            nearestEnemies[max(0, nearestEnemies.length - slot.burstClip)];
          const attackRadius = 40 * modDamageArea;
          if (enemy && enemy.distanceToPlayer < attackRadius) {
            if (slot.burstTimer < 0 && slot.burstClip) {
              // playSound(Snd.Noise);
              hitEnemy(enemy, damage);
              overlayParticles.push({
                type: ParticleType.Paw,
                x: enemy.x,
                y: enemy.y * WORLD_SCALE_Y - enemy.radius * 0.25,
                vx: 0,
                vy: 0,
                r: random() * TAU,
                t: 0,
                maxTime: 0.2,
                color: "#fee",
                damp: 1,
                va: 0,
                scale: 1,
                sy: 1,
              });
              --slot.burstClip;
              slot.burstTimer = 1;
            }
          }
        } else if (wpn === CharItem.Boomerang) {
          if (slot.burstTimer < 0 && slot.burstClip) {
            const radius = 5 * modDamageArea;
            const a = random() * TAU;
            projectiles.push({
              type: EntityType.Projectile,
              x: cat1.x + (cat1.radius + radius) * cos(a),
              y: cat1.y + (cat1.radius + radius) * sin(a),
              vx: cat1.vx + 200 * bulletSpeed * cos(a),
              vy: cat1.vy + 200 * bulletSpeed * sin(a),
              radius: radius,
              damageRadius: radius,
              damage: damage,
              time: 0,
              timeMax: 3,
              timer: 0,
              period: 0.3,
              damageCount: 100,
              damageRepeat: 100,
              shadowSize: 1,
              visible: 1,
              gfx: CharItem.Boomerang,
              collisionLayer: 0,
            });
            playSound(Snd.ShootWind);
            --slot.burstClip;
            slot.burstTimer = 1;
          }
        } else if (wpn === CharItem.Axe) {
          if (slot.burstTimer < 0 && slot.burstClip) {
            const radius = 5 * modDamageArea;
            const a = -PI / 4 - (random() * PI) / 2;
            projectiles.push({
              type: EntityType.Projectile,
              x: cat1.x + (cat1.radius + radius) * cos(a),
              y: cat1.y + (cat1.radius + radius) * sin(a),
              vx: cat1.vx + 200 * bulletSpeed * cos(a),
              vy: cat1.vy + 200 * bulletSpeed * sin(a),
              radius: radius,
              damageRadius: radius,
              damage: damage,
              time: 0,
              timeMax: 3,
              timer: 0,
              period: 0.3,
              damageCount: 100,
              damageRepeat: 100,
              shadowSize: 1,
              visible: 1,
              gfx: CharItem.Axe,
              collisionLayer: 0,
            });
            playSound(Snd.ShootWind);
            --slot.burstClip;
            slot.burstTimer = 1;
          }
        } else if (wpn === CharItem.Furricane) {
          const radius = 20 * modDamageArea;
          if (slot.animation > 0.01) {
            slot.animation = 0;
            for (let i = 0; i < slot.level + 1; ++i) {
              const d = random() ** 0.2 * radius;
              const a = random() * TAU;
              const dx = d * cos(a);
              const dy = d * sin(a);
              groundParticles.push({
                type: ParticleType.Smoke,
                x: cat1.x + dx,
                y: (cat1.y + dy) * WORLD_SCALE_Y,
                vx: 0,
                vy: -10 * random(),
                r: 0,
                t: 0,
                maxTime: 0.5 + 0.5 * random(),
                color: "#c96",
                damp: 0,
                scale: random() * 0.2 + 0.2,
                sy: 1,
                va: 0,
              });
            }
          }
          if (slot.burstTimer < 0 && slot.burstClip) {
            projectiles.push({
              type: EntityType.Projectile,
              x: cat1.x,
              y: cat1.y,
              vx: 0,
              vy: 0,
              radius: radius,
              damageRadius: radius,
              damage: damage,
              time: 0,
              timeMax: 0.01,
              timer: 0,
              period: 0,
              damageCount: 100,
              damageRepeat: 1,
              shadowSize: 1,
              visible: 0,
              gfx: CharItem.Furricane,
              followCat: {
                radius: 0,
                angle: 0,
                rotation: 0,
              },
              collisionLayer: 0,
            });
            slot.burstClip = 0;
            slot.burstTimer = 0;
          }
        } else if (wpn === CharItem.SantaWater) {
          const radius = 5 * modDamageArea;
          if (
            slot.burstTimer < 0 &&
            slot.burstClip &&
            hypot(cat1.vx, cat1.vy) >= 1
          ) {
            const lifeTime = 1.5;
            const x = cat1.x + 10 * modDamageArea * (random() - 0.5);
            const y = cat1.y + 10 * modDamageArea * (random() - 0.5);
            groundParticles.push({
              type: ParticleType.Smoke,
              x,
              y: y * WORLD_SCALE_Y,
              vx: 0,
              vy: 0,
              r: 0,
              t: 0,
              maxTime: lifeTime * 2,
              color: "#012",
              va: 0,
              damp: 0,
              scale: 2,
              sy: WORLD_SCALE_Y,
            });
            projectiles.push({
              type: EntityType.Projectile,
              x,
              y,
              vx: 0,
              vy: 0,
              radius: radius,
              damageRadius: radius,
              damage: damage,
              time: 0,
              timeMax: lifeTime,
              timer: 0,
              period: 0.3,
              damageCount: 100,
              damageRepeat: 100,
              shadowSize: 1,
              visible: 0,
              gfx: CharItem.SantaWater,
              collisionLayer: 0,
              kickForce: 0,
            });
            // playSound_noise();
            // slot.burstClip = 0;
            slot.burstTimer = 1;
          }
        } else if (wpn === CharItem.MilkGun) {
          const radius = 2 * modDamageArea;
          const enemy =
            nearestEnemies[max(0, nearestEnemies.length - slot.burstClip)];
          if (enemy) {
            if (slot.burstTimer < 0 && slot.burstClip) {
              // nearestEnemies.pop();

              projectiles.push({
                type: EntityType.Projectile,
                x: cat1.x + (5 * (enemy.x - cat1.x)) / enemy.distanceToPlayer,
                y: cat1.y + (5 * (enemy.y - cat1.y)) / enemy.distanceToPlayer,
                vx:
                  (100 * bulletSpeed * (enemy.x - cat1.x)) /
                  enemy.distanceToPlayer,
                vy:
                  (100 * bulletSpeed * (enemy.y - cat1.y)) /
                  enemy.distanceToPlayer,
                radius: radius,
                damageRadius: radius,
                damage: damage,
                time: 0,
                timeMax: 3,
                timer: 0,
                period: 10,
                damageCount: 1,
                damageRepeat: 1,
                shadowSize: 1,
                visible: 1,
                gfx: CharItem.MilkGun,
                collisionLayer: 0,
              });
              playSound(Snd.Noise);
              --slot.burstClip;
              slot.burstTimer = 1;
            }
          }
        } else if (wpn === CharItem.Lightning) {
          if (slot.burstTimer < 0 && slot.burstClip) {
            const radius = 20 * modDamageArea;
            const x = visibleX0 + (visibleX1 - visibleX0) * random();
            const y =
              (visibleY0 + (visibleY1 - visibleY0) * random()) / WORLD_SCALE_Y;
            const vx = (bulletSpeed - 1) * (cat1.x - x);
            const vy = (bulletSpeed - 1) * (cat1.y - y);
            groundParticles.push({
              type: ParticleType.Smoke,
              x,
              y: y * WORLD_SCALE_Y,
              vx: vx,
              vy: vy,
              r: 0,
              t: 0,
              maxTime: 1,
              color: "rgba(200,255,255,0.1)",
              damp: 0,
              va: 0,
              scale: radius / 3,
              sy: WORLD_SCALE_Y,
            });
            projectiles.push({
              type: EntityType.Projectile,
              x,
              y,
              vx: vx,
              vy: vy,
              radius: radius,
              damageRadius: radius,
              damage: damage,
              time: 0,
              timeMax: 0.5,
              timer: 0,
              period: 0.5,
              damageCount: 100,
              damageRepeat: 100,
              shadowSize: 0,
              visible: 1,
              gfx: CharItem.Lightning,
              collisionLayer: 0,
              kickForce: 0,
            });
            --slot.burstClip;
            slot.burstTimer = 1;
            playSound(Snd.Lightning);
          }
        } else if (wpn === CharItem.Knife) {
          if (slot.burstTimer < 0 && slot.burstClip) {
            const radius = 2 * modDamageArea;
            const speed = 0.9 + 0.1 * random();
            const a = atan2(cat1.y0 - cat1.y1, cat1.x0 - cat1.x1);
            projectiles.push({
              type: EntityType.Projectile,
              x: cat1.x + 10 * cos(a) + cat1.radius * (0.5 - random()),
              y: cat1.y + 10 * sin(a) + cat1.radius * (0.5 - random()),
              vx: speed * 100 * bulletSpeed * cos(a),
              vy: speed * 100 * bulletSpeed * sin(a),
              radius: radius,
              damageRadius: radius,
              damage: damage,
              time: 0,
              timeMax: 3,
              timer: 0,
              period: 10,
              damageCount: 1,
              damageRepeat: 1,
              shadowSize: 1,
              visible: 1,
              gfx: CharItem.Knife,
              collisionLayer: 0,
            });

            --slot.burstClip;
            slot.burstTimer = 1;
            playSound(Snd.Noise);
          }
        } else if (wpn === CharItem.Flames) {
          if (slot.burstTimer < 0 && slot.burstClip) {
            const enemy =
              nearestEnemies[(random() * nearestEnemies.length) | 0];
            if (enemy) {
              const radius = 2 * modDamageArea;
              // for (let k = 0; k < 3; ++k) {
              //   const radius = 2 * modDamageArea;
              //   const speed = 0.9 + 0.1 * random();
              //   const a =
              //     atan2(cat1.y0 - cat1.y1, cat1.x0 - cat1.x1) + 0.2 * (k - 1);
              //   projectiles.push({
              //     type: EntityType.Projectile,
              //     x: cat1.x + 10 * cos(a),
              //     y: cat1.y + 10 * sin(a),
              //     vx: speed * 100 * bulletSpeed * cos(a),
              //     vy: speed * 100 * bulletSpeed * sin(a),
              //     radius: radius,
              //     damageRadius: radius,
              //     damage: damage,
              //     time: 0,
              //     timeMax: 3,
              //     timer: 0,
              //     period: 10,
              //     damageCount: 1,
              //     damageRepeat: 1,
              //     shadowSize: 1,
              //     visible: 1,
              //     gfx: CharItem.Knife,
              //   });
              // }
              for (let k = 0; k < slot.burstClip; ++k) {
                const ta =
                  atan2(enemy.y - cat1.y, enemy.x - cat1.x) +
                  0.1 * (k - slot.burstClip / 2);
                const baseSpeed = 50;
                projectiles.push({
                  type: EntityType.Projectile,
                  x: cat1.x + 5 * cos(ta),
                  y: cat1.y + 5 * sin(ta),
                  vx: baseSpeed * bulletSpeed * cos(ta),
                  vy: baseSpeed * bulletSpeed * sin(ta),
                  radius: radius,
                  damageRadius: radius,
                  damage: damage,
                  time: 0,
                  timeMax: 3,
                  timer: 0,
                  period: 0.5,
                  damageCount: 1,
                  damageRepeat: 1,
                  shadowSize: 1,
                  visible: 1,
                  gfx: CharItem.Flames,
                  collisionLayer: 0,
                });
              }
              playSound(Snd.Noise);
              slot.burstClip = 0;
              slot.burstTimer = 1;
            }
          }
        } else if (wpn === CharItem.TailKick) {
          if (slot.burstTimer < 0 && slot.burstClip) {
            const baseSpeed = 130 * bulletSpeed;
            const radius = 10 * modDamageArea;
            // nearestEnemies.pop();
            const dir =
              ((projectilesCount - slot.burstClip) % 2 ? 1 : -1) *
              sign(cat1.x1 - cat1.x0);
            projectiles.push({
              type: EntityType.Projectile,
              x: cat1.x + dir * radius,
              y: cat1.y,
              vx: cat1.vx + dir * baseSpeed,
              vy: cat1.vy,
              radius: radius,
              damageRadius: radius,
              damage: damage,
              time: 0,
              timeMax: 0.3,
              timer: 0,
              period: 0.5,
              damageCount: 1000,
              damageRepeat: 1000,
              shadowSize: 0,
              visible: 0,
              gfx: CharItem.TailKick,
              collisionLayer: 0,
            });
            playSound(Snd.ShootWind);
            --slot.burstClip;
            slot.burstTimer = 1;
            overlayParticles.push({
              type: ParticleType.Whip,
              x: cat1.x + 1.5 * dir * radius,
              y: cat1.y * WORLD_SCALE_Y,
              vx: cat1.vx + dir * baseSpeed,
              vy: cat1.vy + 0,
              r: 0,
              va: 1,
              t: 0,
              scale: radius / 3,
              sy: 1,
              maxTime: 0.5,
              color: "rgba(255,255,255,0.5)",
              damp: 2,
            });
          }
        } else if (wpn === CharItem.Sawblades) {
          if (slot.burstTimer < 0) {
            const bulletRadius = 4 * modDamageArea;
            const radius = 50 * modDamageArea;
            const n = slot.burstClip;
            let a = 0;
            const time = 1;
            const da = TAU / n;
            while (slot.burstClip > 0) {
              projectiles.push({
                type: EntityType.Projectile,
                x: cat1.x,
                y: cat1.y,
                vx: 0,
                vy: 0,
                radius: bulletRadius,
                damageRadius: bulletRadius,
                damage: damage,
                time: 0,
                timeMax: time / bulletSpeed,
                timer: 0,
                period: 0.1,
                damageCount: 10,
                damageRepeat: 999,
                shadowSize: 1,
                visible: 1,
                gfx: CharItem.Sawblades,
                followCat: {
                  radius: radius,
                  angle: a,
                  rotation: (bulletSpeed * TAU) / time,
                },
                collisionLayer: 0,
              });
              --slot.burstClip;
              a += da;
            }
            // playSound_noise();
            slot.burstTimer = 1;
          }
        }
      }
    }
  }
};

const win = () => {
  for (const enemy of enemies) {
    hitEnemy(enemy, enemy.hp);
  }
  winActive = 1;
  winTargetX = (visibleX0 + cat1.x0) / 2;
  winTargetY = cat1.y0 + 50;
  winTargetReached = 0;
  cat2.x0 = visibleX0;
  cat2.y0 = cat1.y0;
  stopMusic();
  resetLevelUps();
};

const handleCheats = () => {
  if (keyboardDown["Digit1"]) {
    //addPlayTime(60, 60 * 10);
  } else if (keyboardDown["Digit2"]) {
  } else if (keyboardDown["Digit3"]) {
    // for (const enemy of enemies) {
    //   hitEnemy(enemy, enemy.hp);
    // }
  } else if (keyboardDown["Digit4"]) {
    // addCatXp(getNextLevelXp() - xp);
    openLevelUp(1);
    // for (const drop of drops) {
    // drop.captured = 1;
    // }
  } else if (keyboardDown["Digit5"]) {
    resetLevel();
  } else if (keyboardDown["Digit6"]) {
    hitCat(100);
  } else if (keyboardDown["Digit7"]) {
    win();
  } else if (keyboardDown["Digit8"]) {
    for (let i = 0; i < 30; ++i) {
      levelUpDebug(+(i % 4 === 0));
    }
  } else if (keyboardDown["Digit0"]) {
  }
};

const drawShadows = (
  color = calcBaseColor(COLORS[ColorId.Ground], 0, 0.85)
) => {
  for (const obj of objectsToDraw) {
    if (obj.shadowSize) {
      fillWorldCircle(obj.x, obj.y, obj.radius * obj.shadowSize, color);
    }

    if (DEBUG_RADIUS) {
      ctx.beginPath();
      ctx.ellipse(
        obj.x,
        obj.y * WORLD_SCALE_Y,
        obj.radius,
        obj.radius * WORLD_SCALE_Y,
        0,
        0,
        TAU
      );
      ctx.strokeStyle = color_debug_red;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
};

const updateWinState = (cat = cat2, reachedPrev = winTargetReached) => {
  winTargetReached = +(
    hypot(winTargetY - cat.y0, winTargetX - cat.x0 - 10) < 2
  );
  if (winTargetReached != reachedPrev) {
    setTimeout(() => playSound(Snd.LevelUp1), 100);
    setTimeout(() => playSound(Snd.LevelUp2), 1300);
  }
  if (winTargetReached) {
    cat.wobble = 0.1;
    cat1.wobble = 0.1;
    winParticles += rawDeltaTime * 100;
    while (winParticles > 0) {
      groundParticles.push({
        x: lerp(visibleX0, visibleX1, random()),
        y: lerp(visibleY0 - 50, visibleY1, random()),
        r: random() * TAU,
        damp: 2,
        t: 0,
        va: 0,
        maxTime: 1 + 0.5 * random(),
        color: CSS_WHITE,
        type: ParticleType.Hearth,
        rs: 8 * (random() - 0.5),
        vx: 0,
        vy: random() * 100,
        scale: 1 + random(),
        sy: 1,
      });
      --winParticles;

      for (let i = 0; i < 16; ++i) {
        const t = (-winTime * 6) % PI;
        const x = (i & 1 ? -1 : 1) * 3 * 16 * sin(t) ** 3 + winTargetX;
        const y =
          -3 * (13 * cos(t) - 5 * cos(2 * t) - 2 * cos(3 * t) - cos(4 * t)) +
          winTargetY * WORLD_SCALE_Y;
        overlayParticles.push({
          x: x + 5 * (random() - 0.5),
          y: y + 5 * (random() - 0.5),
          r: 0,
          damp: 6,
          t: 0,
          va: 0,
          maxTime: random(),
          color: chance() ? "pink" : CSS_WHITE,
          type: ParticleType.Smoke,
          vx: 0,
          vy: -100 * random(),
          scale: random(),
          sy: 1,
        });
      }
    }
  }
};

const updateEnemies = () => {
  for (let i = 0; i < enemies.length; ++i) {
    const enemy = enemies[i];
    for (let j = i + 1; j < enemies.length; ++j) {
      const b = enemies[j];
      checkBodyCollision(enemy, b);
    }
    checkBodyCollision(enemy, cat1);
    updateHitCounter(enemy);

    if (enemy.hp) {
      let lx = cat1.x - enemy.x;
      let ly = cat1.y - enemy.y;
      const l = hypot(lx, ly);
      enemy.distanceToPlayer = l;
      enemy.attackTimer = max(0, enemy.attackTimer - dt * 2);
      if (cat1.hp > 0) {
        if (testVisible(enemy.x, enemy.y * WORLD_SCALE_Y, -enemy.radius * 4)) {
          nearestEnemies.push(enemy);
        }
        if (l <= cat1.hitRadius + enemy.radius) {
          if (enemy.damage > 0 && enemy.attackTimer <= 0) {
            enemy.attackTimer = 1;
            hitCat(enemy.damage);
          }
        }
      } else {
        lx = -0.5 * lx;
        ly = -0.5 * ly;
      }
      enemy.moveTime += dt * 8;
      enemy.kickBack = reach(enemy.kickBack, 0, dt * 2);
      if (enemy.kickBack > 0) {
        enemy.vx *= exp(-5 * dt);
        enemy.vy *= exp(-5 * dt);
      } else if (l > 0) {
        const moveF =
          enemy.enemyType === EnemyType.Frog ||
          enemy.enemyType === EnemyType.Snowman
            ? max(0, sin(enemy.moveTime))
            : 1;
        const speed = moveF * enemy.maxVelocity;
        enemy.vx = (speed * lx) / l;
        enemy.vy = (speed * ly) / l;
      }
    } else {
      enemy.vx *= exp(-5 * dt);
      enemy.vy *= exp(-5 * dt);
      enemy.deadTime += dt;
      enemy.shadowSize = 1 - min(enemy.deadTime / enemy.deadTimeMax, 1);
      if (enemy.deadTime >= enemy.deadTimeMax) {
        enemies.splice(i--, 1);
      }
    }
    enemy.x += enemy.vx * dt;
    enemy.y += enemy.vy * dt;
    if (testVisible(enemy.x, enemy.y * WORLD_SCALE_Y, enemy.radius * 4)) {
      objectsToDraw.push(enemy);
    }
  }
};

const updateProjectiles = () => {
  for (let i = 0; i < projectiles.length; ++i) {
    const proj = projectiles[i];
    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;

    if (proj.followCat) {
      proj.followCat.angle += dt * proj.followCat.rotation;
      proj.x = proj.followCat.radius * cos(proj.followCat.angle) + cat1.x;
      proj.y = proj.followCat.radius * sin(proj.followCat.angle) + cat1.y;
      proj.vx = cat1.vx;
      proj.vy = cat1.vy;
    } else if (proj.gfx === CharItem.Boomerang) {
      const dx = cat1.x - proj.x;
      const dy = cat1.y - proj.y;
      const l = hypot(dx, dy);
      proj.vx = exp(-dt) * (proj.vx + dt * ((200 * dx) / l));
      proj.vy = exp(-dt) * (proj.vy + dt * ((200 * dy) / l));
      if (l < cat1.radius + proj.radius) {
        proj.time = proj.timeMax;
      }
    } else if (proj.gfx === CharItem.Axe) {
      proj.vx *= exp(-dt);
      proj.vy *= exp(-dt);
      proj.vy += 200 * dt;
    }

    proj.time += dt;

    proj.timer -= dt;
    if (proj.timer <= 0) {
      let damaged = false;
      for (let j = 0; j < enemies.length; ++j) {
        const enemy = enemies[j];
        if (
          enemy.hp > 0 &&
          hypot(proj.x - enemy.x, proj.y - enemy.y) <=
            proj.damageRadius + enemy.radius
        ) {
          hitEnemy(enemy, proj.damage, proj.kickForce);
          if (!--proj.damageCount) {
            proj.time = proj.timeMax;
            break;
          }
          damaged = true;
        }
      }
      if (damaged) {
        --proj.damageRepeat;
        if (!proj.damageRepeat) {
          proj.time = proj.timeMax;
        }
        proj.timer = proj.period;
      }
    }
    if (proj.time >= proj.timeMax) {
      projectiles.splice(i--, 1);
    } else if (
      proj.visible &&
      testVisible(proj.x, proj.y * WORLD_SCALE_Y, proj.radius * 4)
    ) {
      objectsToDraw.push(proj);
    }
  }
};

initMain();
