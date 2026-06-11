// Episode runner — drives one agent through one game and logs a full trajectory.
// Stepped mode (primary): observe -> agent.act -> apply input -> advance k virtual frames.
// The agent only ever sees pixels (+ objective); the virtual clock makes the run
// independent of the agent's wall-clock think-time.
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Apply one agent action to the session, then advance `framesPerDecision` virtual frames.
async function applyAction(session, a, framesPerDecision) {
  switch (a.type) {
    case 'click': await session.click(a.x, a.y); break;
    case 'move': await session.move(a.x, a.y); break;
    case 'drag': await session.drag(a.x1, a.y1, a.x2, a.y2); break;
    case 'key': {
      const hold = Math.max(1, a.hold || 1);
      await session.keyDown(a.key); await session.step(hold); await session.keyUp(a.key);
      await session.step(Math.max(0, framesPerDecision - hold));
      return;
    }
    case 'key_down': await session.keyDown(a.key); break;
    case 'key_up': await session.keyUp(a.key); break;
    case 'wait': default: break;
  }
  await session.step(framesPerDecision);
}

export async function runEpisode(harness, rec, agent, {
  seed = 0, framesPerDecision = 6, decisionBudget = 60, frameBudget = Infinity,
  objective = null, outDir = null, saveFrames = true,
} = {}) {
  const session = await harness.open(rec, { seed });
  if (agent.reset) agent.reset();
  if (outDir) mkdirSync(join(outDir, 'frames'), { recursive: true });

  const traj = {
    id: rec.id, agent: agent.name, seed, regime: 'stepped',
    framesPerDecision, decisionBudget, objective, actions: [],
  };

  let framesUsed = 0;
  for (let t = 0; t < decisionBudget && framesUsed < frameBudget; t++) {
    const screenshot = await session.screenshot();
    if (saveFrames && outDir) writeFileSync(join(outDir, 'frames', `f${String(t).padStart(4, '0')}.png`), screenshot);
    const obs = { screenshot, objective, step: t, history: traj.actions };
    const action = await agent.act(obs);
    await applyAction(session, action, framesPerDecision);
    framesUsed = await session.frames();
    traj.actions.push({ t, action, frames: framesUsed });
  }

  traj.finalFrame = await session.frameHash();
  traj.framesUsed = framesUsed;
  if (outDir) {
    await session.screenshot(join(outDir, 'final.png'));
    writeFileSync(join(outDir, 'trajectory.json'), JSON.stringify(traj, null, 2));
  }
  await session.close();
  return traj;
}
