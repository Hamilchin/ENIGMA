# Corpus data sources (resolved in data-task #1)

The js13kGames site is a client-rendered SPA; metadata is **not** in a single repo and is
**not** served from `api.js13kgames.com` on the public game pages. The robust map:

| Need | Source | How |
|---|---|---|
| Ranked entry list + slugs | `js13kgames.com/<year>/games` | Playwright render; default sort = **Overall** (= rank), so **DOM order = rank**. Cards are `<a href="games/<slug>"><img><h3>title</h3><address>author</address></a>` under `<main>`. 2025 = 197 cards. |
| Exclusion categories | same page, category filter buttons | Site tags games **Desktop / Mobile / Online / WebXR / Decentralized / Unfinished**. Scrape each filter to get slug sets; exclude online/webxr/decentralized/unfinished. |
| Per-game metadata | `js13kgames.com/<year>/games/<slug>` | Detail page rendered text/links: **devices** ("CATEGORIES: Desktop, Mobile"), **description**, **controls**, **Source** link (github), **Overall score** (sum of 6 criteria, ~0–30) + per-criterion scores & ranks, size. |
| Source code | `github.com/js13kGames/<slug>` | **Uniform per-game fork** of the author's repo (e.g. `js13kGames/clawstrike` ← `remvst/clawstrike`). Has full `src/`, `assets/`, build scripts. Clone shallow for analysis/instrumentation. |
| Built game bytes (canonical) | `play.js13kgames.com/<slug>.zip` | The exact bytes the site serves (`200, application/zip`). **No local build needed** — use this to run the game; clone source only for code analysis. |
| Thumbnails / captures | `play.js13kgames.com/<slug>/.ts.png` (thumb), `.c.png`, `.t.png` | referenced from cards/detail. |

## Implications vs the original plan
- **Stage D simplifies:** run the **pre-built zip** (canonical) instead of building author repos
  ourselves; clone `github.com/js13kGames/<slug>` only for the static scan / code summary /
  instrumentation. Eliminates the ~20–40% "needs npm build" risk for *running*.
- **Unfinished filter is free:** the site already flags `Unfinished` as a category — use it as
  a strong prior (still confirm via the runtime probe).
- **Rank is directly observable** (DOM order); numeric scores are a bonus from the detail page.

## Counts
- 2025: **197 entries** (confirmed via rendered "All 197"). Top 33% ≈ 65 games.
