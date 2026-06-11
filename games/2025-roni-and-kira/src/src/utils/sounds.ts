//@ts-nocheck
import { ESounds, LOCAL_STORAGE_KEY } from "./constants";
import { getValueFromCache, savePropierties } from "./storage";

let zzfx, zzfxV, zzfxX;

// ZzFXMicro - Zuper Zmall Zound Zynth - v1.2.0 by Frank Force ~ 880 bytes
zzfxV = 0.3; // volume
zzfx = // play sound
  (
    p = 1,
    k = 0.05,
    b = 220,
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
    M = Math,
    R = 44100,
    d = 2 * M.PI,
    G = (u *= (500 * d) / R / R),
    C = (b *= ((1 - k + 2 * k * M.random((k = []))) * d) / R),
    g = 0,
    H = 0,
    a = 0,
    n = 1,
    I = 0,
    J = 0,
    f = 0,
    x,
    h
  ) => {
    e = R * e + 9;
    m *= R;
    r *= R;
    t *= R;
    c *= R;
    y *= (500 * d) / R ** 3;
    A *= d / R;
    v *= d / R;
    z *= R;
    l = (R * l) | 0;
    for (h = (e + m + r + t + c) | 0; a < h; k[a++] = f)
      ++J % ((100 * F) | 0) ||
        ((f = q
          ? 1 < q
            ? 2 < q
              ? 3 < q
                ? M.sin((g % d) ** 3)
                : M.max(M.min(M.tan(g), 1), -1)
              : 1 - (((((2 * g) / d) % 2) + 2) % 2)
            : 1 - 4 * M.abs(M.round(g / d) - g / d)
          : M.sin(g)),
        (f =
          (l ? 1 - B + B * M.sin((d * a) / l) : 1) *
          (0 < f ? 1 : -1) *
          M.abs(f) ** D *
          zzfxV *
          p *
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
            (c > a ? 0 : ((a < h - c ? 1 : (h - a) / c) * k[(a - c) | 0]) / 2)
          : f)),
        (x = (b += u += y) * M.cos(A * H++)),
        (g += x - x * E * (1 - ((1e9 * (M.sin(a) + 1)) % 2))),
        n && ++n > z && ((b += v), (C += v), (n = 0)),
        !l || ++I % l || ((b = C), (u = G), (n ||= 1));
    p = zzfxX.createBuffer(1, h, R);
    p.getChannelData(0).set(k);
    b = zzfxX.createBufferSource();
    b.buffer = p;
    b.connect(zzfxX.destination);
    b.start();
    return b;
  };
zzfxX = new AudioContext();

let soundsEnabled = getValueFromCache(LOCAL_STORAGE_KEY.SOUNDS, true);

// CLICK
// SWIPE
// COIN
// EXPLODE
// KEY
// OPEN
// DESTROY
// SUCESS
// GAME_OVER

const SOUNDS = [
  [, , 537, 0.02, 0.02, 0.22, 1, 1.59, -6.98, 4.97],
  [, , 150, 0.05, , 0.05, , 1.3, , , , , , 3],
  [, , 1675, , 0.06, 0.24, 1, 1.82, , , 837, 0.06],
  [,,448,.01,.1,.3,3,.39,-0.5,,,,,,.2,.1,.08],
  [, , 539, 0, 0.04, 0.29, 1, 1.92, , , 567, 0.02, 0.02, , , , 0.04],
  [, , 20, 0.04, , 0.6, , 1.31, , , -990, 0.06, 0.17, , , 0.04, 0.07],
  [, , 418, 0, 0.02, 0.2, 4, 1.15, -8.5, , , , , 0.7, , 0.1],
  [, , 80, 0.3, 0.4, 0.7, 2, 0.1, -0.73, 3.42, -430, 0.09, 0.17, , , , 0.19],
  [, , 925, 0.04, 0.3, 0.6, 1, 0.3, , 6.27, -184, 0.09, 0.17],
];

export const PlaySound = (sound: ESounds) => {
  if (soundsEnabled) {
    zzfx(...SOUNDS[sound]);
  }
};

export const getLabelButtonSound = () =>
  `Sound: ${soundsEnabled ? "ON" : "OFF"}`;

export const toogleSounds = (element: HTMLButtonElement) => {
  soundsEnabled = !soundsEnabled;
  savePropierties(LOCAL_STORAGE_KEY.SOUNDS, soundsEnabled);
  element.textContent = getLabelButtonSound();
};
