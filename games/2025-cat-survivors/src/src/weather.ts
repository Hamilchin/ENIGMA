import { visibleX0, visibleX1, visibleY0, visibleY1 } from "./camera";
import { CSS_WHITE, updateColors } from "./colors";
import { weatherParticles } from "./entities";
import { random } from "./math";
import { ParticleType } from "./particle_types";
import { playTime } from "./stats";
import { dt } from "./system";
import { lerp, smoothstep } from "./utils";

let nightParticlesTimer = 0;
let snowParticlesTimer = 0;
let rainParticlesTimer = 0;
let night = 0;
let snowing = 0;
let raining = 0;
export const updateWeatherColors = () => {
  raining =
    smoothstep(2 * 60, 2 * 60 + 5, playTime) -
    smoothstep(4 * 60 - 5, 4 * 60, playTime);
  snowing =
    smoothstep(6 * 60, 6 * 60 + 5, playTime) -
    smoothstep(7 * 60 - 5, 7 * 60, playTime);
  night =
    smoothstep(8 * 60, 8 * 60 + 5, playTime) -
    smoothstep(9 * 60 - 5, 9 * 60, playTime);
  updateColors(night, snowing, raining);
};

export const updateWeatherParticles = () => {
  nightParticlesTimer += dt * 200 * night;
  while (nightParticlesTimer > 0) {
    weatherParticles.push({
      type: ParticleType.Smoke,
      x: lerp(visibleX0 - 20, visibleX1 + 40, random()),
      y: lerp(visibleY0 - 20, visibleY1 + 40, random()),
      vx: 50 * (random() - 0.5),
      vy: 50 * (random() - 0.5),
      r: 0,
      va: 1,
      t: 0,
      maxTime: 1 + random(),
      color: "rgba(255,255,100," + random() + ")",
      damp: 2,
      scale: random() / 8,
      sy: 1,
    });
    --nightParticlesTimer;
  }
  snowParticlesTimer += dt * 1000 * snowing;
  while (snowParticlesTimer > 0) {
    weatherParticles.push({
      type: ParticleType.Smoke,
      x: lerp(visibleX0 - 20, visibleX1 + 40, random()),
      y: lerp(visibleY0 - 50, visibleY1, random()),
      vx: 100 * (random() - 0.5),
      vy: 100 + 100 * random(),
      r: 0,
      va: 1,
      t: 0,
      maxTime: 1 + random(),
      color: CSS_WHITE,
      damp: 2,
      scale: random() / 8,
      sy: 1,
    });
    --snowParticlesTimer;
  }

  rainParticlesTimer += dt * 300 * raining;
  while (rainParticlesTimer > 0) {
    const big = random();
    weatherParticles.push({
      type: ParticleType.Line,
      x: lerp(visibleX0 - 20, visibleX1 + 40, random()),
      y: lerp(visibleY0 - 50, visibleY1, random()),
      vx: 75,
      vy: 200,
      r: 0,
      va: 1,
      t: 0,
      maxTime: 1 + big,
      color: "rgba(100,255,255," + random() / 4 + ")",
      damp: 2 * random(),
      scale: big / 4,
      sy: 1,
    });
    --rainParticlesTimer;
  }
};
