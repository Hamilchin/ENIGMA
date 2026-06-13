# ENIGMA

**Evaluating Novel Interactive Generality in Machine Agents** — a difficult, diverse,
large-scale computer-use benchmark over small browser games (real-time *and* puzzle), at a raw
screenshots-in / mouse-and-keyboard-out interface, with a controllable time horizon so it
measures agent **competence**, not inference speed.

Substrate: [js13kGames](https://js13kgames.com) entries. The 2025 set (theme "black cat")
is included; the same pipeline produces any year.

## Corpus (2025)

| | |
|---|---|
| Entries harvested (ranked) | **197** |
| Top-33% eligible, offline-only | **66** (online/webxr/decentralized excluded) |
| Downloaded (built + source) | **66 / 66** |
| Classified & tagged | **66 / 66** |
| **Included (stepped mode)** | **66 / 66** |
| Bit-reproducible under frozen clock | **64** |
| Interaction split | 50 real-time · 14 turn-based |
| Input | 39 keyboard · 31 mouse |
| Rendering | 12 3D · 32 pixelated |

Master corpus: **`corpus/games_2025.json`** (one record per game: metadata, scores,
tags, screening flags). Games live under `games/<id>/{dist,src}`.

## How it works

Agent sees **pixels only**; the virtual clock + ground-truth channel run out-of-band.

- **Frozen virtual clock** (`env/clock/`, via `@sinonjs/fake-timers`): timers/rAF/Date/
  performance are faked and advanced only by `window.__clock.step(frames)`. The game
  freezes between agent decisions, so a slow and a fast model face the *same* game. Audio
  is muted and its clock frozen (real AudioContext stays suspended).
- **Stepped loop**: observe → act → advance *k* frames. The budget is measured in game
  frames, so inference speed doesn't affect the score.

## Pipeline (resumable; intermediates land in gitignored `corpus/build/`)

```
corpus/harvest.mjs    scrape ranked entry list            -> build/entries_<y>.json
corpus/detail.mjs     per-game metadata + category filter -> build/scraped_<y>.json (+drops)
corpus/acquire.mjs    built zip -> dist/, source -> src/  -> games/<id>/, meta.json
env/screen.mjs        static scan + runtime probes        -> build/screening_<y>.json (+shots)
corpus/finalize.mjs   merge metadata + screening          -> games_<y>.json  (committed)
```

**`games_<y>.json` is the single committed source of truth** — including the hand-authored
`tags` (genre/rendering/input/interaction-time), which `finalize` preserves across re-runs.
Everything else is a regenerable build artifact.

Data sources: ranked list + metadata scraped via Playwright
(the site is a SPA); source from the uniform org mirror `github.com/js13kGames/<slug>`;
canonical built bytes from `play.js13kgames.com/<slug>.zip` (no per-repo build needed).

## Test infra

```
env/harness.mjs      Harness/GameSession: launch, step, screenshot, input, frameHash
env/serve.mjs        offline static server over games/
env/clock-spike.mjs  determinism check: step is invariant to wall-clock think-time
env/episode.mjs      runEpisode: observe->act->step loop + full trajectory logging
agents/              act(obs)->action interface; random + noop baselines
judge/judge.mjs      frozen VLM-as-judge (game description + keyframes -> verdict)
```

## Run it

```bash
npm install && npx playwright install chromium   # postinstall builds the in-page shim

# eval loop demo (uses the committed corpus — no rebuild needed)
node env/run-episode.mjs 2025-clawstrike random 30 0
node judge/run-judge.mjs runs/episodes/2025-clawstrike__random__s0   # needs ANTHROPIC_API_KEY

# rebuild the corpus from scratch (e.g. for a new year), then hand-add `tags` to the records
node corpus/harvest.mjs 2026 && node corpus/detail.mjs 2026 && node corpus/acquire.mjs 2026
node env/screen.mjs 2026 && node corpus/finalize.mjs 2026
```

Secrets go in `.env` (gitignored). API keys are read by the orchestrator only — never
injected into the browser the agent drives.

## Layout

```
corpus/   pipeline scripts + games_<y>.json (the corpus) + build/ (gitignored)
games/    frozen game bytes: <id>/dist (built) + <id>/src (source) + meta.json
env/      harness, static server, virtual clock (clock/), screening, episode runner
agents/   agent interface + baselines
judge/    VLM-as-judge + CLI
runs/     screening screenshots, episode trajectories (gitignored)
```

## Caveats
- 2 games (`celestial-paws`, `kittens-united`) are not bit-reproducible under the frozen
  clock — their nondeterminism comes from the GPU / async ordering, not the clock. They are
  included but scored by the VLM judge rather than deterministic reward
  (`screening.reproducible=false`).
