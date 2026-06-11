// @ts-nocheck
'use strict';
export let // ZzFXMicro - Zuper Zmall Zound Zynth - v1.3.1 by Frank Force ~ 1000 bytes
  zzfxV = 0.3, // volume
  zzfxX = new AudioContext(), // audio context
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
      N = 0
    ) => {
      let M = Math,
        d = 2 * M.PI,
        R = 44100,
        G = (u *= (500 * d) / R / R),
        C = (b *= ((1 - k + 2 * k * M.random((k = []))) * d) / R),
        g = 0,
        H = 0,
        a = 0,
        n = 1,
        I = 0,
        J = 0,
        f = 0,
        h = N < 0 ? -1 : 1,
        x = (d * h * N * 2) / R,
        L = M.cos(x),
        Z = M.sin,
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
      y *= (500 * d) / R ** 3;
      A *= d / R;
      v *= d / R;
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
                  : M.max(M.min(M.tan(g), 1), -1)
                : 1 - (((((2 * g) / d) % 2) + 2) % 2)
              : 1 - 4 * M.abs(M.round(g / d) - g / d)
            : Z(g)),
          (f =
            (l ? 1 - B + B * Z((d * a) / l) : 1) *
            (f < 0 ? -1 : 1) *
            M.abs(f) ** D *
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
              (c > a
                ? 0
                : ((a < h - c ? 1 : (h - a) / c) * k[(a - c) | 0]) / 2 / p)
            : f),
          N
            ? (f = W = S * T + Q * (T = U) + P * (U = f) - Y * V - X * (V = W))
            : 0),
          (x = (b += u += y) * M.cos(A * H++)),
          (g += x + x * E * Z(a ** 5)),
          n && ++n > z && ((b += v), (C += v), (n = 0)),
          !l || ++I % l || ((b = C), (u = G), (n = n || 1));
      p = zzfxX.createBuffer(1, h, R);
      p.getChannelData(0).set(k);
      b = zzfxX.createBufferSource();
      b.buffer = p;
      b.connect(zzfxX.destination);
      b.start();
    };

export function playPickup1() {
  zzfx(
    ...[
      ,
      ,
      280,
      0.01,
      0.07,
      0.3,
      ,
      3.5,
      ,
      ,
      344,
      0.08,
      ,
      ,
      ,
      ,
      ,
      0.71,
      0.01,
      ,
      -1108,
    ]
  ); // Pickup 320
}

export function playExplosion2() {
  zzfx(
    ...[
      0.8,
      0.65,
      39,
      0.03,
      0.03,
      0.31,
      4,
      0.4,
      5,
      1,
      ,
      ,
      ,
      1.4,
      85,
      0.6,
      0.16,
      0.36,
      0.16,
    ]
  ); // Explosion 358
}

export function playDisappointment() {
  zzfx(
    ...[
      0.7,
      ,
      129,
      0.08,
      0.11,
      0.07,
      ,
      2.5,
      ,
      -1,
      ,
      ,
      ,
      ,
      0.5,
      0.1,
      ,
      0.58,
      0.19,
      ,
      462,
    ]
  ); // Powerup 432
}

export function playSmallSound() {
  zzfx(
    ...[0.7, 0.2, 458, 0.03, 0.04, 0.09, 1, 3.2, , 54, , , , , , , , 0.72, 0.02]
  ); // Jump 472
}

export function playLongcatSound() {
  zzfx(
    ...[
      0.8,
      ,
      489,
      0.01,
      0.26,
      0.27,
      1,
      2.8,
      ,
      20,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      0.7,
      0.14,
      ,
      -665,
    ]
  ); // Powerup 436}
}

export function playNapSound() {
  zzfx(
    ...[
      0.8,
      ,
      414,
      0.01,
      0.17,
      0.38,
      1,
      2.1,
      ,
      1,
      ,
      ,
      ,
      ,
      ,
      ,
      ,
      0.97,
      0.14,
      ,
      -1365,
    ]
  );
} // Powerup 504}

export function playBurnCals() {
  zzfx(
    ...[0.7, , 335, 0.02, 0.05, 0.08, , 0.8, , 178, , , , , , , , 0.59, 0.01]
  ); // Jump 386
}

export function playWasAttacked() {
  zzfx(
    ...[
      0.5,
      ,
      413,
      0.08,
      0.22,
      0.38,
      ,
      0.9,
      ,
      ,
      -113,
      0.18,
      ,
      ,
      ,
      ,
      ,
      0.98,
      0.28,
      ,
      109,
    ]
  ); // Powerup 482
}

export function playCannot() {
  zzfx(
    ...[
      1,
      ,
      296,
      ,
      0.04,
      0.02,
      1,
      2.5,
      ,
      -3,
      ,
      ,
      ,
      1.1,
      ,
      0.1,
      0.03,
      0.63,
      0.03,
      ,
      1509,
    ]
  ); // Hit 527
}

export function playBoop() {
  zzfx(
    ...[
      1.1,
      ,
      64,
      0.01,
      0.01,
      0.03,
      4,
      2.9,
      4,
      -12,
      ,
      ,
      ,
      ,
      143,
      0.1,
      0.34,
      ,
      0.02,
      0.2,
    ]
  ); // Blip 592
}
