import {accousticGuitar, pizzicatoStrings} from "@/sounds/instruments";
import {audioContext, frequencyFromMidiNote} from "@/engine/audio/audio-helpers";

const melody = '(v(vGRv`R_Rv_wj^RFAvFSqx(ARv`R_jvpxjx_Vvw)ARv`R_Rv_wj^RFAvFSqw)AS`R^vjvqwkwsy';
const baselineEncoded = `HSHSCMCMCMCM@G@G@G@GCGCGAJAJ@G@G@G@GCMCMBMBM@G@G@G@GCLCLCMCMGJGT`;

function decodeNote(char: string, directVal?: boolean): [number, number] {
  const val = char.charCodeAt(0) - 33;

  if (directVal) {
    return [val, 2];
  }

  const pitch = Math.floor(val / 6);
  const length = val % 6;
  let midiNote;
  if (pitch === 14) {
    midiNote = 0; // rest
  } else {
    midiNote = 74 + pitch;
  }
  return [midiNote, length];
}

const song = [
  [...melody.split('').map(val => decodeNote(val))],
  [...baselineEncoded.split('').map(val => decodeNote(val, true))],
];


export function playSong() {
  const playbackSpeed = 9;
  const instruments = [pizzicatoStrings, accousticGuitar];

    song.forEach((instrument, i) => {
      let startTime = 0;
      instrument.forEach(note => {
        if (note[0]) {
          const noteDuration = note[1] / playbackSpeed;
          instruments[i](audioContext.currentTime + startTime, noteDuration, frequencyFromMidiNote(note[0]));

          startTime += noteDuration;
        } else {
          startTime += note[1] / playbackSpeed;
        }
      });
    });
}