// Batch eval: run agents over games, judge each episode, print a table + write summary.
// Usage: node env/eval.mjs [agents=random,claude] [decisions=15] [seed=0] [framesPerDecision=6] [gameIds csv]
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Harness } from './harness.mjs';
import { runEpisode } from './episode.mjs';
import { RandomAgent, NoopAgent } from '../agents/random.mjs';
import { LLMAgent } from '../agents/llm.mjs';
import { judge, sampleKeyframes } from '../judge/judge.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const PROVIDER = { claude: 'anthropic', gpt: 'openai', openai: 'openai', gemini: 'google', google: 'google', grok: 'xai', xai: 'xai' };
const makeAgent = (name, seed) => name === 'noop' ? new NoopAgent({ seed })
  : name === 'random' ? new RandomAgent({ seed })
  : PROVIDER[name] ? new LLMAgent({ provider: PROVIDER[name], name, seed })
  : (() => { throw new Error(`unknown agent: ${name}`); })();

const agents = (process.argv[2] || 'random,claude').split(',');
const decisions = Number(process.argv[3] || 15);
const seed = Number(process.argv[4] || 0);
const framesPerDecision = Number(process.argv[5] || process.env.ENIGMA_FRAMES_PER_DECISION || 6); // frame-skip per decision
const corpus = JSON.parse(readFileSync(join(ROOT, 'corpus', 'games_2025.json'), 'utf8')).games;
const DEFAULT = ['2025-clawstrike', '2025-catculus', '2025-snapcat', '2025-witchcat', '2025-black-cat-squadron'];
const gameIds = process.argv[6] ? process.argv[6].split(',') : DEFAULT;
const games = gameIds.map(id => corpus.find(g => g.id === id || g.slug === id)).filter(Boolean);

const outRoot = join(ROOT, 'runs', 'eval');
mkdirSync(outRoot, { recursive: true });
const h = await Harness.launch({ headless: true });
const rows = [];
for (const a of agents) {
  for (const rec of games) {
    const outDir = join(outRoot, `${rec.id}__${a}__s${seed}__f${framesPerDecision}`);
    const row = { agent: a, game: rec.id.replace(/^\d+-/, ''), beaten: null, progress: null, err: null };
    try {
      const trajPath = join(outDir, 'trajectory.json');   // reuse a completed episode (don't re-pay)
      const traj = existsSync(trajPath) ? JSON.parse(readFileSync(trajPath, 'utf8'))
        : await runEpisode(h, rec, makeAgent(a, seed), {
            seed, decisionBudget: decisions, framesPerDecision, objective: rec.description || rec.title, outDir });
      row.decisions = traj.actions.length;
      const fd = join(outDir, 'frames');
      let frames = existsSync(fd) ? readdirSync(fd).filter(f => f.endsWith('.png')).sort().map(f => readFileSync(join(fd, f))) : [];
      if (existsSync(join(outDir, 'final.png'))) frames.push(readFileSync(join(outDir, 'final.png')));
      const v = await judge({ objective: rec.description || rec.title, frames: sampleKeyframes(frames, 8) });
      row.beaten = v.beaten; row.progress = v.progress;
    } catch (e) { row.err = String(e.message || e).slice(0, 90); }
    rows.push(row);
    console.log(`${a.padEnd(8)} ${row.game.padEnd(22)} beaten=${row.beaten} progress=${row.progress}${row.err ? '  ERR:' + row.err : ''}`);
  }
}
await h.close();
writeFileSync(join(outRoot, 'summary.json'), JSON.stringify({ agents, decisions, seed, framesPerDecision, games: gameIds, rows }, null, 2));

console.log('\n=== summary (mean progress per agent) ===');
for (const a of agents) {
  const rs = rows.filter(r => r.agent === a && r.progress != null);
  const meanP = rs.length ? (rs.reduce((s, r) => s + r.progress, 0) / rs.length).toFixed(2) : 'n/a';
  const beat = rows.filter(r => r.agent === a && r.beaten).length;
  console.log(`  ${a.padEnd(8)} mean_progress=${meanP}  beaten=${beat}/${rows.filter(r => r.agent === a).length}`);
}
console.log(`\n[eval] summary -> runs/eval/summary.json`);
