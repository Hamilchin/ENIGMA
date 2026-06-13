// Clock determinism check. For each test game, verify:
//   1. shim installed (window.__clock.frozen)
//   2. virtual time advances on step() and the game loop is alive (pending() > 0)
//   3. frame advances (animation progresses) across steps
//   4. DELAY-INVARIANCE (the property the eval needs): with an IDENTICAL stepping
//      schedule (the eval always advances a fixed k frames per decision), injecting real
//      wall-clock think-time between steps must not change the outcome. Equality proves
//      the game is driven purely by the frozen virtual clock — no dt blow-up, no real-time
//      leak. (We do NOT compare one-shot vs chunked: tick granularity legitimately differs
//      and the eval never steps one-shot.)
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Harness } from './harness.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const games = JSON.parse(readFileSync(join(__dir, '..', 'corpus', 'games_2025.json'), 'utf8')).games;

const TEST_IDS = (process.argv.slice(2).length ? process.argv.slice(2)
  : ['2025-clawstrike', '2025-cat-survivors', '2025-witchcat', '2025-triska-the-ninja-cat', '2025-black-cat-squadron']);
const outDir = join(__dir, '..', 'runs', 'spike');
mkdirSync(outDir, { recursive: true });

const h = await Harness.launch({ headless: true });
const results = [];

for (const id of TEST_IDS) {
  const rec = games.find(g => g.id === id);
  if (!rec) { console.log(`! no record ${id}`); continue; }
  const r = { id, shimOK: false, pending0: 0, advanced: false, deterministic: false, error: null };
  try {
    // Identical stepping schedule for both runs: 1 + 6x10 frames. Run A no delay, Run B
    // with real wall-clock sleeps between every step. Same schedule => must match.
    const schedule = async (s, delay) => {
      await s.step(1);
      const init = await s.frameHash();
      for (let i = 0; i < 6; i++) { await s.step(10); if (delay) await sleep(delay); }
      return { init, final: await s.frameHash() };
    };

    const s1 = await h.open(rec, { seed: 0 });
    r.shimOK = s1.shimOK;
    r.pending0 = await s1.pending();
    const a = await schedule(s1, 0);
    await s1.screenshot(join(outDir, `${id}.png`));
    await s1.close();

    const s2 = await h.open(rec, { seed: 0 });
    const b = await schedule(s2, 250);        // same schedule, real think-time between steps
    await s2.close();

    r.advanced = (a.final !== a.init);
    r.deterministic = (a.final === b.final);  // delay-invariance
    r.detail = { aInit: a.init, aFinal: a.final, bFinal: b.final };
  } catch (e) { r.error = String(e).split('\n')[0].slice(0, 160); }
  results.push(r);
  console.log(`${r.deterministic ? '✓' : '✗'}det ${r.advanced ? '✓' : '·'}adv ${r.shimOK ? '✓' : '✗'}shim  pending=${r.pending0}  ${id}${r.error ? '  ERR:' + r.error : ''}`);
}

await h.close();

const pass = results.filter(r => r.shimOK && r.deterministic).length;
console.log(`\n[spike] ${pass}/${results.length} pass (shim installed + deterministic under wall-clock delay)`);
console.log(`[spike] screenshots -> runs/spike/`);
