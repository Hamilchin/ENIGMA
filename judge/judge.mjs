// VLM-as-judge — one FROZEN judge for all agents (apples-to-apples). Given the game's
// description and a set of trajectory keyframes, returns a structured verdict.
// Pin the model snapshot via ENIGMA_JUDGE_MODEL before any scored run.
const API = 'https://api.anthropic.com/v1/messages';
export const DEFAULT_JUDGE_MODEL = process.env.ENIGMA_JUDGE_MODEL || 'claude-opus-4-8';

// FROZEN prompt template — do not edit after a benchmark release; the judge identity
// (model snapshot + this prompt + temperature 0) is part of the reported result.
function buildPrompt(objective, nFrames) {
  return [
    `You are an impartial referee for a video-game benchmark. You are shown ${nFrames}`,
    `screenshots sampled in time order from one play session of a small browser game.`,
    ``,
    `GAME (description / objective): ${objective || '(unknown — infer from the frames)'}`,
    ``,
    `Decide whether the player BEAT the game (completed its objective) at any`,
    `point, and estimate how far they progressed. Judge ONLY from the frames — do not assume`,
    `progress that is not visible. A returned title/menu screen is NOT a win.`,
    ``,
    `Respond with ONLY a JSON object, no prose:`,
    `{"beaten": <true|false>, "progress": <0.0-1.0>, "confidence": <0.0-1.0>, "rationale": "<one sentence>"}`,
  ].join('\n');
}

function parseVerdict(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return { beaten: false, progress: 0, confidence: 0, rationale: 'unparseable', raw: text.slice(0, 200) };
  try {
    const v = JSON.parse(m[0]);
    return { beaten: !!v.beaten, progress: Math.max(0, Math.min(1, +v.progress || 0)),
             confidence: Math.max(0, Math.min(1, +v.confidence || 0)), rationale: String(v.rationale || '').slice(0, 300) };
  } catch { return { beaten: false, progress: 0, confidence: 0, rationale: 'bad-json', raw: text.slice(0, 200) }; }
}

// frames: array of PNG Buffers (already sampled keyframes, time-ordered).
export async function judge({ objective, frames, model = DEFAULT_JUDGE_MODEL }) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error('ANTHROPIC_API_KEY not set — the VLM judge requires a vision model.');
  const content = [{ type: 'text', text: buildPrompt(objective, frames.length) }];
  frames.forEach((buf, i) => {
    content.push({ type: 'text', text: `Frame ${i + 1}/${frames.length}:` });
    content.push({ type: 'image', source: { type: 'base64', media_type: 'image/png', data: buf.toString('base64') } });
  });
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: 400, messages: [{ role: 'user', content }] }),
  });
  if (!res.ok) throw new Error(`judge API ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const text = (data.content || []).map(c => c.text || '').join('');
  return { ...parseVerdict(text), model };
}

// Sample up to n keyframes evenly from an ordered list of frame buffers.
export function sampleKeyframes(frameBuffers, n = 8) {
  if (frameBuffers.length <= n) return frameBuffers;
  const out = [];
  for (let i = 0; i < n; i++) out.push(frameBuffers[Math.floor(i * (frameBuffers.length - 1) / (n - 1))]);
  return out;
}
