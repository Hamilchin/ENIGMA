import { testVisible } from "./camera";
import { WORLD_SCALE_Y } from "./const";
import { ctx, rawDeltaTime } from "./system";
import { PI, random, sin } from "./math";
import { textParticles } from "./entities";
import { CSS_BLACK } from "./colors";

const getFontStyle = (sz: number) => "bold " + sz + "px sans-serif";

export const addTextParticle = (
  x: number,
  y: number,
  text: any,
  color: string,
  scale = 1,
  speed = 2
) => {
  textParticles.push({
    x,
    y,
    text,
    dx: (random() - 0.5) * 10,
    dy: -10 * random(),
    r: random() - 0.5,
    t: 1,
    s: speed,
    color,
    scale,
  });
};

export const drawTextParticles = () => {
  textParticles.sort((a, b) => a.y - b.y);
  for (let i = 0; i < textParticles.length; ++i) {
    const p = textParticles[i];
    p.t -= rawDeltaTime * p.s;
    if (p.t > 0) {
      if (testVisible(p.x, p.y * WORLD_SCALE_Y, 10)) {
        const bb = 1 - p.t;
        const bb2 = sin(bb * PI) ** 0.5;
        ctx.save();
        const tt = 1 - p.t ** 3;
        ctx.translate(p.x + p.dx * tt, p.y * WORLD_SCALE_Y - 10 + p.dy * tt);
        ctx.rotate(bb * p.r);
        ctx.scale(bb2, bb2);
        drawText(0, 0, p.text, p.color, 10 * p.scale);
        ctx.restore();
      }
    } else {
      textParticles.splice(i--, 1);
    }
  }
};

export const drawText = (
  x: number,
  y: number,
  text: any,
  color: string,
  size: number,
  al: number = 1,
  str = "" + text,
  off = (0.2 * size) / 10
) => {
  ctx.font = getFontStyle(size);
  ctx.textAlign = ["left", "center", "right"][al] as "center";
  ctx.lineWidth = 2 * (size / 10);
  ctx.lineCap = ctx.lineJoin = "round";
  ctx.strokeStyle = CSS_BLACK;
  ctx.fillStyle = color;
  ctx.strokeText(str, x + off, y + off);
  ctx.fillText(str, x, y);
};

const images: Record<string, HTMLCanvasElement> = {};

export const drawIcon = (x: number, y: number, text: string, size: number) => {
  if (!images[text]) {
    const cs = 64;
    const img = document.createElement("canvas")!;
    const ictx = img.getContext("2d")!;
    img.width = cs;
    img.height = cs;
    ictx.textAlign = "center";
    ictx.font = getFontStyle(cs - 4);
    // ictx.fillStyle = CSS_WHITE;
    ictx.filter = "contrast(1.4) drop-shadow(0px 0px 1px #000)";
    ictx.fillText(text, cs / 2, cs * (1 - 11 / 64));
    ictx.drawImage(img, 0, 0);
    images[text] = img;
  }
  ctx.drawImage(images[text], x - size / 2, y - size / 2, size, size);
};
