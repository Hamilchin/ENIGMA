import {
  ctx,
  gameHeight,
  gameWidth,
  pointerDown,
  pointerIsDown,
  pointerIsMouse,
  pointerX,
  pointerY,
  rawDeltaTime,
} from "./system";
import { reach } from "./utils";
import { hypot, TAU } from "./math";
import { CSS_WHITE } from "./colors";

let vpadStartX = 0;
let vpadStartY = 0;
let vpadX = 0;
let vpadY = 0;
export let vpadDirX = 0;
export let vpadDirY = 0;
let vPadOpen = 0;
const R1 = 64;
const R2 = 20;
const RM = 20;
const DR = R1 - R2;

export const updateVPad = () => {
  if (pointerIsMouse) {
    vpadDirX = pointerX - gameWidth / 2;
    vpadDirY = pointerY - gameHeight / 2;
  } else {
    if (pointerDown) {
      vpadX = pointerX;
      vpadY = pointerY;
      vpadDirX = pointerX - gameWidth / 2;
      vpadDirY = pointerY - gameHeight / 2;
      const l = hypot(vpadDirX, vpadDirY);
      if (l > 0) {
        vpadDirX /= l;
        vpadDirY /= l;
      }
      vpadStartX = pointerX - DR * vpadDirX;
      vpadStartY = pointerY - DR * vpadDirY;
    } else if (pointerIsDown) {
      vpadX = pointerX;
      vpadY = pointerY;
      vpadDirX = pointerX - vpadStartX;
      vpadDirY = pointerY - vpadStartY;
      const l = hypot(vpadDirX, vpadDirY);
      if (l > 0) {
        vpadDirX /= l;
        vpadDirY /= l;
      }
      if (l < RM) {
        vpadDirX = 0;
        vpadDirY = 0;
      }
      if (l > DR) {
        // vpadStartX = pointerX - DR * vpadDirX;
        // vpadStartY = pointerY - DR * vpadDirY;
        vpadX = vpadStartX + DR * vpadDirX;
        vpadY = vpadStartY + DR * vpadDirY;
      }
    }
    vPadOpen = reach(vPadOpen, pointerIsDown, rawDeltaTime * 8);
  }
};

export const drawVPad = (open: number) => {
  const o = open * vPadOpen;
  if (o > 0) {
    ctx.save();
    ctx.globalAlpha = o / 3;
    ctx.beginPath();
    ctx.arc(vpadStartX, vpadStartY, vPadOpen * R1, 0, TAU);
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = CSS_WHITE;
    ctx.lineWidth = 2;
    ctx.fillStyle = "#333";
    ctx.stroke();
    ctx.arc(vpadStartX, vpadStartY, vPadOpen * RM, 0, TAU, true);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(vpadX, vpadY, o * R2, 0, TAU);
    ctx.fillStyle = CSS_WHITE;
    ctx.fill();
    ctx.restore();
  }
};
