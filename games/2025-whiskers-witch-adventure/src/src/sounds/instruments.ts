import {audioContext, envelopeMe, musicDryGain, musicWetGain, softBuffer} from "@/engine/audio/audio-helpers";

export function pizzicatoStrings(startTime: number, duration: number, frequency: number) {
  const sineGain = audioContext.createGain();
  const squareGain = audioContext.createGain();
  const endTimeSin = envelopeMe(0, 0.1, 0, 0.1, 0.3, startTime, duration, sineGain.gain);
  const endTimeSq = envelopeMe(0, 1, 0.2, 0.5, 3046, startTime, duration, squareGain.gain);

  const sine = audioContext.createOscillator();
  sine.frequency.value = frequency;

  const square = audioContext.createOscillator();
  square.type = 'sine';
  square.frequency.value = frequency * 6;

  sine.connect(sineGain);
  square.connect(squareGain);

  sineGain.connect(musicWetGain);
  sineGain.connect(musicDryGain);
  squareGain.connect(sine.frequency);

  sine.start(startTime);
  square.start(startTime);

  sine.stop(endTimeSin);
  square.stop(endTimeSq);
}

export function accousticGuitar(startTime: number, duration: number, frequency: number) {
  const sineGain = audioContext.createGain();
  const squareGain = audioContext.createGain();
  const endTimeSin = envelopeMe(0, 0.5, 0, 0.05, 0.15, startTime, duration, sineGain.gain);
  const endTimeSq = envelopeMe(0, 1, 0.2, 0.05, 200, startTime, duration, squareGain.gain);

  const sine = audioContext.createOscillator();
  sine.frequency.value = frequency;

  const square = audioContext.createOscillator();
  square.type = 'triangle';
  square.frequency.value = frequency * 2;

  sine.connect(sineGain);
  square.connect(squareGain);

  sineGain.connect(musicWetGain);
  sineGain.connect(musicDryGain);
  squareGain.connect(sine.frequency);

  sine.start(startTime);
  square.start(startTime);

  sine.stop(endTimeSin);
  square.stop(endTimeSq);
}

export function shake(startTime: number, frequency: number) {
  const noise = audioContext.createBufferSource();
  noise.buffer = softBuffer;
  noise.playbackRate.value = frequency;
  noise.loop = true;

  const gain = audioContext.createGain();
  const stopTime = envelopeMe(0.05, 0.05,  0.3, 0.2, 0.7, startTime, 0.1, gain.gain)
  noise.connect(gain);
  gain.connect(musicWetGain);
  gain.connect(musicDryGain);
  noise.start(startTime);
  noise.stop(stopTime);
}