import { abs, cos, max, min, random, round, sin, tan, TAU } from "./math";

// ZzFXMicro - Zuper Zmall Zound Zynth - v1.3.1 by Frank Force ~ 1000 bytes
// audio context
export let audioContext = new AudioContext();
export let audioBus = audioContext.createGain();

export const initZZFX = () => {
  audioBus.gain.value = 1 / 3;
  audioBus.connect(audioContext.destination);
};

export const zzfx = (
  p: number | any = 1,
  k: number | any = 0.05,
  b: AudioBufferSourceNode | number = 220,
  e = 0,
  r = 0,
  t = 0.1,
  q = 0,
  D = 1,
  u = 0,
  y = 0,
  v = 0,
  z = 0,
  l = 0,
  E = 0,
  A = 0,
  F = 0,
  c = 0,
  w = 1,
  m = 0,
  B = 0,
  N = 0,
  R = 44100,
  zzfxV = 1 / 3
) => {
  let G = (u *= (500 * TAU) / R / R),
    C = (b *= ((1 - k + 2 * k * random((k = []))) * TAU) / R),
    g = 0,
    H = 0,
    a = 0,
    n = 1,
    I = 0,
    J = 0,
    f = 0,
    h = N < 0 ? -1 : 1,
    x = (TAU * h * N * 2) / R,
    L = cos(x),
    Z = sin,
    K = Z(x) / 4,
    O = 1 + K,
    X = (-2 * L) / O,
    Y = (1 - K) / O,
    P = (1 + h * L) / 2 / O,
    Q = -(h + L) / O,
    S = P,
    T = 0,
    U = 0,
    V = 0,
    W = 0;
  e = R * e + 9;
  m *= R;
  r *= R;
  t *= R;
  c *= R;
  y *= (500 * TAU) / R ** 3;
  A *= TAU / R;
  v *= TAU / R;
  z *= R;
  l = (R * l) | 0;
  p *= zzfxV;
  for (h = (e + m + r + t + c) | 0; a < h; k[a++] = f * p)
    ++J % ((100 * F) | 0) ||
      ((f = q
        ? 1 < q
          ? 2 < q
            ? 3 < q
              ? Z(g ** 3)
              : max(min(tan(g), 1), -1)
            : 1 - (((((2 * g) / TAU) % 2) + 2) % 2)
          : 1 - 4 * abs(round(g / TAU) - g / TAU)
        : Z(g)),
      (f =
        (l ? 1 - B + B * Z((TAU * a) / l) : 1) *
        (f < 0 ? -1 : 1) *
        abs(f) ** D *
        (a < e
          ? a / e
          : a < e + m
          ? 1 - ((a - e) / m) * (1 - w)
          : a < e + m + r
          ? w
          : a < h - c
          ? ((h - a - c) / t) * w
          : 0)),
      (f = c
        ? f / 2 +
          (c > a ? 0 : ((a < h - c ? 1 : (h - a) / c) * k[(a - c) | 0]) / 2 / p)
        : f),
      N
        ? (f = W = S * T + Q * (T = U) + P * (U = f) - Y * V - X * (V = W))
        : 0),
      (x = (b += u += y) * cos(A * H++)),
      (g += x + x * E * Z(a ** 5)),
      n && ++n > z && ((b += v), (C += v), (n = 0)),
      !l || ++I % l || ((b = C), (u = G), (n = n || 1));
  p = audioContext.createBuffer(1, h, R);
  p.getChannelData(0).set(k);
  b = audioContext.createBufferSource();
  b.buffer = p;
  b.connect(audioBus);
  return b;
};
