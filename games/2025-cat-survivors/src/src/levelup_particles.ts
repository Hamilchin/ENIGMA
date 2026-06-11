import { fillCircle } from "./draw";
import { exp, PI, random, sin } from "./math";
import { type Particle } from "./particle_types";
import { ctx, gameHeight, gameWidth, rawDeltaTime } from "./system";

let gen = 0;
let lines = 0;
let list: Particle[] = [];

export const resetLevelUpParticles = () => {
  gen = 0;
  lines = 0;
  list = [];
};

export const generateLevelUpParticles = (newItemPerc: number) => {
  gen += newItemPerc <= 0 ? rawDeltaTime * 300 : 0;
  while (gen > 0) {
    list.push({
      x: random() * gameWidth,
      y: random() * gameHeight - 50,
      r: 0,
      damp: 3,
      t: 0,
      va: 0,
      maxTime: 1 + random(),
      color: "hsl(" + ((random() * 360) | 0) + ",100%,70%)",
      type: 0,
      vx: 100 * (random() - 0.5),
      vy: 100 + random() * 100,
      scale: random() * 4,
      sy: 1,
    });
    --gen;
  }
  lines += newItemPerc * rawDeltaTime * 300;
  while (lines-- > 0) {
    list.push({
      x: random() * gameWidth,
      y: -50,
      r: 0,
      damp: 0,
      t: 0,
      va: 0,
      maxTime: 1 + random(),
      color: "rgba(255,255," + random() * 255 + "," + random() / 4 + ")",
      type: 1,
      vx: 5 * (random() - 0.5),
      vy: 0,
      scale: 10,
      sy: 1,
    });
    --lines;
  }
};

export const doLevelUpParticles = () => {
  for (let i = 0; i < list.length; ++i) {
    const p = list[i];
    p.t += rawDeltaTime;
    if (p.t >= p.maxTime) {
      list.splice(i--, 1);
    } else {
      const t = p.t / p.maxTime;
      p.vx *= exp(-rawDeltaTime * p.damp);
      p.vy *= exp(-rawDeltaTime * p.damp);
      p.x += p.vx * rawDeltaTime;
      p.y += p.vy * rawDeltaTime;
      if (p.type) {
        ctx.fillStyle = p.color;
        const w = 1 + p.scale! * sin(t * t * PI);
        ctx.fillRect(p.x - w / 2, p.y, w, gameHeight * 2);
      } else {
        fillCircle(
          p.x,
          p.y,
          0.001 + p.scale! * sin(t * PI) * (0.7 + 0.3 * sin(t * 32)),
          p.color
        );
      }
    }
  }
};
