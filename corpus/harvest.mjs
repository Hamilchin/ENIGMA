// Stage A — harvest the full ranked entry list for a year.
// Output: corpus/entries_<year>.json  (DOM order on the default "Overall" sort = rank)
//
// Usage: node corpus/harvest.mjs [year]   (default 2025)
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const year = process.argv[2] || '2025';
const SITE = 'https://js13kgames.com';

const browser = await chromium.launch();
const page = await browser.newPage();
const url = `${SITE}/${year}/games`;
console.log(`[harvest] loading ${url}`);
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });

// Wait until the card list is fully rendered (expect ~150-280 cards for recent years).
await page.waitForFunction(
  () => document.querySelectorAll('main a[href^="games/"]').length > 50,
  { timeout: 30000 }
);
await page.waitForTimeout(1500);

const entries = await page.evaluate(() => {
  const cards = [...document.querySelectorAll('main a[href^="games/"]')];
  return cards.map((a, i) => {
    const slug = a.getAttribute('href').replace(/^games\//, '');
    const title = a.querySelector('h3')?.textContent.trim() || '';
    const author = a.querySelector('address')?.textContent.trim() || '';
    const thumb = a.querySelector('img')?.getAttribute('src') || '';
    return { rank: i + 1, slug, title, author,
             thumb_url: thumb.startsWith('//') ? 'https:' + thumb : thumb };
  });
});

await browser.close();

if (entries.length < 50) { console.error(`[harvest] only ${entries.length} cards — render likely incomplete`); process.exit(1); }

const out = {
  year: Number(year),
  total: entries.length,
  harvested_at_utc: new Date().toISOString().slice(0, 10), // date only (deterministic-ish)
  site_url: url,
  entries: entries.map(e => ({
    ...e,
    game_url: `${SITE}/${year}/games/${e.slug}`,
    github_url: `https://github.com/js13kGames/${e.slug}`,
    play_zip: `https://play.js13kgames.com/${e.slug}.zip`,
  })),
};
mkdirSync(join(__dir, 'build'), { recursive: true });
const dest = join(__dir, 'build', `entries_${year}.json`);
writeFileSync(dest, JSON.stringify(out, null, 2));
console.log(`[harvest] ${entries.length} entries -> ${dest}`);
console.log(`[harvest] top 5: ${entries.slice(0, 5).map(e => `${e.rank}.${e.slug}`).join('  ')}`);
