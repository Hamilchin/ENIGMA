// Build labeled contact sheets from screening screenshots, batched into grids, so a
// reviewer (human or model) can classify many games per image. Requires ImageMagick.
// Usage: node corpus/montage.mjs [year] [perBatch=6]
import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const year = process.argv[2] || '2025';
const perBatch = Number(process.argv[3] || 6);
const screenDir = join(ROOT, 'runs', 'screening');
const games = JSON.parse(readFileSync(join(ROOT, 'corpus', 'build', `screening_${year}.json`), 'utf8')).games;

const sheets = [];
for (const g of games) {
  const dir = join(screenDir, g.id);
  const shots = ['ready.png', 'idle.png', 'interact.png'].map(s => join(dir, s)).filter(existsSync);
  if (!shots.length) continue;
  const sheet = join(dir, 'sheet.png');
  const label = `${g.rank}. ${g.id.replace(/^\d+-/, '')}  [${g.clock_compat}]`;
  execFileSync('magick', ['montage', ...shots, '-tile', `${shots.length}x1`, '-geometry',
    '200x200+2+2', '-background', '#222', '-fill', 'white', '-title', label, sheet]);
  sheets.push({ id: g.id, sheet });
}

mkdirSync(join(screenDir, '_batches'), { recursive: true });
let b = 0;
for (let i = 0; i < sheets.length; i += perBatch, b++) {
  const group = sheets.slice(i, i + perBatch);
  const out = join(screenDir, '_batches', `batch_${String(b).padStart(2, '0')}.png`);
  execFileSync('magick', ['montage', ...group.map(s => s.sheet), '-tile', '1x' + group.length,
    '-geometry', '+0+1', '-background', 'black', out]);
  console.log(`batch ${b}: ${group.map(s => s.id.replace(/^\d+-/, '')).join(', ')} -> ${out}`);
}
console.log(`\n[montage] ${sheets.length} sheets, ${b} batches -> runs/screening/_batches/`);
