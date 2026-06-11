import {audioContext, envelopeMe, musicDryGain, musicWetGain, reverb} from "@/engine/audio/audio-helpers";

export function playPumpkinSquashSound() {
    const startTime = audioContext.currentTime;
    const duration = 0.5;
    const sineGain = audioContext.createGain();
    const squareGain = audioContext.createGain();
    const endTimeSin = envelopeMe(0.1, 0.1, 0, 0.1, 0.8, startTime, duration, sineGain.gain);
    const endTimeSq = envelopeMe(0.2, 0.1, 0.2, 0.1, 2046, startTime, duration, squareGain.gain);

    const wah = audioContext.createBiquadFilter();
    wah.type = "lowpass";   // can also try "bandpass"
    wah.frequency.value = 160;
    wah.Q.value = 5; // resonance

    const sine = audioContext.createOscillator();
    sine.frequency.value = 250;

    const square = audioContext.createOscillator();
    square.type = 'sine';
    square.frequency.value = 50;

    sine.connect(sineGain);
    square.connect(squareGain);

    sineGain.connect(wah);
    wah.connect(audioContext.destination);
    squareGain.connect(sine.frequency);

    sine.start(startTime);
    square.start(startTime);

    sine.stop(endTimeSin);
    square.stop(endTimeSq);
}