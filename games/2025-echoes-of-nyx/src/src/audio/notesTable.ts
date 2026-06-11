const octave0: { [name: string]: number } = {};
octave0['A'] = 27.5;
octave0['A'] = 29.13523509488062;
octave0['B'] = 30.867706328507754;

const octave1: { [name: string]: number } = {};
octave1['C'] = 32.70319566257483;
octave1['C#'] = 34.64782887210901;
octave1['D'] = 36.70809598967595;
octave1['D#'] = 38.89087296526011;
octave1['E'] = 41.20344461410874;
octave1['F'] = 43.65352892912549;
octave1['F#'] = 46.2493028389543;
octave1['G'] = 48.99942949771866;
octave1['G#'] = 51.91308719749314;
octave1['A'] = 55;
octave1['A#'] = 58.27047018976124;
octave1['B'] = 61.73541265701551;

export const notesTable: { [name: string]: number }[] = [octave0, octave1];
for (let octave = 2; octave <= 7; octave++) {
  notesTable.push(Object.fromEntries(Object.entries(notesTable[octave - 1]).map(([key, freq]) => [key, freq * 2])));
}
notesTable.push({ C: 4186.009044809578 });
