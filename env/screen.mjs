// Screen every game and gather evidence for classification.
// Static scan (priors only) + runtime probes via the harness:
//   - readiness + shim install
//   - clock_compat: delay-invariance (same schedule, with/without real think-time)
//   - idle probe: does the game advance on its own (no input)?  -> realtime vs static prior
//   - interaction probe: send sensible inputs to get past menus; does it respond?
//   - broken detection: never renders / loop stalls and ignores input
// Captures screenshots to runs/screening/<id>/ and writes corpus/screening_<year>.json.
//
// Usage: node env/screen.mjs [year] [...ids]
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Harness } from './harness.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const year = process.argv[2] || '2025';
const filterIds = process.argv.slice(3);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const GAME_TIMEOUT_MS = 60000; // a pathological game must not hang the whole run
function withTimeout(promise, ms) {
  let to;
  const timer = new Promise((_, rej) => { to = setTimeout(() => rej(new Error('TIMEOUT')), ms); });
  return Promise.race([promise, timer]).finally(() => clearTimeout(to));
}

const corpus = JSON.parse(readFileSync(join(ROOT, 'corpus', 'build', `scraped_${year}.json`), 'utf8'));
let games = corpus.games;
if (filterIds.length) games = games.filter(g => filterIds.includes(g.id) || filterIds.includes(g.slug));

// ---- static source scan (priors only) ----
function readAll(dir, exts = ['.html', '.js', '.mjs', '.ts', '.css'], depth = 0, acc = []) {
  if (depth > 4 || !existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const p = join(dir, name);
    let st;
    try { st = statSync(p); } catch { continue; } // skip broken symlinks etc.
    if (st.isDirectory()) readAll(p, exts, depth + 1, acc);
    else if (exts.includes(name.slice(name.lastIndexOf('.')).toLowerCase()) && st.size < 2_000_000) {
      try { acc.push(readFileSync(p, 'utf8')); } catch {}
    }
  }
  return acc;
}
function staticScan(gameDir) {
  const code = readAll(gameDir).join('\n');
  const has = re => re.test(code);
  return {
    webgl: has(/getContext\(\s*['"]webgl2?['"]/i) || has(/\bTHREE\b|\bregl\b|gl_FragColor|createShader/),
    canvas2d: has(/getContext\(\s*['"]2d['"]/i),
    pixelated_prior: has(/imageSmoothingEnabled\s*=\s*false/i) || has(/image-rendering\s*:\s*(pixelated|crisp-edges)/i),
    audio_prior: has(/AudioContext|webkitAudioContext/),
    audio_currenttime: has(/\.currentTime/) && has(/AudioContext|webkitAudioContext/),
    worker_prior: has(/new\s+Worker\s*\(/),
    raf_loop: has(/requestAnimationFrame/),
    interval_loop: has(/setInterval\s*\(/),
    bytes: code.length,
  };
}

// ---- runtime probes ----
const STEP = 10, IDLE_FRAMES = 240; // idle probe ~4s of game time

async function clockCompat(h, rec) {
  // identical schedule, with/without real delay -> delay-invariance
  const sched = async (delay) => {
    const s = await h.open(rec, { seed: 0 });
    const shimOK = s.shimOK; const pending = await s.pending();
    await s.step(1); const init = await s.frameHash();
    for (let i = 0; i < 6; i++) { await s.step(STEP); if (delay) await sleep(delay); }
    const fin = await s.frameHash(); await s.close();
    return { shimOK, pending, init, fin };
  };
  const a = await sched(0);
  const b = await sched(250);
  return { shimOK: a.shimOK, pending: a.pending, deterministic: a.fin === b.fin,
           advancedUnderStep: a.fin !== a.init };
}

const ACTIONS = [ // a generic "sensible input" sequence to get past menus into gameplay
  { key: 'Enter' }, { key: 'Space' }, { click: [360, 360] },
  { key: 'ArrowRight' }, { key: 'ArrowUp' }, { key: 'ArrowLeft' }, { key: 'ArrowDown' },
  { key: 'KeyW' }, { key: 'KeyZ' }, { key: 'KeyX' }, { click: [360, 360] },
];
async function probe(h, rec, shotDir) {
  const s = await h.open(rec, { seed: 0 });
  const ready = await s.frameHash();
  await s.screenshot(join(shotDir, 'ready.png'));

  // idle probe: advance time, no input
  await s.step(IDLE_FRAMES);
  const idleEnd = await s.frameHash();
  await s.screenshot(join(shotDir, 'idle.png'));
  const idleAdvances = idleEnd !== ready;

  // interaction probe: (1) click real start/play buttons found via the DOM, then
  // (2) a generic key/click sequence — to get past menus into actual gameplay.
  const beforeInteract = idleEnd;
  try {
    const targets = await s.clickTargets();
    for (const t of targets) { await s.click(t.x, t.y); await s.step(15); }
  } catch {}
  for (const a of ACTIONS) {
    if (a.key) { await s.keyDown(a.key); await s.step(3); await s.keyUp(a.key); }
    if (a.click) { await s.click(a.click[0], a.click[1]); }
    await s.step(12);
  }
  const afterInteract = await s.frameHash();
  await s.screenshot(join(shotDir, 'interact.png'));
  const interactionAdvances = afterInteract !== beforeInteract;
  const pendingEnd = await s.pending();
  const errors = (s.errors || []).slice(0, 5);
  await s.close();
  return { ready, idleEnd, idleAdvances, afterInteract, interactionAdvances, pendingEnd, errors };
}

const h = await Harness.launch({ headless: true });
const out = [];
let i = 0;
for (const rec of games) {
  i++;
  const shotDir = join(ROOT, 'runs', 'screening', rec.id);
  mkdirSync(shotDir, { recursive: true });
  const rec2 = { id: rec.id, slug: rec.slug, rank: rec.rank };
  try { rec2.static = staticScan(join(ROOT, rec.local_path, 'src')); }
  catch (e) { rec2.static = { scan_error: String(e).slice(0, 80) }; }
  try {
    const { cc, pr } = await withTimeout((async () => {
      const cc = await clockCompat(h, rec);
      const pr = await probe(h, rec, shotDir);
      return { cc, pr };
    })(), GAME_TIMEOUT_MS);
    rec2.runtime = { ...cc, idleAdvances: pr.idleAdvances, interactionAdvances: pr.interactionAdvances, pendingEnd: pr.pendingEnd, errors: pr.errors };
    const inert = !cc.advancedUnderStep && !pr.idleAdvances && !pr.interactionAdvances && cc.pending === 0;
    rec2.clock_compat = !cc.shimOK ? 'no-shim'
      : !cc.deterministic ? 'nondeterministic'
      : inert ? (pr.errors.length ? 'broken' : 'inert')
      : 'ok';
    rec2.shots = ['ready.png', 'idle.png', 'interact.png'];
  } catch (e) {
    const msg = String(e);
    rec2.error = msg.split('\n')[0].slice(0, 160);
    rec2.clock_compat = msg.includes('TIMEOUT') ? 'timeout' : 'error';
  } finally {
    // free any contexts left open by a hung/aborted probe so the next game starts clean
    for (const c of h.browser.contexts()) { await c.close().catch(() => {}); }
  }
  out.push(rec2);
  console.log(`[${i}/${games.length}] ${rec2.clock_compat.padEnd(16)} idle:${rec2.runtime?.idleAdvances ? 'Y' : '·'} act:${rec2.runtime?.interactionAdvances ? 'Y' : '·'} ${rec.id}${rec2.error ? '  ERR:' + rec2.error : ''}`);
}
await h.close();

const dest = join(ROOT, 'corpus', 'build', `screening_${year}.json`);
let finalGames = out;
// when re-screening a subset, merge into the existing file instead of overwriting it
if (filterIds.length && existsSync(dest)) {
  const prev = JSON.parse(readFileSync(dest, 'utf8')).games;
  const updated = Object.fromEntries(out.map(g => [g.id, g]));
  finalGames = prev.map(g => updated[g.id] || g);
  for (const g of out) if (!finalGames.find(x => x.id === g.id)) finalGames.push(g);
}
writeFileSync(dest, JSON.stringify({ year: Number(year), count: finalGames.length, games: finalGames }, null, 2));
const summ = out.reduce((m, r) => (m[r.clock_compat] = (m[r.clock_compat] || 0) + 1, m), {});
console.log(`\n[screen] ${out.length} games -> ${dest}`);
console.log('[screen] clock_compat:', JSON.stringify(summ));
