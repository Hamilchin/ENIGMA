// ENIGMA in-page shim — injected via addInitScript BEFORE any game code runs.
// Provides: (1) seeded RNG, (2) global audio mute + audio-clock neutralization,
// (3) a frozen virtual clock advanced only by window.__clock.step(frames).
// Bundled to shim.bundle.js by env/clock/build-shim.mjs (esbuild, IIFE).
import FakeTimers from '@sinonjs/fake-timers';

(function installEnigmaShim() {
  const W = window;
  if (W.__ENIGMA_SHIM__) return;
  W.__ENIGMA_SHIM__ = true;

  // ---- (1) Seeded RNG: deterministic Math.random. Seed set via window.__SEED. ----
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const rng = mulberry32((W.__SEED ?? 0) | 0);
  Math.random = () => rng();

  // Seed crypto.getRandomValues too — some games draw entropy from it, which Math.random
  // seeding alone wouldn't make deterministic. Fill each element from the same PRNG.
  try {
    if (W.crypto && W.crypto.getRandomValues) {
      W.crypto.getRandomValues = (arr) => {
        const max = Math.pow(2, 8 * (arr.BYTES_PER_ELEMENT || 1));
        for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(rng() * max);
        return arr;
      };
    }
  } catch (e) {}

  // ---- (2) Audio: keep the REAL Web Audio API (so `new GainNode(ctx)` / `new
  //          StereoPannerNode(ctx)` constructors validate against a real BaseAudioContext
  //          and don't crash), but force every context to stay SUSPENDED with a no-op
  //          resume(). Suspended => no sound AND currentTime is frozen at 0, so the audio
  //          clock can't leak real time. <audio>/<video> playback is stubbed too.
  try {
    const RealAC = W.AudioContext || W.webkitAudioContext;
    if (RealAC) {
      const Muted = function (...args) {
        const ctx = new RealAC(...args);
        try { ctx.suspend(); } catch (e) {}
        ctx.resume = function () { return Promise.resolve(); };
        return ctx; // a real RealAC instance => instanceof BaseAudioContext holds
      };
      Muted.prototype = RealAC.prototype;
      W.AudioContext = Muted;
      W.webkitAudioContext = Muted;
    }
    if (W.HTMLMediaElement) {
      HTMLMediaElement.prototype.play = function () { return Promise.resolve(); };
      HTMLMediaElement.prototype.pause = function () {};
    }
  } catch (e) {}

  // ---- (3) Frozen virtual clock via fake-timers. shouldAdvanceTime:false => time only
  //          moves when we tick, so any dt the game computes equals the injected step. ----
  const FPS = W.__FPS || 60;
  const MS_PER_FRAME = 1000 / FPS;
  const clock = FakeTimers.install({
    now: 0,
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval',
      'requestAnimationFrame', 'cancelAnimationFrame', 'requestIdleCallback',
      'cancelIdleCallback', 'Date', 'performance'],
    shouldAdvanceTime: false,
    shouldClearNativeTimers: true,
  });

  // CSS animations / Web-Animations run on the compositor's real wall-clock, which JS
  // timer faking can't freeze. Drive them off the virtual clock instead: pause every
  // animation and seek its currentTime to virtual-now. Between steps they stay paused,
  // so they can't drift on real time. (The "manually seek animations" technique.)
  function syncAnimations(t) {
    try {
      const anims = document.getAnimations ? document.getAnimations() : [];
      for (const a of anims) { try { a.pause(); a.currentTime = t; } catch (e) {} }
    } catch (e) {}
  }

  // Real browsers clamp 0ms timers to a small minimum so a self-rescheduling
  // setInterval(fn, 0) can't monopolize the thread. fake-timers doesn't, so a single
  // step() would drain such a loop unboundedly (e.g. games that synth music or generate
  // levels via setInterval(work, 0)) and peg the CPU. Enforce a 1ms floor: now a 0-delay
  // timer fires at most ~MS_PER_FRAME times per stepped frame instead of infinitely.
  const MIN_DELAY = 1;
  const _setTimeout = W.setTimeout, _setInterval = W.setInterval;
  W.setTimeout = function (fn, d, ...a) { return _setTimeout(fn, Math.max(MIN_DELAY, +d || 0), ...a); };
  W.setInterval = function (fn, d, ...a) { return _setInterval(fn, Math.max(MIN_DELAY, +d || 0), ...a); };

  let steppedFrames = 0;
  W.__clock = {
    frozen: true,
    fps: FPS,
    // advance virtual time by `frames` frames; returns total frames stepped
    step(frames = 1) { clock.tick(MS_PER_FRAME * frames); steppedFrames += frames; syncAnimations(clock.now); return steppedFrames; },
    // advance by raw milliseconds (for tests)
    tickMs(ms) { clock.tick(ms); return clock.now; },
    now() { return clock.now; },
    frames() { return steppedFrames; },
    // count of pending timers/animation-frame callbacks (0 => game loop has stalled)
    pending() { return clock.countTimers ? clock.countTimers() : null; },
  };
})();
