// ENIGMA browser harness — the test infrastructure.
// Launches a game in pinned Chromium with the in-page shim (seeded RNG, audio mute,
// frozen virtual clock). The agent's interface is strictly pixels + input; ground-truth
// / clock control happens out-of-band via the page's __clock global.
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { serve, gameURL } from './serve.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dir, '..');

// The zip's index.html may be nested (dist/, compo/, build/, ...). The canonical entry
// path is recorded in the game's meta.json; resolve it so we never 404.
function resolveEntry(rec) {
  if (rec.entry) return rec.entry;
  const mp = join(PROJECT_ROOT, rec.local_path || `games/${rec.id}`, 'meta.json');
  if (existsSync(mp)) { try { return JSON.parse(readFileSync(mp, 'utf8')).entry || 'index.html'; } catch {} }
  return 'index.html';
}
const SHIM = readFileSync(join(__dir, 'clock', 'shim.bundle.js'), 'utf8');
const DEFAULT_VIEWPORT = { width: 720, height: 720 };
const sleep = ms => new Promise(r => setTimeout(r, ms));

export class Harness {
  constructor({ browser, server, port }) { this.browser = browser; this.server = server; this.port = port; }

  static async launch({ headless = true, viewport = DEFAULT_VIEWPORT } = {}) {
    const [{ server, port }, browser] = await Promise.all([
      serve(),
      chromium.launch({ headless }),
    ]);
    const h = new Harness({ browser, server, port });
    h.viewport = viewport;
    return h;
  }

  // Open one game in a fresh context. The shim is injected before any game code runs.
  async open(rec, { seed = 0, fps = 60, warmup = true } = {}) {
    const context = await this.browser.newContext({ viewport: this.viewport });
    await context.addInitScript(({ seed, fps }) => { window.__SEED = seed; window.__FPS = fps; }, { seed, fps });
    await context.addInitScript({ content: SHIM });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror:' + String(e).slice(0, 160)));
    page.on('console', m => { if (m.type() === 'error') errors.push('console:' + m.text().slice(0, 160)); });
    const url = gameURL(this.port, { ...rec, entry: resolveEntry(rec) });
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    // confirm the shim installed
    const ok = await page.evaluate(() => !!window.__clock && window.__clock.frozen === true);
    const session = new GameSession({ context, page, rec, url, seed, shimOK: ok });
    session.errors = errors;
    if (warmup) await session.waitReady();  // let async init/asset-decode settle (clock is frozen)
    return session;
  }

  async close() { await this.browser.close(); this.server.close(); }
}

export class GameSession {
  constructor({ context, page, rec, url, seed, shimOK }) {
    Object.assign(this, { context, page, rec, url, seed, shimOK });
  }

  // Advance virtual game time by N frames (60fps default). Returns total frames stepped.
  step(frames = 1) { return this.page.evaluate(n => window.__clock.step(n), frames); }
  now() { return this.page.evaluate(() => window.__clock.now()); }
  frames() { return this.page.evaluate(() => window.__clock.frames()); }
  pending() { return this.page.evaluate(() => window.__clock.pending()); }

  // Readiness gate: with the clock frozen, the frame only changes as async init/asset
  // decode completes. Wait until it stabilizes (or cap) so the deterministic stepped
  // region starts from a settled state — prevents asset-load races from looking like
  // clock nondeterminism.
  async waitReady({ minMs = 400, stepMs = 150, capMs = 2500 } = {}) {
    await sleep(minMs);
    let prev = await this.frameHash(), stable = 0;
    const t0 = Date.now();
    while (Date.now() - t0 < capMs) {
      await sleep(stepMs);
      const h = await this.frameHash();
      if (h === prev) { if (++stable >= 2) break; } else stable = 0;
      prev = h;
    }
    return this;
  }

  // Observation: a PNG screenshot buffer (optionally written to disk).
  async screenshot(path) { return this.page.screenshot(path ? { path } : undefined); }

  // A cheap perceptual fingerprint of the current frame (mean + simple hash of pixels),
  // used to test determinism without saving images.
  async frameHash() {
    const png = await this.page.screenshot();
    let h = 2166136261 >>> 0;
    for (let i = 0; i < png.length; i += 257) { h ^= png[i]; h = Math.imul(h, 16777619) >>> 0; }
    return `${png.length}:${h.toString(16)}`;
  }

  // Input primitives (computer-use interface).
  async click(x, y) { await this.page.mouse.click(x, y); }
  async move(x, y) { await this.page.mouse.move(x, y); }
  async drag(x1, y1, x2, y2) {
    await this.page.mouse.move(x1, y1); await this.page.mouse.down();
    await this.page.mouse.move(x2, y2); await this.page.mouse.up();
  }
  async keyDown(k) { await this.page.keyboard.down(k); }
  async keyUp(k) { await this.page.keyboard.up(k); }
  async key(k) { await this.page.keyboard.press(k); }

  // Out-of-band state read (NOT exposed to agents — for screening / ground truth only).
  async evalInPage(fn, ...args) { return this.page.evaluate(fn, ...args); }

  // Centers of likely "start/play" clickable elements — SCREENING ONLY (uses the DOM to
  // find buttons; agents never get this). Lets the interaction probe press real buttons.
  async clickTargets() {
    return this.page.evaluate(() => {
      const sel = 'button, a[href], canvas, [role=button], [onclick], input[type=button], input[type=submit]';
      const out = [];
      for (const e of document.querySelectorAll(sel)) {
        const r = e.getBoundingClientRect();
        if (r.width > 4 && r.height > 4 && r.left >= 0 && r.top >= 0 && r.left < innerWidth && r.top < innerHeight)
          out.push({ x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), tag: e.tagName });
      }
      return out.slice(0, 10);
    });
  }

  async close() { await this.context.close(); }
}
