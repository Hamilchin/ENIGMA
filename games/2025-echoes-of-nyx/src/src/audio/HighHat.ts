import { Instrument } from './Instrument';

const ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];

export class HighHat extends Instrument {
  audioContext: AudioContext;
  targetNode: AudioNode;
  volume: number;

  constructor(audioContext: AudioContext, targetNode: AudioNode, volume: number) {
    super(audioContext, targetNode);
    this.volume = volume;
  }

  playNote(time: number): AudioScheduledSourceNode[] {
    const fundamental = 40;

    // Always useful
    const gain = this.audioContext.createGain();

    // Bandpass
    const bandpass = this.audioContext.createBiquadFilter();
    bandpass.type = 'notch';
    bandpass.frequency.value = 15000;

    // Highpass
    const highpass = this.audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 10000;

    // Connect the graph
    bandpass.connect(highpass);
    highpass.connect(gain);
    gain.connect(this.targetNode);

    const oscs: OscillatorNode[] = [];
    // Create the oscillators
    ratios.forEach((ratio) => {
      var osc = this.audioContext.createOscillator();
      osc.type = 'square';
      // Frequency is the fundamental * this oscillator's ratio
      osc.frequency.value = fundamental * ratio;
      osc.connect(bandpass);
      oscs.push(osc);
    });

    // Define the volume envelope
    gain.gain.setValueAtTime(this.volume * 0.00001, time);
    gain.gain.exponentialRampToValueAtTime(this.volume * 1, time + 0.02);
    gain.gain.exponentialRampToValueAtTime(this.volume * 0.3, time + 0.03);
    gain.gain.exponentialRampToValueAtTime(this.volume * 0.00001, time + 0.3);

    oscs.forEach((osc) => {
      osc.start(time);
      osc.stop(time + 0.3);
    });
    return oscs;
  }
}
