// Acquire each game:
//   - canonical built bytes  -> games/<id>/dist/   (from play.js13kgames.com/<slug>.zip)
//   - source for analysis     -> games/<id>/src/    (shallow clone of github.com/js13kGames/<slug>)
//   - per-game record         -> games/<id>/meta.json
// Records commit_sha + build_status; logs failures. Idempotent (skips finished games).
//
// Usage: node corpus/acquire.mjs [year]
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, appendFileSync, readdirSync, statSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const exec = promisify(execFile);
const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const year = process.argv[2] || '2025';
const CONCURRENCY = 6;

// Find the shallowest index.html under a dir; return its path relative to that dir, or null.
function findEntry(dir, base = dir, depth = 0) {
  if (depth > 4 || !existsSync(dir)) return null;
  let subdirs = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name.toLowerCase() === 'index.html') return p.slice(base.length + 1);
    if (statSync(p).isDirectory()) subdirs.push(p);
  }
  for (const sd of subdirs) { const r = findEntry(sd, base, depth + 1); if (r) return r; }
  return null;
}

const { games } = JSON.parse(readFileSync(join(__dir, 'build', `scraped_${year}.json`), 'utf8'));
const logFile = join(__dir, `acquire_${year}.log`);
writeFileSync(logFile, `acquire ${year} :: ${games.length} games\n`);
const log = m => { console.log(m); appendFileSync(logFile, m + '\n'); };

async function acquire(g) {
  const dir = join(ROOT, g.local_path);
  const distDir = join(dir, 'dist');
  const srcDir = join(dir, 'src');
  const result = { id: g.id, dist: false, src: false, entry: null, commit_sha: null, build_status: 'prebuilt' };

  mkdirSync(dir, { recursive: true });

  // 1) built bytes — internal zip layout varies (index.html may be nested), so we record
  //    the entry path relative to dist/ rather than assuming dist/index.html.
  let entry = existsSync(distDir) ? findEntry(distDir) : null;
  if (!entry) {
    mkdirSync(distDir, { recursive: true });
    const zip = join(dir, '_g.zip');
    try {
      await exec('curl', ['-fsSL', g.play_zip, '-o', zip]);
      await exec('unzip', ['-o', '-q', zip, '-d', distDir]);
      rmSync(zip, { force: true });
      entry = findEntry(distDir);
    } catch (e) { result.build_status = 'zip-failed'; }
  }
  result.entry = entry;
  result.dist = !!entry;

  // preserve provenance across idempotent re-runs (we strip .git, so we can't re-derive it)
  const metaPath = join(dir, 'meta.json');
  if (existsSync(metaPath)) { try { result.commit_sha = JSON.parse(readFileSync(metaPath, 'utf8')).commit_sha ?? null; } catch {} }

  // 2) source (shallow clone of the org mirror)
  if (!existsSync(srcDir)) {
    try {
      // disable git-lfs filters: some repos LFS-track binary assets, and without git-lfs
      // installed the checkout aborts partway. Source code checks out fine; binaries (which
      // we don't need in src — they're in dist/) come down as small pointer files.
      await exec('git', ['-c', 'filter.lfs.smudge=cat', '-c', 'filter.lfs.process=', '-c', 'filter.lfs.required=false',
        'clone', '--depth', '1', `https://github.com/js13kGames/${g.slug}.git`, srcDir],
        { maxBuffer: 64 * 1024 * 1024 });
      const { stdout } = await exec('git', ['-C', srcDir, 'rev-parse', 'HEAD']);
      result.commit_sha = stdout.trim();
      rmSync(join(srcDir, '.git'), { recursive: true, force: true }); // vendored snapshot
      result.src = true;
    } catch (e) { log(`  ! clone failed ${g.slug}: ${String(e).split('\n')[0].slice(0, 100)}`); }
  } else result.src = true;
  // belt-and-suspenders: never leave a nested .git (it would make src look like a submodule)
  if (existsSync(join(srcDir, '.git'))) rmSync(join(srcDir, '.git'), { recursive: true, force: true });
  // drop a git-lfs .gitattributes so the vendored copy needs no git-lfs to check out/commit
  const ga = join(srcDir, '.gitattributes');
  if (existsSync(ga) && readFileSync(ga, 'utf8').includes('filter=lfs')) rmSync(ga, { force: true });

  // 3) per-game record
  writeFileSync(join(dir, 'meta.json'),
    JSON.stringify({ ...g, entry: result.entry || 'index.html', commit_sha: result.commit_sha, build_status: result.build_status }, null, 2));
  log(`  ${result.dist ? '✓' : '✗'}dist ${result.src ? '✓' : '✗'}src  ${g.id}`);
  return result;
}

// concurrency pool
const queue = [...games];
const results = [];
async function worker() { while (queue.length) results.push(await acquire(queue.shift())); }
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const okDist = results.filter(r => r.dist).length;
const okSrc = results.filter(r => r.src).length;
log(`\n[acquire] dist ${okDist}/${games.length}, src ${okSrc}/${games.length}`);
if (okDist < games.length) log(`  missing dist: ${results.filter(r => !r.dist).map(r => r.id).join(', ')}`);
if (okSrc < games.length) log(`  missing src:  ${results.filter(r => !r.src).map(r => r.id).join(', ')}`);
