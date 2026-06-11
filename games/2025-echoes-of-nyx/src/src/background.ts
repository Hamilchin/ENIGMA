import { textImage } from './assets';
import { ratio } from './config';
import { canvas } from './assets';
import { displayString, getTextRealSizes } from './text-utils';
import { randomBetween } from './utils';
import text from '/assets/text.webp';

export let backgrounds: HTMLImageElement[] = [];
export let instructions: HTMLImageElement;
export let backgroundShift = 4;

const width = 800;
const height = ratio(width, 10, 16);

const colors: string[] = [
  '#061527', // 0
  '#1a1b1f', // 1
  '#333c66', // 2
  '#8c7586', // 3
  '#ca9a88', // 4
  '#e9c0b1ff', // 5
  '#5197cb', // 6
  '#e8f1f0', // 7
  '#fde4dbff', // 8
];
const levels = [
  [0, 0, 1, 1, 1, 2], // 1-1
  [0, 0, 1, 1, 2], // 1-2
  [0, 1, 1, 2, 3], // 1-3
  [0, 1, 2, 2, 3, 4], // 1-4
  [0, 1, 2, 3, 4, 5], // 1-5
  [2, 3, 4, 5], // 2-1
  [2, 3, 4, 5, 8], // 2-2
  [3, 4, 5], // 2-3
  [7, 8, 5], //2-4
  [6, 7, 8], // 2-5
  [6, 7], // 3-1
  [6, 7], // 3-2
  [6, 7], // 3-3
  [6, 7], // 3-4
  [6, 7], // 3-5
];

const stars: [number, number][] = [];
for (let i = 0; i < 400; i++) {
  stars.push([randomBetween(0, width), randomBetween(0, height)]);
}

function drawStars(ctx: CanvasRenderingContext2D) {
  ctx.save();

  stars.forEach(([x, y]) => {
    ctx.fillStyle = '#ffffff4d';
    ctx.fillRect(x, y, 1, 1);
  });
  ctx.restore();
}

function drawBackground(ctx: CanvasRenderingContext2D, lvl: number) {
  const gradientColors: [number, string][] = levels[lvl].map((color, i) => [
    (1 / levels[lvl].length) * i,
    colors[color],
  ]);
  const fillStyle = ctx.createLinearGradient(width / 2, 0, width / 2, height);
  gradientColors.forEach(([offset, color]) => {
    (fillStyle as CanvasGradient).addColorStop(offset, color);
  });
  // Draw background
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = fillStyle;
  ctx.fillRect(0, 0, width, height);
  ctx.closePath();
  if (lvl <= 7) {
    drawStars(ctx);
  }
  ctx.restore();
}

const instructionsText: string = `Use the Arrow Keys to move and Space to jump.
Each jump switches the platform state.
Press Escape to pause or skip the level`;
const spacing = 8;

export function computeBackgrounds() {
  return new Promise((resolve) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    ctx.save();
    const bg: HTMLImageElement[] = [];
    levels.forEach((l, i) => {
      drawBackground(ctx, i);
      const image = new Image();
      image.src = canvas.toDataURL('image/png');
      bg.push(image);
      ctx.clearRect(0, 0, width, height);
    });
    backgrounds = bg;
    textImage.onload = () => {
      const lines = instructionsText.split('\n');
      const boundingBoxes = lines.map((line) => getTextRealSizes(line, 1));
      canvas.width = Math.max(...boundingBoxes.map(({ width }) => width));
      canvas.height = boundingBoxes.reduce((res, { height }) => res + height + spacing, 0) - (spacing - 3);
      ctx.filter = 'invert(1)';

      lines.reduce((y, line, i) => {
        displayString(ctx, i == 0 ? 0 : Math.round((canvas.width - boundingBoxes[i].width) / 2), y, line, 1);
        return y + boundingBoxes[i].height + spacing;
      }, 0);
      instructions = new Image();
      instructions.src = canvas.toDataURL('image/png');
      ctx.clearRect(0, 0, width, height);
      ctx.filter = 'none';
      ctx.restore();
      resolve(1);
    };
  });
}
