import { ctx, gameHeight, gameWidth, rawDeltaTime } from "./system";
import { reach } from "./utils";

let current = 0;
let target = 0;

export const setScreenDimming = (v: number) => (target = v);
export const drawScreenDimming = () => {
  current = reach(current, target, 8 * rawDeltaTime);
  if (current > 0) {
    ctx.fillStyle = "rgba(0,0,10," + (current * 3) / 4 + ")";
    ctx.fillRect(0, 0, gameWidth, gameHeight);
  }
};
