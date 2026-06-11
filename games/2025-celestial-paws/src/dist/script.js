/*
        <ellipse cx="109.5" cy="287" rx="18" ry="17.5" />
        <ellipse cx="40.5" cy="287" rx="18" ry="17.5" />
*/

document.getElementById('svgs').innerHTML = `<defs>
      <svg id="catbod" viewBox="0 0 154 335" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="70" cy="82" rx="65" ry="48"/>
        <ellipse cx="77" cy="193.5" rx="50.5" ry="104.5" />
        <ellipse cx="77" cy="233" rx="70.5" ry="72" />
        <ellipse class="ear" cx="105" cy="30" rx="15" ry="25" />
        <ellipse class="ear" cx="40" cy="30" rx="15" ry="25" />        
      </svg>
      <filter id="goo"
        x="-50%" y="-50%" width="200%" height="200%"
        color-interpolation-filters="sRGB">
  <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur"/>
  <feColorMatrix in="blur" result="goo" type="matrix"
    values="1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 25 -8"/>
  <feBlend in="SourceGraphic" in2="goo" mode="normal"/>
</filter>`;

const R = (a = 1, b = 0) => Math.random() * (a - b) + b;

const zzfx = (...t) => zzfxP(zzfxG(...t)),
  zzfxX = new AudioContext(),
  zzfxP = (...t) => {
    let a = zzfxX.createBuffer(t.length, t[0].length, 44100),
      e = zzfxX.createBufferSource();
    return (
      t.map((t, e) => a.getChannelData(e).set(t)),
      (e.buffer = a),
      e.connect(zzfxX.destination),
      e.start(),
      e
    );
  },
  zzfxG = (
    t = 1,
    a = 0.05,
    e = 220,
    n = 0,
    z = 0,
    h = 0.1,
    f = 0,
    s = 1,
    M = 0,
    r = 0,
    x = 0,
    o = 0,
    i = 0,
    c = 0,
    u = 0,
    l = 0,
    b = 0,
    d = 1,
    m = 0,
    X = 0,
    g = 0
  ) => {
    let P,
      B,
      C = 2 * Math.PI,
      G = t => (t < 0 ? -1 : 1),
      p = (M *= (500 * C) / 44100 / 44100),
      w = (e *= ((1 + 2 * a * Math.random() - a) * C) / 44100),
      A = [],
      D = 0,
      I = 0,
      R = 0,
      S = 1,
      V = 0,
      j = 0,
      k = 0,
      q = (C * Math.abs(g) * 2) / 44100,
      v = Math.cos(q),
      y = Math.sin(q) / 2 / 2,
      E = 1 + y,
      F = (-2 * v) / E,
      H = (1 - y) / E,
      J = (1 + G(g) * v) / 2 / E,
      K = -(G(g) + v) / E,
      L = J,
      N = 0,
      O = 0,
      Q = 0,
      T = 0;
    for (
      r *= (500 * C) / 44100 ** 3,
        u *= C / 44100,
        x *= C / 44100,
        o *= 44100,
        i = (44100 * i) | 0,
        t *= 0.3,
        B =
          ((n = 44100 * n + 9) +
            (m *= 44100) +
            (z *= 44100) +
            (h *= 44100) +
            (b *= 44100)) |
          0;
      R < B;
      A[R++] = k * t
    )
      (++j % ((100 * l) | 0) ||
        ((k = f
          ? f > 1
            ? f > 2
              ? f > 3
                ? Math.sin(D ** 3)
                : Math.max(Math.min(Math.tan(D), 1), -1)
              : 1 - (((((2 * D) / C) % 2) + 2) % 2)
            : 1 - 4 * Math.abs(Math.round(D / C) - D / C)
          : Math.sin(D)),
        (k =
          (i ? 1 - X + X * Math.sin((C * R) / i) : 1) *
          G(k) *
          Math.abs(k) ** s *
          (R < n
            ? R / n
            : R < n + m
              ? 1 - ((R - n) / m) * (1 - d)
              : R < n + m + z
                ? d
                : R < B - b
                  ? ((B - R - b) / h) * d
                  : 0)),
        (k = b
          ? k / 2 +
            (b > R
              ? 0
              : ((R < B - b ? 1 : (B - R) / b) * A[(R - b) | 0]) / 2 / t)
          : k),
        g && (k = T = L * N + K * (N = O) + J * (O = k) - H * Q - F * (Q = T))),
        (P = (e += M += r) * Math.cos(u * I++)),
        (D += P + P * c * Math.sin(R ** 5)),
        S && ++S > o && ((e += x), (w += x), (S = 0)),
        !i || ++V % i || ((e = w), (M = p), (S = S || 1)));
    return A;
  };

{
  let e, t, n, f, s, a, i, d, u, h, g, y, b, m, x, T, j;
  ((f = (n = Object).getPrototypeOf),
    (s = document),
    (i = {}),
    (d = f((a = { isConnected: 1 }))),
    (m = t =>
      new Proxy(
        (l, ...r) => {
          let [o, ...a] = f(r[0] ?? 0) === d ? r : [{}, ...r],
            _ = t ? s.createElementNS(t, l) : s.createElement(l);
          for (let [t, r] of n.entries(o)) {
            let o = l =>
                l ? (n.getOwnPropertyDescriptor(l, t) ?? o(f(l))) : e,
              s = l + "," + t,
              a = i[s] ?? (i[s] = o(f(_))?.set ?? 0),
              d = a ? a.bind(_) : _.setAttribute.bind(_, t),
              w = f(r ?? 0);
            w === g
              ? y(() => (d(r.val), _))
              : w !== u || (t.startsWith("on") && !r.h)
                ? d(r)
                : y(() => (d(r()), _));
          }
          return b(_, ...a);
        },
        { get: (t, l) => t.bind(e, l) }
      )),
    (j = {
      add: (b = (t, ...l) => {
        for (let r of l.flat(1 / 0)) {
          let l = f(r ?? 0),
            o = l === g ? y(() => r.val) : l === u ? y(r) : r;
          o != e && t.append(o);
        }
        return t;
      }),
      _: e => ((e.h = 1), e),
      tags: m(),
    }),
    (window.van = j));
}

let sourceIndex = 0;
let gl;

const sources = [];

function initScene(canvasName, shaderText) {
  let bufObj = {};
  let canvas = document.getElementById(canvasName);
  gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) return;

  let progDraw = gl.createProgram();
  for (let i = 0; i < 2; ++i) {
    let source =
      i == 0 ? document.getElementById("draw-shader-vs").text : shaderText;
    if (i == 1) {
      source = `
          precision mediump float;
          uniform vec2 iResolution;
          uniform vec2 iMouse;
          uniform float iTime;
          ${source}
          void main() 
          {
              mainImage( gl_FragColor, gl_FragCoord.xy );
          }`;
    }
    let shaderObj = gl.createShader(
      i == 0 ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER
    );
    gl.shaderSource(shaderObj, source);
    gl.compileShader(shaderObj);
    let status = gl.getShaderParameter(shaderObj, gl.COMPILE_STATUS);
    if (!status) alert(gl.getShaderInfoLog(shaderObj));
    gl.attachShader(progDraw, shaderObj);
    gl.linkProgram(progDraw);
  }
  status = gl.getProgramParameter(progDraw, gl.LINK_STATUS);
  if (!status) alert(gl.getProgramInfoLog(progDraw));
  progDraw.inPos = gl.getAttribLocation(progDraw, "inPos");
  progDraw.iTime = gl.getUniformLocation(progDraw, "iTime");
  progDraw.iMouse = gl.getUniformLocation(progDraw, "iMouse");
  progDraw.iResolution = gl.getUniformLocation(progDraw, "iResolution");
  gl.useProgram(progDraw);

  var pos = [-1, -1, 1, -1, 1, 1, -1, 1];
  var inx = [0, 1, 2, 0, 2, 3];
  bufObj.pos = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufObj.pos);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
  bufObj.inx = gl.createBuffer();
  bufObj.inx.len = inx.length;
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufObj.inx);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(inx), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(progDraw.inPos);
  gl.vertexAttribPointer(progDraw.inPos, 2, gl.FLOAT, false, 0, 0);

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  return { canvas, progDraw, gl, progDraw, bufObj };
}

let paused = true;
let startTime = performance.now();
let pauseTime = 0;

function render() {
  if (!paused) {
    const now = performance.now();
    const elapsed = (now - startTime) / 1000; // in seconds

    sources.forEach(c => {
      c.canvas.style.display = "none";
    });

    const { canvas: canvas1, gl, progDraw, bufObj } = sources[sourceIndex];
    canvas1.width = window.innerWidth * 0.45;
    canvas1.height = window.innerHeight * 0.45;
    canvas1.style.display = "block";

    gl.viewport(0, 0, canvas1.width,canvas1.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniform1f(progDraw.iTime, elapsed);
    gl.uniform2f(progDraw.iResolution, canvas1.width, canvas1.height);
    gl.drawElements(gl.TRIANGLES, bufObj.inx.len, gl.UNSIGNED_SHORT, 0);

    const ss = document.getElementById('ss');
    if(ss) {
      ss.style.transform = `translateY(${Math.sin(elapsed)  * -20}vh)`;
    }
  }

  requestAnimationFrame(render);
}


const instruments = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
];

const drums = ["a", "c", "b"];
const drumPatterns = ["a", "b"];
let timeouts = [];

const scales = {
  major: [0, 2, 4, 5, 7, 9, 11],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10],
  blues: [0, 3, 5, 6, 7, 10],
};

let defaultSettings = {
  instrument: "a",
  scale: "blues",
  tempo: 70,
  scaleChange: 4,
  drumType: "b",
  drumType2: null,
  baseNote: 60,
  drumPattern: "b",
  measures: [],
  measureSFX: [,5,100,.01,.2,.09,1,2.2,-10,25,,,,,.5,,,.94,.1,,-1140],
  doubleDrum: 1,
};

const getFrequency = (
  { scale = "chromatic", degree = 1, octave = 4 },
  settings = defaultSettings
) => {
  const baseNote = settings.baseNote; // 0 = C4
  const scaleDegrees = scales[scale]; // semitone offsets
  const semitoneOffset = scaleDegrees[degree % scaleDegrees.length];
  const scaleLength = scaleDegrees.length;
  const octaveOffset = Math.floor(degree / scaleLength);
  const midiNote = baseNote + semitoneOffset + 12 * (octave - 4 + octaveOffset);

  return 440 * 2 ** ((midiNote - 69) / 12);
};

let audioContext = new AudioContext();
let audioBuffer;
let count = 0;

const createNewBuffer = duration => {
  if (audioContext && audioContext.state !== "closed") {
    audioContext.close();
  }
  audioContext = new AudioContext();
  audioBuffer = audioContext.createBuffer(
    1,
    Math.ceil(44100 * duration),
    44100
  );
  return audioBuffer;
};

const lerp = (a, b, x) => a + (b - a) * x;
const gauss = (x, mu, sigma) => Math.exp(-0.5 * ((x - mu) / sigma) ** 2);

const synthFunction = (sampleIndex, frequency, settings = defaultSettings) => {
  const sampleRate = 44100;
  const durationInSamples = sampleRate;
  const t = sampleIndex / sampleRate;
  const u = Math.min(1, sampleIndex / durationInSamples); // 0..1 progress
  const omega = 2 * Math.PI * frequency;

  // Envelope shaping
  const attackTime = 0.02;
  const releaseTime = 0.02;
  const sustainLevel = 0.7;

  const attackSamples = Math.floor(attackTime * sampleRate);
  const releaseSamples = Math.floor(releaseTime * sampleRate);
  const sustainSamples = Math.max(
    0,
    durationInSamples - attackSamples - releaseSamples
  );

  let envelope;
  if (sampleIndex < attackSamples) {
    const a = sampleIndex / attackSamples;
    envelope = a * a; // smoother fade-in
  } else if (sampleIndex < attackSamples + sustainSamples) {
    envelope = sustainLevel;
  } else if (sampleIndex < durationInSamples) {
    const r = (sampleIndex - attackSamples - sustainSamples) / releaseSamples;
    envelope = sustainLevel * (1 - r) ** 2; // smoother fade-out
  } else {
    return 0;
  }

  let rawSample;

  switch (settings.instrument) {
    case "f":
    case "c":
      let semi;
      if (u < 0.35)
        semi = lerp(-2, +6, u / 0.35); // rise
      else semi = lerp(+6, -7, (u - 0.35) / 0.65); // fall
      // tiny vibrato
      const vib =
        (settings.instrument === "c" ? 0.01 : 0.002) *
        Math.sin(2 * Math.PI * 5 * t); // ±2% at 5 Hz
      const instFreq = frequency * Math.pow(2, semi / 12) * (1 + vib);

      const F1 = lerp(500, 900, u); // formant 1 (Hz)
      const F2 = lerp(1800, 1100, u); // formant 2 (Hz)
      const BW1 = 120,
        BW2 = 180; // bandwidths

      let s = 0,
        norm = 0;
      const H = 12; // number of harmonics (tradeoff cpu vs quality)
      for (let k = 1; k <= H; k++) {
        const hk = k * instFreq;
        const w = gauss(hk, F1, BW1) + 0.6 * gauss(hk, F2, BW2); // F2 softer
        s += w * Math.sin(2 * Math.PI * hk * t);
        norm += w;
      }
      s = norm > 0 ? s / norm : 0;

      const mDur = 0.06; // seconds
      const mAmt = Math.max(0, 1 - t / mDur); // fades out quickly
      const mNoise = (R() * 2 - 1) * 0.15 * mAmt;

      rawSample = 0.9 * s + mNoise;
      break;

    case "b":
      rawSample =
        0.6 * Math.sin(omega * t) +
        0.4 * Math.sin(omega * t * 2) +
        0.2 * Math.sin(omega * t * 4);
      break;

    case "a":
      let wsum = 0;
      let stum = 0;

      for (let i = 0; i < 10; i++) {
        const f = frequency * i * (0.5 + 0.501 * i); // micro-detune
        const a = 1 / (1 + 0.7 * i); // amplitude roll-off
        const d = Math.exp((-3 - i * 0.2) * t); // per-mode decay
        stum += a * Math.sin(2 * Math.PI * f * t) * d;
        wsum += a;
      }
      rawSample = wsum ? stum / wsum : 0;
      break;

    case "e":
      const modulator = Math.sin(2 * Math.PI * frequency * 2 * t) * 100;
      rawSample = 0.25 * Math.sin(2 * Math.PI * frequency * t + modulator);
      break;

    case "d":
    default:
      rawSample = Math.sin(omega * t);
      break;
  }

  let sample = envelope * rawSample * 0.35;
  if (!Number.isFinite(sample)) sample = 0;
  sample = Math.max(-1, Math.min(1, sample));

  return sample;
};

const addNoteToBuffer = (noteObject, settings = defaultSettings) => {
  const { degree, octave, duration } = noteObject;

  if (degree === null || audioBuffer === null) {
    return; // Skip adding any sound to the buffer
  }

  noteObject.scale = settings.scale;
  const frequency = getFrequency(noteObject);

  const lengthInSamples = Math.floor(44100 * duration * (60 / settings.tempo));
  const startSample = Math.floor(audioContext.currentTime * 44100);
  const D = [];

  for (let i = 0; i < lengthInSamples; i++) {
    const decay = i < 88 ? i / 88.2 : 1 - (i - 88.2) / (lengthInSamples - 88.2);
    D[i] = decay * synthFunction(i, frequency); // use piano/guitar synthesis
  }

  const bufferData = audioBuffer.getChannelData(0);

  for (let i = 0; i < lengthInSamples; i++) {
    const writeIndex = startSample + i;
    if (writeIndex < bufferData.length) {
      bufferData[writeIndex] += D[i]; // critical change: additive
    }
  }
};

let bufferSource;
let masterGain;

const makeReverbIR = (context, duration = 2, decay = 2) => {
  const sampleRate = context.sampleRate;
  const length = duration * sampleRate;
  const ir = context.createBuffer(2, length, sampleRate);

  for (let channel = 0; channel < 2; channel++) {
    const data = ir.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      // white noise * exponential decay
      data[i] = (R() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return ir;
};

const startPlayback = (settings = defaultSettings) => {
  return new Promise((resolve, reject) => {
    if (!audioContext || !audioBuffer) {
      reject("Audio context or buffer is missing.");
      return;
    }

    if (bufferSource) {
      bufferSource.stop(); // optional safety
      bufferSource.disconnect();
    }

    bufferSource = audioContext.createBufferSource();
    bufferSource.buffer = audioBuffer;
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.8;
    // volumeSlider && volumeSlider.value ? parseFloat(volumeSlider.value) : 1; // global volume

    // convolver with inline IR
    const convolver = audioContext.createConvolver();
    const reverbDuration = 1.5;
    convolver.buffer = makeReverbIR(audioContext, reverbDuration, 3); // keeping these consistant w/o settings

    // dry path (optional: include lowpass here too)
    bufferSource.connect(masterGain);

    // wet path with filter
    bufferSource.connect(convolver);
    convolver.connect(masterGain);

    masterGain.connect(audioContext.destination);
    const duration = audioBuffer.length / audioContext.sampleRate;

    bufferSource.start();

    // create a new buffer after playback
    timeouts.push(
      setTimeout(() => {
        resolve();
      }, duration * 1000)
    );
  });
};

const bpmToMilliseconds = bpm => 60000 / bpm;

const addDrumToBuffer = (timeOffset, settings = defaultSettings) => {
  if (settings.drumType === null || audioBuffer === null) {
    return;
  }
  const sampleRate = 44100;
  const bufferData = audioBuffer.getChannelData(0);

  const duration = 0.1; // up to 100 ms per drum hit
  const length = Math.floor(sampleRate * duration);

  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    let env = 1;
    let sample = 0;

    switch (settings.drumType) {
      case "b":
        env = Math.exp(-140 * t);
        sample = 2 * Math.sin(2 * Math.PI * 150 * t * Math.exp(-30 * t)) * env;
        sample *= 1.5;
        break;

      case "c":
        env = Math.exp(-20 * t);
        const noise = R() * 2 - 1;
        sample = (0.5 * noise + 0.5 * Math.sin(2 * Math.PI * 200 * t)) * env;
        sample *= 0.3;
        break;

      case "a":
      default:
        env = Math.exp(-40 * t);
        sample = (R() * 2 - 1) * env;
        sample *= 0.5;
        break;
    }

    if (!Number.isFinite(sample)) sample = 0;
    sample = Math.max(-1, Math.min(1, sample));

    const idx = timeOffset + i;
    if (idx < bufferData.length) bufferData[idx] += sample * 0.5;
  }
};

const addDrumLoop = (settings = defaultSettings) => {
  const tempo = settings.tempo * settings.doubleDrum || 1;
  const samplesPerBeat = Math.floor(
    ((0.5 * bpmToMilliseconds(tempo)) / 1000) * 44100
  );
  const offsetShift = ~~(0.2 * (bpmToMilliseconds(tempo) / 1000) * 44100);

  for (let i = 0; i < 200; i++) {
    let offset = i * samplesPerBeat;

    switch (settings.drumPattern) {
      case "a":
        if (i % 4 === 0) {
          addDrumToBuffer(offset, {
            ...settings,
            drumType: settings.drumType,
          });
        }
        if (i % 8 === 5) {
          addDrumToBuffer(offset + samplesPerBeat, {
            ...settings,
            drumType: settings.drumType2,
          });
        }
        if (i % 16 === 15) {
          addDrumToBuffer(offset - offsetShift, {
            ...settings,
            drumType: settings.drumType,
          });
        }
        break;

      case "b":
      default:
        addDrumToBuffer(offset, {
          ...settings,
          drumType: i % 2 === 0 ? settings.drumType : settings.drumType2,
        });

        if (i % 8 === 0) {
          addDrumToBuffer(offset - offsetShift, {
            ...settings,
            drumType: i % 2 === 0 ? settings.drumType : settings.drumType2,
          });
        }
        break;
    }
  }
};

const playMeasure = async (measure, settings = defaultSettings) => {
  const interval = bpmToMilliseconds(settings.tempo);
  let currentTime = 0;

  // Calculate total duration of the measure
  const rawDuration = Math.ceil(
    measure.reduce((acc, note) => acc + note.duration, 3)
  );
  const totalDuration = interval * 0.005 + Math.ceil(rawDuration * 4) / 4;

  // Create a new buffer for this measure
  createNewBuffer(totalDuration * (60 / settings.tempo));

  measure.forEach(note => {
    let timeoutDelay;
    timeoutDelay = currentTime + interval * note.duration;
    timeouts.push(
      setTimeout(() => {
        addNoteToBuffer({ ...note }, settings);
      }, timeoutDelay)
    );
    currentTime = timeoutDelay;
  });

  addDrumLoop(settings);


};

const newMotifMeasure = settings => {
  const noteSpread = 8;
  const base = ~~(R() * noteSpread);
  const oct = [2, 3, 4, 5];

  const types = {
    ascend: [0, 2, 4, 5],
    descend: [5, 4, 2, 0],
    arch: [0, 3, 5, 2],
    zigzag: [0, 5, 1, 4],
    cascade: [0, 1, 2, 4],
  };

  const rhythmPatterns = [
    [...new Array(10)].map(a => 0.25),
    [0.5, 0.5, 0.25, 0.75],
    [0.25, 0.25, 0.25, 0.25, 1],
    [4, 2, 2],
    [0.75, 0.25, 0.5, 0.5],
    [0, 2, 0, 2],
    [1, 2, 1, 4],
  ];

  const typeKeys = Object.keys(types);
  const seq = types[typeKeys[~~(R() * typeKeys.length)]];
  const rhythm = rhythmPatterns[~~(R() * rhythmPatterns.length)];
  const articulation = 1; //R() < 0.5 ? 0.8 : 1;

  const note = (d, o, t = 0.5) =>
    R() < 0.25
      ? { degree: null, octave: null, duration: t }
      : { degree: d, octave: o, duration: t };

  const motif = seq.map((s, i) =>
    note(
      (base + s + noteSpread) % noteSpread,
      oct[~~(R() * oct.length)],
      rhythm[i % rhythm.length] * articulation
    )
  );

  // Add some rests at the end with a small probability
  if (R() < 0.3) {
    const restCount = ~~(R() * 3) + 1;
    for (let i = 0; i < restCount; i++) {
      motif.push({
        degree: null,
        octave: null,
        duration: 0.25 + R() * 0.5,
      });
    }
  }

  // Optionally mirror the motif
  if (R() < 0.4) {
    const mirror = motif.map((n, i) =>
      n.degree == null
        ? n
        : note(
            R() > 0.5
              ? base - (n.degree - base)
              : n.degree + (i % 2 ? -1 : 1),
            n.octave,
            n.duration
          )
    );
    return motif.concat(mirror);
  }

  return motif;
};

const newMeasure = async (settings = defaultSettings) => {
  if (!playing) {
    return;
  }
  if (settings.measures.length === 0) {
    // Predefined melodic motifs
    for (let i = 0; i < 5; i++) {
      settings.measures.push(newMotifMeasure(settings));
    }
  }

  let measure = settings.measures[count % settings.measures.length];
  playMeasure(measure);

  const totalDuration = measure.reduce(
    (o, n) => o + (n.degree !== null ? n.duration : 0),
    0
  );

  // extra melody bumps
  if (R() > 0.5 && totalDuration < 2) {
    const extra = [...new Array(8)]
      .map(a => [
        {
          degree: 2,
          octave: 2,
          duration: 0.25,
        },
        {
          degree: null,
          octave: null,
          duration: 0.25,
        },
      ])
      .flat();

    extra[7] = {
      degree: null,
      octave: null,
      duration: 1,
    };
    playMeasure(extra);
  }

  settings.measureSFX[0] =
    settings.volume === undefined ? 0.2 : settings.volume * 0.25;
    zzfx(...settings.measureSFX);
  await startPlayback(settings);
  if (!playing) return;
  settings.measureSFX[0] =
    settings.volume === undefined ? 0.2 : settings.volume * 0.25;
    zzfx(...settings.measureSFX);

  // repeat motif a second time
  await startPlayback(settings);
  newMeasure();
  count++;
  if (count > defaultSettings.scaleChange) {
    defaultSettings.scale = Object.keys(scales).sort(
      () => R() - 0.5
    )[0];
    count = 0;
  }
};

let playing = false;

// Helper function to reset audio state
const resetAudio = () => {
  timeouts.forEach(t => clearTimeout(t));
  timeouts = [];
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
  audioContext = new AudioContext();
  if (bufferSource) {
    bufferSource.stop();
    bufferSource.disconnect();
  }
  audioBuffer = null;
  createNewBuffer(1);
  count = 0;
};

const startMusic = () => {
  playing = true;
  resetAudio();
  newMeasure();
};

const stopMusic = () => {
  playing = false;
  resetAudio();
  const tempo = 100;
  defaultSettings = {
    ...defaultSettings,
    instrument: instruments[bround % instruments.length],
    scale: Object.keys(scales).sort(() => R() - 0.5)[0],
    tempo,
    drumType: drums[~~(R() * drums.length)],
    drumType2: drums[~~(R() * drums.length)],
    baseNote: ~~(R() * 60) + 40,
    drumPattern: drumPatterns[~~(R() * drumPatterns.length)],
    doubleDrum: tempo < 60 ? 2 : 1,
    measures: [],
  };
};

const doubleTiempo = () => {
  resetAudio();
  defaultSettings.tempo *= 2;
  newMeasure();
};

const slowTiempo = () => {
  resetAudio();
  defaultSettings.tempo = 40;
  newMeasure();
};

const { div, input, button, canvas } = van.tags;

// Tunnel Configuration
const GAME_CONFIG = {
  SKY_TIME_LIMIT: 25000, // Game Length
  STAR_SPAWN_INTERVAL: 150, // How often stars spawn
};

let cRow = 1;
let cCol = 2;
let cDif = 0.4;

const tileRounds = 4;
const starGoal = 300;
let starsCollected = 0;
let currentTotalStars = 0;

const Tail = (count = 8) => {
  let inner;
  for (let i = count - 1; i >= 0; i--) {
    // outermost gets --i:0
    inner = div({ class: "tail-seg", style: `--i:${i}` }, inner);
  }
  return div({ class: "tho" }, div({ class: "tail" }, inner));
};

const Cat = (nSeg = 8) =>
  div(
    { class: "c1" },
    document.getElementById('catbod').cloneNode(true), Tail(nSeg)
  );

let voices = [];

function say(text, voice) {
  if (voices.length === 0) {
    voices = speechSynthesis
      .getVoices()
      .filter(v => v.lang.toLowerCase().startsWith("en"));
  }
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice || voices[(R() * voices.length) | 0];
  speechSynthesis.speak(u);
}

let starHolder;

const endMoon = () => {
  starHolder.remove();
  paused = true;
  stopMusic();
  tile.scrollIntoView({ behavior: 'smooth' });

  setTimeout(() => {
    startBoard(tile);
    startMusic();
  }, 1000);
};

const startMoon = () => {
  sourceIndex = 1;
  paused = false;
  GAME_CONFIG.STAR_SPAWN_INTERVAL = 150;
  moon.scrollIntoView({ behavior: 'smooth' });
  slowTiempo();

  starHolder = div({ class: "star-holder" });
  van.add(moon, starHolder);

  for (var i = 0; i < starsCollected; i++) {
    setTimeout(
      () => {
        van.add(
          starHolder,
          div(
            {
              class: "collected",
              style: `transform: translate(${R() * 100}vw, ${R() * 70}vh) scale(${R() * 0.5 + 0.5});
          position: absolute; color: #fff;`,
            },
            "·"
          )
        );

        currentTotalStars++;
        rangeInner.style.width = `${(currentTotalStars / starGoal) * 100}%`;
      },
      1000 + 50 * i
    );
  }

  rangeInner.innerText = currentTotalStars + starsCollected;
  say(`${currentTotalStars + starsCollected} of ${starGoal} stars collected`);

  setTimeout(() => {
    say("meow");
    setTimeout(
      () => {
        starsCollected = 0;

        if (currentTotalStars >= starGoal) {
          say("You've collected all the stars!");
          document.querySelector("#mho").style.opacity = 1;
          rangeInner.style.pointerEvents = "auto";
          rangeInner.innerText = "More Puzzles";
        } else {
          setTimeout(endMoon, 3500);
        }
      },
      1000
    );
  }, starsCollected * 50)
};

const startSky = holder => {
  if (currentTotalStars === 0) {
    say("Move the circle and collect stars", voices[0]);
  }
  sourceIndex = 0;
  paused = false;
  doubleTiempo();
  let skyRound = true;

  const hit = (a, b) =>
    !(
      a.right < b.left ||
      a.left > b.right ||
      a.bottom < b.top ||
      a.top > b.bottom
    );

  const cat = div(
    { id: "p-cat" },
    div({
      class: "platform",
    }),
    Cat(8)
  );

  const slider = input({
    type: "range",
    min: "-4",
    max: "4",
    step: "0.05",
    value: "0",
    oninput: e => (vel = +e.target.value),
  });

  const starStart = div({ id: "ss"});

  // Add timer display
  const timerDisplay = div({
    id: "timer",
  });

  const board = div(
    { id: "sh" },
    div({ id: "game" }, cat, starStart),
    div({ id: "an" }, slider),
    timerDisplay
  );

  // state
  let cx = 0,
    cy = 0,
    r = 0;
  let ang = 0,
    vel = 0,
    t0;

  const layout = () => {
    // center near middle; radius scales with viewport
    cx = innerWidth / 2;
    cy = innerHeight * 0.4; // 40% height looks nice; tweak as you like
    r = Math.min(innerWidth, innerHeight) * 0.4;
    setPos();
  };

  const setPos = () => {
    const screenRatio = innerWidth / innerHeight;
    const baseRadius = Math.min(innerWidth, innerHeight) * 0.4;

    const radiusX = baseRadius * Math.max(1, screenRatio); // Wider on wide screens
    const radiusY = baseRadius * Math.max(1, 1 / screenRatio); // Taller on tall screens

    const x = cx + radiusX * Math.cos(ang) - cat.offsetWidth / 2;
    const y = cy + radiusY * Math.sin(ang) - cat.offsetHeight / 2;
    cat.style.left = x + "px";
    cat.style.top = y + "px";
  };

  const dz = 0.5; // small deadzone for stillness
  const tick = t => {
    if (!t0) t0 = t;
    const dt = (t - t0) / 1000;
    t0 = t;
    const v = Math.abs(vel) < dz ? 0 : vel;
    ang = (ang + v * dt) % (Math.PI * 2);
    setPos();
    requestAnimationFrame(tick);
  };

  // init
  van.add(holder, board);
  layout();
  vel = +slider.value || 0;
  requestAnimationFrame(tick);
  addEventListener("resize", layout);

  // Time-based progression instead of star collection
  const startTime = Date.now();
  const updateTimer = () => {
    if (!skyRound) return;
    const remaining = Math.max(0, GAME_CONFIG.SKY_TIME_LIMIT - (Date.now() - startTime));
    timerDisplay.textContent = `${Math.ceil(remaining / 1000)}`;

    if (remaining > 0) {
      requestAnimationFrame(updateTimer);
    }
  };

  const gameTimer = setTimeout(() => {
    if (skyRound) {
      skyRound = false;
      document.querySelectorAll(".star").forEach(s => s.remove());
      startMoon();
      setTimeout(() => {
        holder.innerHTML = "";
      }, 2000);
    }
  }, GAME_CONFIG.SKY_TIME_LIMIT);

  // Start timer display
  requestAnimationFrame(updateTimer);

  let rotation = R() * 720 - 360;

  const interval = setInterval(() => {
    rotation = R() * 720 - 360;
  }, 2000);

  const newStar = () => {
    const ss = div(
      {
        class: "star",
        style: `margin-top: ${R(20)}vh`,
        onanimationend: () => {
          star.parentElement.removeChild(star);
        },
      },
      "✦"
    );

    const star = div(
      {
        class: "st",
        style: `transform: rotate(${rotation + R(90)}deg)`,
      },
      ss
    );

    van.add(starStart, star);

    const checkCollision = () => {
      if (hit(ss.getBoundingClientRect(), cat.getBoundingClientRect())) {
        // Play sound effect when collecting stars
        zzfx(...[,0,1500,.02,,.2,,2,1,3,230,.1,,.1,,,,.8]);

        // Remove star but don't affect progression
        star.parentElement.removeChild(star);
        starsCollected++;
        return;
      } else if (skyRound) {
        requestAnimationFrame(checkCollision);
      }
    };

    requestAnimationFrame(checkCollision);

    // Continue spawning stars until time runs out
    if (skyRound) {
      setTimeout(newStar, Math.max(100, GAME_CONFIG.STAR_SPAWN_INTERVAL));
    } else {
      clearInterval(interval);
    }
  };

  requestAnimationFrame(newStar);
  holder.scrollIntoView({ behavior: 'smooth' });
};

let bround = 0;

const startBoard = tileHolder => {
  bround++;
  if (bround === 2) {
    setTimeout(() => {
      say("Until the last cat, you can remove cats by clicking again.", voices[0]);
    }, 2000);
  }
  tile.scrollIntoView({ behavior: 'smooth' });
  let round = 0;
  /* lower is emptier */
  const boardHolder = (rowNum = 2, colNum = 2, difficulty = 0.22) => {
    if (rowNum + colNum < 4) {
      setTimeout(() => {
        say("Place cats on empty tiles. Pair every cat to a charm.", voices[0]);
      }, 1000);
    }

    if (rowNum === 2 && colNum === 2) {
      setTimeout(() => {
        say("Tag shows the number of cats per line", voices[0])
      }, 1000);
    }

    let S, grid, rowMarkers, colMarkers;
    let target = Math.min(
      Math.round(difficulty * rowNum * colNum),
      Math.ceil(rowNum / 2) * Math.ceil(colNum / 2)
    );

    const ORTHO = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    const ALL8 = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    const inB = (r, c) => r >= 0 && r < rowNum && c >= 0 && c < colNum;

    function adjMilks(S, r, c) {
      let n = 0;
      for (const [dR, dC] of ORTHO) {
        const R = r + dR,
          C = c + dC;
        if (inB(R, C) && S[R][C] === 1) n++;
      }
      return n;
    }
    function nearCat(S, r, c) {
      for (const [dR, dC] of ALL8) {
        const R = r + dR,
          C = c + dC;
        if (inB(R, C) && S[R][C] === 2) return true;
      }
      return false;
    }

    function toySatisfied(S, r, c) {
      let n = 0;
      for (const [dR, dC] of ORTHO) {
        const R = r + dR,
          C = c + dC;
        if (inB(R, C) && S[R][C] === 2) n++;
      }
      return n === 1;
    }

    let placed = 0;

    const testFinished = () => {
      placed += 1;

      if (placed === target) {
        holder.style.setProperty("pointer-events", "none");
        setTimeout(async () => {
          let colCorrect;
          let rowCorrect;

          const catsInGridRow = r =>
            grid[r].reduce((n, el) => n + el.classList.contains("cat"), 0);

          const catsInGridCol = c => {
            let n = 0;
            for (let r = 0; r < grid.length; r++)
              n += grid[r][c].classList.contains("cat");
            return n;
          };

          // array of booleans, one per row
          rowCorrect = rowMarkers.map(
            (m, i) => parseInt(m.innerText) === catsInGridRow(i)
          );

          // array of booleans, one per col
          colCorrect = colMarkers.map(
            (m, i) => parseInt(m.innerText) === catsInGridCol(i)
          );

          const borderingCats = (() => {
            const isCat = el => el.classList.contains("cat");
            const s = new Set();
            for (let r = 0; r < grid.length; r++)
              for (let c = 0; c < grid[r].length; c++) {
                if (!isCat(grid[r][c])) continue;
                for (const [dr, dc] of ALL8) {
                  const R = r + dr,
                    C = c + dc;
                  if (inB(R, C) && isCat(grid[R][C])) {
                    s.add(grid[r][c]);
                    s.add(grid[R][C]);
                    break;
                  }
                }
              }
            return [...s];
          })();

          const pairToysWithCats = () => {
            const out = [];
            for (let r = 0; r < grid.length; r++)
              for (let c = 0; c < grid[r].length; c++) {
                const el = grid[r][c];
                if (!el.classList.contains("milk")) continue;
                let cat; // remains undefined if none found
                for (const [dr, dc] of ORTHO) {
                  const R = r + dr,
                    C = c + dc;
                  if (inB(R, C) && grid[R][C].classList.contains("cat")) {
                    cat = grid[R][C];
                    break;
                  }
                }
                out.push([el, cat]);
              }
            return out;
          };

          if (
            rowCorrect.every(a => a) &&
            colCorrect.every(a => a) &&
            pairToysWithCats().some(p => p[1] !== undefined) &&
            borderingCats.length === 0
          ) {
            // success
            zzfx(
              ...[
                ,
                0,
                864,
                0.03,
                0.08,
                0.27,
                ,
                0.4,
                ,
                ,
                428,
                0.05,
                ,
                ,
                ,
                ,
                ,
                0.63,
                0.04,
              ]
            );

            say("meow");

            [...document.getElementsByClassName("cell")].forEach(c => {
              c.style.setProperty("--bop", 1);
              c.style.setProperty("animation-delay", `${R(300, 1000)}ms`);           
            });

            round += 1;

            if (cRow < 3 || cCol < 2) {
              if (cRow < cCol) cRow++;
              else cCol++;
            } else {
              cDif += 0.07;
              if (cDif > 0.36 && cRow + cCol < 12) {
                if (cRow < cCol) cRow++;
                else cCol++;
                cDif = 0.25;
              } else if (cDif > 0.36) {
                cDif = 0.2;
              }
            }

            rowMarkers
              .concat(colMarkers)
              .forEach(c => c.classList.add("correct"));

            setTimeout(() => {
              [...document.getElementsByClassName("cell")]
                .concat([...document.getElementsByClassName("rm")])
                .concat([...document.getElementsByClassName("cm")])
                .forEach(c => {
                  c.offsetWidth;
                  c.classList.add("rev");
                  c.style.pointerEvents = "none";
                });

              setTimeout(() => {
                //swoop up
                zzfx(
                  ...[
                    0.7,
                    ,
                    126,
                    0.5,
                    0.6,
                    0.3,
                    ,
                    13.4,
                    ,
                    ,
                    34,
                    0.25,
                    0.15,
                    ,
                    ,
                    ,
                    ,
                    0.63,
                    ,
                    0.01,
                    -1029,
                  ]
                );
              }, 200);

              setTimeout(() => {
                if (round === tileRounds) {
                  tile.innerHTML = "";
                  startSky(skyHolder);
                  tunnel.scrollIntoView({ behavior: 'smooth' });
                  return;
                }
                const holder = boardHolder(cRow, cCol, cDif);
                tileHolder.innerHTML = "";
                van.add(tileHolder, holder);
              }, 2000);
            }, 400);
          } else {

            const fsfx = [
              0.2,
              ,
              10,
              0.02,
              0.2,
              0.03,
              1,
              0.1,
              88,
              22,
              ,
              ,
              ,
              ,
              145,
              ,
              ,
              0.68,
              0.03,
              ,
              -1493,
            ];
            // failure
            say('oh no');
            GAME_CONFIG.STAR_SPAWN_INTERVAL += 200;
            [...document.querySelectorAll(".cell")].forEach(cell =>
              cell.style.setProperty("pointer-events", "none")
            );
            const interval = 800;

            async function badRowCol(correct, markers) {
              return new Promise(resolve => {
                let counter = 0;
                for (let i = 0; i < correct.length; i++) {
                  if (!correct[i]) {
                    counter++;
                    setTimeout(() => {
                      zzfx(
                        ...fsfx
                      );
                      markers[i].classList.add("fail");
                    }, counter * interval);
                  }
                } 

                setTimeout(() => {
                  resolve();
                }, counter * interval);
              });
            }

            async function noToy() {
              const nocats = pairToysWithCats().filter(p => p[1] === undefined);
              say(`No bordering cat"}`);
              return new Promise(resolve => {
                nocats.forEach((p, i) => {
                  setTimeout(() => {
                    zzfx(
                      ...fsfx
                    );
                    p[0].classList.add("fail");
                  }, i * interval);
                });

                setTimeout(() => {
                  resolve("resolved");
                }, nocats.length * interval);
              });
            }

            async function angryCats() {
              say("cats cannot touch even diagonally");
              return new Promise(resolve => {
                borderingCats.forEach((c, i) => {
                  setTimeout(() => {
                    zzfx(
                      ...fsfx
                    );
                    c.classList.add("fail");
                  }, i * interval);
                });
                setTimeout(() => {
                  resolve("resolved");
                }, borderingCats.length * interval);
              });
            }

            const pairs = [
              [
                !rowCorrect.every(a => a),
                () => badRowCol(rowCorrect, rowMarkers),
              ],
              [
                !colCorrect.every(a => a),
                () => badRowCol(colCorrect, colMarkers),
              ],
              [true, () => new Promise(res => setTimeout(res, interval))],
              [pairToysWithCats().some(p => p[1] === undefined), noToy],
              [borderingCats.length !== 0, angryCats],
              [true, () => new Promise(res => setTimeout(res, interval * 1.5))],
            ];

            // call sequentially
            for (const [cond, fn] of pairs) {
              if (cond) await fn();
            }

            zzfx(
              ...[
                0.5,
                ,
                89,
                0.09,
                0.11,
                0.27,
                ,
                0.2,
                7,
                8,
                ,
                ,
                ,
                1.2,
                ,
                0.9,
                ,
                0.4,
                0.06,
                ,
                1299,
              ]
            );

            if (cRow > 2 || cCol > 2) {
              if (cRow < cCol) cCol--;
              else cRow--;
            } else {
              cDif -= 0.15;
              if (cDif < 0.2) {
                if (cRow < cCol) cCol--;
                else cRow--;
                cDif = 0.4;
              }
            }

            holder.classList.add("fail");

            setTimeout(() => {
              if (round === tileRounds) {
                tile.innerHTML = "";
                startSky(skyHolder);
                tunnel.scrollIntoView({ behavior: 'smooth' });
                return;
              }
              const holder = boardHolder(cRow, cCol, cDif);
              tileHolder.innerHTML = "";
              van.add(tileHolder, holder);
            }, 2000);
          }
        }, 500);
        return true;
      } else {
        return false;
      }
    };

    function makeBoard(rows, cols, k, retries = 50000) {
      function candidates(S, m) {
        const out = [];
        for (const [dR, dC] of ORTHO) {
          const r = m.r + dR,
            c = m.c + dC;
          if (!inB(r, c) || S[r][c] !== 0) continue;
          if (nearCat(S, r, c)) continue;
          if (adjMilks(S, r, c) !== 1) continue;
          out.push({ r, c });
        }
        // shuffle small
        for (let i = out.length - 1; i > 0; i--) {
          const j = (R() * (i + 1)) | 0;
          [out[i], out[j]] = [out[j], out[i]];
        }
        return out;
      }

      for (let i = 0; i < retries; i++) {
        S = Array.from({ length: rows }, _ => new Uint8Array(cols));
        const milks = [];
        let placed = 0,
          guard = rows * cols * 6;
        while (placed < k && guard-- && i < retries) {
          const r = (R() * rows) | 0,
            c = (R() * cols) | 0;
          if (S[r][c] !== 0) continue;
          S[r][c] = 1;
          let ok = false;
          for (const [dR, dC] of ORTHO) {
            const R = r + dR,
              C = c + dC;
            if (inB(R, C) && S[R][C] === 0) {
              ok = true;
              break;
            }
          }
          if (ok) {
            milks.push({ r, c });
            placed++;
          } else {
            S[r][c] = 0;
          }
        }
        if (placed < k) continue; // retry board

        // 3) backtrack: one cat per milk, no touching cats
        function dfs() {
          let mi = -1,
            best = null;
          for (let i = 0; i < milks.length; i++) {
            const m = milks[i];
            if (toySatisfied(S, m.r, m.c)) continue;
            const opts = candidates(S, m);
            if (opts.length === 0) return false;
            if (!best || opts.length < best.opts.length) {
              best = { i, opts };
              mi = i;
            }
          }
          if (mi === -1) return true; // all satisfied
          for (const { r, c } of best.opts) {
            S[r][c] = 2;
            if (dfs()) return true;
            S[r][c] = 0;
          }
          return false;
        }

        if (dfs()) return S;
        // else retry a fresh board
      }
      return false;
    }

    const holder = div({
      class: "holder",
    });

    grid = [...new Array(rowNum)].map(c => [...new Array(colNum)]);
    while (!makeBoard(rowNum, colNum, target)) {
      target -= 1;
      cDif = 0.22;
    }
    rowMarkers = [];
    colMarkers = [];

    for (let row = 2; row < rowNum + 2; row++) {
      let marker = div({
        class: "marker rm",
      });
      van.add(
        holder,
        div(
          {
            style: `grid-area: ${row} / ${colNum + 2} / ${row + 1} / ${
              colNum + 3
            }; display: flex;
    align-items: center;`,
          },
          marker
        )
      );
      rowMarkers.push(marker);
    }

    for (let col = 2; col < colNum + 2; col++) {
      let marker = div({
        class: "marker cm",
      });
      van.add(
        holder,
        div(
          {
            style: `grid-area: ${rowNum + 2} / ${col} / ${rowNum + 3} / ${
              col + 1
            }; display: flex;
    justify-content: center;
    `,
          },
          marker
        )
      );
      colMarkers.push(marker);
    }

    const bop = "var(--bop)";
    const backingGrads =
      R() > 0.5
        ? [
            `hsl(225 63% 57% / ${bop}), hsl(240 90% 50% / ${bop})`, // royalblue, blue
            `hsl(25 80% 55% / ${bop}), hsl(45 90% 50% / ${bop})`, // sorta orangey
          ]
        : [
            `hsl(300 66% 72% / ${bop}), hsl(300 90% 25% / ${bop})`, // violet, purple
            `hsl(120 90% 50% / ${bop}), hsl(120 90% 25% / ${bop})`, // lime, green
          ];

    for (let row = 0; row < rowNum; row++) {
      let rowCats = 0;
      for (let col = 0; col < colNum; col++) {
        const scale = (11 - Math.max(rowNum, colNum));
        grid[row][col] = div({
          class: "cell",
          style: `grid-area: ${row + 2} / ${col + 2} / ${row + 3} / ${
            col + 3
          };background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><filter id="a"><feTurbulence seed="${~~(
            R() * 2000
          )}" baseFrequency="2" result="noise" type="fractalNoise"/><feComponentTransfer><feFuncR tableValues="0 1" type="discrete"/><feFuncG tableValues="0 1" type="discrete"/><feFuncB tableValues="0 1" type="discrete"/><feFuncA type="linear"/></feComponentTransfer><feColorMatrix type="saturate" values="0.10"/></filter><g transform="scale(${
            scale * scale * 0.35
          })"><rect width="100px" height="100px" filter="url(%23a)" opacity=".15"/></g></svg>'), linear-gradient(${R()}turn, ${
            backingGrads[(row + col) % backingGrads.length]
          });
          --bop: 0.3;
      animation-delay: ${800 * Math.abs(row - col)/(rowNum + colNum)}ms;
      font-size: ${scale * 0.6}em`,
          onclick: () => {
            if (
              S[row][col] !== 1 &&
              !grid[row][col].classList.contains("cat")
            ) {
              zzfx(...[2,0,261.6256,.01,.33,.07,1,1.9,,,,,,.1,,,.17,.62,.06]);

              grid[row][col].classList.add("cat");
              grid[row][col].style.setProperty("--bop", 1);
              grid[row][col].style.setProperty("pointer-events", "none");

              van.add(
                grid[row][col],

                div({ class: "om" }, div({ class: "reflect" }, Cat(0))),
                div({ class: "derot" }, Cat(7))
              );

              if (!testFinished()) {
                grid[row][col].style.setProperty("pointer-events", "auto");
              }
            } else if (grid[row][col].classList.contains("cat")) {
              grid[row][col].innerHTML = "";
              grid[row][col].classList.remove("cat");
              grid[row][col].style.setProperty("--bop", 0.3);
              placed -= 1;
            }
          },
        });

        // if (S[row][col] == 2) {
        //   grid[row][col].style.setProperty('border', '5px solid tomato');
        // }

        if (S[row][col] == 1) {
          const toy = ["⭐️", "☁️", "🌙"][~~(R() * 3)];
          grid[row][col].classList.add("milk");
          grid[row][col].style.setProperty("--bop", 1);
          van.add(
            grid[row][col],

            div(
              { class: "om" },
              div({ class: "reflect" }, div({ class: "toy" }, toy))
            ),
            div({ class: "derot" }, div({ class: "toy" }, toy))
          );
        } else if (S[row][col] == 2) {
          rowCats += 1;
        }
        van.add(holder, grid[row][col]);
      }
      rowMarkers[row].innerText = rowCats;
    }

    for (let col = 0; col < colNum; col++) {
      let total = 0;
      for (let row = 0; row < rowNum; row++) {
        if (S[row][col] === 2) total++;
      }
      colMarkers[col].innerText = total;
    }

    return holder;
  };

  const holder = boardHolder(cRow, cCol, cDif);
  van.add(tileHolder, holder);
};

const rangeInner = div({ id: "rani", onclick: endMoon });
const skyHolder = div();
const moon = div(
  { id: "moon", class: "sc" },
  div({ id: "mho" }, "You Win!"),
  canvas({ id: "canvas-2" }),
  div(
    { class: "cho" },
    [...new Array(5)].map(c => Cat(0))
  ),
);
const tunnel = div(
  { id: "tunnel", class: "sc" },
  canvas({ id: "canvas-1" }),
  skyHolder
);
const tile = div({ id: "tile", class: "sc" });
const start = div(
  {
    id: "start",
    class: "sc",
  },
  div(
    { class: "center" },
    div({ id: "t" }, "🌙 Celestial Paws ⭐️"),
    button(
      {
        id: "start-btn",
        onclick: () => {
          startBoard(tile);
          startMusic();
        },
      },
      "Start"
    )
  ),
  div({ id: "start-cat" }, Cat(7))
);

van.add(document.body, moon, tunnel, tile, start);

sources.push(
  initScene(
    "canvas-1",
`#define s iTime * 0.75
float h(float n){return fract(sin(n)*43758.5453123);}
float n3(vec3 x){vec3 p=floor(x),f=fract(x);f=f*f*(3.0-2.0*f);float n=p.x+p.y*57.0+p.z*113.0;return mix(mix(mix(h(n+0.0),h(n+1.0),f.x),mix(h(n+57.0),h(n+58.0),f.x),f.y),mix(mix(h(n+113.0),h(n+114.0),f.x),mix(h(n+170.0),h(n+171.0),f.x),f.y),f.z);}
float c(vec3 p,vec3 r){return length(p.xy-r.xy)-r.z;}
vec2 r(vec2 k,float a){return vec2(cos(a)*k.x-sin(a)*k.y,sin(a)*k.x+cos(a)*k.y);}
float d(vec3 p){p.z+=s*2.0;p.x+=sin(p.z*0.5)*1.5;return c(p,vec3(0.0,0.0,1.5));}
vec4 d4(vec3 p){float t=d(p);p.z+=s*4.0;t+=n3(p*1.75-s*1.5)*0.6;vec4 r=vec4(clamp(t,0.0,1.0));r.xyz=mix(vec3(1.0,1.0,1.0),vec3(0.0,0.0,0.05),r.x);return r;}
void mainImage(out vec4 f,in vec2 c){vec3 o=vec3(0.0,0.0,-3.0);vec3 d=normalize(vec3((-1.0+2.0*c.xy/iResolution.xy)*vec2(iResolution.x/iResolution.y,1.0),1.0));o.x+=cos(s)*1.0;d.xy=r(d.xy,s*0.05+cos(s*0.05));d.x+=sin(s-3.14*0.5)*0.5;float t=0.0;vec4 l=vec4(0.07,0.1,0.2,0.0);for(int i=0;i<220;i++){vec4 v=d4(o+d*t);v.w*=0.35;v.xyz*=v.w;l=l+v*(1.0-l.w);t+=0.1;}l.xyz/=l.w;l=sqrt(l);f=vec4(l.xyz,1.0) * (l.y - 0.3) * (c.y / iResolution.y);}`
  )
);
sources.push(
  initScene(
    "canvas-2",
`#define S 0.6
mat2 r(float a){float c=cos(a),s=sin(a);return mat2(c,s,-s,c);}
float t(float x){return clamp(abs(fract(x)-0.5),0.01,0.49);}
vec2 t2(vec2 p){return vec2(t(p.x)+t(p.y),t(p.y+t(p.x)));}
float n2(vec2 p,float s){float c=1.8,d=2.5,n=0.0;vec2 w=p*r(p.x*0.06),b=w;for(float i=0.0;i<5.0;i++){vec2 l=t2(b*1.85)*0.75;l*=r(iTime*s);w-=l/d;b*=1.3;d*=0.45;c*=0.42;w*=1.21+(n-1.0)*0.02;n+=t(w.x+t(w.y))*c;w*=-mat2(0.95534,0.29552,-0.29552,0.95534);}return clamp(1.0/pow(n*29.0,1.3),0.0,0.55);}
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,4.1414)))*43758.5453);}
vec4 a(vec3 o,vec3 d){vec4 c=vec4(0.0),l=vec4(0.0);for(float i=0.0;i<50.0;i++){float f=0.006*h(gl_FragCoord.xy)*smoothstep(0.0,15.0,i);float t=(0.8+pow(i,1.4)*0.002-o.y)/(d.y*2.0+0.4);t-=f;vec3 p=o+t*d;vec2 j=p.zx;float a=n2(j,S);vec4 s=vec4(0.0,0.0,0.0,a);s.rgb=(sin(1.0-vec3(2.15,-0.5,1.2)+i*0.043)*0.5+0.5)*a;l=mix(l,s,0.5);c+=l*exp2(-i*0.065-2.5)*smoothstep(0.0,5.0,i);}c*=clamp(d.y*15.0+0.4,0.0,1.0);return c*1.8;}
void mainImage(out vec4 fragColor,in vec2 c){vec2 q=c/iResolution.xy;vec2 p=q;p.x*=iResolution.x/iResolution.y;vec3 o=vec3(0.0,0.0,-6.7);vec3 d=normalize(vec3(p,1.3));vec3 l=vec3(0.0);float f=smoothstep(0.0,0.01,abs(d.y))*0.1+0.9;if(d.y>0.0){vec4 u=smoothstep(0.0,1.5,a(o,d))*f;l=l*(1.0-u.a)+u.rgb;}float m=dot(l.rgb,vec3(0.299,0.587,0.114));fragColor=vec4(l.rgb,m);}`
  )
);

requestAnimationFrame(() => {
  start.scrollIntoView({ behavior: 'smooth' });
  render();
  setTimeout(() => {
    van.add(moon, div({ id: "range" }, rangeInner));
  }, 1000);
});
