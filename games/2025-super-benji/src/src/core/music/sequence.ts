import { Note } from "./note";

export class Sequence {
  private ac: AudioContext;
  tempo: number;
  notes: Note[] = [];
  loop = true;
  smoothing = 0; // seconds of portamento (max)
  staccato = 0; // 0..1 fraction of note length to be silent
  waveType: OscillatorType = "square";

  private osc: OscillatorNode | null = null;
  private gain: GainNode;
  private dry: GainNode;
  private wet: GainNode;
  private filters: BiquadFilterNode[] = [];

  constructor(ac: AudioContext, tempo = 120, notes?: (Note | string)[]) {
    this.ac = ac;
    this.tempo = tempo;
    this.gain = this.ac.createGain();
    this.dry = this.ac.createGain();
    this.wet = this.ac.createGain();
    this.createFxNodes();

    if (notes) this.push(...notes);
  }

  private createFxNodes() {
    const eqConfig: [string, number][] = [
      ["bass", 100],
      ["mid", 1000],
      ["treble", 2500],
    ];

    let prev: AudioNode = this.gain;
    eqConfig.forEach(([_, freq]) => {
      const filter = this.ac.createBiquadFilter();
      filter.type = "peaking";
      filter.frequency.value = freq;
      prev.connect(filter);
      prev = filter;
      this.filters.push(filter);
    });

    prev.connect(this.wet);
    prev.connect(this.dry);
  }

  push(...notes: (Note | string)[]) {
    notes.forEach((n) => this.notes.push(n instanceof Note ? n : new Note(n)));
  }

  connect(destination: AudioNode) {
    this.dry.connect(destination);
    this.wet.connect(destination);
  }

  private createOscillator() {
    this.stop(); // clean previous
    this.osc = this.ac.createOscillator();
    this.osc.type = this.waveType;
    this.osc.connect(this.gain);
  }

  private secsPerBeat() {
    return 60 / this.tempo;
  }

  private scheduleNote(index: number, when: number): number {
    const n = this.notes[index];
    const spb = this.secsPerBeat();
    const duration = spb * n.duration;

    // gate portion (note length portion that is "on")
    const gate = duration * (1 - (this.staccato || 1e-10));

    // small envelope constants to avoid clicks
    // smoother envelope constants
    const attack = 0.01; // 10 ms
    const release = 0.05; // 50 ms

    // cancel stale automation
    this.gain.gain.cancelScheduledValues(when);
    this.osc!.frequency.cancelScheduledValues(when);

    if (n.frequency > 0) {
      this.osc!.frequency.setValueAtTime(n.frequency, when);

      // Gain envelope (use exponential for smoother fades)
      this.gain.gain.setValueAtTime(0.0001, when); // start just above 0
      this.gain.gain.exponentialRampToValueAtTime(1.0, when + attack);

      // sustain
      this.gain.gain.setValueAtTime(
        1.0,
        when + Math.max(attack, gate - release)
      );

      // release
      this.gain.gain.exponentialRampToValueAtTime(0.0001, when + gate);
    } else {
      // REST: force silence
      this.gain.gain.cancelScheduledValues(when);
      this.gain.gain.setValueAtTime(0.0001, when);
    }

    return when + duration;
  }

  play(when: number = this.ac.currentTime) {
    if (this.notes.length === 0) return;

    this.createOscillator();

    // start silent to avoid initial click
    this.gain.gain.setValueAtTime(0, when);
    this.osc!.start(when);

    let t = when;
    for (let i = 0; i < this.notes.length; i++) {
      t = this.scheduleNote(i, t);
    }

    // ensure tail is silent before stopping
    const stopAt = t + 0.02;
    this.gain.gain.setValueAtTime(0, t);
    this.osc!.stop(stopAt);

    this.osc!.onended = this.loop ? () => this.play(t) : null;
  }

  stop() {
    if (this.osc) {
      try {
        this.osc.onended = null;
        const now = this.ac.currentTime;
        this.gain.gain.cancelScheduledValues(now);
        this.gain.gain.setValueAtTime(this.gain.gain.value, now);
        this.gain.gain.linearRampToValueAtTime(0, now + 0.01);
        this.osc.frequency.cancelScheduledValues(now);
        this.osc.stop(now + 0.02);
      } catch {}
      this.osc = null;
    }
  }
}
