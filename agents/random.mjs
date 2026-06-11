// Baseline agents: the performance FLOOR. A real CUA agent must beat these.
import { Agent, VIEWPORT } from './base.mjs';

const KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'KeyZ', 'KeyX', 'Enter'];

// Deterministic PRNG so baseline runs are reproducible per seed.
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class RandomAgent extends Agent {
  constructor(opts = {}) { super({ name: 'random', ...opts }); this.rng = mulberry32(opts.seed ?? 0); }
  reset() { this.rng = mulberry32(this.opts.seed ?? 0); }
  async act() {
    const r = this.rng();
    if (r < 0.5) {
      const key = KEYS[(this.rng() * KEYS.length) | 0];
      return { type: 'key', key, hold: 1 + ((this.rng() * 8) | 0) };
    } else if (r < 0.8) {
      return { type: 'click', x: (this.rng() * VIEWPORT.width) | 0, y: (this.rng() * VIEWPORT.height) | 0 };
    }
    return { type: 'wait' };
  }
}

// A no-op agent: pure floor (does nothing) — measures how far a game advances on its own.
export class NoopAgent extends Agent {
  constructor(opts = {}) { super({ name: 'noop', ...opts }); }
  async act() { return { type: 'wait' }; }
}
