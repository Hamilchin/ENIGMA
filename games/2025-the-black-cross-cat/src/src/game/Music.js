export function playIntroMusic() {
   const ctx = new (window.AudioContext || window.webkitAudioContext)();

   function note(freq, start, duration, type = 'sine', vol = 0.2) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(vol, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
   }

   const scale = [220, 247, 262, 294, 330, 349, 392];

   let t = 0;
   for (let i = 0; i < 16; i++) {
      const f = scale[Math.floor(Math.random() * scale.length)];
      note(f, t, 0.4, i % 4 === 0 ? 'triangle' : 'sine', 0.15);
      if (i % 4 === 0) note(f / 2, t, 1.2, 'sawtooth', 0.05);
      t += 0.5;
   }
}

let ctx,
   timeout,
   playing = false,
   t = 0;

function note(freq, start, dur, type = 'sine', vol = 0.2) {
   const osc = ctx.createOscillator(),
      gain = ctx.createGain();
   osc.type = type;
   osc.frequency.value = freq;
   gain.gain.setValueAtTime(vol, ctx.currentTime + start);
   gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
   osc.connect(gain).connect(ctx.destination);
   osc.start(ctx.currentTime + start);
   osc.stop(ctx.currentTime + start + dur);
}

export function startContinuousMusic() {
   if (playing) return;
   ctx = new (window.AudioContext || window.webkitAudioContext)();
   playing = true;
   t = 0;

   const scale = [261, 293, 329, 349, 392, 440, 523];
   const interval = 0.1; // music speed

   function schedule() {
      if (!playing) return;

      //random note
      let f = scale[(Math.random() * scale.length) | 0];
      if (Math.random() < 0.3) f *= 2;

      note(f, t, interval * (Math.random() < 0.5 ? 1 : 2), Math.random() < 0.3 ? 'triangle' : 'sine', 0.12);

      if (Math.random() < 0.2) note(f / 2, t, 0.8, 'sawtooth', 0.05);

      if (Math.random() < 0.4) note(880, t, 0.05, 'square', 0.03);
      if (Math.random() < 0.2) note(1320, t, 0.03, 'square', 0.025);

      t += interval;
      timeout = setTimeout(schedule, interval * 1000);
   }

   schedule();
}

export function stopContinuousMusic() {
   playing = false;
   if (timeout) clearTimeout(timeout);
   if (ctx) ctx.close();
}
