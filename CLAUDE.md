# ENIGMA — guide for working in this codebase

A computer-use benchmark: AI agents play small browser games (js13kGames) through a raw
**screenshots-in / mouse+keyboard-out** interface. The trick is a **virtual clock** that
freezes the game between an agent's decisions, so a slow model isn't punished for thinking.

Two halves: a **corpus** (the games + their metadata) and a **harness** (runs a game,
freezes/steps time, feeds an agent, logs the result).

## Layout
```
corpus/   build the game corpus. Committed: games_<y>.json (the corpus), tags_<y>.json
          (hand-authored labels). build/ holds regenerable intermediates (gitignored).
games/    <id>/dist = built game bytes (served to play); <id>/src = source; meta.json.
env/      harness.mjs (GameSession), serve.mjs (static server), clock/ (the time shim),
          screen.mjs (corpus screening), episode.mjs (the eval loop).
agents/   act(obs)->action interface + random/noop baselines. Real CUAs plug in here.
judge/    frozen VLM-as-judge: objective + win_signal + keyframes -> {beaten, progress}.
runs/     screenshots + trajectories (gitignored).
```

## The virtual clock — the core idea, and where it's subtle
`env/clock/shim-entry.mjs` is injected into every game before its code runs. It fakes all
JS time sources (`setTimeout`/`setInterval`/`rAF`/`Date`/`performance`) via
`@sinonjs/fake-timers`, exposing `window.__clock.step(frames)` — the game advances *only*
when we say so. The harness reads pixels and sends input around this.

A browser has **several independent clocks**, so the shim also has to:
- **seed** `Math.random` *and* `crypto.getRandomValues` (determinism),
- **seek CSS/Web-Animations** to virtual time each step (they run on the compositor's real
  clock otherwise),
- **clamp `setInterval(…,0)` to 1ms** (else a 0-delay background-work loop — e.g. music
  synthesis — spins forever in one tick).

What it still can't control: GPU float and async/microtask *ordering*. 2 of 66 games
(`celestial-paws`, `kittens-united`) are nondeterministic for those reasons →
`screening.reproducible=false`, judge-scored instead of deterministic-reward.

**If you edit `shim-entry.mjs`, rebuild it:** `npm run build` (also runs on `npm install`).
`env/clock/shim.bundle.js` is generated — don't edit it by hand.

## Pipeline (only run to rebuild/extend the corpus)
`harvest` (rank list) → `detail` (scrape + filter) → `acquire` (download games) →
`screen` (run each, tag clock-compat + screenshots) → `author_tags.py` (human labels) →
`finalize` (merge → `corpus/games_<y>.json`). Intermediates go to `corpus/build/`.
`screen.mjs` accepts game ids to re-screen a subset (merges into the existing file).

## Conventions / gotchas
- ESM everywhere (`"type": "module"`); run scripts with `node path/to/x.mjs [year]`.
- The shell here is **zsh**: it does NOT word-split unquoted `$vars` and errors on
  unmatched globs — use arrays and quote globs in Bash commands.
- Don't commit `games/<id>/src` deletions casually — `src` is kept for re-screening; only
  `dist`+`meta.json` are strictly needed to *run*.
- The judge needs `ANTHROPIC_API_KEY` in `.env`. Keys never enter the browser context.
- Validate the clock after shim changes: `npm run spike` (must stay 5/5).
