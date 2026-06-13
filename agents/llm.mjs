// Unified vision-LLM agent: screenshot -> one JSON action. Stateful full-history
// conversation (the model sees every prior frame), one provider table to add CUAs.
// Per-turn output is capped by `maxTokens`, or set `adaptive` for Anthropic adaptive thinking.
import { Agent, VIEWPORT } from './base.mjs';

const DEFAULT_PROMPT = `You are an agent playing a small browser game shown as screenshots
(canvas {W}x{H}px, origin top-left). Objective: {objective}

Each turn you see the current frame. Reply with EXACTLY ONE action as a single JSON object, nothing else:
{"type":"click","x":<int>,"y":<int>}
{"type":"key","key":"ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Space|Enter|KeyZ|KeyX|KeyW|KeyA|KeyS|KeyD","hold":<frames 1-12>}
{"type":"drag","x1":<int>,"y1":<int>,"x2":<int>,"y2":<int>}
{"type":"wait"}
Play to make progress toward the objective.`;

function systemPrompt(objective) {
  const tmpl = process.env.ENIGMA_AGENT_PROMPT || DEFAULT_PROMPT;
  return tmpl.replace('{objective}', objective || '(infer it from the screen)')
             .replace('{W}', VIEWPORT.width).replace('{H}', VIEWPORT.height);
}

function parseAction(text) {
  const m = text && text.match(/\{[\s\S]*\}/);
  if (!m) return { type: 'wait' };
  try { const a = JSON.parse(m[0]); if (a && typeof a.type === 'string') return a; } catch {}
  return { type: 'wait' };
}

// Provider conventions. Each builds a request from a provider-neutral history
// (turns = [{role:'user'|'assistant', text, imageB64?}]) and extracts the reply text.
// NOTE: anthropic is verified against the Claude API docs and runs today; openai/google/xai
// model ids + field names are pending the provider-research pass (endpoints are standard).
export const PROVIDERS = {
  anthropic: {
    keyEnv: 'ANTHROPIC_API_KEY',
    defaultModel: 'claude-opus-4-8',
    endpoint: () => 'https://api.anthropic.com/v1/messages',
    headers: k => ({ 'x-api-key': k, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' }),
    body: ({ model, system, turns, maxTokens, adaptive }) => {
      const messages = turns.map(t => t.role === 'user'
        ? { role: 'user', content: [{ type: 'text', text: t.text },
            { type: 'image', source: { type: 'base64', media_type: 'image/png', data: t.imageB64 } }] }
        : { role: 'assistant', content: [{ type: 'text', text: t.text }] });
      // cache breakpoint on the last block => the whole growing prefix is served from cache
      const last = messages[messages.length - 1].content;
      last[last.length - 1].cache_control = { type: 'ephemeral' };
      const b = { model, max_tokens: maxTokens, messages,
        system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }] };
      if (adaptive) b.thinking = { type: 'adaptive' };
      return b;
    },
    text: d => (d.content || []).map(c => c.text || '').join(''),
  },

  openai: {
    keyEnv: 'OPENAI_API_KEY',
    defaultModel: 'gpt-5.5',            // verified 2026; cheaper alt: gpt-5.4-mini
    // base URL is overridable so OpenAI-compatible servers (vLLM/SGLang hosting UI-TARS,
    // Qwen-VL, etc.) work through this same provider: set ENIGMA_OPENAI_BASE_URL + model.
    endpoint: () => `${process.env.ENIGMA_OPENAI_BASE_URL || 'https://api.openai.com/v1'}/chat/completions`,
    headers: k => ({ authorization: `Bearer ${k}`, 'content-type': 'application/json' }),
    body: ({ model, system, turns, maxTokens }) => ({
      model, max_completion_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...turns.map(t => t.role === 'user'
        ? { role: 'user', content: [{ type: 'text', text: t.text },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${t.imageB64}` } }] }
        : { role: 'assistant', content: t.text })],
    }),
    text: d => d.choices?.[0]?.message?.content || '',
  },

  google: {
    keyEnv: 'GOOGLE_API_KEY',
    defaultModel: 'gemini-3.1-pro-preview',   // verified 2026; cheaper alt: gemini-3.5-flash
    endpoint: (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    headers: k => ({ 'x-goog-api-key': k, 'content-type': 'application/json' }),
    body: ({ system, turns, maxTokens }) => ({
      systemInstruction: { parts: [{ text: system }] },
      contents: turns.map(t => t.role === 'user'
        ? { role: 'user', parts: [{ text: t.text }, { inline_data: { mime_type: 'image/png', data: t.imageB64 } }] }
        : { role: 'model', parts: [{ text: t.text }] }),
      generationConfig: { maxOutputTokens: maxTokens },
    }),
    text: d => (d.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join(''),
  },

  xai: { // OpenAI-compatible
    keyEnv: 'XAI_API_KEY',
    defaultModel: 'grok-4.3',           // verified 2026 (vision, OpenAI-compatible)
    endpoint: () => 'https://api.x.ai/v1/chat/completions',
    headers: k => ({ authorization: `Bearer ${k}`, 'content-type': 'application/json' }),
    body: ({ model, system, turns, maxTokens }) => ({
      model, max_completion_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...turns.map(t => t.role === 'user'
        ? { role: 'user', content: [{ type: 'text', text: t.text },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${t.imageB64}` } }] }
        : { role: 'assistant', content: t.text })],
    }),
    text: d => d.choices?.[0]?.message?.content || '',
  },
};

export class LLMAgent extends Agent {
  constructor(opts = {}) {
    const provider = opts.provider || 'anthropic';
    const p = PROVIDERS[provider];
    if (!p) throw new Error(`unknown provider: ${provider}`);
    super({ name: opts.name || provider, ...opts });
    this.provider = provider;
    this.p = p;
    this.model = opts.model || process.env.ENIGMA_AGENT_MODEL || p.defaultModel;
    this.adaptive = opts.adaptive ?? (process.env.ENIGMA_AGENT_ADAPTIVE === '1');
    this.maxTokens = opts.maxTokens || Number(process.env.ENIGMA_AGENT_MAX_TOKENS) || (this.adaptive ? 2048 : 512);
    this.turns = [];
  }

  reset() { this.turns = []; this.objective = null; }

  async act(obs) {
    if (this.objective == null) this.objective = obs.objective;
    this.turns.push({ role: 'user', text: `Frame ${obs.step}.`, imageB64: obs.screenshot.toString('base64') });

    const key = process.env[this.p.keyEnv];
    if (!key) throw new Error(`${this.p.keyEnv} not set — needed for the ${this.provider} agent`);
    const res = await fetch(this.p.endpoint(this.model, key), {
      method: 'POST', headers: this.p.headers(key),
      body: JSON.stringify(this.p.body({ model: this.model, system: systemPrompt(this.objective),
        turns: this.turns, maxTokens: this.maxTokens, adaptive: this.adaptive })),
    });
    if (!res.ok) throw new Error(`${this.provider} ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const text = this.p.text(await res.json());
    this.turns.push({ role: 'assistant', text });          // remember its own move (full history)
    return parseAction(text);
  }
}
