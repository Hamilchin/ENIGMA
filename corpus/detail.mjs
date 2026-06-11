// Stage B — scrape per-game detail pages, in rank order, excluding ineligible
// categories (online/webxr/decentralized/unfinished), until we have the target count
// of eligible games (top 33% by rank). Writes corpus/games_<year>.json + appends drops.
//
// Usage: node corpus/detail.mjs [year] [topFraction]   (defaults 2025, 0.33)
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const year = process.argv[2] || '2025';
const topFraction = Number(process.argv[3] || 0.33);
const EXCLUDE = new Set(['online', 'webxr', 'decentralized', 'unfinished']);
const CONCURRENCY = 4;

const entriesFile = join(__dir, 'build', `entries_${year}.json`);
if (!existsSync(entriesFile)) { console.error(`run harvest first: missing ${entriesFile}`); process.exit(1); }
const { total, entries } = JSON.parse(readFileSync(entriesFile, 'utf8'));
const target = Math.ceil(topFraction * total);
console.log(`[detail] year ${year}: ${total} entries, target ${target} eligible (top ${topFraction * 100}%)`);

mkdirSync(join(__dir, 'build'), { recursive: true });
const dropsFile = join(__dir, 'build', `drops_${year}.csv`);
writeFileSync(dropsFile, 'slug,rank,stage,reason\n');

const browser = await chromium.launch();

// Extract one detail page's fields. Returns a record or {error}.
async function scrapeDetail(ctx, entry) {
  const page = await ctx.newPage();
  try {
    await page.goto(entry.game_url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForSelector('#m-g-v-meta', { timeout: 20000 });
    // The SPA renders the meta shell first, then fills desc/scores — wait for content
    // to actually populate so we don't capture a half-rendered page.
    await page.waitForFunction(() => {
      const desc = document.querySelector('#m-g-v-desc');
      const scores = document.querySelector('#m-g-v-scores');
      return desc && desc.textContent.trim().length > 0 &&
             scores && /Overall score/i.test(scores.textContent);
    }, { timeout: 15000 }).catch(() => {}); // proceed even if one is genuinely absent
    const data = await page.evaluate(() => {
      const txt = el => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
      const meta = {};
      for (const div of document.querySelectorAll('#m-g-v-meta > div')) {
        const dt = txt(div.querySelector('dt')).toLowerCase();
        const dd = div.querySelector('dd');
        if (dt) meta[dt] = { text: txt(dd), html: dd ? dd.innerHTML : '' };
      }
      const sourceA = [...document.querySelectorAll('#m-g-v-meta a')]
        .find(a => /github\.com\/js13kGames/i.test(a.href));
      const desc = txt(document.querySelector('#m-g-v-desc'));
      // scores: collect small leaf texts to avoid concatenation ambiguity
      const scoreItems = [...document.querySelectorAll('#m-g-v-scores *')]
        .filter(e => e.children.length <= 1 && e.textContent.trim().length > 0 && e.textContent.trim().length < 50)
        .map(e => e.textContent.replace(/\s+/g, ' ').trim());
      return { meta, sourceHref: sourceA ? sourceA.href : null, desc, scoreItems,
               title: txt(document.querySelector('h1')) };
    });
    await page.close();
    return data;
  } catch (e) {
    await page.close().catch(() => {});
    return { error: String(e).slice(0, 120) };
  }
}

function parseScores(items) {
  // Flatten; scores are always 1-2 decimal places, which lets us avoid the
  // "4.24" + "16." concatenation trap (\d{1,2} is greedy but capped at 2).
  const joined = items.join(' ').replace(/\s+/g, ' ');
  // Scores may be integers ("23") or 1-2 decimals ("23.91"); the bounded {1,2} avoids
  // the "4.24" + "16." concatenation trap while allowing a missing decimal.
  const N = '(\\d+(?:\\.\\d{1,2})?)';
  const overall = joined.match(new RegExp(`(\\d+)\\.\\s*Overall score\\s+${N}\\s*\\/\\s*${N}`, 'i'));
  const criteria = {};
  const re = new RegExp(`(\\d+)\\.\\s*(Theme|Innovation|Gameplay|Graphics|Audio|Controls)\\s+${N}\\s*\\/\\s*${N}`, 'gi');
  let m;
  while ((m = re.exec(joined))) {
    criteria[m[2].toLowerCase()] = { rank: +m[1], score: +m[3], top: +m[4] };
  }
  return {
    overall_score: overall ? +overall[2] : null,
    overall_rank: overall ? +overall[1] : null,
    criteria,
  };
}

function splitDescControls(desc) {
  const i = desc.search(/\bControls\b/);
  if (i < 0) return { description: desc, controls: '' };
  return { description: desc.slice(0, i).trim(), controls: desc.slice(i).replace(/^Controls\s*/i, '').trim() };
}

// Process entries in rank order, in batches, stopping once we have `target` eligible.
const eligible = [];
let cursor = 0;
const contexts = await Promise.all(Array.from({ length: CONCURRENCY }, () => browser.newContext()));

while (eligible.length < target && cursor < entries.length) {
  const batch = entries.slice(cursor, cursor + CONCURRENCY);
  cursor += batch.length;
  const results = await Promise.all(batch.map((e, i) => scrapeDetail(contexts[i], e).then(r => ({ e, r }))));
  for (const { e, r } of results) {
    if (r.error) { appendFileSync(dropsFile, `${e.slug},${e.rank},detail,error:${r.error.replace(/,/g, ';')}\n`); continue; }
    const devicesRaw = (r.meta.categories?.text || '').split(',').map(s => s.trim()).filter(Boolean);
    const devicesLower = devicesRaw.map(s => s.toLowerCase());
    const excludedBy = devicesLower.find(d => EXCLUDE.has(d));
    if (excludedBy) { appendFileSync(dropsFile, `${e.slug},${e.rank},detail,category:${excludedBy}\n`); continue; }
    const scores = parseScores(r.scoreItems);
    const { description, controls } = splitDescControls(r.desc);
    eligible.push({
      id: `${year}-${e.slug}`, slug: e.slug, title: r.title || e.title, year: Number(year),
      rank: e.rank, overall_score: scores.overall_score, criteria: scores.criteria,
      author: e.author,
      devices: devicesRaw,
      desc_full: r.desc, description, controls,
      github_url: r.sourceHref || e.github_url,
      play_url: e.game_url, play_zip: e.play_zip, thumb_url: e.thumb_url,
      local_path: `games/${year}-${e.slug}`,
    });
    if (eligible.length >= target) break;
  }
  console.log(`[detail] scanned ${cursor}/${entries.length}, eligible ${eligible.length}/${target}`);
}

// Repair pass: a truly empty desc element OR missing score ⇒ a half-rendered page slipped
// through under concurrency. (An empty *description* with non-empty desc_full is fine —
// some games' desc is controls-only.) Re-scrape these sequentially in a fresh context.
const broken = eligible.filter(g => !g.desc_full || g.overall_score == null);
if (broken.length) {
  console.log(`[detail] repair pass for ${broken.length}: ${broken.map(g => g.slug).join(', ')}`);
  const ctx = await browser.newContext();
  for (const g of broken) {
    const r = await scrapeDetail(ctx, { game_url: g.play_url, slug: g.slug, title: g.title, github_url: g.github_url });
    if (!r.error) {
      const { description, controls } = splitDescControls(r.desc);
      const scores = parseScores(r.scoreItems);
      if (r.desc) { g.desc_full = r.desc; g.description = description; g.controls = controls; }
      if (scores.overall_score != null) { g.overall_score = scores.overall_score; g.criteria = scores.criteria; }
      if (r.sourceHref) g.github_url = r.sourceHref;
    }
  }
}

await browser.close();

const stillBroken = eligible.filter(g => !g.desc_full || g.overall_score == null);
if (stillBroken.length) console.warn(`[detail] WARNING still incomplete: ${stillBroken.map(g => g.slug).join(', ')}`);

const out = {
  year: Number(year), total_entries: total, target_eligible: target,
  collected: eligible.length, scanned: cursor,
  games: eligible,
};
const dest = join(__dir, 'build', `scraped_${year}.json`);
writeFileSync(dest, JSON.stringify(out, null, 2));
console.log(`[detail] wrote ${eligible.length} games -> ${dest}`);
console.log(`[detail] drops logged -> ${dropsFile}`);
