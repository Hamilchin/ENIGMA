export const enum ParticleType {
  Paw = 0,
  RoundSpark = 1,
  Smoke = 2,
  Whip = 3,
  Hearth = 4,
  Line = 5,
}

// export const makeParticle = (attrs: Partial<Particle>): Particle =>
//   ({
//     color: 0,
//     va: 0,
//     t: 0,
//     scale: 1,
//     sy: 1,
//     ...attrs,
//   } as Particle);

export interface Particle {
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  rs?: number;
  va: number;
  t: number;
  damp: number;
  maxTime: number;
  color: string;
  scale: number;
  sy: number;
}

export interface TextParticle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  r: number;
  t: number;
  s: number;
  text: any;
  color: string;
  scale: number;
}
