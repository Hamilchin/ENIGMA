import { Sequence } from "./sequence";
import { DrumSynth } from "./drumSynth";

export class MusicPlayer {
  private ac: AudioContext;
  private output: GainNode;
  private compressor: DynamicsCompressorNode;
  private tempo = 174;
  private volume = 0.1;

  private currentStep = 0;
  private schedulerId: number | null = null;
  private scheduleAheadTime = 0.1; // 100ms lookahead
  private stepLength: number;

  lead: Sequence;
  bass: Sequence;
  drumSynth: DrumSynth;
  isPlaying = false;

  constructor() {
    this.ac = new AudioContext();
    this.output = this.ac.createGain();
    this.compressor = this.ac.createDynamicsCompressor();
    this.drumSynth = new DrumSynth(this.ac, this.compressor);

    this.output.connect(this.ac.destination);
    this.output.gain.value = this.volume;

    this.compressor.ratio.value = 4;
    this.compressor.threshold.value = -12;
    this.compressor.connect(this.output);

    // --- Lead ---
    const coreLead = [
      "D4 q",
      "A4 q",
      "B3 q",
      "- q",
      "- q",
      "- q",
      "- q",
      "- q",
    ];
    const offLead = ["D4 q", "E4 q", "B3 q", "- q", "- q", "- q", "- q", "- q"];
    this.lead = new Sequence(this.ac, this.tempo, [
      ...coreLead,
      "- f",
      ...offLead,
      "- f",
    ]);
    this.lead.staccato = 0.2;
    this.lead.smoothing = 0.2;
    this.lead.waveType = "sine";
    this.lead.connect(this.compressor);

    // --- Bass ---
    this.bass = new Sequence(this.ac, this.tempo, [
      "B1 h",
      "- h",
      "B1 h",
      "- h",
      "D2 h",
      "- h",
      "D2 h",
      "- h",
    ]);
    this.bass.staccato = 0;
    this.bass.smoothing = 0;
    this.bass.waveType = "triangle";
    const bassGain = this.ac.createGain();
    bassGain.gain.value = 1.5;

    this.bass.connect(bassGain);
    bassGain.connect(this.compressor);

    this.stepLength = 60 / this.tempo / 4;
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    const now = this.ac.currentTime;
    const barLength = (60 / this.tempo) * 4;

    this.lead.play(now + barLength * 8);
    this.bass.play(now);

    const schedule = () => {
      const now = this.ac.currentTime;

      while (
        this.currentStep * this.stepLength <
        now + this.scheduleAheadTime
      ) {
        const stepTime = this.currentStep * this.stepLength;

        // Only start drums after 16 bars
        if (this.currentStep >= 256) {
          // Reduced hi-hat: play only on selected steps for swing
          if ([0, 3, 6, 10, 12, 15].includes(this.currentStep % 16)) {
            this.drumSynth.playHiHat(stepTime);
          }

          // Kick pattern with slight swing
          if ([0, 7].includes(this.currentStep % 16)) {
            this.drumSynth.playKick(stepTime);
          }

          // Snare on 4 and 12 (classic DnB break)
          if ([4, 12].includes(this.currentStep % 16)) {
            this.drumSynth.playSnare(stepTime);
          }
        }

        this.currentStep++;
      }

      this.schedulerId = window.setTimeout(schedule, 25);
    };

    schedule();
  }

  stop() {
    this.lead.stop();
    this.bass.stop();

    this.isPlaying = false;
    if (this.schedulerId) clearTimeout(this.schedulerId);
    this.currentStep = 0;
  }

  playExplosionSound() {
    const ac = this.ac;
    const now = ac.currentTime;

    // --- Noise burst ---
    const buf = ac.createBuffer(1, ac.sampleRate * 0.3, ac.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const noise = ac.createBufferSource();
    noise.buffer = buf;

    const filt = ac.createBiquadFilter();
    filt.type = "bandpass";
    filt.frequency.value = 800;

    const g = ac.createGain();
    g.gain.setValueAtTime(3, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    noise.connect(filt).connect(g).connect(this.compressor);
    noise.start(now);
    noise.stop(now + 0.3);

    // --- Boom using oscEnv ---
    this.oscEnv(ac, "sine", 100, now, 0.5, this.compressor, 4, 0.001);
    this.oscEnv(ac, "sawtooth", 55, now, 0.3, this.compressor, 2, 0.001);
  }

  playMenuSuccess() {
    [880, 1174, 1568].forEach((f, i) =>
      this.oscEnv(
        this.ac,
        "sine",
        f,
        this.ac.currentTime + i * 0.1,
        0.6,
        this.compressor,
        0.5,
        0.001
      )
    );
  }

  playTakeDamage() {
    // Reuse function to save some bytes
    this.oscEnv(
      this.ac,
      "square",
      600,
      this.ac.currentTime,
      0.15,
      this.compressor,
      0.6,
      0.001
    );
  }

  oscEnv(
    ac: AudioContext,
    type: OscillatorType,
    freq: number,
    start: number,
    duration: number,
    compressor: AudioNode,
    gainStart: number,
    gainEnd: number
  ) {
    const o = ac.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, start);

    const g = ac.createGain();
    g.gain.setValueAtTime(gainStart, start);
    g.gain.exponentialRampToValueAtTime(gainEnd, start + duration);

    o.connect(g).connect(compressor);
    o.start(start);
    o.stop(start + duration);
  }
}
