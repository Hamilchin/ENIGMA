export class DrumSynth {
  private ac: AudioContext;
  private output: AudioNode;

  kickGain = 4;
  snareGain = 4;
  hithatGain = 2.4;

  constructor(ac: AudioContext, output: AudioNode) {
    this.ac = ac;
    this.output = output;
  }

  playKick(time: number = this.ac.currentTime, ghostGain?: number) {
    const osc = this.ac.createOscillator();
    const gain = this.ac.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.08);

    gain.gain.setValueAtTime(ghostGain ?? this.kickGain, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    osc.connect(gain).connect(this.output);
    osc.start(time);
    osc.stop(time + 0.09);
  }

  playSnare(time: number = this.ac.currentTime, ghostGain?: number) {
    const noiseBuffer = this.ac.createBuffer(
      1,
      this.ac.sampleRate * 0.2,
      this.ac.sampleRate
    );
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < output.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ac.createBufferSource();
    noise.buffer = noiseBuffer;

    const gain = this.ac.createGain();
    gain.gain.setValueAtTime(ghostGain ?? this.snareGain, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

    noise.connect(gain).connect(this.output);
    noise.start(time);
    noise.stop(time + 0.2);
  }

  playHiHat(time: number = this.ac.currentTime, ghostGain?: number) {
    const noiseBuffer = this.ac.createBuffer(
      1,
      this.ac.sampleRate * 0.05,
      this.ac.sampleRate
    );
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < output.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ac.createBufferSource();
    noise.buffer = noiseBuffer;

    const gain = this.ac.createGain();
    gain.gain.setValueAtTime(ghostGain ?? this.hithatGain, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    noise.connect(gain).connect(this.output);
    noise.start(time);
    noise.stop(time + 0.05);
  }
}
