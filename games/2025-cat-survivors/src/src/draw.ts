import { WORLD_SCALE_Y } from "./const";
import { ctx, time } from "./system";
import { sin, TAU } from "./math";
import { bwColor } from "./colors";

export const drawChest = (
  timeOffset: number,
  j = sin(time * 8 + timeOffset)
) => {
  ctx.save();
  ctx.scale(1 + 0.1 * j, 1 - 0.3 * j);
  ctx.translate(0, 4 - 2 * (1 - j));
  ctx.fillStyle = "#9ac";
  ctx.fillRect(-4, -3, 8, 3);
  ctx.beginPath();
  ctx.ellipse(0, 0, 4, 2, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = bwColor(0.2 - 0.2 * sin(time * 4));
  ctx.beginPath();
  ctx.ellipse(0, -3, 4, 2, 0, 0, TAU);
  ctx.fill();

  // BEGIN FISH
  ctx.fillStyle = "#cde";
  ctx.save();
  ctx.translate(-4, -3 + 0.4);
  ctx.rotate(-0.4 + 0.4 * j * sin(time * 4));

  ctx.beginPath();
  ctx.ellipse(4, 0, 4.2, 2.2, 0, 0, TAU);
  ctx.fill();

  ctx.fillStyle = "#a9a";
  ctx.beginPath();
  ctx.moveTo(3, 0);
  ctx.quadraticCurveTo(3 + 2, -2, 3 + 4, 0);
  ctx.quadraticCurveTo(3 + 2, 2, 3 + 0, 0);
  ctx.lineTo(3 - 2, -1);
  ctx.lineTo(3 - 2, 1);
  ctx.fill();
  ctx.restore();
  // END FISH

  ctx.restore();
};

export const fillWorldCircle = (
  x: number,
  y: number,
  r: number,
  fillColor?: string,
  strokeColor?: string,
  lineWidth?: number
) => {
  ctx.beginPath();
  ctx.ellipse(x, y * WORLD_SCALE_Y, r, r * WORLD_SCALE_Y, 0, 0, TAU);
  if (fillColor) {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth!;
    ctx.stroke();
  }
};

export const fillCircle = (x: number, y: number, r: number, color: string) => {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
};
