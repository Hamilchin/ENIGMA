export abstract class Instrument {
  audioContext: AudioContext;
  targetNode: AudioNode;

  constructor(audioContext: AudioContext, targetNode: AudioNode) {
    this.audioContext = audioContext;
    this.targetNode = targetNode;
  }

  abstract playNote(
    time: number,
    duration?: number,
    key?: string,
    octave?: number,
  ): (AudioScheduledSourceNode | AudioBufferSourceNode)[];
}
