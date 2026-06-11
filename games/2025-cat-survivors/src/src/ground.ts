import { visibleX0, visibleX1, visibleY0, visibleY1 } from "./camera";
import { DEBUG_CAMERA } from "./const";
import { nextFloat, nextInt, setSeed } from "./rnd";
import { ctx } from "./system";
import { cos, sin, TAU } from "./math";
import { calcBaseColor, ColorId, COLORS } from "./colors";
import { css_rgba, lerp_rgb } from "./utils";
import { fillCircle } from "./draw";

export const drawGround = (
  x0 = visibleX0 >> 4,
  y0 = visibleY0 >> 4,
  x1 = visibleX1 >> 4,
  y1 = visibleY1 >> 4,
  blockColor = calcBaseColor(COLORS[ColorId.Ground], 0, 0.95),
  flowerCenterColor = css_rgba(lerp_rgb(0xff7700, COLORS[ColorId.Ground], 0.5)),
  flowerColor = css_rgba(
    lerp_rgb(COLORS[ColorId.White], COLORS[ColorId.Ground], 0.5)
  )
) => {
  for (let cy = y0; cy <= y1; ++cy) {
    for (let cx = x0; cx <= x1; ++cx) {
      const x = cx << 4;
      const y = cy << 4;
      setSeed((-x + (y << 8)) >>> 0);
      if (nextInt() & 1) {
        ctx.fillStyle = blockColor;
        drawBlock(x, y);
      }
      setSeed((x + (y << 8)) >>> 0);
      if (!(nextInt() & 3)) {
        drawFlower(x, y, flowerCenterColor, flowerColor);
      }
    }
  }

  if (DEBUG_CAMERA) {
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.strokeRect(
      visibleX0,
      visibleY0,
      visibleX1 - visibleX0,
      visibleY1 - visibleY0
    );
  }
};

const drawFlower = (
  x: number,
  y: number,
  centerColor: string,
  baseColor: string
) => {
  ctx.save();
  ctx.translate(x + nextFloat(16), y + nextFloat(16));
  ctx.rotate((nextFloat() - 0.5) / 2);
  const s = 1 + nextFloat() / 2;
  ctx.scale(s, s * 0.6);
  for (let i = 0; i < 6; ++i) {
    fillCircle(
      1.5 * cos((TAU * i) / 6),
      1.5 * sin((TAU * i) / 6),
      0.75,
      baseColor
    );
  }
  fillCircle(0, 0, 1, centerColor);
  ctx.restore();
};

const drawBlock = (x: number, y: number) => {
  ctx.save();
  ctx.translate(x + 8, y + 8);
  ctx.rotate((nextFloat() - 0.5) / 2);
  ctx.fillRect(-7, -5, 14, 5);
  ctx.fillRect(-7, 1, 14, 5);
  ctx.restore();
};
