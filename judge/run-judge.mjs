// Judge a logged trajectory: sample keyframes, pass game objective + win_signal to the
// frozen VLM judge, print the verdict. Requires ANTHROPIC_API_KEY.
// Usage: node judge/run-judge.mjs <runs/episodes/DIR>
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { judge, sampleKeyframes } from './judge.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const dir = process.argv[2];
if (!dir || !existsSync(dir)) { console.error('usage: node judge/run-judge.mjs <episode-dir>'); process.exit(1); }

const traj = JSON.parse(readFileSync(join(dir, 'trajectory.json'), 'utf8'));
const corpus = JSON.parse(readFileSync(join(ROOT, 'corpus', 'games_2025.json'), 'utf8'));
const rec = corpus.games.find(g => g.id === traj.id) || {};

// load ordered frame buffers, then add the final frame
const framesDir = join(dir, 'frames');
const frameFiles = existsSync(framesDir) ? readdirSync(framesDir).filter(f => f.endsWith('.png')).sort() : [];
let frames = frameFiles.map(f => readFileSync(join(framesDir, f)));
if (existsSync(join(dir, 'final.png'))) frames.push(readFileSync(join(dir, 'final.png')));
frames = sampleKeyframes(frames, 8);

console.log(`[judge] ${traj.id} | agent=${traj.agent} | ${frames.length} keyframes`);
console.log(`[judge] objective: ${rec.objective || traj.objective}`);
console.log(`[judge] win_signal: ${rec.win_signal || '(none)'}`);
try {
  const v = await judge({ objective: rec.objective || traj.objective, win_signal: rec.win_signal, frames });
  console.log(`[judge] VERDICT: beaten=${v.beaten} progress=${v.progress} confidence=${v.confidence}`);
  console.log(`[judge] rationale: ${v.rationale}`);
  console.log(`[judge] model: ${v.model}`);
} catch (e) {
  console.error(`[judge] ${e.message}`);
  console.error('[judge] (set ANTHROPIC_API_KEY in .env to enable scoring)');
}
