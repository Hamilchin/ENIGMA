

// #region - Sound Effects.
/*
Sound Effects v2.0.0.

A basic sound effect player that plays sounds created using ZzFX.

By Cliff Earl, Antix Development, 2022.

Usage:
------
To add a new sound effect, call fx_add(parameters) like so...
fx_add(1.01,.05,259,0,.1,.2,2,1.58,0,0,0,0,0,0,1.1,0,0,.7,.07,0);

To play a sound effect call fx_play(index)

If you were pondering  how parameters for new sound  effects are created, use
ZzFX  (https://github.com/KilledByAPixel/ZzFX).  NOTE:  Untick  the  "spread"
checkbox!

IMPORTANT!! THIS VERSION OF  THE CODE HAS  THE RANDOMNESS REMOVED SO YOU WILL 
HAVE TO MODIFY ANY SAMPLE DATA THAT YOU COPY FROM ZZFX BY REMOVING THE SECOND
NUMBER FROM  THE ARRAY (0.5  IN THE ABOVE  EXAMPLE STRING), WHICH  REPRESENTS 
RANDOMNESS.
  
There is also a global volume variable that you can poke... globalVolume

History:
--------
v2.0.1 (3/9/2025)
- Minor tweaks to save a handful of code bytes :).

v2.0.0 (12/9/2023)
- Major rewrite.
- Sampling rate increased from 44100 to 48000.
- fx_bs() functionality is now part of fx_add().
- parameters are now passed directly to fx_add(), instead of being passed as an array.
- Playing sound effects will now be stopped before plaing them again. This resolves the cacophony caused by playing the same sound effect in quick succession.
- General code refactoring.

v1.0.2 (6/9/2022)
- Added code to resolve strange repeating sound issue.

v1.0.1 (18/8/2022)
- Removed sound randomness.

Acknowledgements:
-----------------
This code is a modified version of zzfx.js, part of ZzFX.

ZzFX - Zuper Zmall Zound Zynth v1.1.6
By Frank Force 2019
https://github.com/KilledByAPixel/ZzFX

ZzFX MIT License

Copyright (c) 2019 - Frank Force

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

let globalVolume = .5; // Global volume.
let sampleRate = 48e3; // Sample rate.
let audioContext = 0; // Audio context.
let effects = []; // List of all sound effects (stored and accessed by index).

// Create and add samples to the list of all playable effects, using the given zzfx parameters (minus the random parameter).
let fx_add = (volume, frequency, attack, sustain, release, shape, shapeCurve, slide, deltaSlide, pitchJump, pitchJumpTime, repeatTime, noise, modulation, bitCrush, delay, sustainVolume, decay, tremolo) => {

  // init parameters
  let 
  sign = v => v > 0 ? 1 : -1, 
  startSlide = slide *= 500 * PI2 / sampleRate / sampleRate, 
  startFrequency = frequency *= PI2 / sampleRate, 
  S = [], // Samples.
  t = 0, 
  tm = 0, 
  i = 0, 
  j = 1, 
  r = 0, 
  c = 0, 
  s = 0, 
  f, 
  length;

  // scale by sample rate
  attack *= sampleRate + 9; // minimum attack to prevent pop
  decay *= sampleRate;
  sustain *= sampleRate;
  release *= sampleRate;
  delay *= sampleRate;
  deltaSlide *= 500 * PI2 / sampleRate ** 3;
  modulation *= PI2 / sampleRate;
  pitchJump *= PI2 / sampleRate;
  pitchJumpTime *= sampleRate;
  repeatTime = repeatTime * sampleRate | 0;

  // generate waveform
  for (length = attack + decay + sustain + release + delay | 0; i < length; S[i++] = s) {
    if (!(++c % (bitCrush * 100 | 0))) { // bit crush
      s = shape ? shape > 1 ? shape > 2 ? shape > 3 ? sin(t ** 3) : max(min(M.tan(t), 1), -1) : 1 - (2 * t / PI2 % 2 + 2) % 2 : 1 - 4 * abs(M.round(t / PI2) - t / PI2) : sin(t);
      s = (repeatTime ? 1 - tremolo + tremolo * sin(PI2 * i / repeatTime) : 1) * sign(s) * (abs(s) ** shapeCurve) * volume * globalVolume * (i < attack ? i / attack : i < attack + decay ? 1 - ((i - attack) / decay) * (1 - sustainVolume) : i < attack + decay + sustain ? sustainVolume : i < length - delay ? (length - i - delay) / release * sustainVolume : 0);
      s = delay ? s / 2 + (delay > i ? 0 : (i < length - delay ? 1 : (length - i) / delay) * S[i - delay | 0] / 2) : s;
    }

    f = (frequency += slide += deltaSlide) * cos(modulation * tm++); // Frequency
    t += f - f * noise * (1 - (sin(i) + 1) * 1e9 % 2); // Noise

    if (j && ++j > pitchJumpTime) { // Pitch jump
      frequency += pitchJump; // Apply pitch jump
      startFrequency += pitchJump; // Also apply to start
      j = 0; // Stop pitch jump time
    }

    if (repeatTime && !(++r % repeatTime)) { // Repeat
      frequency = startFrequency; // Reset frequency
      slide = startSlide; // Reset slide
      j = j || 1; // Reset pitch jump time
    }
  }

  effects.push({
    S,
    B: 0 // Buffer.
  });

};

// Play the fx with the given index, so long as audio is enabled.
let fx_play = id => {
  if (OPTIONS.a) {
    if (!audioContext) fx_newAudioContext(); // Create audio context if it does not exist.

    let soundEffect = effects[id];
  
    if (soundEffect.B) soundEffect.B.disconnect(audioContext.destination);
  
    let audioBuffer = audioContext.createBuffer(1, soundEffect.S.length, sampleRate), // NOTE: `createBuffer` is a method of `BaseAudioContext`, the parent class of `AudioContext`
    audioBufferSourceNode = audioContext.createBufferSource();
    audioBuffer.getChannelData(0).set(soundEffect.S);
    audioBufferSourceNode.buffer = audioBuffer;
    audioBufferSourceNode.connect(audioContext.destination);
    audioBufferSourceNode.start(0);

    soundEffect.B = audioBufferSourceNode;
  };
};

// Create the `AudioContext`.
let fx_newAudioContext = () => audioContext = new (W.AudioContext);

// Close the `AudioContext` and create a new one. This resolves a strange issue where sometimes a little droning sound plays and keeps playing, all the time gaining volume, until it is really annoying.
let fx_reset = () => {
  audioContext.close();
  fx_newAudioContext();
};

// #endregion

