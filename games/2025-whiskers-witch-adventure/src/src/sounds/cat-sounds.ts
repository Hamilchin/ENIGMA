// Only difference between these is the Q value of the wah filter being modulated.

// THE MODULATED Q IS BETTER. It gets the mee in the meow. and the 700 value makes for a nicer mee as well.

import {audioContext} from "@/engine/audio/audio-helpers";

export function theBestDamnCatHolyShit2(isTakingDamage?: boolean) {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const wah = audioContext.createBiquadFilter();

  // Source: sawtooth or triangle works best
  osc.type = "sawtooth";

  osc.frequency.value = 700; // 600 - 700 works
  osc.frequency.setValueAtTime(isTakingDamage ? 800 : 700, audioContext.currentTime + 0.15);
  osc.frequency.linearRampToValueAtTime(isTakingDamage ? 900 : 500, audioContext.currentTime + 0.7);
  osc.frequency.linearRampToValueAtTime(900, audioContext.currentTime + 0.9);

  // Amp envelope
  gain.gain.setValueAtTime(0, audioContext.currentTime);
  gain.gain.linearRampToValueAtTime(0.6, audioContext.currentTime + 0.2);
  gain.gain.linearRampToValueAtTime(0.4, audioContext.currentTime + 0.3);
  gain.gain.linearRampToValueAtTime(0, audioContext.currentTime + (isTakingDamage ? 0.5 : 0.8));

  // Wah filter
  wah.type = "lowpass";   // can also try "bandpass"
  wah.frequency.value = isTakingDamage ? 2000 : 2200;
  wah.Q.value = 8; // resonance

  // Sweep the "wah"
  // wah.frequency.setValueAtTime(1500, audioCtx.currentTime);
  wah.frequency.linearRampToValueAtTime(isTakingDamage ? 1900 : 2800, audioContext.currentTime + 0.3);
  wah.frequency.linearRampToValueAtTime(40, audioContext.currentTime + 1);

  wah.Q.linearRampToValueAtTime(22, audioContext.currentTime + 0.5);


  // Connect
  osc.connect(gain);
  gain.connect(wah);
  wah.connect(audioContext.destination);

  osc.start();
  osc.stop(audioContext.currentTime + 1);
}
