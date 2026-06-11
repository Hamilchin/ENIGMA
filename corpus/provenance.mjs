// Backfill commit-SHA provenance into each game's meta.json from the org mirror's HEAD,
// so games/<id>/src can be re-cloned to the exact bytes even though it's gitignored.
// (The org mirrors are frozen post-jam, so HEAD is stable.) Uses GITHUB_TOKEN if present.
// Usage: node corpus/provenance.mjs [year]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const year = process.argv[2] || '2025';
const token = process.env.GITHUB_TOKEN;
const headers = { 'accept': 'application/vnd.github+json', ...(token ? { authorization: `Bearer ${token}` } : {}) };

const games = JSON.parse(readFileSync(join(__dir, 'build', `scraped_${year}.json`), 'utf8')).games;

async function sha(slug) {
  const r = await fetch(`https://api.github.com/repos/js13kGames/${slug}/commits/HEAD`, { headers });
  if (!r.ok) return null;
  return (await r.json()).sha || null;
}

const force = process.argv.includes('--force');
let ok = 0, skipped = 0;
for (const g of games) {
  const mp = join(ROOT, g.local_path, 'meta.json');
  if (!existsSync(mp)) continue;
  const m = JSON.parse(readFileSync(mp, 'utf8'));
  if (m.commit_sha && !force) { skipped++; continue; } // already have it (skip to save rate limit)
  const s = await sha(g.slug);
  if (!s) { console.log(`  ! no sha ${g.slug} (rate-limited? set GITHUB_TOKEN)`); continue; }
  m.commit_sha = s; writeFileSync(mp, JSON.stringify(m, null, 2)); ok++;
}
console.log(`[provenance] backfilled ${ok}, already had ${skipped}, of ${games.length} games`);
