# Agents & CUA providers

ENIGMA evaluates every agent through the **same** interface: one screenshot in → one JSON
action out (`agents/base.mjs`), scored by the same frozen VLM judge. That keeps results
comparable across providers (the GameWorld / VideoGameBench convention). `agents/llm.mjs`
is one adapter with a provider table; add an API key to `.env` and the agent is live.

## Built-in agents
| name | impl | needs |
|---|---|---|
| `random` | `agents/random.mjs` | — (baseline floor) |
| `noop` | `agents/random.mjs` | — (does nothing; measures self-advance) |
| `claude` | `LLMAgent` → anthropic | `ANTHROPIC_API_KEY` |
| `gpt` | `LLMAgent` → openai | `OPENAI_API_KEY` |
| `gemini` | `LLMAgent` → google | `GOOGLE_API_KEY` |
| `grok` | `LLMAgent` → xai | `XAI_API_KEY` |

Run one: `node env/run-episode.mjs <game-id> claude`. Batch: `node env/eval.mjs claude,gpt,gemini 15`.
Per-turn output is capped by `ENIGMA_AGENT_MAX_TOKENS` (default 512), or set `ENIGMA_AGENT_ADAPTIVE=1`
for Anthropic adaptive thinking. The full screenshot history is sent each turn (cached on Anthropic).

## Provider conventions (verified 2026, official docs)
| provider | endpoint | auth | image field | token field | text path | default model |
|---|---|---|---|---|---|---|
| anthropic | `api.anthropic.com/v1/messages` | `x-api-key` + `anthropic-version` | content block `image`/`source.base64` | `max_tokens` | `content[].text` | `claude-opus-4-8` |
| openai | `api.openai.com/v1/chat/completions` | `Bearer` | `image_url:{url:data:...}` | `max_completion_tokens` | `choices[0].message.content` | `gpt-5.5` |
| google | `…/v1beta/models/<m>:generateContent` | `x-goog-api-key` | `inline_data:{mime_type,data}` | `generationConfig.maxOutputTokens` | `candidates[0].content.parts[].text` | `gemini-3.1-pro-preview` |
| xai | `api.x.ai/v1/chat/completions` | `Bearer` (OpenAI-compatible) | `image_url:{url:data:...}` | `max_completion_tokens` | `choices[0].message.content` | `grok-4.3` |

Override any model with `ENIGMA_AGENT_MODEL`. Cheaper picks: `gpt-5.4-mini`, `gemini-3.5-flash`,
`claude-haiku-4-5`. OpenAI/xAI deprecated `max_tokens` → use `max_completion_tokens` (handled).

## CUA shortlist for the paper
Mirror **GameWorld (2026)** and **VideoGameBench** so numbers are comparable. All are far below
human in those papers — the expected headroom story.

**Closed-API (wired here as plain vision agents):**
- **Claude** (`claude`) — Opus 4.8 / Sonnet 4.6. Also a *dedicated* CUA via the computer-use tool (`computer_20250124`, beta `computer-use-2025-01-24`).
- **OpenAI** (`gpt`) — GPT-5.5. Dedicated CUA: `computer-use-preview` via the Responses API (Operator the product was retired Aug 2025; the model lives on for devs).
- **Google Gemini** (`gemini`) — Gemini 3.1 Pro. Dedicated CUA: `gemini-2.5-computer-use-preview-10-2025` (Gemini 3 has built-in computer use).
- **xAI Grok** (`grok`) — Grok 4.3 (vision; no dedicated computer-use tool as of 2026).

**Open-weights (serve via vLLM/SGLang → OpenAI-compatible; use the `gpt` agent with `ENIGMA_OPENAI_BASE_URL` + `ENIGMA_AGENT_MODEL`):**
- **UI-TARS-1.5-7B** (ByteDance, Apache-2.0) — the canonical open dedicated CUA; the one GameWorld evaluates.
- **Qwen3-VL / Qwen2.5-VL** (Alibaba) — dominant open general-VLM-as-agent with native grounding (pick a small + large size).
- **Agent S3** (Simular) — leading open CUA *framework* (model-agnostic scaffold; strong scaffolded upper bound).
- one grounding model — **OS-Atlas-Pro-7B** / **OpenCUA-32B** / **CogAgent-9b** as a lightweight reference.

## Two interfaces (optional second track)
The above use ENIGMA's **structured-action** interface (one JSON action/turn). The providers'
**native computer-use tools** (Anthropic `computer_20250124`, OpenAI `computer` tool, Gemini
`computer_use`) are a different multi-turn protocol; running both and reporting the gap mirrors
GameWorld's "computer-use vs semantic-action" comparison. Not built yet — a clean future track.
