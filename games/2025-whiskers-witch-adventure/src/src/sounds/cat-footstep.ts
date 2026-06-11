import {audioContext, envelopeMe, hardBuffer} from "@/engine/audio/audio-helpers";
import {clamp} from "@/engine/helpers";

export function playCatFootstepSound() {
  const noise = audioContext.createBufferSource();
  noise.buffer = hardBuffer;
  noise.playbackRate.value = 1.5 + (Math.random() / 2);
  noise.playbackRate.setTargetAtTime(5, audioContext.currentTime, 0.1);
  noise.loop = true;

  const noiseFilter = audioContext.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 250 + Math.random() * 70;

  noise.connect(noiseFilter);

  const gain = audioContext.createGain();
  const stopTime = envelopeMe(0.05, 0.01, 0, 0.03, clamp(Math.random(), 0.1, 0.2), audioContext.currentTime, 0.07, gain.gain)

  noiseFilter.connect(gain);
  gain.connect(audioContext.destination);

  noise.start();
  noise.stop(stopTime);
}
