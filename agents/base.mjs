// Agent interface for ENIGMA. An agent observes pixels (+ optional objective string)
// and emits one action per decision. The harness/episode runner translates actions to
// input. Keep the action space identical across all agents for apples-to-apples eval.
//
//   act(obs) -> action
//   obs    = { screenshot: Buffer(PNG), objective: string|null, step: int, history: [...] }
//   action = one of:
//     { type: 'click',   x, y }
//     { type: 'move',    x, y }
//     { type: 'drag',    x1, y1, x2, y2 }
//     { type: 'key',     key, hold }   // press & release, holding for `hold` frames
//     { type: 'key_down', key }
//     { type: 'key_up',   key }
//     { type: 'wait' }
//
// `key` uses Playwright key names (e.g. 'ArrowLeft', 'Space', 'KeyZ', 'Enter').

export class Agent {
  constructor(opts = {}) { this.opts = opts; this.name = opts.name || this.constructor.name; }
  // eslint-disable-next-line no-unused-vars
  async act(obs) { throw new Error('Agent.act not implemented'); }
  reset() {}
}

export const VIEWPORT = { width: 720, height: 720 };
