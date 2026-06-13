// Merge scraped metadata + screening into the corpus. games_<year>.json is the single
// source of truth: hand-authored `tags` already in it are preserved across re-runs, so
// the auto-scraped fields refresh without clobbering your labels. Writes games_<year>.json.
// Usage: node corpus/finalize.mjs [year]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const year = process.argv[2] || '2025';
const read = f => JSON.parse(readFileSync(join(ROOT, 'corpus', f), 'utf8'));

const meta = read(`build/scraped_${year}.json`).games;
const screen = Object.fromEntries(read(`build/screening_${year}.json`).games.map(g => [g.id, g]));

// preserve hand-authored tags already present in the corpus file
const dest = join(ROOT, 'corpus', `games_${year}.json`);
const prevTags = existsSync(dest)
  ? Object.fromEntries(read(`games_${year}.json`).games.map(g => [g.id, g.tags || []]))
  : {};

// Games that can't run under the frozen clock are excluded. 'nondeterministic' games still
// render and play (the hash just isn't bit-reproducible) -> included, flagged not-reproducible.
const HARD_EXCLUDE_CLOCK = new Set(['timeout', 'error', 'no-shim', 'broken', 'inert']);

const final = meta.map(g => {
  const s = screen[g.id] || {};
  const reasons = [];
  if (HARD_EXCLUDE_CLOCK.has(s.clock_compat)) reasons.push(`clock:${s.clock_compat}`);
  return {
    id: g.id, slug: g.slug, title: g.title, year: g.year,
    rank: g.rank, overall_score: g.overall_score, criteria: g.criteria,
    author: g.author, devices: g.devices,
    description: g.description, controls: g.controls, desc_full: g.desc_full,
    github_url: g.github_url, commit_sha: undefined, play_url: g.play_url, play_zip: g.play_zip,
    local_path: g.local_path, entry: undefined,
    tags: prevTags[g.id] || [],          // interaction-time (real-time/turn-based) lives in here too
    screening: {
      clock_compat: s.clock_compat ?? null,
      reproducible: s.clock_compat === 'ok',
      idle_advances: s.runtime?.idleAdvances ?? null,
      interaction_advances: s.runtime?.interactionAdvances ?? null,
      static: s.static ?? null,
    },
    included: reasons.length === 0,
    exclude_reason: reasons.length ? reasons.join(',') : null,
  };
});

// fill commit_sha + entry from per-game meta.json
for (const f of final) {
  const mp = join(ROOT, f.local_path, 'meta.json');
  if (existsSync(mp)) { const m = JSON.parse(readFileSync(mp, 'utf8')); f.commit_sha = m.commit_sha ?? null; f.entry = m.entry ?? 'index.html'; }
}

const included = final.filter(f => f.included).length;
writeFileSync(dest, JSON.stringify({ year: Number(year), total: final.length, included, games: final }, null, 2));
console.log(`[finalize] ${final.length} games, ${included} included -> ${dest}`);
const untagged = final.filter(f => !f.tags.length).map(f => f.id);
if (untagged.length) console.log(`[finalize] untagged (${untagged.length}): ${untagged.slice(0, 8).join(', ')}`);
