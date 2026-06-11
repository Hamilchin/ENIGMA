import {
  BACKGROUND_HUE_SHIFT,
  BACKGROUND_LIGHTNESS_SHIFT,
  BACKGROUND_SATURATION_SHIFT,
} from "./config";

export function hexToRgba(hex: string, alpha: number = 1) {
  const bigint = parseInt(hex.replace("#", ""), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b, alpha };
}

export function hexToRgbaString(hex: string, alpha: number = 1): string {
  const { r, g, b } = hexToRgba(hex, alpha);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function randomisePalette(palette: string[]): string[] {
  return palette.map((hex) => {
    const { h, s, l } = hexToHSL(hex);

    // Small random offsets to keep shade consistent
    const newH = (h + (Math.random() - 0.5) * BACKGROUND_HUE_SHIFT + 360) % 360; // ±10° hue
    const newS = Math.min(
      100,
      Math.max(0, s + (Math.random() - 0.5) * BACKGROUND_SATURATION_SHIFT)
    );
    const newL = Math.min(
      100,
      Math.max(0, l + (Math.random() - 0.5) * BACKGROUND_LIGHTNESS_SHIFT)
    );

    return hslToHex(newH, newS, newL);
  });
}

function hexToHSL(hex: string) {
  hex = hex.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }

  return { h, s: s * 100, l: l * 100 };
}

function hslToHex(h: number, s: number, l: number) {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0,
    g = 0,
    b = 0;
  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function getInterpolatedColor(
  t: number,
  stops: { hp: number; color: string }[]
): string {
  // Clamp t between 0 and 1
  t = Math.max(0, Math.min(1, t));

  // Find which two stops we're between
  for (let i = 0; i < stops.length - 1; i++) {
    const curr = stops[i];
    const next = stops[i + 1];

    if (t <= curr.hp && t >= next.hp) {
      // Normalise t to 0–1 between these stops
      const localT = (t - next.hp) / (curr.hp - next.hp);

      // Convert hex to RGBA objects
      const c1 = hexToRgba(curr.color);
      const c2 = hexToRgba(next.color);

      // Interpolate each channel
      const r = Math.round(c1.r + (c2.r - c1.r) * (1 - localT));
      const g = Math.round(c1.g + (c2.g - c1.g) * (1 - localT));
      const b = Math.round(c1.b + (c2.b - c1.b) * (1 - localT));
      const a = c1.alpha + (c2.alpha - c1.alpha) * (1 - localT);

      // Return as RGBA string
      return hexToRgbaString(rgbToHex(r, g, b), a);
    }
  }

  // Fallback to last stop colour
  return stops[stops.length - 1].color;
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    r.toString(16).padStart(2, "0") +
    g.toString(16).padStart(2, "0") +
    b.toString(16).padStart(2, "0")
  );
}

export function roll() {
  return Math.random() * 100;
}

export function toHexColor(c: number) {
  return "#" + c.toString(16).padStart(6, "0");
}
