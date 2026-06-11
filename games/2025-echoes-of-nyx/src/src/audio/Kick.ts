import { Instrument } from './Instrument';
import { minAttack } from './intrument-config';

const sampleRate = 44100;
const samples = 0.25 * sampleRate;

export class Kick extends Instrument {
  audioContext: AudioContext;
  targetNode: AudioNode;
  volume: number;
  noiseBuffer: AudioBuffer;

  constructor(audioContext: AudioContext, targetNode: AudioNode, volume: number) {
    super(audioContext, targetNode);
    this.volume = volume;
    this.noiseBuffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const output = this.noiseBuffer.getChannelData(0);

    for (let i = 0; i < 4096; i++) {
      output[i] = Math.random();
    }
  }

  playNote(time: number) {
    const osc = this.audioContext.createOscillator();
    osc.frequency.value = 54;
    var gain = this.audioContext.createGain();
    var oscGain = this.audioContext.createGain();

    const decay = 50;
    const tone = 64;

    const choke = this.audioContext.createGain();
    choke.gain.value = 0;

    choke.gain.setValueAtTime(0, time + 0.0001);
    choke.gain.linearRampToValueAtTime(1, time + 0.0002);

    const max = 2.2;
    const min = 0.09;
    const duration = (max - min) * (decay / 127) + min;

    const noise = this.audioContext.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.loop = true;
    const noiseGain = this.audioContext.createGain();
    const noiseFilter = this.audioContext.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1380 * 2;
    noiseFilter.Q.value = 20;

    noiseGain.gain.setValueAtTime(2 * Math.max(tone / 127, 0.0001), time);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.01);

    oscGain.gain.setValueAtTime(0.0001, time);
    oscGain.gain.exponentialRampToValueAtTime(1, time + 0.004);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(oscGain);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);

    oscGain.connect(choke);
    noiseGain.connect(choke);

    choke.connect(gain);

    gain.connect(this.targetNode);
    const kickDuration = 0.2;
    gain.gain.setValueAtTime(this.volume, time);
    gain.gain.linearRampToValueAtTime(this.volume, time + kickDuration - minAttack);
    gain.gain.linearRampToValueAtTime(0, time + kickDuration);

    const nodes = [osc, noise];
    nodes.forEach((node) => node.start(time));
    nodes.forEach((node) => node.stop(time + kickDuration));

    return nodes;
  }
}
