// Stage H finalize — merge metadata (Stage B) + screening (Stage E/F) + classification
// (tags authored from the evidence) into the complete corpus and write games_<year>.json.
// Computes `included` + `exclude_reason`.
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
const tagsFile = join(ROOT, 'corpus', `tags_${year}.json`);
const tags = existsSync(tagsFile) ? read(`tags_${year}.json`) : {};

// Truly unusable in the harness -> excluded. 'nondeterministic' games still render and
// play (the hash just isn't bit-reproducible for particle-heavy real-time games); they
// are INCLUDED but flagged not-reproducible (use VLM-judge scoring, not deterministic reward).
const HARD_EXCLUDE_CLOCK = new Set(['timeout', 'error', 'no-shim', 'broken', 'inert']);

const final = meta.map(g => {
  const s = screen[g.id] || {};
  const t = tags[g.id] || {};
  const reasons = [];
  // 'timeout' games render fine without the shim — they're real-time-ONLY (frozen-clock
  // incompatible), not broken. Flag them rather than calling them broken.
  const realtime_only = s.clock_compat === 'timeout';
  if (HARD_EXCLUDE_CLOCK.has(s.clock_compat)) reasons.push(realtime_only ? 'stepped-incompatible(real-time-only)' : `clock:${s.clock_compat}`);
  if (t.audio_role === 'rhythm-timed') reasons.push('audio:rhythm-timed');
  if (t.broken) reasons.push('broken');
  const reproducible = s.clock_compat === 'ok';
  return {
    id: g.id, slug: g.slug, title: g.title, year: g.year,
    rank: g.rank, overall_score: g.overall_score, criteria: g.criteria,
    author: g.author, devices: g.devices,
    description: g.description, controls: g.controls, desc_full: g.desc_full,
    github_url: g.github_url, commit_sha: undefined, play_url: g.play_url, play_zip: g.play_zip,
    local_path: g.local_path, entry: undefined,
    // classification (from evidence)
    tags: t.tags || [],
    audio_role: t.audio_role ?? null,
    interaction_time: t.interaction_time ?? null,
    success_type: t.success_type ?? null,
    objective: t.objective ?? g.title,
    win_signal: t.win_signal ?? null,
    progress_signal: t.progress_signal ?? null,
    // screening (from harness)
    screening: {
      clock_compat: s.clock_compat ?? null,
      reproducible,
      idle_advances: s.runtime?.idleAdvances ?? null,
      interaction_advances: s.runtime?.interactionAdvances ?? null,
      static: s.static ?? null,
    },
    realtime_only,
    included: reasons.length === 0 && Object.keys(t).length > 0,
    exclude_reason: reasons.length ? reasons.join(',') : null,
  };
});

// fill commit_sha + entry from per-game meta.json (Stage D)
for (const f of final) {
  const mp = join(ROOT, f.local_path, 'meta.json');
  if (existsSync(mp)) { const m = JSON.parse(readFileSync(mp, 'utf8')); f.commit_sha = m.commit_sha ?? null; f.entry = m.entry ?? 'index.html'; }
}

const included = final.filter(f => f.included).length;
const out = { year: Number(year), total: final.length, included, games: final };
const dest = join(ROOT, 'corpus', `games_${year}.json`);
writeFileSync(dest, JSON.stringify(out, null, 2));
console.log(`[finalize] ${final.length} games, ${included} included -> ${dest}`);
const byReason = final.filter(f => f.exclude_reason).reduce((m, f) => (m[f.exclude_reason] = (m[f.exclude_reason] || 0) + 1, m), {});
console.log('[finalize] exclusions:', JSON.stringify(byReason));
const untagged = final.filter(f => !Object.keys(tags[f.id] || {}).length).map(f => f.id);
if (untagged.length) console.log(`[finalize] NOT YET TAGGED (${untagged.length}):`, untagged.slice(0, 8).join(', '), untagged.length > 8 ? '…' : '');
