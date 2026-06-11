import { ctx, dt, gameHeight, gameWidth } from "./system";
import { max, random } from "./math";

export let visibleX0 = 0;
export let visibleY0 = 0;
export let visibleX1 = 0;
export let visibleY1 = 0;
let shakeTime = 0;
export const beginCamera = (
  x: number,
  y: number,
  scale: number,
  hw: number = gameWidth / 2,
  hh: number = gameHeight / 2
) => {
  visibleX0 = x - hw / scale;
  visibleX1 = x + hw / scale;
  visibleY0 = y - hh / scale;
  visibleY1 = y + hh / scale;
  shakeTime = max(0, shakeTime - dt * 8);
  ctx.save();
  ctx.translate(hw, hh);
  ctx.scale(scale, scale);
  ctx.translate(
    ((4 * shakeTime * (random() - 0.5)) | 0) - x,
    ((4 * shakeTime * (random() - 0.5)) | 0) - y
  );
};

export const shakeCamera = (value: number) => (shakeTime = value);

export const testVisible = (x: number, y: number, padding: number) =>
  x > visibleX0 - padding &&
  x < visibleX1 + padding &&
  y > visibleY0 - padding &&
  y < visibleY1 + padding;
