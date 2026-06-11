import { css_rgba, easeQuadOut, lerp_rgb } from "./utils";

export const color_debug_red = "#F00";

export const enum ColorId {
  White = 0,
  Ground = 1,
}

const MAP_BASE_COLORS = [0x667722, 0x224455, 0xccddff];
export const COLORS: number[] = [
  0xffffff,
  //color_ground
  ,
] as number[];

export const CSS_WHITE = "#fff";
export const CSS_BLACK = "#000";

export const bwColor = (t: number) =>
  css_rgba(lerp_rgb(0, COLORS[ColorId.White], t));

export const calcBaseColor = (
  rgb: number,
  add_white: number = 0,
  light: number = 1
): string =>
  css_rgba(
    lerp_rgb(
      lerp_rgb(0, rgb, light),
      COLORS[ColorId.White],
      easeQuadOut(add_white)
    )
  );

export const updateColors = (night: number, snow: number, rain: number) => {
  COLORS[ColorId.Ground] = lerp_rgb(
    lerp_rgb(
      lerp_rgb(MAP_BASE_COLORS[0], MAP_BASE_COLORS[1], rain),
      MAP_BASE_COLORS[2],
      snow
    ),
    0,
    night * 0.7
  );
};
