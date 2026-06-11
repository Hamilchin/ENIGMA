const ENHARMONICS = "B#-C|C#-Db|D|D#-Eb|E-Fb|E#-F|F#-Gb|G|G#-Ab|A|A#-Bb|B-Cb";
const MIDDLE_C = 440 * Math.pow(Math.pow(2, 1 / 12), -9);
const OCTAVE_OFFSET = 4;

const numericRegex = /^[0-9.]+$/;
const spaceRegex = /\s+/;
const numRegex = /(\d+)/;

const offsets: Record<string, number> = {};
ENHARMONICS.split("|").forEach((val, i) => {
  val.split("-").forEach((note) => {
    offsets[note] = i;
  });
});

export class Note {
  frequency: number;
  duration: number;

  constructor(str: string) {
    const [noteName, durationSymbol] = str.split(spaceRegex);
    this.frequency = Note.getFrequency(noteName) || 0;
    this.duration = Note.getDuration(durationSymbol) || 0;
  }

  static getFrequency(name: string): number {
    const parts = name.split(numRegex);
    const note = parts[0];
    const octave = parseInt(parts[1]) || OCTAVE_OFFSET;
    const distance = offsets[note];
    const octaveDiff = octave - OCTAVE_OFFSET;
    const freq = MIDDLE_C * Math.pow(Math.pow(2, 1 / 12), distance);
    return freq * Math.pow(2, octaveDiff);
  }

  static getDuration(symbol: string): number {
    if (numericRegex.test(symbol)) {
      return parseFloat(symbol);
    }
    return symbol
      .toLowerCase()
      .split("")
      .reduce((prev, curr) => {
        switch (curr) {
          case "w":
            return prev + 4; // whole
          case "h":
            return prev + 2; // half
          case "q":
            return prev + 1; // quarter
          case "e":
            return prev + 0.5; // eighth
          case "s":
            return prev + 0.25; // sixteenth
          default:
            return prev;
        }
      }, 0);
  }
}
