import {audioContext} from "@/engine/audio/audio-helpers";

export function playPop() {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(400, audioContext.currentTime)
    .exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);

  gain.gain.setValueAtTime(0.8, audioContext.currentTime)
    .exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);

  osc.connect(gain).connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 0.2);
}