import {pizzicatoStrings, shake} from "@/sounds/instruments";
import {audioContext, frequencyFromMidiNote} from "@/engine/audio/audio-helpers";

export function playWitchEscapeSound() {
  for (let i = 0; i < 15; i++) {
    pizzicatoStrings(audioContext.currentTime + i/15, 0.5, frequencyFromMidiNote(85 + i));
    pizzicatoStrings(audioContext.currentTime + i/15 + 0.5, 0.5, frequencyFromMidiNote(75 + i));
    pizzicatoStrings(audioContext.currentTime + i/15 + 0.7, 0.5, frequencyFromMidiNote(90 + i));
  }

  shake(audioContext.currentTime + 0.9, 1);
}