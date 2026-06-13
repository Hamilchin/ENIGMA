// CLI: run a baseline agent on a game and log the trajectory. Demonstrates the eval loop.
// Usage: node env/run-episode.mjs <game-id> [agent=random] [decisions=40] [seed=0]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { Harness } from './harness.mjs';
import { runEpisode } from './episode.mjs';
import { RandomAgent, NoopAgent } from '../agents/random.mjs';
import { LLMAgent } from '../agents/llm.mjs';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, '..');
const [id, agentName = 'random', decisions = '40', seed = '0', frames] = process.argv.slice(2);
if (!id) { console.error('usage: node env/run-episode.mjs <game-id> [agent] [decisions] [seed] [framesPerDecision]'); process.exit(1); }
const framesPerDecision = Number(frames ?? process.env.ENIGMA_FRAMES_PER_DECISION ?? 6);

const corpus = JSON.parse(readFileSync(join(ROOT, 'corpus', 'games_2025.json'), 'utf8'));
const rec = corpus.games.find(g => g.id === id || g.slug === id);
if (!rec) { console.error(`no game ${id}`); process.exit(1); }

// agent name -> implementation. CUA providers route to the unified LLMAgent.
const PROVIDER = { claude: 'anthropic', gpt: 'openai', openai: 'openai', gemini: 'google', google: 'google', grok: 'xai', xai: 'xai' };
const agent = agentName === 'noop' ? new NoopAgent({ seed: +seed })
  : agentName === 'random' ? new RandomAgent({ seed: +seed })
  : PROVIDER[agentName] ? new LLMAgent({ provider: PROVIDER[agentName], name: agentName, seed: +seed })
  : (() => { console.error(`unknown agent: ${agentName}`); process.exit(1); })();
const outDir = join(ROOT, 'runs', 'episodes', `${rec.id}__${agent.name}__s${seed}`);

const h = await Harness.launch({ headless: true });
console.log(`[episode] ${rec.id} | agent=${agent.name} | decisions=${decisions} | seed=${seed} | frames/decision=${framesPerDecision}`);
const traj = await runEpisode(h, rec, agent, {
  seed: +seed, decisionBudget: +decisions, framesPerDecision,
  objective: rec.description || rec.title, outDir,
});
await h.close();
console.log(`[episode] done: ${traj.actions.length} decisions, ${traj.framesUsed} frames, finalFrame=${traj.finalFrame}`);
console.log(`[episode] trajectory -> ${outDir}/trajectory.json (+ frames/, final.png)`);
