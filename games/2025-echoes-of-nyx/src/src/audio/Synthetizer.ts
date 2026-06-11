import { Instrument } from './Instrument';
import { notesTable } from './notesTable';

interface Enveloppe {
  attack: number;
  hold?: number;
  decay?: number;
  sustain?: number;
  release: number;
}

export interface SynthConfig {
  volume: number;
  type: OscillatorType;
  unisson: {
    amount: number;
    percent: number;
  };
  enveloppe: Enveloppe;
  filter: {
    cutoff: number; // in semitone
    enveloppeShift?: number; // in semitone
    enveloppe?: Enveloppe;
  };
}

export class Synthetizer extends Instrument {
  audioContext: AudioContext;
  targetNode: AudioNode;
  synthConfig: SynthConfig;
  oscillators: OscillatorNode[];

  constructor(audioContext: AudioContext, targetNode: AudioNode, synthConfig: SynthConfig) {
    super(audioContext, targetNode);
    this.synthConfig = synthConfig;
  }

  playNote(time: number, duration: number, key: string, octave: number) {
    const instrumentVolume = this.audioContext.createGain();
    instrumentVolume.gain.setValueAtTime(this.synthConfig.volume, time);
    instrumentVolume.connect(this.targetNode);

    const node = this.createSynth(time, duration, key, octave);
    node.connect(instrumentVolume);

    this.oscillators.forEach((o) => o.start(time));
    this.oscillators.forEach((o) => o.stop(time + duration + this.synthConfig.enveloppe.release));
    return this.oscillators;
  }

  getUnissonTable(amount: number, percent: number): number[] {
    const values: number[] = Array.from({ length: Math.floor(amount / 2) }, (_, i) => percent / Math.pow(2, i));
    const result: number[] = values.sort((a, b) => a - b).reduce((acc, val) => [...acc, -val], [] as number[]);

    if (amount % 2 !== 0) {
      result.push(0);
    }

    result.push(...values);
    return result.sort((a, b) => a - b);
  }

  getShiftedNote(key: string, octave: number, shift: number) {
    const keys = Object.keys(notesTable[1]);
    const keyIndex = keys.indexOf(key);
    const toneShift = shift % 12;
    let octaveShift = (shift - toneShift) / 12;
    let newKey = (keyIndex + toneShift) % keys.length;
    if (keyIndex + toneShift < 0) {
      octaveShift--;
    } else if (keyIndex + toneShift > keys.length) {
      octaveShift++;
    }
    return {
      key: keys[newKey < 0 ? keys.length + newKey : newKey],
      octave: octave + octaveShift,
    };
  }

  configureEnvelope(params: AudioParam, enveloppe: Enveloppe, time: number, duration: number, min = 0, max = 0.1) {
    params.cancelScheduledValues(time);
    params.setValueAtTime(min, time);
    if (!enveloppe) return;

    const { attack, hold = 0, decay = 1, sustain = 1, release } = enveloppe;
    const attackTime = attack <= duration ? attack : duration;
    params.linearRampToValueAtTime(max, time + attackTime);
    if (duration - attackTime > 0) {
      const holdTime = attackTime + hold <= duration ? attackTime + hold : duration - attackTime;
      params.linearRampToValueAtTime(max, time + holdTime);
      if (duration - holdTime > 0) {
        const decayTime = attackTime + holdTime + decay <= duration ? holdTime + decay : duration - holdTime;
        params.linearRampToValueAtTime(max * sustain, time + decayTime);
        if (duration - decayTime > 0) {
          params.linearRampToValueAtTime(max * sustain, time + duration);
        }
      }
    }
    params.linearRampToValueAtTime(min, time + duration + release);
  }

  createSynth(time: number, duration: number, key: string, octave: number) {
    const detune = this.getUnissonTable(this.synthConfig.unisson.amount, this.synthConfig.unisson.percent);

    const volume = this.audioContext.createGain();
    volume.gain.setValueAtTime(this.synthConfig.volume, time);
    const enveloppe = this.audioContext.createGain();
    this.oscillators = [];
    for (let i = 0; i < this.synthConfig.unisson.amount; i++) {
      const osc = this.audioContext.createOscillator();
      osc.type = this.synthConfig.type;
      osc.frequency.setValueAtTime(notesTable[octave][key], time);
      osc.detune.setValueAtTime(detune[i], time);
      osc.connect(enveloppe);
      this.oscillators.push(osc);
    }

    const filter = this.audioContext.createBiquadFilter();
    const { key: fKey, octave: fOctave } = this.getShiftedNote(key, octave, this.synthConfig.filter.cutoff);

    if (this.synthConfig.filter.enveloppe && this.synthConfig.filter.enveloppeShift) {
      const { key: sKey, octave: sOctave } = this.getShiftedNote(fKey, fOctave, this.synthConfig.filter.enveloppeShift);

      this.configureEnvelope(
        enveloppe.gain,
        this.synthConfig.enveloppe,
        time,
        duration,
        notesTable[fOctave][fKey],
        notesTable[sOctave][sKey],
      );
    } else {
      filter.frequency.setValueAtTime(notesTable[fOctave][fKey], time);
    }

    this.configureEnvelope(enveloppe.gain, this.synthConfig.enveloppe, time, duration);

    enveloppe.connect(filter);

    return filter;
  }
}
