# ENIGMA

**Evaluating Novel Interactive Generality in Machine Agents** — a difficult, diverse,
large-scale computer-use benchmark over small browser games (real-time *and* puzzle), at a raw
screenshots-in / mouse-and-keyboard-out interface, with a controllable time horizon so it
measures agent **competence**, not inference speed.

Substrate: [js13kGames](https://js13kgames.com) entries. **2025 pilot is built** (theme:
"black cat"); the pipeline generalizes to all years.

## Status — 2025 pilot

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
tags, screening flags, success annotations). Games live under `games/<id>/{dist,src}`.

## How it works

Agent sees **pixels only**; the virtual clock + ground-truth channel run out-of-band.

- **Frozen virtual clock** (`env/clock/`, via `@sinonjs/fake-timers`): timers/rAF/Date/
  performance are faked and advanced only by `window.__clock.step(frames)`. The game
  freezes between agent decisions, so a slow and a fast model face the *same* game. Audio
  is muted and the audio clock frozen (real AudioContext kept suspended → no crashes).
- **Stepped mode** (primary): observe → act → advance *k* frames. Budget is game-frames.
- **Real-time mode** (secondary): no freeze; the stepped−realtime gap = inference-speed tax.

## Pipeline (resumable; intermediates land in gitignored `corpus/build/`)

```
corpus/harvest.mjs    scrape ranked entry list            -> build/entries_<y>.json
corpus/detail.mjs     per-game metadata + category filter -> build/scraped_<y>.json (+drops)
corpus/acquire.mjs    built zip -> dist/, source -> src/  -> games/<id>/, meta.json
env/screen.mjs        static scan + runtime probes        -> build/screening_<y>.json (+shots)
corpus/author_tags.py classification from evidence        -> tags_<y>.json   (committed)
corpus/finalize.mjs   merge everything                    -> games_<y>.json  (committed)
```

Only **`games_<y>.json`** (merged corpus) and **`tags_<y>.json`** (hand-authored labels)
are committed; the rest are regenerable build artifacts. `corpus/montage.mjs` (review
contact sheets) and `corpus/provenance.mjs` (backfill commit SHAs) are optional helpers.

Data sources (see `corpus/DATA_SOURCES.md`): ranked list + metadata scraped via Playwright
(the site is a SPA); source from the uniform org mirror `github.com/js13kGames/<slug>`;
canonical built bytes from `play.js13kgames.com/<slug>.zip` (no per-repo build needed).

## Test infra

```
env/harness.mjs      Harness/GameSession: launch, step, screenshot, input, frameHash
env/serve.mjs        offline static server over games/
env/clock-spike.mjs  determinism/de-risk test (5/5 pass)
env/episode.mjs      runEpisode: observe->act->step loop + full trajectory logging
agents/              act(obs)->action interface; random + noop baselines
judge/judge.mjs      frozen VLM-as-judge (objective + win_signal + keyframes -> verdict)
```

## Run it

```bash
npm install && npx playwright install chromium   # postinstall builds the in-page shim

# eval loop demo (uses the committed corpus — no rebuild needed)
node env/run-episode.mjs 2025-clawstrike random 30 0
node judge/run-judge.mjs runs/episodes/2025-clawstrike__random__s0   # needs ANTHROPIC_API_KEY

# rebuild the corpus from scratch (e.g. for a new year)
node corpus/harvest.mjs 2026 && node corpus/detail.mjs 2026 && node corpus/acquire.mjs 2026
node env/screen.mjs 2026 && python3 corpus/author_tags.py && node corpus/finalize.mjs 2026
```

Secrets go in `.env` (gitignored). API keys are read by the orchestrator only — never
injected into the browser the agent drives.

## Layout

```
corpus/   pipeline scripts + games_<y>.json (corpus) + tags_<y>.json + build/ (gitignored)
games/    frozen game bytes: <id>/dist (built) + <id>/src (source) + meta.json
env/      harness, static server, virtual clock (clock/), screening, episode runner
agents/   agent interface + baselines
judge/    VLM-as-judge + CLI
runs/     screening shots/montages, episode trajectories (gitignored)
```

## Known caveats (2025) — all 66 are playable in stepped mode
- `nondeterministic` (2): `celestial-paws` (WebGL — nondeterministic even across identical
  runs; GPU/async-ordering, not a clock), `kittens-united` (async/await gameplay whose
  promise scheduling isn't governed by the faked timer clock). Included but
  `screening.reproducible=false` → score with the VLM judge, not deterministic reward.

The shim mirrors real-browser behavior so games virtualize cleanly: it seeds `Math.random`
**and** `crypto.getRandomValues`; seeks CSS/Web-Animations to virtual time each step (they
otherwise run on the compositor wall-clock); and **clamps `setInterval(…,0)` to a 1ms floor**
so background-work loops (e.g. incremental music/level generation) can't monopolize a single
tick. These took the corpus from 56 bit-reproducible + 2 hanging → **64 reproducible, 0 hanging**.
