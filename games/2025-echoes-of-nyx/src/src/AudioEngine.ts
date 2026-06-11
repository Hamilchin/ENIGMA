import { Synthetizer } from './audio/Synthetizer';
import {
  bassSup1Config,
  bassSup2Config,
  bassConfig,
  lead1Config,
  lead2Config,
  subConfig,
} from './audio/intrument-config';
import { Kick } from './audio/Kick';
import { Instrument } from './audio/Instrument';
import { Snare } from './audio/Snare';
import { globalVolume, volumeLocalStorageKey } from './config';
import { gameMelody, transitionMelody } from './audio/gameMelody';
import { Melody } from './audio/Melody';
import { HighHat } from './audio/HighHat';

const BPM = 100;
export const loopLength = (16 * 60000) / BPM;

const melodies: { [name: string]: Melody } = {};
melodies['game'] = gameMelody;
melodies['transition'] = transitionMelody;

export default class AudioEngine {
  static _instance: AudioEngine;
  isPaused: boolean;
  audioContext: AudioContext;
  mainGainNode: GainNode;
  iterators: { [id: string]: number } = {};
  timeoutIds: { [id: string]: number } = {};
  timers: { [id: string]: number } = {};
  resumeTimers: { [id: string]: number } = {};
  intruments: { [id: string]: Instrument[] } = {};
  audioNodes: (AudioScheduledSourceNode | AudioBufferSourceNode)[] = [];

  _volume: number = globalVolume;

  get volume(): number {
    this._volume = parseFloat(localStorage.getItem(volumeLocalStorageKey) ?? globalVolume.toString());
    return this._volume;
  }

  set volume(value: number) {
    this._volume = value;
    localStorage.setItem(volumeLocalStorageKey, this._volume.toString());
    this.mainGainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
    this.mainGainNode.gain.value = this.volume;
  }

  constructor() {
    this.audioContext = new AudioContext();

    this.mainGainNode = this.audioContext.createGain();
    this.mainGainNode.connect(this.audioContext.destination);
    this.mainGainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);

    this.intruments.sub = [new Synthetizer(this.audioContext, this.mainGainNode, subConfig)];
    this.intruments.bass = [new Synthetizer(this.audioContext, this.mainGainNode, bassConfig)];
    this.intruments.supBass = [
      new Synthetizer(this.audioContext, this.mainGainNode, bassSup1Config),
      new Synthetizer(this.audioContext, this.mainGainNode, bassSup2Config),
    ];
    this.intruments.kick = [new Kick(this.audioContext, this.mainGainNode, 0.35)];
    this.intruments.snare = [new Snare(this.audioContext, this.mainGainNode, 0.15)];
    this.intruments.highHat = [new HighHat(this.audioContext, this.mainGainNode, 0.1)];
    this.intruments.lead = [
      new Synthetizer(this.audioContext, this.mainGainNode, lead1Config),
      new Synthetizer(this.audioContext, this.mainGainNode, lead2Config),
    ];
  }

  static get instance(): AudioEngine {
    if (!AudioEngine._instance) {
      AudioEngine._instance = new AudioEngine();
    }
    return AudioEngine._instance;
  }

  playBar(name: string) {
    const melody = melodies[name];
    if (!this.iterators[name]) {
      this.iterators[name] = 0;
    }
    if (this.iterators[name] === melody.loopLength) {
      this.iterators[name] = 0;
    }
    this.audioNodes = [];
    for (const [instrument, notes] of Object.entries(melody.loop)) {
      let delay = 0;
      notes[this.iterators[name]].forEach((note: string) => {
        const [sym, dur] = note.split(':');
        const duration = parseFloat(dur ?? '1') / 4;
        let symbols = [sym];
        if (sym.indexOf(',') !== 1) {
          symbols = sym.split(',');
        }
        symbols.forEach((symbol) => {
          if (symbol !== '-') {
            const key = symbol.slice(0, -1);
            const octave = symbol.slice(-1);
            const time = this.audioContext.currentTime + (delay * 60) / BPM;
            this.audioNodes.push(
              ...this.intruments[instrument].flatMap((instr: Instrument) =>
                instr.playNote(time, (duration * 60) / BPM, key, parseInt(octave)),
              ),
            );
          }
        });
        delay += duration;
      });
    }
    this.iterators[name]++;

    this.timers[name] = Date.now() + loopLength;
    this.timeoutIds[name] = setTimeout(() => {
      this.playBar(name);
    }, loopLength);
  }

  pause() {
    if (!this.isPaused) {
      this.isPaused = true;
      if (this.audioContext.state === 'running') {
        Object.entries(this.timeoutIds).forEach(([name, pid]) => {
          this.resumeTimers[name] = this.timers[name] - Date.now();
          clearTimeout(pid);
        });
        this.audioContext.suspend();
      }
    }
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      if (this.audioContext.state === 'suspended') {
        Object.entries(this.resumeTimers).forEach(([name, length]) => {
          this.timers[name] = Date.now() + length;
          this.timeoutIds[name] = setTimeout(() => {
            this.playBar(name);
          }, length);
        });
        this.audioContext.resume();
      }
    }
  }

  playBgMusic(name: string) {
    this.stopBgMusic();
    this.isPaused = false;
    this.mainGainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    this.audioContext.resume();
    this.iterators[name] = 0;
    this.playBar(name);
  }

  isPlaying(name: string) {
    return this.timeoutIds[name] !== undefined;
  }

  stopBgMusic() {
    this.mainGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    this.audioNodes.forEach((audioNode) => audioNode.stop(0));
    Object.values(this.timeoutIds).forEach(clearTimeout);
    this.timeoutIds = {};
  }
}
