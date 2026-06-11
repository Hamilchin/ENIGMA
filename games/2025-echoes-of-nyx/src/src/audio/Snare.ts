import { Instrument } from './Instrument';

const sampleRate = 44100;
const samples = 0.25 * sampleRate;
export class Snare extends Instrument {
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
    const instrumentVolume = this.audioContext.createGain();
    instrumentVolume.gain.setValueAtTime(this.volume, time);
    instrumentVolume.connect(this.targetNode);

    const osc = this.audioContext.createOscillator();
    const gainosc = this.audioContext.createGain();
    const filterGain = this.audioContext.createGain();

    filterGain.gain.setValueAtTime(1, time);
    filterGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);

    const filterNode = this.audioContext.createBiquadFilter();
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(3000, time);

    osc.type = 'triangle';
    osc.frequency.value = 100;

    gainosc.gain.value = 0;
    gainosc.gain.setValueAtTime(0, time);

    //Connections
    osc.connect(gainosc);
    gainosc.connect(filterNode);

    const node = this.audioContext.createBufferSource();
    const buffer = this.audioContext.createBuffer(1, 4096, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(100, time);
    filter.frequency.linearRampToValueAtTime(10000, time + 0.2);

    for (let i = 0; i < 4096; i++) {
      data[i] = Math.random();
    }

    node.buffer = this.noiseBuffer;
    node.loop = true;

    //Connections
    node.connect(filter);
    filter.connect(filterGain);
    filterGain.connect(filterNode);
    filterNode.connect(instrumentVolume);

    const nodes = [osc, node];
    nodes.forEach((node) => node.start(time));
    nodes.forEach((node) => node.stop(time + 0.2));

    return nodes;
  }
}
