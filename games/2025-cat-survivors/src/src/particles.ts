import { testVisible } from "./camera";
import { ctx, dt } from "./system";
import { atan2, exp, hypot, PI, sin, TAU } from "./math";
import { clamp, easeQuadOut } from "./utils";
import { ParticleType, type Particle } from "./particle_types";
import { drawIcon } from "./bubble";

export const updateAndDrawParticles = (list: Particle[], deltaTime = dt) => {
  ctx.lineWidth = 1;
  for (let i = 0; i < list.length; ++i) {
    const p = list[i];
    p.t += deltaTime;
    if (p.t >= p.maxTime) {
      list.splice(i--, 1);
    } else {
      p.vx *= exp(-deltaTime * p.damp);
      p.vy *= exp(-deltaTime * p.damp);
      p.x += p.vx * deltaTime;
      p.y += p.vy * deltaTime;
      if (p.rs) p.r += p.rs * deltaTime;
      if (testVisible(p.x, p.y, 10)) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.strokeStyle = ctx.fillStyle = p.color;
        drawers[p.type](p, p.r + p.va * atan2(p.vy, p.vx), p.t / p.maxTime);
        ctx.restore();
      }
    }
  }
};

const drawers = [
  // drawPaw
  (p: Particle, r: number, t: number) => {
    ctx.rotate(r + sin(t * PI));
    ctx.translate(0, 10 * sin(-PI / 2 + t * PI));
    ctx.scale(1, 15 * sin(t * t * PI));
    ctx.beginPath();
    ctx.moveTo(0, -1);
    ctx.lineTo(0, 0);
    ctx.moveTo(-2, -1);
    ctx.lineTo(-2, 0);
    ctx.moveTo(2, -1);
    ctx.lineTo(2, 0);
    ctx.stroke();
  },
  // drawSpark
  (p: Particle, r: number, t: number, s = p.scale * (1 - t ** 2)) => {
    ctx.rotate(r);
    ctx.scale(s, s * 0.5);
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, TAU);
    ctx.fill();
  },
  // drawSmoke
  (p: Particle, r: number, t: number, s = p.scale * (1 - t ** 2)) => {
    ctx.rotate(r);
    ctx.scale(s, s * p.sy);
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, TAU);
    ctx.fill();
  },
  // drawWhip
  (p: Particle, r: number, t: number) => {
    const s = p.scale * (1 - t ** 2);
    ctx.rotate(r);
    ctx.scale(s, s * 0.5);
    ctx.beginPath();
    if (t < 0.5) {
      ctx.arc(0, 0, 4, 0, TAU, true);
      ctx.clip();
      ctx.arc(-3 + 3 * t, 0, 8 * easeQuadOut(t), 0, TAU, false);
      ctx.fill();
    }
  },
  // heart
  (p: Particle, r: number, t: number, s = p.scale * sin(t * PI) ** 0.5) => {
    ctx.rotate(r);
    ctx.scale(s, s);
    drawIcon(0, 0, "❤️", 8);
  },
  // line
  (p: Particle, r: number, t: number, s = p.scale * clamp(3 * sin(t * PI))) => {
    ctx.rotate(r);
    ctx.scale((s * hypot(p.vy, p.vx)) / 20, s / 2);
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, TAU);
    ctx.fill();
  },
];
